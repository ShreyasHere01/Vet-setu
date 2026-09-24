import express from "express";
import prisma from "../lib/prisma";
import { protect } from "../middleware/auth";

const router = express.Router();

router.get(
  "/",
  protect,
  async (req: any, res) => {
    try {
      const notifications =
        await prisma.notification.findMany({
          where: {
            userId: req.user.userId,
          },
          orderBy: {
            createdAt: "desc",
          },
        });

      res.json(notifications);
    } catch (error) {
      console.error(error);

      res.status(500).json({
        error: "Failed to fetch notifications",
      });
    }
  }
);

router.patch(
  "/:id/read",
  protect,
  async (req: any, res) => {
    try {
      const notificationId = Number(req.params.id);

      const notification =
        await prisma.notification.findFirst({
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

      const updatedNotification =
        await prisma.notification.update({
          where: {
            id: notificationId,
          },
          data: {
            read: true,
          },
        });

      res.json(updatedNotification);
    } catch (error) {
      console.error(error);

      res.status(500).json({
        error: "Failed to mark notification as read",
      });
    }
  }
);

router.patch(
  "/read-all",
  protect,
  async (req: any, res) => {
    try {
      await prisma.notification.updateMany({
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
    } catch (error) {
      console.error(error);

      res.status(500).json({
        error: "Failed to mark notifications as read",
      });
    }
  }
);

export default router;