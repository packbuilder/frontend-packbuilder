import type { CurseForgeMod } from "@/types/curseforge/curseforgeMod";
import type { VersionMod } from "@/types/versionMod";
import { Link } from "@tanstack/react-router";
import { CircleCheck, Download, RefreshCcw, TriangleAlert } from "lucide-react";
import { Separator } from "../ui/separator";
import { ConflictState } from "@/types/enums";
import { timeSinceCurDate } from "@/lib/utils";
import InfoPill from "../info-pill";
import DisplayImage from "../display-image";

export function VersionModDisplay({curseforgeMod, versionMod} : {curseforgeMod: CurseForgeMod, versionMod: VersionMod}) {
    const formattedDownloadCount = new Intl.NumberFormat('en-US', {
        notation: "compact"
    }).format(curseforgeMod.downloadCount);

    
    return <Link to={curseforgeMod.websiteLink} target="_blank" rel="noopener noreferrer" className="w-full group bg-[var(--surface-1)] transition duration-200">
        <div className="grid w-full h-fit grid-cols-[auto_minmax(0,1fr)] grid-rows-[auto_auto] gap-x-3 gap-y-3 p-2 group-hover:bg-white/5 min-md:grid-cols-[auto_minmax(0,3fr)_1fr]">
            <div className="flex items-center justify-center w-fit min-md:row-span-3">
                <DisplayImage src={curseforgeMod.logoUrl} />
            </div>
            <header className="flex flex-col gap-2 w-full justify-center">
                <div className="flex items-center justify-center max-w-full w-fit gap-2 min-w-0 min-md:w-full min-md:justify-start min-md:w-fit min-md:text-xl">
                    <h2 className="text-md font-bold truncate min-w-0 flex-1 max-w-fit group-hover:underline text-[var(--text-primary)]">
                        {curseforgeMod.name}
                    </h2>
                    <Separator orientation="vertical" />
                    <h3 className="truncate min-w-0 flex-1 max-w-fit text-[var(--text-secondary)]">
                        by {curseforgeMod.authors[0].name}
                    </h3>
                </div>  
                <p className="text-sm text-left line-clamp-2 min-w-0 w-full text-[var(--text-secondary)]">{curseforgeMod.summary}</p>
            </header>
            <div className="flex items-center justify-between w-full h-fit col-span-2">
                <div className="flex items-center justify-center flex-wrap gap-2">
                    <div className="flex items-center flex-wrap justify-center gap-2 text-md text-[var(--text-secondary)]">
                        <span className="flex items-center justify-center w-fit gap-1 text-center">
                            <Download className="size-4" /> <p>{formattedDownloadCount}</p>
                        </span>
                        <span className="flex items-center justify-center w-fit gap-1 text-center">
                            <RefreshCcw className="size-4" /> <p>{timeSinceCurDate(curseforgeMod.dateModified)}</p>
                        </span>
                    </div>
                    <div className="flex items-center justify-center gap-2 min-md:col-start-3 min-md:row-start-1">
                        <InfoPill>
                            {
                                versionMod.conflictState === ConflictState.MissingDependencies ? 
                                <div className="flex items-center justify-center items-center gap-1">
                                    <p className="text-xs text-nowrap">Missing dependencies</p> 
                                    <TriangleAlert className="text-yellow-500 size-4" />
                                </div>
                                : versionMod.conflictState === ConflictState.Conflicting ? 
                                <div className="flex items-center justify-center items-center gap-1">
                                    <p className="text-xs text-nowrap">Conflicting</p> 
                                    <TriangleAlert className="text-red-500 size-4" />
                                </div>
                                :
                                <div className="flex items-center justify-center items-center gap-1">
                                    <p className="text-xs text-nowrap">No conflicts</p> 
                                    <CircleCheck className="text-green-500 size-4" />
                                </div>
                            }
                        </InfoPill>
                    </div>
                </div>
            </div>
        </div>
        <Separator />
    </Link>
}