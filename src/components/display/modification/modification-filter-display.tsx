import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import type { ConflictState, ModAction } from "@/types/enums"

export function ModActionFilterSelect({modActionFilter, handleModActionFilterChange} : {modActionFilter: ModAction | null, handleModActionFilterChange: (newValue: ModAction | "All") => void}) {
    return (
        <Select value={modActionFilter ?? "All"} onValueChange={handleModActionFilterChange}>
            <SelectTrigger>
                <span className="text-sm">Filter:</span>
                <SelectValue placeholder="Filter modifications..."/>
                <Separator orientation="vertical"  className="h-full" />
            </SelectTrigger> 
            <SelectContent>
                <SelectGroup>     
                    <SelectLabel>Select filter</SelectLabel>
                    <SelectItem className="cursor-pointer" value={"All"}>All</SelectItem>
                    <SelectItem className="cursor-pointer" value={"0"}>Added</SelectItem>
                    <SelectItem className="cursor-pointer" value={"1"}>Removed</SelectItem>
                    <SelectItem className="cursor-pointer" value={"2"}>Updated</SelectItem>
                </SelectGroup>
            </SelectContent>
        </Select>
    )
}

export function ConflictStateFilterSelect({conflictStateFilter, handleConflictStateFilterChange} : {conflictStateFilter: ConflictState | null, handleConflictStateFilterChange: (newValue: ConflictState | "All") => void}) {
    return (
        <Select value={conflictStateFilter ?? "All"} onValueChange={handleConflictStateFilterChange}>
            <SelectTrigger>
                <span className="text-sm">Filter:</span>
                <SelectValue placeholder="Filter modifications..."/>
                <Separator orientation="vertical"  className="h-full" />
            </SelectTrigger> 
            <SelectContent>
                <SelectGroup>     
                    <SelectLabel>Select filter</SelectLabel>
                    <SelectItem className="cursor-pointer" value={"All"}>All</SelectItem>
                    <SelectItem className="cursor-pointer" value={"0"}>No Conflicts</SelectItem>
                    <SelectItem className="cursor-pointer" value={"1"}>Conflicting</SelectItem>
                    <SelectItem className="cursor-pointer" value={"2"}>Missing Dependencies</SelectItem>
                </SelectGroup>
            </SelectContent>
        </Select>
    )
}