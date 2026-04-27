import { BadgeCheck, Bookmark, BookmarkCheck, BookmarkIcon, Check, Download, Edit, ExternalLink, Gamepad, Gamepad2Icon, LogOut, Save, Settings, Trash2, TriangleAlert, Users, X } from "lucide-react";
import modpackImage from "@/modpack.gif";
import { createBookmark, deleteBookmark, deleteModpack, getBookmark, getModpackVersionManifest, updateModpack } from "@/lib/api";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/copy-button";
import { Input } from "@/components/ui/input";
import type { VersionMod } from "@/types/versionMod";
import BreadCrumbLink from "@/components/breadcrumb-link";
import { createFileRoute, redirect, useLoaderData, useLocation, useNavigate, useRouter } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { appQueries } from "@/hooks/appQueries";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { enumNameFromValue } from "@/lib/utils";
import { ConflictState, ModLoader, SuggestionFilter, SuggestionState } from "@/types/enums";
import { Spinner } from "@/components/ui/spinner";
import { DialogHeader, Dialog, DialogContent, DialogTitle, DialogTrigger, DialogFooter  } from "@/components/ui/dialog";
import { DialogClose, DialogDescription } from "@radix-ui/react-dialog";
import CreateSuggestionDialog from "@/components/suggestion/create-suggestion-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@radix-ui/react-avatar";
import type { Modpack } from "@/types/modpack";
import type { User } from "@/types/user";
import { VersionModDisplay } from "@/components/modpack/mod-display";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Field, FieldContent, FieldDescription, FieldLabel, FieldTitle } from "@/components/ui/field";
import { fallback, zodValidator } from "@tanstack/zod-adapter";
import z from "zod";
import SuggestionCard from "@/components/suggestion/suggestion-display";
import SuggestionInteractive from "@/components/suggestion/suggestion-display";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import ClearableCommandInput from "@/components/clearable-command-input";
import DisplayContainer from "@/components/display-container";
import { useModpackSubscription } from "@/hooks/useModpackSubscribtion";

const dataDisplaySchema = z.object({
    display: fallback(z.enum(["mods", "suggestions"]), "mods").default("mods"),
});

export const Route = createFileRoute('/modpack/$username/$modpackId/')({
    validateSearch: zodValidator(dataDisplaySchema),
    loaderDeps: ({search: {display}}) => ({
        display
    }),
  loader: async ({context, params}) => {
    const {user, queryClient} = context;
    const {modpackId} = params;

    const modpack = await queryClient.ensureQueryData(appQueries.modpack(modpackId))
 
    if(!modpack) {
        throw redirect({to: "/"});
    }
    
    const minecraftVersions = await queryClient.ensureQueryData(appQueries.minecraftVersions());
    const suggestions = await queryClient.ensureQueryData(appQueries.modpackSuggestions(modpackId));
    const modIds = modpack.versions[0]?.versionMods.map((versionMod: VersionMod) => versionMod.modId);
    const referenceIds = await queryClient.ensureQueryData(appQueries.modReferenceIds(modIds));
    const modData = await queryClient.ensureQueryData(appQueries.curseForgeModData(referenceIds));
    const userBookmarked = await queryClient.ensureQueryData({
        queryKey: ["bookmark", modpackId],
        queryFn: () => getBookmark(modpack.id.toString())
    })

    return {curUser: user, modpack, queryClient, modData, minecraftVersions, suggestions, userBookmarked}
  },
  component: ModpackView,
})

