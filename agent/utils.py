from langchain_google_genai import ChatGoogleGenerativeAI
from agent.dal import get_agent_document
from google.cloud.firestore import Client
from langchain.messages import SystemMessage, HumanMessage, AnyMessage
from typing import List


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
        messages.append(SystemMessage(content="You are a helpful assistant", id=0))
    
    messages.append(HumanMessage(content=message, id=len(history)+len(messages)))
    
    response = agent.invoke(history + messages)
    messages.append(response)
    return messages




