import modpackImage from "@/modpack.gif"
import BreadCrumbLink from "../breadcrumb-link";
import type { Modpack } from "@/types/modpack";
import ToolbarTooltip from "../toolbar-tooltip";
import { Button } from "../ui/button";
import { File } from "lucide-react";
import { Truncate } from "@re-dev/react-truncate"

// TODO: Turn into shadcn item component?
export function ModpackCardLarge({modpack} : {modpack: Modpack}) {
    return <BreadCrumbLink 
    link={`/modpack/${modpack.user!.name}/${modpack.id}`}
    text="Modpack"
    className="duration-100 cursor-pointer relative before:content-[''] before:absolute before:top-0 before:left-[-150%] before:w-[60%] before:h-full before:bg-white before:opacity-40 before:skew-x-[45deg] before:transition-all before:duration-500 before:ease-linear hover:before:left-[180%] hover:cursor-pointer focus:shadow focus:scale-110 hover:shadow hover:scale-110 p-2 border flex flex-col gap-2 items-center rounded overflow-hidden max-w-45 bg-[var(--surface-2)] rounded-2xl shadow-[0_4px_30px_rgba(0,0,0,0.1)] backdrop-blur-[12.1px] border-[.1px] border-white/30">
        <div className="flex flex-col items-center justify-center gap-2">
            <img className="rounded w-40 h-45" src={modpackImage} alt="" />
            <div className="flex flex-col text-center items-center justify-center w-full">
                <h1 className="font-bold text-lg text-center w-full">
                    <Truncate lines={1} ellipsis={"..."}>
                        {modpack.name}
                    </Truncate>
                </h1>
                <p className="text-center text-md w-full">
                    <Truncate lines={1} ellipsis={"..."}>
                        By {modpack.user!.name}
                    </Truncate>
                </p>
            </div>
        </div>
    </BreadCrumbLink>
}

export function ModpackCardCompact({modpack} : {modpack: Modpack}) {
    return <BreadCrumbLink 
    link={`/modpack/${modpack.user!.name}/${modpack.id}`}
    text="Modpack"
    className="duration-100 cursor-pointer relative hover:cursor-pointer focus:shadow focus:scale-110 hover:shadow hover:scale-110 p-2 border dark:border-white fslex flex-col gap-2 items-center w-full max-w-120 rounded overflow-hidden rounded-2xl shadow-[0_4px_30px_rgba(0,0,0,0.1)] backdrop-blur-[12.1px] border-[.1px] border-white/30">
        <div className="flex items-center justify-between w-full">
            <div className="flex items-center justify-center gap-2">
                <img className="border-white border-2 rounded-[50%] size-[50px]" src={modpackImage} alt="" />
                <div className="flex flex-col items-center justify-center">
                    <h1 className="font-bold text-xl text-left w-full">{modpack.name}</h1>
                    <p className="text-left w-full">{modpack.user!.name}</p>
                </div>
            </div>
            <ToolbarTooltip side="top" content="Total mods">
                <Button variant={"default"} className="bg-green-500 hover:bg-green-500 text-lg font-bold">
                    <File /> {modpack.versions[0].versionMods.length}
                </Button>
            </ToolbarTooltip>
        </div>
    </BreadCrumbLink>
}
