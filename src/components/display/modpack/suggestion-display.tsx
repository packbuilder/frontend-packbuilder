import type { PaginatedSuggestionSchema } from "@/types/paginatedResponse"
import DisplayContainer from "../display-container"
import type { Modpack } from "@/types/modpack"
import type { User } from "@/types/user"
import { Spinner } from "../../ui/spinner"
import SuggestionInteractive from "../../suggestion/suggestion-display"
import type { SuggestionState } from "@/types/enums"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "../../ui/select"
import { Separator } from "../../ui/separator"

export function SuggestionFilterSelect({suggestionFilter, handleFilterChange} : {suggestionFilter: SuggestionState | null, handleFilterChange: (newValue: SuggestionState | "all") => void}) {
    return (
        <Select name="suggestionFilter" value={suggestionFilter ?? "All"} onValueChange={handleFilterChange}>
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

export function SuggestionResultsDisplay({pendingSuggestions, paginatedSuggestions, modpack, curUser} : {pendingSuggestions: boolean, paginatedSuggestions: PaginatedSuggestionSchema | null | undefined, modpack: Modpack, curUser: User | null}) {
    return (
        <div className="w-full">
            <DisplayContainer>
                {
                    pendingSuggestions ? (
                        <div className="size-full flex items-center justify-center w-full">
                            <Spinner className="size-20" />
                        </div>
                    )
                    :
                    paginatedSuggestions && paginatedSuggestions.items.map((suggestion, index) => {
                        return <div key={index} className="size-full max-w-full p-0">
                            <SuggestionInteractive suggestion={suggestion} modpack={modpack} curUser={curUser} />
                        </div>
                    })
                }
            </DisplayContainer>
        </div>
    )
}