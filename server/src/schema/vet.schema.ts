import { z } from "zod";

export const slotSchema = z
  .object({
    startTime: z.string().min(1, "Start time is required"),
    endTime: z.string().min(1, "End time is required"),

    appointmentType: z.enum(["CLINIC", "FARM_VISIT", "OTHER"], {
      message: "Please select an appointment type",
    }),

    appointmentLocationName: z.string().optional().nullable(),

    appointmentAddress: z.string().optional().nullable(),

    appointmentLatitude: z
      .number()
      .min(-90)
      .max(90)
      .optional()
      .nullable(),

    appointmentLongitude: z
      .number()
      .min(-180)
      .max(180)
      .optional()
      .nullable(),
  })
  .refine(
    (data) => new Date(data.startTime) > new Date(),
    {
      message: "Start time must be in the future",
      path: ["startTime"],
    }
  )
  .refine(
    (data) => new Date(data.endTime) > new Date(data.startTime),
    {
      message: "End time must be after start time",
      path: ["endTime"],
    }
  )
  .refine(
    (data) => {
      if (data.appointmentType === "FARM_VISIT") {
        return true;
      }

      return (
        !!data.appointmentLocationName?.trim() &&
        !!data.appointmentAddress?.trim()
      );
    },
    {
      message: "Location name and address are required",
      path: ["appointmentAddress"],
    }
  );

export type SlotFormData = z.infer<typeof slotSchema>;