import { useNavigate } from "react-router"
import { useSignInUser } from "../queries/user"
import { useEffect } from "react"
import { useAuth } from "react-oidc-context"
import LoadingView from "@/components/LoadingView"


const Callback = () => {
    const auth = useAuth()

    const navigate = useNavigate()
    const signInUser = useSignInUser()

    useEffect(() => {
        if (auth.isAuthenticated && auth.user) {
            signInUser.mutate(auth.user, {
                "onSuccess": async () => {
                    console.log("user authenticated and signed in:")
                    await auth.removeUser()

                    // set a session variable
                    sessionStorage.setItem("isJustLoggedIn", "true")
                    navigate("/account")
                },
                "onError": (error) => {
                    console.error(error)
                    sessionStorage.setItem("isSignInError", "true")
                    navigate("/")

                }
            })
        }
    }, [auth.isAuthenticated])

    return (
        <LoadingView message={"Signing in ..."} />
    )
}

export default Callback
