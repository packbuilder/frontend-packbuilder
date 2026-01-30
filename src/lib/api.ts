import { useApi } from "@/hooks/useApi";
import { modpackSchema } from "@/types/modpack";
import { userSchema, type User } from "@/types/user";
import { curseForgeModSchema } from "@/types/curseforge/curseforgeMod";
import { suggestionSchema } from "@/types/suggestion";
import type { SortMethod } from "@/types/curseforge/curseForgeSortMethod";
import { AxiosError } from "axios";
import type { CreateModificationDto } from "@/types/dtos/createModificationDto";
import type { UpdateUserDto } from "@/types/dtos/updateProfileDto";
import Cookies from "js-cookie";
import type { UpdateModpackDto } from "@/types/dtos/updateModpackDto";
import { versionSchema } from "@/types/version";
import type { ModLoader } from "@/types/enums";
import type { CreateSuggestionDto } from "@/types/dtos/createSuggestionDto";
import z from "zod";
import { curseForgeModListResponseSchema } from "@/types/curseforge/curseforgeModArrayResponse";

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

        return response.status;
    } catch (error) {
        const err = error as unknown as AxiosError
        console.error(err.message);
        return null;
    }
}

export async function searchCurseforgeMods(searchQuery: string, page: number, sortMethod: SortMethod, gameVersion: string, modLoader: ModLoader) {
    const token = getUserToken();

    try {
        const response = await api.get(`/curseforge/search/432?sortField=${sortMethod}&searchQuery=${searchQuery}&index=${page}&pageSize=${10}&gameVersion=${gameVersion}&modLoader=${modLoader}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        const data = curseForgeModListResponseSchema.parse(response.data);
        return data;
    } catch (error) {
        const err = error as unknown as AxiosError
        console.error(err.message);
        return null;
    }
}

export async function getUserByUsername(username: string) {
    const token = getUserToken();

    try {
        const response = await api.get(`users/${username}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        const data = userSchema.parse(response.data);
        return data;
    } catch (error) {
        const err = error as unknown as AxiosError
        console.error(err.message);
        return null;
    }
}

export async function getUserModpacks(user: User) {
    const token = getUserToken();

    try {
        const response = await api.get(`${user.name}/modpacks/${user.id}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        });
        const data = z.array(modpackSchema).parse(response.data);
        return data;
    } catch (error) {
        const err = error as unknown as AxiosError
        console.error(err.message);
        return null;
    }
}

export async function getUserSuggestions(userId: number) {
    const token = getUserToken();
    
    try {
        const response = await api.get(`user/${userId}/suggestions`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        });
        const data = z.array(suggestionSchema).parse(response.data);
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
        const data = modpackSchema.parse(response.data);
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

        const mods = z.array(curseForgeModSchema).parse(response.data); 
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

        const data = z.array(suggestionSchema).parse(response.data);
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

        const data = suggestionSchema.parse(response.data);
        return data;
    } catch (error) {
        const err = error as unknown as AxiosError
        console.error(err.message);
        return null;
    }
}

export async function getMinecraftVersions() {
    const token = getUserToken();
    
    try {
        const response = await api.get(`/curseforge/minecraft/versions`, {
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

export async function createSuggestion(username: string, slug: string, body: CreateSuggestionDto) {
    const token = getUserToken();
    
    try {
        const response = await api.post(`/${username}/modpacks/${slug}/suggestions`, body, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        return response.status;
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

        return response.status;
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

        return response.status;
    } catch (error) {
        const err = error as unknown as AxiosError
        console.error(err);
        return null;
    }
}

export async function updateSuggestion(username: string, slug: string, body: CreateSuggestionDto, suggestionId: Number) {
    const token = getUserToken();
    
    try {
        const response = await api.put(`/${username}/modpacks/${slug}/suggestions/${suggestionId}`, body, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        return response.status;
    } catch (error) {
        const err = error as unknown as AxiosError
        console.error(err.message);
        return null;
    }
}

export async function updateProfile(userId: number, body: UpdateUserDto) {
    const token = getUserToken();
    
    try {
        const response = await api.put(`/users/${userId}`, body, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        return response.status;
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

        return response.status;
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

        return response.status;
    } catch (error) {
        const err = error as unknown as AxiosError
        console.error(err.message);
        return null;
    }
}
