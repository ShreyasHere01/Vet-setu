import api from "./api";
import { queryClient } from "./queryClient";
import { useNotificationStore } from "../store/notificationStore";

let socket: WebSocket | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let shouldReconnect = true;

export async function connectWebSocket() {
  try {
    const response = await api.post("/auth/ws-ticket");

    const ticket = response.data.ticket;

    // Prevent duplicate connections
    if (
      socket?.readyState === WebSocket.OPEN ||
      socket?.readyState === WebSocket.CONNECTING
    ) {
      return;
    }

    const wsUrl = import.meta.env.VITE_WS_URL;

    socket = new WebSocket(
      `${wsUrl}?ticket=${encodeURIComponent(ticket)}`
    );

    socket.onopen = () => {
      console.log("WebSocket connected");
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      console.log("WebSocket message:", data);

      if (data.type === "appointment:updated") {
        // Refresh farmer's appointment data
        queryClient.invalidateQueries({
          queryKey: ["my-appointments"],
        });

        // Show notification
        useNotificationStore
          .getState()
          .showNotification(
            `Appointment ${data.status.toLowerCase()}`
          );
      }
    };

    socket.onclose = () => {
      console.log("WebSocket disconnected");

      socket = null;

      if (shouldReconnect) {
        reconnectTimer = setTimeout(() => {
          connectWebSocket();
        }, 3000);
      }
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };
  } catch (error) {
    console.error("Failed to create WebSocket ticket:", error);

    if (shouldReconnect) {
      reconnectTimer = setTimeout(() => {
        connectWebSocket();
      }, 3000);
    }
  }
}

export function disconnectWebSocket() {
  shouldReconnect = false;

  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }

  if (socket) {
    socket.close();
    socket = null;
  }
}