import { enumNameFromValue } from "@/lib/utils"
import { Game, ModLoader, SuggestionState } from "@/types/enums"
import type { Modpack } from "@/types/modpack"
import type { Suggestion } from "@/types/suggestion"
import { CloudAlert, CloudCheck, CloudCog, History, Package, PackageOpen, Tag } from "lucide-react"

export function ModLoaderTag({modLoader} : {modLoader: ModLoader}) {
    return (
        <span className="infoPill">
            <PackageOpen className="text-orange-100 size-4"/>
            <p>{enumNameFromValue(ModLoader, modLoader.toString())}</p>
        </span>
    )
}

export function GameTag({game, gameVersion} : {game: Game, gameVersion: string}) {
    return (
        <span className="infoPill">
            <Tag className="text-green-100 size-4"/> 
            <p>{enumNameFromValue(Game, game.toString())} {gameVersion}</p>
        </span>
    )
}

export function ModpackTags({modpack} : {modpack: Modpack}) {
    const {iterations, versionMods, gameVersion, modLoader} = modpack.versions[0];

    return (
        <>
            <span className="infoPill">
                <History className="size-4 text-white" /> 
                <p>Version {iterations}</p>
            </span>
            <span className="infoPill">
                <Package className="size-4 text-green-500" /> 
                <p>{versionMods.length} Mods</p>
            </span>
            <ModLoaderTag modLoader={modLoader}/>
            <GameTag game={modpack.game} gameVersion={gameVersion}/>
        </>
    )
}

export function SuggestionTags({suggestion, modpack} : {suggestion: Suggestion, modpack: Modpack}) {
    const {state, gameVersion, modLoader} = suggestion;
    const {game} = modpack;

    return (
        <>
            <span className="infoPill">
                {
                    state.toString() === SuggestionState.Unverified ?
                    <>
                        <CloudAlert className="text-red-500 size-4"/> 
                        <p>Unverified</p>
                    </>
                    : state.toString() === SuggestionState.VerificationPending ?
                    <>
                        <CloudCog className="text-white size-4"/> 
                        <p>Verification pending</p>
                    </>
                    :
                    <>
                        <CloudCheck className="text-green-500 size-4"/> 
                        <p>Verified</p>
                    </>
                }
            </span>
            <ModLoaderTag modLoader={modLoader}/>
            <GameTag game={game} gameVersion={gameVersion}/>

        </>
    )
}