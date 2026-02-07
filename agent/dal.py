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
    DocumentReference,
)


def contruct_message(messages: Iterator[DocumentSnapshot]):

    for message in messages:

        if message.get("type") == "human":
            yield {
                "content": message.get("content"),
                "type": message.get("type"),
                "id": message.get("id"),
                "idx": message.get("idx"),
            }
        elif message.get("type") == "ai":
            yield {
                "content": message.get("content"),
                "type": message.get("type"),
                "id": message.get("id"),
                "tool_calls": message.get("tool_calls"),
                "idx": message.get("idx"),
            }
        elif message.get("type") == "system":
            yield {
                "content": message.get("content"),
                "type": message.get("type"),
                "id": message.get("id"),
                "idx": message.get("idx"),
            }
        elif message.get("type") == "tool":
            yield {
                "content": message.get("content"),
                "type": message.get("type"),
                "id": message.get("id"),
                "idx": message.get("idx"),
                "tool_call_id": message.get("tool_call_id"),
            }

def contruct_message_obj_from_dict(messages: List[Dict]):
    for message in messages:
        
        if message["type"] == "human":
            yield HumanMessage(content=message["content"], id=message["id"])
        elif message["type"] == "ai":
            yield AIMessage(content=message["content"], id=message["id"], tool_calls=message.get("tool_calls"))
        elif message["type"] == "system":
            yield SystemMessage(content=message["content"], id=message["id"])
        elif message["type"] == "tool":
            yield ToolMessage(content=message["content"], id=message["id"], tool_call_id=message.get("tool_call_id"))

def create_agent_document(db: Client, agent: Agent) -> str:
    """
    Creates a new agent document in Firestore.

    Args:
        agent: The agent to create.

    Returns:
        The ID of the created agent document.
    """
    doc_ref = db.collection("agents").document(str(agent.agent_id))
    doc_ref.set(agent.model_dump(mode="json"))
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

    messages = list(contruct_message(msg_stream))
    
    # sort messages by idx
    messages.sort(key=lambda x: int(x["idx"]))
    
    messages = list(contruct_message_obj_from_dict(messages))

    agent = Agent(**doc.to_dict())  # type: ignore
    agent.messages = messages  # type: ignore
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

    # compute total number of messages
    total_messages = len(list(msg_ref.stream()))

    batch = db.batch()

    for idx, msg in zip(
        range(total_messages, total_messages + len(messages)), messages
    ):
        doc_ref = msg_ref.document()
        msg_dict = msg.model_dump(mode="json")
        msg_dict["idx"] = idx
        batch.set(doc_ref, msg_dict)

    batch.commit()
