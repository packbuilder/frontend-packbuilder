import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useNavigate, useRouter } from "@tanstack/react-router";
import { useRef, useState, type FormEvent } from "react";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { appQueries } from "@/hooks/appQueries";
import { createSuggestion } from "@/lib/api";
import { enumNameFromValue } from "@/lib/utils";
import { createSuggestionDtoSchema } from "@/types/dtos/createSuggestionDto";
import { ModLoader } from "@/types/enums";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectGroup, SelectLabel, SelectItem } from "../ui/select"
import { Plus, Save, X } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import type { User } from "@/types/user";
import type { Modpack } from "@/types/modpack";

export default function CreateSuggestionDialog({modpack, curUser} : {modpack: Modpack, curUser: User | null}) {
    const [isOpen, setOpen] = useState(false);
    const queryClient = useQueryClient();
    const router = useRouter();
    const navigate = useNavigate();
    const formRef = useRef(null);

    const { data: minecraftVersions } = useSuspenseQuery(appQueries.minecraftVersions());

    if (!modpack || !curUser) {
        return;
    }

    const [minecraftVersion, setMinecraftVersion] = useState(modpack.versions[0].gameVersion);
    const [modLoader, setModLoader] = useState(modpack.versions[0].modLoader.toString());

    const mutation = useMutation({
        mutationFn: async (formData: FormData) => {
            const memo = formData.get("memo") as string;
            const body = createSuggestionDtoSchema.parse({memo, gameVersion: minecraftVersion, modLoader: modLoader});
            const response = await createSuggestion(modpack.id.toString(), body);

            if(!response || response.status < 200 || response.status > 200 || !response.suggestionId) {
                throw new Error("There was a problem with creating this suggestion");
            }

            return response.suggestionId
        },
        onSuccess: async (suggestionId: number) => {
            navigate({to: `/suggestion/${curUser.name}/${modpack.id}/${suggestionId}/edit`})
            
            await queryClient.invalidateQueries({
                queryKey: appQueries.modpackSuggestions(modpack.id.toString()).queryKey,
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
                Create Suggestion <Plus />
            </Button>   
        </DialogTrigger>
        <DialogContent aria-describedby="" showCloseButton={false} className="flex flex-col justify-center items-center max-w-3/4">
            <DialogHeader className="w-full px-2">
                <DialogTitle className="text-xl">
                    Create Suggestion for this modpack!
                </DialogTitle>
                <DialogDescription className="text-md">
                    Suggestions act as the main hub for all your proposed changes to a modpack! You can only have one suggestion per modpack at a time. 
                </DialogDescription>
            </DialogHeader>
            <form method="post" ref={formRef} id="createSuggestion" className=" w-full p-2 flex flex-col items-start justify-cetner gap-2" onSubmit={handleSubmit}>
                <div className="flex flex-col justify-center items-start gap-2">
                    <h1 className="font-bold text-lg">Memo</h1>
                    <Input id="memo" type="text" name="memo" placeholder="Your message..."/>
                </div>
                <h1 className="font-bold text-lg">Game Version & Mod Loader</h1>
                <div className={`flex items-center justify-center gap-2`}>
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
                    <Button variant={"default"} onClick={submitForm} type="submit">Create Suggestion <Save/></Button>
                    <DialogClose asChild>
                        <Button variant={"destructive"}>Cancel <X/></Button>
                    </DialogClose>
                </div>
            </DialogFooter>
        </DialogContent>
    </Dialog>
}