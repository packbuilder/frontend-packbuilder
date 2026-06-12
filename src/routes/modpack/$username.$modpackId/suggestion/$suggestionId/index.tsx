import { updateSuggestion, verifySuggestion } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, CloudAlert, CloudCheck, CloudCog, Edit, Merge, Save, Search, X } from "lucide-react";
import { createFileRoute, Link, redirect, useNavigate, useRouter } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useRef, useState, type FormEvent } from "react";
import { appQueries } from "@/hooks/appQueries";
import { ConflictState, CurseForgeSearchFilter, ImageType, ModAction, ModificationFilter, ModLoader, SuggestionState } from "@/types/enums";
import DeleteSuggestionDialog from "@/components/suggestion/delete-suggestion-dialog";
import InfoPill from "@/components/info-pill";
import { Separator } from "@/components/ui/separator";
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { Spinner } from "@/components/ui/spinner";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreateModificationDisplay, ModificationDisplay } from "@/components/suggestion/modification-display";
import { fallback, zodValidator } from "@tanstack/zod-adapter";
import z from "zod";
import type { CurseForgePagination } from "@/types/curseforge/curseforgePagination";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { enumNameFromValue } from "@/lib/utils";
import type { SortMethod } from "@/types/curseforge/curseForgeSortMethod";
import type { CurseForgeMod } from "@/types/curseforge/curseforgeMod";
import { createSuggestionDtoSchema } from "@/types/dtos/createSuggestionDto";
import type { Suggestion } from "@/types/suggestion";
import type { VersionMod } from "@/types/versionMod";
import type { Modpack } from "@/types/modpack";
import ClearableCommandInput from "@/components/clearable-command-input";
import DisplayContainer from "@/components/display-container";
import { useSuggestionSubscription } from "@/hooks/useSuggestionSubscription";
import { toast } from "sonner";
import { Field, FieldLabel } from "@/components/ui/field";

const addModSearchSchema = z.object({
    page: fallback(z.number(), 0).default(0),
    sortMethod: fallback(z.enum(["0", "1", "2", "3"]), "0").default("0"),
    searchQuery: fallback(z.string(), "").default('')
});

