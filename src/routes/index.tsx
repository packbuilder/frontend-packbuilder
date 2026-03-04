import BreadCrumbLink from '@/components/breadcrumb-link';
import ErrorMessage from '@/components/feedback/error-message';
import SuccessMessage from '@/components/feedback/success-message';
import { GlassCard } from '@/components/glass-card';
import {ModpackCardLarge} from '@/components/modpack/modpack-card';
import ToolbarTooltip from '@/components/toolbar-tooltip';
import { Button } from '@/components/ui/button';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { appQueries } from '@/hooks/appQueries';
import { createModpack, importModpack } from '@/lib/api';
import { enumNameFromValue } from '@/lib/utils';
import type { Bookmark } from '@/types/bookmark';
import { createModpackDtoSchema } from '@/types/dtos/createModpackDto';
import { ModLoader } from '@/types/enums';
import type { Modpack } from '@/types/modpack';
import type { User } from '@/types/user';
import { DialogDescription } from '@radix-ui/react-dialog';
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { Plus, Save, X } from 'lucide-react';
import { useState, useRef, type FormEvent } from 'react';
import { toast } from 'sonner';

export const Route = createFileRoute("/")({
  loader: async ({
    context: { queryClient, user: curUser }
  }) => {
    const modpacks = await queryClient.ensureQueryData(appQueries.userModpacks(curUser));
    const bookmarks = await queryClient.ensureQueryData(appQueries.userBookmarks(curUser));
    const minecraftVersions = await queryClient.ensureQueryData(appQueries.minecraftVersions());

    return {curUser, modpacks, minecraftVersions, bookmarks};
  },
  component: Home,
});

function CreateModpackDialog({curUser, minecraftVersions} : {curUser: User, minecraftVersions: string[]}) {
    const [isOpen, setOpen] = useState(false);
    const queryClient = useQueryClient();
    const router = useRouter();
    const formRef = useRef(null);

    const [minecraftVersion, setMinecraftVersion] = useState(minecraftVersions[0]);
    const [modLoader, setModLoader] = useState(ModLoader.Forge.toString());

    const mutation = useMutation({
        mutationFn: async (formData: FormData) => {
            const modpackName = formData.get("name") as string;
            const body = createModpackDtoSchema.parse({name: modpackName, modLoader: modLoader, gameVersion: minecraftVersion})
            const status = await createModpack(body);

            if(!status || status < 200 || status > 200) {
                throw new Error("There was a problem with creating this modpack.");
            }
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: appQueries.userModpacks(curUser).queryKey,
                refetchType: "all"
            });

            await router.invalidate({sync: true});
        },
        onError: (error) => {
            console.error(error.message)
        }
    });

    const submitForm = () => {
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
                Create Modpack <Plus />
            </Button>   
        </DialogTrigger>
        <DialogContent aria-describedby='' showCloseButton={false} className="flex flex-col justify-center items-center w-fit min-md:max-w-3/4 max-md:w-9/10">
            <DialogHeader className="w-full px-2">
                <DialogTitle className='text-xl text-left'>
                    Create a Modpack from scratch!
                </DialogTitle>
                <DialogDescription className='text-md text-gray-400 text-left'>
                    This will create an empty modpack.
                </DialogDescription>
            </DialogHeader>
            <form method="post" ref={formRef} id="create-modpack" className=" w-full p-2 flex flex-col items-start justify-center gap-2" onSubmit={handleSubmit}>
                <div className="flex flex-col justify-center items-start gap-2">
                    <h1 className="font-bold text-lg">Modpack name</h1>
                    <Input id="name" type="text" name="name" placeholder="Your modpack name..."/>
                </div>
                <h1 className='font-bold text-lg max-md:text-center'>Game version & Mod loader</h1>
                <div className='flex items-center justify-center gap-2'>
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
                    <Button variant={"default"} onClick={submitForm} type="submit">Create Modpack <Save/></Button>
                    <DialogClose asChild>
                        <Button variant={"destructive"}>Cancel <X/></Button>
                    </DialogClose>
                </div>
            </DialogFooter>
        </DialogContent>
    </Dialog>
}

