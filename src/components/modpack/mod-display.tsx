import type { CurseForgeMod } from "@/types/curseforge/curseforgeMod";
import type { VersionMod } from "@/types/versionMod";
import ToolbarTooltip from "../toolbar-tooltip";
import { Link } from "@tanstack/react-router";
import { Button } from "../ui/button";
import { Download, ExternalLink, Heart, RefreshCcw, TriangleAlert } from "lucide-react";
import { Separator } from "../ui/separator";
import { ConflictState } from "@/types/enums";
import { timeSinceCurDate } from "@/lib/utils";

export function CurseForgeModDisplay({curseforgeMod, versionMod} : {curseforgeMod: CurseForgeMod, versionMod: VersionMod}) {
    const formattedDownloadCount = new Intl.NumberFormat('en-US', {
        notation: "compact"
    }).format(curseforgeMod.downloadCount);

    return <div className="w-full bg-[var(--surface-1)]">
        <div className="grid w-full h-fit min-h-40 grid-cols-[60px_minmax(0,1fr)] grid-rows-[auto_auto] gap-x-3 gap-y-3 p-2">
            <div className="flex items-center justify-center">
                <img src={curseforgeMod.logoUrl} className="size-15 rounded-sm shrink-0" />
            </div>
            <header className="flex flex-col gap-2 w-full justify-center">
                <div className="flex items-center justify-center max-w-full w-fit gap-2 min-w-0 min-md:w-full min-md:justify-start min-md:w-fit min-md:text-xl">
                    <h2 className="text-md font-bold truncate min-w-0 flex-1 max-w-fit text-[var(--text-primary)]">
                        {curseforgeMod.name}
                    </h2>
                    <Separator orientation="vertical" />
                    <p className="text-md truncate min-w-0 flex-1 max-w-fit text-[var(--text-secondary)] min-md:text-lg">
                        by {curseforgeMod.authors[0].name}
                    </p>
                </div>  
                <p className="text-sm text-left line-clamp-2 min-w-0 w-full text-[var(--text-secondary)]">{curseforgeMod.summary}</p>
            </header>
            <div className="flex items-center justify-between w-full h-fit col-span-2">
                <div className="flex items-center justify-center flex-wrap gap-2">
                    <div className="flex items-center flex-wrap justify-center gap-2 text-md text-[var(--text-secondary)]">
                        <span className="flex items-center justify-center w-fit gap-1 text-center">
                            <Download className="size-4" /> {formattedDownloadCount}
                        </span>
                        <span className="flex items-center justify-center w-fit gap-1 text-center">
                            <RefreshCcw className="size-4" /> {timeSinceCurDate(curseforgeMod.dateModified)}
                        </span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                        <ToolbarTooltip content="Curseforge link" side="top">
                            <Link to={curseforgeMod.websiteLink} target="_blank" rel="noopener noreferrer">
                                <Button variant={"default"}><ExternalLink /></Button>
                            </Link>
                        </ToolbarTooltip>
                        <ToolbarTooltip side="top" content="This modification was unable to install some dependencies, may or may not work.">
                            <Button className={`bg-yellow-400 hover:bg-yellow-400 ${versionMod.conflictState === ConflictState.MissingDependencies ? "" : "hidden"}`}>
                                <TriangleAlert className="text-black" />
                            </Button>
                        </ToolbarTooltip>
                    </div>
                </div>
            </div>
        </div>
        <Separator />
    </div>
}