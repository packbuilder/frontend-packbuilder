import { useApi } from "@/hooks/useApi";
import { modpackSchema } from "@/types/modpack";
import { userSchema } from "@/types/user";
import { curseForgeModSchema } from "@/types/curseforge/curseforgeMod";
import { suggestionSchema } from "@/types/suggestion";
import type { SortMethod } from "@/types/curseforge/curseForgeSortMethod";
import { AxiosError } from "axios";
import type { CreateModificationDto } from "@/types/dtos/createModificationDto";
import type { UpdateModpackDto } from "@/types/dtos/updateModpackDto";
import type { ConflictState, ModAction, ModLoader, SuggestionState } from "@/types/enums";
import type { CreateSuggestionDto } from "@/types/dtos/createSuggestionDto";
import z from "zod";
import { curseForgeModListResponseSchema } from "@/types/curseforge/curseforgeModArrayResponse";
import type { CreateModpackDto } from "@/types/dtos/createModpackDto";
import { bookmarkSchema } from "@/types/bookmark";
import type { CreateUserDto } from "@/types/dtos/createProfileDto";
import type { UpdateUserDto } from "@/types/dtos/updateProfileDto";
import type { ChangeEmailDto } from "@/types/dtos/changeEmailDto";
import { type PaginatedModificationSchema, type PaginatedModpackSchema, type PaginatedSuggestionSchema, type PaginatedVersionModSchema } from "@/types/paginatedResponse";

const api = useApi();

export async function getUserSession() {
    try {
        const response = await api.get("/sessions");

        return userSchema.parse(response.data);
    } catch (error) {
        const err = error as unknown as AxiosError
        console.error(err.message);

        return null;
    }
} 

export async function login(email: string, password: string) {
    try {
        const response = await api.post(`/sessions`, {email, password});

        return response;
    } catch (error) {
        const err = error as unknown as AxiosError
        console.error(err.message);
        return null;
    }
}

export async function logout() {
    try {
        const response = await api.delete(`/sessions`);

        return response;
    } catch (error) {
        const err = error as unknown as AxiosError
        console.error(err.message);
        return null;
    }
}

export async function sendVerificationEmail(email: string) {
    try {
        const response = await api.post(`/verification/request/${email}`);
        return response;
    } catch (error) {
        const err = error as unknown as AxiosError
        console.error(err.message);
        return null;
    }
}

export async function sendPasswordResetEmail(email: string) {
    try {
        const response = await api.post(`/password-reset/request/${email}`);

        return response.status;
    } catch (error) {
        const err = error as unknown as AxiosError
        console.error(err.message);
        return null;
    }
}

export async function resetPassword(userId: string, newPassword: string, resetToken: string) {
    try {
        const response = await api.post(`/password-reset/${userId}`, {newPassword, token: resetToken});

        return response.status;
    } catch (error) {
        const err = error as unknown as AxiosError
        console.error(err.message);
        return null;
    }
}

export async function verifySuggestion(suggestionId: number, modpackId: number) {

    try {
        const response = await api.post(`/modpacks/${modpackId}/suggestions/${suggestionId}/verify`);
        return response.status;
    } catch (error) {
        const err = error as unknown as AxiosError
        console.error(err.message);
        return null;
    }
}

export async function searchCurseforgeMods(searchQuery: string, page: number, sortMethod: SortMethod, gameVersion: string, modLoader: ModLoader) {

    try {
        const response = await api.get(`/curseforge/search/432?sortField=${sortMethod}&searchQuery=${searchQuery}&index=${page}&pageSize=${10}&gameVersion=${gameVersion}&modLoader=${modLoader}`, );

        const data = curseForgeModListResponseSchema.parse(response.data);
        return data;
    } catch (error) {
        const err = error as unknown as AxiosError
        console.error(err.message);
        return null;
    }
}

export async function getUserById(userId: number) {

    try {
        const response = await api.get(`users/${userId}`, );

        if(!response.data) {
            return null;
        }
        
        return userSchema.parse(response.data);
    } catch (error) {
        const err = error as unknown as AxiosError
        console.error(err.message);
        return null;
    }
}

export async function getUserModpacks(userId: number, page: number, searchQuery?: string, pageSize?: number) {

    try {
        const response = await api.get(`/user-modpacks/${userId}`, {
            params: {
                page,
                searchQuery,
                pageSize
            }
        });
        
        const data = response.data as PaginatedModpackSchema;   
        return data;
    } catch (error) {
        const err = error as unknown as AxiosError
        console.error(err.message);
        return null;
    }
}

