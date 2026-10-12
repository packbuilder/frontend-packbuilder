import { AvatarImage, AvatarFallback, Avatar } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { appQueries } from "@/hooks/appQueries";
import { createModpack } from "@/lib/api";
import { enumNameFromValue } from "@/lib/utils";
import { createModpackDtoSchema } from "@/types/dtos/createModpackDto";
import { ModLoader, ImageType, Game } from "@/types/enums";
import type { User } from "@/types/user";
import { DialogTrigger, DialogContent, DialogTitle, DialogDescription, DialogClose, Dialog, DialogFooter, DialogHeader } from "@/components/ui/dialog";
import { SelectTrigger, SelectValue, SelectContent, SelectGroup, SelectLabel, SelectItem, Select } from "@/components/ui/select";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { Plus, Save, X } from "lucide-react";
import { useState, useRef, type FormEvent } from "react";
import { toast } from "sonner";
import SelectAvatarDialog from "../select-avatar-dialog";
import { Button } from "@/components/ui/button";
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field";

export default function CreateMinecraftModpackDialog({curUser, minecraftVersions} : {curUser: User, minecraftVersions: string[]}) {
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
            const result = createModpackDtoSchema.safeParse({name: modpackName, modLoader: modLoader, gameVersion: minecraftVersion, imageValue, imageType: ImageType.Stock, game: Game.Minecraft});

            if (!result.success) {
                throw new Error(result.error.issues[0].message);
            }

            const status = await createModpack(result.data);

            if(!status || status < 200 || status > 299) {
                throw new Error("There was a problem with creating this modpack.");
            }
        },
        onSuccess: async () => {
            toast.success("Successfully created modpack");
            
            setOpen(false);

            await queryClient.invalidateQueries({
                queryKey: appQueries.keys.userModpacks(curUser.id),
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
                    Create a Minecraft modpack from scratch!
                </DialogTitle>
                <DialogDescription className='text-md text-gray-400 text-left'>
                    Select the details for your modpack and start packbuilding today!
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
                        <FieldLabel>
                            <h2 className='font-bold text-lg max-md:text-center'>Game version & Mod loader</h2>
                        </FieldLabel>
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
                    <Button variant={"default"} onClick={submitForm} disabled={mutation.isPending} type="submit">Create Modpack <Save/></Button>
                    <DialogClose asChild>
                        <Button variant={"destructive"}>Cancel <X/></Button>
                    </DialogClose>
                </div>
            </DialogFooter>
        </DialogContent>
    </Dialog>
}