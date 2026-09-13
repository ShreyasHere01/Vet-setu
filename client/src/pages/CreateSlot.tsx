import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { slotSchema } from "../schemas/slot.schema";
import type { SlotFormData } from "../schemas/slot.schema";

import api from "../lib/api";


export default function CreateSlot() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SlotFormData>({
    resolver: zodResolver(slotSchema),
  });

  const onSubmit = async (data: SlotFormData) => {
    setServerError("");
    setSuccessMessage("");

    try {
      await api.post("/vets/slots", {
        startTime: new Date(data.startTime).toISOString(),
        endTime: new Date(data.endTime).toISOString(),
      });

      setSuccessMessage("Slot created successfully!");

      setTimeout(() => {
        navigate("/vet/appointments");
      }, 1000);
    } catch (error: any) {
      setServerError(
        error.response?.data?.error || "Failed to create slot"
      );
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <form
        noValidate
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-md space-y-4 rounded-lg border p-6"
      >
        <h1 className="text-2xl font-bold">
          Create Available Slot
        </h1>

        {serverError && (
          <p className="text-sm text-red-500">
            {serverError}
          </p>
        )}

        {successMessage && (
          <p className="text-sm text-green-600">
            {successMessage}
          </p>
        )}

        <div>
          <label>Start Time</label>

          <input
            type="datetime-local"
            {...register("startTime")}
            className="w-full rounded border p-2"
          />

          {errors.startTime && (
            <p className="text-red-500">
              {errors.startTime.message}
            </p>
          )}
        </div>

        <div>
          <label>End Time</label>

          <input
            type="datetime-local"
            {...register("endTime")}
            className="w-full rounded border p-2"
          />

          {errors.endTime && (
            <p className="text-red-500">
              {errors.endTime.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded bg-blue-600 p-2 text-white disabled:opacity-50"
        >
          {isSubmitting ? "Creating..." : "Create Slot"}
        </button>
      </form>
    </div>
  );
}