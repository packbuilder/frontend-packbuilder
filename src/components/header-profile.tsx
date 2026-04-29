import {
  AlertTriangle,
  LogOut,
  MailQuestion,
  User2,
} from "lucide-react"
import {
  Avatar,
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
import avatarImage from "@/Seed-Avatar.jpg"
import BreadCrumbLink from "./breadcrumb-link"
import Cookies from "js-cookie"
import { useNavigate, useRouter } from "@tanstack/react-router"
import InfoPill from "./info-pill"

export default function NavUser({
  user,
}: {
  user: User
}) {
  const navigate = useNavigate();
  const router = useRouter();

  const handleLogout = async () => {
    Cookies.remove("_packbuilder_jwt");
    await router.invalidate({sync: true});
    navigate({to: "/login", reloadDocument: true});
  }
  console.log(user.emailVerified);

  return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="relative">
              <Avatar className="cursor-pointer border-white border-2 rounded-[50%] size-[50px]">
                <AvatarImage  src={avatarImage} alt={user.avatar} />
                <AvatarFallback className="rounded-lg">{user.name.slice(0, 1)}</AvatarFallback>
              </Avatar>
              <span className={`rounded-full bg-yellow-500 text-black p-1 absolute right-0 bottom-0 ${user.emailVerified && "hidden"}`}>
                <AlertTriangle className="size-3" />
              </span>
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
                <Avatar className="h-10 w-10 rounded-lg">
                  <AvatarImage src={avatarImage} alt={user.name}/>
                  <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
              </div>
              <div className={`px-1 py-1.5 ${user.emailVerified && "hidden"}`}>
                <InfoPill className={`gap-1 items-start`}>
                  <AlertTriangle className="text-yellow-500 size-4"/>
                  <h3 className="text-xs">Your email is not verified</h3>
                </InfoPill>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem className="cursor-pointer">
                <BreadCrumbLink link={`profile/${user.name}`} text="Profile" className="w-full">
                  <div className="flex items-center justify-start gap-2">
                    <User2 />
                    Profile
                  </div>
                </BreadCrumbLink>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup className={`${user.emailVerified && "hidden"}`}>
              <DropdownMenuItem className="cursor-pointer">
                  <BreadCrumbLink link={`profile/verify-email`} text="Verify Email  " className="w-full">
                    <div className="flex items-center justify-start gap-2">
                      <MailQuestion />
                      Verify Email
                    </div>
                  </BreadCrumbLink>
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