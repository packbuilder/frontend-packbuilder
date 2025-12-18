import placeholder from "@/Seed-Avatar.jpg"
import { getCurseForgeModData, getModpack, getSuggestion } from "@/lib/api";
import { type Modification } from "@/types/modification";
import { Button } from "@/components/ui/button";
import { Check, Edit } from "lucide-react";
import BreadCrumbLink from "@/components/breadcrumb-link";
import type { CurseForgeMod } from "@/types/curseforge/curseforgeMod";
import { createFileRoute, redirect } from '@tanstack/react-router'
import { queryOptions } from "@tanstack/react-query";

export const Route = createFileRoute('/suggestion/$username/$slug/$suggestionId/view')({
    loader: async ({context, params}) => {
        const {user, queryClient} = context;
        const {username, slug, suggestionId} = params;

        const suggestion = await queryClient.ensureQueryData(
            queryOptions({
                queryKey: ["suggestion", suggestionId],
                queryFn: () => getSuggestion(username, slug, suggestionId)
            })
        );

        const modpack = await queryClient.ensureQueryData(
            queryOptions({
                queryKey: ["modpack", slug],
                queryFn: () => getModpack(username, slug)
            }),  
        );

        if(!suggestion) {
            throw redirect({to: "/"});
        }

        // TODO: This is the kind of data that should be cached in redis when that is up and running to prevent reaching api rate limit and improve performance
        const modificationReferenceIds = suggestion.modifications.map(modification => modification.mod.referenceId);
        const modificationModData = await queryClient.ensureQueryData(
            queryOptions({
                queryKey: ["modificationModData"],
                queryFn: () => getCurseForgeModData(modificationReferenceIds)
            }),  
        );

        return {curUser: user, suggestion, modpack, modificationModData: modificationModData || [], queryClient};

    },
    component: SuggestionView,
})

function ModificationDisplay({modification, curseforgeMod} : {modification: Modification, curseforgeMod: CurseForgeMod}) {
    return <section className="flex flex-col items-center justify-center w-full">
        <div className="flex flex-row items-center justify-start gap-2 p-5 border-b-2 border-gray-300 w-full">
            <img src={curseforgeMod.logoUrl} className="size-20" alt="" />
            <h1 className="text-2xl">{curseforgeMod.name}</h1>
            <h1 className={`${modification.modAction === "Added" ? "bg-emerald-500" : "bg-red-500"} p-2`}>{modification.modAction}</h1>
        </div>
    </section>
}

export default function SuggestionView() {
    const { suggestion, curUser, modpack, modificationModData } = Route.useLoaderData();
    const {username, slug, suggestionId} = Route.useParams();

    return <section className="flex flex-col items-center justify-center gap-4">
        <div className="flex items-center justify-center gap-4">
            <img className="cursor-pointer border-white border-2 rounded-[50%] size-20" src={placeholder} alt="" />
            <div className="flex flex-col items-center justify-center">
                <h1 className="text-xl font-bold">{suggestion.username + "'s Suggestion"}</h1>
                <p className="text-md">{suggestion.memo}</p>
            </div>
        </div>

        <section className="max-w-5/6 w-fit max-h-1/2 overflow-y-auto overflow-x-clip flex items-start justify-center">
            <div className="flex flex-col justify-start items-start min-w-[300px] h-fit border w-1/2 border-black dark:border-gray-400 bg-gray-700 flex flex-col max-h-96 w-96 overflow-y-auto overflow-x-clip w-full">
                {suggestion.modifications.map((modification, index) => {
                    const modData = modificationModData.find(modData => modification.mod.referenceId === modData.referenceId);

                    if(!modData) {
                        return <div>Error fetching mod data for modification</div>
                    }

                    return <ModificationDisplay curseforgeMod={modData} modification={modification} key={index} />;
                })}
            </div>
        </section>
        
        <div className="flex justify-center items-center gap-2">
            {suggestion.userId === curUser?.id ? 
            <BreadCrumbLink link={`suggestion/${username}/${slug}/${suggestionId}/edit`} text="Edit">
                <Button variant={"default"}>Edit <Edit /></Button> 
            </BreadCrumbLink>
            : ""}
            {modpack?.userId === curUser?.id ? <Button variant={"default"}>Merge <Check /></Button> : ""} 
        </div>
    </section>
}
