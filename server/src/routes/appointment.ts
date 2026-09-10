import express from "express";
import prisma from "../lib/prisma";
import { protect, requireRole } from "../middleware/auth";

const router = express.Router();

router.post(
  "/",
  protect,
  requireRole("FARMER"),
  async (req: any, res) => {
    const { slotId } = req.body;

    try {
      const appointment = await prisma.$transaction(async (tx) => {
        const slot = await tx.slot.findUnique({
          where: {
            id: Number(slotId),
          },
        });

        if (!slot) {
          throw new Error("SLOT_NOT_FOUND");
        }

        if (slot.isBooked) {
          throw new Error("SLOT_ALREADY_BOOKED");
        }

        await tx.slot.update({
          where: {
            id: slot.id,
          },
          data: {
            isBooked: true,
          },
        });

        return tx.appointment.create({
          data: {
            farmerId: req.user.userId,
            vetId: slot.vetId,
            slotId: slot.id,
            status: "PENDING",
          },
        });
      });

      res.status(201).json({
        message: "Appointment booked successfully",
        appointment,
      });
    } catch (error: any) {
      console.error(error);

      if (error.message === "SLOT_NOT_FOUND") {
        return res.status(404).json({
          error: "Slot not found",
        });
      }

      if (error.message === "SLOT_ALREADY_BOOKED") {
        return res.status(409).json({
          error: "This slot is already booked",
        });
      }

      res.status(500).json({
        error: "Booking failed",
      });
    }
  }
);

router.get(
  "/my",
  protect,
  requireRole("FARMER"),
  async (req: any, res) => {
    try {
      const appointments = await prisma.appointment.findMany({
        where: {
          farmerId: req.user.userId,
        },
        include: {
          slot: true,
          vet: {
            include: {
              user: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      res.json(appointments);
    } catch (error) {
      console.error(error);

      res.status(500).json({
        error: "Failed to fetch appointments",
      });
    }
  }
);

router.get(
  "/vet/my",
  protect,
  requireRole("VET"),
  async (req: any, res) => {
    try {
      const vet = await prisma.vet.findUnique({
        where: {
          userId: req.user.userId,
        },
      });

      if (!vet) {
        return res.status(404).json({
          error: "Vet profile not found",
        });
      }

      const appointments = await prisma.appointment.findMany({
        where: {
          vetId: vet.id,
        },
        include: {
          slot: true,
          farmer: {
            select: {
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      res.json(appointments);
    } catch (error) {
      console.error(error);

      res.status(500).json({
        error: "Failed to fetch appointments",
      });
    }
  }
);

router.patch(
  "/:id/status",
  protect,
  requireRole("VET"),
  async (req: any, res) => {
    try {
      const appointmentId = Number(req.params.id);
      const { status } = req.body;

      const allowedStatuses = [
        "CONFIRMED",
        "CANCELLED",
        "COMPLETED",
      ];

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          error: "Invalid appointment status",
        });
      }

      const vet = await prisma.vet.findUnique({
        where: {
          userId: req.user.userId,
        },
      });

      if (!vet) {
        return res.status(404).json({
          error: "Vet profile not found",
        });
      }

      const appointment = await prisma.appointment.findFirst({
        where: {
          id: appointmentId,
          vetId: vet.id,
        },
      });

      if (!appointment) {
        return res.status(404).json({
          error: "Appointment not found",
        });
      }

      const updatedAppointment =
        await prisma.appointment.update({
          where: {
            id: appointmentId,
          },
          data: {
            status,
          },
        });

      res.json(updatedAppointment);
    } catch (error) {
      console.error(error);

      res.status(500).json({
        error: "Failed to update appointment",
      });
    }
  }
);

export default router;