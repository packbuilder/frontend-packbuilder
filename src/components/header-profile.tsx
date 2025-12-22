import {
  BadgeCheck,
  LogOut,
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

  return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
              <Avatar className="cursor-pointer border-white border-2 rounded-[50%] size-[50px]">
                <AvatarImage  src={avatarImage} alt={user.avatar} />
                <AvatarFallback className="rounded-lg">{user.name.slice(0, 1)}</AvatarFallback>
              </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={"bottom"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={avatarImage} alt={user.name} />
                  <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem className="cursor-pointer">
                <BreadCrumbLink link="profile/edit" text="Profile" className="w-full">
                  <div className="flex items-center justify-start gap-2">
                    <BadgeCheck />
                    Profile
                  </div>
                </BreadCrumbLink>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer" onClick={async () => await handleLogout()}>
                <LogOut />
                Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
  )
}