import { getCurseForgeModData, getModpack, getModpackSuggestions, getModReferenceIds, getSuggestion, searchCurseforgeMods, getUserModpacks, getUserSuggestions, getMinecraftVersions, getUserBookmarks, getUserById, getVersionMods, getSuggestionModifications } from "@/lib/api";
import type { ConflictState, ModAction, ModLoader, SuggestionState } from "@/types/enums";
import type { User } from "@/types/user";
import { queryOptions } from "@tanstack/react-query";

export const appQueries = {
    suggestion: (modpackId: string, suggestionId: string) => queryOptions({
        queryKey: ["suggestion", Number(modpackId), Number(suggestionId)],
        queryFn: () => getSuggestion(modpackId, suggestionId),
    }),

    modpack: (modpackId: string) => queryOptions({
        queryKey: ["modpack", Number(modpackId)],
        queryFn: () => getModpack(modpackId),
    }),

    versionMods: (modpackId: string | null | undefined, versionIteration: string | null | undefined, page: number, searchQuery?: string, pageSize?: number) => queryOptions({
        queryKey: ["modpackVersionMods", Number(modpackId), Number(versionIteration), Number(page), Number(pageSize), searchQuery],
        queryFn: () => getVersionMods(modpackId!, versionIteration!, page, pageSize || 50, searchQuery || ""),
        enabled: !!modpackId && !!versionIteration
    }),

    modpackSuggestions: (modpackId: string, page: number, searchQuery?: string, filter?: SuggestionState, pageSize?: number) => queryOptions({
        queryKey: ["modpackSuggestions", Number(modpackId), Number(page), Number(pageSize), searchQuery, filter],
        queryFn: () => getModpackSuggestions(modpackId, page, pageSize || 50, searchQuery || "", filter),
        enabled: !!modpackId
    }),  

    suggestionModifications: (modpackId:string, suggestionId: string, page: number, searchQuery?: string, modActionFilter?: ModAction, conflictStateFilter?: ConflictState, pageSize?: number) =>  queryOptions({
        queryKey: ["suggestionModifications", Number(modpackId), Number(suggestionId), Number(page), Number(pageSize), searchQuery, modActionFilter, conflictStateFilter],
        queryFn: () => getSuggestionModifications(modpackId, suggestionId, page, searchQuery || "", modActionFilter, conflictStateFilter, pageSize),
        enabled: !!suggestionId && !!modpackId
    }),

    userData: (userId: number) => queryOptions({
        queryKey: ["userProfile", userId.toString()],
        queryFn: () => getUserById(userId),
    }),
    
    userModpacks: (user: User | null) => queryOptions({
        queryKey: user ? ["modpacks", user.id] : ["modpacks", "no-user"],
        queryFn: () => getUserModpacks(user!),
        enabled: !!user,
    }),

    userBookmarks: (user: User | null) => queryOptions({
        queryKey: user ? ["bookmarks", user.id] : ["bookmarks", "no-user"],
        queryFn: () => getUserBookmarks(),
        enabled: !!user,
    }),

    userSuggestions: (user: User | null) => queryOptions({
        queryKey: user ? ["suggestions", user.id] : ["suggestions", "no-user"],
        queryFn: () => getUserSuggestions(user!.id),
        enabled: !!user
    }),

    modReferenceIds: (modIds: number[] | null | undefined) => queryOptions({
        queryKey: ["referenceIds", modIds?.join(",") ?? "noModIds"],
        queryFn: () => getModReferenceIds(modIds!),
        enabled: !!modIds
    }),

    curseForgeModData: (referenceIds: string[] | null | undefined) => queryOptions({
        queryKey: ["modpackModData", referenceIds?.join(",") ?? "noReferenceIds"],
        queryFn: () => getCurseForgeModData(referenceIds!),
        enabled: !!referenceIds,
    }),

    modificationModData: (suggestionId: string, modificationReferenceIds: string[] | null | undefined) => queryOptions({
        queryKey: ["modificationModData", suggestionId, modificationReferenceIds?.join(",") ?? "NoModificationModData"],
        queryFn: () => getCurseForgeModData(modificationReferenceIds!),
        enabled: !!modificationReferenceIds
    }),

    curseForgeSearchResults: (searchQuery: string, page: number, sortMethod: "0" | "1" | "2" | "3", gameVersion: string, modLoader: ModLoader) => queryOptions({
        queryKey: ["modSearchResults", searchQuery, page, sortMethod, gameVersion, modLoader],
        queryFn: () => searchCurseforgeMods(searchQuery, page, sortMethod, gameVersion, modLoader)
    }),

    minecraftVersions: () => queryOptions({
        queryKey: ["minecraftVersions"],
        queryFn: () => getMinecraftVersions()
    }),
};