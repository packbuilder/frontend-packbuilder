import type { Suggestion } from "@/types/suggestion";
import { CloudAlert, CloudCheck, CloudCog, CirclePlus, CircleMinus, PackageOpen, Tag } from "lucide-react";
import placeholderAvatar from "@/Seed-Avatar.jpg"
import { ModAction, ModLoader, SuggestionState } from "@/types/enums";
import { Separator } from "../ui/separator";
import { enumNameFromValue } from "@/lib/utils";
import BreadCrumbLink from "../breadcrumb-link";

export default function SuggestionDisplay({suggestion} : {suggestion: Suggestion}) {
    const addedMods = suggestion.modifications.filter(m => m.modAction === ModAction.Added);
    const removedMods = suggestion.modifications.filter(m => m.modAction === ModAction.Removed);
    
    return <BreadCrumbLink link={`suggestion/${suggestion.username}/${suggestion.modpackId}/${suggestion.id}/view`} text="View" className="size-full group bg-[var(--surface-1)] transition duration-200">
        <div className="w-full bg-[var(--surface-1)] group-hover:bg-white/5">
            <div className="grid w-full h-fit grid-cols-[60px_minmax(0,1fr)] grid-rows-[auto_auto] gap-x-3 gap-y-3 p-2 min-md:grid-cols-[100px_minmax(0,3fr)_1fr]">
                <div className="flex items-center justify-center min-md:row-span-3">
                    <img src={placeholderAvatar} className="size-15 rounded-sm shrink-0 min-md:size-25" />
                </div>
                <header className="flex flex-col gap-2 w-full justify-center min-md:col-start-2 min-md:row-span-2">
                    <div className="flex items-center justify-center max-w-full w-fit gap-2 min-w-0 min-md:w-full min-md:justify-start min-md:w-fit min-md:text-xl">
                        <h2 className="text-md font-bold truncate min-w-0 flex-1 max-w-fit text-[var(--text-primary)] group-hover:underline">
                            {suggestion.username}'s suggestion
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
                    <div className="flex items-center flex-wrap w-full justify-start gap-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full border border-[var(--text-secondary)] text-[var(--text-secondary)]">
                            {
                                suggestion.state.toString() === SuggestionState.Unverified ?
                                <div className="flex items-center justify-center gap-1">
                                    <CloudAlert className="text-red-500 size-4"/> <h3 className="text-xs text-nowrap">Outdated</h3>
                                </div>
                                : suggestion.state.toString() === SuggestionState.VerificationPending ?
                                <div className="flex items-center justify-center gap-1">
                                    <CloudCog className="text-white size-4"/> <h3 className="text-xs text-nowrap">Verification pending</h3>
                                </div>
                                :
                                <div className="flex items-center justify-center gap-1">
                                    <CloudCheck className="text-green-500 size-4"/> <h3 className="text-xs text-nowrap">Verified</h3>
                                </div>
                            }
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full border border-[var(--text-secondary)] text-[var(--text-secondary)]">
                            <div className="flex items-center justify-center gap-1">
                                <PackageOpen className="text-orange-100 size-4"/> <h3 className="text-xs text-nowrap">{enumNameFromValue(ModLoader, suggestion.modLoader.toString())}</h3>
                            </div>
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full border border-[var(--text-secondary)] text-[var(--text-secondary)]">
                            <div className="flex items-center justify-center gap-1">
                                <Tag className="text-green-100 size-4"/> <h3 className="text-xs text-nowrap">Minecraft {suggestion.gameVersion}</h3>
                            </div>
                        </span>
                    </div>
                </div>
            </div>
            <Separator />
        </div>
    </BreadCrumbLink>
}