import {ModpackCardLarge} from '@/components/modpack-card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { appQueries } from '@/hooks/appQueries';
import { createModpack, importModpack } from '@/lib/api';
import { enumNameFromValue } from '@/lib/utils';
import { createModpackDtoSchema } from '@/types/dtos/createModpackDto';
import { ModLoader } from '@/types/enums';
import type { Modpack } from '@/types/modpack';
import type { User } from '@/types/user';
import { DialogDescription } from '@radix-ui/react-dialog';
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { Plus, Save, X } from 'lucide-react';
import { useState, useRef, type FormEvent } from 'react';

export const Route = createFileRoute("/")({
  loader: async ({
    context: { queryClient, user: curUser }
  }) => {
    const modpacks = await queryClient.ensureQueryData(appQueries.userModpacks(curUser));
    const modpack = await queryClient.ensureQueryData(appQueries.modpack("1"))
    const minecraftVersions = await queryClient.ensureQueryData(appQueries.minecraftVersions());
    console.log(modpack)

    return {curUser, modpacks, minecraftVersions};
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
                Create Modpack <Plus />
            </Button>   
        </DialogTrigger>
        <DialogContent showCloseButton={false} className="flex flex-col justify-center items-center w-fit">
            <DialogHeader className="w-full px-2">
                <DialogTitle className='text-xl'>
                    Create Modpack
                </DialogTitle>
            </DialogHeader>
            <form method="post" ref={formRef} id="create-modpack" className=" w-full p-2 flex flex-col items-start justify-cetner gap-2" onSubmit={handleSubmit}>
                <div className="flex flex-col justify-center items-start gap-2">
                    <h1 className="font-bold text-md">Modpack name</h1>
                    <Input id="name" type="text" name="name" placeholder="Your modpack name..."/>
                </div>
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

    const mutation = useMutation({
        mutationFn: async (formData: FormData) => {
            const status = await importModpack(formData);

            if(!status || status < 200 || status > 200) {
                throw new Error("There was a problem with importing your modpack.");
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
                Import Modpack <Plus />
            </Button>   
        </DialogTrigger>
        <DialogContent showCloseButton={false} className="flex flex-col justify-center items-center w-fit">
            <DialogHeader className="w-full px-2">
                <DialogTitle className='text-xl'>
                    Import existing modpack
                </DialogTitle>
                <DialogDescription>
                    To do so you will have to do is locate the manifest.json file within your curseforge modpack and upload it, packbuilder will handle the rest.
                </DialogDescription>
            </DialogHeader>
            <form method="post" ref={formRef} id="import-modpack" className=" w-full p-2 flex flex-col items-start justify-cetner gap-2" onSubmit={handleSubmit}>
                <div className="flex flex-col justify-center items-start gap-2">
                    <h1 className="font-bold text-md">Upload your manifest.json here</h1>
                    <Input id="file-upload" type="file" name="file" accept='.json'/>
                </div>
            </form>
            <DialogFooter className="w-full px-2">
                <div className="w-full flex flex-row justify-start items-center gap-2">
                    <Button variant={"default"} onClick={submitForm} type="submit">Import Modpack <Save/></Button>
                    <DialogClose asChild>
                        <Button variant={"destructive"}>Cancel <X/></Button>
                    </DialogClose>
                </div>
            </DialogFooter>
        </DialogContent>
    </Dialog>
}

function Home() {
    const {curUser} = Route.useLoaderData();
    const {data: modpacks} = useSuspenseQuery(appQueries.userModpacks(curUser));
    const {data: minecraftVersions} = useSuspenseQuery(appQueries.minecraftVersions());

    return <section className="flex flex-col justify-between items-center w-full mx-auto h-full">
        <div className="flex flex-col justify-around items-center mb-10">
            <h1 className="text-3xl font-bold p-2">Modpacks</h1>
            <div className='flex items-center justify-center gap-2'>
                {curUser && minecraftVersions && <CreateModpackDialog curUser={curUser} minecraftVersions={minecraftVersions}/>}
                {curUser && <ImportModpackDialog curUser={curUser} />}
            </div>
        </div>
        <div id="modpacks" className="flex flex-row wrap gap-4 min-w-full justify-center items-center">
            {modpacks ? modpacks.map((modpack: Modpack, index: number) => {
              return <ModpackCardLarge modpack={modpack} key={index}/>
            }) : <h1>Log in to create modpacks!</h1>}
        </div>
    </section>
}
