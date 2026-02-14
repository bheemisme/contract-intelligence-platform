import logging
import asyncio

from langchain_google_genai import ChatGoogleGenerativeAI
from agent.dal import get_agent_document
from google.api_core.exceptions import InvalidArgument, ResourceExhausted
from google.cloud.firestore import Client
from langchain.messages import SystemMessage, HumanMessage, AnyMessage, AIMessage
from typing import AsyncGenerator, Generator, Iterator, List
from datetime import datetime, timezone
from time import sleep
from connectors.gcs_connector import download_file
from contracts.dal import get_contract
from google.cloud.storage import Bucket

logger = logging.getLogger(__name__)


def prepare_agent(db: Client, bucket: Bucket, agent_id: str, message: str):
    agent_doc = get_agent_document(db, agent_id)
    agent = ChatGoogleGenerativeAI(
        model=agent_doc.model_name,
        vertexai=True,
        thinking_budget=-1,
        top_k=50,
        top_p=0.9,
        temperature=0.7,
        streaming=True
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
   agent_id: str, agent: ChatGoogleGenerativeAI,  messages: List[AnyMessage]
) -> AIMessage:
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
        response = await agent.ainvoke(messages)
        response.additional_kwargs["created_at"] = datetime.now(timezone.utc).timestamp()
       
        return response

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
    agent_id: str,
    agent: ChatGoogleGenerativeAI,
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
        agent_response = agent.stream(input=messages)
        
        for chunk in agent_response:
            yield chunk
        
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