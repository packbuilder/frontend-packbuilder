import { Bookmark, Gamepad } from "lucide-react";
import { createBookmark, deleteBookmark, getBookmark } from "@/lib/api";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/display/copy-button";
import type { VersionMod } from "@/types/versionMod";
import { createFileRoute, Link, redirect, useLocation, useNavigate } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { appQueries } from "@/hooks/appQueries";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { enumNameFromValue } from "@/lib/utils";
import { ImageType, ModLoader, SuggestionState } from "@/types/enums";
import type { Modpack } from "@/types/modpack";
import type { User } from "@/types/user";
import { CurseForgeModResults } from "@/components/display/curseforge/mod-display";
import { fallback, zodValidator } from "@tanstack/zod-adapter";
import z from "zod";
import { useModpackSubscription } from "@/hooks/useModpackSubscribtion";
import type { Version } from "@/types/version";
import PaginationButtons from "@/components/display/paginationButtons";
import ResultsState from "@/components/display/result-state";
import SuggestionFilterSelect from "@/components/display/suggestion/suggestion-filter-select";
import { DownloadCurseForgeManifestDialog } from "@/components/display/curseforge/download-modpack-manifest";
import { ModpackSettingsDropDown } from "@/components/display/modpack/modpack-settings-dropdown";
import CreateSuggestionDialog from "@/components/suggestion/create-suggestion-dialog";
import ResultFilterForm from "@/components/display/result-filter-form";
import SuggestionDisplay from "@/components/suggestion/suggestion-display";
import DisplayRadioGroup from "@/components/display/radio-display-buttons";

const searchParamSchema = z.object({
    display: fallback(z.enum(["mods", "suggestions"]), "mods").default("mods"),
    modsPage: fallback(z.number(), 1).default(1),
    suggestionsPage: fallback(z.number(), 1).default(1),
    modsQuery: fallback(z.string(), "").default(""),
    suggestionsQuery: fallback(z.string(), "").default(""),
    suggestionFilter: fallback(z.enum(SuggestionState).nullable(), null).default(null)
});

export const Route = createFileRoute('/modpack/$username/$modpackId/')({
    validateSearch: zodValidator(searchParamSchema),
    loaderDeps: ({search: {display, modsPage, suggestionsPage, modsQuery, suggestionsQuery, suggestionFilter}}) => ({
        display,
        modsPage,
        suggestionsPage,
        modsQuery,
        suggestionsQuery,
        suggestionFilter
    }),
  loader: async ({context, params}) => {
    const {user, queryClient} = context;
    const modpackId = parseInt(params.modpackId);

    const modpack = await queryClient.ensureQueryData(appQueries.modpack(modpackId))
 
    if(!modpack) {
        throw redirect({to: "/"});
    }
    
    const minecraftVersions = await queryClient.ensureQueryData(appQueries.minecraftVersions());
    const suggestions = await queryClient.ensureQueryData(appQueries.modpackSuggestions(modpackId, 1));
    const modIds = modpack.versions[0]?.versionMods.map((versionMod: VersionMod) => versionMod.modId);
    const referenceIds = await queryClient.ensureQueryData(appQueries.modReferenceIds(modIds));
    const modData = await queryClient.ensureQueryData(appQueries.modpackModData(referenceIds));
    const userBookmarked = await queryClient.ensureQueryData({
        queryKey: ["bookmark", modpackId],
        queryFn: () => getBookmark(modpack.id)
    })

    const breadcrumbs = [{text: modpack.name, link: `/modpack/${modpack.user.name}/${modpack.id}`}];

    return {curUser: user, modpack, queryClient, modData, minecraftVersions, suggestions, userBookmarked, breadcrumbs}
  },
  component: ModpackView,
})

