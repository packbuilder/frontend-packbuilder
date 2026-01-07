import { createSuggestion } from "@/lib/api";
import type { Suggestion } from "@/types/suggestion";
import { Button } from "@/components/ui/button";
import { CloudAlert, CloudCheck, Plus, Save, SquareMinus, SquarePlus, TriangleAlert} from "lucide-react";
import ToolbarTooltip from "@/components/toolbar-tooltip";
import { Input } from "@/components/ui/input";
import placeholderAvatar from "@/Seed-Avatar.jpg"
import { DialogHeader, Dialog, DialogContent, DialogTitle, DialogTrigger  } from "@/components/ui/dialog";
import { DialogDescription } from "@radix-ui/react-dialog";
import { useState, type FormEvent } from "react";
import BreadCrumbLink from "@/components/breadcrumb-link"; 
import { createFileRoute, redirect, useNavigate, useRouter } from '@tanstack/react-router'
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { appQueries } from "@/hooks/appQueries";

export const Route = createFileRoute('/modpack/$username/$slug/suggestions')({
    loader: async ({context, params}) => {
        const {user, queryClient} = context;
        const {username, slug} = params;

        if(!username || !slug) {
            throw redirect({to: "/"});
        }

        const modpack = await queryClient.ensureQueryData(appQueries.modpack(username, slug));
        
        if(!modpack) {
            throw redirect({to: "/"});
        }

        const suggestions = await queryClient.ensureQueryData(appQueries.modpackSuggestions(username, slug));

        return {curUser: user, modpack, suggestions, queryClient}
    },
    component: ModpackSuggestions,
})

function SuggestionView({suggestion} : {suggestion: Suggestion}) {
    const {username, slug} = Route.useParams()
    const addedMods = suggestion.modifications.filter(m => m.modAction === "Added");
    const removedMods = suggestion.modifications.filter(m => m.modAction === "Removed");
    
    return <BreadCrumbLink 
        className="duration-100 cursor-pointer relative hover:cursor-pointer focus:shadow focus:scale-110 hover:shadow hover:scale-110 p-2 border dark:border-white fslex flex-col gap-2 items-center w-full max-w-120 rounded overflow-hidden"
        link={`/suggestion/${username}/${slug}/${suggestion.id}/view`} 
        text={`View`}
        style={{
            background:"rgba(255, 255, 255, 0.2)",
            borderRadius: "16px",
            boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
            backdropFilter: "blur(12.1px)",
            WebkitBackdropFilter: "blur(5px)",
            border:" 1px solid rgba(255, 255, 255, 0.3)"
        }}>
        <div className="flex items-center justify-between w-full">
            <div className="flex items-center justify-center gap-2">
                <img className="border-white border-2 rounded-[50%] size-[50px]" src={placeholderAvatar} alt="" />
                <div className="flex flex-col items-center justify-center">
                    <h1 className="font-bold text-xl text-left w-full">{suggestion.username}</h1>
                    <p className="text-left w-full">{suggestion.memo}</p>
                </div>
            </div>
            <div className="flex flex-row items-center justify-center gap-2">
                <div className={`${suggestion.isOutdated ? "" : "hidden"}`}>
                    <ToolbarTooltip side="top" content="This suggestion is outdated and may contain conflicts">
                        <CloudAlert className="text-red-500"/>
                    </ToolbarTooltip>
                </div>

                <div className={`${suggestion.isOutdated ? "hidden" : ""}`}>
                    <ToolbarTooltip side="top" content="This suggestion is up to date">
                        <CloudCheck />
                    </ToolbarTooltip>
                </div>

                <ToolbarTooltip side="top" content="Added mods">
                    <Button variant={"default"} className="bg-green-500 hover:bg-green-500 text-lg font-bold">
                        <SquarePlus /> {addedMods.length}
                    </Button>
                </ToolbarTooltip>

                <ToolbarTooltip side="top" content="Removed mods">
                    <Button variant={"default"} className="bg-red-500 hover:bg-red-500 text-lg font-bold">
                        <SquareMinus /> {removedMods.length}
                    </Button>
                </ToolbarTooltip>

                <ToolbarTooltip side="top" content="Conflicts">
                    <Button variant={"default"} className="bg-yellow-500 hover:bg-yellow-500 text-lg font-bold">
                        <TriangleAlert /> {suggestion.conflictingModifications.length}
                    </Button>
                </ToolbarTooltip>
            </div>
        </div>
    </BreadCrumbLink>
}

function CreateSuggestionDialog() {
    const [isOpen, setOpen] = useState(false);
    const queryClient = useQueryClient();
    const {username, slug} = Route.useParams();
    const router = useRouter();

    const mutation = useMutation({
        mutationFn: async (formData: FormData) => {
            const memo = formData.get("memo") as string;

            const suggestion = await createSuggestion(username, slug, memo);

            if(!suggestion) {
                throw new Error("There was a problem with creating this suggestion");
            }

            return suggestion;
        },
        onSuccess: async (data) => {
            await queryClient.invalidateQueries({
                queryKey: appQueries.modpackSuggestions(username, slug).queryKey,
                refetchType: "all"
            });

            await router.invalidate({sync: true});

            console.log(data);
            
            // navigate({to:`suggestion/${username}/${slug}/${data.id}/edit`, from: "/"});
        },
        onError: (error) => {
            console.error(error.message)
        }
    });

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
        <DialogContent className="flex flex-col justify-center items-center">
            <DialogHeader>
                <DialogTitle>
                    Create Suggestion
                </DialogTitle>
                <DialogDescription>
                    Create a suggestion for this modpack!
                </DialogDescription>
            </DialogHeader>
            <form method="post" id="createSuggestion" onSubmit={handleSubmit}>
                <div className="flex flex-row justify-center items-center gap-2">
                    <Input id="memo" type="text" name="memo" placeholder="Your message..."/>
                    <Button variant={"default"} onClick={() => setOpen(false)} type="submit">Save <Save/></Button>
                </div>
            </form>
        </DialogContent>
    </Dialog>
}

export default function ModpackSuggestions() {
    const {curUser} = Route.useLoaderData();
    const {username, slug} = Route.useParams();
    const {data: suggestions} = useSuspenseQuery(appQueries.modpackSuggestions(username, slug));

    return <section className="flex flex-col justify-center items-center gap-5">
        <h1 className="text-5xl font-bold">Suggestions</h1>
        <div className="flex flex-col items-center justify-center gap-2 w-3/4">
            {!suggestions || suggestions.length === 0 ?  
                <h1>
                    There are currently no suggestions for this modpack.
                </h1>
            : suggestions.map((suggestion: Suggestion, index: number) => {
                return <SuggestionView suggestion={suggestion} key={index}/>
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
