import type { Suggestion } from "@/types/suggestion";
import { CloudAlert, CloudCheck, CloudCog, CirclePlus, CircleMinus, PackageOpen, Tag, Check, X } from "lucide-react";
import { ImageType, ModAction, ModLoader, SuggestionState } from "@/types/enums";
import { Separator } from "../ui/separator";
import { enumNameFromValue } from "@/lib/utils";
import InfoPill from "../display/info-pill";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createModpackVersion } from "@/lib/api";
import type { User } from "@/types/user";
import type { Modpack } from "@/types/modpack";
import { Link, useRouter } from "@tanstack/react-router";
import { Button } from "../ui/button";
import DisplayImage from "../display/display-image";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { useState } from "react";
import { toast } from "sonner";

export default function SuggestionInteractive({suggestion, modpack, curUser} : {suggestion: Suggestion, modpack: Modpack, curUser: User | null}) {
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
                    <DisplayImage src={suggestion.user.imageType === ImageType.Stock ? `/profileAvatars/${suggestion.user.imageValue}` : suggestion.user.imageValue} alt="logo" />
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
                        <InfoPill>
                            {
                                suggestion.state.toString() === SuggestionState.Unverified ?
                                <div className="flex items-center justify-center gap-1">
                                    <CloudAlert className="text-red-500 size-4"/> <p>Unverified</p>
                                </div>
                                : suggestion.state.toString() === SuggestionState.VerificationPending ?
                                <div className="flex items-center justify-center gap-1">
                                    <CloudCog className="text-white size-4"/> <p>Verification pending</p>
                                </div>
                                :
                                <div className="flex items-center justify-center gap-1">
                                    <CloudCheck className="text-green-500 size-4"/> <p>Verified</p>
                                </div>
                            }
                        </InfoPill>
                        <InfoPill>
                            <div className="flex items-center justify-center gap-1">
                                <PackageOpen className="text-orange-100 size-4"/> <p>{enumNameFromValue(ModLoader, suggestion.modLoader.toString())}</p>
                            </div>
                        </InfoPill>
                        <InfoPill>
                            <div className="flex items-center justify-center gap-1">
                                <Tag className="text-green-100 size-4"/> <p>Minecraft {suggestion.gameVersion}</p>
                            </div>
                        </InfoPill>
                    </div>
                </div>
                <div className="flex items-center justify-start p-2 w-full max-h-fit col-span-2 gap-2 min-md:col-start-3 min-md:row-span-3 min-md:justify-center min-md:row-start-1 min-md:h-full min-md:max-h-full">
                    <Link to={"/modpack/$username/$modpackId/suggestion/$suggestionId"} params={{username: suggestion.user.name, modpackId: suggestion.modpackId.toString(), suggestionId: suggestion.id.toString()}}>
                        <Button variant={"default"}>
                            <p>View</p>
                        </Button>
                    </Link>
                    <MergeSuggestionDialog modpack={modpack} curUser={curUser} suggestion={suggestion} />
                </div>
            </div>
            <Separator />
    </div>
}

