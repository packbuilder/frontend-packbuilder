import { AvatarImage, AvatarFallback, Avatar } from "@/components/ui/avatar";
import { appQueries } from "@/hooks/appQueries";
import { importModpack } from "@/lib/api";
import { ImageType } from "@/types/enums";
import { imageValueSchema } from "@/types/propertySchemas/imageValueSchema";
import type { User } from "@/types/user";
import { DialogTrigger, DialogContent, DialogTitle, DialogDescription, DialogClose, Dialog, DialogHeader, DialogFooter } from "@/components/ui/dialog";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { Plus, Save, X } from "lucide-react";
import { useState, useRef, type FormEvent } from "react";
import { toast } from "sonner";
import SelectAvatarDialog from "../select-avatar-dialog";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export default function ImportMinecraftModpackDialog({curUser} : {curUser: User}) {
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

            const result = imageValueSchema.safeParse(imageValue);

            if (!result.success) {
                throw new Error(result.error.issues[0].message);
            }

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
                queryKey: appQueries.keys.userModpacks(curUser.id),
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
                        <Button variant={"default"} onClick={submitForm} disabled={mutation.isPending} type="submit">Import Modpack <Save/></Button>
                        <DialogClose asChild>
                            <Button variant={"destructive"}>Cancel <X/></Button>
                        </DialogClose>
                    </div>
                </div>
            </DialogFooter>
        </DialogContent>
    </Dialog>
}