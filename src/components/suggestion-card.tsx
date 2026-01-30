import type { Suggestion } from "@/types/suggestion";
import { CloudAlert, CloudCheck, SquarePlus, SquareMinus, TriangleAlert, CloudCog } from "lucide-react";
import BreadCrumbLink from "./breadcrumb-link";
import ToolbarTooltip from "./toolbar-tooltip";
import { Button } from "./ui/button";
import placeholderAvatar from "@/Seed-Avatar.jpg"
import { ModAction, SuggestionState } from "@/types/enums";

export default function SuggestionCard({suggestion} : {suggestion: Suggestion}) {
    const addedMods = suggestion.modifications.filter(m => m.modAction === ModAction.Added);
    const removedMods = suggestion.modifications.filter(m => m.modAction === ModAction.Removed);
    
    return <BreadCrumbLink 
        className="duration-100 cursor-pointer relative hover:cursor-pointer focus:shadow focus:scale-110 hover:shadow hover:scale-110 p-2 border dark:border-white fslex flex-col gap-2 items-center w-full max-w-120 rounded overflow-hidden"
        link={`/suggestion/${suggestion.username}/${suggestion.modpackSlug}/${suggestion.id}/view`} 
        text={`View`}
        style={{
            background:"rgba(255, 255, 255, 0.2)",
            borderRadius: "16px",
            boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
            backdropFilter: "blur(12.1px)",
            WebkitBackdropFilter: "blur(5px)",
            border:" 1px solid rgba(255, 255, 255, 0.3)"
        }}>
        <div className="flex items-center justify-between w-full">
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
        </div>
    </BreadCrumbLink>
}