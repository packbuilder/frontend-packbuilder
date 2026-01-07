import { useApi } from "@/hooks/useApi";
import type { Modpack } from "@/types/modpack";
import type { User } from "@/types/user";
import type { CurseForgeMod } from "@/types/curseforge/curseforgeMod";
import type { Suggestion } from "@/types/suggestion";
import type { CurseForgePagination } from "@/types/curseforge/curseforgePagination";
import type { SortMethod } from "@/types/curseforge/curseForgeSortMethod";
import { AxiosError } from "axios";
import type { CreateModificationDto } from "@/types/dtos/createModificationDto";
import type { Modification } from "@/types/modification";
import type { UpdateUserDto } from "@/types/dtos/updateProfileDto";
import Cookies from "js-cookie";
import type { UpdateModpackDto } from "@/types/dtos/updateModpackDto";
import type { Version } from "@/types/version";

const api = useApi();

export function getUserToken() {
  const token = Cookies.get("_packbuilder_jwt");

  if(!token) {
    return;
  } 

  return token;
}

export async function login(email: string, password: string) {
    try {
        const response = await api.post(`/sessions`, {email, password});
        const data = response.data as string
        return data;
    } catch (error) {
        const err = error as unknown as AxiosError
        console.error(err.message);
        return null;
    }
}

export async function verifySuggestion(suggestionId: number, username: string, slug: string) {
    const token = getUserToken();

    try {
        const response = await api.post(`/${username}/modpacks/${slug}/suggestions/${suggestionId}/verify`, null, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        const data = response.data as Suggestion;
        return data;
    } catch (error) {
        const err = error as unknown as AxiosError
        console.error(err.message);
        return null;
    }
}

export async function searchCurseforgeMods(searchQuery: string, page: number, sortMethod: SortMethod) {
    const token = getUserToken();

    try {
        const response = await api.get(`/curseforge/search/432?sortField=${sortMethod}&searchQuery=${searchQuery}&index=${page}&pageSize=${"10"}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        const data = response.data as {mods: CurseForgeMod[], pagination: CurseForgePagination};
        return data;
    } catch (error) {
        const err = error as unknown as AxiosError
        console.error(err.message);
        return null;
    }
}

export async function getUserModpacks(curUser: User) {
    const token = getUserToken();

    try {
        const response = await api.get(`${curUser.name}/modpacks`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        });
        const data = response.data as Modpack[];
        return data;
    } catch (error) {
        const err = error as unknown as AxiosError
        console.error(err.message);
        return null;
    }
}

export async function getModpack(username: string, modpackSlug: string) {
    const token = getUserToken();
    
    try {
        const response = await api.get(`${username}/modpacks/${modpackSlug}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        });
        const data = response.data as Modpack;
        return data;
    } catch (error) {
        const err = error as unknown as AxiosError
        console.error(err.message);
        return null;
    }
}

export async function getModReferenceIds(modIds: number[]) {
    const token = getUserToken();
    
    try {
        const response = await api.post(`/mods/referenceIds`, modIds, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
        const data = response.data as string[];
        return data;
    } catch (error) {
        const err = error as unknown as AxiosError
        console.error(err.message);
        return null;
    }
}

export async function getCurseForgeModData(referenceIds: string[]) {
    const token = getUserToken();
    
    try {
        const response = await api.post(`/curseforge`, referenceIds, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
        console.log(response.data);
        const mods = response.data as CurseForgeMod[]
        return mods;
    } catch (error) {
        const err = error as unknown as AxiosError
        console.error(err.message);
        return null;
    }
}

export async function getModpackSuggestions(username: string, slug: string) {
    const token = getUserToken();
    
    try {
        const response = await api.get(`/${username}/modpacks/${slug}/suggestions`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        const data = response.data as Suggestion[];
        return data;
    } catch (error) {
        const err = error as unknown as AxiosError
        console.error(err.message);
        return null;
    }
}

export async function getSuggestion(username: string, slug: string, id: string) {
    const token = getUserToken();
    
    try {
        const response = await api.get(`/${username}/modpacks/${slug}/suggestions/${id}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        const data = response.data as Suggestion;
        return data;
    } catch (error) {
        const err = error as unknown as AxiosError
        console.error(err.message);
        return null;
    }
}

export async function createSuggestion(username: string, slug: string, memo: string) {
    const token = getUserToken();
    
    try {
        const response = await api.post(`/${username}/modpacks/${slug}/suggestions`, {memo}, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        const data = response.data as Suggestion;
        return data;
    } catch (error) {
        const err = error as unknown as AxiosError
        console.error(err.message);
        return null;
    }
}

export async function createModification(username: string, slug: string, suggestionId: string, body: CreateModificationDto) {
    const token = getUserToken();
    
    try {
        const response = await api.post(`/${username}/modpacks/${slug}/suggestions/${suggestionId}/modifications`, body, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        const data = response.data as Modification;
        return data;
    } catch (error) {
        const err = error as unknown as AxiosError
        console.error(err);
        return null;
    }
}

export async function createModpackVersion(username: string, slug: string, suggestionId: string) {
    const token = getUserToken();
    
    try {
        const response = await api.post(`/${username}/modpacks/${slug}/versions/${suggestionId}`, null, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        const data = response.data as Version;
        return data;
    } catch (error) {
        const err = error as unknown as AxiosError
        console.error(err);
        return null;
    }
}

export async function updateSuggestion(username: string, slug: string, memo: string, suggestionId: string) {
    const token = getUserToken();
    
    try {
        const response = await api.put(`/${username}/modpacks/${slug}/suggestions/${suggestionId}`, {memo}, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        const data = response.data as Suggestion;
        return data;
    } catch (error) {
        const err = error as unknown as AxiosError
        console.error(err.message);
        return null;
    }
}

export async function updateProfile(username: string, body: UpdateUserDto) {
    const token = getUserToken();
    
    try {
        const response = await api.put(`/users/${username}`, body, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        const data = response.data as User;
        return data;
    } catch (error) {
        const err = error as unknown as AxiosError
        console.error(err.message);
        return null;
    }
}

export async function updateModpack(username: string, slug: string, body: UpdateModpackDto) {
    const token = getUserToken();
    
    try {
        const response = await api.put(`/${username}/modpacks/${slug}`, body, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        const data = response.data as Modpack;
        return data;
    } catch (error) {
        const err = error as unknown as AxiosError
        console.error(err.message);
        return null;
    }
}

export async function deleteModification(username: string, slug: string, modificationId: string, suggestionId: string) {
    const token = getUserToken();
    
    try {
        const response = await api.delete(`/${username}/modpacks/${slug}/suggestions/${suggestionId}/modifications/${modificationId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        });

        const data = response.data as Modification;
        return data;
    } catch (error) {
        const err = error as unknown as AxiosError
        console.error(err.message);
        return null;
    }
}
