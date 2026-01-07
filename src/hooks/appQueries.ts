import { getCurseForgeModData, getModpack, getModReferenceIds, getSuggestion, getUserModpacks } from "@/lib/api";
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

    userModpacks: (user: User | null) => queryOptions({
        queryKey: user ? ["modpacks", user.id] : ["modpacks", "no-user"],
        queryFn: () => getUserModpacks(user!),
        enabled: !!user,
    }),

    modReferenceIds: (modIds: number[]) => queryOptions({
        queryKey: ["referenceIds", modIds],
        queryFn: () => getModReferenceIds(modIds)
    }),

    curseForgeModData: (referenceIds: string[] | null) => queryOptions({
        queryKey: referenceIds ? ["modData", referenceIds] : ["modData", []],
        queryFn: () => getCurseForgeModData(referenceIds!),
        enabled: !!referenceIds
    }),

    
};