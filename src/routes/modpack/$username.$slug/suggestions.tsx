import { createSuggestion, getModpack, getModpackSuggestions } from "@/lib/api";
import type { Suggestion } from "@/types/suggestion";
import { Button } from "@/components/ui/button";
import { Plus, Save} from "lucide-react";
import ToolbarTooltip from "@/components/toolbar-tooltip";
import { Input } from "@/components/ui/input";
import placeholderAvatar from "@/Seed-Avatar.jpg"
import { DialogHeader, Dialog, DialogContent, DialogTitle, DialogTrigger  } from "@/components/ui/dialog";
import { DialogDescription } from "@radix-ui/react-dialog";
import { useState, type FormEvent } from "react";
import BreadCrumbLink from "@/components/breadcrumb-link"; 
import { createFileRoute, redirect, useLocation, useNavigate, useRouter } from '@tanstack/react-router'
import { queryOptions, useMutation } from "@tanstack/react-query";

export const Route = createFileRoute('/modpack/$username/$slug/suggestions')({
    loader: async ({context, params}) => {
        const {user, queryClient} = context;
        const {username, slug} = params;

        if(!username || !slug) {
            throw redirect({to: "/"});
        }

        const modpack = await queryClient.ensureQueryData(
            queryOptions({
                queryKey: ["modpack", slug],
                queryFn: () => getModpack(username, slug)
            }),  
        )

        if(!modpack) {
            throw redirect({to: "/"});
        }

        const suggestions = await queryClient.ensureQueryData(
            queryOptions({
                queryKey: ["modpackSuggestions"],
                queryFn: () => getModpackSuggestions(username, slug)
            }),  
        )

        return {curUser: user, modpack, suggestions, queryClient}
    },
    component: ModpackSuggestions,
})

function SuggestionView({suggestion} : {suggestion: Suggestion}) {
    const {username, slug} = Route.useParams()
    const addedMods = suggestion.modifications.filter(m => m.modAction === "Added");
    const removedMods = suggestion.modifications.filter(m => m.modAction === "Removed");
    
    return <BreadCrumbLink 
        className="duration-100 cursor-pointer relative before:content-[''] before:absolute before:top-0 before:left-[-150%] before:w-[60%] before:h-full before:bg-white before:opacity-40 before:skew-x-[45deg] before:transition-all before:duration-500 before:ease-linear hover:before:left-[180%] hover:cursor-pointer focus:shadow focus:scale-110 hover:shadow hover:scale-110 p-2 border dark:border-white fslex flex-col gap-2 items-center w-full rounded overflow-hidden"
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
            <div className="flex flex-col items-center justify-center">
                <h1 className="text-green-400 text-nowrap font-bold">+{addedMods.length}</h1>
                <h1 className="text-red-400 text-nowrap font-bold">-{removedMods.length}</h1>
            </div>
        </div>
    </BreadCrumbLink>
}

function CreateSuggestionDialog() {
    const [isOpen, setOpen] = useState(false);
    const {queryClient} = Route.useLoaderData();
    const params = Route.useParams();
    const pathname = useLocation();
    const router = useRouter();
    const navigate = useNavigate();

    const mutation = useMutation({
        mutationFn: async (formData: FormData) => {
            const memo = formData.get("memo") as string;
            const { username, slug } = params;

            const suggestion = await createSuggestion(username, slug, memo);

            if(!suggestion) {
                throw new Error("There was a problem with creating this suggestion");
            }

            return suggestion;
        },
        onSuccess: async (data) => {
            await queryClient.invalidateQueries({
                queryKey: ["modpackSuggestions"],
                refetchType: "all"
            });

            await router.invalidate({sync: true});

            navigate({to:`${pathname}/${data.id}/edit`});
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
    const {suggestions, curUser} = Route.useLoaderData();

    if(!suggestions) {
        return <div>
            Data not found.
        </div>
    }

    return <section className="flex flex-col justify-center items-center gap-5">
        <h1 className="text-5xl font-bold">Suggestions</h1>
        <div className="flex flex-col items-center justify-center gap-2 w-3/4">
            {suggestions.length === 0 ?  
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
