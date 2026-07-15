import { getUserToken } from "@/lib/api";
import * as signalR from "@microsoft/signalr"

const VITE_APIURL = import.meta.env.VITE_APIURL;
export const connection = new signalR.HubConnectionBuilder()
    .withUrl(`${VITE_APIURL}/hubs/modpacks`, {accessTokenFactory: () => getUserToken() || ""})
    .withAutomaticReconnect([0, 2000, 5000, 10000])
    .build();