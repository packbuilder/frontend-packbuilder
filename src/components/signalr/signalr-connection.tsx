import * as signalR from "@microsoft/signalr"
console.log(import.meta.env);
console.log(`${import.meta.env.VITE_APIURL}/hubs/modpacks`);
export const connection = new signalR.HubConnectionBuilder()
    .withUrl(`${import.meta.env.VITE_APIURL}/hubs/modpacks`)
    .withAutomaticReconnect([0, 2000, 5000, 10000])
    .build();