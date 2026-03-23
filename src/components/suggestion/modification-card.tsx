import type { CurseForgeMod } from "@/types/curseforge/curseforgeMod";
import type { Modification } from "@/types/modification";
import { Link, Route } from "@tanstack/react-router";
import { CircleCheck, CircleMinus, CirclePlus, TriangleAlert } from "lucide-react";
import { Separator } from "../ui/separator";
import { ConflictState, ModAction, ModPlatform } from "@/types/enums";
import InfoPill from "../info-pill";
import type { Modpack } from "@/types/modpack";
import type { Suggestion } from "@/types/suggestion";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createModificationDtoSchema } from "@/types/dtos/createModificationDto";
import { createModification } from "@/lib/api";
import { appQueries } from "@/hooks/appQueries";
import type { FormEvent } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

export function ModificationDisplay({curseforgeMod, modification} : {curseforgeMod: CurseForgeMod, modification: Modification}) {
    return <Link to={curseforgeMod.websiteLink} target="_blank" rel="noopener noreferrer" className="w-full group bg-[var(--surface-1)] transition duration-200">
        <div className="grid w-full h-fit grid-cols-[60px_minmax(0,1fr)] grid-rows-[auto_auto] gap-x-3 gap-y-3 p-2 group-hover:bg-white/5 min-md:grid-cols-[100px_minmax(0,3fr)_1fr]">
            <div className="flex items-center justify-center min-md:row-span-3">
                <img src={curseforgeMod.logoUrl} className="size-15 rounded-sm shrink-0 min-md:size-25" />
            </div>
            <header className="flex flex-col gap-2 w-full justify-center">
                <div className="flex items-center justify-center max-w-full w-fit gap-2 min-w-0 min-md:w-full min-md:justify-start min-md:w-fit min-md:text-xl">
                    <h2 className="text-md font-bold truncate min-w-0 flex-1 max-w-fit group-hover:underline text-[var(--text-primary)]">
                        {curseforgeMod.name}
                    </h2>
                    <Separator orientation="vertical" />
                    <p className="text-md truncate min-w-0 flex-1 max-w-fit text-[var(--text-secondary)] min-md:text-lg">
                        by {curseforgeMod.authors[0].name}
                    </p>
                </div>  
                <p className="text-sm text-left line-clamp-2 min-w-0 w-full text-[var(--text-secondary)]">{curseforgeMod.summary}</p>
            </header>
            <div className="flex items-center justify-between w-full h-fit col-span-2">
                <div className="flex items-center justify-center flex-wrap gap-2">
                    <div className="flex items-center justify-center gap-2 min-md:col-start-3 min-md:row-start-1">
                        <InfoPill>
                            {
                                modification.conflictState === ConflictState.MissingDependencies ? 
                                <div className="flex items-center justify-center items-center gap-1">
                                    <h3 className="text-xs text-nowrap">Missing dependencies</h3> 
                                    <TriangleAlert className="text-yellow-500 size-4" />
                                </div>
                                : modification.conflictState === ConflictState.Conflicting ? 
                                <div className="flex items-center justify-center items-center gap-1">
                                    <h3 className="text-xs text-nowrap">Conflicting</h3> 
                                    <TriangleAlert className="text-red-500 size-4" />
                                </div>
                                :
                                <div className="flex items-center justify-center items-center gap-1">
                                    <h3 className="text-xs text-nowrap">No conflicts</h3> 
                                    <CircleCheck className="text-green-500 size-4" />
                                </div>
                            }
                        </InfoPill>
                        <InfoPill>
                            <div>
                                {
                                    modification.modAction === ModAction.Added ? 
                                    <div className="flex items-center justify-center items-center gap-1">
                                        <h3 className="text-xs text-nowrap">Added</h3> 
                                        <CirclePlus className="text-green-500 size-4" />
                                    </div>
                                    : 
                                    <div className="flex items-center justify-center items-center gap-1">
                                        <h3 className="text-xs text-nowrap">Removed</h3> 
                                        <CircleMinus className="text-red-500 size-4" />
                                    </div>
                                }
                            </div>
                        </InfoPill>
                    </div>
                </div>
            </div>
        </div>
        <Separator />
    </Link>
}

