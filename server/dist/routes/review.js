"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const prisma_1 = __importDefault(require("../lib/prisma"));
const auth_1 = require("../middleware/auth");
const review_schema_1 = require("../schema/review.schema");
const router = express_1.default.Router();
// Create review for a completed appointment
router.post("/", auth_1.protect, (0, auth_1.requireRole)("FARMER"), async (req, res) => {
    try {
        const result = review_schema_1.reviewSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({
                error: result.error.issues[0].message,
            });
        }
        const { appointmentId, rating, comment } = result.data;
        const farmerId = req.user.userId;
        // Check that this appointment belongs to the logged-in farmer
        const appointment = await prisma_1.default.appointment.findFirst({
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
        const existingReview = await prisma_1.default.review.findUnique({
            where: {
                appointmentId,
            },
        });
        if (existingReview) {
            return res.status(409).json({
                error: "You have already reviewed this appointment",
            });
        }
        const review = await prisma_1.default.review.create({
            data: {
                farmerId,
                vetId: appointment.vetId,
                appointmentId,
                rating,
                comment,
            },
        });
        res.status(201).json(review);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Failed to create review",
        });
    }
});
// Get all reviews for a vet
router.get("/vet/:vetId", async (req, res) => {
    try {
        const vetId = Number(req.params.vetId);
        const reviews = await prisma_1.default.review.findMany({
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
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Failed to fetch reviews",
        });
    }
});
exports.default = router;
