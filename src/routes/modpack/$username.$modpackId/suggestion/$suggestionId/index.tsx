import { Button } from "@/components/ui/button";
import { CloudAlert, CloudCheck, CloudCog, Merge, Search } from "lucide-react";
import { createFileRoute, Link, redirect, useNavigate } from '@tanstack/react-router'
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useRef, useState, type FormEvent } from "react";
import { appQueries } from "@/hooks/appQueries";
import { ConflictState, CurseForgeSearchFilter, ImageType, ModAction, SuggestionState } from "@/types/enums";
import DeleteSuggestionDialog from "@/components/suggestion/delete-suggestion-dialog";
import InfoPill from "@/components/display/info-pill";
import { Separator } from "@/components/ui/separator";
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { Spinner } from "@/components/ui/spinner";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreateCurseForgeModificationDisplay, CurseForgeModificationDisplay } from "@/components/display/curseforge/modification-display";
import { fallback, zodValidator } from "@tanstack/zod-adapter";
import z from "zod";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { CurseForgeMod } from "@/types/curseforge/curseforgeMod";
import type { Suggestion } from "@/types/suggestion";
import type { Modpack } from "@/types/modpack";
import ClearableCommandInput from "@/components/display/clearable-command-input";
import DisplayContainer from "@/components/display/display-container";
import { useSuggestionSubscription } from "@/hooks/useSuggestionSubscription";
import PaginationButtons, { CurseforgePaginationButtons } from "@/components/display/paginationButtons";
import ResultFilterForm from "@/components/display/result-filter-form";
import ResultsState from "@/components/display/result-state";
import UpdateSuggestionDialog from "@/components/display/suggestion/update-suggestion-dialog";
import VerifySuggestionDialog from "@/components/display/suggestion/verify-suggestion-dialog";
import { ConflictStateFilterSelect, ModActionFilterSelect } from "@/components/display/modification/modification-filter-display";
import ModificationResultDisplay from "@/components/display/modification/modification-results-display";

const addModSearchSchema = z.object({
    curseforgePage: fallback(z.number(), 0).default(0),
    modpackModsPage: fallback(z.number(), 0).default(1),
    modificationsPage: fallback(z.number(), 0).default(1),
    curseForgeSortMethod: fallback(z.enum(["0", "1", "2", "3"]), "0").default("0"),
    modActionFilter: fallback(z.enum(ModAction).nullable(), null).default(null),
    conflictStateFilter: fallback(z.enum(ConflictState).nullable(), null).default(null),
    searchQuery: fallback(z.string(), "").default('')
});

export const Route = createFileRoute('/modpack/$username/$modpackId/suggestion/$suggestionId/')({
    validateSearch: zodValidator(addModSearchSchema),
    loaderDeps: ({search: {searchQuery, curseforgePage, curseForgeSortMethod, modpackModsPage, modActionFilter, conflictStateFilter}}) => ({
        searchQuery,
        curseforgePage,
        modpackModsPage,
        curseForgeSortMethod,
        modActionFilter,
        conflictStateFilter
    }),
    loader: async ({context: {user, queryClient}, params}) => {
        const modpackId = parseInt(params.modpackId);
        const suggestionId = parseInt(params.suggestionId);
        const suggestion = await queryClient.ensureQueryData(appQueries.suggestion(modpackId, suggestionId));
        const modpack = await queryClient.ensureQueryData(appQueries.modpack(modpackId));
        
        if(!suggestion || !modpack) {
            throw redirect({to: "/"});
        }

        const breadcrumbs = [{text: modpack.name, link: `/modpack/${modpack.user.name}/${modpack.id}`}, {text: `${suggestion.user?.name}'s suggestion`, link: `/modpack/${modpack.user.name}/${modpack.id}/suggestion/${suggestion.id}`}]

        return { curUser: user, suggestion, modpack, breadcrumbs };
    },
    component: SuggestionView,
});

