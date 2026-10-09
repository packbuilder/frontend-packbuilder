import { getCurseForgeModData, getModpack, getModpackSuggestions, getModReferenceIds, getSuggestion, searchCurseforgeMods, getUserModpacks, getUserSuggestions, getMinecraftVersions, getUserBookmarks, getUserById, getVersionMods, getSuggestionModifications } from "@/lib/api";
import type { ConflictState, ModAction, ModLoader, SuggestionState } from "@/types/enums";
import { keepPreviousData, queryOptions } from "@tanstack/react-query";

export const appQueries = {
    keys: {
        modpackSuggestions: (modpackId: number) => ["modpackSuggestions", modpackId],

        suggestionModifications: (modpackId: number, suggestionId: number) => ["suggestionModifications", modpackId, suggestionId],

        modpackVersionMods: (modpackId: number, versionIteration: string) => ["modpackVersionMods", modpackId, versionIteration],

        userModpacks: (userId: number | null | undefined) => ["userModpacks", userId],

        userSuggestions: (userId: number) => ["userSuggestions", userId],

        userBookmarks: (userId: number | null | undefined) => ["userBookmarks", userId],

        modificationModData: (suggestionId: number) => ["modificationModData", suggestionId]
    },

    suggestion: (modpackId: number, suggestionId: number) => queryOptions({
        queryKey: ["suggestion", modpackId, suggestionId],
        queryFn: () => getSuggestion(modpackId, suggestionId),
    }),

    modpack: (modpackId: number) => queryOptions({
        queryKey: ["modpack", modpackId],
        queryFn: () => getModpack(modpackId),
    }),

    modpackVersionMods: (modpackId: number, versionIteration: string, page: number, searchQuery?: string, pageSize?: number) => queryOptions({
        queryKey: [...appQueries.keys.modpackVersionMods(modpackId!, versionIteration!), page, pageSize, searchQuery],
        queryFn: () => getVersionMods(modpackId!, versionIteration!, page, pageSize || 50, searchQuery || ""),
        placeholderData: keepPreviousData
    }),

    modpackSuggestions: (modpackId: number, page: number, searchQuery?: string, filter?: SuggestionState, pageSize?: number) => queryOptions({
        queryKey: [...appQueries.keys.modpackSuggestions(modpackId), page, pageSize, searchQuery, filter],
        queryFn: () => getModpackSuggestions(modpackId, page, pageSize || 50, searchQuery || "", filter),
        placeholderData: keepPreviousData
    }),  

    suggestionModifications: (modpackId: number, suggestionId: number, page: number, searchQuery?: string, modActionFilter?: ModAction, conflictStateFilter?: ConflictState, pageSize?: number) =>  queryOptions({
        queryKey: [...appQueries.keys.suggestionModifications(modpackId, suggestionId), page, pageSize, searchQuery, modActionFilter, conflictStateFilter],
        queryFn: () => getSuggestionModifications(modpackId, suggestionId, page, searchQuery || "", modActionFilter, conflictStateFilter, pageSize),
        placeholderData: keepPreviousData
    }),
    
    userModpacks: (userId: number | null | undefined, page: number, searchQuery?: string, pageSize?: number) => queryOptions({
        queryKey: [...appQueries.keys.userModpacks(userId), page, searchQuery, pageSize],
        queryFn: () => {
            if(!userId) {
                throw new Error("UserId is required to fetch user modpacks")
            }

            return getUserModpacks(userId, page, searchQuery || "", pageSize)
        },
        placeholderData: keepPreviousData
    }),

    userSuggestions: (userId: number, page: number, searchQuery?: string, pageSize?: number, filter?: SuggestionState) => queryOptions({
        queryKey: [...appQueries.keys.userSuggestions(userId), page, searchQuery, pageSize, filter],
        queryFn: () => getUserSuggestions(userId, page, searchQuery, pageSize, filter),
        placeholderData: keepPreviousData
    }),

    userBookmarks: (userId: number | null | undefined, page: number, searchQuery?: string, pageSize?: number) => queryOptions({
        queryKey: [...appQueries.keys.userBookmarks(userId), page, searchQuery, pageSize],
        queryFn: () => getUserBookmarks(page, searchQuery, pageSize),
        placeholderData: keepPreviousData
    }),

    userData: (userId: number) => queryOptions({
        queryKey: ["userProfile", userId.toString()],
        queryFn: () => getUserById(userId),
    }),

    modReferenceIds: (modIds: number[] | null | undefined) => queryOptions({
        queryKey: ["modReferenceIds", modIds?.join(",") ?? "noModIds"],
        queryFn: () => getModReferenceIds(modIds!),
        enabled: !!modIds
    }),

    modpackModData: (referenceIds: string[] | null | undefined) => queryOptions({
        queryKey: ["modpackModData", referenceIds?.join(",") ?? "noReferenceIds"],
        queryFn: () => getCurseForgeModData(referenceIds!),
        enabled: !!referenceIds,
    }),

    modificationModData: (suggestionId: number, modificationReferenceIds: string[] | null | undefined) => queryOptions({
        queryKey: [...appQueries.keys.modificationModData(suggestionId), modificationReferenceIds?.join(",") ?? "NoModificationModData"],
        queryFn: () => getCurseForgeModData(modificationReferenceIds!),
        enabled: !!modificationReferenceIds
    }),

    curseForgeSearchResults: (searchQuery: string, page: number, sortMethod: "0" | "1" | "2" | "3", gameVersion: string, modLoader: ModLoader) => queryOptions({
        queryKey: ["curseForgeSearchResults", searchQuery, page, sortMethod, gameVersion, modLoader],
        queryFn: () => searchCurseforgeMods(searchQuery, page, sortMethod, gameVersion, modLoader)
    }),

    minecraftVersions: () => queryOptions({
        queryKey: ["minecraftVersions"],
        queryFn: () => getMinecraftVersions()
    }),
};