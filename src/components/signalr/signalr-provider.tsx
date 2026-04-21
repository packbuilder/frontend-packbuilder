import React, { createContext, useContext, useEffect, useMemo } from "react"
import * as signalR from "@microsoft/signalr"

type Context = {
  connection: signalR.HubConnection | null
}

const SignalRContext = createContext<Context>({ connection: null })

export function SignalRProvider({ children }: { children: React.ReactNode }) {

    const connection = useMemo(() => {
        return new signalR.HubConnectionBuilder()
        .withUrl("/hubs/modpacks")
        .withAutomaticReconnect()
        .build()
    }, [])

    useEffect(() => {
        let isMounted = true

        async function start() {
        try {
            await connection.start()
            // optional: console.log("SignalR connected")
        } catch (err) {
            // retry with backoff if you want
            setTimeout(start, 2000)
        }
        }

        if (isMounted) start()

        return () => {
            isMounted = false
            connection.stop()
        }
    }, [connection])

    return (
        <SignalRContext.Provider value={{ connection }}>
            {children}
        </SignalRContext.Provider>
    )
}

export function useSignalR() {
    return useContext(SignalRContext)
}