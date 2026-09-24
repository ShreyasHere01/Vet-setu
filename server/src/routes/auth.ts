import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";

import prisma from "../lib/prisma";
import { signupSchema, loginSchema } from "../schema/auth.schema";
import { protect } from "../middleware/auth";
import { createWsTicket } from "../lib/wsTicket";
import { sendEmail } from "../utils/email";

const router = express.Router();

router.post("/signup", async (req, res) => {
  try {
    const result = signupSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        error: result.error.issues[0].message,
      });
    }

    const { name, email, password, role } = result.data;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({
        error: "email already exist",
      });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashPassword,
        role,
      },
    });

    res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "something went wrong",
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const result = loginSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        error: result.error.issues[0].message,
      });
    }

    const { email, password } = result.data;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(400).json({
        error: "Invalid email or password",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        error: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role,
      },
      process.env.JWT_SECRET as string,
      {
        expiresIn: "7d",
      }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "something went wrong",
    });
  }
});

router.post("/change-password", protect, async (req: any, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (
      typeof currentPassword !== "string" ||
      typeof newPassword !== "string"
    ) {
      return res.status(400).json({
        error: "Current password and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        error: "New password must be at least 6 characters",
      });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({
        error: "New password must be different from current password",
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: req.user.userId,
      },
    });

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isMatch) {
      return res.status(400).json({
        error: "Current password is incorrect",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        password: hashedPassword,
      },
    });

    res.json({
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Something went wrong",
    });
  }
});

router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (typeof email !== "string") {
      return res.status(400).json({
        error: "Email is required",
      });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.json({
        message:
          "If an account exists with this email, a password reset link has been sent.",
      });
    }

    await prisma.passwordResetToken.deleteMany({
      where: {
        userId: user.id,
        used: false,
      },
    });

    const resetToken = crypto.randomBytes(32).toString("hex");

    const tokenHash = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });

    const resetLink = `http://localhost:5173/reset-password?token=${resetToken}`;

    await sendEmail(
      user.email,
      "Reset your Vet-Setu password",
      `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
          <h2 style="color: #0D5E72;">Reset your Vet-Setu password</h2>

          <p>Hello ${user.name},</p>

          <p>
            We received a request to reset your Vet-Setu password.
          </p>

          <p>
            This link will expire in 15 minutes.
          </p>

          <a
            href="${resetLink}"
            style="
              display: inline-block;
              padding: 12px 20px;
              background: #0D5E72;
              color: white;
              text-decoration: none;
              border-radius: 6px;
            "
          >
            Reset Password
          </a>

          <p style="margin-top: 24px;">
            If you didn't request a password reset, you can safely ignore this email.
          </p>
        </div>
      `
    );

    res.json({
      message:
        "If an account exists with this email, a password reset link has been sent.",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Something went wrong",
    });
  }
});

router.post("/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (
      typeof token !== "string" ||
      typeof newPassword !== "string"
    ) {
      return res.status(400).json({
        error: "Token and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        error: "New password must be at least 6 characters",
      });
    }

    const tokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const resetToken = await prisma.passwordResetToken.findUnique({
      where: {
        tokenHash,
      },
    });

    if (!resetToken) {
      return res.status(400).json({
        error: "Invalid or expired reset link",
      });
    }

    if (resetToken.used) {
      return res.status(400).json({
        error: "This reset link has already been used",
      });
    }

    if (resetToken.expiresAt < new Date()) {
      return res.status(400).json({
        error: "This reset link has expired",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.$transaction([
      prisma.user.update({
        where: {
          id: resetToken.userId,
        },
        data: {
          password: hashedPassword,
        },
      }),

      prisma.passwordResetToken.update({
        where: {
          id: resetToken.id,
        },
        data: {
          used: true,
        },
      }),

      prisma.passwordResetToken.deleteMany({
        where: {
          userId: resetToken.userId,
          id: {
            not: resetToken.id,
          },
        },
      }),
    ]);

    res.json({
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Something went wrong",
    });
  }
});

router.get("/test-email", async (req, res) => {
  try {
    await sendEmail(
      process.env.EMAIL_USER as string,
      "Vet-Setu Email Test",
      `
        <h1>Vet-Setu</h1>
        <p>This is a test email from your Vet-Setu backend.</p>
        <p>Nodemailer + Gmail SMTP is working.</p>
      `
    );

    res.json({
      message: "Test email sent successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to send test email",
    });
  }
});

router.post("/ws-ticket", protect, (req: any, res) => {
  const ticket = createWsTicket(req.user.userId);

  res.json({
    ticket,
  });
});

export default router;