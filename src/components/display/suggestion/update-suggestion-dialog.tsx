import { Button } from "@/components/ui/button";
import { Dialog, DialogHeader, DialogFooter, DialogTrigger, DialogContent, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { appQueries } from "@/hooks/appQueries";
import { updateSuggestion } from "@/lib/api";
import { enumNameFromValue } from "@/lib/utils";
import { createSuggestionDtoSchema } from "@/types/dtos/createSuggestionDto";
import { ModLoader } from "@/types/enums";
import type { Modpack } from "@/types/modpack";
import type { Suggestion } from "@/types/suggestion";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectGroup, SelectLabel, SelectItem } from "@/components/ui/select";
import { useQueryClient, useSuspenseQuery, useMutation } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { Edit, Save, X } from "lucide-react";
import { useState, useRef, type FormEvent } from "react";
import { toast } from "sonner";

export default function UpdateSuggestionDialog( {suggestion, modpack} :{suggestion: Suggestion, modpack: Modpack}) {
    const [isOpen, setOpen] = useState(false);
    const queryClient = useQueryClient();
    const router = useRouter();
    const formRef = useRef(null);
    const {data: minecraftVersions} = useSuspenseQuery(appQueries.minecraftVersions());
    const [minecraftVersion, setMinecraftVersion] = useState(suggestion.gameVersion);
    const [modLoader, setModLoader] = useState(suggestion.modLoader.toString());

    const mutation = useMutation({
        mutationFn: async (formData: FormData) => {
            const memo = formData.get("memo") as string;
            const result = createSuggestionDtoSchema.safeParse({memo, gameVersion: minecraftVersion, modLoader: modLoader});

            if (!result.success) {
                throw new Error(result.error.issues[0].message);
            }

            const status = await updateSuggestion(modpack.id, result.data, suggestion.id);

            if(!status || status < 200 || status > 299) {
                throw new Error("There was a problem with updating this suggestion");
            }
        },
        onSuccess: async () => {
            toast.success("Successfully updated suggestion!");
            setOpen(false);
            await queryClient.invalidateQueries({
                queryKey: appQueries.suggestion(modpack.id, suggestion.id).queryKey,
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
                Edit details <Edit />
            </Button>   
        </DialogTrigger>
        <DialogContent showCloseButton={false} className="flex flex-col justify-center items-center w-fit">
            <DialogHeader className="w-full px-2 text-left">
                <DialogTitle>
                    Update suggestion
                </DialogTitle>
                <DialogDescription>
                    Update your suggestions message or the game version/mod loader you want used for the modpack!
                </DialogDescription>
            </DialogHeader>
            <form method="post" ref={formRef} id="createSuggestion" className=" w-full p-2 flex flex-col items-start justify-cetner gap-2" onSubmit={handleSubmit}>
                <div className="flex flex-col justify-center items-start gap-2">
                    <Field>
                        <FieldLabel className="font-bold text-lg">Memo</FieldLabel>
                        <Input id="memo" type="text" name="memo" defaultValue={suggestion.memo} placeholder="Your message..."/>
                    </Field>
                </div>
                <h2 className="font-bold text-lg">Game Version & Mod Loader</h2>
                <div className={`flex items-center justify-center gap-2`}>
                    <Select disabled={!minecraftVersions} value={minecraftVersion} onValueChange={setMinecraftVersion}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select game version..."/>
                        </SelectTrigger> 
                        <SelectContent side="bottom">
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
                        <SelectTrigger>
                            <SelectValue placeholder="Select game version..."/>
                        </SelectTrigger> 
                        <SelectContent side="bottom">
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
                    <Button variant={"default"} onClick={submitForm} disabled={mutation.isPending} type="submit">Update Suggestion <Save/></Button>
                    <DialogClose asChild>
                        <Button variant={"destructive"}>Cancel <X/></Button>
                    </DialogClose>
                </div>
            </DialogFooter>
        </DialogContent>
    </Dialog>
}
