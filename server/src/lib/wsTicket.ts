import crypto from "crypto";

interface Ticket {
  userId: number;
  expiresAt: number;
}

const tickets = new Map<string, Ticket>();

export function createWsTicket(userId: number) {
  const ticket = crypto.randomBytes(32).toString("hex");

  tickets.set(ticket, {
    userId,
    expiresAt: Date.now() + 60 * 1000,
  });

  return ticket;
}

export function consumeWsTicket(ticket: string) {
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