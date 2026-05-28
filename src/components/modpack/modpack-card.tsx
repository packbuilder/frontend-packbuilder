import modpackImage from "@/modpack.gif"
import type { Modpack } from "@/types/modpack";
import ToolbarTooltip from "../toolbar-tooltip";
import { Button } from "../ui/button";
import { File } from "lucide-react";
import { GlassCard } from "../glass-card";
import { Link } from "@tanstack/react-router";
import { ImageType } from "@/types/enums";

export function ModpackCardLarge({modpack} : {modpack: Modpack}) {
    return <Link to="/modpack/$username/$modpackId" params={{username: modpack.user.name, modpackId: modpack.id.toString()}}>
        <GlassCard className="size-fit max-w-45 flex flex-col items-center justify-center gap-2 p-2">
            <img className="rounded w-40 h-45" src={modpack.imageType === ImageType.Stock ? `/modpackAvatars/${modpack.imageValue}` : modpack.imageValue} alt={"user profile picture"} />
            <div className="flex flex-col text-center items-center justify-center w-3/4">
                <h2 className="font-bold text-lg text-center w-full truncate">{modpack.name}</h2>
                <h3 className="text-center text-md w-full truncate">By {modpack.user!.name}</h3>
            </div>
        </GlassCard>
    </Link>
}

export function ModpackCardCompact({modpack} : {modpack: Modpack}) {
    return <Link to="/modpack/$username/$modpackId" params={{
        username: modpack.user.name,
        modpackId: modpack.id.toString()
    }}>
        <GlassCard className="flex items-center justify-between duration-100 p-2 border gap-2 w-full w-120">
            <div className="flex items-center justify-center gap-2">
                <img className="border-white border-2 rounded-[50%] size-[50px]" src={modpackImage} alt="" />
                <div className="flex flex-col items-center justify-center">
                    <h2 className="font-bold text-xl text-left w-full">{modpack.name}</h2>
                    <p className="text-left w-full">{modpack.user!.name}</p>
                </div>
            </div>
            <ToolbarTooltip side="top" content="Total mods">
                <Button variant={"default"} className="bg-green-500 hover:bg-green-500 text-lg font-bold">
                    <File /> {modpack.versions[0].versionMods.length}
                </Button>
            </ToolbarTooltip>
        </GlassCard>
    </Link>
}
