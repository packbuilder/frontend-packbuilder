import { useApi } from "@/hooks/useApi";
import { modpackSchema } from "@/types/modpack";
import { userSchema, type User } from "@/types/user";
import { curseForgeModSchema } from "@/types/curseforge/curseforgeMod";
import { suggestionSchema } from "@/types/suggestion";
import type { SortMethod } from "@/types/curseforge/curseForgeSortMethod";
import { AxiosError } from "axios";
import type { CreateModificationDto } from "@/types/dtos/createModificationDto";
import type { UpdateModpackDto } from "@/types/dtos/updateModpackDto";
import type { ModLoader } from "@/types/enums";
import type { CreateSuggestionDto } from "@/types/dtos/createSuggestionDto";
import z from "zod";
import { curseForgeModListResponseSchema } from "@/types/curseforge/curseforgeModArrayResponse";
import type { CreateModpackDto } from "@/types/dtos/createModpackDto";
import { bookmarkSchema } from "@/types/bookmark";
import type { CreateUserDto } from "@/types/dtos/createProfileDto";
import type { UpdateUserDto } from "@/types/dtos/updateProfileDto";
import type { ChangeEmailDto } from "@/types/dtos/changeEmailDto";
import { type PaginatedVersionModSchema } from "@/types/versionMod";

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

export async function verifySuggestion(suggestionId: number, modpackId: string) {

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

export async function getUserModpacks(user: User) {

    try {
        const response = await api.get(`/user-modpacks/${user.id}`);
        
        const data = z.array(modpackSchema).parse(response.data);   
        return data;
    } catch (error) {
        const err = error as unknown as AxiosError
        console.error(err.message);
        return null;
    }
}

export async function getUserSuggestions(userId: number) {
    
    try {
        const response = await api.get(`user/${userId}/suggestions`);
        const data = z.array(suggestionSchema).parse(response.data);
        return data;
    } catch (error) {
        const err = error as unknown as AxiosError
        console.error(err.message);
        return null;
    }
}

export async function getModpack(modpackId: string) {
    
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

export async function getBookmark(modpackId: string) {
    
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

export async function getVersionMods(modpackId: string, versionIteration: string, page: number, pageSize: number) {
    try {
        const response = await api.get(`/modpacks/${modpackId}/versions/${versionIteration}/mods?page=${page}&pageSize=${pageSize}`);

        const data = response.data as PaginatedVersionModSchema;
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

export async function getModpackSuggestions(modpackId: string) {
    
    try {
        const response = await api.get(`/modpacks/${modpackId}/suggestions`, );

        const data = z.array(suggestionSchema).parse(response.data);
        return data;
    } catch (error) {
        const err = error as unknown as AxiosError
        console.error(err.message);
        return null;
    }
}

export async function getSuggestion(modpackId: string, suggestionId: string) {

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

export async function createBookmark(modpackId: string) {

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

export async function createSuggestion(modpackId: string, body: CreateSuggestionDto) {
    
    try {
        const response = await api.post(`/modpacks/${modpackId}/suggestions`, body, );

        return {status: response.status, suggestionId: response.data as number | null};
    } catch (error) {
        const err = error as unknown as AxiosError
        console.error(err.message);
        return null;
    }
}

export async function createModification(modpackId: string, suggestionId: string, body: CreateModificationDto) {
    
    try {
        const response = await api.post(`/modpacks/${modpackId}/suggestions/${suggestionId}/modifications`, body, );

        return response.status;
    } catch (error) {
        const err = error as unknown as AxiosError
        console.error(err);
        return null;
    }
}

export async function createModpackVersion(modpackId: string, suggestionId: string) {
    
    try {
        const response = await api.post(`/modpacks/${modpackId}/versions/create/${suggestionId}` );

        return response.status;
    } catch (error) {
        const err = error as unknown as AxiosError
        console.error(err);
        return null;
    }
}

export async function updateSuggestion(modpackId: string, body: CreateSuggestionDto, suggestionId: Number) {
    
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

export async function updateModpack(modpackId: string, body: UpdateModpackDto) {
    
    try {
        const response = await api.put(`/modpacks/${modpackId}`, body, );

        return response.status;
    } catch (error) {
        const err = error as unknown as AxiosError
        console.error(err.message);
        return null;
    }
}

export async function deleteModpack(modpackId: string) {

    try {
        const response = await api.delete(`/modpacks/${modpackId}`);

        return response.status;
    } catch(error) {
        const err = error as unknown as AxiosError
        console.error(err);
        return null;
    }
}

export async function deleteBookmark(modpackId: string) {

    try {
        const response = await api.delete(`/bookmarks/${modpackId}`);

        return response.status;
    } catch(error) {
        const err = error as unknown as AxiosError
        console.error(err);
        return null;
    }
}

export async function deleteSuggestion(modpackId: string, suggestionId: string) {

    try {
        const response = await api.delete(`/modpacks/${modpackId}/suggestions/${suggestionId}`);

        return response.status;
    } catch(error) {
        const err = error as unknown as AxiosError
        console.error(err);
        return null;
    }
}

export async function deleteModification(modpackId: string, modificationId: string, suggestionId: string) {
    
    try {
        const response = await api.delete(`/modpacks/${modpackId}/suggestions/${suggestionId}/modifications/${modificationId}`);

        return response.status;
    } catch (error) {
        const err = error as unknown as AxiosError
        console.error(err.message);
        return null;
    }
}