function BookmarkModpackButton({modpack, curUser} : {modpack: Modpack, curUser: User}) {
    const {userBookmarked} = Route.useLoaderData();
    const [isBookmarked, setIsBookmarked] = useState(userBookmarked ? true : false);
    const [isClicked, setIsClicked] = useState(false);
    const queryClient = useQueryClient();

    const {data: bookmark} = useSuspenseQuery({
        queryKey: ["bookmark", `${modpack.id} ${curUser.id}`],
        queryFn: () => getBookmark(modpack.id)
    });

    useEffect(() => {
        if(bookmark) {
            setIsBookmarked(true);
        }
    }, [bookmark])


    const handleClick = () => {
        if(!isClicked) {
            mutation.mutate();
            setIsClicked(true);
        }
    }
    const mutation = useMutation({
        mutationFn: async () => {
            const status = isBookmarked ? await deleteBookmark(modpack.id) : await createBookmark(modpack.id)
            setIsClicked(false);
            
            if(!status || status < 200 || status > 300) {
                throw new Error(isBookmarked ? "Unable to un-bookmark this modpack." : "Unable to bookmark this modpack.");
            }
            
            setIsBookmarked(!isBookmarked);
        },
        onSuccess: async () => {            
            await queryClient.invalidateQueries({
                queryKey: appQueries.keys.userBookmarks(curUser.id),
                refetchType: "all"
            });
        },
        onError: (error: Error) => {
            console.log(error.message);
        }
    });

    return (
        <Button onClick={handleClick} disabled={mutation.isPending} variant={isBookmarked ? "default" : "outline"}>{isBookmarked ? <Bookmark className="fill-current" /> : <Bookmark />}</Button>
    )
}

function SelectDisplayRadioGroup() {
    const navigate = useNavigate({from: Route.fullPath});
    const {display} = Route.useSearch({
        select: ({display}) => ({
            display
        })
    });

    const handleValueChange = (newValue: string) => {
        navigate({search: (prev) => ({...prev, display: newValue}), resetScroll: false});
    }

    return (
        <DisplayRadioGroup  
            value={display} 
            onValueChange={handleValueChange}
            options={[
                { value: "mods", label: "Mods" },
                { value: "suggestions", label: "Suggestions" },
            ]} 
        /> 
    )
}

function ModpackVersionSelect({modpack, versionIteration, handleValueChange} : {modpack: Modpack, versionIteration: string, handleValueChange: (newValue: string) => void}) {
    return (
        <Select value={versionIteration} onValueChange={handleValueChange}>
            <SelectTrigger>
                <span className="text-sm">Version:</span>
                <SelectValue placeholder="Select modpack version..."/>
                <Separator orientation="vertical"  className="h-full" />
            </SelectTrigger> 
            <SelectContent>
                <SelectGroup>     
                    <SelectLabel>Select modpack version</SelectLabel>
                    {
                        modpack.versions.map((version, index) => {
                            return <SelectItem className="cursor-pointer" key={index} value={version.iterations.toString()}>
                                {version.iterations}
                            </SelectItem>
                        })
                    }
                </SelectGroup>
            </SelectContent>
        </Select>
    )
}

