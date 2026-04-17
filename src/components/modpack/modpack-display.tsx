import type { Modpack } from "@/types/modpack";
import { History } from "lucide-react";
import DisplayImage from "../display-image";
import BreadCrumbLink from "../breadcrumb-link";
import modpackImage from "@/modpack.gif"
import { Separator } from "../ui/separator";

export default function ModpackDisplay({modpack} : {modpack: Modpack}) {
    return <BreadCrumbLink text="Modpack" link={`/modpack/${modpack.user?.name}/${modpack.id}`} className="w-full group bg-[var(--surface-1)] transition duration-200">
        <div className="grid w-full h-fit grid-cols-[auto_minmax(0,1fr)] grid-rows-[auto] gap-x-3 gap-y-3 p-2 py-4 group-hover:bg-white/5 min-md:grid-cols-[auto_minmax(0,3fr)_1fr]">
            <div className="flex items-center justify-center w-fit min-md:row-span-2">
                <DisplayImage src={modpackImage} />
            </div>
            <header className="flex flex-col gap-2 w-full justify-center items-start">
                <div className="flex items-center justify-center max-w-full w-fit gap-2 min-w-0 min-md:w-full min-md:justify-start min-md:w-fit min-md:text-xl">
                    <h2 className="text-md font-bold truncate min-w-0 flex-1 max-w-fit group-hover:underline text-[var(--text-primary)]">
                        {modpack.name}
                    </h2>
                    <Separator orientation="vertical" />
                    <p className="text-md truncate min-w-0 flex-1 max-w-fit text-[var(--text-secondary)] min-md:text-lg">
                        by {modpack.user.name}
                    </p>
                </div>  
                <div className="flex items-center justify-center gap-2 text-md text-[var(--text-secondary)]">
                    <span className="flex items-start justify-center w-fit gap-1 text-center">
                        <History className="size-4" /> Version {modpack.versions[0].iterations}
                    </span>
                </div>
            </header>
        </div>
        <Separator />
    </BreadCrumbLink>
}