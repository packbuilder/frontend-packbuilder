import { AlertButton } from '@/components/alert-button';
import { GlassCard } from '@/components/glass-card';
import {ModpackCardLarge} from '@/components/modpack/modpack-card';
import SelectAvatarDialog from '@/components/SelectAvatarDialog';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogDescription  } from '@/components/ui/dialog';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { appQueries } from '@/hooks/appQueries';
import { createModpack, importModpack } from '@/lib/api';
import { enumNameFromValue } from '@/lib/utils';
import type { Bookmark } from '@/types/bookmark';
import { createModpackDtoSchema } from '@/types/dtos/createModpackDto';
import { ImageType, ModLoader } from '@/types/enums';
import type { Modpack } from '@/types/modpack';
import type { User } from '@/types/user';
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
    const [avatar, setAvatar] = useState("modpack_avatar_1.gif");

    const mutation = useMutation({
        mutationFn: async (formData: FormData) => {
            const modpackName = formData.get("name") as string;
            const imageValue = formData.get("stockAvatar") as string;
            const body = createModpackDtoSchema.parse({name: modpackName, modLoader: modLoader, gameVersion: minecraftVersion, imageValue, imageType: ImageType.Stock})
            const status = await createModpack(body);

            if(!status || status < 200 || status > 299) {
                throw new Error("There was a problem with creating this modpack.");
            }
        },
        onSuccess: async () => {
            toast.success("Successfully created modpack");
            setOpen(false);

            await queryClient.invalidateQueries({
                queryKey: appQueries.userModpacks(curUser).queryKey,
                refetchType: "all"
            });

            await router.invalidate({sync: true});
        },
        onError: (error) => {
            toast.error(error.message);
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
                    Set the details for your modpack and start packbuilding today!
                </DialogDescription>
            </DialogHeader>
            <form method="post" ref={formRef} id="create-modpack" className=" w-full p-2 flex flex-col items-start justify-center gap-2" onSubmit={handleSubmit}>
                <FieldGroup>
                    <Field>
                        <FieldLabel htmlFor='stockAvatar'><h2>Modpack avatar</h2></FieldLabel>
                        <div className='flex items-center justify-start gap-2'>
                            <div className='size-fit'>
                                <Avatar className="cursor-pointer border-white border-2 rounded-[50%] size-[50px]">
                                    <AvatarImage src={`/modpackAvatars/${avatar}`} alt="Modpack Picture" />
                                    <AvatarFallback>ER</AvatarFallback>
                                </Avatar>
                            </div>
                            <Input id='stockAvatar' name='stockAvatar' value={avatar} readOnly hidden/>
                            <SelectAvatarDialog curAvatar={avatar} setAvatar={setAvatar} avatarType={"modpackAvatars"} />
                        </div>
                    </Field>
                    <Field className='w-fit'>
                        <FieldLabel htmlFor='name'><h2 className="font-bold text-lg">Modpack name</h2></FieldLabel>
                        <Input required id="name" type="text" name="name" placeholder="Your modpack name..."/>
                    </Field>
                    <Field>
                        <FieldLabel><h2 className='font-bold text-lg max-md:text-center'>Game version & Mod loader</h2></FieldLabel>
                        <div className='flex items-center justify-start gap-2'>
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
                    </Field>
                </FieldGroup>
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
    const queryClient = useQueryClient();
    const router = useRouter();
    const formRef = useRef(null);
    const [avatar, setAvatar] = useState("modpack_avatar_1.gif");

    const mutation = useMutation({
        mutationFn: async (formData: FormData) => {
            const payload = new FormData();
            const file = formData.get("file") as File | null;
            const imageValue = formData.get("stockAvatar") as string;

            if(!file) {
                throw new Error("You must upload a manifest.json file.");
            }

            payload.append("file", file);
            payload.append("avatarDto.imageValue", imageValue);
            payload.append("avatarDto.imageType", ImageType.Stock);

            const status = await importModpack(payload);

            if(!status || status < 200 || status > 299) {
                throw new Error("There was a problem with importing your modpack.");
            }
        },
        onSuccess: async () => {
            toast.success('Successfully imported modpack!');
            setOpen(false);

            await queryClient.invalidateQueries({
                queryKey: appQueries.userModpacks(curUser).queryKey,
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
                <Field>
                    <FieldLabel htmlFor='stockAvatar'><h2>Modpack avatar</h2></FieldLabel>
                    <div className='flex items-center justify-start gap-2'>
                        <div className='size-fit'>
                            <Avatar className="cursor-pointer border-white border-2 rounded-[50%] size-[50px]">
                                <AvatarImage src={`/modpackAvatars/${avatar}`} alt="Modpack Picture" />
                                <AvatarFallback>ER</AvatarFallback>
                            </Avatar>
                        </div>
                        <Input id='stockAvatar' name='stockAvatar' value={avatar} readOnly hidden/>
                        <SelectAvatarDialog curAvatar={avatar} setAvatar={setAvatar} avatarType={"modpackAvatars"} />
                    </div>
                </Field>
                <div className="flex flex-col justify-center items-start gap-2">
                    <h2 className="font-bold text-md">Upload your manifest.json here</h2>
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

    console.log(bookmarks, modpacks);
    return <section className="flex flex-col justify-between items-center w-full mx-auto h-full pb-10">
        <div className="flex flex-col justify-between items-center w-full mx-auto h-full">
            <div className="flex flex-col justify-around items-center mb-4">
                <h1 className="text-3xl font-bold p-2">Your Modpacks</h1>
                <div className='flex items-center justify-center gap-2'>
                    {curUser && minecraftVersions && curUser.emailVerified && <CreateModpackDialog curUser={curUser} minecraftVersions={minecraftVersions}/>}
                    {curUser && curUser.emailVerified && <ImportModpackDialog curUser={curUser} />}
                    {curUser && !curUser.emailVerified && <AlertButton alertText='Verify your email first'>
                        Create modpack <Plus/>
                    </AlertButton>}
                    {curUser && !curUser.emailVerified && <AlertButton alertText='Verify your email first'>
                        Import modpack <Plus/>
                    </AlertButton>}
                </div>
            </div>
            {modpacks && modpacks.length > 0 && 
                <div className='flex flex-col items-center justify-center max-w-3/5 min-md:max-w-115 w-fit'>
                    <Carousel opts={{align: "start", loop: true}} className="flex justify-center items-center w-full">
                        <CarouselContent className='py-6 px-2'>
                            {
                                modpacks.map((modpack: Modpack, index: number) => {
                                    return <CarouselItem key={index} className={`flex items-center justify-center ${modpacks.length > 1 ? "min-md:basis-1/2" : ""}`}>
                                        <ModpackCardLarge modpack={modpack} key={index}/>
                                    </CarouselItem>
                                })
                            }
                        </CarouselContent>
                        <CarouselPrevious />
                        <CarouselNext />
                    </Carousel>
                </div>
            }

            {
                (!modpacks || modpacks.length <= 0) && 
                <GlassCard className='size-45 flex items-center justify-center'>
                    <h2 className='text-lg text-center'>
                        {!curUser ? "You must be logged in to create modpacks" : "You have no modpacks!"}
                    </h2>
                </GlassCard>  
            }

        </div>
       <div className="flex flex-col justify-between items-center w-full mx-auto h-full">
            <div className="flex flex-col justify-around items-center mb-4">
                <h1 className="text-3xl font-bold p-2">Your Bookmarks</h1>
            </div>
            {bookmarks && bookmarks.length > 0 && 
                <div className='flex flex-col items-center justify-center max-w-3/5 min-md:max-w-115 w-fit'>
                    <Carousel opts={{align: "start", loop: true}} className="flex justify-center items-center w-full">
                        <CarouselContent className='py-6 px-2'>
                            {
                                bookmarks.map((bookmark: Bookmark, index: number) => {
                                    return <CarouselItem key={index} className={`flex items-center justify-center ${bookmarks.length > 1 ? "min-md:basis-1/2" : ""}`}>
                                        <ModpackCardLarge modpack={bookmark.modpack} key={index}/>
                                    </CarouselItem>
                                })
                            }
                        </CarouselContent>
                        <CarouselPrevious />
                        <CarouselNext />
                    </Carousel>
                </div>
            }

            {
                (!bookmarks || bookmarks.length <= 0)  &&
                <GlassCard className='size-45 flex items-center justify-center'>
                    <h2 className='text-lg text-center'>
                        {!curUser ? "You must be logged in to bookmark modpacks" : "You have no bookmarks!"}
                    </h2>
                </GlassCard>  
            }

        </div>
    </section>
}
