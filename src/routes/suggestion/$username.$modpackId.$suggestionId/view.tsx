import placeholder from "@/Seed-Avatar.jpg"
import { createModpackVersion } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Check, CloudAlert, CloudCheck, CloudCog, Edit, Merge } from "lucide-react";
import BreadCrumbLink from "@/components/breadcrumb-link";
import { createFileRoute, redirect, useNavigate, useRouter } from '@tanstack/react-router'
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { appQueries } from "@/hooks/appQueries";
import { SuggestionState } from "@/types/enums";
import DeleteSuggestionDialog from "@/components/suggestion/delete-suggestion-dialog";
import ErrorMessage from "@/components/feedback/error-message";
import SuccessMessage from "@/components/feedback/success-message";
import InfoPill from "@/components/info-pill";
import { Separator } from "@/components/ui/separator";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Spinner } from "@/components/ui/spinner";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ModificationDisplay } from "@/components/suggestion/modification-card";


export const Route = createFileRoute('/suggestion/$username/$modpackId/$suggestionId/view')({
    loader: async ({context, params}) => {
        const {user, queryClient} = context;
        const {modpackId, suggestionId} = params;

        const suggestion = await queryClient.ensureQueryData(appQueries.suggestion(modpackId, suggestionId));
        const modpack = await queryClient.ensureQueryData(appQueries.modpack(modpackId));

        if(!suggestion || !modpack) {
            throw redirect({to: "/"});
        }

        const modificationReferenceIds = suggestion.modifications.map(modification => modification.mod.referenceId);
        await queryClient.ensureQueryData(appQueries.modificationModData(suggestionId, modificationReferenceIds));

        return {curUser: user};

    },
    component: SuggestionView,
})

