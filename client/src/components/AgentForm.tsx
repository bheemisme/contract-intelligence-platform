import { useCreateAgent } from "@/queries/agents";
import { useGetContracts } from "@/queries/contracts";
import { useState } from "react";
import { useNavigate } from "react-router";
import { twMerge } from 'tailwind-merge';
import { useQueryClient } from "@tanstack/react-query";

interface AgentFormProps {
    setIsAgentFormOpen: React.Dispatch<React.SetStateAction<boolean>>;
    className: string;
}
const AgentForm = (params: AgentFormProps) => {

    const queryClient = useQueryClient()

    const contracts_query = useGetContracts();
    const [agentName, setAgentName] = useState<string | undefined>();
    const [selectedContract, setSelectedContract] = useState<string | undefined>();
    const [selectedContractName, setSelectedContractName] = useState<string | undefined>();
    const [dropContracts, setDropContracts] = useState(false)
    const createAgent = useCreateAgent();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState<string | undefined>()

    const handleCreateAgent = () => {
        // Call API to create agent with the given name
        if (agentName && selectedContract) {

            if (agentName.length > 50) {
                setErrorMessage("Agent name must be less than 50 characters")
                return
            }
            if (!/^[a-zA-Z0-9 ]+$/.test(agentName)) {
                setErrorMessage("Agent name must only contain letters, numbers and spaces")
                return
            }
            
            setIsLoading(true)
            createAgent.mutate({
                "name": agentName,
                "selected_contract": selectedContract
            }, {
                onSuccess: (agentId) => {
                    navigate(`/chat/${agentId}`);
                },
                onSettled: () => {
                    setIsLoading(false)
                    params.setIsAgentFormOpen(false);

                },
                onError: (error) => {
                    if (error.cause == 401) {
                        queryClient.clear()
                        navigate('/')
                    } else {
                        setErrorMessage(error.message)
                    }
                }


            })
        }
    }
    return (
        <div className={twMerge(params.className, "bg-green-900 text-white p-6 rounded-lg shadow-lg z-10 space-y-2", "flex flex-col items-center")}>
            <div>Create Agent</div>
            <div className="flex flex-col space-y-3">
                <div>
                    <input type="text" placeholder="Agent Name" className="border-2 border-green-200 rounded-lg px-2 py-1 outline-none" value={agentName} onChange={(e) => setAgentName(e.target.value)} />
                </div>

                <div className="relative">


                    <div onClick={() => setDropContracts(!dropContracts)} className="flex flex-row justify-between items-center hover:cursor-pointer border-2 border-green-200 rounded-lg px-2 py-1">
                        <span>{selectedContract ? selectedContractName : "select contract"}</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M6 9l6 6 6-6" />
                        </svg>
                    </div>
                    {dropContracts && <div className="absolute border-2 border-green-200 px-2 py-1 rounded-lg mt-1 bg-green-800 w-full">

                        {contracts_query.data?.map((contract, idx) => (
                            <div key={idx}
                                className="border-b border-white hover:bg-[#2726264e] hover:cursor-pointer mb-1"
                                onClick={() => {
                                    setSelectedContract(contract.contract_id)
                                    setSelectedContractName(contract.contract_name)
                                    setDropContracts(false)

                                }}
                            >{contract.contract_name}</div>
                        ))}
                    </div>}
                </div>
                {isLoading && <div className="flex flex-row items-center justify-around">
                    <svg className="w-5 h-5 animate-spin text-green-950" viewBox="0 0 24 24">
                        <circle className="opacity-50" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-100" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <p className="text-lg text-[#ffffffce]">{"creating agent"}</p>
                </div>}
                {errorMessage && <div className="text-red-500 px-1 py-1 text-center">

                    <span>{`error: ${errorMessage}`}</span>
                </div>}
                <div className="flex flex-row items-center">
                    <button disabled={!agentName || !selectedContract} className={!(!agentName || !selectedContract) ? "ml-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded cursor-pointer" : "ml-2 bg-green-600  text-gray-400 font-semibold py-2 px-4 rounded"} onClick={handleCreateAgent}>Submit</button>
                    <button className="ml-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded cursor-pointer" onClick={() => params.setIsAgentFormOpen(false)}>Cancel</button>
                </div>
            </div>


        </div>
    )
}

export default AgentForm;