import { getCurseForgeModData, getModpack, getModpackSuggestions, getModReferenceIds, getSuggestion, searchCurseforgeMods, getUserModpacks, getUserSuggestions, getUserByUsername, getMinecraftVersions, getUserBookmarks } from "@/lib/api";
import type { ModLoader } from "@/types/enums";
import type { User } from "@/types/user";
import { queryOptions } from "@tanstack/react-query";

export const appQueries = {
    suggestion: (modpackId: string, suggestionId: string) => queryOptions({
        queryKey: ["suggestion", suggestionId],
        queryFn: () => getSuggestion(modpackId, suggestionId),
    }),

    modpack: (modpackId: string) => queryOptions({
        queryKey: ["modpack", modpackId],
        queryFn: () => getModpack(modpackId),
    }),

    userData: (username: string) => queryOptions({
        queryKey: ["userProfile", username],
        queryFn: () => getUserByUsername(username),
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
        enabled: !!referenceIds
    }),

    modpackSuggestions: (modpackId: string) => queryOptions({
        queryKey: ["modpackSuggestions", modpackId],
        queryFn: () => getModpackSuggestions(modpackId)
    }),  

    modificationModData: (suggestionId: string, modificationReferenceIds: string[] | null | undefined) => queryOptions({
        queryKey: ["modificationModData", suggestionId, modificationReferenceIds?.join(",") ?? "NoModificationModData"],
        queryFn: () => getCurseForgeModData(modificationReferenceIds!),
        enabled: !!modificationReferenceIds
    }),

    curseForgeSearchResults: (searchQuery: string, page: number, sortMethod: "0" | "1" | "2" | "3", gameVersion: string, modLoader: ModLoader) => queryOptions({
        queryKey: ["modSearchResults", searchQuery, page, sortMethod],
        queryFn: () => searchCurseforgeMods(searchQuery, page, sortMethod, gameVersion, modLoader)
    }),

    minecraftVersions: () => queryOptions({
        queryKey: ["minecraftVersions"],
        queryFn: () => getMinecraftVersions()
    }),
};