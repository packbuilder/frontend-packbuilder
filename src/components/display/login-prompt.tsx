import type { User } from "@/types/user"
import { Link } from "@tanstack/react-router"
import { Button } from "../ui/button"

export default function LoginPrompt({curUser} : {curUser: User | null}) {
    if(!curUser) {
        return (
            <div className='flex flex-col gap-2 items-center justify-center w-full'>
                <h3 className="text-sm text-center font-bold mt-4 max-w-3/4">
                    In order to create modpacks, login to a verified account or sign up!
                </h3>
                <div className="flex gap-2">
                    <Link to='/login'>
                        <Button variant={"default"}>
                            Login
                        </Button>
                    </Link>
                    <Link to='/login/create-account'>
                        <Button variant={"default"}>
                            Sign up
                        </Button>
                    </Link>
                </div>
            </div>
        )
    }

    if(!curUser.emailVerified) {
        return (
            <div className="flex flex-col">
                <h3 className="text-sm text-center font-bold mt-4 max-w-3/4">
                    In order to create suggestions or edit this modpack, you must verify your email. 
                    <br /> 
                    <Link to="/profile/verify-email">
                        <Button variant={"default"}>
                            Verify your email.
                        </Button>
                    </Link>
                </h3>
            </div>
        )
    }

    return;
}