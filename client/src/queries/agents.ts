import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Agent, Message } from "@/agent-schemas";

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

            const data: Agent = await response.json();
            return data;
        },
        enabled: !!agent_id,
        retry: false,
        refetchOnWindowFocus: false,
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

            const data: Agent[] = await response.json();

            return data;
        },
        retry: 3,
        retryDelay: 1000,
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        refetchOnMount: false,
    });
};

export const useCreateAgent = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ["agent", "create"],
        mutationFn: async (name: string) => {
            const trimmedName = name.trim();
            if (!trimmedName) {
                throw new Error("Agent name is required");
            }

            const api_origin = import.meta.env.VITE_API_ORIGIN;
            const formData = new FormData();
            formData.append("name", trimmedName);

            const response = await fetch(`${api_origin}/agent/`, {
                method: "POST",
                credentials: "include",
                body: formData,
            });

            if (!response.ok) {
                throw new Error("Failed to create agent");
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
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["agents"] });
        },
    });
};

export const useCallAgent = (agentId: string) => {
    return useMutation({
        mutationKey: ["agent", agentId],
        mutationFn: async (message: string) => {
            const api_origin = import.meta.env.VITE_API_ORIGIN;
        
            const response = await fetch(`${api_origin}/agent`, {
                method: "PUT",
                credentials: "include",
                body: JSON.stringify({ agent_id: agentId, message }),
                headers: {
                    "Content-Type": "application/json"
                },
            });

            if (!response.ok) {
                throw new Error("Failed to call agent");
            }

            const message_response: Message = await response.json();
            return message_response;
        }
    })
}