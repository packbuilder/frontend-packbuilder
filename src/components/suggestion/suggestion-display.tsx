import type { Suggestion } from "@/types/suggestion";
import { CirclePlus, CircleMinus } from "lucide-react";
import { ImageType, ModAction } from "@/types/enums";
import { Separator } from "../ui/separator";
import type { User } from "@/types/user";
import type { Modpack } from "@/types/modpack";
import { Link } from "@tanstack/react-router";
import { Button } from "../ui/button";
import MergeSuggestionDialog from "./merge-suggestion-dialog";
import { SuggestionTags } from "../display/tags";

type SuggestionDisplayProps = {
    suggestion: Suggestion, 
    modpack: Modpack, 
    curUser?: User | null,
    showActions?: boolean
}

export default function SuggestionDisplay({suggestion, modpack, curUser, showActions} : SuggestionDisplayProps) {
    const addedMods = suggestion.modifications.filter(m => m.modAction === ModAction.Added);
    const removedMods = suggestion.modifications.filter(m => m.modAction === ModAction.Removed);

    if(!suggestion.user) {
        return <div className="w-full bg-[var(--surface-1)]">
            <div className="w-full max-w-full h-fit flex items-center min-h-30 gap-x-3 gap-y-3 p-2 bg-[var(--surface-1)]">
                <h2>Unable to load suggestion information</h2>
            </div>
        </div>
    }

    return <div className="w-full bg-[var(--surface-1)]">
            <div className="grid w-full max-w-full h-fit grid-cols-[60px_minmax(0,1fr)] grid-rows-[auto_auto_auto] gap-x-3 gap-y-3 p-2 min-md:grid-cols-[100px_minmax(0,3fr)_1fr] bg-[var(--surface-1)]">
                <div className="flex items-center justify-center min-md:row-span-3">
                    <img className="displayImage" src={suggestion.user.imageType.toString() === ImageType.Stock ? `/profileAvatars/${suggestion.user.imageValue}` : "/packbuilder-placeholder.png"} />
                </div>
                <header className="flex flex-col gap-2 w-full justify-center min-md:col-start-2 min-md:row-span-2">
                    <div className="flex items-center justify-center max-w-full w-fit gap-2 min-w-0 min-md:w-full min-md:justify-start min-md:w-fit min-md:text-xl">
                        <h2 className="text-md font-bold truncate min-w-0 flex-1 max-w-fit text-[var(--text-primary)]">
                            {suggestion.user?.name}'s suggestion
                        </h2>
                        <Separator orientation="vertical" />
                        <div className="flex items-center flex-wrap justify-center gap-2 text-md text-[var(--text-secondary)]">
                            <span className="flex items-center justify-center w-fit gap-1 text-center">
                                <CirclePlus className="size-4 text-green-500" /> {addedMods.length}
                            </span>
                            <span className="flex items-center justify-center w-fit gap-1 text-center">
                                <CircleMinus className="size-4 text-red-500" /> {removedMods.length}
                            </span>
                        </div>
                    </div>  
                    <p className="text-sm text-left line-clamp-2 min-w-0 w-full text-[var(--text-secondary)]">{suggestion.memo}</p>
                </header>
                <div className="flex items-center justify-between w-full max-h-fit text-sm col-span-2 min-md:col-start-2 min-md:row-start-3">
                    <div className="flex flex-wrap items-center w-full justify-start gap-1 gap-y-2">
                        <SuggestionTags suggestion={suggestion} modpack={modpack}/>
                    </div>
                </div>
                <div className="flex items-center justify-start p-2 w-full max-h-fit col-span-2 gap-2 min-md:col-start-3 min-md:row-span-3 min-md:justify-center min-md:row-start-1 min-md:h-full min-md:max-h-full">
                    <Link to={"/modpack/$username/$modpackId/suggestion/$suggestionId"} params={{username: suggestion.user.name, modpackId: suggestion.modpackId.toString(), suggestionId: suggestion.id.toString()}}>
                        <Button variant={"default"}>
                            <p>View</p>
                        </Button>
                    </Link>
                    {
                        modpack && curUser && showActions && <MergeSuggestionDialog modpack={modpack} curUser={curUser} suggestion={suggestion} />
                    }
                </div>
            </div>
            <Separator />
    </div>
}