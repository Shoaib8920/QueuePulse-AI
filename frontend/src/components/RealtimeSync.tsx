import {
    useEffect,
  } from "react"
  
  import {
    useQueryClient,
  } from "@tanstack/react-query"
  
  
  const WEBSOCKET_URL =
    import.meta.env.VITE_WS_URL ??
    "ws://127.0.0.1:8000/ws/queue"
  
  
  export default function RealtimeSync() {
    const queryClient =
      useQueryClient()
  
    useEffect(
      () => {
        let socket:
          WebSocket | null =
          null
  
        let reconnectTimer:
          ReturnType<
            typeof setTimeout
          > | null =
          null
  
        let closedByComponent =
          false
  
  
        function refreshQueuePulse() {
          void Promise.all([
            queryClient.invalidateQueries(
              {
                queryKey: [
                  "queue",
                ],
              },
            ),
  
            queryClient.invalidateQueries(
              {
                queryKey: [
                  "doctors",
                ],
              },
            ),
  
            queryClient.invalidateQueries(
              {
                queryKey: [
                  "events",
                ],
              },
            ),
          ])
        }
  
  
        function connect() {
          socket =
            new WebSocket(
              WEBSOCKET_URL,
            )
  
  
          socket.onopen =
            () => {
              console.log(
                "QueuePulse realtime connected"
              )
  
              refreshQueuePulse()
            }
  
  
          socket.onmessage =
            (event) => {
              try {
                const message =
                  JSON.parse(
                    event.data,
                  )
  
                if (
                  message.type ===
                    "queue.updated" ||
                  message.type ===
                    "connected"
                ) {
                  refreshQueuePulse()
                }
  
              } catch {
                console.warn(
                  "Invalid QueuePulse realtime message"
                )
              }
            }
  
  
          socket.onerror =
            () => {
              console.warn(
                "QueuePulse realtime connection error"
              )
            }
  
  
          socket.onclose =
            () => {
              if (
                closedByComponent
              ) {
                return
              }
  
              console.log(
                "QueuePulse realtime disconnected. Reconnecting..."
              )
  
              reconnectTimer =
                setTimeout(
                  connect,
                  1500,
                )
            }
        }
  
  
        connect()
  
  
        return () => {
          closedByComponent =
            true
  
          if (
            reconnectTimer
          ) {
            clearTimeout(
              reconnectTimer,
            )
          }
  
          socket?.close()
        }
      },
  
      [
        queryClient,
      ],
    )
  
  
    return null
  }