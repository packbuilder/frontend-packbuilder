import type { FormEvent } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Search } from "lucide-react";

export default function ResultFilterForm({handleSubmit, children} : {children: React.ReactNode, handleSubmit: (event: FormEvent<HTMLFormElement>) => void}) {
    return (
        <form onSubmit={handleSubmit}  className="flex items-center justify-center w-full gap-1">
            <Input type="text" placeholder="Search this page..." name="searchQuery" id="searchQuery" />
            <div className="flex max-md:flex-col items-center justify-center">
                <div className="flex items-center max-md:flex-col justify-center gap-2 z-1">
                    <div className="flex items-center justify-center gap-2">
                        {children}
                    </div>
                </div>
            </div>
            <Button type="submit">
                <Search />
            </Button>
        </form>
    )
}