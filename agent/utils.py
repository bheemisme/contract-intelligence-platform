import logging
import asyncio

from time import sleep

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.agents import create_agent
from langchain.messages import (
    HumanMessage,
    AnyMessage,
    AIMessage,
    ToolMessage,
)
from langgraph.graph.state import CompiledStateGraph

from agent import dal as agent_dal
from agent import tools

from google.api_core.exceptions import InvalidArgument, ResourceExhausted
from google.cloud.firestore import Client
from google.cloud.storage import Bucket

from typing import List
from datetime import datetime, timezone


logger = logging.getLogger(__name__)


def prepare_agent(db_client: Client, bucket: Bucket, agent_id: str, message: str):
    agent_doc = agent_dal.get_agent_document(db_client, agent_id)
    model = ChatGoogleGenerativeAI(
        model=agent_doc.model_name,
        vertexai=True,
        thinking_budget=-1,
        top_k=50,
        top_p=0.9,
        temperature=0.7,
        streaming=True,
    )

    agent = create_agent(
        model,
        tools=[
            tools.make_get_contract_schema_tool(db_client=db_client, agent_id=agent_id),
            tools.make_fetch_validation_report_tool(
                db_client=db_client, agent_id=agent_id
            ),
            tools.make_validate_contract_tool(
                db_client=db_client, bucket=bucket, agent_id=agent_id
            ),
        ],
        checkpointer=None,
    )

    history: List[AnyMessage] = agent_doc.messages
    messages: List[AnyMessage] = []

    if len(history) < 2:
        raise ValueError("Agent has no history")

    messages.append(
        HumanMessage(
            content=message,
            additional_kwargs={"created_at": datetime.now(timezone.utc).timestamp()},
        )
    )

    return agent, history, messages


async def call_agent(
    agent_id: str,
    agent: CompiledStateGraph,
    history: List[AnyMessage],
    messages: List[AnyMessage],
) -> List[AnyMessage]:
    """
    Calls the agent with the given message.

    Args:
        db: Firestore client.
        agent_id: Agent ID.
        message: Message to send to the agent.

    Returns:
        Generated messages.

    Throws:
        ValueError: If the agent is not found.
        RuntimeError: If the agent fails to generate a response because of rate limit or context overflow.
    """

    logger.debug(f"calling agent with ID: {agent_id}")

    try:
        response = await agent.ainvoke(input={"messages": history + messages})
        response_msgs = response["messages"]
        response_msgs = response_msgs[len(history) :]

        logger.debug(f"agent generated response")

        for msg in response_msgs:
            if not msg.additional_kwargs.get("created_at", None):
                msg.additional_kwargs["created_at"] = datetime.now(
                    timezone.utc
                ).timestamp()
            await asyncio.sleep(1)

            if isinstance(msg, AIMessage):
                if isinstance(msg.content, list):
                    msg.content = msg.content[0]["text"] + msg.content[1]  # type: ignore
                # response_msgs2.append(AIMessage(content=msg.content[0]['text'] + msg.content[1])) # type: ignore

        return response_msgs

    except ResourceExhausted as exc:
        logging.error(
            "Agent invoke hit a rate limit for agent_id=%s",
            agent_id,
            exc_info=exc,
        )
        raise RuntimeError(
            "Agent is currently rate limited. Please wait a moment before retrying."
        ) from exc
    except InvalidArgument as exc:
        if "context" in str(exc).lower():
            logging.error(
                "Agent invoke failed due to context overflow for agent_id=%s",
                agent_id,
                exc_info=exc,
            )
            raise RuntimeError(
                "Agent context window exceeded. Consider reducing the size of the contract or history."
            ) from exc
        raise
    except Exception as exc:
        logging.error(
            "Agent invoke failed for agent_id=%s",
            agent_id,
            exc_info=exc,
        )
        raise RuntimeError("Agent invoke failed. Please try again.") from exc


# write call_agent method with streaming agent response


async def stream_agent(
    db_client: Client,
    agent_id: str,
    agent: CompiledStateGraph,
    history: List[AnyMessage],
    messages: List[AnyMessage],
):
    """
    Call the agent with the given message and history, and stream the response.

    Args:
        db: The database session.
        bucket: The bucket to download the contract from.
        agent_id: The ID of the agent to call.
        message: The message to send to the agent.
        history: The history of messages to send to the agent.

    Returns:
        A generator that yields the response messages from the agent.
    """
    # stream the response
    logger.debug(f"calling agent with ID: {agent_id}")

    try:
        agent_response = agent.astream(input={"messages": history + messages})
        chunks: List[AnyMessage] = [messages[0]]

        async for chunk in agent_response:
            key = next(iter(chunk))
            msg = chunk[key]["messages"][0]
            content = msg.content
            msg.additional_kwargs["created_at"] = datetime.now(timezone.utc).timestamp()
            await asyncio.sleep(1)
            if isinstance(msg, AIMessage):
                # check if msg has tool calls
                if len(msg.tool_calls) > 0:
                    chunks.append(msg)
                    yield f"tool_call: {msg.tool_calls[0]['name']}"
                elif isinstance(msg.content, list):
                    # possibility to break here, since it is depends on the format of the llm's output
                    msg.content = msg.content[0]["text"] + msg.content[1]  # type: ignore
                    chunks.append(msg)
                    
                    # send 100 chars at once
                    for i in range(0, len(msg.content), 100):
                        yield f"ai_response: {msg.content[i:i+100]}"
                        await asyncio.sleep(0.1)
                        
                    # yield f"ai_response: {msg.content}"
                else:
                    chunks.append(msg)
                    # send 100 chars at once
                    for i in range(0, len(msg.content), 100):
                        yield f"ai_response: {msg.content[i:i+100]}"
                        await asyncio.sleep(0.1)
                    # yield f"ai_response: {msg.content}"
            elif isinstance(msg, ToolMessage):
                
                chunks.append(msg)
                yield f"tool_response: {content}"
        
        
        logger.debug(f"completed streaming agent response for agent_id: {agent_id}")
        
        # save the messages to the database
        await asyncio.to_thread(
            agent_dal.add_messages, db_client, agent_id, messages=chunks
        )
        
        logger.debug(f"saved messages to database for agent_id: {agent_id}")
        yield "done"

    except ResourceExhausted as exc:
        logging.error(
            "Agent invoke hit a rate limit for agent_id=%s",
            agent_id,
            exc_info=exc,
        )
        raise RuntimeError(
            "Agent is currently rate limited. Please wait a moment before retrying."
        ) from exc
    except InvalidArgument as exc:
        if "context" in str(exc).lower():
            logging.error(
                "Agent invoke failed due to context overflow for agent_id=%s",
                agent_id,
                exc_info=exc,
            )
            raise RuntimeError(
                "Agent context window exceeded. Consider reducing the size of the contract or history."
            ) from exc
        raise
    except Exception as exc:
        logging.error(
            "Agent invoke failed for agent_id=%s",
            agent_id,
            exc_info=exc,
        )
        raise RuntimeError("Agent invoke failed. Please try again.") from exc
    