import placeholder from "@/Seed-Avatar.jpg"
import { createModpackVersion } from "@/lib/api";
import { type Modification } from "@/types/modification";
import { Button } from "@/components/ui/button";
import { Check, Cloud, CloudAlert, CloudCheck, CloudCog, Edit, TriangleAlert } from "lucide-react";
import BreadCrumbLink from "@/components/breadcrumb-link";
import type { CurseForgeMod } from "@/types/curseforge/curseforgeMod";
import { createFileRoute, redirect, useNavigate, useRouter } from '@tanstack/react-router'
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import ToolbarTooltip from "@/components/toolbar-tooltip";
import { appQueries } from "@/hooks/appQueries";
import { SuggestionState, ModAction } from "@/types/enums";

export const Route = createFileRoute('/suggestion/$username/$slug/$suggestionId/view')({
    loader: async ({context, params}) => {
        const {user, queryClient} = context;
        const {username, slug, suggestionId} = params;

        const suggestion = await queryClient.ensureQueryData(appQueries.suggestion(username, slug, suggestionId));
        const modpack = await queryClient.ensureQueryData(appQueries.modpack(username, slug));

        if(!suggestion || !modpack) {
            throw redirect({to: "/"});
        }

        const modificationReferenceIds = suggestion.modifications.map(modification => modification.mod.referenceId);
        await queryClient.ensureQueryData(appQueries.modificationModData(suggestionId, modificationReferenceIds));

        return {curUser: user};

    },
    component: SuggestionView,
})

function ModificationDisplay({modification, curseforgeMod} : {modification: Modification, curseforgeMod: CurseForgeMod}) {
    return <section className="flex flex-col items-center justify-center w-full">
        <div className="flex flex-row items-center justify-start gap-2 p-5 border-b-2 border-gray-300 w-full">
            <img src={curseforgeMod.logoUrl} className="size-20" alt="" />
            <h1 className="text-2xl">{curseforgeMod.name}</h1>
            <h1 className={`${modification.modAction === ModAction.Added ? "bg-emerald-500" : "bg-red-500"} p-2`}>
                {modification.modAction === ModAction.Added ? "Added" : "Removed"}
            </h1>
            <ToolbarTooltip side="top" content="This modification is conflicting with the latest version of the modpack.">
                <Button className={`bg-yellow-400 hover:bg-yellow-400 ${modification.isConflicting ? "" : "hidden"}`}>
                    <TriangleAlert className="text-black" />
                </Button>
            </ToolbarTooltip>
        </div>
    </section>
}

export default function SuggestionView() {
    const { curUser } = Route.useLoaderData();
    const {username, slug, suggestionId} = Route.useParams();
    const queryClient = useQueryClient();
    const [message, setMessage] = useState("");
    const router = useRouter();
    const navigate = useNavigate();
    const {data: modpack} = useSuspenseQuery(appQueries.modpack(username, slug));
    const {data: suggestion} = useSuspenseQuery(appQueries.suggestion(username, slug, suggestionId));
    
    if(!suggestion || !modpack) {
        navigate({to: "/"});
        return;
    }

    const modificationReferenceIds = useMemo(
        () => suggestion.modifications.map(modification => modification.mod.referenceId),
        [suggestion.modifications]
    );
    const {data: modificationModData} = useSuspenseQuery(appQueries.modificationModData(suggestionId, modificationReferenceIds));

    const mergeSuggestion = async () => {

        if(suggestion.state !== SuggestionState.Verified) {
            setMessage("Could not merge suggestion. It is either outdated or has conflicts that need to be resolved by the suggestion creator.")
            return;
        } else if(suggestion.modifications.length <= 0) {
            setMessage("You cannot merge suggestions with no modifications.");
            return;
        }

        const status = await createModpackVersion(username, slug, suggestionId);

        if(!status || status < 200 || status > 200) {
            setMessage("There was a problem with merging this suggestion. Try again later.")
            return;
        }

        await queryClient.invalidateQueries({queryKey: ["modpack", slug], exact: true});
        await queryClient.invalidateQueries({queryKey: ["suggestion", suggestionId], exact: true});
        await queryClient.invalidateQueries({queryKey: ["modificationModData", suggestionId]})
        await router.invalidate({sync: true});  

        setMessage("This suggestion was successfully merged!")
    }

    return <section className="flex flex-col items-center justify-center gap-4">
        <header className="flex flex-col items-center justify-center gap-4">
            <img className="cursor-pointer border-white border-2 rounded-[50%] size-20" src={placeholder} alt="" />
            <div className="flex flex-col items-center justify-center gap-2">
                <div className="flex items-center justify-center gap-1">
                    <h1 className="text-xl font-bold">{suggestion.username + "'s Suggestion"}</h1>
                </div>
                {
                    suggestion.state.toString() === SuggestionState.Unverified ?     
                    <div className="flex items-center justify-center">
                        <CloudAlert className="text-red-500"/>
                        <h1>This suggestion has not been verified and cannot be merged.</h1>
                    </div>
                    : suggestion.state.toString() === SuggestionState.VerificationPending ?
                    <div className="flex items-center justify-center">
                        <CloudCog />
                        <h1>This suggestion is undergoing verification and cannot be merged or edited.</h1>
                    </div>
                    : 
                    <div className="flex items-center justify-center">
                        <CloudCheck />
                        <h1>This suggestion has been verified and is able to be merged.</h1>
                    </div>
                }
                <div className="flex justify-center items-center gap-2">
                    <p className="text-md">Memo: {suggestion.memo}</p> 
                </div>
                <div className="flex justify-center items-center gap-2">
                    {suggestion.userId === curUser?.id ? 
                    <BreadCrumbLink link={`suggestion/${username}/${slug}/${suggestionId}/edit`} text="Edit">
                        <Button variant={"default"}>Edit <Edit /></Button> 
                    </BreadCrumbLink>
                    : ""}
                    {modpack?.userId === curUser?.id || suggestion.state === SuggestionState.Verified ? <Button variant={"default"} onClick={mergeSuggestion}>Merge <Check /></Button> : ""} 
                    
                    <h1 className="text-lg font-bold">{message}</h1>
                </div>
            </div>
        </header>

        <div className="flex flex-col justify-center items-center w-3/4">
            <h1 className="text-4xl font-bold self-start">Modifications</h1>
            <div className="flex flex-col justify-start items-start min-w-[300px] min-h-[400px] border w-1/2 border-black dark:border-gray-400 bg-gray-900 flex flex-col h-96 w-96 overflow-y-auto overflow-x-clip w-full">        
                {suggestion.modifications.map((modification, index) => {
                    const modData = modificationModData?.find(modData => modification.mod.referenceId === modData.referenceId);

                    if(!modData) {
                        return <div>Error fetching mod data for modification</div>
                    }

                    return <ModificationDisplay curseforgeMod={modData} modification={modification} key={index} />;
                })}
                <div className={`flex items-center justify-center size-full ${!modificationModData || modificationModData.length === 0 ? "" : "hidden"}`}>
                    <h1 className="text-xl">It's looking empty in here...</h1>
                </div>
            </div>
        </div>
    </section>
}
