"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const prisma_1 = __importDefault(require("../lib/prisma"));
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.get("/", auth_1.protect, async (req, res) => {
    try {
        const notifications = await prisma_1.default.notification.findMany({
            where: {
                userId: req.user.userId,
            },
            orderBy: {
                createdAt: "desc",
            },
        });
        res.json(notifications);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Failed to fetch notifications",
        });
    }
});
router.patch("/:id/read", auth_1.protect, async (req, res) => {
    try {
        const notificationId = Number(req.params.id);
        const notification = await prisma_1.default.notification.findFirst({
            where: {
                id: notificationId,
                userId: req.user.userId,
            },
        });
        if (!notification) {
            return res.status(404).json({
                error: "Notification not found",
            });
        }
        const updatedNotification = await prisma_1.default.notification.update({
            where: {
                id: notificationId,
            },
            data: {
                read: true,
            },
        });
        res.json(updatedNotification);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Failed to mark notification as read",
        });
    }
});
router.patch("/read-all", auth_1.protect, async (req, res) => {
    try {
        await prisma_1.default.notification.updateMany({
            where: {
                userId: req.user.userId,
                read: false,
            },
            data: {
                read: true,
            },
        });
        res.json({
            message: "All notifications marked as read",
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Failed to mark notifications as read",
        });
    }
});
exports.default = router;
