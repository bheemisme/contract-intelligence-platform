import logging
import asyncio

from typing import Annotated, Any, List
from fastapi import APIRouter, Body, Depends, Request, Response
from fastapi.responses import StreamingResponse
from langchain.messages import AIMessage, SystemMessage, ToolMessage, AnyMessage
from api.schemas import CallAgentRequest, CreateAgentRequest, RenameAgentRequest
from api.utils import (
    handle_exceptions,
    validate_session,
    handle_exceptions,
    get_bucket,
    get_firestore,
)
from google.cloud import firestore, storage
from connectors.gcs_connector import download_file
from sessions import schemas as session_schemas
from agent import schemas as agent_schemas
from agent import dal as agent_dal
from agent import utils as agent_utils
from datetime import datetime, timezone
from langchain.messages import AIMessageChunk
from contracts import dal as contract_dal
from agent import prompts as agent_prompts
from langgraph.graph.state import CompiledStateGraph
from google.cloud.storage import Bucket

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/agent")


@router.post("/")
@handle_exceptions
async def create_agent(
    db_client: Annotated[firestore.Client, Depends(get_firestore)],
    bucket: Annotated[storage.Bucket, Depends(get_bucket)],
    session: Annotated[session_schemas.Session, Depends(validate_session)],
    req: CreateAgentRequest,
) -> str:
    """
    Create a new agent for the given session.

    Args:
        db_client: Firestore client.
        session: Session object.
        name: Name of the agent to be created.
    Returns:
        str
    """

    # verify whether contract exists
    contract = await asyncio.to_thread(
        contract_dal.get_contract, db_client, req.selected_contract
    )
    if not contract:
        raise ValueError(f"Contract with ID {req.selected_contract} does not exist.")

    if not contract.md_uri:
        raise ValueError(
            f"Contract with ID {req.selected_contract} does not have a valid md_uri."
        )

    # Create a new collection for the agent
    agent_doc = agent_schemas.Agent(
        user_id=session.user_id, name=req.name, selected_contract=req.selected_contract
    )
    agent_id = await asyncio.to_thread(
        agent_dal.create_agent_document, db_client, agent_doc
    )

    logger.debug(f"Created agent with ID: {agent_id}")

    # add messages to the agent
    messages = []

    messages.append(
        SystemMessage(
            content=agent_prompts.agent_system_prompt,
            additional_kwargs={"created_at": datetime.now(timezone.utc).timestamp()},
        )
    )

    get_contract_response_bytes = download_file(bucket, contract.md_uri)

    # convert bytes to string
    get_contract_response_str = get_contract_response_bytes.decode("utf-8")

    # load the contract content into the agent's context
    messages.append(
        SystemMessage(
            content=f"The following is the content of a contract document that may be relevant to answer the user's question:\n\n{get_contract_response_str}",
            additional_kwargs={"created_at": datetime.now(timezone.utc).timestamp()},
        )
    )

    # add the message to the agent
    await asyncio.to_thread(agent_dal.add_messages, db_client, agent_id, messages)

    return agent_id


@router.get("/get_all")
@handle_exceptions
async def get_all_agents(
    db_client: Annotated[firestore.Client, Depends(get_firestore)],
    session: Annotated[session_schemas.Session, Depends(validate_session)],
) -> list[agent_schemas.Agent]:
    """
    Get all agents for the given session.

    Args:
        db_client: Firestore client.
        session: Session object.

    Returns:
        List of Agent objects.
    """

    agents = await asyncio.to_thread(
        agent_dal.get_all_agent_documents, db_client, session.user_id
    )

    return agents


# write a call_agent route but for streaming the llm response
@router.get("/stream")
@handle_exceptions
async def stream_agent(
    db_client: Annotated[firestore.Client, Depends(get_firestore)],
    bucket: Annotated[Bucket, Depends(get_bucket)],
    session: Annotated[session_schemas.Session, Depends(validate_session)],
    response: Response,
    request: Request,
    agent_id: str,
    message: str,
):
    """
    Call an agent for the given session.

    Args:
        db_client: Firestore client.
        session: Session object.
        agent_id: Agent ID.
        message: Message to send to the agent.
        selected_contracts: List of selected contract IDs.

    Returns:
        Agent object.
    """
    logger.debug(f"streaming agent with ID: {agent_id} for user: {session.user_id}")

    agent_doc = await asyncio.to_thread(
        agent_dal.get_agent_document, db_client, agent_id
    )

    logger.debug(
        f"fetched agent document with ID: {agent_id} for user: {session.user_id}"
    )
    logger.debug(f"agent document details: {agent_doc.selected_contract}")

    if response is None:
        raise ValueError("Agent not found")

    if agent_doc.user_id != session.user_id:
        raise ValueError("User not authorized to call this agent")

    agent, history, messages = await asyncio.to_thread(
        agent_utils.prepare_agent, db_client, bucket, agent_id, message
    )

    streamer = agent_utils.stream_agent(db_client, request, agent_id, agent, history, messages)
    
    headers = {
        "Cache-Control": "no-cache, no-transform",
        "Content-Type": "text/event-stream",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no",
    }
    return StreamingResponse(streamer, headers=headers)  # type: ignore


