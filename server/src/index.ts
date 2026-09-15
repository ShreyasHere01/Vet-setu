import express from "express";
import cors from "cors";
import http from "http";
import { WebSocketServer } from "ws";

import authRoutes from "./routes/auth";
import vetRoutes from "./routes/vet";
import appointmentRoutes from "./routes/appointment";
import reviewRoutes from "./routes/review";
import { errorHandler } from "./middleware/errorHandler";
import { setupWebSocket } from "./websocket";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/vets", vetRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/reviews", reviewRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "Vet-Setu API is running",
  });
});

app.use(errorHandler);

// Create HTTP server
const server = http.createServer(app);

// Create WebSocket server on same port
const wss = new WebSocketServer({
  server,
});

// Setup WebSocket logic
setupWebSocket(wss);

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`HTTP + WebSocket server running on port ${PORT}`);
});