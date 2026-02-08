from typing import Optional, List, Dict
from pydantic import BaseModel, Field, ConfigDict
from langchain.messages import AnyMessage
import uuid


class Agent(BaseModel):
    model_config = ConfigDict(extra='forbid')
    agent_id: uuid.UUID = Field(default_factory=uuid.uuid4, description="Unique identifier for the agent.")

    name: str = Field(description="The name of the agent.")
    
    user_id: str = Field(description="user id of the user associated to the agent")
    model_name: str = Field(description="The name of the model to be used for the agent.", default="gemini-2.5-flash")

    messages: List[AnyMessage] = Field(default=[],description="List of messages exchanged with the agent.")
    state: Dict = Field(default={} ,description="The current state of the agent.")
    