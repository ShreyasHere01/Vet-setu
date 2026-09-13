import express from "express";
import prisma from "../lib/prisma";
import { protect, requireRole } from "../middleware/auth";
import { reviewSchema } from "../schema/review.schema";

const router = express.Router();

// Create review for a completed appointment
router.post(
  "/",
  protect,
  requireRole("FARMER"),
  async (req: any, res) => {
    try {
      const result = reviewSchema.safeParse(req.body);

      if (!result.success) {
        return res.status(400).json({
          error: result.error.issues[0].message,
        });
      }

      const { appointmentId, rating, comment } = result.data;
      const farmerId = req.user.userId;

      // Check that this appointment belongs to the logged-in farmer
      const appointment = await prisma.appointment.findFirst({
        where: {
          id: appointmentId,
          farmerId,
        },
      });

      if (!appointment) {
        return res.status(404).json({
          error: "Appointment not found",
        });
      }

      // Only completed appointments can be reviewed
      if (appointment.status !== "COMPLETED") {
        return res.status(403).json({
          error: "You can only review completed appointments",
        });
      }

      // Prevent duplicate review for the same appointment
      const existingReview = await prisma.review.findUnique({
        where: {
          appointmentId,
        },
      });

      if (existingReview) {
        return res.status(409).json({
          error: "You have already reviewed this appointment",
        });
      }

      const review = await prisma.review.create({
        data: {
          farmerId,
          vetId: appointment.vetId,
          appointmentId,
          rating,
          comment,
        },
      });

      res.status(201).json(review);
    } catch (error) {
      console.error(error);
      res.status(500).json({
        error: "Failed to create review",
      });
    }
  }
);

// Get all reviews for a vet
router.get("/vet/:vetId", async (req, res) => {
  try {
    const vetId = Number(req.params.vetId);

    const reviews = await prisma.review.findMany({
      where: {
        vetId,
      },
      include: {
        farmer: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(reviews);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Failed to fetch reviews",
    });
  }
});

export default router;