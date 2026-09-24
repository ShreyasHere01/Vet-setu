"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const transporter = nodemailer_1.default.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD,
    },
});
const sendEmail = async (to, subject, html) => {
    await transporter.sendMail({
        from: `"Vet-Setu" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html,
    });
};
exports.sendEmail = sendEmail;
