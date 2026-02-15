"""Data Access Layer utilities for agent documents."""

from typing import Dict, Iterator, List
from agent.schemas import Agent
from google.cloud.firestore import Client
from langchain.messages import AnyMessage
from langchain.messages import (
    SystemMessage,
    HumanMessage,
    AnyMessage,
    ToolMessage,
    AIMessage,
)
from google.cloud.firestore import (
    CollectionReference,
    DocumentSnapshot,
)

import logging

logger = logging.getLogger(__name__)

def contruct_message(messages: Iterator[DocumentSnapshot]):

    for message in messages:

        if message.get("type") == "human":
            yield HumanMessage(content=message.get("content"), id=message.get("id"), additional_kwargs={"created_at": message.get("additional_kwargs").get("created_at")})
            
        elif message.get("type") == "ai":
            yield AIMessage(content=message.get("content"), id=message.get("id"), tool_calls=message.get("tool_calls"), additional_kwargs={"created_at": message.get("additional_kwargs").get("created_at")})
        elif message.get("type") == "system":
            yield SystemMessage(content=message.get("content"), id=message.get("id"), additional_kwargs={"created_at": message.get("additional_kwargs").get("created_at")})
            
        elif message.get("type") == "tool":
            yield ToolMessage(content=message.get("content"), id=message.get("id"), tool_call_id=message.get("tool_call_id"), additional_kwargs={"created_at": message.get("additional_kwargs").get("created_at")})
           


def create_agent_document(db: Client, agent: Agent) -> str:
    """
    Creates a new agent document in Firestore.

    Args:
        agent: The agent to create.

    Returns:
        The ID of the created agent document.
    """
    doc_ref = db.collection("agents").document(str(agent.agent_id))  # initialize state as empty dict
    
    # remove messages from agent dict before saving to Firestore, as messages are stored in a subcollection
    agent_dict = agent.model_dump(mode="json")
    agent_dict.pop("messages", None)
    doc_ref.set(agent_dict)
    return doc_ref.id


def get_agent_document(db: Client, agent_id: str) -> Agent:
    """
    Retrieves an agent document from Firestore.

    Args:
        agent_id: The ID of the agent to retrieve.

    Returns:
        The retrieved agent document.

    Raises:
        ValueError: If the agent document does not exist.
    """
    doc_ref = db.collection("agents").document(agent_id)
    doc = doc_ref.get()
    if not doc.exists:  # type: ignore
        raise ValueError(f"Agent document with ID {agent_id} does not exist.")

    # get all messages
    msg_ref: CollectionReference = doc_ref.collection("messages")

    msg_stream = msg_ref.stream()

    messages: list[AnyMessage] = list(contruct_message(msg_stream))
    
    # sort messages by created_at timestamp
    messages.sort(key=lambda x: x.additional_kwargs["created_at"])  # type: ignore

    agent = Agent(**doc.to_dict())  # type: ignore
    agent.messages = messages  
    return agent


def delete_agent_document(db: Client, agent_id: str) -> None:
    """Deletes an agent document from Firestore."""
    doc_ref = db.collection("agents").document(agent_id)
    doc_ref.delete()


def get_all_agent_documents(db: Client, user_id: str) -> list[Agent]:
    """Retrieves all agent documents from Firestore."""
    docs = db.collection("agents").stream()
    docs = [doc for doc in docs if doc.to_dict()["user_id"] == user_id]
    return [Agent(**doc.to_dict()) for doc in docs]


def add_messages(db: Client, agent_id: str, messages: list[AnyMessage]):
    """Updates the messages of an agent document in Firestore."""
    doc_ref = db.collection("agents").document(agent_id)
    msg_ref: CollectionReference = doc_ref.collection("messages")

    batch = db.batch()
    for msg in messages:
        doc_ref = msg_ref.document()
        msg_dict = msg.model_dump(mode="json")
        msg_dict['additional_kwargs'].pop("__gemini_function_call_thought_signatures__", None)        
        batch.set(doc_ref, msg_dict)

    batch.commit()

def add_contracts_to_agent(db: Client, agent_id: str, contract_id: str):
    """Updates the selected contract of an agent document in Firestore."""
    doc_ref = db.collection("agents").document(agent_id)
    doc = doc_ref.get()
    if not doc.exists:  # type: ignore
        raise ValueError(f"Agent document with ID {agent_id} does not exist.")
    
    doc_ref.set({"selected_contract": contract_id}, merge=True)

def rename_agent(db: Client, agent_id: str, new_name: str):
    """Renames an agent document in Firestore."""
    doc_ref = db.collection("agents").document(agent_id)
    doc = doc_ref.get()
    if not doc.exists:  # type: ignore
        raise ValueError(f"Agent document with ID {agent_id} does not exist.")
    
    doc_ref.set({"name": new_name}, merge=True)
    
    