export async function getUserSuggestions(userId: number, page: number, searchQuery?: string, pageSize?: number, filter?: SuggestionState) {
    
    try {
        const response = await api.get(`user/${userId}/suggestions`, {
            params: {
                page,
                searchQuery,
                pageSize,
                filter
            }
        });
        const data = response.data as PaginatedSuggestionSchema;
        return data;
    } catch (error) {
        const err = error as unknown as AxiosError
        console.error(err.message);
        return null;
    }
}

export async function getModpack(modpackId: number) {
    
    try {
        const response = await api.get(`/modpacks/${modpackId}`);
        const data = modpackSchema.parse(response.data);
        return data;
    } catch (error) {
        const err = error as unknown as AxiosError
        console.error(err.message);
        return null;
    }
}

export async function getUserBookmarks() {
    
    try {
        const response = await api.get(`/bookmarks`);

        const data = z.array(bookmarkSchema).parse(response.data);
        return data;
    } catch (error) {
        const err = error as unknown as AxiosError
        console.error(err.message);
        return null;
    }
}

export async function getBookmark(modpackId: number) {
    
    try {
        const response = await api.get(`/bookmarks/${modpackId}`);
        const data = response.data && bookmarkSchema.parse(response.data);
        return data;
    } catch (error) {
        const err = error as unknown as AxiosError
        console.error(err.message);
        return null;
    }
}

export async function getModpackVersionManifest(modpackId: number, versionIteration: string) {
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
    
    try {
        const response = await api.post(`/mods/referenceIds`, modIds, );
        const data = response.data as string[];
        return data;
    } catch (error) {
        const err = error as unknown as AxiosError
        console.error(err.message);
        return null;
    }
}

export async function getVersionMods(modpackId: number, versionIteration: string, page: number, pageSize: number, searchQuery: string) {
    try {
        const response = await api.get(`/modpacks/${modpackId}/versions/${versionIteration}/mods`, {
            params: {
                page,
                pageSize,
                searchQuery: searchQuery
            }
        });

        const data = response.data as PaginatedVersionModSchema;
        return data;
    } catch (error) {
        const err = error as unknown as AxiosError
        console.error(err.message);
        return null;
    }
}

export async function getModpackSuggestions(modpackId: number, page: number, pageSize: number, searchQuery: string, filter?: SuggestionState) {
    try {
        const response = await api.get(`/modpacks/${modpackId}/suggestions`, {
            params: {
                page,
                pageSize,
                searchQuery: searchQuery,
                filter
            }
        });

        const data = response.data as PaginatedSuggestionSchema;
        return data;
    } catch (error) {
        const err = error as unknown as AxiosError
        console.error(err.message);
        return null;
    }
}

export async function getSuggestionModifications(modpackId: number, suggestionId: number, page: number, searchQuery?: string, modActionFilter?: ModAction, conflictStateFilter?: ConflictState, pageSize?: number) {
    try {
        const response = await api.get(`modpacks/${modpackId}/suggestions/${suggestionId}/modifications`, {
            params: {
                page,
                pageSize,
                searchQuery: searchQuery,
                modActionFilter,
                conflictStateFilter
            }
        });

        const data = response.data as PaginatedModificationSchema;
        return data;
    } catch (error) {
        const err = error as unknown as AxiosError
        console.error(err.message);
        return null;
    }
}

export async function getCurseForgeModData(referenceIds: string[]) {
    
    try {
        const response = await api.post(`/curseforge`, referenceIds, );

        const mods = z.array(curseForgeModSchema).parse(response.data); 
        return mods;
    } catch (error) {
        const err = error as unknown as AxiosError
        console.error(err.message);
        return null;
    }
}

export async function getSuggestion(modpackId: number, suggestionId: number) {

    try {
        const response = await api.get(`/modpacks/${modpackId}/suggestions/${suggestionId}`, );

        const data = suggestionSchema.parse(response.data);
        return data;
    } catch (error) {
        const err = error as unknown as AxiosError
        console.error(err.message);
        return null;
    }
}

export async function getMinecraftVersions() {
    
    try {
        const response = await api.get(`/curseforge/minecraft/versions`, );

        const data = response.data as string[];
        return data;
    } catch (error) {
        const err = error as unknown as AxiosError
        console.error(err.message);
        return null;
    }
}

