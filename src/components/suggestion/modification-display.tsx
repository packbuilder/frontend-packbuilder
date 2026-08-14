import type { CurseForgeMod } from "@/types/curseforge/curseforgeMod";
import type { Modification } from "@/types/modification";
import { Link } from "@tanstack/react-router";
import { CircleCheck, CircleMinus, CirclePlus, ExternalLink, TriangleAlert, X } from "lucide-react";
import { Separator } from "../ui/separator";
import { ConflictState, ModAction, ModPlatform } from "@/types/enums";
import InfoPill from "../info-pill";
import type { Modpack } from "@/types/modpack";
import type { Suggestion } from "@/types/suggestion";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createModificationDtoSchema } from "@/types/dtos/createModificationDto";
import { createModification, deleteModification } from "@/lib/api";
import { appQueries } from "@/hooks/appQueries";
import type { FormEvent } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import type { User } from "@/types/user";
import DisplayImage from "../display-image";
import { toast } from "sonner";

export function ModificationDisplay({curseforgeMod, modification, modpack, suggestion, modificationReferenceIds, curUser} : {curseforgeMod: CurseForgeMod, modification: Modification, modpack: Modpack, suggestion: Suggestion, modificationReferenceIds: string[], curUser: User | null | undefined}) {

    const modpackIdStr = modpack.id.toString();
    const suggestionIdStr = modification.suggestionId.toString();
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: async (formData: FormData) => {
            const modificationId = formData.get("modificationId") as string;
            const status = await deleteModification(modpackIdStr, modificationId, suggestionIdStr);

            if(!status || status < 200 || status > 299) {
                throw new Error(`There was a problem with deleting modification for ${curseforgeMod.name} from this suggestion`);
            }
        },
        onSuccess: async () => {
            toast.success(`Successfully removed modification for ${curseforgeMod.name} from your suggestion!`);
            await queryClient.invalidateQueries({
                queryKey: appQueries.suggestion(modpackIdStr, suggestionIdStr).queryKey,
            });
            await queryClient.invalidateQueries({
                queryKey: appQueries.modificationModData(suggestionIdStr, modificationReferenceIds).queryKey,
                refetchType: "all"
            });
        },
        onError: (error) => {
            toast.error(error.message);
            console.error(error.message);
        }
    });

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        mutation.mutate(formData);
    }

    return <div className="w-full bg-[var(--surface-1)] transition duration-200">
        <div className="grid w-full h-fit grid-cols-[auto_minmax(0,1fr)] grid-rows-[auto_auto_auto] gap-x-3 gap-y-3 p-2 min-md:grid-cols-[auto_minmax(0,3fr)_1fr]">
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
            <div className="flex items-center justify-between w-full h-fit col-span-2 min-md:row-start-2 min-md:col-start-2">
                <div className="flex items-center justify-center flex-wrap gap-2">
                    <div className="flex items-center justify-center gap-2">
                        {/* TODO: Figure out a better way to inform the user on what missing dependencies means? */}
                        <InfoPill>
                            {
                                modification.conflictState === ConflictState.MissingDependencies ? 
                                <div className="flex items-center justify-center items-center gap-1">
                                    <p className="text-xs text-nowrap">Missing dependencies</p> 
                                    <TriangleAlert className="text-yellow-500 size-4" />
                                </div>
                                : modification.conflictState === ConflictState.Conflicting ? 
                                <div className="flex items-center justify-center items-center gap-1">
                                    <p className="text-xs text-nowrap">Conflicting</p> 
                                    <TriangleAlert className="text-red-500 size-4" />
                                </div>
                                :
                                <div className="flex items-center justify-center items-center gap-1">
                                    <p className="text-xs text-nowrap">No conflicts</p> 
                                    <CircleCheck className="text-green-500 size-4" />
                                </div>
                            }
                        </InfoPill>
                        <InfoPill>
                            <div>
                                {
                                    modification.modAction === ModAction.Added ? 
                                    <div className="flex items-center justify-center items-center gap-1">
                                        <p className="text-xs text-nowrap">Added</p> 
                                        <CirclePlus className="text-green-500 size-4" />
                                    </div>
                                    : 
                                    <div className="flex items-center justify-center items-center gap-1">
                                        <p className="text-xs text-nowrap">Removed</p> 
                                        <CircleMinus className="text-red-500 size-4" />
                                    </div>
                                }
                            </div>
                        </InfoPill>
                    </div>
                </div>
            </div>
            {
                curUser && curUser.id === suggestion.userId && 
                <div className="flex items-center justify-start w-full h-fit gap-2 col-span-2 min-md:col-start-3 min-md:justify-center min-md:h-full min-md:row-span-3 min-md:row-start-1">
                    <form method="delete" id="deleteModification" onSubmit={handleSubmit}>
                        <Input type="hidden" name="modificationId" value={modification.id} />
                        <Button type="submit" variant={"destructive"} disabled={mutation.isPending}><X className="text-[var(--text-primary)]"/></Button>
                    </form>
                    <Button variant={"default"}>
                        <Link to={curseforgeMod.websiteLink} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="text-[var(--text-primary)]" />
                        </Link>
                    </Button>
                </div>
            }
        </div>
        <Separator />
    </div>
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
            const result = createModificationDtoSchema.safeParse({modAction, modReferenceId, modPlatform});

            if (!result.success) {
                throw new Error(result.error.issues[0].message);
            }

            const status = await createModification(modpack.id.toString(), suggestion.id.toString(), result.data);

            if(!status || status < 200 || status > 299) {
                throw new Error(`There was a problem with adding a modification for ${curseforgeMod.name} to your suggestion.`);
            }
        },
        onSuccess: async () => {
            toast.success(`Successfully added a modification for ${curseforgeMod.name} to your suggestion!`);
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
            toast.error(error.message);
            console.error(error.message);
        }
    });

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        mutation.mutate(formData);
    }
    return <div className="w-full bg-[var(--surface-1)] transition duration-200">
        <div className="grid w-full h-fit grid-cols-[auto_minmax(0,1fr)] grid-rows-[auto_auto_auto] gap-x-3 gap-y-3 p-2">
            <div className="flex items-center justify-center">
                <DisplayImage src={curseforgeMod.logoUrl} />
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
            <div className="flex items-center justify-between w-full h-fit row-start-3 col-span-2">
                <div className="flex items-start justify-center gap-2 w-fit">
                    {isEnabled ?
                        <form method="post" id="modDisplay" onSubmit={handleSubmit} className="w-full">
                            <Input type="hidden" name="modPlatform" value={ModPlatform.CurseForge}/>
                            <Input type="hidden" name="modReferenceId" value={curseforgeMod.referenceId}/>
                            <Input type="hidden" name="modAction" value={modAction === ModAction.Added ? ModAction.Added : ModAction.Removed} />
                            {modAction === ModAction.Added ? 
                                <Button type="submit" disabled={mutation.isPending} variant={"default"} className="w-fit">
                                    <h3>Add Mod</h3>
                                </Button> 
                                : 
                                <Button type="submit" disabled={mutation.isPending} variant={"destructive"} className="w-fit">
                                    <h3>Remove Mod</h3>
                                </Button>
                            }
                        </form>
                        :
                        <Button variant={"outline"}>
                            <h3>    
                                {modAction === ModAction.Added ? "Add mod" : "Remove mod"}
                            </h3>
                        </Button>
                    }
                </div>
            </div>
            {
                !isEnabled && 
                <div className="gap-2 row-start-2 col-span-3">
                    <InfoPill>
                        <div className="flex items-center justify-center items-center gap-1">
                            <TriangleAlert className="text-red-500 size-4" />
                            <h3 className="text-xs text-nowrap min-md:text-sm">{disabledMessage}</h3> 
                        </div>
                    </InfoPill>
                </div>
            }
        </div>
        <Separator />
    </div>
}