export default function SuggestionView() {
    const { curUser } = Route.useLoaderData();
    const {username, modpackId, suggestionId} = Route.useParams();
    const queryClient = useQueryClient();
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const [showErrorMessage, setShowErrorMessage] = useState(false);
    const [modificationFilter, setModificationFilter] = useState<"All" | "Added" | "Removed">("All");
    const router = useRouter();
    const navigate = useNavigate();
    const {data: modpack} = useSuspenseQuery(appQueries.modpack(modpackId));
    const {data: suggestion} = useSuspenseQuery(appQueries.suggestion(modpackId, suggestionId));
    
    if(!suggestion || !modpack) {
        navigate({to: "/"});
        return;
    }

    const modificationReferenceIds = useMemo(
        () => suggestion.modifications.map(modification => modification.mod.referenceId),
        [suggestion.modifications]
    );
    const {data: modificationModData, isPending: pendingModificationData} = useSuspenseQuery(appQueries.modificationModData(suggestionId, modificationReferenceIds));

    const enableErrorMessage = (message: string) => {
        setErrorMessage(message);
        setShowSuccessMessage(false);
        setShowErrorMessage(true);
    }

    const enableSuccessMessage = (message: string) => {
        setSuccessMessage(message);
        setShowErrorMessage(false);
        setShowSuccessMessage(true);
    }

    const mergeSuggestion = async () => {

        if(suggestion.state !== SuggestionState.Verified) {
            enableErrorMessage("Could not merge suggestion. It is either outdated or has conflicts that need to be resolved by the suggestion creator.");
            return;
        } else if(suggestion.modifications.length <= 0) {
            enableErrorMessage("You cannot merge suggestions with no modifications.");
            return;
        }

        const status = await createModpackVersion(modpackId, suggestionId);

        if(!status || status < 200 || status > 200) {
            enableErrorMessage("There was a problem with merging this suggestion. Try again later.")
            return;
        }

        await queryClient.invalidateQueries({queryKey: ["modpack", modpackId], exact: true});
        await queryClient.invalidateQueries({queryKey: ["suggestion", suggestionId], exact: true});
        await queryClient.invalidateQueries({queryKey: ["modificationModData", suggestionId]})
        await router.invalidate({sync: true});  

        enableSuccessMessage("This suggestion is now in the proccess of being merged!")
    }

    const handleValueChange = (newValue: "All" | "Added" | "Removed") => {
        setModificationFilter(newValue);
    }

    useEffect(() => {
        if(suggestion.modifications.length === 0) {
            enableErrorMessage("This suggestion cannot be merged because it contains no modifications.");
        }
    })

    // TODO: Make filter for modifications work and tidy up ipad/desktop styling

    return <section className="flex flex-col items-center justify-center gap-4 p-2">
        <header className="flex flex-col justify-between items-center gap-6  min-md:flex-row min-md:gap-6">
            <div className="flex flex-col items-center justify-center gap-3 min-md:flex-row min-md:justify-between">
                <img src={placeholder} alt="Modpack logo" className="bg-black border border-white/30 aspect-square w-28 h-28 md:w-40 md:h-40" />
                <div className="flex flex-col min-md:items-start items-center justify-center gap-3">
                    <h1 className="font-bold line-clamp-1">{suggestion.username}'s suggestion</h1>
                    <h3 className="text-md line-clamp-2 text-center max-w-9/10">Lorem ipsum dolor, sit amet consectetur adipisicing elit. Repellat tempore, vero autem nesciunt a quibusdam doloremque reiciendis ut recusandae maiores perferendis non? Accusantium excepturi quaerat provident mollitia error nam consequuntur. {suggestion.memo}</h3> 
                    <InfoPill>     
                        {
                            suggestion.state.toString() === SuggestionState.Unverified ?     
                            <div className="flex items-center justify-center gap-2">
                                <CloudAlert className="text-red-500 size-4"/>
                                <p>This suggestion has not been verified.</p>
                            </div>
                            : suggestion.state.toString() === SuggestionState.VerificationPending ?
                            <div className="flex items-center justify-center gap-2">
                                <CloudCog className="size-4"/>
                                <h3>This suggestion is undergoing verification.</h3>
                            </div>
                            : 
                            suggestion.state.toString() === SuggestionState.MergePending ?
                            <div className="flex items-center justify-center gap-2">
                                <Merge className="size-4"/>
                                <h3>This suggestion is being merged.</h3>
                            </div>
                            :
                            <div className="flex items-center justify-center gap-2">
                                <CloudCheck className="size-4"/>
                                <h3>This suggestion has been verified.</h3>
                            </div>
                        }
                    </InfoPill>
                </div>
            </div>
            <div className="flex justify-center items-center gap-2">
                {suggestion.userId === curUser?.id &&
                <BreadCrumbLink link={`suggestion/${username}/${modpackId}/${suggestionId}/edit`} text="Edit">
                    <Button variant={"default"}>Edit <Edit /></Button> 
                </BreadCrumbLink>}

                {modpack.userId === curUser?.id && suggestion.state === SuggestionState.Verified && suggestion.modifications.length > 0 && <Button variant={"default"} onClick={mergeSuggestion}>Merge <Check /></Button>} 

                {suggestion.userId === curUser?.id && <DeleteSuggestionDialog modpack={modpack} suggestion={suggestion}/>}
            </div>
            {showErrorMessage && <ErrorMessage text={errorMessage}/>}
            {showSuccessMessage && <SuccessMessage text={successMessage} />}
        </header>

        <Separator className="my-2" />

        <section className="flex items-center justify-center gap-4 flex-col w-9/10">
            <h1>Modifications</h1>
            <Command className="flex flex-col justify-center items-center w-full gap-2 overflow-visible">
                <div className="flex items-center justify-center w-full gap-1">
                    <CommandInput  placeholder="Search modifications..." />
                    <div className="flex max-md:flex-col items-center justify-center">
                        <div className="flex items-center max-md:flex-col justify-center gap-2 z-1">
                            <div className="flex items-center justify-center gap-2">
                                <Select value={modificationFilter} onValueChange={handleValueChange}>
                                    <SelectTrigger>
                                        <span className="text-sm">Filter:</span>
                                        <SelectValue placeholder="Filter modifications..."/>
                                        <Separator orientation="vertical"  className="h-full" />
                                    </SelectTrigger> 
                                    <SelectContent>
                                        <SelectGroup>     
                                            <SelectLabel>Select filter</SelectLabel>
                                            <SelectItem className="cursor-pointer" value={"All"}>All</SelectItem>
                                            <SelectItem className="cursor-pointer" value={"Added"}>Added</SelectItem>
                                            <SelectItem className="cursor-pointer" value={"Removed"}>Removed</SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                </div>
                <CommandList className="max-h-fit w-full">
                    <CommandEmpty className={`flex flex-col justify-center items-center min-w-[300px] min-h-[300px] border w-1/2 border-black dark:border-gray-400 bg-[var(--surface-1)] flex flex-col max-h-96 w-96 overflow-y-auto overflow-x-clip w-full`}>
                        <h2>It's looking empty in here...</h2>
                    </CommandEmpty>
                        <CommandGroup>
                            <div className={`flex flex-col justify-start items-start min-w-[300px] ${suggestion.modifications.length === 0 && "min-h-[400px]"} border w-1/2 border-black dark:border-gray-400 bg-[var(--surface-1)] flex flex-col max-h-96 w-96 overflow-y-auto overflow-x-clip w-full`}>
                                {
                                    pendingModificationData ? (
                                        <div className="size-full flex items-center justify-center w-full">
                                            <Spinner className="size-20" />
                                        </div>
                                    )
                                    :
                                    suggestion.modifications && modificationModData && suggestion.modifications.map((modification, index) => {
                                        
                                        const modData = modificationModData.find(modData => modification.mod.referenceId === modData.referenceId);
                                        
                                        if(!modData) {
                                            return <div>Error fetching mod data for mod with id {modification.mod.referenceId}.</div>
                                        }

                                        return <CommandItem value={modData.name} key={index} className="size-full p-0">
                                            <ModificationDisplay curseforgeMod={modData} modification={modification} />
                                        </CommandItem>
                                    })
                                }
                            </div>
                        </CommandGroup>
                </CommandList>
            </Command>
        </section>
    </section>
}
