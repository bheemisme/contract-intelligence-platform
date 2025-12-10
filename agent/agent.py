"""
AI Agent for Contract Intelligence Platform using LangGraph and Gemini 2.5 Flash
"""

import os
import json
import uuid
from typing import Dict, List, Any, Optional
from datetime import datetime

from langgraph.graph import StateGraph, END
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from langchain_core.prompts import ChatPromptTemplate

from contracts import dal, schemas
from database import db, vector, storage
from model import validate
import tempfile
import asyncio


class AgentState:
    """State for the contract intelligence agent"""

    def __init__(self):
        self.user_query: str = ""
        self.planned_actions: List[Dict[str, Any]] = []
        self.action_results: List[Dict[str, Any]] = []
        self.final_response: str = ""
        self.memory: List[Dict[str, Any]] = []
        self.session_id: str = str(uuid.uuid4())


class ContractAgent:
    """AI Agent for handling contract-related queries using LangGraph"""

    def __init__(self, session_id: Optional[str] = None):
        self.client = genai.Client()
        self.model = "gemini-2.0-flash"

        # Initialize state
        self.state = AgentState()
        if session_id:
            self.state.session_id = session_id
            self.load_memory()

        # Build the LangGraph
        self.graph = self._build_graph()

    def _build_graph(self) -> StateGraph:
        """Build the LangGraph workflow"""
        workflow = StateGraph(AgentState)

        # Add nodes
        workflow.add_node("planner", self._plan_actions)
        workflow.add_node("executor", self._execute_actions)
        workflow.add_node("responder", self._generate_response)
        workflow.add_node("memory_updater", self._update_memory)

        # Define flow
        workflow.set_entry_point("planner")
        workflow.add_edge("planner", "executor")
        workflow.add_edge("executor", "responder")
        workflow.add_edge("responder", "memory_updater")
        workflow.add_edge("memory_updater", END)

        return workflow.compile()

    def _plan_actions(self, state: AgentState) -> AgentState:
        """Plan actions based on user query using Gemini"""

        # Create prompt for action planning
        planning_prompt = ChatPromptTemplate.from_messages(
            [
                (
                    "system",
                    """You are an AI agent for a contract intelligence platform. Your task is to analyze user queries about contracts and plan appropriate actions.

                    Available actions:
                    1. get_contract(contract_id): Retrieve a specific contract by ID
                    2. get_all_contracts(): Get all contracts
                    3. download_pdf(contract_id): Download PDF file of a contract
                    4. download_md(contract_id): Download markdown version of a contract
                    5. validate_contract(contract_id): Validate contract for legal compliance
                    6. search_contracts(query): Search contracts using semantic search
                    7. get_contract_summary(contract_id): Get key information from contract
                    
                    Analyze the user query and return a JSON array of actions to perform.
                    Each action should have:
                    - action: the action name
                    - params: parameters for the action (if any)
                    - description: brief description of what this action does
                    
                    Return only the JSON array, no other text.""",
                ),
                ("human", "{query}"),
            ]
        )

        # Get planned actions from LLM
        prompt = planning_prompt.format(query=state.user_query)
        response = self.client.models.generate_content(
            model=self.model, contents=prompt
        )

        try:
            actions = json.loads(response.text.strip())
            state.planned_actions = actions if isinstance(actions, list) else []
        except json.JSONDecodeError:
            # Fallback to basic actions
            state.planned_actions = [
                {
                    "action": "get_all_contracts",
                    "params": {},
                    "description": "Get all contracts",
                }
            ]

        return state

    def _execute_actions(self, state: AgentState) -> AgentState:
        """Execute the planned actions"""

        results = []

        for action in state.planned_actions:
            try:
                result = self._execute_single_action(action)
                results.append({"action": action, "success": True, "result": result})
            except Exception as e:
                results.append({"action": action, "success": False, "error": str(e)})

        state.action_results = results
        return state

    def _execute_single_action(self, action: Dict[str, Any]) -> Any:
        """Execute a single action"""

        action_name = action["action"]
        params = action.get("params", {})

        if action_name == "get_contract":
            contract_id = params.get("contract_id")
            if not contract_id:
                raise ValueError("contract_id required for get_contract")
            db_client = db.get_firestore_connection()
            contract = dal.get_contract(db_client, contract_id)
            return contract.model_dump() if contract else None

        elif action_name == "get_all_contracts":
            db_client = db.get_firestore_connection()
            contracts = dal.get_all_contracts(db_client)
            return [contract.model_dump() for contract in contracts]

        elif action_name == "download_pdf":
            contract_id = params.get("contract_id")
            if not contract_id:
                raise ValueError("contract_id required for download_pdf")
            # This would typically return a download URL or file path
            return f"PDF download initiated for contract {contract_id}"

        elif action_name == "download_md":
            contract_id = params.get("contract_id")
            if not contract_id:
                raise ValueError("contract_id required for download_md")
            return f"Markdown download initiated for contract {contract_id}"

        elif action_name == "validate_contract":
            contract_id = params.get("contract_id")
            if not contract_id:
                raise ValueError("contract_id required for validate_contract")

            db_client = db.get_firestore_connection()
            contract = dal.get_contract(db_client, contract_id)
            if not contract:
                raise ValueError(f"Contract {contract_id} not found")

            # Download markdown for validation
            temp_dir = tempfile.gettempdir()
            temp_md_path = os.path.join(temp_dir, f"{contract_id}.md")

            if contract.md_uri:
                md_file = storage.download_file(contract.md_uri)
                with open(temp_md_path, "wb") as f:
                    f.write(md_file)

                validation_report = validate.validate(
                    contract_path=temp_md_path, contract=contract
                )
                return validation_report.model_dump()

        elif action_name == "search_contracts":
            query = params.get("query", "")
            if not query:
                raise ValueError("query required for search_contracts")

            # Use vector search
            results = vector.query_chroma("contracts")
            return results

        elif action_name == "get_contract_summary":
            contract_id = params.get("contract_id")
            if not contract_id:
                raise ValueError("contract_id required for get_contract_summary")

            db_client = db.get_firestore_connection()
            contract = dal.get_contract(db_client, contract_id)
            if not contract:
                return None

            # Create a summary
            summary = {
                "contract_id": str(contract.contract_id),
                "contract_type": contract.contract_type,
                "effective_date": (
                    str(contract.effective_date)
                    if hasattr(contract, "effective_date")
                    else None
                ),
                "expiration_date": (
                    str(contract.expiration_date)
                    if hasattr(contract, "expiration_date")
                    else None
                ),
            }

            if hasattr(contract, "supplier"):
                summary["supplier"] = contract.supplier.legal_name
                summary["client"] = contract.client.legal_name

            return summary

        else:
            raise ValueError(f"Unknown action: {action_name}")

    def _generate_response(self, state: AgentState) -> AgentState:
        """Generate final response based on action results"""

        # Create prompt for response generation
        response_prompt = ChatPromptTemplate.from_messages(
            [
                (
                    "system",
                    """You are a helpful AI assistant for contract management. Based on the user's query and the results of actions performed, provide a clear, concise response.

User Query: {query}
Action Results: {results}

Provide a natural language response that answers the user's query using the action results. Be helpful and informative.""",
                ),
                ("human", "Generate response"),
            ]
        )

        # Format results for the prompt
        results_text = json.dumps(state.action_results, indent=2, default=str)

        prompt = response_prompt.format(query=state.user_query, results=results_text)
        response = self.client.models.generate_content(
            model=self.model, contents=prompt
        )

        state.final_response = response.text
        return state

    def _update_memory(self, state: AgentState) -> AgentState:
        """Update conversation memory"""

        # Add current interaction to memory
        memory_entry = {
            "timestamp": datetime.now().isoformat(),
            "user_query": state.user_query,
            "planned_actions": state.planned_actions,
            "action_results": state.action_results,
            "final_response": state.final_response,
        }

        state.memory.append(memory_entry)
        self.save_memory()
        return state

    def save_memory(self):
        """Save memory to file"""
        memory_dir = os.path.join(os.path.dirname(__file__), "memory")
        os.makedirs(memory_dir, exist_ok=True)

        memory_file = os.path.join(memory_dir, f"{self.state.session_id}.json")
        with open(memory_file, "w") as f:
            json.dump(self.state.memory, f, indent=2, default=str)

    def load_memory(self):
        """Load memory from file"""
        memory_dir = os.path.join(os.path.dirname(__file__), "memory")
        memory_file = os.path.join(memory_dir, f"{self.state.session_id}.json")

        if os.path.exists(memory_file):
            with open(memory_file, "r") as f:
                self.state.memory = json.load(f)

    async def process_query(self, user_query: str) -> str:
        """Process a user query through the agent workflow"""

        # Update state with new query
        self.state.user_query = user_query

        # Run the workflow manually since LangGraph setup has issues
        final_state = self.state

        # Execute the workflow steps manually
        final_state = self._plan_actions(final_state)
        final_state = self._execute_actions(final_state)
        final_state = self._generate_response(final_state)
        final_state = self._update_memory(final_state)

        return final_state.final_response


# Global agent instance for reuse
_agent_instance: Optional[ContractAgent] = None


def get_agent(session_id: Optional[str] = None) -> ContractAgent:
    """Get or create agent instance"""
    global _agent_instance
    if _agent_instance is None or (
        _agent_instance.state.session_id != session_id and session_id
    ):
        _agent_instance = ContractAgent(session_id)
    return _agent_instance


async def handle_query(user_query: str, session_id: Optional[str] = None) -> str:
    """Handle a user query using the contract agent"""
    agent = get_agent(session_id)
    response = await agent.process_query(user_query)
    return response


if __name__ == "__main__":
    # Test the agent
    import asyncio

    async def test():
        response = await handle_query("Show me all my contracts")
        print("Response:", response)

    asyncio.run(test())