export default function ModpackView() {
    const { curUser } = Route.useLoaderData();
    const { pathname } = useLocation();
    const {modpackId} = Route.useParams();
    const navigate = useNavigate();
    const {data: modpack} = useSuspenseQuery(appQueries.modpack(parseInt(modpackId)));
    
    const {display, modsPage, suggestionsPage, modsQuery, suggestionsQuery, suggestionFilter: suggestionFilterParam} = Route.useSearch({
        select: ({display, modsPage, suggestionsPage, suggestionFilter, modsQuery, suggestionsQuery}) => ({
            display,
            modsPage,
            suggestionsPage,
            suggestionFilter,
            modsQuery,
            suggestionsQuery
        })
    });

    if(!modpack) {
        navigate({to: "/"});
        return;
    }

    const [versionIteration, setVersionIteration] = useState(modpack.versions[0].iterations.toString());
    const [displayedVersion, setDisplayedVersion] = useState(modpack.versions[0]);
    const [suggestionFilter, setSuggestionFilter] = useState<SuggestionState | null>(suggestionFilterParam);
    
    const {data: paginatedSuggestions, isPending: pendingSuggestions } = useQuery(appQueries.modpackSuggestions(modpack.id, suggestionsPage, suggestionsQuery, suggestionFilter ?? undefined));

    const {data: paginatedVersionMods, isPending: pendingVersionMods } = useQuery(appQueries.modpackVersionMods(modpack.id, versionIteration, modsPage, modsQuery));

    const referenceIds = useMemo(
        () => paginatedVersionMods?.items.map(versionMod => {
            return versionMod.mod.referenceId;
        }),
        [paginatedVersionMods?.items]
    );

    const {data: curseForgeModData, isPending: pendingModData} = useQuery(appQueries.modpackModData(referenceIds));

    const isLoading = display === "mods" ? pendingModData || pendingVersionMods : pendingSuggestions;

    const isEmpty = display === "mods" ? paginatedVersionMods?.items.length === 0 : paginatedSuggestions?.items.length === 0;

    const handleVersionChange = (newValue: string) => {
        const newVersion = modpack.versions.find(version => version.iterations.toString() === newValue);
        if(!newVersion) {
            console.error("Problem with changing versions");
            return;
        }
        setVersionIteration(newValue);
        setDisplayedVersion(newVersion);
        
        navigate({search: (prev) => ({...prev, modsPage: 1}), resetScroll: false, from: Route.fullPath});
    }

    const handleFilterChange = (newValue: "All" | SuggestionState) => {
        setSuggestionFilter(newValue === "All" ? null : newValue)
    }

    const handleModsPageChange = (newPage: number) => {
        navigate({search: (prev) => ({...prev, modsPage: newPage}), resetScroll: false, from: Route.fullPath});
    } 

    const handleSuggestionsPageChange = (newPage: number) => {
        navigate({search: (prev) => ({...prev, suggestionsPage: newPage}), resetScroll: false, from: Route.fullPath});
    }

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const newSearchQuery = formData.get("searchQuery") as string;

        if(display === "mods") {
            navigate({search: (prev) => ({...prev, modsPage: 1, modsQuery: newSearchQuery}), resetScroll: false, from: Route.fullPath});
        } else {
            navigate({search: (prev) => ({...prev, suggestionsPage: 1, suggestionsQuery: newSearchQuery, suggestionFilter}), resetScroll: false, from: Route.fullPath});
        }
    }

    // Display latest version if modpack versions is updated via a merge
    useEffect(() => {
        let curLatest: null | Version = null;

        for (let i = 0; i < modpack.versions.length; i++) {
            const version = modpack.versions[i];

            if(!curLatest || version.iterations > curLatest.iterations) {
                curLatest = version;
            }
        }

        if(curLatest) {
            setVersionIteration(curLatest.iterations.toString());
            setDisplayedVersion(curLatest);
            navigate({search: () => ({page: 1, display: display}), resetScroll: false, from: Route.fullPath});
        }
        
    }, [modpack.versions])

    useModpackSubscription(modpack.id);

    return <section className="flex flex-col items-center justify-center p-2 w-full min-md:max-w-3/4 min-md:min-w-2/4">
        <header className="flex flex-col justify-between items-center gap-3 min-md:flex-row min-md:gap-6">
            <div className="flex flex-col items-center justify-center gap-3 min-md:flex-row min-md:justify-between">
                <img src={modpack.imageType === ImageType.Stock ? `/modpackAvatars/${modpack.imageValue}` : modpack.imageValue} alt="Modpack logo" className="bg-black border border-white/30 aspect-square w-28 h-28 md:w-40 md:h-40" />
                <div className="flex flex-col min-md:items-start items-center justify-center min-md:max-w-3/4 w-full min-w-0">
                    <h1 className="font-bold w-full truncate leading-normal max-md:text-center">{modpack.name}</h1>
                    <h3 className="leading-normal">
                        Created by 
                        <Link to="/profile/$username/$userId" className="underline font-bold" params={{username: modpack.user.name, userId:modpack.userId}}>
                            {modpack.user.name}
                        </Link>
                    </h3>
                    <div className="flex justify-center items-center text-lg gap-1 mt-2 h-5 font-bold">
                        <Gamepad className="text-[var(--text-secondary)]" />
                        <h3 className="text-[var(--text-secondary)]">
                            {enumNameFromValue(ModLoader,displayedVersion.modLoader.toString())} 
                        </h3>
                        <h3 className="text-[var(--text-secondary)]">
                            {displayedVersion.gameVersion}
                        </h3>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-center gap-2 flex-wrap max-w-60">
                <DownloadCurseForgeManifestDialog modpackId={modpack.id} versionIteration={versionIteration} />

                {curUser && curUser.emailVerified && <CreateSuggestionDialog modpack={modpack} curUser={curUser} /> }

                <div className="flex items-center justify-center gap-2">
                    { curUser && <BookmarkModpackButton modpack={modpack} curUser={curUser} /> }

                    <CopyButton text={import.meta.env.VITE_FRONTENDURL ? import.meta.env.VITE_FRONTENDURL + pathname : "https://packbuilder.org" + pathname} side="bottom"/>

                    { curUser?.id === modpack.userId && curUser.emailVerified && <ModpackSettingsDropDown modpack={modpack} userData={curUser} /> }
                </div>
            </div>
        </header>

        {
            curUser && curUser.emailVerified === false && 
            <h3 className="text-sm text-center font-bold mt-4 max-w-3/4">
                In order to create suggestions or edit this modpack, you must verify your email. 
                <br /> 
                <Link to="/profile/verify-email" className="underline">Click here to verify your email.</Link>
            </h3>
        }

        {
            !curUser && 
            <h3 className="text-sm text-center font-bold mt-4 max-w-3/4">
                In order to create suggestions or edit this modpack, you must be logged into a verified account.
                <br />
                <Link to="/login" className="underline">Click here to login</Link>
            </h3>
        }

        <Separator className="my-4"/>
        
        <section className="flex items-center justify-center gap-4 flex-col w-19/20">

            <SelectDisplayRadioGroup />

            <div className="flex flex-col justify-center items-center w-full h-fit gap-2 overflow-visible">
                <div className="flex items-center justify-center w-full gap-1">
                    <ResultFilterForm handleSubmit={handleSubmit}>
                        {
                            display === "mods" ? 
                            <ModpackVersionSelect modpack={modpack} versionIteration={versionIteration} handleValueChange={handleVersionChange} />
                            : 
                            <SuggestionFilterSelect suggestionFilter={suggestionFilter} handleFilterChange={handleFilterChange} />
                        }
                    </ResultFilterForm>
                </div>
                <div className="w-full max-h-fit">
                    <ResultsState isEmpty={isEmpty} isLoading={isLoading}>
                        {
                            display === "mods" ? (
                                <CurseForgeModResults versionModData={curseForgeModData}  paginatedVersionMods={paginatedVersionMods}/>
                            ) : (
                                  paginatedSuggestions!.items.map((suggestion, index) => {
                                    return <div key={index} className="size-full max-w-full p-0">
                                        <SuggestionDisplay suggestion={suggestion} modpack={modpack} curUser={curUser} />
                                    </div>
                                })  
                            )
                        }
                    </ResultsState>
                </div>
            </div>

            {
                display === "mods" && paginatedVersionMods &&
                <PaginationButtons curPage={modsPage} totalPages={paginatedVersionMods.totalPages} onPageChange={handleModsPageChange} /> 
            } 

            {
                display === "suggestions" && paginatedSuggestions &&
                <PaginationButtons curPage={suggestionsPage} totalPages={paginatedSuggestions.totalPages} onPageChange={handleSuggestionsPageChange} />
            }
        </section>

    </section>
}
