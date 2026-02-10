import { useMutation, useQuery } from "@tanstack/react-query"
import type { UserSchema } from "@/contract-schemas"
import type { User } from "oidc-client-ts"
export const useSignInUser = () => {
    return useMutation({
        "mutationKey": ["user"],
        mutationFn: async (user: User) => {
            const api_origin = import.meta.env.VITE_API_ORIGIN
            try {
                const response = await fetch(`${api_origin}/user/signin`, {
                    "method": "POST",
                    "credentials": "include",

                    "headers": {
                        "Content-Type": "application/json",
                        "Accept": "application/json",
                    },
                    "body": JSON.stringify({
                        "token": user?.id_token
                    }),

                })

                if (!response.ok) {
                    throw new Error('Failed to sign in');
                }
                const user_data: UserSchema = await response.json()
                return user_data
            } catch (error) {
                console.error("sigin failed", error)
            }
        }
    })
}
export const useGetUser = () => {
    return useQuery({

        "queryKey": ["user"],
        queryFn: async () => {
            const api_origin = import.meta.env.VITE_API_ORIGIN

            const response = await fetch(`${api_origin}/user/get_user`, {
                method: "GET",
                credentials: "include"
            })

            if (!response.ok) {
                throw new Error("session is inactive")
            }
            const data: UserSchema = await response.json()
            return data

        },


        retry: 3,
        retryDelay: 1000,
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        refetchOnMount: false,

    })
}

export const logoutUser = async () => {

    const api_origin = import.meta.env.VITE_API_ORIGIN

    try {
        const response = await fetch(`${api_origin}/user/logout`, {
            "method": "POST",
            "credentials": "include"
        })

        if (!response.ok) {
            throw new Error("session is inactive")
        }
        return true
    } catch (error) {
        console.error(error)
        
    }

    return false

}
