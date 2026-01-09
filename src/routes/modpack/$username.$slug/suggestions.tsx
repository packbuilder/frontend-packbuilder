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
import SuggestionCard from "@/components/suggestion-card";

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
