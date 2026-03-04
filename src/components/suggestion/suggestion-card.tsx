import type { Suggestion } from "@/types/suggestion";
import { CloudAlert, CloudCheck, SquarePlus, SquareMinus, CloudCog } from "lucide-react";
import BreadCrumbLink from "../breadcrumb-link";
import ToolbarTooltip from "../toolbar-tooltip";
import { Button } from "../ui/button";
import placeholderAvatar from "@/Seed-Avatar.jpg"
import { ModAction, SuggestionState } from "@/types/enums";
import { GlassCard } from "../glass-card";

export default function SuggestionCard({suggestion} : {suggestion: Suggestion}) {
    const addedMods = suggestion.modifications.filter(m => m.modAction === ModAction.Added);
    const removedMods = suggestion.modifications.filter(m => m.modAction === ModAction.Removed);
    
    return <BreadCrumbLink 
        link={`/suggestion/${suggestion.username}/${suggestion.modpackId}/${suggestion.id}/view`} 
        text={`View`}>
        <GlassCard className="flex items-center justify-between gap-2 w-full max-w-120">
            <div className="flex items-center justify-center gap-2">
                <img className="border-white border-2 rounded-[50%] size-[50px]" src={placeholderAvatar} alt="" />
                <div className="flex flex-col items-center justify-center">
                    <h1 className="font-bold text-xl text-left w-full">{suggestion.username}</h1>
                    <p className="text-left w-full">{suggestion.memo}</p>
                </div>
            </div>
            <div className="flex flex-row items-center justify-center gap-2">
                {
                    suggestion.state.toString() === SuggestionState.Unverified ?
                    <ToolbarTooltip side="top" content="This suggestion is unverified and cannot be merged.">
                        <CloudAlert className="text-red-500"/>
                    </ToolbarTooltip>
                    : suggestion.state.toString() === SuggestionState.VerificationPending ?
                    <ToolbarTooltip side="top" content="This suggestion is pending verification and will soon be able to be merged.">
                        <CloudCog />
                    </ToolbarTooltip>
                    :
                    <ToolbarTooltip side="top" content="This suggestion has been verified and can be merged.">
                        <CloudCheck />
                    </ToolbarTooltip>
                }

                <ToolbarTooltip side="top" content="Added mods">
                    <Button variant={"default"} className="bg-green-500 hover:bg-green-500 text-lg font-bold">
                        <SquarePlus /> {addedMods.length}
                    </Button>
                </ToolbarTooltip>

                <ToolbarTooltip side="top" content="Removed mods">
                    <Button variant={"default"} className="bg-red-500 hover:bg-red-500 text-lg font-bold">
                        <SquareMinus /> {removedMods.length}
                    </Button>
                </ToolbarTooltip>
            </div>
        </GlassCard>
    </BreadCrumbLink>
}