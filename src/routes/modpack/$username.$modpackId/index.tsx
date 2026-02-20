import { Check, Download, Edit, ExternalLink, Save, Trash2, Users, X } from "lucide-react";
import modpackImage from "@/modpack.gif";
import { deleteModpack, getModpackVersionManifest, updateModpack } from "@/lib/api";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/copy-button";
import { Input } from "@/components/ui/input";
import type { VersionMod } from "@/types/versionMod";
import ToolbarTooltip from "@/components/toolbar-tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@radix-ui/react-popover";
import type { CurseForgeMod } from "@/types/curseforge/curseforgeMod";
import BreadCrumbLink from "@/components/breadcrumb-link";
import { createFileRoute, redirect, useLocation, useNavigate, useRouter } from '@tanstack/react-router'
import { Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { appQueries } from "@/hooks/appQueries";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { enumNameFromValue } from "@/lib/utils";
import { ModLoader } from "@/types/enums";
import { Spinner } from "@/components/ui/spinner";
import { DialogHeader, Dialog, DialogContent, DialogTitle, DialogTrigger, DialogFooter  } from "@/components/ui/dialog";
import { DialogClose, DialogDescription } from "@radix-ui/react-dialog";

export const Route = createFileRoute('/modpack/$username/$modpackId/')({
  loader: async ({context, params}) => {
    const {user, queryClient} = context;
    const {modpackId} = params;
 
    const modpack = await queryClient.ensureQueryData(appQueries.modpack(modpackId))
 
    if(!modpack) {
        throw redirect({to: "/"});
    }
 
    const modIds = modpack.versions[0]?.versionMods.map((versionMod: VersionMod) => versionMod.modId);
    const referenceIds = await queryClient.ensureQueryData(appQueries.modReferenceIds(modIds));
    const modData = await queryClient.ensureQueryData(appQueries.modpackModData(referenceIds));

    return {curUser: user, modpack, queryClient, modData}
  },
  component: ModpackView,
})

function CurseForgeModDisplay({curseforgeMod} : {curseforgeMod: CurseForgeMod}) {
    return <div className="flex flex-col items-center justify-start w-full">
        <div className="flex items-center justify-start w-full p-5 gap-2">
            <img src={curseforgeMod.logoUrl} className="size-20" alt="" />
            <h1 className="text-2xl">{curseforgeMod.name}</h1>
            <ToolbarTooltip content="Curseforge link" side="top">
                <Link to={curseforgeMod.websiteLink} target="_blank" rel="noopener noreferrer">
                    <Button variant={"default"}><ExternalLink /></Button>
                </Link>
            </ToolbarTooltip>
        </div>
        <Separator className="" />
    </div>
}

function EditModpackNameDropdown({curName} : {curName: string}) {
    const {curUser} = Route.useLoaderData();
    const queryClient = useQueryClient();
    const router = useRouter();
    const {modpackId} = Route.useParams();

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
        <Popover>
            <ToolbarTooltip content="Change name" side="top">
                <PopoverTrigger asChild>
                    <Button variant={"default"}>
                        <Edit />
                    </Button>
                </PopoverTrigger>
            </ToolbarTooltip>
            <PopoverContent className="p-2 bg-popover rounded-md">
                <div className="w-fit">
                    <form onSubmit={handleSubmit} className="flex justify-center items-center">
                        <Input type="text" name="newName" id="newName" defaultValue={curName}/>
                        <Button type="submit" variant={"default"}><Save/></Button>
                    </form>
                </div>
            </PopoverContent>
        </Popover>
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
            <Button variant={"default"}>Download <Download /></Button>
        </DialogTrigger>
        <DialogContent showCloseButton={false} className="flex flex-col justify-center items-center w-fit">
            {downloadUrl && (
                <a
                    ref={downloadRef}
                    href={downloadUrl}
                    download="manifest.zip"
                    className="hidden"
                />
            )}
            <DialogHeader className="mt-4 flex justify-center items-center">
                <DialogTitle className="text-3xl font-bold  ">How to import your modpack to curseforge.</DialogTitle>
                <Separator />
            </DialogHeader>
             <div className="flex items-center flex-col justify-center">
                <div className="flex flex-col items-start justify-center">
                    <div className="rounded-md px-4 py-2 flex flex-col items-center justify-start gap-4 text-left">
                        <p>1. Launch the CurseForge app and make sure the Minecraft profile is selected.</p>
                        <p>2. Click “Minecraft” in the top menu and switch to the “Modpacks” section.</p>
                        <p>3. On the right side, look for “Add Modpack” or “Import Modpack” (wording may vary depending on version) and then select “Import from ZIP”.</p>
                        <p>4. Navigate to the ZIP file you downloaded (it should be named manifest.zip). Select it and click Open.</p>
                        <p>5. Curseforge should then create a new profile and download all of your mods, once that's finished you can then launch your modpack!</p>
                    </div>
                </div>
            </div>
            <DialogFooter className="w-full px-2">
                <Button variant={"default"} onClick={() => mutation.mutate()}>Start your download <Download /></Button>
                <DialogClose asChild>
                    <Button variant={"destructive"}>Cancel <X/></Button>
                </DialogClose>
            </DialogFooter>
        </DialogContent>
    </Dialog>
}

// TODO: Fix page flash when user deletes right before re-navigation
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
            await queryClient.invalidateQueries({
                queryKey: appQueries.modpack(modpackId).queryKey,
                refetchType: "all"
            });

            await queryClient.invalidateQueries({
                queryKey: appQueries.modpackSuggestions(modpackId).queryKey,
                refetchType: "all"
            });

            navigate({to: "/"})
        },
        onError: (error: Error) => {
            console.log(error.message);
        }
    });

    return <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
            <Button variant={"destructive"}>Delete <Trash2 /></Button>
        </DialogTrigger>
        <DialogContent showCloseButton={false} className="flex flex-col justify-center items-center w-fit gap-4">
            <DialogHeader className="mt-4 flex justify-center items-center">
                <DialogTitle className="text-3xl font-bold">Are you sure you want do delete this modpack?</DialogTitle>
                <DialogDescription>Doing so is irriversable and will delete all data related to this modpack including user suggestions tied to this modpack.</DialogDescription>
            </DialogHeader>
            <DialogFooter className="w-full px-2">
                <Button variant={"default"} onClick={() => mutation.mutate()}>Yes I want to delete this. <Check /></Button>
                <DialogClose asChild>
                    <Button variant={"destructive"}>Cancel <X/></Button>
                </DialogClose>
            </DialogFooter>
        </DialogContent>
    </Dialog>
}

