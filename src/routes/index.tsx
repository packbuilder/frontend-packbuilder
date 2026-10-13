import LoginPrompt from '@/components/display/login-prompt';
import CreateMinecraftModpackDialog from '@/components/display/modpack/create-minecraft-modpack';
import ImportMinecraftModpackDialog from '@/components/display/modpack/import-minecraft-modpack';
import ModpackDisplay from '@/components/display/modpack/modpack-display';
import PaginationButtons from '@/components/display/paginationButtons';
import DisplayRadioGroup from '@/components/display/radio-display-buttons';
import ResultDisplay from '@/components/display/result-display';
import ResultFilterForm from '@/components/display/result-filter-form';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { appQueries } from '@/hooks/appQueries';
import { Game } from '@/types/enums';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { fallback, zodValidator } from '@tanstack/zod-adapter';
import { useState, type FormEvent } from 'react';
import z from "zod";

const searchParamSchema = z.object({
    display: fallback(z.enum(["modpacks", "bookmarks"]), "modpacks").default("modpacks"),
    modpacksPage: fallback(z.number(), 1).default(1),
    bookmarksPage: fallback(z.number(), 1).default(1),
    modpacksQuery: fallback(z.string(), "").default(""),
    bookmarksQuery: fallback(z.string(), "").default(""),
});

export const Route = createFileRoute("/")({
    validateSearch: zodValidator(searchParamSchema),
    loader: async ({context}) => {
        const { user: curUser } = context;

        return {curUser};
    },
    component: Home,
});

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
                { value: "modpacks", label: "Modpacks" },
                { value: "bookmarks", label: "Bookmarks" },
            ]} 
        /> 
  )
}

function Home() {
    const pageSize = 10;
    const { curUser } = Route.useLoaderData();
    const {display, modpacksPage, modpacksQuery, bookmarksPage, bookmarksQuery} = Route.useSearch({
        select: ({display, modpacksPage, bookmarksPage, modpacksQuery, bookmarksQuery}) => ({
            display,
            modpacksPage,
            bookmarksPage,
            modpacksQuery,
            bookmarksQuery
        })
    });
    const navigate = useNavigate();
    const [selectedGame, setGame] = useState<Game>(Game.Minecraft);
    
    const {data: minecraftVersions} = useQuery(appQueries.minecraftVersions());
    const {data: paginatedModpacks, isPending: pendingModpackData} = useQuery(appQueries.userModpacks(curUser?.id, modpacksPage, modpacksQuery, pageSize));
    const {data: paginatedBookmarks, isPending: pendingBookmarkData} = useQuery(appQueries.userBookmarks(curUser?.id, bookmarksPage, bookmarksQuery, pageSize));

    const userModpacks = paginatedModpacks?.items || [];
    const userBookmarks = paginatedBookmarks?.items || [];

    console.log(userModpacks.length, userBookmarks.length)

    const isEmpty = display === "modpacks" && userModpacks.length === 0 || display === "bookmarks" && userBookmarks.length === 0
    const isLoading = display === "modpacks" && pendingModpackData || display === "bookmarks" && pendingBookmarkData
    
    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const newSearchQuery = formData.get("searchQuery") as string;

        console.log(newSearchQuery)

        if(display === "modpacks") {
            navigate({search: (prev) => ({...prev, modpacksPage: 1, modpacksQuery: newSearchQuery}), resetScroll: false, from: Route.fullPath});
        } else {
            navigate({search: (prev) => ({...prev, bookmarksPage: 1, bookmarksQuery: newSearchQuery}), resetScroll: false, from: Route.fullPath});
        }
    }

    const handleModpackPageChange = (newPage: number) => {
        navigate({search: (prev) => ({...prev, modpacksPage: newPage}), resetScroll: false, from: Route.fullPath});
    }

    const handleBookmarkPageChange = (newPage: number) => {
        navigate({search: (prev) => ({...prev, bookmarksPage: newPage}), resetScroll: false, from: Route.fullPath});
    }

    const handleValueChange = (value: Game) => {
        setGame(value);
    }

    // TODO: Re-style home page for new paginated data
    return <section className="flex flex-col items-center justify-center p-2 w-full min-md:max-w-3/4 min-md:min-w-2/4">
        <div className="flex flex-col justify-between items-center w-full mx-auto h-full">
            <header className="flex flex-col justify-around items-center gap-4">
                <div className='flex items-center justify-center gap-2'>
                    <img className='displayImage' src="packbuilder-placeholder.png" />
                    <div className='flex-col justify-start items-center'>
                        <h1 className="text-3xl font-bold">Packbuilder</h1>
                        <h3>A collaborative modpack building tool.</h3>
                    </div>
                </div>
                
                <div className='flex items-center justify-center gap-2'>
                    <LoginPrompt curUser={curUser} />

                    {
                        !curUser || curUser.emailVerified && 
                        <div className='flex flex-col items-center justify-center gap-2 min-lg:flex-row'>
                            <Select defaultValue={selectedGame} onValueChange={handleValueChange}>
                                <SelectTrigger>
                                    <span className="text-sm">Game:</span>
                                    <SelectValue placeholder="Select game..."/>
                                    <Separator orientation="vertical"  className="h-full" />
                                </SelectTrigger> 
                                <SelectContent className="">
                                    <SelectGroup>     
                                        <SelectLabel>Sort</SelectLabel>
                                        <SelectItem className="cursor-pointer" value="0">Minecraft</SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>

                            {
                                selectedGame === Game.Minecraft &&
                                <>
                                    { minecraftVersions &&  <CreateMinecraftModpackDialog curUser={curUser} minecraftVersions={minecraftVersions}/>}
                                    <ImportMinecraftModpackDialog curUser={curUser} />
                                </>
                            }
                        </div>
                    }
                </div>
            </header>
            
            <Separator className='my-4 '/>

            <section className="flex items-center justify-center gap-4 flex-col w-19/20">
            
                <SelectDisplayRadioGroup />
    
                <div className="flexColumnContainer">
                    <div className="flex items-center justify-center w-full gap-1">
                        <ResultFilterForm handleSubmit={handleSubmit} />
                    </div>
                    <div className="w-full max-h-fit">
                        <ResultDisplay className='' isEmpty={isEmpty} isLoading={isLoading}>
                            {
                                display === "modpacks" ? (
                                    userModpacks.map((modpack) => {
                                        return <ModpackDisplay key={modpack.id + "modpacks"} modpack={modpack}/>
                                    })
                                ) : (
                                    userBookmarks.map((bookmark) => {
                                        return <ModpackDisplay key={bookmark.id + "bookmarks"} modpack={bookmark.modpack}/>
                                    })  
                                )
                            }
                        </ResultDisplay>
                    </div>
                </div>
    
                {
                    display === "modpacks" && paginatedModpacks && 
                    <PaginationButtons curPage={modpacksPage} totalPages={paginatedModpacks.totalPages} onPageChange={handleModpackPageChange} /> 
                } 
    
                {
                    display === "bookmarks" && paginatedBookmarks &&
                    <PaginationButtons curPage={bookmarksPage} totalPages={paginatedBookmarks.totalPages} onPageChange={handleBookmarkPageChange} />
                } 
            </section>
        </div>
    </section>
}
