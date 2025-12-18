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

    return <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
    </div>
}

export default Callback