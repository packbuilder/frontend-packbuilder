import modpackImage from "@/modpack.gif"
import BreadCrumbLink from "./breadcrumb-link";
import type { Modpack } from "@/types/modpack";
import ToolbarTooltip from "./toolbar-tooltip";
import { Button } from "./ui/button";
import { File } from "lucide-react";

// TODO: Turn into shadcn item component?
export function ModpackCardLarge({modpack} : {modpack: Modpack}) {
    return <BreadCrumbLink 
    link={`/modpack/${modpack.user.name}/${modpack.slug}`}
    text="Modpack"
    className="duration-100 cursor-pointer relative before:content-[''] before:absolute before:top-0 before:left-[-150%] before:w-[60%] before:h-full before:bg-white before:opacity-40 before:skew-x-[45deg] before:transition-all before:duration-500 before:ease-linear hover:before:left-[180%] hover:cursor-pointer focus:shadow focus:scale-110 hover:shadow hover:scale-110 p-2 border dark:border-white flex flex-col gap-2 items-center w-44 rounded overflow-hidden" 
    style={{
        background:"rgba(255, 255, 255, 0.2)",
        borderRadius: "16px",
        boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
        backdropFilter: "blur(12.1px)",
        WebkitBackdropFilter: "blur(5px)",
        border:" 1px solid rgba(255, 255, 255, 0.3)"
    }}>
        <div className="flex flex-col items-center justify-center gap-2">
            <img className="rounded" src={modpackImage} alt="" />
            <div className="flex flex-col text-center items-center justify-center">
                <h1 className="font-bold text-xl text-left w-full">{modpack.name}</h1>
                <p className="text-center w-full">By {modpack.user.name}</p>
            </div>
        </div>
    </BreadCrumbLink>
}

export function ModpackCardCompact({modpack} : {modpack: Modpack}) {
    return <BreadCrumbLink 
    link={`/modpack/${modpack.user.name}/${modpack.slug}`}
    text="Modpack"
    className="duration-100 cursor-pointer relative hover:cursor-pointer focus:shadow focus:scale-110 hover:shadow hover:scale-110 p-2 border dark:border-white fslex flex-col gap-2 items-center w-full max-w-120 rounded overflow-hidden"
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
                <img className="border-white border-2 rounded-[50%] size-[50px]" src={modpackImage} alt="" />
                <div className="flex flex-col items-center justify-center">
                    <h1 className="font-bold text-xl text-left w-full">{modpack.name}</h1>
                    <p className="text-left w-full">{modpack.user.name}</p>
                </div>
                <ToolbarTooltip side="top" content="Total mods">
                    <Button variant={"default"} className="bg-green-500 hover:bg-green-500 text-lg font-bold">
                        <File /> {modpack.versions[0].versionMods.length}
                    </Button>
                </ToolbarTooltip>
            </div>
        </div>
    </BreadCrumbLink>
}
