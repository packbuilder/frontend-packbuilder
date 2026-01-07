import { Input } from "@/components/ui/input";
import { createModification, deleteModification, getCurseForgeModData, getModpack, getModReferenceIds, getSuggestion, searchCurseforgeMods, updateSuggestion, verifySuggestion } from "@/lib/api";
import type { VersionMod } from "@/types/versionMod";
import type { CurseForgeMod } from "@/types/curseforge/curseforgeMod";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, CloudAlert, CloudCheck, Edit, ExternalLink, Search, TriangleAlert, X, CloudCog } from "lucide-react";
import { useState, type FormEvent } from "react";
import type { CurseForgePagination } from "@/types/curseforge/curseforgePagination";
import { Select, SelectContent, SelectGroup, SelectTrigger, SelectValue, SelectItem } from "@/components/ui/select";
import { SelectLabel } from "@radix-ui/react-select";
import { Dialog , DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ModAction, type Modification } from "@/types/modification";
import { ModPlatform } from "@/types/mod";
import { createModificationDtoSchema } from "@/types/dtos/createModificationDto";
import { DialogDescription } from "@radix-ui/react-dialog";
import ToolbarTooltip from "@/components/toolbar-tooltip";
import { createFileRoute, Link, redirect, useNavigate, useRouter } from '@tanstack/react-router'
import { queryOptions, useMutation } from "@tanstack/react-query";
import { fallback, zodValidator } from '@tanstack/zod-adapter'
import z from "zod";
import placeholder from "@/Seed-Avatar.jpg"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const addModSearchSchema = z.object({
    page: fallback(z.number(), 0).default(0),
    sortMethod: fallback(z.enum(["0", "1", "2", "3"]), "0").default("0"),
    searchQuery: fallback(z.string(), "").default('')
});

export const Route = createFileRoute('/suggestion/$username/$slug/$suggestionId/edit')({
    validateSearch: zodValidator(addModSearchSchema),
    loaderDeps: ({search: {searchQuery, page, sortMethod}}) => ({
        searchQuery,
        page,
        sortMethod
    }),
    loader: async ({context: {user, queryClient}, params: {username, slug, suggestionId}, deps: {searchQuery, page, sortMethod}}) => {
        const suggestion = await queryClient.ensureQueryData(
            queryOptions({
                queryKey: ["suggestion", suggestionId],
                queryFn: () => getSuggestion(username, slug, suggestionId)
            })
        );

        const modpack = await queryClient.ensureQueryData(
            queryOptions({
                queryKey: ["modpack", slug],
                queryFn: () => getModpack(username, slug)
            })
        );
        
        if(!suggestion || !modpack || user?.id !== suggestion.userId) {
            throw redirect({to:"/"});
        }

        const modpackModIds = modpack.versions[0].versionMods.map((versionMod: VersionMod) => versionMod.modId);

        const modificationReferenceIds = suggestion.modifications.map(modification => modification.mod.referenceId);
        const modpackReferenceIds = await queryClient.ensureQueryData(
            queryOptions({
                queryKey: ["modpackReferenceIds", modpackModIds],
                queryFn: () => getModReferenceIds(modpackModIds)
            })
        );
        
        const modpackModData = await queryClient.ensureQueryData(
            queryOptions({
                queryKey: ["modpackModData", modpackReferenceIds],
                queryFn: () => getCurseForgeModData(modpackReferenceIds || [])
            })
        );

        const modificationModData = await queryClient.ensureQueryData(
            queryOptions({
                queryKey: ["modificationModData", suggestionId],
                queryFn: () => getCurseForgeModData(modificationReferenceIds)
            })
        );

        const modSearchResults = await queryClient.ensureQueryData(
            queryOptions({
                queryKey: ["modSearchResults", searchQuery, page, sortMethod],
                queryFn: () => searchCurseforgeMods(searchQuery, page, sortMethod)
            })
        );

        return {curUser: user, suggestion, modpack, modificationModData, modificationReferenceIds, modpackModData: modpackModData || [], queryClient, modSearchResults }
    },
    component: EditSuggestion,
});

