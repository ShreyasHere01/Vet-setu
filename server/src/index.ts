import express from "express";
import cors from "cors";
import http from "http";
import { WebSocketServer } from "ws";

import authRoutes from "./routes/auth";
import vetRoutes from "./routes/vet";
import userRoutes from "./routes/user";
import appointmentRoutes from "./routes/appointment";
import reviewRoutes from "./routes/review";
import animalRoutes from "./routes/animal";
import { errorHandler } from "./middleware/errorHandler";
import { setupWebSocket } from "./websocket";
import locationRoutes from "./routes/location";
import notificationRoutes from "./routes/notification";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/vets", vetRoutes);
app.use("/api/users", userRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/animals", animalRoutes);
app.use("/api/location", locationRoutes);
app.use("/api/notifications", notificationRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "Vet-Setu API is running",
  });
});

app.use(errorHandler);

const server = http.createServer(app);

const wss = new WebSocketServer({
  server,
});

setupWebSocket(wss);

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`HTTP + WebSocket server running on port ${PORT}`);
});