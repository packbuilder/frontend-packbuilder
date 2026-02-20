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
import type { ModLoader } from "@/types/enums";
import type { CreateSuggestionDto } from "@/types/dtos/createSuggestionDto";
import z from "zod";
import { curseForgeModListResponseSchema } from "@/types/curseforge/curseforgeModArrayResponse";
import type { CreateModpackDto } from "@/types/dtos/createModpackDto";

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

export async function verifySuggestion(suggestionId: number, modpackId: string) {
    const token = getUserToken();

    try {
        const response = await api.post(`/modpacks/${modpackId}/suggestions/${suggestionId}/verify`, null, {
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
        const response = await api.get(`/user-modpacks/${user.id}`, {
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

export async function getModpack(modpackId: string) {
    const token = getUserToken();
    
    try {
        const response = await api.get(`/modpacks/${modpackId}`, {
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

export async function getModpackVersionManifest(modpackId: string, versionIteration: string) {
    try {
        const response = await api.get(`/modpacks/${modpackId}/download/version/${versionIteration}`, {
            responseType: "blob"
        });
        const data = response.data as Blob;  
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

export async function getModpackSuggestions(modpackId: string) {
    const token = getUserToken();
    
    try {
        const response = await api.get(`/modpacks/${modpackId}/suggestions`, {
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

export async function getSuggestion(modpackId: string, id: string) {
    const token = getUserToken();
    
    try {
        const response = await api.get(`/modpacks/${modpackId}/suggestions/${id}`, {
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

export async function createModpack(body: CreateModpackDto) {
    const token = getUserToken();
    
    try {
        const response = await api.post(`/modpacks/`, body, {
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

export async function importModpack(formData: FormData) {
    const token = getUserToken();

    try {
         const response = await api.post(`/modpacks/import`, formData, {
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

export async function createSuggestion(modpackId: string, body: CreateSuggestionDto) {
    const token = getUserToken();
    
    try {
        const response = await api.post(`/modpacks/${modpackId}/suggestions`, body, {
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

export async function createModification(modpackId: string, suggestionId: string, body: CreateModificationDto) {
    const token = getUserToken();
    
    try {
        const response = await api.post(`/modpacks/${modpackId}/suggestions/${suggestionId}/modifications`, body, {
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

export async function createModpackVersion(modpackId: string, suggestionId: string) {
    const token = getUserToken();
    
    try {
        const response = await api.post(`/modpacks/${modpackId}/versions/${suggestionId}`, null, {
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

export async function updateSuggestion(modpackId: string, body: CreateSuggestionDto, suggestionId: Number) {
    const token = getUserToken();
    
    try {
        const response = await api.put(`/modpacks/${modpackId}/suggestions/${suggestionId}`, body, {
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

export async function updateModpack(modpackId: string, body: UpdateModpackDto) {
    const token = getUserToken();
    
    try {
        const response = await api.put(`/modpacks/${modpackId}`, body, {
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

export async function deleteModpack(modpackId: string) {
    const token = getUserToken();

    try {
        const response = await api.delete(`/modpacks/${modpackId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        });

        return response.status;
    } catch(error) {
        const err = error as unknown as AxiosError
        console.error(err);
        return null;
    }
}

export async function deleteModification(modpackId: string, modificationId: string, suggestionId: string) {
    const token = getUserToken();
    
    try {
        const response = await api.delete(`/modpacks/${modpackId}/suggestions/${suggestionId}/modifications/${modificationId}`, {
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
