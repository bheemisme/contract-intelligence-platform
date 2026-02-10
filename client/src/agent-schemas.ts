
export interface Message {
    content: string;
    type: "ai" | "system" | "tool" | "human";
    created_at: number;
    tool_calls?: unknown[];
    tool_call_id?: string;
}

export interface Agent {
    agent_id: string;
    name: string;
    user_id: string;
    model_name: string;
    messages?: Message[];
    state?: Record<string, unknown>;
    selected_contract?: string;
}

export interface CallAgentParams { 
    agentId: string;
    message: string;
}

export interface AddContractToAgentParams {
    agent_id: string;
    contract_id: string;
}
