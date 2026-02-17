import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Agent, Message, CallAgentParams, AddContractToAgentParams } from "@/agent-schemas";

export const useGetAgent = (agent_id: string) => {
    return useQuery({
        queryKey: ["agent", agent_id],
        queryFn: async () => {
            const api_origin = import.meta.env.VITE_API_ORIGIN;
            const response = await fetch(`${api_origin}/agent/${agent_id}`, {
                method: "GET",
                credentials: "include",
            });

            if (!response.ok) {
                throw new Error("Failed to fetch agent");
            }

            // check for 401 http error
            if (response.status === 401) {
                throw new Error("Unauthorized", {
                    "cause": 401
                });
            }

            const data: Agent = await response.json();
            return data;
        },
        retry: 3,
        retryDelay: 1000,
        refetchOnWindowFocus: true,
        staleTime: 5 * 60 * 1000,
        refetchOnMount: true,
        refetchOnReconnect: true,
    });
};

export const useGetAllAgents = () => {
    return useQuery({
        queryKey: ["agents"],
        queryFn: async () => {
            const api_origin = import.meta.env.VITE_API_ORIGIN;
            const response = await fetch(`${api_origin}/agent/get_all`, {
                method: "GET",
                credentials: "include",
            });

            if (!response.ok) {
                throw new Error("Failed to fetch agents");
            }

            // check for 401 http error
            if (response.status === 401) {
                throw new Error("Unauthorized", {
                    "cause": 401
                });
            }

            const data: Agent[] = await response.json();

            return data;
        },
        retry: 3,
        retryDelay: 1000,
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
        refetchOnMount: true,
    });
};

interface CreateAgentDTO {
    name: string;
    selected_contract: string;
}

export const useCreateAgent = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ["agent", "create"],
        mutationFn: async (createAgentDTO: CreateAgentDTO) => {
            const trimmedName = createAgentDTO.name.trim();
            const trimmedContract = createAgentDTO.selected_contract.trim();
            const api_origin = import.meta.env.VITE_API_ORIGIN;

            const response = await fetch(`${api_origin}/agent`, {
                method: "POST",
                credentials: "include",
                body: JSON.stringify({ "name": trimmedName, selected_contract: trimmedContract }),
                headers: {
                    "Content-Type": "application/json"
                }
            });

            if (!response.ok) {
                throw new Error("Failed to create agent");
            }

            // check for 401 http error
            if (response.status === 401) {
                throw new Error("Unauthorized", {
                    "cause": 401
                });
            }

            const agentId: string = await response.json();
            return agentId;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["agents"] });
        },
    });
};

export const useDeleteAgent = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ["agent", "delete"],
        mutationFn: async (agent_id: string) => {
            const api_origin = import.meta.env.VITE_API_ORIGIN;
            const response = await fetch(`${api_origin}/agent/${agent_id}`, {
                method: "DELETE",
                credentials: "include",
            });

            if (!response.ok) {
                throw new Error("Failed to delete agent");
            }

            // check for 401 http error
            if (response.status === 401) {
                throw new Error("Unauthorized", {
                    "cause": 401
                });
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["agents"] });
        },
    });
};

export const useCallAgent = () => {
    return useMutation({
        mutationKey: ["agent", "call_agent"],
        mutationFn: async (params: CallAgentParams) => {
            const api_origin = import.meta.env.VITE_API_ORIGIN;
        
            const response = await fetch(`${api_origin}/agent`, {
                method: "PUT",
                credentials: "include",
                body: JSON.stringify({ agent_id: params.agentId, message: params.message }),
                headers: {
                    "Content-Type": "application/json"
                },
            });

            if (!response.ok) {
                throw new Error("Failed to call agent");
            }

            // check for 401 http error
            if (response.status === 401) {
                throw new Error("Unauthorized", {
                    "cause": 401
                });
            }

            const message_response: Message = await response.json();
            return message_response;
        }
    })
}


export const useAddContractToAgent = (agentId: string) => {
    return useMutation({
        mutationKey: ["agent", agentId, "add_contract"],
        mutationFn: async ({ contract_id }: AddContractToAgentParams) => {
            const api_origin = import.meta.env.VITE_API_ORIGIN;
            const response = await fetch(`${api_origin}/agent/add_contract`, {
                method: "PUT",
                credentials: "include",
                body: JSON.stringify({ agent_id: agentId, contract_id }),
                headers: {
                    "Content-Type": "application/json"
                },
            });
            
            if (!response.ok) {
                throw new Error("Failed to add contract to agent");
            }

            // check for 401 http error
            if (response.status === 401) {
                throw new Error("Unauthorized", {
                    "cause": 401
                });
            }
        },
       
    })
}

export const useRenameAgent = (agentId: string) => {
    return useMutation({
        mutationKey: ["agent", agentId],
        mutationFn: async ({ new_name }: { new_name: string }) => {
            const api_origin = import.meta.env.VITE_API_ORIGIN;
            const response = await fetch(`${api_origin}/agent/rename`, {
                method: "PUT",
                credentials: "include",
                body: JSON.stringify({ agent_id: agentId, new_name }),
                headers: {
                    "Content-Type": "application/json"
                },
            });

            if (!response.ok) {
                throw new Error("Failed to rename agent");
            }
           
            // check for 401 http error
            if (response.status === 401) {
                throw new Error("Unauthorized", {
                    "cause": 401
                });
            }
        }
    })
}