export function SuggestionDisplay({suggestion} : {suggestion: Suggestion}) {
    const addedMods = suggestion.modifications.filter(m => m.modAction === ModAction.Added);
    const removedMods = suggestion.modifications.filter(m => m.modAction === ModAction.Removed);

    if(!suggestion.user) {
        return <div className="w-full bg-[var(--surface-1)]">
            <div className="w-full max-w-full h-fit flex items-center min-h-30 gap-x-3 gap-y-3 p-2 bg-[var(--surface-1)]">
                <h2>Unable to load suggestion information</h2>
            </div>
        </div>
    }
    
    return <Link to={"/modpack/$username/$modpackId/suggestion/$suggestionId"} params={{username: suggestion.user.name, modpackId: suggestion.modpackId.toString(), suggestionId: suggestion.id.toString()}} className="w-full group bg-[var(--surface-1)]">
            <div className="grid w-full max-w-full h-fit grid-cols-[60px_minmax(0,1fr)] grid-rows-[auto_auto] gap-x-3 gap-y-3 p-2 min-md:grid-cols-[100px_minmax(0,3fr)_1fr] bg-[var(--surface-1)] group-hover:bg-white/5 transition duration-200">
                <div className="flex items-center justify-center min-md:row-span-3">
                    <DisplayImage src={suggestion.user.imageType === ImageType.Stock ? `/profileAvatars/${suggestion.user.imageValue}` : suggestion.user?.imageValue} alt="logo" />
                </div>
                <header className="flex flex-col gap-2 w-full justify-center min-md:col-start-2 min-md:row-span-2">
                    <div className="flex items-center justify-center max-w-full w-fit gap-2 min-w-0 min-md:w-full min-md:justify-start min-md:w-fit min-md:text-xl">
                        <h2 className="text-md font-bold truncate min-w-0 flex-1 max-w-fit text-[var(--text-primary)] group-hover:underline">
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
                        <InfoPill>
                            {
                                suggestion.state.toString() === SuggestionState.Unverified ?
                                <div className="flex items-center justify-center gap-1">
                                    <CloudAlert className="text-red-500 size-4"/> <p>Unverified</p>
                                </div>
                                : suggestion.state.toString() === SuggestionState.VerificationPending ?
                                <div className="flex items-center justify-center gap-1">
                                    <CloudCog className="text-white size-4"/> <p>Verification pending</p>
                                </div>
                                :
                                <div className="flex items-center justify-center gap-1">
                                    <CloudCheck className="text-green-500 size-4"/> <p>Verified</p>
                                </div>
                            }
                        </InfoPill>
                        <InfoPill>
                            <div className="flex items-center justify-center gap-1">
                                <PackageOpen className="text-orange-100 size-4"/> <p>{enumNameFromValue(ModLoader, suggestion.modLoader.toString())}</p>
                            </div>
                        </InfoPill>
                        <InfoPill>
                            <div className="flex items-center justify-center gap-1">
                                <Tag className="text-green-100 size-4"/> <p>Minecraft {suggestion.gameVersion}</p>
                            </div>
                        </InfoPill>
                    </div>
                </div>
            </div>
            <Separator />
    </Link>
}

function MergeSuggestionDialog({modpack, suggestion, curUser} : {modpack: Modpack, suggestion: Suggestion, curUser: User | null}) {
    const [isOpen, setIsOpen] = useState(false);
    const queryClient = useQueryClient();
    const router = useRouter();
    const modpackIdStr = modpack.id.toString(); 
    const suggestionIdStr = suggestion.id.toString();
    const canMerge = suggestion.state === SuggestionState.Verified && curUser?.id === modpack.userId && suggestion.modifications.length > 0;
    
    const mutation = useMutation({
        mutationFn: async () => {
            const status = await createModpackVersion(modpackIdStr, suggestionIdStr);
        
            if(!status || status < 200 || status > 299) {
                throw new Error(`There was a problem with merging ${suggestion.user?.name}'s suggestion into modpack ${modpack.name}.`);
            }
        },
        onSuccess: async () => {
            toast.success(`Successfully merged ${suggestion.user?.name}'s suggestion into modpack ${modpack.name}.`);
            setIsOpen(false);
            await queryClient.invalidateQueries({queryKey: ["modpack", modpackIdStr], exact: true});
            await queryClient.invalidateQueries({queryKey: ["suggestion", suggestionIdStr], exact: true});
            await queryClient.invalidateQueries({queryKey: ["modificationModData", suggestionIdStr]})
            await router.invalidate({sync: true}); 
        },
        onError: (error: Error) => {
            toast.error(error.message);
            console.error(error);
        }
    })

    const handleClick = () => {
        if(canMerge) {
            mutation.mutate();
        }
    }

    return <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
            <Button variant={canMerge ? "default" : "disabled"} disabled={!canMerge}>
                <p>Merge</p>
            </Button>
        </DialogTrigger>
        <DialogContent showCloseButton={false} className="flex flex-col justify-center items-center w-fit gap-4">
            <DialogHeader className="flex justify-center items-center text-left">
                <DialogTitle className="text-xl font-bold">Are you sure you want do merge this suggestion into your modpack?</DialogTitle>
                <Separator />
                <DialogDescription>Doing so will create a new version for your modpack that implements the changes suggested by the user.</DialogDescription>
            </DialogHeader>
            <DialogFooter className="w-full items-start flex-row">
                <Button variant={"default"} disabled={mutation.isPending} onClick={handleClick}>Merge suggestion <Check /></Button>
                <DialogClose asChild>
                    <Button variant={"destructive"} className="w-fit">Cancel <X/></Button>
                </DialogClose>
            </DialogFooter>
        </DialogContent>
    </Dialog>
}