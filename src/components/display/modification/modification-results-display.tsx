import type { PaginatedModificationSchema } from "@/types/paginatedResponse";
import DisplayContainer from "../display-container";
import { CurseForgeModificationDisplay } from "@/components/display/curseforge/modification-display";
import type { Modpack } from "@/types/modpack";
import type { User } from "@/types/user";
import type { CurseForgeMod } from "@/types/curseforge/curseforgeMod";
import type { Suggestion } from "@/types/suggestion";

export default function ModificationResultDisplay({paginatedModifications, modificationModData, modpack, suggestion, curUser, modificationReferenceIds} : {paginatedModifications: PaginatedModificationSchema | null | undefined, modpack: Modpack, suggestion: Suggestion, curUser: User | null, modificationModData: CurseForgeMod[] | undefined | null, modificationReferenceIds: string[]}) {
    return (
        <DisplayContainer>
            {
                modificationModData && paginatedModifications?.items.map((modification) => {
                    
                    const modData = modificationModData.find(modData => modification.mod.referenceId === modData.referenceId);
                    
                    if(!modData) {
                        return <div>Error fetching mod data for mod with id {modification.mod.referenceId}.</div>
                    }

                    return <div key={modification.id} className="size-full p-0">
                        <CurseForgeModificationDisplay suggestion={suggestion} curUser={curUser} curseforgeMod={modData} modification={modification} modpack={modpack} modificationReferenceIds={modificationReferenceIds} />
                    </div>
                })
            }
        </DisplayContainer>
    )
}