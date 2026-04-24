import React, { createContext, useContext, useEffect } from "react"
import * as signalR from "@microsoft/signalr"
import { connection } from "./signalr-connection"

type Context = {
  connection: signalR.HubConnection | null
}

const SignalRContext = createContext<Context>({ connection: null })

export function SignalRProvider({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        const startConnection = async () => {
            
            if (connection.state === signalR.HubConnectionState.Connected || 
                connection.state === signalR.HubConnectionState.Connecting) {
                return;
            }

            try {
                await connection.start();
            } catch (error) {
                console.error("SignalR start failed:", error);
            }
        }
        startConnection();
        return () => {
            if (connection.state === signalR.HubConnectionState.Connected) {
                connection.stop();
            }
        };
    }, [connection]);

    return (
        <SignalRContext.Provider value={{ connection }}>
            {children}
        </SignalRContext.Provider>
    );
}

export function useSignalR() {
    return useContext(SignalRContext)
}