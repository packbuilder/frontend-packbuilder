import * as signalR from "@microsoft/signalr"

const VITE_APIURL = import.meta.env.VITE_APIURL;
export const connection = new signalR.HubConnectionBuilder()
    .withUrl(`${VITE_APIURL}/hubs/modpacks`)
    .withAutomaticReconnect([0, 2000, 5000, 10000])
    .build();