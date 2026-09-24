"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupWebSocket = setupWebSocket;
exports.sendToUser = sendToUser;
const ws_1 = require("ws");
const wsTicket_1 = require("./lib/wsTicket");
const connections = new Map();
function setupWebSocket(wss) {
    wss.on("connection", (socket, req) => {
        // Check that the connection comes from our frontend
        const origin = req.headers.origin;
        if (origin !== "http://localhost:5173") {
            socket.close(1008, "Invalid origin");
            return;
        }
        try {
            const url = new URL(req.url || "", `http://${req.headers.host}`);
            const ticket = url.searchParams.get("ticket");
            if (!ticket) {
                socket.close(1008, "No ticket provided");
                return;
            }
            const userId = (0, wsTicket_1.consumeWsTicket)(ticket);
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
        }
        catch (error) {
            console.error("WebSocket authentication failed");
            socket.close(1008, "Authentication failed");
        }
    });
}
function sendToUser(userId, message) {
    const socket = connections.get(userId);
    if (socket && socket.readyState === ws_1.WebSocket.OPEN) {
        socket.send(JSON.stringify(message));
    }
}
