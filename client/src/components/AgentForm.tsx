import { useCreateAgent } from "@/queries/agents";
import { useState } from "react";
import { useNavigate } from "react-router";
import { twMerge } from 'tailwind-merge';

interface AgentFormProps {
    setIsAgentFormOpen: React.Dispatch<React.SetStateAction<boolean>>;
    className: string;
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
        <div className={twMerge("fixed", params.className, "bg-green-900 text-white p-6 rounded-lg shadow-lg z-50 space-y-2", "flex flex-col items-center")}>
            <div>Create Agent</div>
            <div className="flex flex-col space-y-3">
                <input type="text" placeholder="Agent Name" className="border-2 border-green-200 rounded-lg px-2 py-1 outline-none" value={agentName} onChange={(e) => setAgentName(e.target.value)} />
                <div className="flex flex-row items-center">
                    <button className="ml-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded" onClick={handleCreateAgent}>Create</button>
                    <button className="ml-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded" onClick={() => params.setIsAgentFormOpen(false)}>Cancel</button>
                </div>
            </div>


        </div>
    )
}

export default AgentForm;