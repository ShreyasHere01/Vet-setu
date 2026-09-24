"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const http_1 = __importDefault(require("http"));
const ws_1 = require("ws");
const auth_1 = __importDefault(require("./routes/auth"));
const vet_1 = __importDefault(require("./routes/vet"));
const user_1 = __importDefault(require("./routes/user"));
const appointment_1 = __importDefault(require("./routes/appointment"));
const review_1 = __importDefault(require("./routes/review"));
const animal_1 = __importDefault(require("./routes/animal"));
const errorHandler_1 = require("./middleware/errorHandler");
const websocket_1 = require("./websocket");
const location_1 = __importDefault(require("./routes/location"));
const notification_1 = __importDefault(require("./routes/notification"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use("/api/auth", auth_1.default);
app.use("/api/vets", vet_1.default);
app.use("/api/users", user_1.default);
app.use("/api/appointments", appointment_1.default);
app.use("/api/reviews", review_1.default);
app.use("/api/animals", animal_1.default);
app.use("/api/location", location_1.default);
app.use("/api/notifications", notification_1.default);
app.get("/", (req, res) => {
    res.json({
        message: "Vet-Setu API is running",
    });
});
app.use(errorHandler_1.errorHandler);
const server = http_1.default.createServer(app);
const wss = new ws_1.WebSocketServer({
    server,
});
(0, websocket_1.setupWebSocket)(wss);
const PORT = Number(process.env.PORT) || 3000;
server.listen(PORT, "0.0.0.0", () => {
    console.log(`HTTP + WebSocket server running on port ${PORT}`);
});
