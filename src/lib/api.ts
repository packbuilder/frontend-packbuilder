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

export async function searchCurseforgeMods(searchQuery: string, page: number, sortMethod: SortMethod, request: Request) {
    const searchParams = new URL(request.url).searchParams;
    const pageSize = parseInt(searchParams.get("pageSize") || "10");
    const token = getUserToken();

    try {
        const response = await api.get(`/curseforge/search/432?sortField=${sortMethod}&searchQuery=${searchQuery}&index=${page}&pageSize=${pageSize}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                cookie: request.headers.get("cookie") || "",
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

export async function getModpack(username: string, modpackSlug: string, request: Request) {
    const token = getUserToken();
    
    try {
        const response = await api.get(`${username}/modpacks/${modpackSlug}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                cookie: request.headers.get("cookie") || "",
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

export async function getModReferenceIds(modIds: number[], request: Request) {
    const token = getUserToken();
    
    try {
        const response = await api.post(`/mods/referenceIds`, modIds, {
            headers: {
                'Authorization': `Bearer ${token}`,
                cookie: request.headers.get("cookie") || "",
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

export async function getCurseForgeModData(referenceIds: string[], request: Request) {
    const token = getUserToken();
    
    try {
        const response = await api.post(`/curseforge`, referenceIds, {
            headers: {
                'Authorization': `Bearer ${token}`,
                cookie: request.headers.get("cookie") || "",
            },
        });
        const {mods} = response.data as {mods: CurseForgeMod[], pagination: CurseForgePagination}
        return mods;
    } catch (error) {
        const err = error as unknown as AxiosError
        console.error(err.message);
        return null;
    }
}

export async function getModpackSuggestions(username: string, slug: string, request: Request) {
    const token = getUserToken();
    
    try {
        const response = await api.get(`/${username}/modpacks/${slug}/suggestions`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                cookie: request.headers.get("cookie") || "",
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

export async function getSuggestion(username: string, slug: string, id: string, request: Request) {
    const token = getUserToken();
    
    try {
        const response = await api.get(`/${username}/modpacks/${slug}/suggestions/${id}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                cookie: request.headers.get("cookie") || "",
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

export async function createSuggestion(username: string, slug: string, memo: string, request: Request) {
    const token = getUserToken();
    
    try {
        const response = await api.post(`/${username}/modpacks/${slug}/suggestions`, {memo}, {
            headers: {
                'Authorization': `Bearer ${token}`,
                cookie: request.headers.get("cookie") || "",
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

export async function createModification(username: string, slug: string, suggestionId: string, body: CreateModificationDto, request: Request) {
    const token = getUserToken();
    
    try {
        const response = await api.post(`/${username}/modpacks/${slug}/suggestions/${suggestionId}/modifications`, body, {
            headers: {
                'Authorization': `Bearer ${token}`,
                cookie: request.headers.get("cookie") || "",
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

export async function updateSuggestion(username: string, slug: string, memo: string, suggestionId: string, request: Request) {
    const token = getUserToken();
    
    try {
        const response = await api.put(`/${username}/modpacks/${slug}/suggestions/${suggestionId}`, {memo}, {
            headers: {
                'Authorization': `Bearer ${token}`,
                cookie: request.headers.get("cookie") || "",
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

export async function updateProfile(username: string, body: UpdateUserDto, request: Request) {
    const token = getUserToken();
    
    try {
        const response = await api.put(`/users/${username}`, body, {
            headers: {
                'Authorization': `Bearer ${token}`,
                cookie: request.headers.get("cookie") || "",
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


export async function deleteModification(username: string, slug: string, modificationId: string, suggestionId: string, request: Request) {
    const token = getUserToken();
    
    try {
        const response = await api.delete(`/${username}/modpacks/${slug}/suggestions/${suggestionId}/modifications/${modificationId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                cookie: request.headers.get("cookie") || "",
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
