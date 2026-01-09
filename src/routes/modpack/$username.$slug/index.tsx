import { Edit, ExternalLink, Save, Trash2, Users } from "lucide-react";
import modpackImage from "@/modpack.gif";
import { updateModpack } from "@/lib/api";
import type { FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/copy-button";
import { Input } from "@/components/ui/input";
import type { VersionMod } from "@/types/versionMod";
import ToolbarTooltip from "@/components/toolbar-tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@radix-ui/react-popover";
import type { CurseForgeMod } from "@/types/curseforge/curseforgeMod";
import BreadCrumbLink from "@/components/breadcrumb-link";
import { createFileRoute, redirect, useLocation, useNavigate, useRouter } from '@tanstack/react-router'
import { Link } from "@tanstack/react-router";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { appQueries } from "@/hooks/appQueries";

export const Route = createFileRoute('/modpack/$username/$slug/')({
  loader: async ({context, params}) => {
    const {user, queryClient} = context;
    const {username, slug} = params;
 
    const modpack = await queryClient.ensureQueryData(appQueries.modpack(username, slug))
 
    if(!modpack) {
        throw redirect({to: "/"});
    }
 
    const modIds = modpack.versions[0].versionMods.map((versionMod: VersionMod) => versionMod.modId);
    const referenceIds = await queryClient.ensureQueryData(appQueries.modReferenceIds(modIds));
    const modData = await queryClient.ensureQueryData(appQueries.modpackModData(referenceIds));

    return {curUser: user, modpack, queryClient, modData}
  },
  component: ModpackView,
})

function CurseForgeModDisplay({curseforgeMod} : {curseforgeMod: CurseForgeMod}) {
    return <div className="flex flex-row items-center justify-start gap-2 p-5 border-b-2 border-gray-300 w-full">
        <img src={curseforgeMod.logoUrl} className="size-20" alt="" />
        <h1 className="text-2xl">{curseforgeMod.name}</h1>
        <ToolbarTooltip content="Curseforge link" side="top">
            <Link to={curseforgeMod.websiteLink} target="_blank" rel="noopener noreferrer">
                <Button variant={"default"}><ExternalLink /></Button>
            </Link>
        </ToolbarTooltip>
    </div>
}

function EditModpackNameDropdown({curName} : {curName: string}) {
    const {curUser} = Route.useLoaderData();
    const queryClient = useQueryClient();
    const router = useRouter();
    const {username, slug} = Route.useParams();

    const mutation = useMutation({
        mutationFn: async (formData: FormData) => {
            const newName = formData.get("newName") as string;
            await updateModpack(username, slug, {name: newName})
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: appQueries.modpack(username, slug).queryKey,
                refetchType: "all"
            });
            await queryClient.invalidateQueries({
                queryKey: appQueries.userModpacks(curUser).queryKey,
                refetchType: "all"
            });
            await router.invalidate({sync: true});
        }
    });

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        mutation.mutate(formData);
    }
    
    return (
        <Popover>
            <ToolbarTooltip content="Change name" side="top">
                <PopoverTrigger asChild>
                    <Button variant={"default"}>
                        <Edit />
                    </Button>
                </PopoverTrigger>
            </ToolbarTooltip>
            <PopoverContent className="p-2 bg-popover rounded-md">
                <div className="w-fit">
                    <form onSubmit={handleSubmit} className="flex justify-center items-center">
                        <Input type="text" name="newName" id="newName" defaultValue={curName}/>
                        <Button type="submit" variant={"default"}><Save/></Button>
                    </form>
                </div>
            </PopoverContent>
        </Popover>
    )
}


export default function ModpackView() {
    const { curUser } = Route.useLoaderData();
    const { pathname } = useLocation();
    const {username, slug} = Route.useParams();
    const navigate = useNavigate();
    const {data: modpack} = useSuspenseQuery(appQueries.modpack(username, slug));

    if(!modpack) {
        navigate({to: "/"});
        return;
    }

    const modIds = modpack.versions[0].versionMods.map((versionMod: VersionMod) => versionMod.modId);
    const {data: referenceIds} = useSuspenseQuery(appQueries.modReferenceIds(modIds));
    const {data: modData} = useSuspenseQuery(appQueries.modpackModData(referenceIds));

    return <section className="flex flex-col items-center justify-center">
        <div className="flex flex-col justify-center items-center mb-4 gap-2">
            <img src={modpackImage} alt="Modpack logo" className="bg-black aspect-square w-28 h-28 md:w-40 md:h-40" />
            <div className="flex items-end justify-center gap-2">
                <h1 className="text-5xl font-bold">{modpack.name}</h1>
                {curUser ? <EditModpackNameDropdown curName={modpack.name}/> : ""}
            </div>
            <div className="flex flex-row items-center justify-center gap-2">
                <CopyButton text={"http:localhost:3000" + pathname} tooltipSide="bottom" tooltipLabel="Link to modpack" />
                <BreadCrumbLink link={`modpack/${username}/${slug}/suggestions`} text="Suggestions">
                    <Button variant={"default"}>
                        Suggestions <Users />
                    </Button>
                </BreadCrumbLink>
                <Button variant={"destructive"}>Delete <Trash2 /></Button>
            </div>
        </div>

        <div className="flex flex-col justify-center items-center w-3/4">
            <h1 className="text-4xl font-bold self-start">Mods</h1>
            <div className="flex flex-col justify-start items-start min-w-[300px] min-h-[400px] border w-1/2 border-black dark:border-gray-400 bg-gray-700 flex flex-col h-96 w-96 overflow-y-auto overflow-x-clip w-full">
                {modData?.map((modData: CurseForgeMod, index: number) => {
                    return <CurseForgeModDisplay key={index} curseforgeMod={modData} />
                })}
                <h1 className={`${modData && modData.length > 0 ? "hidden" : ""}`}>It's looking empty in here...</h1>
            </div>
        </div>
    </section>
}
