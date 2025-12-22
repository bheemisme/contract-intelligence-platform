import { useNavigate } from "react-router"
import { useSignInUser } from "../queries/user"
import { useEffect } from "react"
import { useAuth } from "react-oidc-context"


const Callback = () => {
    const auth = useAuth()

    const navigate = useNavigate()
    const signInUser = useSignInUser()

    useEffect(() => {
        if (auth.isAuthenticated && auth.user) {
            signInUser.mutate(auth.user, {
                "onSuccess": async (data) => {
                    console.log("user authenticated and signed in:")
                    await auth.removeUser()
                    navigate("/account")
                },
                "onError": (error) => {
                    console.error(error)
                    navigate("/")
                }
            })
        }
    }, [auth.isAuthenticated])

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-green-50">
            <svg className="w-24 h-24 animate-spin text-green-700" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p className="mt-6 text-lg font-semibold text-green-800">Signing you in, please wait...</p>
        </div>
    )
}

export default Callback
