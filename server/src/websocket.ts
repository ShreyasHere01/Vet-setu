import { WebSocketServer, WebSocket } from "ws";
import { consumeWsTicket } from "./lib/wsTicket";

const connections = new Map<number, WebSocket>();

export function setupWebSocket(wss: WebSocketServer) {
  wss.on("connection", (socket, req) => {
    const origin = req.headers.origin;

    const allowedOrigins = [
      "http://localhost:5173",
      "https://vet-setu-1.onrender.com",
    ];

    if (origin && !allowedOrigins.includes(origin)) {
      socket.close(1008, "Invalid origin");
      return;
    }

    try {
      const url = new URL(
        req.url || "",
        `http://${req.headers.host}`
      );

      const ticket = url.searchParams.get("ticket");

      if (!ticket) {
        socket.close(1008, "No ticket provided");
        return;
      }

      const userId = consumeWsTicket(ticket);

      if (!userId) {
        socket.close(1008, "Invalid or expired ticket");
        return;
      }

      connections.set(userId, socket);

      console.log(`WebSocket connected: user ${userId}`);

      socket.on("close", () => {
        if (connections.get(userId) === socket) {
          connections.delete(userId);
        }

        console.log(`WebSocket disconnected: user ${userId}`);
      });
    } catch (error) {
      console.error("WebSocket authentication failed");

      socket.close(1008, "Authentication failed");
    }
  });
}

export function sendToUser(
  userId: number,
  message: object
) {
  const socket = connections.get(userId);

  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(message));
  }
}