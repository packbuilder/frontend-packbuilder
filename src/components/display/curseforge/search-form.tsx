import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { CurseForgeSearchFilter } from "@/types/enums";
import { Search } from "lucide-react";
import type React from "react";
import type { FormEvent } from "react";

type SearchFormProps = {
    searchQuery: string, 
    searchInputRef: React.RefObject<HTMLInputElement | null>, 
    submitButtonRef: React.RefObject<HTMLButtonElement | null>, 
    sortMethod: CurseForgeSearchFilter,
    handleSubmit: (event: FormEvent<HTMLFormElement>) => void, 
    handleSortChange: (newValue: CurseForgeSearchFilter) => void,
}

export default function CurseForgeSearchForm({handleSubmit, searchQuery, searchInputRef, submitButtonRef, handleSortChange, sortMethod} : SearchFormProps) {
    return (
        <form className="w-full mt-4" method="post" id="addMods" onSubmit={handleSubmit}>
            <div className="flex items-center justify-center gap-2 flex-wrap w-full">
                <div className="flex items-center justify-center gap-2 w-full">
                    <div className="relative w-full">
                        <Input id="searchQuery" type="text" name="searchQuery" placeholder="Search for curseforge mods..." defaultValue={searchQuery} required className="text-sm w-full" ref={searchInputRef}/>
                        <Button variant={"ghost"} type="submit" className="absolute right-0" ref={submitButtonRef}><Search/></Button>
                    </div>
                    <Select value={sortMethod} onValueChange={handleSortChange}>
                        <SelectTrigger className="">
                            <SelectValue placeholder="Set sort method..."/>
                        </SelectTrigger> 
                        <SelectContent className="">
                            <SelectGroup>     
                                <SelectLabel>Sort</SelectLabel>
                                <SelectItem className="cursor-pointer" value="0">Featured</SelectItem>
                                <SelectItem className="cursor-pointer" value="1">Popularity</SelectItem>
                                <SelectItem className="cursor-pointer" value="2">Total Downloads</SelectItem>
                                <SelectItem className="cursor-pointer" value="3">Rating</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </form>
    )
}