function RenameModpackDialog({curName} : {curName: string}) {
    const {curUser} = Route.useLoaderData();
    const queryClient = useQueryClient();
    const router = useRouter();
    const {modpackId} = Route.useParams();
    const [isOpen, setIsOpen] = useState(false);
    const inputRef = useRef<null | HTMLInputElement>(null);

    const mutation = useMutation({
        mutationFn: async (formData: FormData) => {
            const newName = formData.get("newName") as string;
            const status = await updateModpack(modpackId, {name: newName});

            if(!status || status < 200 || status > 200) {
                throw new Error("Problem with updating modpack name");
            }
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: appQueries.modpack(modpackId).queryKey,
                refetchType: "all"
            });
            await queryClient.invalidateQueries({
                queryKey: appQueries.userModpacks(curUser).queryKey,
                refetchType: "all"
            });
            await router.invalidate({sync: true});
        },
        onError: (error: Error) => {
            console.log(error.message);
        }
    });

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        mutation.mutate(formData);
    }
    
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger>
                <p className="text-left flex items-center justify-center gap-2 font-normal"><Edit/> Rename modpack</p>
            </DialogTrigger>
            <DialogContent className="p-4 bg-popover rounded-md z-100" onOpenAutoFocus={(e) => {
                e.preventDefault()
                inputRef.current?.focus()
            }}>
                <DialogHeader className="w-full px-2">
                    <DialogTitle className="text-xl">Rename modpack</DialogTitle>
                    <Separator />
                </DialogHeader>
                <div className="w-fit flex flex-col gap-2">
                    <form onSubmit={handleSubmit} className="flex justify-center items-center gap-2">
                        <Input ref={inputRef} type="text" name="newName" id="newName" defaultValue={curName}/>
                        <Button type="submit" variant={"default"}>Save <Save/></Button>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    )
}

function DownloadModpackManifestDialog({modpackId, versionIteration} : {modpackId: string, versionIteration: string}) {
    const [isOpen, setIsOpen] = useState(false);
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
    const downloadRef = useRef<HTMLAnchorElement | null>(null);

    const mutation = useMutation({
        mutationFn: async () => {
            const manifest = await getModpackVersionManifest(modpackId, versionIteration);

            if(!manifest) {
                throw new Error("Unable to download manifest.json");
            }

            return manifest;
        },
        onSuccess: async (manifest: Blob) => {
            const url = URL.createObjectURL(manifest);
            setDownloadUrl(url);
        },
        onError: (error: Error) => {
            console.log(error.message);
        }
    });

    useEffect(() => {
        if (downloadUrl && downloadRef.current) {
            downloadRef.current.click();

            setTimeout(() => {
                URL.revokeObjectURL(downloadUrl);
                setDownloadUrl(null);
                setIsOpen(false);
            }, 100);
        }
    }, [downloadUrl]);

    return <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
            <Button variant={"default"}><h3 className="hidden min-md:flex">Download</h3> <Download /></Button>
        </DialogTrigger>
        <DialogContent aria-describedby="" showCloseButton={false} className="flex flex-col justify-center items-center">
            {downloadUrl && (
                <a
                    ref={downloadRef}
                    href={downloadUrl}
                    download="manifest.zip"
                    className="hidden"
                />
            )}
            <DialogHeader className="w-full px-2">
                <DialogTitle className="text-xl text-left">How to import your modpack to curseforge.</DialogTitle>
            </DialogHeader>
             <div className="flex items-center flex-col justify-center text-md">
                <div className="flex flex-col items-start justify-center">
                    <div className="rounded-md px-4 py-2 gap-4 text-left flex border flex-col justify-start items-start w-full flex flex-col h-96 w-96 overflow-y-auto w-[80%]">
                        <p>1. Launch the CurseForge app and make sure the Minecraft profile is selected.</p>
                        <p>2. Click “Minecraft” in the top menu and switch to the “Modpacks” section.</p>
                        <p>3. On the right side, look for “Add Modpack” or “Import Modpack” (wording may vary depending on version) and then select “Import from ZIP”.</p>
                        <p>4. Navigate to the ZIP file you downloaded (it should be named manifest.zip). Select it and click Open.</p>
                        <p>5. Curseforge should then create a new profile and download all of your mods, once that's finished you can then launch your modpack!</p>
                    </div>
                </div>
            </div>
            <DialogFooter className="w-full px-2">
                <div className="w-full flex items-center gap-2">
                    <Button variant={"default"} onClick={() => mutation.mutate()}>Start your download <Download /></Button>
                    <DialogClose asChild>
                        <Button variant={"destructive"}>Cancel <X/></Button>
                    </DialogClose>
                </div>
            </DialogFooter>
        </DialogContent>
    </Dialog>
}

