import type { Suggestion } from "@/types/suggestion";
import { CloudAlert, CloudCheck, SquarePlus, SquareMinus, TriangleAlert } from "lucide-react";
import BreadCrumbLink from "./breadcrumb-link";
import ToolbarTooltip from "./toolbar-tooltip";
import { Button } from "./ui/button";
import placeholderAvatar from "@/Seed-Avatar.jpg"

export default function SuggestionCard({suggestion} : {suggestion: Suggestion}) {
    const addedMods = suggestion.modifications.filter(m => m.modAction === "Added");
    const removedMods = suggestion.modifications.filter(m => m.modAction === "Removed");
    
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
                <div className={`${suggestion.isOutdated ? "" : "hidden"}`}>
                    <ToolbarTooltip side="top" content="This suggestion is outdated and may contain conflicts">
                        <CloudAlert className="text-red-500"/>
                    </ToolbarTooltip>
                </div>

                <div className={`${suggestion.isOutdated ? "hidden" : ""}`}>
                    <ToolbarTooltip side="top" content="This suggestion is up to date">
                        <CloudCheck />
                    </ToolbarTooltip>
                </div>

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

                <ToolbarTooltip side="top" content="Conflicts">
                    <Button variant={"default"} className="bg-yellow-500 hover:bg-yellow-500 text-lg font-bold">
                        <TriangleAlert /> {suggestion.conflictingModifications.length}
                    </Button>
                </ToolbarTooltip>
            </div>
        </div>
    </BreadCrumbLink>
}