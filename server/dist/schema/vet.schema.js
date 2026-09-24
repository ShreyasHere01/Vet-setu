"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.slotSchema = void 0;
const zod_1 = require("zod");
exports.slotSchema = zod_1.z
    .object({
    startTime: zod_1.z.string().min(1, "Start time is required"),
    endTime: zod_1.z.string().min(1, "End time is required"),
    appointmentType: zod_1.z.enum(["CLINIC", "FARM_VISIT", "OTHER"], {
        message: "Please select an appointment type",
    }),
    appointmentLocationName: zod_1.z.string().optional().nullable(),
    appointmentAddress: zod_1.z.string().optional().nullable(),
    appointmentLatitude: zod_1.z
        .number()
        .min(-90)
        .max(90)
        .optional()
        .nullable(),
    appointmentLongitude: zod_1.z
        .number()
        .min(-180)
        .max(180)
        .optional()
        .nullable(),
})
    .refine((data) => new Date(data.startTime) > new Date(), {
    message: "Start time must be in the future",
    path: ["startTime"],
})
    .refine((data) => new Date(data.endTime) > new Date(data.startTime), {
    message: "End time must be after start time",
    path: ["endTime"],
})
    .refine((data) => {
    if (data.appointmentType === "FARM_VISIT") {
        return true;
    }
    return (!!data.appointmentLocationName?.trim() &&
        !!data.appointmentAddress?.trim());
}, {
    message: "Location name and address are required",
    path: ["appointmentAddress"],
});
