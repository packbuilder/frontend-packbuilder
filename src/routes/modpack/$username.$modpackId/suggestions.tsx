import { createSuggestion } from "@/lib/api";
import type { Suggestion } from "@/types/suggestion";
import { Button } from "@/components/ui/button";
import { Plus, Save, X} from "lucide-react";
import ToolbarTooltip from "@/components/toolbar-tooltip";
import { Input } from "@/components/ui/input";
import { DialogHeader, Dialog, DialogContent, DialogTitle, DialogTrigger, DialogFooter  } from "@/components/ui/dialog";
import { DialogClose, DialogDescription } from "@radix-ui/react-dialog";
import { useRef, useState, type FormEvent } from "react"; 
import { createFileRoute, redirect, useNavigate, useRouter } from '@tanstack/react-router'
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { appQueries } from "@/hooks/appQueries";
import SuggestionCard from "@/components/suggestion-card";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ModLoader } from "@/types/enums";
import { enumNameFromValue } from "@/lib/utils";
import { createSuggestionDtoSchema } from "@/types/dtos/createSuggestionDto";

export const Route = createFileRoute('/modpack/$username/$modpackId/suggestions')({
    loader: async ({context, params}) => {
        const {user, queryClient} = context;
        const {username, modpackId} = params;

        if(!username || !modpackId) {
            throw redirect({to: "/"});
        }

        const modpack = await queryClient.ensureQueryData(appQueries.modpack(modpackId));
        
        if(!modpack) {
            throw redirect({to: "/"});
        }

        const minecraftVersions = await queryClient.ensureQueryData(appQueries.minecraftVersions());

        const suggestions = await queryClient.ensureQueryData(appQueries.modpackSuggestions(modpackId));

        return {curUser: user, minecraftVersions, suggestions, queryClient}
    },
    component: ModpackSuggestions,
})

function CreateSuggestionDialog() {
    const [isOpen, setOpen] = useState(false);
    const queryClient = useQueryClient();
    const {modpackId} = Route.useParams();
    const router = useRouter();
    const navigate = useNavigate();
    const formRef = useRef(null);

    const { data: modpack } = useSuspenseQuery(appQueries.modpack(modpackId));
    const { data: minecraftVersions } = useSuspenseQuery(appQueries.minecraftVersions());

    if (!modpack) {
        navigate({ to: "/" });
        return;
    }

    const [minecraftVersion, setMinecraftVersion] = useState(modpack.versions[0].gameVersion);
    const [modLoader, setModLoader] = useState(modpack.versions[0].modLoader.toString());

    const mutation = useMutation({
        mutationFn: async (formData: FormData) => {
            const memo = formData.get("memo") as string;
            const body = createSuggestionDtoSchema.parse({memo, gameVersion: minecraftVersion, modLoader: modLoader});
            const status = await createSuggestion(modpackId, body);

            if(!status || status < 200 || status > 200) {
                throw new Error("There was a problem with creating this suggestion");
            }
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: appQueries.modpackSuggestions(modpackId).queryKey,
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
        <DialogContent showCloseButton={false} className="flex flex-col justify-center items-center w-fit">
            <DialogHeader className="w-full px-2">
                <DialogTitle>
                    Create Suggestion
                </DialogTitle>
                <DialogDescription>
                    Create a suggestion for this modpack!
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

export default function ModpackSuggestions() {
    const {curUser} = Route.useLoaderData();
    const {modpackId} = Route.useParams();
    const {data: suggestions} = useSuspenseQuery(appQueries.modpackSuggestions(modpackId));

    // TODO: Turn into shadcn table component (Should look kinda like streamxps implementation)
    return <section className="flex flex-col justify-center items-center gap-5">
        <h1 className="text-5xl font-bold">Suggestions</h1>
        <div className="flex flex-col items-center justify-center gap-2 w-3/4">
            {!suggestions || suggestions.length === 0 ?  
                <h1>
                    There are currently no suggestions for this modpack.
                </h1>
            : suggestions.map((suggestion: Suggestion, index: number) => {
                return <SuggestionCard suggestion={suggestion} key={index}/>
            })}

        </div>
        {curUser ? 
        <CreateSuggestionDialog />
        :
        <ToolbarTooltip content="You must login to create a suggestion">
            <Button variant={"outline"}>Create Suggestion <Plus /></Button>
        </ToolbarTooltip>
        }
    </section>
}
