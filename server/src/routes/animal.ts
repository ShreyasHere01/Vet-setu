import express from "express";
import multer from "multer";

import prisma from "../lib/prisma";
import { protect, requireRole } from "../middleware/auth";
import cloudinary from "../lib/cloudinary";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

// Create animal
router.post(
  "/",
  protect,
  requireRole("FARMER"),
  async (req: any, res) => {
    try {
      const {
        name,
        species,
        breed,
        gender,
        birthDate,
        tagNumber,
      } = req.body;

      if (!name || !species) {
        return res.status(400).json({
          error: "Animal name and species are required",
        });
      }

      const animal = await prisma.animal.create({
        data: {
          farmerId: req.user.userId,
          name,
          species,
          breed: breed || null,
          gender: gender || null,
          birthDate: birthDate
            ? new Date(birthDate)
            : null,
          tagNumber: tagNumber || null,
        },
      });

      res.status(201).json(animal);
    } catch (error: any) {
      console.error(error);

      if (error.code === "P2002") {
        return res.status(409).json({
          error: "Tag number already exists",
        });
      }

      res.status(500).json({
        error: "Failed to create animal",
      });
    }
  }
);

// Get all animals of logged-in farmer
router.get(
  "/my",
  protect,
  requireRole("FARMER"),
  async (req: any, res) => {
    try {
      const animals = await prisma.animal.findMany({
        where: {
          farmerId: req.user.userId,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      res.json(animals);
    } catch (error) {
      console.error(error);

      res.status(500).json({
        error: "Failed to fetch animals",
      });
    }
  }
);

// Update animal details
router.patch(
  "/:id",
  protect,
  requireRole("FARMER"),
  async (req: any, res) => {
    try {
      const animalId = Number(req.params.id);

      const {
        name,
        species,
        breed,
        gender,
        birthDate,
        tagNumber,
      } = req.body;

      const animal = await prisma.animal.findFirst({
        where: {
          id: animalId,
          farmerId: req.user.userId,
        },
      });

      if (!animal) {
        return res.status(404).json({
          error: "Animal not found",
        });
      }

      if (!name || !species) {
        return res.status(400).json({
          error: "Animal name and species are required",
        });
      }

      const updatedAnimal = await prisma.animal.update({
        where: {
          id: animalId,
        },
        data: {
          name,
          species,
          breed: breed || null,
          gender: gender || null,
          birthDate: birthDate
            ? new Date(birthDate)
            : null,
          tagNumber: tagNumber || null,
        },
      });

      res.json(updatedAnimal);
    } catch (error: any) {
      console.error(error);

      if (error.code === "P2002") {
        return res.status(409).json({
          error: "Tag number already exists",
        });
      }

      res.status(500).json({
        error: "Failed to update animal",
      });
    }
  }
);

// Upload / change animal photo
router.post(
  "/:id/photo",
  protect,
  requireRole("FARMER"),
  upload.single("photo"),
  async (req: any, res) => {
    try {
      const animalId = Number(req.params.id);

      if (!req.file) {
        return res.status(400).json({
          error: "Photo is required",
        });
      }

      const animal = await prisma.animal.findFirst({
        where: {
          id: animalId,
          farmerId: req.user.userId,
        },
      });

      if (!animal) {
        return res.status(404).json({
          error: "Animal not found",
        });
      }

      const uploadResult =
        await new Promise<any>((resolve, reject) => {
          const stream =
            cloudinary.uploader.upload_stream(
              {
                folder: "vet-setu/animals",
                resource_type: "image",
              },
              (error, result) => {
                if (error) {
                  reject(error);
                } else {
                  resolve(result);
                }
              }
            );

          stream.end(req.file.buffer);
        });

      const updatedAnimal =
        await prisma.animal.update({
          where: {
            id: animalId,
          },
          data: {
            photoUrl: uploadResult.secure_url,
          },
        });

      res.json({
        message: "Animal photo uploaded successfully",
        photoUrl: updatedAnimal.photoUrl,
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        error: "Failed to upload animal photo",
      });
    }
  }
);

// Get one animal with complete health history
router.get(
  "/:id",
  protect,
  requireRole("FARMER"),
  async (req: any, res) => {
    try {
      const animalId = Number(req.params.id);

      const animal = await prisma.animal.findFirst({
        where: {
          id: animalId,
          farmerId: req.user.userId,
        },
        include: {
          treatments: {
            orderBy: {
              treatmentDate: "desc",
            },
          },
          vaccinations: {
            orderBy: {
              administeredAt: "desc",
            },
          },
        },
      });

      if (!animal) {
        return res.status(404).json({
          error: "Animal not found",
        });
      }

      res.json(animal);
    } catch (error) {
      console.error(error);

      res.status(500).json({
        error: "Failed to fetch animal",
      });
    }
  }
);

// Delete animal
router.delete(
  "/:id",
  protect,
  requireRole("FARMER"),
  async (req: any, res) => {
    try {
      const animalId = Number(req.params.id);

      const animal = await prisma.animal.findFirst({
        where: {
          id: animalId,
          farmerId: req.user.userId,
        },
      });

      if (!animal) {
        return res.status(404).json({
          error: "Animal not found",
        });
      }

      await prisma.animal.delete({
        where: {
          id: animalId,
        },
      });

      res.json({
        message: "Animal deleted successfully",
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        error: "Failed to delete animal",
      });
    }
  }
);

// Add treatment history
router.post(
  "/:id/treatments",
  protect,
  requireRole("FARMER"),
  async (req: any, res) => {
    try {
      const animalId = Number(req.params.id);

      const {
        diagnosis,
        treatment,
        medicine,
        notes,
        treatmentDate,
        followUpDate,
      } = req.body;

      if (!diagnosis || !treatment) {
        return res.status(400).json({
          error: "Diagnosis and treatment are required",
        });
      }

      const animal = await prisma.animal.findFirst({
        where: {
          id: animalId,
          farmerId: req.user.userId,
        },
      });

      if (!animal) {
        return res.status(404).json({
          error: "Animal not found",
        });
      }

      const record = await prisma.treatment.create({
        data: {
          animalId,
          diagnosis,
          treatment,
          medicine: medicine || null,
          notes: notes || null,
          treatmentDate: treatmentDate
            ? new Date(treatmentDate)
            : new Date(),
          followUpDate: followUpDate
            ? new Date(followUpDate)
            : null,
        },
      });

      res.status(201).json(record);
    } catch (error) {
      console.error(error);

      res.status(500).json({
        error: "Failed to add treatment",
      });
    }
  }
);

// Add vaccination history
router.post(
  "/:id/vaccinations",
  protect,
  requireRole("FARMER"),
  async (req: any, res) => {
    try {
      const animalId = Number(req.params.id);

      const {
        vaccineName,
        administeredAt,
        nextDueAt,
        notes,
      } = req.body;

      if (!vaccineName || !administeredAt) {
        return res.status(400).json({
          error:
            "Vaccine name and administered date are required",
        });
      }

      const animal = await prisma.animal.findFirst({
        where: {
          id: animalId,
          farmerId: req.user.userId,
        },
      });

      if (!animal) {
        return res.status(404).json({
          error: "Animal not found",
        });
      }

      const vaccination =
        await prisma.vaccination.create({
          data: {
            animalId,
            vaccineName,
            administeredAt: new Date(administeredAt),
            nextDueAt: nextDueAt
              ? new Date(nextDueAt)
              : null,
            notes: notes || null,
          },
        });

      res.status(201).json(vaccination);
    } catch (error) {
      console.error(error);

      res.status(500).json({
        error: "Failed to add vaccination",
      });
    }
  }
);

export default router;