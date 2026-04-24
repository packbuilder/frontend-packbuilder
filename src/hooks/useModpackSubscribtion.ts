// hooks/useModpackSubscription.ts
import { useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { useSignalR } from "@/components/signalr/signalr-provider"
import { appQueries } from "./appQueries"
import { useRouter } from "@tanstack/react-router";

export function useModpackSubscription(modpackId: number | undefined) {
  const { connection } = useSignalR();
  const router = useRouter();
  const queryClient = useQueryClient()  

  useEffect(() => {
    if (!connection || !modpackId) return

    let isActive = true

    const onSuggestionUpdated = async (payload: {
      suggestionId: number,
      modpackId: number
    }) => {
        if (payload.modpackId !== modpackId) return
        
        await queryClient.invalidateQueries({
            queryKey: appQueries.modpackSuggestions(modpackId.toString()).queryKey
        });
        await router.invalidate();
    }

    const onModpackUpdated = async (payload: {
        modpackId: number,
    }) => {
        if(payload.modpackId !== modpackId) return

        await queryClient.invalidateQueries({
            queryKey: appQueries.modpack(modpackId.toString()).queryKey
        });

        await queryClient.invalidateQueries({
            queryKey: appQueries.modpackSuggestions(modpackId.toString()).queryKey
        });

        await router.invalidate();
    }

    connection.on("SuggestionUpdated", onSuggestionUpdated)
    connection.on("ModpackUpdated", onModpackUpdated)

    async function join() {
        try {
            await connection?.invoke("JoinModpack", modpackId?.toString())
        } catch {
            console.error(`unable to connect to signalr modpack ${modpackId} group.`)
        }
    }

    join()

    const handleReconnect = () => {
        if (isActive) {
            connection.invoke("JoinModpack", modpackId)
        }
    }

    connection.onreconnected(handleReconnect)

    return () => {
        isActive = false

        connection.off("SuggestionUpdated", onSuggestionUpdated)
        connection.off("ModpackUpdated", onModpackUpdated)
        connection.off("onreconnected", handleReconnect)

        connection.invoke("LeaveModpack", modpackId).catch(() => {})
    }
  }, [connection, modpackId, queryClient])
}