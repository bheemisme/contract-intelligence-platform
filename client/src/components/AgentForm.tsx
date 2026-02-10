import { useCreateAgent } from "@/queries/agents";
import { useState } from "react";
import { useNavigate } from "react-router";

interface AgentFormProps {
    setIsAgentFormOpen: React.Dispatch<React.SetStateAction<boolean>>;
}
const AgentForm = (params: AgentFormProps) => {

    const [agentName, setAgentName] = useState("");
    const createAgent = useCreateAgent();
    const navigate = useNavigate();

    const handleCreateAgent = () => {
        // Call API to create agent with the given name
        createAgent.mutate(agentName, {
            onSuccess: (agentId) => {
                params.setIsAgentFormOpen(false);
                navigate(`/chat/${agentId}`);
            }
            
        })
    }
    return (
        <div className="fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-green-900 bg-opacity-90 p-6 rounded-lg shadow-lg z-50 space-y-2">
            <div>Create Agent</div>
            <div>
                <input type="text" placeholder="Agent Name" className="border-2 border-green-200 rounded-lg px-2 py-1 outline-none" value={agentName} onChange={(e) => setAgentName(e.target.value)} />
                <button className="ml-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded" onClick={handleCreateAgent}>Create</button>
            </div>


        </div>
    )
}

export default AgentForm;