import { Input } from "@/components/ui/input";
import { createModification, deleteModification, updateSuggestion, verifySuggestion } from "@/lib/api";
import type { VersionMod } from "@/types/versionMod";
import type { CurseForgeMod } from "@/types/curseforge/curseforgeMod";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, CloudAlert, CloudCheck, Edit, ExternalLink, Search, TriangleAlert, X, CloudCog, Save, Plus, Merge } from "lucide-react";
import { useMemo, useRef, useState, type FormEvent } from "react";
import type { CurseForgePagination } from "@/types/curseforge/curseforgePagination";
import { Select, SelectContent, SelectGroup, SelectTrigger, SelectValue, SelectItem } from "@/components/ui/select";
import { SelectLabel } from "@radix-ui/react-select";
import { Dialog , DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { type Modification } from "@/types/modification";
import { createModificationDtoSchema } from "@/types/dtos/createModificationDto";
import { DialogDescription } from "@radix-ui/react-dialog";
import ToolbarTooltip from "@/components/toolbar-tooltip";
import { createFileRoute, Link, redirect, useNavigate, useRouter } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { fallback, zodValidator } from '@tanstack/zod-adapter'
import z from "zod";
import placeholder from "@/Seed-Avatar.jpg"
import { appQueries } from "@/hooks/appQueries";
import { Spinner } from "@/components/ui/spinner";
import { SuggestionState, ModAction, ModPlatform, ModLoader, ConflictState } from "@/types/enums";
import { suggestionSchema, type Suggestion } from "@/types/suggestion";
import { Separator } from "@/components/ui/separator";
import { createSuggestionDtoSchema } from "@/types/dtos/createSuggestionDto";
import { enumNameFromValue } from "@/lib/utils";
import type { SortMethod } from "@/types/curseforge/curseForgeSortMethod";
import DeleteSuggestionDialog from "@/components/suggestion/delete-suggestion-dialog";

const addModSearchSchema = z.object({
    page: fallback(z.number(), 0).default(0),
    sortMethod: fallback(z.enum(["0", "1", "2", "3"]), "0").default("0"),
    searchQuery: fallback(z.string(), "").default('')
});

export const Route = createFileRoute('/suggestion/$username/$modpackId/$suggestionId/edit')({
    validateSearch: zodValidator(addModSearchSchema),
    loaderDeps: ({search: {searchQuery, page, sortMethod}}) => ({
        searchQuery,
        page,
        sortMethod
    }),
    loader: async ({context: {user, queryClient}, params: {modpackId, suggestionId}, deps: {searchQuery, page, sortMethod}}) => {
        const suggestion = await queryClient.ensureQueryData(appQueries.suggestion(modpackId, suggestionId));
        const modpack = await queryClient.ensureQueryData(appQueries.modpack(modpackId));
        
        if(!suggestion || !modpack || user?.id !== suggestion.userId) {
            throw redirect({to:"/"});
        }

        const modpackModIds = modpack.versions[0].versionMods.map((versionMod: VersionMod) => versionMod.modId);
        const modificationReferenceIds = suggestion.modifications.map(modification => modification.mod.referenceId);

        const modpackReferenceIds = await queryClient.ensureQueryData(appQueries.modReferenceIds(modpackModIds));

        await queryClient.ensureQueryData(appQueries.modpackModData(modpackReferenceIds));
        await queryClient.ensureQueryData(appQueries.modificationModData(suggestionId, modificationReferenceIds));
        await queryClient.ensureQueryData(appQueries.curseForgeSearchResults(searchQuery, page, sortMethod, suggestion.gameVersion, suggestion.modLoader));

        return {curUser: user}
    },
    component: EditSuggestion,
});

function PaginationButtons({ paginationData, curPage } : { 
    paginationData: CurseForgePagination | undefined, 
    curPage: number, 
}) {
    const navigate = useNavigate({from: Route.fullPath});
    
    const nextPage = async () => {
        if(!paginationData || paginationData.resultCount !== paginationData.pageSize) {
            return;
        }
        navigate({search: (prev: {page: number, searchQuery: string, sortMethod: SortMethod}) => ({page: prev.page + 1, searchQuery: prev.searchQuery, sortMethod: prev.sortMethod})});
    }

    const previousPage = async () => {
        if(curPage - 1 < 0) {
            return;
        }
        navigate({search: (prev: {page: number, searchQuery: string, sortMethod: SortMethod}) => ({page: prev.page - 1, searchQuery: prev.searchQuery, sortMethod: prev.sortMethod})});
    }


    return <div className="flex justify-center items-center">
        <Button className="" variant={"default"} onClick={previousPage}>
            <ArrowLeft />
        </Button>
        <h1 className="font-bold">{curPage + 1}</h1>
        <Button className="" variant={"default"} onClick={nextPage}>
            <ArrowRight />
        </Button>
    </div>
}

function UpdateSuggestionDialog( {suggestion} :{suggestion: Suggestion}) {
    const [isOpen, setOpen] = useState(false);
    const queryClient = useQueryClient();
    const {modpackId, suggestionId} = Route.useParams();
    const router = useRouter();
    const formRef = useRef(null);
    const {data: minecraftVersions} = useSuspenseQuery(appQueries.minecraftVersions());
    const [minecraftVersion, setMinecraftVersion] = useState(suggestion.gameVersion);
    const [modLoader, setModLoader] = useState(suggestion.modLoader.toString());

    const mutation = useMutation({
        mutationFn: async (formData: FormData) => {
            const memo = formData.get("memo") as string;
            const body = createSuggestionDtoSchema.parse({memo, gameVersion: minecraftVersion, modLoader: modLoader});
            const status = await updateSuggestion(modpackId, body, parseInt(suggestionId));

            if(!status || status < 200 || status > 200) {
                throw new Error("There was a problem with updating this suggestion");
            }
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: appQueries.suggestion(modpackId, suggestionId).queryKey,
                refetchType: "all"
            });

            await router.invalidate({sync: true});
        },
        onError: (error) => {
            console.error(error.message)
        }
    });

    const submitForm = () => {
        setOpen(false);
        const form = formRef.current as unknown as HTMLFormElement;
        form.requestSubmit();
    }

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        mutation.mutate(formData);
    }

    return <Dialog open={isOpen} onOpenChange={setOpen}>
        <DialogTrigger asChild>
            <Button variant={"default"}>
                Edit details <Edit />
            </Button>   
        </DialogTrigger>
        <DialogContent showCloseButton={false} className="flex flex-col justify-center items-center w-fit">
            <DialogHeader className="w-full px-2">
                <DialogTitle>
                    Update suggestion
                </DialogTitle>
                <DialogDescription>
                    Update your suggestion details!
                </DialogDescription>
            </DialogHeader>
            <form method="post" ref={formRef} id="createSuggestion" className=" w-full p-2 flex flex-col items-start justify-cetner gap-2" onSubmit={handleSubmit}>
                <div className="flex flex-col justify-center items-start gap-2">
                    <h1 className="font-bold text-lg">Memo</h1>
                    <Input id="memo" type="text" name="memo" defaultValue={suggestion.memo} placeholder="Your message..."/>
                </div>
                <h1 className="font-bold text-lg">Game Version & Mod Loader</h1>
                <div className={`flex items-center justify-center gap-2`}>
                    <Select disabled={!minecraftVersions} value={minecraftVersion} onValueChange={setMinecraftVersion}>
                        <SelectTrigger style={{color: "black", backgroundColor: "whitesmoke" }}>
                            <SelectValue placeholder="Select game version..."/>
                        </SelectTrigger> 
                        <SelectContent className="bg-white text-black" side="bottom">
                            <SelectGroup>     
                                <SelectLabel>Select version</SelectLabel>
                                {
                                    minecraftVersions?.map((version, index) => {
                                        return <SelectItem className="cursor-pointer" key={index} value={version}>
                                            {version}
                                        </SelectItem>
                                    })
                                }
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                    <Select value={modLoader.toString()} onValueChange={setModLoader}>
                        <SelectTrigger style={{color: "black", backgroundColor: "whitesmoke" }}>
                            <SelectValue placeholder="Select game version..."/>
                        </SelectTrigger> 
                        <SelectContent className="bg-white text-black" side="bottom">
                            <SelectGroup>     
                                <SelectLabel>Select mod loader</SelectLabel>
                                {
                                    Object.values(ModLoader).map((modLoader, index) => {
                                        return <SelectItem className="cursor-pointer" key={index} value={modLoader}>
                                            {enumNameFromValue(ModLoader, modLoader)}
                                        </SelectItem>
                                    })
                                }
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>
            </form>
            <DialogFooter className="w-full px-2">
                <div className="w-full flex flex-row justify-start items-center gap-2">
                    <Button variant={"default"} onClick={submitForm} type="submit">Update Suggestion <Save/></Button>
                    <DialogClose asChild>
                        <Button variant={"destructive"}>Cancel <X/></Button>
                    </DialogClose>
                </div>
            </DialogFooter>
        </DialogContent>
    </Dialog>
}

