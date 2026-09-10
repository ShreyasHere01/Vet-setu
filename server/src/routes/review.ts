import express from "express";
import prisma from "../lib/prisma";
import { protect, requireRole } from "../middleware/auth";
import { reviewSchema } from "../schema/review.schema";

const router = express.Router();

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

      const { vetId, rating, comment } = result.data;
      const userId=req.user.userId;
      const hadAppointment = await prisma.appointment.findFirst({
        where: {
          farmerId: userId ,
          vetId,
          status: "COMPLETED",
        },
      });

      if (!hadAppointment) {
        return res.status(403).json({
          error:
            "You can only review vets you have completed an appointment with",
        });
      }

      const review = await prisma.review.create({
        data: {
          farmerId: req.user.userId,
          vetId,
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