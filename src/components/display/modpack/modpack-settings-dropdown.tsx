import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { appQueries } from "@/hooks/appQueries";
import { updateModpack, deleteModpack } from "@/lib/api";
import { ImageType } from "@/types/enums";
import type { Modpack } from "@/types/modpack";
import { nameSchema } from "@/types/propertySchemas/nameSchema";
import type { User } from "@/types/user";
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription, DialogClose, DialogHeader, DialogFooter } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useRouter, useNavigate } from "@tanstack/react-router";
import { Check, Edit, Settings, Trash2, X } from "lucide-react";
import { useState, useRef, type FormEvent } from "react";
import { toast } from "sonner";

function RenameModpackDialog({curName, modpackId, curUser} : {curName: string, curUser: User | null, modpackId: string}) {
    const queryClient = useQueryClient();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const inputRef = useRef<null | HTMLInputElement>(null);
    const formRef = useRef(null);

    const mutation = useMutation({
        mutationFn: async (formData: FormData) => {
            const newName = formData.get("newName") as string;

            if(newName.length > 20) {
                throw new Error("Your chosen modpack name is too long, must be 20 characters or less.");
            }

            const result = nameSchema.safeParse(newName);

            if (!result.success) {
                throw new Error(result.error.issues[0].message);
            }

            const status = await updateModpack(modpackId, {name: result.data});

            if(!status || status < 200 || status > 299) {
                throw new Error("Problem with updating modpack name");
            }
        },
        onSuccess: async () => {
            toast.success("Successfully renamed your modpack!");
            setIsOpen(false)
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
            toast.error(error.message);
            console.log(error.message);
        }
    });

    const submitForm = () => {
        setIsOpen(false);
        const form = formRef.current as unknown as HTMLFormElement;
        form.requestSubmit();
    }

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        mutation.mutate(formData);
    }
    
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger className="cursor-pointer size-full">
                <DropdownMenuItem className="cursor-pointer" onSelect={e => e.preventDefault()}>
                    <p className="flex gap-2"><Edit/> Rename modpack</p>
                </DropdownMenuItem>
            </DialogTrigger>
            <DialogContent className="p-4 bg-popover rounded-md z-100">
                <DialogHeader className="w-full items-start">
                    <DialogTitle>Rename modpack</DialogTitle>
                    <DialogDescription className="text-muted-foreground">There is a 20 character limit on modpack names.</DialogDescription>
                </DialogHeader>
                <div className="w-fit flex flex-col gap-2">
                    <form onSubmit={handleSubmit} ref={formRef} className="flex-col justify-center items-center gap-2">
                        <Field>
                            <FieldLabel htmlFor={"newName"}>New name</FieldLabel>
                            <Input ref={inputRef} type="text" name="newName" id="newName" className="text-sm" defaultValue={curName}/>
                        </Field>
                    </form>
                </div>
                <DialogFooter>
                    <div className="w-full items-center flex gap-2 justify-start ">
                        <Button variant={"default"} onClick={submitForm} disabled={mutation.isPending}>Save change <Check /></Button>
                        <DialogClose asChild>
                            <Button variant={"destructive"} className="w-fit">Cancel <X/></Button>
                        </DialogClose>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

function DeleteModpackDialog({modpackId} : {modpackId: string}) {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: async () => {
            const status = await deleteModpack(modpackId);

            if(!status || status < 200 || status > 299 ) {
                throw new Error("Unable to delete modpack.");
            }
        },
        onSuccess: async () => {
            toast.success(`Successfully deleted modpack!`)
            navigate({to: "/"})
            
            await queryClient.invalidateQueries({
                queryKey: appQueries.modpack(modpackId).queryKey,
                refetchType: "all"
            });

            await queryClient.invalidateQueries({
                queryKey: appQueries.modpackSuggestions(modpackId, 1).queryKey,
                refetchType: "all"
            });

        },
        onError: (error: Error) => {
            toast.error(error.message);
            console.log(error.message);
        }
    });

    return <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild className="size-full">
            <DropdownMenuItem className="cursor-pointer" onSelect={e => e.preventDefault()}>
                <p className="flex gap-2"><Trash2/> Delete modpack</p>
            </DropdownMenuItem>
        </DialogTrigger>
        <DialogContent showCloseButton={false} className="flex flex-col justify-center items-center w-fit gap-4">
            <DialogHeader className="flex justify-center items-center text-left">
                <DialogTitle className="text-xl font-bold">Are you sure you want do delete this modpack?</DialogTitle>
                <Separator />
                <DialogDescription className="text-muted-foreground">Doing so is irriversable and will delete all data related to this modpack including any suggestions made for this modpack.</DialogDescription>
            </DialogHeader>
            <DialogFooter className="w-full items-start flex-row">
                <Button variant={"default"} onClick={() => mutation.mutate()} disabled={mutation.isPending}>Delete modpack <Check /></Button>
                <DialogClose asChild>
                    <Button variant={"destructive"} className="w-fit">Cancel <X/></Button>
                </DialogClose>
            </DialogFooter>
        </DialogContent>
    </Dialog>
}

export function ModpackSettingsDropDown({modpack, curUser} : {modpack: Modpack, curUser: User | null}) {
    return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
              <Button variant={"outline"}>
                <Settings />
              </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) w-fit rounded-lg bg-[var(--surface-1)]"
            side={"bottom"}
            align="end"
            sideOffset={4}
            onCloseAutoFocus={(e) => e.preventDefault()}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm cursor-default">
                <div className="text-left text-md font-bold flex items-center gap-1">
                    <img src={modpack.imageType === ImageType.Stock ? `/modpackAvatars/${modpack.imageValue}` : modpack.imageValue} alt="Modpack logo" className="bg-black border border-white/30 aspect-square w-8 h-8 md:w-12 md:h-12 block m-auto rounded-none"/>
                    <h3 className="truncate">{modpack.name} settings</h3>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
                <RenameModpackDialog curName={modpack.name} modpackId={modpack.id.toString()} curUser={curUser}/>
              <DropdownMenuSeparator/>
                <DeleteModpackDialog modpackId={modpack.id.toString()} />
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
    )
}