function DeleteModpackDialog({modpackId} : {modpackId: string}) {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate({from: Route.fullPath});
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: async () => {
            const status = await deleteModpack(modpackId);

            if(!status || status < 200 || status > 200 ) {
                throw new Error("Unable to delete modpack.");
            }
        },
        onSuccess: async () => {
            navigate({to: "/"})
            
            await queryClient.invalidateQueries({
                queryKey: appQueries.modpack(modpackId).queryKey,
                refetchType: "all"
            });

            await queryClient.invalidateQueries({
                queryKey: appQueries.modpackSuggestions(modpackId).queryKey,
                refetchType: "all"
            });

        },
        onError: (error: Error) => {
            console.log(error.message);
        }
    });

    return <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
            <p className="text-left flex items-center justify-center gap-2 font-normal"><Trash2 /> Delete modpack</p>
        </DialogTrigger>
        <DialogContent showCloseButton={false} className="flex flex-col justify-center items-center w-fit gap-4">
            <DialogHeader className="flex justify-center items-center text-left">
                <DialogTitle className="text-xl font-bold">Are you sure you want do delete this modpack?</DialogTitle>
                <Separator />
                <DialogDescription>Doing so is irriversable and will delete all data related to this modpack including any suggestions made for this modpack.</DialogDescription>
            </DialogHeader>
            <DialogFooter className="w-full items-start flex-row">
                <Button variant={"default"} onClick={() => mutation.mutate()}>Delete modpack <Check /></Button>
                <DialogClose asChild>
                    <Button variant={"destructive"} className="w-fit">Cancel <X/></Button>
                </DialogClose>
            </DialogFooter>
        </DialogContent>
    </Dialog>
}

function ModpackSettingsDropDown({modpack} : {modpack: Modpack}) {
    return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
              <Button variant={"outline"}>
                <Settings />
              </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg bg-[var(--surface-1)]"
            side={"bottom"}
            align="end"
            sideOffset={4}
            onCloseAutoFocus={(e) => e.preventDefault()}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm cursor-default">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage className="size-full rounded-lg" src={modpackImage} alt={modpack.name} />
                  <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                </Avatar>
                <div className="text-left text-sm flex items-center">
                  <span className="truncate font-medium">{modpack.name} settings</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem className="cursor-pointer" onSelect={(e) => e.preventDefault()}>
                <RenameModpackDialog curName={modpack.name}/>
              </DropdownMenuItem>
              <DropdownMenuSeparator/>
              <DropdownMenuItem className="cursor-pointer" onSelect={(e) => e.preventDefault()}>
                <DeleteModpackDialog modpackId={modpack.id.toString()} />
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
    )
}

function BookmarkModpackButton({modpack, curUser} : {modpack: Modpack, curUser: User}) {
    const {userBookmarked} = Route.useLoaderData();
    const [isBookmarked, setIsBookmarked] = useState(userBookmarked ? true : false);
    const [isClicked, setIsClicked] = useState(false);
    const queryClient = useQueryClient();

    const {data: bookmark} = useSuspenseQuery({
        queryKey: ["bookmark", `${modpack.id} ${curUser.id}`],
        queryFn: () => getBookmark(modpack.id.toString())
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
            const status = isBookmarked ? await deleteBookmark(modpack.id.toString()) : await createBookmark(modpack.id.toString())
            setIsClicked(false);
            
            if(!status || status < 200 || status > 300) {
                throw new Error(isBookmarked ? "Unable to un-bookmark this modpack." : "Unable to bookmark this modpack.");
            }
            
            setIsBookmarked(!isBookmarked);
        },
        onSuccess: async () => {            
            await queryClient.invalidateQueries({
                queryKey: ["bookmark", `${modpack.id} ${curUser.id}`],
                refetchType: "all"
            });

            await queryClient.invalidateQueries({
                queryKey: appQueries.userBookmarks(curUser).queryKey,
                refetchType: "all"
            });
        },
        onError: (error: Error) => {
            console.log(error.message);
        }
    });

    return (
        <Button onClick={handleClick} variant={isBookmarked ? "default" : "outline"}>{isBookmarked ? <Bookmark className="fill-current" /> : <Bookmark />}</Button>
    )
}

