import {
  AlertTriangle,
  LogOut,
  MailQuestion,
  User2,
} from "lucide-react"
import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { User } from "@/types/user"
import { Link, useNavigate, useRouter } from "@tanstack/react-router"
import InfoPill from "./info-pill"
import { ImageType } from "@/types/enums"
import { logout } from "@/lib/api"
import { isResponseSuccess } from "@/lib/utils"
import { toast } from "sonner"

export default function NavUser({
  user,
}: {
  user: User
}) {
  const navigate = useNavigate();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const response = await logout();

      if(!isResponseSuccess(response)) {
        throw new Error("There was a problem with logging out, please try again.")
      }

      await router.invalidate({sync: true});
      navigate({to: "/login", reloadDocument: true});
      
    } catch(error) {
      const err = error as unknown as Error 
      toast.error(err.message);
    }
  }

  return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="relative">
              <Avatar className="cursor-pointer border-white border-2 rounded-[50%] size-[50px]">
                <AvatarImage src={user.imageType === ImageType.Stock ? `/profileAvatars/${user.imageValue}` : user.imageValue} alt={"user profile picture"} />
                <AvatarFallback className="rounded-lg">
                  <img src={"/packbuilder-placeholder"} />
                </AvatarFallback>
              </Avatar>
              <AvatarBadge className={`bg-yellow-500 ring-0 p-1 cursor-pointer ${user.emailVerified ? "hidden" : ""}`}>
                <AlertTriangle className="size-3 text-black" />
              </AvatarBadge>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg bg-[var(--surface-1)]"
            side={"bottom"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal flex items-start justify-center flex-col">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-10 w-10 rounded-lg border-white/30 border-1">
                  <AvatarImage src={user.imageType === ImageType.Stock ? `/profileAvatars/${user.imageValue}` : user.imageValue} alt={"user profile picture"}/>
                  <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate text-base font-bold">{user.name}</span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
              </div>
              <div className={`px-1 py-1.5 ${user.emailVerified && "hidden"}`}>
                <InfoPill className={`gap-1 items-start`}>
                  <AlertTriangle className="text-yellow-500 size-4"/>
                  <p className="text-xs">Your email is not verified</p>
                </InfoPill>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem className="cursor-pointer">
                <Link to={"/profile/$username/$userId"} params={{username: user.name, userId: user.id}} className="w-full">
                  <div className="flex items-center justify-start gap-2 pointer-events-none">
                    <User2 />
                    Profile
                  </div>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup className={`${user.emailVerified && "hidden"}`}>
              <DropdownMenuItem className="cursor-pointer">
                  <Link to={"/profile/verify-email"} className="w-full">
                    <div className="flex items-center justify-start gap-2">
                      <MailQuestion />
                      Verify Email
                    </div>
                  </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </DropdownMenuGroup>
            <DropdownMenuItem className="cursor-pointer" onClick={async () => await handleLogout()}>
                <LogOut />
                Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
  )
}