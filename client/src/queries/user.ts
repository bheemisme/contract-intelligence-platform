import { useMutation, useQuery } from "@tanstack/react-query"
import type { UserSchema, SignInResponse } from "@/contract-schemas"
import type { User } from "oidc-client-ts"
export const useSignInUser = () => {
    // fetch csrf_token from local storage
    const csrf_token = localStorage.getItem("csrf_token")
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
                        "token": user?.id_token,
                        "csrf_token": csrf_token
                    }),

                })

                if (!response.ok) {
                    throw new Error('Failed to sign in');
                }
                const user_data: SignInResponse = await response.json()

                localStorage.setItem("csrf_token", user_data.csrf_token)
                return user_data
            } catch (error) {
                console.error("sigin failed", error)
            }
        }
    })
}
export const useGetUser = () => {
    // fetch csrf_token from local storage
    const csrf_token = localStorage.getItem("csrf_token")
    return useQuery({

        "queryKey": ["user"],
        queryFn: async () => {
            const api_origin = import.meta.env.VITE_API_ORIGIN

            const response = await fetch(`${api_origin}/user/get_user`, {
                method: "GET",
                credentials: "include",
                "headers": {
                    "X-CSRF-TOKEN": csrf_token || "",
                }
            })

            if (!response.ok) {
                throw new Error("session is inactive")
            }

            if (response.status == 401) {
                throw new Error("unauthorized", {
                    cause: 401
                })
            }
            const data: UserSchema = await response.json()
            return data

        },


        retry: 3,
        retryDelay: 1000,
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
        refetchOnMount: true,

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
