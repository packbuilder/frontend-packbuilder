import type { FormEvent } from "react";
import { Button } from "../ui/button";
import { Search } from "lucide-react";
import ClearableSearchInput from "./clearable-input";

export default function ResultFilterForm({handleSubmit, children} : {handleSubmit: (event: FormEvent<HTMLFormElement>) => void, children?: React.ReactNode}) {
    return (
        <form onSubmit={handleSubmit}  className="flex flex-row items-center justify-center w-full gap-1">
            <ClearableSearchInput type="text" placeholder="Search..." name="searchQuery" id="searchQuery"/>
            <Button type="submit">
                <Search />
            </Button>
            <div className="flex items-center justify-center gap-2">
                {children}
            </div>
        </form>
    )
}