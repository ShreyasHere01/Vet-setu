"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const prisma_1 = __importDefault(require("../lib/prisma"));
const auth_1 = require("../middleware/auth");
const websocket_1 = require("../websocket");
const router = express_1.default.Router();
router.post("/", auth_1.protect, (0, auth_1.requireRole)("FARMER"), async (req, res) => {
    try {
        const farmerId = req.user.userId;
        const { slotId, visitLocationName, visitAddress, visitLatitude, visitLongitude, } = req.body;
        if (!slotId) {
            return res.status(400).json({
                error: "Slot ID is required",
            });
        }
        const result = await prisma_1.default.$transaction(async (tx) => {
            const slot = await tx.slot.findUnique({
                where: {
                    id: Number(slotId),
                },
                include: {
                    vet: true,
                },
            });
            if (!slot) {
                throw new Error("SLOT_NOT_FOUND");
            }
            if (slot.isBooked) {
                throw new Error("SLOT_ALREADY_BOOKED");
            }
            const appointmentType = slot.appointmentType || "CLINIC";
            let finalVisitLocationName = null;
            let finalVisitAddress = null;
            let finalVisitLatitude = null;
            let finalVisitLongitude = null;
            if (appointmentType === "FARM_VISIT") {
                if (!visitLocationName ||
                    !visitLocationName.trim()) {
                    throw new Error("VISIT_LOCATION_NAME_REQUIRED");
                }
                if (!visitAddress ||
                    !visitAddress.trim()) {
                    throw new Error("VISIT_ADDRESS_REQUIRED");
                }
                finalVisitLocationName =
                    visitLocationName.trim();
                finalVisitAddress = visitAddress.trim();
                finalVisitLatitude =
                    visitLatitude !== null &&
                        visitLatitude !== undefined
                        ? Number(visitLatitude)
                        : null;
                finalVisitLongitude =
                    visitLongitude !== null &&
                        visitLongitude !== undefined
                        ? Number(visitLongitude)
                        : null;
                if (finalVisitLatitude !== null &&
                    (Number.isNaN(finalVisitLatitude) ||
                        finalVisitLatitude < -90 ||
                        finalVisitLatitude > 90)) {
                    throw new Error("INVALID_VISIT_LATITUDE");
                }
                if (finalVisitLongitude !== null &&
                    (Number.isNaN(finalVisitLongitude) ||
                        finalVisitLongitude < -180 ||
                        finalVisitLongitude > 180)) {
                    throw new Error("INVALID_VISIT_LONGITUDE");
                }
            }
            const updatedSlot = await tx.slot.updateMany({
                where: {
                    id: Number(slotId),
                    isBooked: false,
                },
                data: {
                    isBooked: true,
                },
            });
            if (updatedSlot.count !== 1) {
                throw new Error("SLOT_ALREADY_BOOKED");
            }
            const appointment = await tx.appointment.create({
                data: {
                    farmerId,
                    vetId: slot.vetId,
                    slotId: Number(slotId),
                    status: "PENDING",
                    appointmentType,
                    visitLocationName: finalVisitLocationName,
                    visitAddress: finalVisitAddress,
                    visitLatitude: finalVisitLatitude,
                    visitLongitude: finalVisitLongitude,
                },
                include: {
                    slot: true,
                    vet: {
                        include: {
                            user: {
                                select: {
                                    name: true,
                                    email: true,
                                },
                            },
                        },
                    },
                },
            });
            const notification = await tx.notification.create({
                data: {
                    userId: slot.vet.userId,
                    type: "APPOINTMENT_BOOKED",
                    message: "A farmer has booked a new appointment with you.",
                },
            });
            return {
                appointment,
                notification,
                vetUserId: slot.vet.userId,
            };
        });
        (0, websocket_1.sendToUser)(result.vetUserId, {
            type: "notification:new",
            notification: {
                id: result.notification.id,
                type: result.notification.type,
                message: result.notification.message,
                read: result.notification.read,
                createdAt: result.notification.createdAt,
            },
        });
        res.status(201).json(result.appointment);
    }
    catch (error) {
        console.error(error);
        if (error.message === "SLOT_NOT_FOUND") {
            return res.status(404).json({
                error: "Appointment slot not found",
            });
        }
        if (error.message === "SLOT_ALREADY_BOOKED") {
            return res.status(409).json({
                error: "This appointment slot has already been booked",
            });
        }
        if (error.message ===
            "VISIT_LOCATION_NAME_REQUIRED") {
            return res.status(400).json({
                error: "Visit location name is required",
            });
        }
        if (error.message === "VISIT_ADDRESS_REQUIRED") {
            return res.status(400).json({
                error: "Visit address is required",
            });
        }
        if (error.message ===
            "INVALID_VISIT_LATITUDE") {
            return res.status(400).json({
                error: "Invalid visit latitude",
            });
        }
        if (error.message ===
            "INVALID_VISIT_LONGITUDE") {
            return res.status(400).json({
                error: "Invalid visit longitude",
            });
        }
        res.status(500).json({
            error: "Failed to book appointment",
        });
    }
});
router.get("/my", auth_1.protect, (0, auth_1.requireRole)("FARMER"), async (req, res) => {
    try {
        const appointments = await prisma_1.default.appointment.findMany({
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
                                email: true,
                            },
                        },
                    },
                },
                review: {
                    select: {
                        id: true,
                    },
                },
            },
            orderBy: {
                slot: {
                    startTime: "desc",
                },
            },
        });
        const transformedAppointments = appointments.map((appointment) => ({
            ...appointment,
            hasReview: !!appointment.review,
            review: undefined,
        }));
        res.json(transformedAppointments);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Failed to fetch appointments",
        });
    }
});
router.get("/vet/my", auth_1.protect, (0, auth_1.requireRole)("VET"), async (req, res) => {
    try {
        const vet = await prisma_1.default.vet.findUnique({
            where: {
                userId: req.user.userId,
            },
        });
        if (!vet) {
            return res.status(404).json({
                error: "Vet profile not found",
            });
        }
        const appointments = await prisma_1.default.appointment.findMany({
            where: {
                vetId: vet.id,
            },
            include: {
                farmer: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        photoUrl: true,
                    },
                },
                slot: true,
            },
            orderBy: {
                slot: {
                    startTime: "desc",
                },
            },
        });
        res.json(appointments);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Failed to fetch vet appointments",
        });
    }
});
router.patch("/:id/status", auth_1.protect, (0, auth_1.requireRole)("VET"), async (req, res) => {
    try {
        const appointmentId = Number(req.params.id);
        const { status } = req.body;
        if (!status) {
            return res.status(400).json({
                error: "Status is required",
            });
        }
        const allowedStatuses = [
            "PENDING",
            "CONFIRMED",
            "COMPLETED",
            "CANCELLED",
        ];
        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                error: "Invalid appointment status",
            });
        }
        const appointment = await prisma_1.default.appointment.findUnique({
            where: {
                id: appointmentId,
            },
            include: {
                vet: true,
            },
        });
        if (!appointment) {
            return res.status(404).json({
                error: "Appointment not found",
            });
        }
        if (appointment.vet.userId !==
            req.user.userId) {
            return res.status(403).json({
                error: "You do not have permission to update this appointment",
            });
        }
        const currentStatus = appointment.status;
        const validTransition = (currentStatus === "PENDING" &&
            (status === "CONFIRMED" ||
                status === "CANCELLED")) ||
            (currentStatus === "CONFIRMED" &&
                status === "COMPLETED");
        if (!validTransition) {
            return res.status(400).json({
                error: `Cannot change appointment status from ${currentStatus} to ${status}`,
            });
        }
        const updatedAppointment = await prisma_1.default.appointment.update({
            where: {
                id: appointmentId,
            },
            data: {
                status,
            },
            include: {
                slot: true,
                vet: {
                    include: {
                        user: {
                            select: {
                                name: true,
                                email: true,
                            },
                        },
                    },
                },
            },
        });
        const notification = await prisma_1.default.notification.create({
            data: {
                userId: appointment.farmerId,
                type: "APPOINTMENT_STATUS_UPDATED",
                message: status === "CONFIRMED"
                    ? "Your appointment has been confirmed."
                    : status === "CANCELLED"
                        ? "Your appointment has been cancelled."
                        : "Your appointment has been completed.",
            },
        });
        (0, websocket_1.sendToUser)(appointment.farmerId, {
            type: "notification:new",
            notification: {
                id: notification.id,
                type: notification.type,
                message: notification.message,
                read: notification.read,
                createdAt: notification.createdAt,
            },
        });
        (0, websocket_1.sendToUser)(appointment.farmerId, {
            type: "appointment:updated",
            appointmentId: appointment.id,
            status,
        });
        res.json(updatedAppointment);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Failed to update appointment",
        });
    }
});
exports.default = router;