export async function createAccount(body: CreateUserDto) {
    try {
        const response = await api.post("/users", body);

        return response;
    } catch (error) {
        const err = error as unknown as AxiosError
        console.error(err.message);
        return null;
    }
}

export async function createModpack(body: CreateModpackDto) {
    
    try {
        const response = await api.post(`/modpacks/`, body, );

        console.log(response.status)

        return response.status;
    } catch (error) {
        const err = error as unknown as AxiosError
        console.error(err.message);
        return null;
    }
}

export async function createBookmark(modpackId: number) {

    try {
        const response = await api.post(`/bookmarks/${modpackId}`, {}, );

        return response.status
    } catch(error) {
        const err = error as unknown as AxiosError;
        console.error(err);
        return null;
    }
}

export async function importModpack(formData: FormData) {

    try {
         const response = await api.post(`/modpacks/import`, formData, );

        return response.status;
    } catch (error) {
        const err = error as unknown as AxiosError
        console.error(err.message);
        return null;
    }
}

export async function createSuggestion(modpackId: number, body: CreateSuggestionDto) {
    
    try {
        const response = await api.post(`/modpacks/${modpackId}/suggestions`, body, );

        return {status: response.status, suggestionId: response.data as number | null};
    } catch (error) {
        const err = error as unknown as AxiosError
        console.error(err.message);
        return null;
    }
}

export async function createModification(modpackId: number, suggestionId: number, body: CreateModificationDto) {
    
    try {
        const response = await api.post(`/modpacks/${modpackId}/suggestions/${suggestionId}/modifications`, body, );

        return response.status;
    } catch (error) {
        const err = error as unknown as AxiosError
        console.error(err);
        return null;
    }
}

export async function createModpackVersion(modpackId: number, suggestionId: number) {
    
    try {
        const response = await api.post(`/modpacks/${modpackId}/versions/create/${suggestionId}` );

        return response.status;
    } catch (error) {
        const err = error as unknown as AxiosError
        console.error(err);
        return null;
    }
}

export async function updateSuggestion(modpackId: number, body: CreateSuggestionDto, suggestionId: Number) {
    
    try {
        const response = await api.put(`/modpacks/${modpackId}/suggestions/${suggestionId}`, body, );

        return response.status;
    } catch (error) {
        const err = error as unknown as AxiosError
        console.error(err.message);
        return null;
    }
}

export async function changeEmail(body: ChangeEmailDto) {
    
    try {
        const response = await api.post(`/email-reset`, body, );

        return response.status;
    } catch (error) {
        const err = error as unknown as AxiosError
        console.error(err.message);
        return null;
    }
}

export async function updateProfile(userId: number, body: UpdateUserDto) {
    
    try {
        const response = await api.put(`/users/${userId}`, body, );

        return response.status;
    } catch (error) {
        const err = error as unknown as AxiosError
        console.error(err.message);
        return null;
    }
}

export async function updateModpack(modpackId: number, body: UpdateModpackDto) {
    
    try {
        const response = await api.put(`/modpacks/${modpackId}`, body, );

        return response.status;
    } catch (error) {
        const err = error as unknown as AxiosError
        console.error(err.message);
        return null;
    }
}

export async function deleteModpack(modpackId: number) {

    try {
        const response = await api.delete(`/modpacks/${modpackId}`);

        return response.status;
    } catch(error) {
        const err = error as unknown as AxiosError
        console.error(err);
        return null;
    }
}

export async function deleteBookmark(modpackId: number) {

    try {
        const response = await api.delete(`/bookmarks/${modpackId}`);

        return response.status;
    } catch(error) {
        const err = error as unknown as AxiosError
        console.error(err);
        return null;
    }
}

export async function deleteSuggestion(modpackId: number, suggestionId: number) {

    try {
        const response = await api.delete(`/modpacks/${modpackId}/suggestions/${suggestionId}`);

        return response.status;
    } catch(error) {
        const err = error as unknown as AxiosError
        console.error(err);
        return null;
    }
}

export async function deleteModification(modpackId: number, modificationId: string, suggestionId: number) {
    
    try {
        const response = await api.delete(`/modpacks/${modpackId}/suggestions/${suggestionId}/modifications/${modificationId}`);

        return response.status;
    } catch (error) {
        const err = error as unknown as AxiosError
        console.error(err.message);
        return null;
    }
}
