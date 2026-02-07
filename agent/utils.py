from langchain_google_genai import ChatGoogleGenerativeAI
from agent.dal import get_agent_document
from google.cloud.firestore import Client
from langchain.messages import SystemMessage, HumanMessage, AnyMessage
from typing import List
from datetime import datetime, timezone
from time import sleep


def call_agent(db: Client, agent_id: str, message: str) -> List[AnyMessage]:
    """
    Calls the agent with the given message.

    Args:
        db: Firestore client.
        agent_id: Agent ID.
        message: Message to send to the agent.

    Returns:
        Generated messages.
    """
    agent_doc = get_agent_document(db, agent_id)
    agent = ChatGoogleGenerativeAI(
        model=agent_doc.model_name,
        vertexai=True,
        thinking_budget=-1,
        top_k=50,
        top_p=0.9,
        temperature=0.7,
    )
    history: List[AnyMessage] = agent_doc.messages
    messages: List[AnyMessage] = []

    if len(history) == 0:
        messages.append(
            SystemMessage(
                content="You are a helpful assistant",
                additional_kwargs={"created_at": datetime.now(timezone.utc).timestamp()},
            )
        )
        sleep(1)  # sleep for 1 second to ensure different timestamps for messages

    messages.append(
        HumanMessage(
            content=message,
            additional_kwargs={"created_at": datetime.now(timezone.utc).timestamp()},
        )
    )

    response = agent.invoke(history + messages)
    response.additional_kwargs["created_at"] = datetime.now(timezone.utc).timestamp()
    messages.append(response)
    return messages