function AddModsDialog({modpackReferenceIds, modificationReferenceIds, suggestion, modpack} : {modpackReferenceIds: string[] | null | undefined, modificationReferenceIds: string[], suggestion: Suggestion, modpack: Modpack}) {
    const {curseforgePage, searchQuery, curseForgeSortMethod} = Route.useSearch({
        select: (search) => ({
            curseforgePage: search.curseforgePage,
            searchQuery: search.searchQuery,
            curseForgeSortMethod: search.curseForgeSortMethod,
            ...search
        })
    });
    const [isOpen, setOpen] = useState(false);
    const [sort, setSort] = useState<CurseForgeSearchFilter>(CurseForgeSearchFilter.Featured);
    const navigate = useNavigate({from: Route.fullPath});
    const queryClient = useQueryClient();
    const submitButtonRef = useRef(null);
    const searchModsInputRef = useRef(null);
    const {data: modSearchResults, isPending: pendingSearchResults} = useQuery(appQueries.curseForgeSearchResults(searchQuery, curseforgePage, curseForgeSortMethod, suggestion.gameVersion, suggestion.modLoader));

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
            queryKey: appQueries.curseForgeSearchResults(searchQuery, curseforgePage, curseForgeSortMethod, suggestion.gameVersion, suggestion.modLoader).queryKey,
        });

        navigate({search: (prev) => ({...prev, page: 0, searchQuery: newSearchQuery, curseForgeSortMethod: sort})})
    }

    const handleSortChange = (newValue: CurseForgeSearchFilter) => {
        const submitButton = submitButtonRef.current as unknown as HTMLButtonElement;
        const searchModsInput = searchModsInputRef.current as unknown as HTMLInputElement;

        setSort(newValue);

        if(searchModsInput.value.length > 0) {
            submitButton.click();
        }
    }

    const handlePageChange = (newPage: number) => {
        navigate({search: (prev) => ({...prev, curseforgePage: newPage})});
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
                                    <Input id="searchQuery" type="text" name="searchQuery" placeholder="Search for curseforge mods..." defaultValue={searchQuery} required className="text-sm w-full" ref={searchModsInputRef}/>
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
                            <CreateCurseForgeModificationDisplay
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
                    <CurseforgePaginationButtons curseforgePaginationData={modSearchResults?.pagination} curPage={curseforgePage} onPageChange={handlePageChange}/>
                </div>
            </DialogContent>
        </Dialog>
    )
}