function CurseForgeModDisplay({curseforgeMod, modAction, isEnabled, disabledMessage, modificationReferenceIds} : {curseforgeMod: CurseForgeMod, modAction: "Add" | "Remove", isEnabled: boolean, disabledMessage: string, modificationReferenceIds: string[]}) {
    const {modpackId, suggestionId} = Route.useParams();
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: async (formData: FormData) => {
            const modReferenceId = formData.get("modReferenceId") as string;
            const modAction = formData.get("modAction") as ModAction;
            const modPlatform = formData.get("modPlatform") as ModPlatform;
            const createModificationDto = createModificationDtoSchema.parse({modAction, modReferenceId, modPlatform});

            const status = await createModification(modpackId, suggestionId, createModificationDto);

            if(!status || status < 200 || status > 200) {
                throw new Error("Problem with creating modification to add mod to suggestion list");
            }
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: appQueries.suggestion(modpackId, suggestionId).queryKey,
                refetchType: "all",
            });
            await queryClient.invalidateQueries({
                queryKey: appQueries.modpack(modpackId).queryKey,
                refetchType: "all"
            });
            await queryClient.invalidateQueries({
                queryKey: appQueries.modificationModData(suggestionId, modificationReferenceIds).queryKey,
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

    return <div className="flex flex-col w-fit items-center justify-center gap-2 p-5 border-b-2 border-white w-full">
        <img src={curseforgeMod.logoUrl} className="size-20" alt="" />
        <h1 className="text-xl text-center">{curseforgeMod.name}</h1>
        {isEnabled ? <form method="post" id="modDisplay" onSubmit={handleSubmit}>
            <Input type="hidden" name="modPlatform" value={ModPlatform.CurseForge}/>
            <Input type="hidden" name="modReferenceId" value={curseforgeMod.referenceId}/>
            <Input type="hidden" name="modAction" value={modAction === "Add" ? ModAction.Added : ModAction.Removed} />
            {modAction === "Add" ? <Button type="submit" variant={"default"}>Add Mod</Button> : <Button type="submit" variant={"destructive"}>Remove Mod</Button>}
        </form> : <Button variant={"outline"}>{disabledMessage}</Button>}
    </div>
}

function ModificationDisplay({curseforgeMod, modification, modificationReferenceIds} : {curseforgeMod: CurseForgeMod, modification: Modification, modificationReferenceIds: string[]}) {
    const {modpackId, suggestionId} = Route.useParams();
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: async (formData: FormData) => {
            const modificationId = formData.get("modificationId") as string;
            const status = await deleteModification(modpackId, modificationId, suggestionId);

            if(!status || status < 200 || status > 200) {
                throw new Error("Problem with deleting modification from this suggestion");
            }
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: appQueries.suggestion(modpackId, suggestionId).queryKey,
                refetchType: "all",
            });
            await queryClient.invalidateQueries({
                queryKey: appQueries.modificationModData(suggestionId, modificationReferenceIds).queryKey,
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

    return <div className="flex flex-row items-center justify-start gap-2 p-5 border-b-2 border-gray-300 w-full flex-wrap">
        <div className="flex items-center justify-center gap-2">
            <img src={curseforgeMod.logoUrl} className="size-20" alt="" />
            <h1 className="text-2xl">{curseforgeMod.name}</h1>
        </div>
        <div className="flex items-center justify-center gap-2">
            <h1 className={`${modification.modAction === ModAction.Added ? "bg-emerald-500" : "bg-red-500"} p-2`}>
                {modification.modAction === ModAction.Added ? "Added" : "Removed"}
            </h1>
            <ToolbarTooltip side="top" content="This modification could not install some dependencies due to conflict. May or may not work.">
                <Button className={`bg-yellow-400 hover:bg-yellow-400 ${modification.conflictState === ConflictState.MissingDependencies  ? "" : "hidden"}`}>
                    <TriangleAlert className="text-black" />
                </Button>
            </ToolbarTooltip>
            <ToolbarTooltip content="Curseforge link" side="top">
                <Link to={curseforgeMod.websiteLink} target="_blank" rel="noopener noreferrer">
                    <Button variant={"default"}><ExternalLink /></Button>
                </Link>
            </ToolbarTooltip>
            <ToolbarTooltip content="Delete modification" side="top">
                <form method="delete" id="deleteModification" onSubmit={handleSubmit}>
                    <Input type="hidden" name="modificationId" value={modification.id} />
                    <Button type="submit" variant={"destructive"}><X /></Button>
                </form>
            </ToolbarTooltip>
        </div>
    </div>
}

function AddModsDialog({modpackReferenceIds, modificationReferenceIds, suggestion} : {modpackReferenceIds: string[] | null | undefined, modificationReferenceIds: string[], suggestion: Suggestion}) {
    const {page, searchQuery, sortMethod} = Route.useSearch({
        select: (search) => ({
            page: search.page,
            searchQuery: search.searchQuery,
            sortMethod: search.sortMethod,
        })
    });
    const [sort, setSort] = useState("0");
    const navigate = useNavigate({from: Route.fullPath});
    const queryClient = useQueryClient();
    const {data: modSearchResults, isPending: pendingSearchResults} = useQuery(appQueries.curseForgeSearchResults(searchQuery, page, sortMethod, suggestion.gameVersion, suggestion.modLoader));

    const modificationReferenceIdSet = useMemo(
        () => new Set(modificationReferenceIds.map((referenceId) => referenceId)),
        [modificationReferenceIds]
    );

    const modpackReferenceIdSet = useMemo(
        () => new Set(modpackReferenceIds?.map((referenceId) => referenceId)),
        [modpackReferenceIds]
    );

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const newSearchQuery = formData.get("searchQuery") as string;

        await queryClient.invalidateQueries({
            queryKey: appQueries.curseForgeSearchResults(searchQuery, page, sortMethod, suggestion.gameVersion, suggestion.modLoader).queryKey,
        });

        navigate({search: () => ({page: 0, searchQuery: newSearchQuery, sortMethod: sort})})
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
            <Button variant="green">Add mods</Button>
            </DialogTrigger>
            <DialogContent className="flex-col items-center justify-center">
                <DialogHeader className="mt-4 flex justify-center items-center">
                    <DialogTitle className="text-3xl font-bold">Add mods</DialogTitle>
                    <DialogDescription>Suggest mods to add by browsing curseforge mods!</DialogDescription>
                    <form method="post" id="addMods" onSubmit={handleSubmit}>
                        <div className="flex items-center justify-center gap-2 flex-wrap">
                            <div className="flex items-center justify-center gap-2">
                                <Select value={sort} onValueChange={setSort}>
                                    <SelectTrigger style={{color: "black", backgroundColor: "whitesmoke" }}>
                                        <SelectValue placeholder="Set sort method..."/>
                                    </SelectTrigger> 
                                    <SelectContent className="bg-white text-black">
                                        <SelectGroup>     
                                            <SelectLabel>Sort</SelectLabel>
                                            <SelectItem className="cursor-pointer" value="0">Featured</SelectItem>
                                            <SelectItem className="cursor-pointer" value="1">Popularity</SelectItem>
                                            <SelectItem className="cursor-pointer" value="2">Total Downloads</SelectItem>
                                            <SelectItem className="cursor-pointer" value="3">Rating</SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                                <Input id="searchQuery" type="text" name="searchQuery" placeholder="Search mods..." defaultValue={searchQuery} required/>
                                <Button variant={"default"} type="submit"><Search/></Button>
                            </div>
                            {/* TODO: put error message here */}
                            <div>{}</div>
                        </div>
                    </form>
                    <div>
                        <PaginationButtons paginationData={modSearchResults?.pagination} curPage={page}/>
                    </div>
                </DialogHeader>
                <div className="flex flex-col justify-start items-start w-full border border-white dark:white flex flex-col h-96 w-96 overflow-y-auto overflow-x-clip w-[80%]">
                    {pendingSearchResults ? (
                        <div className="size-full flex items-center justify-center w-full">
                            <Spinner className="size-20" />
                        </div>
                    ) : modSearchResults && modSearchResults.mods.length > 0 ? (
                        modSearchResults.mods.map((mod: CurseForgeMod) => {
                        let disabledMessage = "";

                        if (modificationReferenceIdSet.has(mod.referenceId)) {
                            disabledMessage = "This mod is already in your list of changes.";
                        } else if (modpackReferenceIdSet.has(mod.referenceId)) {
                            disabledMessage = "This mod has already been added to the modpack.";
                        }

                        return (
                            <CurseForgeModDisplay
                            key={mod.referenceId}
                            curseforgeMod={mod}
                            modAction="Add"
                            isEnabled={!disabledMessage}
                            modificationReferenceIds={modificationReferenceIds}
                            disabledMessage={disabledMessage}
                            />
                        );
                        })
                    ) : (
                        <div className="size-full flex items-center justify-center w-full">
                        No search results
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}

function RemoveModsDialog({modpackModData, modificationReferenceIds} : {modpackModData: CurseForgeMod[] | null | undefined, modificationReferenceIds: string[]}) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="destructive">Remove mods</Button>
            </DialogTrigger>
            <DialogContent className="flex-col items-center justify-center">
                <DialogHeader className="mt-4 flex justify-center items-center">
                    <DialogTitle className="text-3xl font-bold">Remove mods</DialogTitle>
                    <DialogDescription>Suggest mods to remove from the modpack!</DialogDescription>
                </DialogHeader>
                <div className="flex flex-col items-center justify-center">
                    <div className="flex flex-col justify-start items-start w-5/6 max-w-5/6 border border-white flex flex-col overflow-y-auto overflow-x-clip h-96" >
                        {(modpackModData && modpackModData.length > 0) && modpackModData.map((mod: CurseForgeMod, index: number) => {
                            let isEnabled = true;
                            let disabledMessage = "";
                            modificationReferenceIds.forEach(referenceId => {
                                if(referenceId === mod.referenceId) {
                                    isEnabled = false;
                                    disabledMessage = "This mod is already in your list of changes."
                                }
                            });
                            return <CurseForgeModDisplay modificationReferenceIds={modificationReferenceIds} curseforgeMod={mod} key={index} modAction="Remove" isEnabled={isEnabled} disabledMessage={disabledMessage}/>
                        })}

                        {(!modpackModData || modpackModData.length === 0) && <div className="size-full flex items-center justify-center"><h1>No mods to remove.</h1></div>}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

function VerifySuggestionDialog({suggestion, modificationReferenceIds} : {suggestion: Suggestion, modificationReferenceIds: string[]}) {
    const {modpackId, suggestionId} = Route.useParams();
    const queryClient = useQueryClient();
    
    const mutation = useMutation({
        mutationFn: async () => {
            const status = await verifySuggestion(suggestion.id, modpackId);

            if(!status || status < 200 || status > 200 ) {
                throw new Error("Problem with verifying suggestion.");
            }
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: appQueries.suggestion(modpackId, suggestionId).queryKey,
                refetchType: "all",
            });
            await queryClient.invalidateQueries({
                queryKey: appQueries.modificationModData(suggestionId, modificationReferenceIds).queryKey,
                refetchType: "all"
            });
        },
        onError: (error) => {
            console.error(error.message);
        }
    });

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant={"default"}>
                    Verify suggestion <CloudCog />
                </Button>
            </DialogTrigger>
            <DialogContent className="flex-col items-center justify-center">
                <DialogHeader className="mt-4 flex justify-center items-center">
                    <DialogTitle className="text-3xl font-bold">Verifying your suggestion</DialogTitle>
                    <DialogDescription>What to expect when verifying your suggestion?</DialogDescription>
                </DialogHeader>
                <div className="flex flex-col items-center justify-center">
                    <div className="flex border flex-col justify-start items-start w-full flex flex-col h-96 w-96 overflow-y-auto w-[80%]">
                        <div className="flex flex-col items-start justify-center">
                            <h1 className="font-bold text-xl px-4 py-2">How the proccess works</h1>
                            <Separator />
                            <div className="rounded-md px-4 py-2 flex flex-col items-center justify-start gap-4 text-left">
                                <h1> 1. Verification of your suggestion happens automatically but may take some time.</h1>
                                <h1> 2. During verification, your suggestion will be put in a queue to be verified and will enter a pending state.</h1>
                                <h1> 3. You cannot make changes to your suggestion while it's in a pending state.</h1>
                                <h1> 4. Once your suggestion is verified, it is able to be merged by the modpack owner.</h1>
                                <h1> 5. You can make changes to your suggestion after it's verified, however doing so will un-verify the suggestion and you will have to re-verify after you make additional changes.</h1>
                            </div>
                        </div>
                        <Separator />
                        <div className="flex flex-col items-start justify-center">
                            <h1 className="font-bold text-xl px-4 py-2">What happens during verification.</h1>
                            <Separator />
                            <div className="rounded-md px-4 py-2 flex flex-col items-center justify-start gap-4 text-left">
                                <h1> 1. All missing required mod dependencies are resolved automatically and added to your suggestion as modifications to be added.</h1>
                                <h1> 2. Any incompatible mods that are already in the modpack will be added to your modifications list as mods to be removed.</h1>
                                <h1> 3. Any conflicting modifications that are in your suggestion will automatically be deleted.</h1>
                            </div>
                        </div>
                    </div>
                </div>
                <DialogFooter className="w-full px-2">
                    <div className="w-full flex flex-row justify-start items-center gap-2">
                        <Button variant={"default"} onClick={() => mutation.mutate()} type="submit">Begin Verification <Save/></Button>
                        <DialogClose asChild>
                            <Button variant={"destructive"}>Cancel <X/></Button>
                        </DialogClose>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default function EditSuggestion() {
    const {modpackId, suggestionId} = Route.useParams();
    const navigate = useNavigate();

    const {data: modpack} = useSuspenseQuery({
        ...appQueries.modpack(modpackId),
        staleTime: Infinity,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false
    });
    const {data: suggestion} = useSuspenseQuery({
        ...appQueries.suggestion(modpackId, suggestionId),
        staleTime: Infinity,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
    });

    if (!suggestion || !modpack) {
        navigate({ to: "/" });
        return;
    }

    const modificationReferenceIds = useMemo(
        () => suggestion.modifications.map(modification => modification.mod.referenceId), 
        [suggestion.modifications]
    );
    const modpackModIds = useMemo(
        () => modpack.versions[0].versionMods.map((versionMod: VersionMod) => versionMod.modId), 
        [modpack.versions[0].versionMods]
    );

    const {data: modpackReferenceIds} = useQuery(appQueries.modReferenceIds(modpackModIds));
    const {data: modpackModData} = useQuery(appQueries.modpackModData(modpackReferenceIds));
    const {data: modificationModData, isPending: pendingModificationData} = useQuery(appQueries.modificationModData(suggestionId, modificationReferenceIds));

    return <section className="flex flex-col items-center justify-center pb-4">
        <header className="flex flex-col items-center justify-center gap-4">
            <img className="cursor-pointer border-white border-2 rounded-[50%] size-20" src={placeholder} alt="" />
            <div className="flex flex-col items-center justify-center gap-2">
                <div className="flex items-center justify-center gap-1">
                    <h1 className="text-xl font-bold">{suggestion.username + "'s Suggestion"}</h1>
                </div>
                {
                    suggestion.state.toString() === SuggestionState.Unverified ?     
                    <div className="flex items-center justify-center">
                        <CloudAlert className="text-red-500"/>
                        <h1>This suggestion has not been verified and cannot be merged.</h1>
                    </div>
                    : suggestion.state.toString() === SuggestionState.VerificationPending ?
                    <div className="flex items-center justify-center">
                        <CloudCog />
                        <h1>This suggestion is undergoing verification and cannot be merged or edited.</h1>
                    </div>
                    : 
                    suggestion.state.toString() === SuggestionState.MergePending ?
                    <div className="flex items-center justify-center">
                        <Merge />
                        <h1>This suggestion is merging with its modpack and cannot be edited or merged.</h1>
                    </div>
                    :
                    <div className="flex items-center justify-center">
                        <CloudCheck />
                        <h1>This suggestion has been verified and is able to be merged.</h1>
                    </div>
                }
                <div className="flex items-center justify-center gap-2">
                    <h1 className="text-lg">Minecraft version: {suggestion.gameVersion}</h1>
                    <h1 className="text-lg">Mod loader: {enumNameFromValue(ModLoader, suggestion.modLoader)}</h1>
                    <h1 className="text-lg">Memo: {suggestion.memo}</h1>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2 w-full">
                    <UpdateSuggestionDialog suggestion={suggestion} />
                    <VerifySuggestionDialog modificationReferenceIds={modificationReferenceIds} suggestion={suggestion} />
                    <AddModsDialog modpackReferenceIds={modpackReferenceIds} modificationReferenceIds={modificationReferenceIds} suggestion={suggestion} />
                    <RemoveModsDialog modpackModData={modpackModData} modificationReferenceIds={modificationReferenceIds} />
                    <DeleteSuggestionDialog modpack={modpack} suggestion={suggestion} />
                </div>
            </div>
        </header>
        <div className="flex flex-col justify-center items-center w-3/4">
            <h1 className="text-4xl font-bold self-start">Modifications</h1>
            <div className="flex flex-col justify-start items-start min-w-[300px] min-h-[400px] border w-1/2 border-black dark:border-gray-400 bg-gray-900 flex flex-col h-96 w-96 overflow-y-auto overflow-x-clip w-full">        
                    {pendingModificationData ? (
                        <div className="size-full flex items-center justify-center w-full">
                            <Spinner className="size-20" />
                        </div>
                    ) :
                    suggestion.modifications?.map((modification, index) => {
                        const modData = modificationModData?.find(modData => modification.mod.referenceId === modData.referenceId);

                        if(!modData) {
                            return <div>Error fetching mod data for modification</div>
                        }

                        return <ModificationDisplay modificationReferenceIds={modificationReferenceIds} curseforgeMod={modData} modification={modification} key={index} />;
                })}
                <div className={`flex items-center justify-center size-full ${!modificationModData || modificationModData.length == 0 ? "" : "hidden"}`}>
                    <h1 className="text-xl">It's looking empty in here...</h1>
                </div>
            </div>
        </div>
    </section>
}