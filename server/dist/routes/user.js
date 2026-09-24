"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const prisma_1 = __importDefault(require("../lib/prisma"));
const auth_1 = require("../middleware/auth");
const cloudinary_1 = __importDefault(require("../lib/cloudinary"));
const router = express_1.default.Router();
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
});
// Get logged-in farmer profile
router.get("/profile", auth_1.protect, (0, auth_1.requireRole)("FARMER"), async (req, res) => {
    try {
        const user = await prisma_1.default.user.findUnique({
            where: {
                id: req.user.userId,
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                photoUrl: true,
                farmAddress: true,
                farmLatitude: true,
                farmLongitude: true,
                createdAt: true,
            },
        });
        if (!user) {
            return res.status(404).json({
                error: "User not found",
            });
        }
        res.json(user);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Failed to fetch profile",
        });
    }
});
// Get another farmer's public profile
router.get("/:userId", auth_1.protect, async (req, res) => {
    try {
        const userId = Number(req.params.userId);
        if (Number.isNaN(userId)) {
            return res.status(400).json({
                error: "Invalid user ID",
            });
        }
        const user = await prisma_1.default.user.findUnique({
            where: {
                id: userId,
            },
            select: {
                id: true,
                name: true,
                photoUrl: true,
                role: true,
                createdAt: true,
            },
        });
        if (!user || user.role !== "FARMER") {
            return res.status(404).json({
                error: "Farmer not found",
            });
        }
        res.json(user);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Failed to fetch farmer profile",
        });
    }
});
// Update farmer profile
router.patch("/profile", auth_1.protect, (0, auth_1.requireRole)("FARMER"), async (req, res) => {
    try {
        const { name } = req.body;
        if (!name || !name.trim()) {
            return res.status(400).json({
                error: "Name is required",
            });
        }
        const updatedUser = await prisma_1.default.user.update({
            where: {
                id: req.user.userId,
            },
            data: {
                name: name.trim(),
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                photoUrl: true,
                farmAddress: true,
                farmLatitude: true,
                farmLongitude: true,
                createdAt: true,
            },
        });
        res.json(updatedUser);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Failed to update profile",
        });
    }
});
// Update farmer farm location
router.patch("/profile/farm-location", auth_1.protect, (0, auth_1.requireRole)("FARMER"), async (req, res) => {
    try {
        const { farmAddress, farmLatitude, farmLongitude, } = req.body;
        if (!farmAddress || !farmAddress.trim()) {
            return res.status(400).json({
                error: "Farm address is required",
            });
        }
        if (farmLatitude === undefined ||
            farmLongitude === undefined) {
            return res.status(400).json({
                error: "Farm location coordinates are required",
            });
        }
        const latitude = Number(farmLatitude);
        const longitude = Number(farmLongitude);
        if (Number.isNaN(latitude) ||
            Number.isNaN(longitude)) {
            return res.status(400).json({
                error: "Invalid farm coordinates",
            });
        }
        if (latitude < -90 || latitude > 90) {
            return res.status(400).json({
                error: "Invalid latitude",
            });
        }
        if (longitude < -180 || longitude > 180) {
            return res.status(400).json({
                error: "Invalid longitude",
            });
        }
        const updatedUser = await prisma_1.default.user.update({
            where: {
                id: req.user.userId,
            },
            data: {
                farmAddress: farmAddress.trim(),
                farmLatitude: latitude,
                farmLongitude: longitude,
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                farmAddress: true,
                farmLatitude: true,
                farmLongitude: true,
            },
        });
        res.json({
            message: "Farm location updated successfully",
            farmLocation: {
                address: updatedUser.farmAddress,
                latitude: updatedUser.farmLatitude,
                longitude: updatedUser.farmLongitude,
            },
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Failed to update farm location",
        });
    }
});
// Upload farmer profile photo
router.post("/profile/photo", auth_1.protect, (0, auth_1.requireRole)("FARMER"), upload.single("photo"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                error: "Please select a photo",
            });
        }
        const user = await prisma_1.default.user.findUnique({
            where: {
                id: req.user.userId,
            },
        });
        if (!user) {
            return res.status(404).json({
                error: "User not found",
            });
        }
        const uploadToCloudinary = () => {
            return new Promise((resolve, reject) => {
                const stream = cloudinary_1.default.uploader.upload_stream({
                    folder: "vet-setu/farmers",
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
        const updatedUser = await prisma_1.default.user.update({
            where: {
                id: req.user.userId,
            },
            data: {
                photoUrl: result.secure_url,
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                photoUrl: true,
            },
        });
        res.json({
            message: "Profile photo uploaded successfully",
            photoUrl: updatedUser.photoUrl,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Failed to upload profile photo",
        });
    }
});
exports.default = router;
