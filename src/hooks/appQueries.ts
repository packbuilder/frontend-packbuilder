import { getCurseForgeModData, getModpack, getModpackSuggestions, getModReferenceIds, getSuggestion, searchCurseforgeMods, getUserModpacks, getUserSuggestions, getUserByUsername, getMinecraftVersions } from "@/lib/api";
import type { User } from "@/types/user";
import { queryOptions } from "@tanstack/react-query";

export const appQueries = {
    suggestion: (username: string, slug: string, suggestionId: string) => queryOptions({
        queryKey: ["suggestion", suggestionId],
        queryFn: () => getSuggestion(username, slug, suggestionId),
    }),

    modpack: (username: string, slug: string) => queryOptions({
        queryKey: ["modpack", slug],
        queryFn: () => getModpack(username, slug),
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

    userSuggestions: (user: User | null) => queryOptions({
        queryKey: user ? ["suggestions", user.id] : ["suggestions", "no-user"],
        queryFn: () => getUserSuggestions(user!.id),
        enabled: !!user
    }),

    modReferenceIds: (modIds: number[] | null | undefined) => queryOptions({
        queryKey: modIds ? ["referenceIds", modIds] : ["referenceIds", []],
        queryFn: () => getModReferenceIds(modIds!),
        enabled: !!modIds
    }),

    modpackModData: (referenceIds: string[] | null | undefined) => queryOptions({
        queryKey: referenceIds ? ["modpackModData", referenceIds] : ["modpackModData", []],
        queryFn: () => getCurseForgeModData(referenceIds!),
        enabled: !!referenceIds
    }),

    modpackSuggestions: (username: string, slug: string) => queryOptions({
        queryKey: ["modpackSuggestions", slug],
        queryFn: () => getModpackSuggestions(username, slug)
    }),  

    modificationModData: (suggestionId: string, modificationReferenceIds: string[] | null | undefined) => queryOptions({
        queryKey: modificationReferenceIds ? ["modificationModData", suggestionId, modificationReferenceIds] : ["modificationModData", suggestionId, []],
        queryFn: () => getCurseForgeModData(modificationReferenceIds!),
        enabled: !!modificationReferenceIds
    }),

    curseForgeSearchResults: (searchQuery: string, page: number, sortMethod: "0" | "1" | "2" | "3") => queryOptions({
        queryKey: ["modSearchResults", searchQuery, page, sortMethod],
        queryFn: () => searchCurseforgeMods(searchQuery, page, sortMethod)
    }),

    minecraftVersions: () => queryOptions({
        queryKey: ["minecraftVersions"],
        queryFn: () => getMinecraftVersions()
    }),
};