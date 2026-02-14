from pydantic import BaseModel, Field


class CreateAgentRequest(BaseModel):
    name: str = Field(..., description="The name of the agent to be created.")
    selected_contract: str = Field(..., description="The selected contract for the agent.")

class CallAgentRequest(BaseModel):
    agent_id: str = Field(..., description="The ID of the agent to call.")
    message: str = Field(..., description="The message to send to the agent.")

class RenameAgentRequest(BaseModel):
    agent_id: str = Field(..., description="The ID of the agent to rename.")
    new_name: str = Field(..., description="The new name for the agent.")
    