@router.get("/{agent_id}")
@handle_exceptions
async def get_agent(
    db_client: Annotated[firestore.Client, Depends(get_firestore)],
    session: Annotated[session_schemas.Session, Depends(validate_session)],
    agent_id: str,
) -> agent_schemas.Agent:
    """
    Get an agent for the given session.

    Args:
        db_client: Firestore client.
        session: Session object.
        agent_id: Agent ID.

    Returns:
        Agent object.
    """

    agent_doc = await asyncio.to_thread(
        agent_dal.get_agent_document, db_client, agent_id
    )

    if agent_doc is None:
        raise ValueError("Agent not found")

    if agent_doc.user_id != session.user_id:
        raise ValueError("User not authorized to access this agent")

    return agent_doc


@router.delete("/{agent_id}")
@handle_exceptions
async def delete_agent(
    db_client: Annotated[firestore.Client, Depends(get_firestore)],
    session: Annotated[session_schemas.Session, Depends(validate_session)],
    agent_id: str,
) -> None:
    """
    Delete an agent for the given session.

    Args:
        db_client: Firestore client.
        session: Session object.
        agent_id: Agent ID.

    Returns:
        None
    """

    agent_doc = await asyncio.to_thread(
        agent_dal.get_agent_document, db_client, agent_id
    )

    if agent_doc is None:
        raise ValueError("Agent not found")

    if agent_doc.user_id != session.user_id:
        raise ValueError("User not authorized to delete this agent")

    # Delete the agent document
    await asyncio.to_thread(agent_dal.delete_agent_document, db_client, agent_id)


@router.put("/add_contract")
@handle_exceptions
async def add_contract_to_agent(
    db_client: Annotated[firestore.Client, Depends(get_firestore)],
    session: Annotated[session_schemas.Session, Depends(validate_session)],
    agent_id: str = Body(...),
    contract_id: str = Body(...),
) -> None:
    """
    Add a contract to an agent for the given session.

    Args:
        db_client: Firestore client.
        session: Session object.
        agent_id: Agent ID.
        contract_id: Contract ID.
    Returns:
        None
    """
    agent_doc = await asyncio.to_thread(
        agent_dal.get_agent_document, db_client, agent_id
    )

    if agent_doc is None:
        raise ValueError("Agent not found")

    if agent_doc.user_id != session.user_id:
        raise ValueError("User not authorized to modify this agent")

    await asyncio.to_thread(
        agent_dal.add_contracts_to_agent, db_client, agent_id, contract_id
    )


@router.put("/")
@handle_exceptions
async def call_agent(
    db_client: Annotated[firestore.Client, Depends(get_firestore)],
    bucket: Annotated[Bucket, Depends(get_bucket)],
    session: Annotated[session_schemas.Session, Depends(validate_session)],
    req: CallAgentRequest,
):
    """
    Call an agent for the given session.

    Args:
        db_client: Firestore client.
        session: Session object.
        req: CallAgentRequest object.

    Returns:
        Agent object.
    """

    response = await asyncio.to_thread(
        agent_dal.get_agent_document, db_client, req.agent_id
    )
    logger.debug(
        f"fetched agent document with ID: {req.agent_id} for user: {session.user_id}"
    )
    logger.debug(f"agent document details: {response.selected_contract}")

    logger.debug(f"fetched agent document")

    if response is None:
        raise ValueError("Agent not found")

    if response.user_id != session.user_id:
        raise ValueError("User not authorized to call this agent")

    logger.debug(f"preparing agent")

    # Call the agent
    agent, history, messages = await asyncio.to_thread(
        agent_utils.prepare_agent, db_client, bucket, req.agent_id, req.message
    )

    response_msgs = await agent_utils.call_agent(req.agent_id, agent, history, messages)

    logger.debug(f"agent generated response")

    await asyncio.to_thread(
        agent_dal.add_messages, db_client, agent_id=req.agent_id, messages=response_msgs
    )

    return response_msgs


@router.put("/rename")
@handle_exceptions
async def rename_agent(
    db_client: Annotated[firestore.Client, Depends(get_firestore)],
    session: Annotated[session_schemas.Session, Depends(validate_session)],
    req: RenameAgentRequest,
) -> None:
    """
    Rename an agent for the given session.

    Args:
        db_client: Firestore client.
        session: Session object.
        agent_id: Agent ID.
        new_name: New name for the agent.
    Returns:
        None
    """
    agent_doc = await asyncio.to_thread(
        agent_dal.get_agent_document, db_client, req.agent_id
    )

    if agent_doc is None:
        raise ValueError("Agent not found")

    if agent_doc.user_id != session.user_id:
        raise ValueError("User not authorized to modify this agent")

    agent_doc.name = req.new_name

    await asyncio.to_thread(
        agent_dal.rename_agent, db_client, req.agent_id, req.new_name
    )