function ImportModpackDialog({curUser} : {curUser: User}) {
    const [isOpen, setOpen] = useState(false);
    const [showError, setShowError] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const queryClient = useQueryClient();
    const router = useRouter();
    const formRef = useRef(null);

    const mutation = useMutation({
        mutationFn: async (formData: FormData) => {
            const status = await importModpack(formData);

            if(!status || status < 200 || status > 200) {
                throw new Error("There was a problem with importing your modpack.");
            }
        },
        onSuccess: async () => {
            setShowError(false);
            setShowSuccess(true);

            await queryClient.invalidateQueries({
                queryKey: appQueries.userModpacks(curUser).queryKey,
                refetchType: "all"
            });

            await router.invalidate({sync: true});
        },
        onError: (error) => {
            setShowError(true);
            setShowSuccess(false);
            console.error(error.message)
        }
    });

    const submitForm = () => {
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
                Import Modpack <Plus />
            </Button>   
        </DialogTrigger>
        <DialogContent showCloseButton={false} className="flex flex-col justify-center items-center w-fit min-md:max-w-3/4 max-md:w-9/10">
            <DialogHeader className="w-full px-2">
                <DialogTitle className='text-xl text-left'>
                    Import an existing curseforge modpack
                </DialogTitle>
                <DialogDescription className='text-gray-400 text-left'>
                    To import a modpack from curseforge, you will need to upload your modpacks manifest.json file. Packbuilder will handle the rest.
                </DialogDescription>
            </DialogHeader>
            <form method="post" ref={formRef} id="import-modpack" className=" w-full p-2 flex flex-col items-start justify-cetner gap-2" onSubmit={handleSubmit}>
                <div className="flex flex-col justify-center items-start gap-2">
                    <h1 className="font-bold text-md">Upload your manifest.json here</h1>
                    <Input className='' id="file-upload" type="file" name="file" accept='.json'/>
                </div>
            </form>
            <DialogFooter className="w-full px-2">
                <div className='w-full flex flex-col items-center gap-2'>
                    <div className="w-full flex flex-row justify-start items-center gap-2">
                        <Button variant={"default"} onClick={submitForm} type="submit">Import Modpack <Save/></Button>
                        <DialogClose asChild>
                            <Button variant={"destructive"}>Cancel <X/></Button>
                        </DialogClose>
                    </div>
                    {showError && <ErrorMessage text={"There was a problem with importing your modpack. Please ensure you are uploading a valid curseforge manifest.json file."}/>}
                    {showSuccess && <SuccessMessage text={"Your modpack was successfully imported!"}/>}
                </div>
            </DialogFooter>
        </DialogContent>
    </Dialog>
}

function Home() {
    const {curUser} = Route.useLoaderData();
    const {data: modpacks} = useSuspenseQuery(appQueries.userModpacks(curUser));
    const {data: minecraftVersions} = useSuspenseQuery(appQueries.minecraftVersions());
    const {data: bookmarks} = useSuspenseQuery(appQueries.userBookmarks(curUser));

    return <section className="flex flex-col justify-between items-center w-full mx-auto h-full pb-10">
        <div className="flex flex-col justify-between items-center w-full mx-auto h-full">
            <div className="flex flex-col justify-around items-center mb-4">
                <h1 className="text-3xl font-bold p-2">Your Modpacks</h1>
                <div className='flex items-center justify-center gap-2'>
                    {curUser && minecraftVersions && <CreateModpackDialog curUser={curUser} minecraftVersions={minecraftVersions}/>}
                    {curUser && <ImportModpackDialog curUser={curUser} />}

                    {!curUser && <Button onClick={() => toast("You must be logged in to create a modpack.")} variant={"outline"}>Log in to create modpacks</Button>}
                </div>
            </div>
            {modpacks && 
                <div className='flex flex-col items-center justify-center'>
                    <Carousel className="flex w-3/5 justify-center items-center">
                        <CarouselContent className='py-6'>
                            {
                                modpacks.map((modpack: Modpack, index: number) => {
                                    return <CarouselItem className='flex items-center justify-center'>
                                        <ModpackCardLarge modpack={modpack} key={index}/>
                                    </CarouselItem>
                                })
                            }
                        </CarouselContent>
                        <CarouselPrevious />
                        <CarouselNext />
                    </Carousel>
                    {/* TODO: Figure out if you want this here */}
                    {/* <BreadCrumbLink link={`profile/${curUser?.name}`} text="Profile" className="">
                        <Button variant={"default"} className="">
                            View all
                        </Button>
                    </BreadCrumbLink> */}
                </div>
            }

            {
                !modpacks && 
                <GlassCard className='flex items-center justify-center'>
                    <h1 className='text-lg text-center'>
                        You have no modpacks
                    </h1>
                </GlassCard>  
            }
        </div>
        <div className="flex flex-col justify-between items-center w-full mx-auto h-full"> 
            <div className="flex flex-col justify-around items-center mb-3">
                <h1 className="text-3xl font-bold p-2">Bookmarked modpacks</h1>
            </div>
            {bookmarks && 
                <Carousel className="flex w-3/5 justify-center items-center">
                    <CarouselContent className='py-6'>
                        {
                            bookmarks.map((bookmark: Bookmark, index: number) => {
                                return <CarouselItem className='flex items-center justify-center'>
                                    <ModpackCardLarge modpack={bookmark.modpack} key={index}/>
                                </CarouselItem>
                            })
                        }
                    </CarouselContent>
                    <CarouselPrevious />
                    <CarouselNext />
                </Carousel>
            }

            {!bookmarks && 
                <GlassCard className='size-45 flex items-center justify-center'>
                    <h1 className='text-lg text-center'>
                        No bookmarks :(
                    </h1>
                </GlassCard>  
            }
        </div>
    </section>
}
