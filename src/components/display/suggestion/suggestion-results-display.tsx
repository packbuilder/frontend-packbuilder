import type { PaginatedSuggestionSchema } from "@/types/paginatedResponse"
import type { Modpack } from "@/types/modpack"
import type { User } from "@/types/user"
import SuggestionInteractive from "../../suggestion/suggestion-display"
import type { SuggestionState } from "@/types/enums"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "../../ui/select"
import { Separator } from "../../ui/separator"

export function SuggestionFilterSelect({suggestionFilter, handleFilterChange} : {suggestionFilter: SuggestionState | null, handleFilterChange: (newValue: SuggestionState | "All") => void}) {
    return (
        <Select value={suggestionFilter ?? "All"} onValueChange={handleFilterChange}>
            <SelectTrigger>
                <span className="text-sm">Filter:</span>
                <SelectValue placeholder="Filter modifications..."/>
                <Separator orientation="vertical"  className="h-full" />
            </SelectTrigger> 
            <SelectContent>
                <SelectGroup>     
                    <SelectLabel>Select filter</SelectLabel>
                    <SelectItem className="cursor-pointer" value={"All"}>All</SelectItem>
                    <SelectItem className="cursor-pointer" value={"0"}>Unverified</SelectItem>
                    <SelectItem className="cursor-pointer" value={"1"}>Verified</SelectItem>
                    <SelectItem className="cursor-pointer" value={"2"}>VerificationPending</SelectItem>
                    <SelectItem className="cursor-pointer" value={"3"}>MergePending</SelectItem>
                </SelectGroup>
            </SelectContent>
        </Select>
    )
}