import type { Suggestion } from "@/types/suggestion";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import ToolbarTooltip from "@/components/toolbar-tooltip";
import { createFileRoute, redirect, useNavigate} from '@tanstack/react-router'
import { useSuspenseQuery } from "@tanstack/react-query";
import { appQueries } from "@/hooks/appQueries";
import SuggestionCard from "@/components/suggestion/suggestion-card";
import CreateSuggestionDialog from "@/components/suggestion/create-suggestion-dialog";

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

export default function ModpackSuggestions() {
    const {curUser} = Route.useLoaderData();
    const {modpackId} = Route.useParams();
    const navigate = useNavigate();
    const {data: suggestions} = useSuspenseQuery(appQueries.modpackSuggestions(modpackId));
    const {data: modpack} = useSuspenseQuery(appQueries.modpack(modpackId));

    if(!modpack) {
        navigate({to: "/"});
        return;
    }

    // TODO: Turn into shadcn table component (Should look kinda like streamxps implementation)
    return <section className="flex flex-col justify-center items-center gap-5">
        <div className="flex flex-col items-center justify-center gap-4">
            <h1 className="text-5xl font-bold">Suggestions</h1>
            {curUser ? 
            <CreateSuggestionDialog modpack={modpack} curUser={curUser} />
            :
            <ToolbarTooltip content="You must login to create a suggestion">
                <Button variant={"outline"}>Create Suggestion <Plus /></Button>
            </ToolbarTooltip>
            }
        </div>
        <div className="flex flex-col items-center justify-center gap-2 w-3/4">
            {!suggestions || suggestions.length === 0 ?  
                <h1>
                    There are currently no suggestions for this modpack.
                </h1>
            : suggestions.map((suggestion: Suggestion, index: number) => {
                return <SuggestionCard suggestion={suggestion} key={index}/>
            })}

        </div>
    </section>
}
