// hooks/useModpackSubscription.ts
import { useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { useSignalR } from "@/components/signalr/signalr-provider"

// TODO: This is where all logic for you events will live. Just create events on backend that represent the corresponding data changes the events will be sent here.

export function useModpackSubscription(modpackId: string | undefined) {
  const { connection } = useSignalR()
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!connection || !modpackId) return

    let isActive = true
    const groupName = `modpack-${modpackId}`

    // ---- event handler ----
    const onSuggestionUpdated = (payload: {
      suggestionId: string
      modpackId: string
    }) => {
      if (payload.modpackId !== modpackId) return

      // safest default
      queryClient.invalidateQueries({
        queryKey: ["suggestions", modpackId],
      })
    }

    connection.on("SuggestionUpdated", onSuggestionUpdated)

    // ---- join group ----
    async function join() {
      try {
        await connection?.invoke("JoinModpack", modpackId)
      } catch {
        // retry a bit if needed
      }
    }

    join()

    // ---- rejoin on reconnect ----
    const handleReconnect = () => {
      if (isActive) {
        connection.invoke("JoinModpack", modpackId)
      }
    }

    connection.onreconnected(handleReconnect)

    // ---- cleanup ----
    return () => {
      isActive = false

      connection.off("SuggestionUpdated", onSuggestionUpdated)
      connection.off("onreconnected", handleReconnect)

      // leave group when navigating away
      connection.invoke("LeaveModpack", modpackId).catch(() => {})
    }
  }, [connection, modpackId, queryClient])
}