// TODO: Update this components command display to the use backend pagination instead.
function RemoveModsDialog({curPage, totalPages, pendingData, modpackModData, modificationReferenceIds, suggestion, modpack} : {curPage: number, totalPages: number | undefined, pendingData: boolean, modpackModData: CurseForgeMod[] | null | undefined, modificationReferenceIds: string[], suggestion: Suggestion, modpack: Modpack}) {
    const [isOpen, setOpen] = useState(false);
    const navigate = useNavigate();

    const handlePageChange = (newPage: number) => {
        navigate({search: (prev) => ({...prev, modpackModsPage: newPage}), resetScroll: false, from: Route.fullPath});
    }

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
                        <ClearableCommandInput placeholder="Search current page..." />
                    </div>
                    <CommandList className="max-h-fit w-full">
                        {
                            pendingData ? (
                                <DisplayContainer>
                                    <div className="h-96 max-w-full flex items-center justify-center w-full">
                                        <Spinner className="size-20" />
                                    </div>
                                </DisplayContainer>
                            ) : (
                                <>
                                    <CommandEmpty>
                                        <DisplayContainer className="flex items-center justify-center h-[300px]">
                                            <h2>It's looking empty in here...</h2>
                                        </DisplayContainer>
                                    </CommandEmpty>
                                    <CommandGroup className={`${!modpackModData || modpackModData.length <= 0 ? "hidden" : ""}`}>
                                        <DisplayContainer>
                                            {
                                                (modpackModData && modpackModData.length > 0) && modpackModData.map((mod: CurseForgeMod, index: number) => {
                                                    let isEnabled = true;
                                                    let disabledMessage = "";
                                                    modificationReferenceIds.forEach(referenceId => {
                                                        if(referenceId === mod.referenceId) {
                                                            isEnabled = false;
                                                            disabledMessage = "This mod is already in your list of changes."
                                                        }
                                                    });
                                                    return <CommandItem className="w-full p-0">     
                                                        <CreateCurseForgeModificationDisplay 
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
                                                })
                                            }
                                        </DisplayContainer>
                                    </CommandGroup>
                                </>
                            )

                        }
                    </CommandList>
                </Command>
                <div>
                    {totalPages && <PaginationButtons curPage={curPage} totalPages={totalPages} onPageChange={handlePageChange}/> }
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default function SuggestionView() {
    const navigate = useNavigate();
    const {modpack: initialModpackData, suggestion: initialSuggestionData, curUser} = Route.useLoaderData();
    const params = Route.useParams();
    const modpackId = parseInt(params.modpackId);
    const suggestionId = parseInt(params.suggestionId);
    
    const {modificationsPage, modpackModsPage, searchQuery, modActionFilter: modActionFilterParam, conflictStateFilter: conflictStateFilterParam} = Route.useSearch({
        select: (search) => ({
            modpackModsPage: search.modpackModsPage,
            modActionFilter: search.modActionFilter,
            conflictStateFilter: search.conflictStateFilter,
            searchQuery: search.searchQuery,
            modificationsPage: search.modificationsPage
        })
    });

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

    const [modActionFilter, setModActionFilter] = useState<ModAction | null>(modActionFilterParam);
    const [conflictStateFilter, setConflictStateFilter] = useState<ConflictState | null>(conflictStateFilterParam);

    const versionIteration = useMemo(() => {
        return modpack?.versions[0].iterations;
    }, [modpack?.versions[0]]);

    const { data: paginatedModifications, isPending: pendingModifications } = useQuery({
        queryFn: appQueries.suggestionModifications(modpackId, suggestionId, modificationsPage, searchQuery, modActionFilter ?? undefined, conflictStateFilter ?? undefined).queryFn,

        queryKey: appQueries.suggestionModifications(modpackId, suggestionId, modificationsPage, searchQuery, modActionFilter ?? undefined, conflictStateFilter ?? undefined).queryKey,

        placeholderData: keepPreviousData
    });
    
    const {data: paginatedVersionMods, isPending: pendingVersionMods} = useQuery(appQueries.versionMods(modpackId, versionIteration?.toString(), modpackModsPage, searchQuery));

    const modpackReferenceIds = useMemo(
        () => paginatedVersionMods?.items.map(versionMod => {
            return versionMod.mod.referenceId;
        }),
        [paginatedVersionMods?.items]
    );

    const modificationReferenceIds = useMemo(
        () => paginatedModifications?.items.map(modification => modification.mod.referenceId),
        [suggestion?.modifications]
    );

    const {data: modpackModData, isPending: pendingModData} = useQuery(appQueries.curseForgeModData(modpackReferenceIds));

    const {data: modificationModData, isPending: pendingModificationModData} = useQuery(appQueries.modificationModData(suggestionId, modificationReferenceIds));

    const handleModActionFilterChange = (newValue: ModAction | "All") => {
        setModActionFilter(newValue === "All" ? null : newValue);
    }

    const handleConflictStateFilterChange = (newValue: ConflictState | "All") => {
        setConflictStateFilter(newValue === "All" ? null : newValue);
    }

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const newSearchQuery = formData.get("searchQuery") as string;

        navigate({search: () => ({page: 1, searchQuery: newSearchQuery, conflictStateFilter, modActionFilter}), resetScroll: false, from: Route.fullPath});
    }

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
                    <h1 className="font-bold truncate w-full max-md:text-center leading-normal">{suggestion.user?.name}'s suggestion</h1>
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
                    <UpdateSuggestionDialog modpack={modpack} suggestion={suggestion} />
                    <VerifySuggestionDialog modpack={modpack} modificationReferenceIds={modificationReferenceIds} suggestion={suggestion} />
                    <AddModsDialog modpackReferenceIds={modpackReferenceIds} modificationReferenceIds={modificationReferenceIds} suggestion={suggestion} modpack={modpack} />
                    <RemoveModsDialog curPage={modpackModsPage} totalPages={paginatedVersionMods?.totalPages} pendingData={pendingVersionMods || pendingModData} modpackModData={modpackModData} modificationReferenceIds={modificationReferenceIds} suggestion={suggestion} modpack={modpack} />
                    <DeleteSuggestionDialog modpack={modpack} suggestion={suggestion} />
                </div>
            }
        </header>

        {!curUser?.emailVerified && suggestion.userId === curUser?.id && <h3 className="text-sm text-center font-bold mt-4 max-w-3/4">In order to edit this suggestion, you must verify your email. <br /> <Link to="/profile/verify-email" className="underline">Click here to verify your email.</Link></h3>}

        <Separator className="my-2" />

        <section className="flex items-center justify-center gap-4 flex-col w-9/10">
            <h1 className="min-md:self-start">Modifications</h1>
            <div className="flex flex-col justify-center items-center w-full gap-2 overflow-visible">
                <div className="flex items-center justify-start w-full gap-2">
                    <ResultFilterForm handleSubmit={handleSubmit}>
                        <ModActionFilterSelect modActionFilter={modActionFilter} handleModActionFilterChange={handleModActionFilterChange} />
                        <ConflictStateFilterSelect conflictStateFilter={conflictStateFilter} handleConflictStateFilterChange={handleConflictStateFilterChange}/>
                    </ResultFilterForm>
                </div>
                <div className="max-h-fit w-full">
                        <ResultsState isEmpty={paginatedModifications?.items.length === 0 || modificationModData?.length === 0} isLoading={pendingModifications || pendingModificationModData}>
                            <ModificationResultDisplay paginatedModifications={paginatedModifications} modificationModData={modificationModData} modificationReferenceIds={modificationReferenceIds} suggestion={suggestion} curUser={curUser} modpack={modpack} />
                        </ResultsState>
                </div>
            </div>
        </section>
    </section>
}