function PaginationButtons({ paginationData, curPage } : { 
    paginationData: CurseForgePagination, 
    curPage: number, 
}) {
    const {resultCount, pageSize } = paginationData;
    const navigate = useNavigate({from: Route.fullPath});
    const router = useRouter();
    
    const nextPage = async () => {
        if(resultCount !== pageSize) {
            return;
        }
        await router.invalidate();
        navigate({search: (prev) => ({page: prev.page + 1, searchQuery: prev.searchQuery, sortMethod: prev.sortMethod})});
    }

    const previousPage = async () => {
        if(curPage - 1 < 0) {
            return;
        }
        await router.invalidate();
        navigate({search: (prev) => ({page: prev.page - 1, searchQuery: prev.searchQuery, sortMethod: prev.sortMethod})});
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

function EditMemoDropDown() {
    const {suggestion, queryClient} = Route.useLoaderData();
    const router = useRouter();
    const {username, slug, suggestionId} = Route.useParams();

    const mutation = useMutation({
        mutationFn: async (formData: FormData) => {
            const newMemo = formData.get("memo") as string;
            const updatedSuggestion = await updateSuggestion(username, slug, newMemo, suggestionId);
            if(!updatedSuggestion) {
                throw new Error("Problem with updating suggestion on backend");
            }
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ["suggestion", suggestionId],
                refetchType: "all",
            });
            await router.invalidate();
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

    return <Popover>
        <ToolbarTooltip content="Edit memo" side="bottom">
            <PopoverTrigger asChild>
                <Button variant={"default"}>
                    <Edit />
                </Button>
            </PopoverTrigger>
        </ToolbarTooltip>
        <PopoverContent className="p-2 bg-popover rounded-md">
            <div className="w-fit">
                <form id="editMemo" method="post" onSubmit={handleSubmit}>
                    <div className="flex flex-col justify-center items-center">
                        <h1>Edit memo</h1>
                        <div className="flex items-center justify-center">
                            <Input className="w-full"style={{background: "white", color: "black"}} placeholder="Your message..." defaultValue={suggestion.memo} id="memo" name="memo" required/>
                            <Button type="submit" variant={"default"}><Edit /></Button>
                        </div>
                    </div>
                </form>  
            </div>
        </PopoverContent>
    </Popover>
}

function CurseForgeModDisplay({curseforgeMod, modAction, isEnabled, disabledMessage} : {curseforgeMod: CurseForgeMod, modAction: "Add" | "Remove", isEnabled: boolean, disabledMessage: string}) {
    const {queryClient} = Route.useLoaderData();
    const {username, slug, suggestionId} = Route.useParams();
    const router = useRouter();

    const mutation = useMutation({
        mutationFn: async (formData: FormData) => {
            const modReferenceId = formData.get("modReferenceId") as string;
            const modAction = formData.get("modAction") as ModAction;
            const modPlatform = formData.get("modPlatform") as ModPlatform;
            const createModificationDto = createModificationDtoSchema.parse({modAction, modReferenceId, modPlatform});
            const modification = await createModification(username, slug, suggestionId, createModificationDto);

            if(!modification) {
                throw new Error("Problem with creating modification to add mod to suggestion list");
            }
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ["suggestion", suggestionId],
                refetchType: "all",
            });
            await queryClient.invalidateQueries({
                queryKey: ["modpack", slug],
                refetchType: "all"
            });
            await queryClient.invalidateQueries({
                queryKey: ["modificationModData", suggestionId],
                refetchType: "all"
            });
            await router.invalidate();
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

function ModificationDisplay({curseforgeMod, modification} : {curseforgeMod: CurseForgeMod, modification: Modification}) {
    const {queryClient} = Route.useLoaderData();
    const {username, slug, suggestionId} = Route.useParams();
    const router = useRouter();

    const mutation = useMutation({
        mutationFn: async (formData: FormData) => {
            const modificationId = formData.get("modificationId") as string;
            const deletedModification = await deleteModification(username, slug, modificationId, suggestionId);

            if(!deletedModification) {
                throw new Error("Problem with deleting modification");
            }
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ["suggestion", suggestionId],
                refetchType: "all",
            });
            await queryClient.invalidateQueries({
                queryKey: ["modificationModData", suggestionId],
                refetchType: "all"
            });
            await router.invalidate();
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
        <img src={curseforgeMod.logoUrl} className="size-20" alt="" />
        <h1 className="text-2xl">{curseforgeMod.name}</h1>
        <h1 className={`${modification.modAction === "Added" ? "bg-emerald-500" : "bg-red-500"} p-2`}>{modification.modAction}</h1>
        <ToolbarTooltip side="top" content="This modification is conflicting, delete it to resolve the conflict.">
            <Button className={`bg-yellow-400 hover:bg-yellow-400 ${modification.isConflicting ? "" : "hidden"}`}>
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
}

function AddModsDialog() {
    const {suggestion, queryClient, modSearchResults, modpackModData} = Route.useLoaderData();
    const {page, searchQuery, sortMethod} = Route.useSearch();
    const [sort, setSort] = useState("0");
    const navigate = useNavigate({from: Route.fullPath});
    const router = useRouter();

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const newSearchQuery = formData.get("searchQuery") as string;

        await queryClient.invalidateQueries({
            queryKey: ["modSearchResults", searchQuery, page, sortMethod],
            refetchType: "all"
        });

        await router.invalidate();

        navigate({search: () => ({page: 0, searchQuery: newSearchQuery, sortMethod: sort})})
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
            <Button variant="green">Add mods</Button>
            </DialogTrigger>
            <DialogContent 
                className="flex-col items-center justify-center"
                style={{
                    background:"rgba(255, 255, 255, 0.2)",
                    borderRadius: "16px",
                    boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
                    backdropFilter: "blur(12.1px)",
                    WebkitBackdropFilter: "blur(10px)",
                    border:" 1px solid rgba(255, 255, 255, 0.3)"
                }}
            >
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
                            {/* put error message here */}
                            <div>{}</div>
                        </div>
                    </form>
                    {
                        modSearchResults ? <div>
                            <PaginationButtons paginationData={modSearchResults.pagination} curPage={page}/>
                        </div> : ""
                    }
                </DialogHeader>
                <div className="flex flex-col justify-start items-start w-full border border-white dark:white flex flex-col h-96 w-96 overflow-y-auto overflow-x-clip w-[80%]">
                    {
                        modSearchResults && modSearchResults.mods.length > 0 ? 
                        modSearchResults?.mods.map((mod: CurseForgeMod, index: number) => {
                            let isEnabled = true;
                            let disabledMessage = "";

                            suggestion.modifications.forEach(modification => {
                                if(modification.mod.referenceId === mod.referenceId) {
                                    isEnabled = false;
                                    disabledMessage = "This mod is already in your list of changes."
                                }
                            });

                            modpackModData.forEach(({referenceId}) => {
                                if(referenceId === mod.referenceId) {
                                    isEnabled = false;
                                    disabledMessage = "This mod has already been added to the modpack."
                                }
                            });
                            
                            return <CurseForgeModDisplay curseforgeMod={mod} key={index} modAction="Add" isEnabled={isEnabled} disabledMessage={disabledMessage} />
                        })
                        :
                        <div className="size-full flex items-center justify-center">
                            No search results
                        </div>
                    }
                </div>
            </DialogContent>
        </Dialog>
    )
}

function RemoveModsDialog() {
    const {suggestion, modpackModData} = Route.useLoaderData();

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="destructive">Remove mods</Button>
            </DialogTrigger>
            <DialogContent 
                className="flex-col items-center justify-center"
                style={{
                    background:"rgba(255, 255, 255, 0.2)",
                    borderRadius: "16px",
                    boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
                    backdropFilter: "blur(12.1px)",
                    WebkitBackdropFilter: "blur(10px)",
                    border:" 1px solid rgba(255, 255, 255, 0.3)"
                }}
            >
                <DialogHeader className="mt-4 flex justify-center items-center">
                    <DialogTitle className="text-3xl font-bold">Remove mods</DialogTitle>
                    <DialogDescription>Suggest mods to remove from the modpack!</DialogDescription>
                </DialogHeader>
                <div className="flex flex-col items-center justify-center">
                    <div 
                        className="flex flex-col justify-start items-start max-w-5/6 w-fit border border-white flex flex-col overflow-y-auto overflow-x-clip h-96" 
                        style={{
                            background:"rgba(255, 255, 255, 0.2)",
                            borderRadius: "16px",
                            boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
                            backdropFilter: "blur(12.1px)",
                            WebkitBackdropFilter: "blur(5px)",
                            border:" 1px solid rgba(255, 255, 255, 0.3)"
                        }}
                    >
                        {modpackModData?.map((mod: CurseForgeMod, index: number) => {
                            let isEnabled = true;
                            let disabledMessage = "";
                            suggestion.modifications.forEach(modification => {
                                if(modification.mod.referenceId === mod.referenceId) {
                                    isEnabled = false;
                                    disabledMessage = "This mod is already in your list of changes."
                                    console.log(`Disabling ${mod.name} ${isEnabled}`)
                                }
                            });
                            return <CurseForgeModDisplay curseforgeMod={mod} key={index} modAction="Remove" isEnabled={isEnabled} disabledMessage={disabledMessage}/>
                        })}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}


export default function EditSuggestion() {
    const { suggestion, modificationModData, queryClient } = Route.useLoaderData();
    const {username, slug, suggestionId} = Route.useParams();
    const router = useRouter();

    const mutation = useMutation({
        mutationFn: async () => {
            const verifiedSuggestion = await verifySuggestion(suggestion.id, username, slug);

            if(!verifiedSuggestion) {
                throw new Error("Problem with verifying suggestion.");
            }
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ["suggestion", suggestionId],
                refetchType: "all",
            });
            await queryClient.invalidateQueries({
                queryKey: ["modificationModData", suggestionId],
                refetchType: "all"
            });
            await router.invalidate();
        },
        onError: (error) => {
            console.error(error.message);
        }
    });

    return <section className="pb-4">
        <header className="flex flex-col items-center justify-center gap-4">
            <img className="cursor-pointer border-white border-2 rounded-[50%] size-20" src={placeholder} alt="" />
            <div className="flex flex-col items-center justify-center gap-2">
                <div className="flex items-center justify-center gap-1">
                    <h1 className="text-xl font-bold">{suggestion.username + "'s Suggestion"}</h1>
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
                </div>
                <div className="flex items-center justify-center gap-2">
                    <p className="text-md">{suggestion.memo}</p> <EditMemoDropDown />
                </div>
            </div>
        </header>
        <div className="flex flex-col items-center justify-center">
            <section className="max-w-5/6 w-fit max-h-1/2 overflow-y-auto overflow-x-clip flex items-start flex-col gap-4 justify-center">
                <div className="flex flex-col justify-start items-start min-w-[300px] h-fit border w-1/2 border-black dark:border-gray-400 bg-gray-700 flex flex-col max-h-96 w-96 overflow-y-auto overflow-x-clip w-full">
                    {suggestion.modifications?.map((modification, index) => {
                        const modData = modificationModData?.find(modData => modification.mod.referenceId === modData.referenceId);

                        if(!modData) {
                            return <div>Error fetching mod data for modification</div>
                        }

                        return <ModificationDisplay curseforgeMod={modData} modification={modification} key={index} />;
                    })}
                </div>

                <div className="flex items-center justify-center gap-2 w-full">
                    <AddModsDialog />
                    <RemoveModsDialog />
                    <Button className="self-end" variant={"default"} onClick={() => mutation.mutate()}>
                        Check for conflicts <CloudCog />
                    </Button>
                </div>
            </section>
        </div>
    </section>
}