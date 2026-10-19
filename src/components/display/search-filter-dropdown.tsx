import { FilterIcon } from "lucide-react";
import { Button } from "../ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";

export default function SearchFilterDropdown({children} : {children: React.ReactNode}) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant={"default"}><FilterIcon /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
                className="w-(--radix-dropdown-menu-trigger-width) w-fit rounded-lg bg-[var(--surface-1)]"
                side={"bottom"}
                align="end"
                sideOffset={4}
                onCloseAutoFocus={(e) => e.preventDefault()}
            >
                <DropdownMenuLabel className="p-0 font-normal">
                    <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm cursor-default">
                        <div className="text-left text-md font-bold flex items-center gap-1">
                            <h3 className="truncate">Search filters:</h3>
                        </div>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    <div className="flex flex-col items-start justify-center gap-2 py-2">
                        {children}
                    </div>
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}