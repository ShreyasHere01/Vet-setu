import api from "./api";
import { queryClient } from "./queryClient";
import { useNotificationStore } from "../store/notificationStore";

let socket: WebSocket | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let shouldReconnect = true;

export async function connectWebSocket() {
  shouldReconnect = true;

  try {
    const response = await api.post("/auth/ws-ticket");
    const ticket = response.data.ticket;

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
      try {
        const data = JSON.parse(event.data);

        console.log("WebSocket message:", data);

        if (data.type === "appointment:updated") {
          queryClient.invalidateQueries({
            queryKey: ["my-appointments"],
          });

          let message = "";

          if (data.status === "CONFIRMED") {
            message = "Your appointment has been confirmed.";
          } else if (data.status === "CANCELLED") {
            message = "Your appointment has been cancelled.";
          } else if (data.status === "COMPLETED") {
            message = "Your appointment has been completed.";
          } else {
            message = `Appointment status updated to ${data.status}.`;
          }

          useNotificationStore
            .getState()
            .showNotification(message);
        }

        if (data.type === "notification:new") {
          queryClient.invalidateQueries({
            queryKey: ["notifications"],
          });
        }
      } catch (error) {
        console.error(
          "Failed to process WebSocket message:",
          error
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
    console.error(
      "Failed to create WebSocket ticket:",
      error
    );

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