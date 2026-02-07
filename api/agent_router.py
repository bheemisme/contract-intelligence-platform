from typing import Annotated
from fastapi import APIRouter, Body, Depends, Form
from api.utils import (
    handle_exceptions,
    validate_session,
    handle_exceptions,
    get_bucket,
    get_firestore,
)
from google.cloud import firestore, storage
from connectors import chromadb_connector
from sessions import schemas as session_schemas
from agent import schemas as agent_schemas
from agent import dal as agent_dal
from agent import utils as agent_utils
from langchain.messages import AnyMessage
import logging
import os
import uuid
import tempfile
import logging
import asyncio
import chromadb
import aiofiles


logger = logging.getLogger(__name__)

router = APIRouter(prefix="/agent")


@router.post("/")
@handle_exceptions
async def create_agent(
    db_client: Annotated[firestore.Client, Depends(get_firestore)],
    session: Annotated[session_schemas.Session, Depends(validate_session)],
    name: str = Form(...),
) -> str:
    """
    Create a new agent for the given session.

    Args:
        db_client: Firestore client.
        session: Session object.

    Returns:
        str
    """
    # Create a new collection for the agent

    agent_doc = agent_schemas.Agent(user_id=session.user_id, name=name)
    agent_id = await asyncio.to_thread(
        agent_dal.create_agent_document, db_client, agent_doc
    )

    logger.debug(f"Created agent with ID: {agent_id}")
    return agent_id


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


@router.put("/")
@handle_exceptions
async def call_agent(
    db_client: Annotated[firestore.Client, Depends(get_firestore)],
    session: Annotated[session_schemas.Session, Depends(validate_session)],
    agent_id: str = Body(...),
    message: str = Body(...),
) -> list[AnyMessage]:
    """
    Call an agent for the given session.

    Args:
        db_client: Firestore client.
        session: Session object.
        agent_id: Agent ID.
        message: Message to send to the agent.

    Returns:
        Agent object.
    """

    response = await asyncio.to_thread(
        agent_dal.get_agent_document, db_client, agent_id
    )

    logger.debug(f"fetched agent document")

    if response is None:
        raise ValueError("Agent not found")

    if response.user_id != session.user_id:
        raise ValueError("User not authorized to call this agent")

    # Call the agent
    response = await asyncio.to_thread(
        agent_utils.call_agent, db_client, agent_id, message
    )
    logger.debug(f"agent generated response")


    await asyncio.to_thread(
        agent_dal.add_messages, db_client, agent_id=agent_id, messages=response
    )

    logger.debug(f"added agent messages")
    return response