export function CreateModificationDisplay(
    {curseforgeMod, modAction, modpack, suggestion, isEnabled, disabledMessage, modificationReferenceIds} : 
    {curseforgeMod: CurseForgeMod, isEnabled: boolean, disabledMessage: string, modificationReferenceIds: string[], modpack: Modpack, suggestion: Suggestion, modAction: ModAction}
) {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: async (formData: FormData) => {
            const modReferenceId = formData.get("modReferenceId") as string;
            const modAction = formData.get("modAction") as ModAction;
            const modPlatform = formData.get("modPlatform") as ModPlatform;
            const createModificationDto = createModificationDtoSchema.parse({modAction, modReferenceId, modPlatform});

            const status = await createModification(modpack.id.toString(), suggestion.id.toString(), createModificationDto);

            if(!status || status < 200 || status > 200) {
                throw new Error("Problem with creating modification to add mod to suggestion list");
            }
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: appQueries.suggestion(modpack.id.toString(), suggestion.id.toString()).queryKey,
                refetchType: "all",
            });
            await queryClient.invalidateQueries({
                queryKey: appQueries.modpack(modpack.id.toString()).queryKey,
                refetchType: "all"
            });
            await queryClient.invalidateQueries({
                queryKey: appQueries.modificationModData(suggestion.id.toString(), modificationReferenceIds).queryKey,
                refetchType: "all"
            });
        },
        onError: (error) => {
            console.error(error.message);
        }
    });

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        mutation.mutate(formData);
    }
    return <div className="w-full bg-[var(--surface-1)] transition duration-200">
        <div className="grid w-full h-fit grid-cols-[60px_minmax(0,1fr)] grid-rows-[auto_auto] gap-x-3 gap-y-3 p-2 min-md:grid-cols-[100px_minmax(0,3fr)_1fr]">
            <div className="flex items-center justify-center min-md:row-span-3">
                <img src={curseforgeMod.logoUrl} className="size-15 rounded-sm shrink-0 min-md:size-25" />
            </div>
            <header className="flex flex-col gap-2 w-full justify-center">
                <div className="flex items-center justify-center max-w-full w-fit gap-2 min-w-0 min-md:w-full min-md:justify-start min-md:w-fit min-md:text-xl">
                    <h2 className="text-md font-bold truncate min-w-0 flex-1 max-w-fit text-[var(--text-primary)]">
                        {curseforgeMod.name}
                    </h2>
                    <Separator orientation="vertical" />
                    <p className="text-md truncate min-w-0 flex-1 max-w-fit text-[var(--text-secondary)] min-md:text-lg">
                        by {curseforgeMod.authors[0].name}
                    </p>
                </div>  
                <p className="text-sm text-left line-clamp-2 min-w-0 w-full text-[var(--text-secondary)]">{curseforgeMod.summary}</p>
            </header>
            <div className="flex items-center justify-between w-full h-fit col-span-2">
                <div className="flex items-center justify-center gap-2 w-full">
                    <div className="flex items-center justify-center gap-2 w-full min-md:col-start-3 min-md:row-start-1">
                        {isEnabled ? 
                            <form method="post" id="modDisplay" onSubmit={handleSubmit} className="w-full">
                                <Input type="hidden" name="modPlatform" value={ModPlatform.CurseForge}/>
                                <Input type="hidden" name="modReferenceId" value={curseforgeMod.referenceId}/>
                                <Input type="hidden" name="modAction" value={modAction === ModAction.Added ? ModAction.Added : ModAction.Removed} />
                                {modAction === ModAction.Added ? 
                                    <Button type="submit" variant={"default"} className="w-full">
                                        <h3 className="text-xs">Add Mod</h3>
                                    </Button> 
                                    : 
                                    <Button type="submit" variant={"destructive"} className="w-full">
                                        <h3 className="text-xs">Remove Mod</h3>
                                    </Button>
                                }
                            </form> 
                            : 
                            <Button variant={"outline"} className="w-full">
                                <h3 className="text-xs text-wrap">{disabledMessage}</h3>
                            </Button>
                        }
                    </div>
                </div>
            </div>
        </div>
        <Separator />
    </div>
}

// TODO: Re-implement the modification display where the user can remove/delete it

export function RemoveModiciationDisplay() {

}