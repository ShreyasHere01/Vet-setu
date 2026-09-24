"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createWsTicket = createWsTicket;
exports.consumeWsTicket = consumeWsTicket;
const crypto_1 = __importDefault(require("crypto"));
const tickets = new Map();
function createWsTicket(userId) {
    const ticket = crypto_1.default.randomBytes(32).toString("hex");
    tickets.set(ticket, {
        userId,
        expiresAt: Date.now() + 60 * 1000,
    });
    return ticket;
}
function consumeWsTicket(ticket) {
    const data = tickets.get(ticket);
    if (!data) {
        return null;
    }
    tickets.delete(ticket);
    if (Date.now() > data.expiresAt) {
        return null;
    }
    return data.userId;
}