function SelectDisplayRadioGroup() {
    const navigate = useNavigate({from: Route.fullPath});
    const {display} = Route.useSearch({
        select: (search) => ({
            display: search.display
        })
    });

    const handleValueChange = (newValue: string) => {
        navigate({search: () => ({display: newValue}), resetScroll: false});
    }

    return (
        <RadioGroup
        defaultValue={display}
        onValueChange={handleValueChange}
        className="inline-flex rounded-full bg-muted p-1"
        >
            <label className="cursor-pointer">
                <RadioGroupItem value="mods" className="peer sr-only" />
                <div className={`px-4 py-1.5 text-sm rounded-full transition duration-200
                ${display === "mods" ? "bg-primary text-white" : ""}
                text-muted-foreground`}>
                Mods
                </div>
            </label>

            <label className="cursor-pointer">
                <RadioGroupItem value="suggestions" className="peer sr-only" />
                <div className={`px-4 py-1.5 text-sm rounded-full transition duration-200
                ${display === "suggestions" ? "bg-primary text-white" : ""}
                text-muted-foreground`}>
                Suggestions
                </div>
            </label>
        </RadioGroup>
  )
}

export default function ModpackView() {
    const { curUser } = Route.useLoaderData();
    const { pathname } = useLocation();
    const {modpackId} = Route.useParams();
    const navigate = useNavigate();
    const {data: modpack} = useSuspenseQuery(appQueries.modpack(modpackId));
    const {display} = Route.useSearch({
        select: (search) => ({
            display: search.display
        })
    });

    if(!modpack) {
        navigate({to: "/"});
        return;
    }

    const {data: suggestions, isPending: pendingSuggestionData} = useSuspenseQuery(appQueries.modpackSuggestions(modpack.id.toString()));
    const [versionIteration, setVersionIteration] = useState(modpack.versions[0].iterations.toString());
    // TODO: Upon suggestion being merged into modpack, maybe set displayed version to new version?
    const [displayedVersion, setDisplayedVersion] = useState(modpack.versions[0]);
    const [suggestionFilter, setSuggestionFilter] = useState<SuggestionFilter>(SuggestionFilter.All)

    const modIds = useMemo(
        () => modpack.versions.find(version => version.iterations.toString() === versionIteration)!.versionMods.map((versionMod: VersionMod) => versionMod.modId),
        [modpack.versions, versionIteration]
    );

    const filteredSuggestions = useMemo(() => {
        if (!suggestions) return [];

        switch (suggestionFilter) {
            case SuggestionFilter.Verified:
                return suggestions?.filter(
                    suggestion => suggestion.state === SuggestionState.Unverified
                );
            case SuggestionFilter.Unverified:
                return suggestions?.filter(
                    suggestion => suggestion.state === SuggestionState.Verified
                );
            default:
                return suggestions;
        }
    }, [suggestions, suggestionFilter]);

    const {data: referenceIds} = useQuery(appQueries.modReferenceIds(modIds));
    const {data: versionModData, isPending: pendingModData} = useQuery(appQueries.curseForgeModData(referenceIds));

    const handleValueChange = (newValue: string) => {
        const newVersion = modpack.versions.find(version => version.iterations.toString() === newValue);
        if(!newVersion) {
            console.error("Problem with changing versions");
            return;
        }
        setVersionIteration(newValue);
        setDisplayedVersion(newVersion);
    }

    const handleFilterChange = (newValue: SuggestionFilter) => {
        setSuggestionFilter(newValue);
    }

    useModpackSubscription(modpack.id)

    return <section className="flex flex-col items-center justify-center p-2 min-md:max-w-3/4 min-md:min-w-2/4">
        <header className="flex flex-col justify-between items-center gap-3 min-md:flex-row min-md:gap-6">
            <div className="flex flex-col items-center justify-center gap-3 min-md:flex-row min-md:justify-between">
                <img src={modpackImage} alt="Modpack logo" className="bg-black border border-white/30 aspect-square w-28 h-28 md:w-40 md:h-40" />
                <div className="flex flex-col min-md:items-start items-center justify-center gap-3">
                    <h1 className="font-bold line-clamp-1">{modpack.name}</h1>
                    <div className="flex justify-center items-center text-lg gap-1 h-5 font-bold">
                        <Gamepad className="text-[var(--text-secondary)]" />
                        <h2 className="text-[var(--text-secondary)]">
                            {enumNameFromValue(ModLoader,displayedVersion.modLoader.toString())} 
                        </h2>
                        <h2 className="text-[var(--text-secondary)]">
                            {displayedVersion.gameVersion}
                        </h2>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-center gap-2">
                <DownloadModpackManifestDialog modpackId={modpack.id.toString()} versionIteration={versionIteration} />
                { curUser && <BookmarkModpackButton modpack={modpack} curUser={curUser} /> }
                <CopyButton text={"http:localhost:3000" + pathname} side="bottom"/>
                {curUser && <CreateSuggestionDialog modpack={modpack} curUser={curUser} /> }
                { curUser?.id === modpack.userId && <ModpackSettingsDropDown modpack={modpack} /> }
            </div>
        </header>

        <Separator className="my-4"/>
        
        <section className="flex items-center justify-center gap-4 flex-col w-19/20">
            <SelectDisplayRadioGroup />

            <Command className="flex flex-col justify-center items-center w-full h-fit gap-2 overflow-visible">
                <div className="flex items-center justify-center w-full gap-1">
                    <ClearableCommandInput  placeholder="Search..." />
                    <div className="flex max-md:flex-col items-center justify-center">
                        <div className="flex items-center max-md:flex-col justify-center gap-2 z-1">
                            <div className="flex items-center justify-center gap-2">
                                {
                                    display === "mods" ?
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
                                    :
                                     <Select value={suggestionFilter} onValueChange={handleFilterChange}>
                                    <SelectTrigger>
                                        <span className="text-sm">Filter:</span>
                                        <SelectValue placeholder="Filter modifications..."/>
                                        <Separator orientation="vertical"  className="h-full" />
                                    </SelectTrigger> 
                                    <SelectContent>
                                        <SelectGroup>     
                                            <SelectLabel>Select filter</SelectLabel>
                                            <SelectItem className="cursor-pointer" value={"0"}>All</SelectItem>
                                            <SelectItem className="cursor-pointer" value={"1"}>Unverified</SelectItem>
                                            <SelectItem className="cursor-pointer" value={"2"}>Verified</SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                                }
                            </div>
                        </div>
                    </div>
                </div>
                <CommandList className="w-full max-h-fit">
                    <CommandEmpty className={display === "mods" && pendingModData || display === "suggestions" && pendingSuggestionData ? "hidden" : ""}>
                        <DisplayContainer className="flex items-center justify-center h-96">
                            <h2>It's looking empty in here...</h2>
                        </DisplayContainer>
                    </CommandEmpty>
                    {display === "mods" ? 
                        <CommandGroup className="w-full">
                            <DisplayContainer className={`${displayedVersion.versionMods.length === 0 ? "hidden" : ""}`}>
                                    {
                                        pendingModData ? (
                                            <div className="size-96 max-w-full flex items-center justify-center w-full">
                                                <Spinner className="size-20" />
                                            </div>
                                        )
                                        :
                                        displayedVersion && versionModData ? displayedVersion.versionMods.map((versionMod, index) => {
                                            
                                            const modData = versionModData.find(modData => versionMod.mod.referenceId === modData.referenceId);
                                            
                                            if(!modData) {
                                                return <div>Error fetching mod data for mod with id {versionMod.mod.referenceId}.</div>
                                            }

                                            return <CommandItem value={modData.name} key={index} className="size-full p-0">
                                                <VersionModDisplay curseforgeMod={modData} versionMod={versionMod} />
                                            </CommandItem>
                                        })  : ""
                                    }
                            </DisplayContainer>
                        </CommandGroup>
                        :
                        <CommandGroup>
                            <DisplayContainer className={`${filteredSuggestions.length === 0 ? "hidden" : ""}`}>
                                {
                                    pendingSuggestionData ? (
                                        <div className="size-full flex items-center justify-center w-full">
                                            <Spinner className="size-20" />
                                        </div>
                                    )
                                    :
                                    filteredSuggestions && suggestions ? filteredSuggestions.map((suggestion, index) => {
                                        return <CommandItem value={suggestion.username} key={index} className="size-full max-w-full p-0">
                                            <SuggestionInteractive suggestion={suggestion} modpack={modpack} curUser={curUser} />
                                        </CommandItem>
                                    })  
                                    : ""
                                }
                            </DisplayContainer>
                        </CommandGroup>
                    }
                </CommandList>
            </Command>
        </section>

    </section>
}
