"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = __importDefault(require("../lib/prisma"));
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const auth_1 = require("../middleware/auth");
const vet_schema_1 = require("../schema/vet.schema");
const cloudinary_1 = __importDefault(require("../lib/cloudinary"));
const router = express_1.default.Router();
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
});
// Create vet profile
router.post("/profile", auth_1.protect, (0, auth_1.requireRole)("VET"), async (req, res) => {
    try {
        const { specialty, bio } = req.body;
        const existingVet = await prisma_1.default.vet.findUnique({
            where: {
                userId: req.user.userId,
            },
        });
        if (existingVet) {
            return res.status(401).json({
                error: "vet profile already exists",
            });
        }
        const vet = await prisma_1.default.vet.create({
            data: {
                userId: req.user.userId,
                specialty,
                bio,
            },
        });
        res.status(201).json(vet);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Failed to create vet",
        });
    }
});
// Get logged-in vet profile
router.get("/profile", auth_1.protect, (0, auth_1.requireRole)("VET"), async (req, res) => {
    try {
        const vet = await prisma_1.default.vet.findUnique({
            where: {
                userId: req.user.userId,
            },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
            },
        });
        if (!vet) {
            return res.status(404).json({
                error: "Vet profile not found",
            });
        }
        res.json(vet);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Failed to fetch vet profile",
        });
    }
});
// Update logged-in vet profile
router.patch("/profile", auth_1.protect, (0, auth_1.requireRole)("VET"), async (req, res) => {
    try {
        const { specialty, bio } = req.body;
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
        const updatedVet = await prisma_1.default.vet.update({
            where: {
                id: vet.id,
            },
            data: {
                specialty,
                bio,
            },
        });
        res.json(updatedVet);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Failed to update vet profile",
        });
    }
});
// Upload vet profile photo
router.post("/profile/photo", auth_1.protect, (0, auth_1.requireRole)("VET"), upload.single("photo"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                error: "Please select a photo",
            });
        }
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
        const uploadToCloudinary = () => {
            return new Promise((resolve, reject) => {
                const stream = cloudinary_1.default.uploader.upload_stream({
                    folder: "vet-setu/vets",
                    resource_type: "image",
                }, (error, result) => {
                    if (error) {
                        reject(error);
                    }
                    else {
                        resolve(result);
                    }
                });
                stream.end(req.file.buffer);
            });
        };
        const result = await uploadToCloudinary();
        const updatedVet = await prisma_1.default.vet.update({
            where: {
                id: vet.id,
            },
            data: {
                photoUrl: result.secure_url,
            },
        });
        res.json({
            message: "Profile photo uploaded successfully",
            photoUrl: updatedVet.photoUrl,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Failed to upload profile photo",
        });
    }
});
// Create slot
router.post("/slots", auth_1.protect, (0, auth_1.requireRole)("VET"), async (req, res) => {
    try {
        const result = vet_schema_1.slotSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({
                error: result.error.issues[0].message,
            });
        }
        const { startTime, endTime, appointmentType, appointmentLocationName, appointmentAddress, appointmentLatitude, appointmentLongitude, } = result.data;
        const userId = req.user.userId;
        const vet = await prisma_1.default.vet.findUnique({
            where: {
                userId: userId,
            },
        });
        if (!vet) {
            return res.status(404).json({
                error: "vet profile not found",
            });
        }
        const slot = await prisma_1.default.slot.create({
            data: {
                vetId: vet.id,
                startTime: new Date(startTime),
                endTime: new Date(endTime),
                appointmentType,
                appointmentLocationName: appointmentType === "FARM_VISIT"
                    ? null
                    : appointmentLocationName ?? null,
                appointmentAddress: appointmentType === "FARM_VISIT"
                    ? null
                    : appointmentAddress ?? null,
                appointmentLatitude: appointmentType === "FARM_VISIT"
                    ? null
                    : appointmentLatitude ?? null,
                appointmentLongitude: appointmentType === "FARM_VISIT"
                    ? null
                    : appointmentLongitude ?? null,
            },
        });
        res.status(201).json(slot);
    }
    catch (error) {
        console.error(error);
        if (error.code === "P2002") {
            return res.status(409).json({
                error: "This time slot is already booked",
            });
        }
        res.status(500).json({
            error: "Failed to create slot",
        });
    }
});
// Get vet dashboard statistics
router.get("/dashboard", auth_1.protect, (0, auth_1.requireRole)("VET"), async (req, res) => {
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
        const appointmentCount = await prisma_1.default.appointment.count({
            where: {
                vetId: vet.id,
            },
        });
        const availableSlotCount = await prisma_1.default.slot.count({
            where: {
                vetId: vet.id,
                isBooked: false,
            },
        });
        const reviews = await prisma_1.default.review.findMany({
            where: {
                vetId: vet.id,
            },
            select: {
                rating: true,
            },
        });
        const reviewCount = reviews.length;
        const averageRating = reviewCount > 0
            ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount
            : null;
        res.json({
            appointmentCount,
            availableSlotCount,
            averageRating,
            reviewCount,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Failed to fetch dashboard statistics",
        });
    }
});
// Get reviews for logged-in vet
router.get("/reviews", auth_1.protect, (0, auth_1.requireRole)("VET"), async (req, res) => {
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
        const reviews = await prisma_1.default.review.findMany({
            where: {
                vetId: vet.id,
            },
            include: {
                farmer: {
                    select: {
                        id: true,
                        name: true,
                        photoUrl: true,
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
// Get all verified vets with ratings
router.get("/", async (req, res) => {
    try {
        const vets = await prisma_1.default.vet.findMany({
            where: {
                verified: true,
            },
            include: {
                user: {
                    select: {
                        name: true,
                    },
                },
                reviews: {
                    select: {
                        rating: true,
                    },
                },
            },
        });
        const vetsWithRatings = vets.map((vet) => {
            const reviewCount = vet.reviews.length;
            const averageRating = reviewCount > 0
                ? vet.reviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount
                : null;
            return {
                id: vet.id,
                specialty: vet.specialty,
                bio: vet.bio,
                photoUrl: vet.photoUrl,
                verified: vet.verified,
                user: vet.user,
                averageRating,
                reviewCount,
            };
        });
        res.json(vetsWithRatings);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Failed to fetch vets",
        });
    }
});
// Get vet by ID
router.get("/:vetId", async (req, res) => {
    try {
        const vetId = Number(req.params.vetId);
        const vet = await prisma_1.default.vet.findUnique({
            where: {
                id: vetId,
            },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
                reviews: {
                    select: {
                        rating: true,
                    },
                },
            },
        });
        if (!vet) {
            return res.status(404).json({
                error: "Vet not found",
            });
        }
        const reviewCount = vet.reviews.length;
        const averageRating = reviewCount > 0
            ? vet.reviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount
            : null;
        res.json({
            id: vet.id,
            specialty: vet.specialty,
            bio: vet.bio,
            photoUrl: vet.photoUrl,
            verified: vet.verified,
            user: vet.user,
            averageRating,
            reviewCount,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Failed to fetch vet",
        });
    }
});
// Get available slots for a vet
router.get("/:vetId/slots", async (req, res) => {
    try {
        const vetId = Number(req.params.vetId);
        const slots = await prisma_1.default.slot.findMany({
            where: {
                vetId,
                isBooked: false,
            },
            orderBy: {
                startTime: "asc",
            },
        });
        res.json(slots);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Failed to fetch slots",
        });
    }
});
exports.default = router;
