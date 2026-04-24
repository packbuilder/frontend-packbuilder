import * as signalR from "@microsoft/signalr"

export const connection = new signalR.HubConnectionBuilder()
    .withUrl("http://localhost:5013/hubs/modpacks")
    .withAutomaticReconnect([0, 2000, 5000, 10000])
    .build();