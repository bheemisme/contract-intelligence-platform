import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Agent, Message, CallAgentParams, AddContractToAgentParams } from "@/agent-schemas";
import { EventSourcePolyfill} from "event-source-polyfill"
export const useGetAgent = (agent_id: string) => {
    // fetch csrf token
    const csrf_token = localStorage.getItem("csrf_token")
    return useQuery({
        queryKey: ["agent", agent_id],
        queryFn: async () => {
            const api_origin = import.meta.env.VITE_API_ORIGIN;
            const response = await fetch(`${api_origin}/agent/${agent_id}`, {
                method: "GET",
                credentials: "include",
                headers: {
                    "X-CSRF-TOKEN": csrf_token || "",
                }
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
    const csrf_token = localStorage.getItem("csrf_token")
    return useQuery({
        queryKey: ["agents"],
        queryFn: async () => {
            const api_origin = import.meta.env.VITE_API_ORIGIN;
            const response = await fetch(`${api_origin}/agent/get_all`, {
                method: "GET",
                credentials: "include",
                headers: {
                    "X-CSRF-TOKEN": csrf_token || "",
                }
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
    const csrf_token = localStorage.getItem("csrf_token")

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
                    "Content-Type": "application/json",
                    "X-CSRF-TOKEN": csrf_token || "",
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
    const csrf_token = localStorage.getItem("csrf_token")
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ["agent", "delete"],
        mutationFn: async (agent_id: string) => {
            const api_origin = import.meta.env.VITE_API_ORIGIN;
            const response = await fetch(`${api_origin}/agent/${agent_id}`, {
                method: "DELETE",
                credentials: "include",
                headers: {
                    "X-CSRF-TOKEN": csrf_token || "",
                }
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
    const csrf_token = localStorage.getItem("csrf_token")
    return useMutation({
        mutationKey: ["agent", "call_agent"],
        mutationFn: async (params: CallAgentParams) => {
            const api_origin = import.meta.env.VITE_API_ORIGIN;

            const response = await fetch(`${api_origin}/agent`, {
                method: "PUT",
                credentials: "include",
                body: JSON.stringify({ agent_id: params.agentId, message: params.message }),
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-TOKEN": csrf_token || "",
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
    const csrf_token = localStorage.getItem("csrf_token")
    return useMutation({
        mutationKey: ["agent", agentId, "add_contract"],
        mutationFn: async ({ contract_id }: AddContractToAgentParams) => {
            const api_origin = import.meta.env.VITE_API_ORIGIN;
            const response = await fetch(`${api_origin}/agent/add_contract`, {
                method: "PUT",
                credentials: "include",
                body: JSON.stringify({ agent_id: agentId, contract_id }),
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-TOKEN": csrf_token || ""
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
    const csrf_token = localStorage.getItem("csrf_token")
    return useMutation({
        mutationKey: ["agent", agentId],
        mutationFn: async ({ new_name }: { new_name: string }) => {
            const api_origin = import.meta.env.VITE_API_ORIGIN;
            const response = await fetch(`${api_origin}/agent/rename`, {
                method: "PUT",
                credentials: "include",
                body: JSON.stringify({ agent_id: agentId, new_name }),
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-TOKEN": csrf_token || ""
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

export const useStreamAgent = async (
    agentId: string, inputMessage: string,
    setInputMessage: React.Dispatch<React.SetStateAction<string>>,
    setIsGenerating: React.Dispatch<React.SetStateAction<boolean>>,
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
    setStreamingUpdate: React.Dispatch<React.SetStateAction<string | undefined>>
) => {

    const userMessage: Message = {
        content: inputMessage,
        type: 'human',
        created_at: Date.now() / 1000, // adding this only for type purposes, the backend will set the actual timestamp
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsGenerating(true);
    setStreamingUpdate("generating response");

    const url = `${import.meta.env.VITE_API_ORIGIN}/agent/stream?agent_id=${agentId}&message=${encodeURIComponent(inputMessage)}`


    const eventSource = new EventSourcePolyfill(url, {
        "withCredentials": true,
        headers: {
            "X-CSRF-TOKEN": localStorage.getItem("csrf_token") || ""
        }
    });

    let assistantMessage: Message = {
        content: '',
        type: 'ai',
        created_at: Date.now() / 1000,
    };

    eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data)
        if (data.type === 'done') {
            eventSource.close();
            setIsGenerating(false);
            return;
        }

        if (data.type == "tool_call") {
            setStreamingUpdate("calling tool")
            return;
        }

        if (data.type == "tool_response") {
            setStreamingUpdate("generating content")
            return;
        }


        if (data.type == "ai_response") {
            setIsGenerating(false)
            assistantMessage.content += data.content;
            setStreamingUpdate(undefined)

            setMessages(prev => {

                if (prev[prev.length - 1].type == "ai") {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1] = assistantMessage;
                    return newMessages;
                }
                return [...prev, assistantMessage]

            })
            return;
        }

        if (data.type == "done") {
            eventSource.close();
            setIsGenerating(false);
        }


    };

    eventSource.onerror = (error) => {
        console.error('EventSource failed:', error);
        eventSource.close();
        setIsGenerating(false);
    };


}