// TODO: Clean up ternary operator usage throughout the app
export default function ModpackView() {
    const { curUser } = Route.useLoaderData();
    const { pathname } = useLocation();
    const {username, modpackId} = Route.useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const {data: modpack} = useSuspenseQuery(appQueries.modpack(modpackId));

    if(!modpack) {
        navigate({to: "/"});
        return;
    }

    const [versionIteration, setVersionIteration] = useState(modpack.versions[0].iterations.toString());
    const [displayedVersion, setDisplayedVersion] = useState(modpack.versions[0]);
    const modIds = useMemo(
        () => modpack.versions.find(version => version.iterations.toString() === versionIteration)!.versionMods.map((versionMod: VersionMod) => versionMod.modId),
        [modpack.versions, versionIteration]
    );
    const {data: referenceIds} = useQuery(appQueries.modReferenceIds(modIds));
    const {data: modData, isPending: pendingModData} = useQuery(appQueries.modpackModData(referenceIds));

    const handleValueChange = async (newValue: string) => {
        setVersionIteration(newValue);
        setDisplayedVersion(modpack.versions.find(version => version.iterations.toString() === versionIteration)!);

        await queryClient.invalidateQueries({
            queryKey: appQueries.modReferenceIds(modIds).queryKey
        });
        await queryClient.invalidateQueries({
            queryKey: appQueries.modpackModData(referenceIds).queryKey
        });
    }

    return <section className="flex flex-col items-center justify-center">
        <div className="flex flex-col justify-center items-center mb-4 gap-2">
            <img src={modpackImage} alt="Modpack logo" className="bg-black aspect-square w-28 h-28 md:w-40 md:h-40" />
            <div className="flex items-end justify-center gap-2">
                <h1 className="text-5xl font-bold">{modpack.name}</h1>
                {curUser ? <EditModpackNameDropdown curName={modpack.name}/> : ""}
            </div>
            <div className="flex items-center justify-center gap-2">
                <h1 className="font-bold text-2xl">Version:</h1>
                <Select value={versionIteration} onValueChange={handleValueChange}>
                    <SelectTrigger style={{color: "black", backgroundColor: "whitesmoke" }}>
                        <SelectValue placeholder="Select modpack version..."/>
                    </SelectTrigger> 
                    <SelectContent className="bg-white text-black">
                        <SelectGroup>     
                            <SelectLabel>Select version</SelectLabel>
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
            </div>
            <div className="flex items-center justify-center">
                <h1 className="text-lg">Using minecraft version {displayedVersion.gameVersion} with {enumNameFromValue(ModLoader,displayedVersion.modLoader.toString())} mod loader.</h1>
            </div>
            <div className="flex flex-row items-center justify-center gap-2">
                <CopyButton text={"http:localhost:3000" + pathname} tooltipSide="bottom" tooltipLabel="Link to modpack" />
                <BreadCrumbLink link={`modpack/${username}/${modpackId}/suggestions`} text="Suggestions">
                    <Button variant={"default"}>
                        Suggestions <Users />
                    </Button>
                </BreadCrumbLink>
                <DownloadModpackManifestDialog modpackId={modpack.id.toString()} versionIteration={versionIteration} />
                <DeleteModpackDialog modpackId={modpack.id.toString()} />
            </div>
        </div>

        <div className="flex flex-col justify-center items-center w-3/4">
            <h1 className="text-4xl font-bold self-start">Mods</h1>
            <div className="flex flex-col justify-start items-start min-w-[300px] min-h-[400px] border w-1/2 border-black dark:border-gray-400 bg-gray-900 flex flex-col h-96 w-96 overflow-y-auto overflow-x-clip w-full">
                {
                    pendingModData ? (
                        <div className="size-full flex items-center justify-center w-full">
                            <Spinner className="size-20" />
                        </div>
                    )
                    :
                    modData && modData.length > 0 ? (modData.map((modData: CurseForgeMod, index: number) => {
                        return <CurseForgeModDisplay key={index} curseforgeMod={modData} />
                    }))
                    :
                    <h1>It's looking empty in here...</h1>
                }
            </div>
        </div>
    </section>
}
