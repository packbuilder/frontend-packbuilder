import { useSignalR } from "@/components/signalr/signalr-provider";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { useEffect } from "react";
import { appQueries } from "./appQueries";

export function useSuggestionSubscription(modpackId: number, suggestionId: number) {
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
            if (payload.modpackId !== modpackId || payload.suggestionId !== suggestionId) return
            
            await queryClient.invalidateQueries({
                queryKey: appQueries.suggestion(payload.modpackId.toString(), payload.suggestionId.toString()).queryKey
            });

            await router.invalidate();
        }

        const onModpackUpdated = async (payload: {
            modpackId: number
        }) => {
            if (payload.modpackId !== modpackId) return
            // Refetch suggestion data after modpack updates in case of new version making this one outdated
            await queryClient.invalidateQueries({
                queryKey: appQueries.suggestion(payload.modpackId.toString(), suggestionId.toString()).queryKey
            });

            await router.invalidate();
        }

        connection.on("SuggestionUpdated", onSuggestionUpdated)
        connection.on("ModpackUpdated", onModpackUpdated)

        async function join() {
            try {
                await connection?.invoke("JoinModpack", modpackId.toString())
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
            connection.off("onreconnected", handleReconnect)

            connection.invoke("LeaveModpack", modpackId).catch(() => {})
        }
    }, [connection, modpackId, queryClient])
}