export const Route = createFileRoute('/modpack/$username/$modpackId/suggestion/$suggestionId/')({
    validateSearch: zodValidator(addModSearchSchema),
    loaderDeps: ({search: {searchQuery, page, sortMethod}}) => ({
        searchQuery,
        page,
        sortMethod
    }),
    loader: async ({context: {user, queryClient}, params: {suggestionId, modpackId}}) => {
        const suggestion = await queryClient.ensureQueryData(appQueries.suggestion(modpackId, suggestionId));
        const modpack = await queryClient.ensureQueryData(appQueries.modpack(modpackId));
        
        if(!suggestion || !modpack) {
            throw redirect({to: "/"});
        }

        const breadcrumbs = [{text: modpack.name, link: `/modpack/${modpack.user.name}/${modpack.id}`}, {text: `${suggestion.username}'s suggestion`, link: `/modpack/${modpack.user.name}/${modpack.id}/suggestion/${suggestion.id}`}]

        return { curUser: user, suggestion, modpack, breadcrumbs };
    },
    component: SuggestionView,
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


    return <div className="flex justify-center items-center gap-2">
        <Button className="rounded-full" variant={"outline"} onClick={previousPage}>
            <ArrowLeft />
        </Button>
        <h2 className="font-bold">{curPage + 1}</h2>
        <Button className="rounded-full" variant={"outline"} onClick={nextPage}>
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
            const result = createSuggestionDtoSchema.safeParse({memo, gameVersion: minecraftVersion, modLoader: modLoader});

            if (!result.success) {
                throw new Error(result.error.issues[0].message);
            }

            const status = await updateSuggestion(modpackId, result.data, parseInt(suggestionId));

            if(!status || status < 200 || status > 299) {
                throw new Error("There was a problem with updating this suggestion");
            }
        },
        onSuccess: async () => {
            toast.success("Successfully updated suggestion!");
            setOpen(false);
            await queryClient.invalidateQueries({
                queryKey: appQueries.suggestion(modpackId, suggestionId).queryKey,
                refetchType: "all"
            });

            await router.invalidate({sync: true});
        },
        onError: (error) => {
            toast.error(error.message)
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
            <DialogHeader className="w-full px-2 text-left">
                <DialogTitle>
                    Update suggestion
                </DialogTitle>
                <DialogDescription>
                    Update your suggestions message or the game version/mod loader you want used for the modpack!
                </DialogDescription>
            </DialogHeader>
            <form method="post" ref={formRef} id="createSuggestion" className=" w-full p-2 flex flex-col items-start justify-cetner gap-2" onSubmit={handleSubmit}>
                <div className="flex flex-col justify-center items-start gap-2">
                    <Field>
                        <FieldLabel className="font-bold text-lg">Memo</FieldLabel>
                        <Input id="memo" type="text" name="memo" defaultValue={suggestion.memo} placeholder="Your message..."/>
                    </Field>
                </div>
                <h2 className="font-bold text-lg">Game Version & Mod Loader</h2>
                <div className={`flex items-center justify-center gap-2`}>
                    <Select disabled={!minecraftVersions} value={minecraftVersion} onValueChange={setMinecraftVersion}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select game version..."/>
                        </SelectTrigger> 
                        <SelectContent side="bottom">
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
                        <SelectTrigger>
                            <SelectValue placeholder="Select game version..."/>
                        </SelectTrigger> 
                        <SelectContent side="bottom">
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
                    <Button variant={"default"} onClick={submitForm} disabled={mutation.isPending} type="submit">Update Suggestion <Save/></Button>
                    <DialogClose asChild>
                        <Button variant={"destructive"}>Cancel <X/></Button>
                    </DialogClose>
                </div>
            </DialogFooter>
        </DialogContent>
    </Dialog>
}

function AddModsDialog({modpackReferenceIds, modificationReferenceIds, suggestion, modpack} : {modpackReferenceIds: string[] | null | undefined, modificationReferenceIds: string[], suggestion: Suggestion, modpack: Modpack}) {
    const {page, searchQuery, sortMethod} = Route.useSearch({
        select: (search) => ({
            page: search.page,
            searchQuery: search.searchQuery,
            sortMethod: search.sortMethod,
        })
    });
    const [isOpen, setOpen] = useState(false);
    const [sort, setSort] = useState<CurseForgeSearchFilter>(CurseForgeSearchFilter.Featured);
    const navigate = useNavigate({from: Route.fullPath});
    const queryClient = useQueryClient();
    const submitButtonRef = useRef(null);
    const searchModsInputRef = useRef(null);
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

    const handleSortChange = (newValue: CurseForgeSearchFilter) => {
        const submitButton = submitButtonRef.current as unknown as HTMLButtonElement;
        const searchModsInput = searchModsInputRef.current as unknown as HTMLInputElement;

        setSort(newValue);

        if(searchModsInput.value.length > 0) {
            submitButton.click();
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setOpen}>
            <DialogTrigger asChild>
            <Button variant="green">Add mods</Button>
            </DialogTrigger>
            <DialogContent className="flex-col items-center justify-center">
                <DialogHeader className="mt-4 text-center flex items-center justify-center">
                    <DialogTitle>Add mods</DialogTitle>
                    <DialogDescription className="max-w-9/10 text-center">Search for mods that are on curseforge to add for your suggestion!</DialogDescription>
                    <form className="w-full mt-4" method="post" id="addMods" onSubmit={handleSubmit}>
                        <div className="flex items-center justify-center gap-2 flex-wrap w-full">
                            <div className="flex items-center justify-center gap-2 w-full">
                                <div className="relative w-full">
                                    <Input id="searchQuery" type="text" name="searchQuery" placeholder="Search..." defaultValue={searchQuery} required className="text-sm w-full" ref={searchModsInputRef}/>
                                    <Button variant={"ghost"} type="submit" className="absolute right-0" ref={submitButtonRef}><Search/></Button>
                                </div>
                                <Select value={sort} onValueChange={handleSortChange}>
                                    <SelectTrigger className="">
                                        <SelectValue placeholder="Set sort method..."/>
                                    </SelectTrigger> 
                                    <SelectContent className="">
                                        <SelectGroup>     
                                            <SelectLabel>Sort</SelectLabel>
                                            <SelectItem className="cursor-pointer" value="0">Featured</SelectItem>
                                            <SelectItem className="cursor-pointer" value="1">Popularity</SelectItem>
                                            <SelectItem className="cursor-pointer" value="2">Total Downloads</SelectItem>
                                            <SelectItem className="cursor-pointer" value="3">Rating</SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </form>
                </DialogHeader>
                <DisplayContainer>
                    {pendingSearchResults ? (
                        <div className="size-full h-96 max-w-full flex items-center justify-center">
                            <Spinner className="size-20" />
                        </div>
                    ) : modSearchResults && modSearchResults.mods.length > 0 ? (
                        modSearchResults.mods.map((mod: CurseForgeMod) => {
                        let disabledMessage = "";

                        if (modificationReferenceIdSet.has(mod.referenceId)) {
                            disabledMessage = "This mod is already in your list of changes.";
                        } else if (modpackReferenceIdSet.has(mod.referenceId)) {
                            disabledMessage = "This mod is already in the modpack.";
                        }

                        return (
                            <CreateModificationDisplay
                            key={mod.referenceId}
                            curseforgeMod={mod}
                            modpack={modpack}
                            suggestion={suggestion}
                            modAction={ModAction.Added}
                            isEnabled={!disabledMessage}
                            modificationReferenceIds={modificationReferenceIds}
                            disabledMessage={disabledMessage}
                            />
                        );
                        })
                    ) : (
                        <div className="size-full flex items-center justify-center w-full h-96">
                        No search results
                        </div>
                    )}
                </DisplayContainer>
                <div>
                    <PaginationButtons paginationData={modSearchResults?.pagination} curPage={page}/>
                </div>
            </DialogContent>
        </Dialog>
    )
}

function RemoveModsDialog({modpackModData, modificationReferenceIds, suggestion, modpack} : {modpackModData: CurseForgeMod[] | null | undefined, modificationReferenceIds: string[], suggestion: Suggestion, modpack: Modpack}) {
    const [isOpen, setOpen] = useState(false);
    return (
        <Dialog open={isOpen} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="destructive">Remove mods</Button>
            </DialogTrigger>
            <DialogContent className="flex-col items-center justify-center">
                <DialogHeader className="mt-4 flex justify-center items-center">
                    <DialogTitle className="text-3xl font-bold">Remove mods</DialogTitle>
                    <DialogDescription className="max-w-9/10">Suggest mods to remove from the modpack. This list only contains mods that are in the latest version of the modpack this suggestion is tied to.</DialogDescription>
                </DialogHeader>
                  <Command className="flex flex-col justify-center items-center w-full gap-2 overflow-visible">
                    <div className="flex items-center justify-start w-full gap-1">
                        <ClearableCommandInput placeholder="Search..." />
                    </div>
                    <CommandList className="max-h-fit w-full">
                        <CommandEmpty>
                            <DisplayContainer className="flex items-center justify-center h-[300px]">
                                <h2>It's looking empty in here...</h2>
                            </DisplayContainer>
                        </CommandEmpty>
                            <CommandGroup className={`${!modpackModData || modpackModData.length <= 0 ? "hidden" : ""}`}>
                                <DisplayContainer>
                                    {(modpackModData && modpackModData.length > 0) && modpackModData.map((mod: CurseForgeMod, index: number) => {
                                        let isEnabled = true;
                                        let disabledMessage = "";
                                        modificationReferenceIds.forEach(referenceId => {
                                            if(referenceId === mod.referenceId) {
                                                isEnabled = false;
                                                disabledMessage = "This mod is already in your list of changes."
                                            }
                                        });
                                        return <CommandItem className="w-full p-0">     
                                            <CreateModificationDisplay 
                                                modificationReferenceIds={modificationReferenceIds} 
                                                suggestion={suggestion} 
                                                modpack={modpack} 
                                                curseforgeMod={mod} 
                                                key={index} 
                                                modAction={ModAction.Removed} 
                                                isEnabled={isEnabled} 
                                                disabledMessage={disabledMessage}
                                            />
                                        </CommandItem>
                                    })}
                                </DisplayContainer>
                            </CommandGroup>
                    </CommandList>
                </Command>
            </DialogContent>
        </Dialog>
    )
}

function VerifySuggestionDialog({suggestion, modificationReferenceIds} : {suggestion: Suggestion, modificationReferenceIds: string[]}) {
    const {modpackId, suggestionId} = Route.useParams();
    const [isOpen, setOpen] = useState(false);
    const queryClient = useQueryClient();
    
    const mutation = useMutation({
        mutationFn: async () => {
            const status = await verifySuggestion(suggestion.id, modpackId);

            if(!status || status < 200 || status > 299 ) {
                throw new Error("There was a problem with starting verification for your suggestion.");
            }
        },
        onSuccess: async () => {
            toast.success("Your suggestion is now undergoing verification!");
            setOpen(false);
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
            toast.error(error.message);
            console.error(error.message);
        }
    });

    return (
        <Dialog open={isOpen} onOpenChange={setOpen}>
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
                            <h2 className="font-bold text-xl px-4 py-2">Things to know about verification.</h2>
                            <Separator />
                            <div className="rounded-md px-4 py-2 flex flex-col items-center justify-start gap-4 text-left">
                                <p> 1. Verification of your suggestion happens automatically but may take some time.</p>
                                <p> 2. You cannot make changes to your suggestion while it's in a pending state.</p>
                                <p> 3. Once your suggestion is verified, the modpack owner will be able to merge your suggestion into the modpack.</p>
                                <p> 4. If you make changes to your suggestion after it has been verified, you will have to re-verify the suggestion again.</p>
                            </div>
                        </div>
                        <Separator />
                        <div className="flex flex-col items-start justify-center">
                            <h2 className="font-bold text-xl px-4 py-2">What happens during verification.</h2>
                            <Separator />
                            <div className="rounded-md px-4 py-2 flex flex-col items-center justify-start gap-4 text-left">
                                <p> 1. All missing required mod dependencies are resolved automatically by being added to your suggestion modification list.</p>
                                <p> 2. Any incompatible mods that are already in the modpack will be added to your modifications list as mods to be removed.</p>
                                <p> 3. Any conflicting modifications that are in your suggestion will automatically be deleted.</p>
                            </div>
                        </div>
                    </div>
                </div>
                <DialogFooter className="w-full px-2">
                    <div className="w-full flex flex-row justify-start items-center gap-2">
                        <Button variant={"default"} onClick={() => mutation.mutate()} disabled={mutation.isPending} type="submit">Begin Verification <Save/></Button>
                        <DialogClose asChild>
                            <Button variant={"destructive"}>Cancel <X/></Button>
                        </DialogClose>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default function SuggestionView() {
    const {modpackId, suggestionId} = Route.useParams();
    const [modificationFilter, setModificationFilter] = useState<ModificationFilter>(ModificationFilter.All);
    const {modpack: initialModpackData, suggestion: initialSuggestionData, curUser} = Route.useLoaderData();
    const navigate = useNavigate();
    const { data: modpack, isPending: modpackPending } = useQuery({
        queryFn: appQueries.modpack(modpackId).queryFn,
        queryKey: appQueries.modpack(modpackId).queryKey,
        initialData: initialModpackData,       
        refetchOnMount: true,        
    });
    const { data: suggestion, isPending: suggestionPending } = useQuery({
        queryFn: appQueries.suggestion(modpackId, suggestionId).queryFn,
        queryKey: appQueries.suggestion(modpackId, suggestionId).queryKey,
        initialData: initialSuggestionData,       
        refetchOnMount: true,        
    });
    
    const modpackModIds = useMemo(
        () => modpack?.versions[0].versionMods.map((versionMod: VersionMod) => versionMod.modId), 
        [modpack?.versions[0].versionMods]
    );

    const {data: modpackReferenceIds} = useQuery(appQueries.modReferenceIds(modpackModIds));
    const {data: modpackModData} = useQuery(appQueries.curseForgeModData(modpackReferenceIds));

    const modificationReferenceIds = useMemo(
        () => suggestion?.modifications.map(modification => modification.mod.referenceId),
        [suggestion?.modifications]
    );
    const {data: modificationModData, isPending: pendingModificationData} = useQuery(appQueries.modificationModData(suggestionId, modificationReferenceIds));

    const handleSelectValueChange = (newValue: ModificationFilter) => {
        setModificationFilter(newValue);
    }

    const filteredModifications = useMemo(() => {
        if (!suggestion?.modifications) return [];

        switch (modificationFilter) {
            case ModificationFilter.Added:
                return suggestion?.modifications.filter(
                    modification => modification.modAction === ModAction.Added
                );
            case ModificationFilter.Removed:
                return suggestion?.modifications.filter(
                    modification => modification.modAction === ModAction.Removed
                );
            case ModificationFilter.Conflicting:
                return suggestion?.modifications.filter(
                    modification => modification.conflictState !== ConflictState.NoConflicts
                );
            default:
                return suggestion?.modifications;
        }
    }, [suggestion?.modifications, modificationFilter]);

    if(modpackPending || suggestionPending) {
        return <Spinner />
    }

    if(!suggestion || !modpack || !modificationReferenceIds) {
        navigate({to: "/"});
        return;
    }

    useSuggestionSubscription(suggestion.modpackId, suggestion.id);

    return <section className="flex flex-col items-center max-w-full justify-center gap-4 p-2 min-md:min-w-2/4 min-md:max-w-3/4">
        <header className="flex flex-col justify-between items-center gap-6 min-md:flex-row min-md:gap-6">
            <div className="flex flex-col items-center justify-center gap-3 min-md:flex-row min-md:justify-between min-w-0">
                <img src={suggestion.user?.imageType === ImageType.Stock ? `/profileAvatars/${suggestion.user?.imageValue}` : suggestion.user?.imageValue} alt={"user profile picture"} className="bg-black border border-white/30 aspect-square w-28 h-28 md:w-40 md:h-40" />
                <div className="flex flex-col min-md:items-start items-center justify-center gap-3 min-w-0">
                    <h1 className="font-bold truncate w-full max-md:text-center leading-normal">{suggestion.username}'s suggestion</h1>
                    <h3 className="text-md line-clamp-2 text-center max-w-9/10 min-md:text-left min-md:line-clamp-3"> {suggestion.memo}</h3> 
                    <InfoPill>     
                        {
                            suggestion.state.toString() === SuggestionState.Unverified ?     
                            <div className="flex items-center justify-center gap-2 text-sm">
                                <CloudAlert className="text-red-500 size-4 min-md:size-6"/>
                                <p>This suggestion has not been verified.</p>
                            </div>
                            : suggestion.state.toString() === SuggestionState.VerificationPending ?
                            <div className="flex items-center justify-center gap-2 text-sm">
                                <CloudCog className="size-4 min-md:size-6 text-white"/>
                                <p>This suggestion is undergoing verification.</p>
                            </div>
                            : 
                            suggestion.state.toString() === SuggestionState.MergePending ?
                            <div className="flex items-center justify-center gap-2 text-sm">
                                <Merge className="size-4 min-md:size-6 text-white"/>
                                <p>This suggestion is being merged.</p>
                            </div>
                            :
                            <div className="flex items-center justify-center gap-2 text-sm">
                                <CloudCheck className="size-4 min-md:size-6 text-green-500"/>
                                <p>This suggestion has been verified.</p>
                            </div>
                        }
                    </InfoPill>
                </div>
            </div>
            {
                suggestion.userId === curUser?.id && curUser.emailVerified && 
                <div className="flex justify-center items-center gap-2 flex-wrap max-w-60">
                    <UpdateSuggestionDialog suggestion={suggestion} />
                    <VerifySuggestionDialog modificationReferenceIds={modificationReferenceIds} suggestion={suggestion} />
                    <AddModsDialog modpackReferenceIds={modpackReferenceIds} modificationReferenceIds={modificationReferenceIds} suggestion={suggestion} modpack={modpack} />
                    <RemoveModsDialog modpackModData={modpackModData} modificationReferenceIds={modificationReferenceIds} suggestion={suggestion} modpack={modpack} />
                    <DeleteSuggestionDialog modpack={modpack} suggestion={suggestion} />
                </div>
            }
        </header>

        {!curUser?.emailVerified && suggestion.userId === curUser?.id && <h3 className="text-sm text-center font-bold mt-4 max-w-3/4">In order to edit this suggestion, you must verify your email. <br /> <Link to="/profile/verify-email" className="underline">Click here to verify your email.</Link></h3>}

        <Separator className="my-2" />

        <section className="flex items-center justify-center gap-4 flex-col w-9/10">
            <h1 className="min-md:self-start">Modifications</h1>
            <Command className="flex flex-col justify-center items-center w-full gap-2 overflow-visible">
                <div className="flex items-center justify-start w-full gap-2">
                    <ClearableCommandInput placeholder="Search..." />
                    <div className="flex max-md:flex-col items-center justify-center">
                        <div className="flex items-center max-md:flex-col justify-center gap-2 z-1">
                            <div className="flex items-center justify-center gap-2">
                                <Select value={modificationFilter} onValueChange={handleSelectValueChange}>
                                    <SelectTrigger>
                                        <span className="text-sm">Filter:</span>
                                        <SelectValue placeholder="Filter modifications..."/>
                                        <Separator orientation="vertical"  className="h-full" />
                                    </SelectTrigger> 
                                    <SelectContent>
                                        <SelectGroup>     
                                            <SelectLabel>Select filter</SelectLabel>
                                            <SelectItem className="cursor-pointer" value={"0"}>All</SelectItem>
                                            <SelectItem className="cursor-pointer" value={"1"}>Added</SelectItem>
                                            <SelectItem className="cursor-pointer" value={"2"}>Removed</SelectItem>
                                            <SelectItem className="cursor-pointer" value={"3"}>Conflicting</SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                </div>
                <CommandList className="max-h-fit w-full">
                    <CommandEmpty className={pendingModificationData ? "hidden" : ""}>
                        <DisplayContainer className="flex items-center justify-center h-96">
                            <h2>It's looking empty in here...</h2>
                        </DisplayContainer>
                    </CommandEmpty>
                        <CommandGroup>
                            <DisplayContainer className={`${filteredModifications.length === 0 ? "hidden" : ""}`}>
                                {
                                    pendingModificationData ? (
                                        <div className="size-96 max-w-full flex items-center justify-center">
                                            <Spinner className="size-20" />
                                        </div>
                                    )
                                    :
                                    modificationModData && filteredModifications.map((modification) => {
                                        
                                        const modData = modificationModData.find(modData => modification.mod.referenceId === modData.referenceId);
                                        
                                        if(!modData) {
                                            return <div>Error fetching mod data for mod with id {modification.mod.referenceId}.</div>
                                        }

                                        return <CommandItem value={modData.name} key={modification.id} className="size-full p-0">
                                            <ModificationDisplay suggestion={suggestion} curUser={curUser} curseforgeMod={modData} modification={modification} modpack={modpack} modificationReferenceIds={modificationReferenceIds} />
                                        </CommandItem>
                                    })
                                }
                            </DisplayContainer>
                        </CommandGroup>
                </CommandList>
            </Command>
        </section>
    </section>
}
