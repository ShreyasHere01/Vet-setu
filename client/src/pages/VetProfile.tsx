import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";

import api from "../lib/api";

const vetProfileSchema = z.object({
  specialty: z.string().min(2, "Specialty is required"),
  bio: z.string().optional(),
});

type VetProfileFormData = z.infer<typeof vetProfileSchema>;

export default function VetProfile() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VetProfileFormData>({
    resolver: zodResolver(vetProfileSchema),
  });

  const onSubmit = async (data: VetProfileFormData) => {
    setServerError("");

    try {
      await api.post("/vets/profile", data);

      navigate("/dashboard");
    } catch (error: any) {
      setServerError(
        error.response?.data?.error || "Failed to create vet profile"
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
          Create Vet Profile
        </h1>

        {serverError && (
          <p className="text-sm text-red-500">
            {serverError}
          </p>
        )}

        <div>
          <label>Specialty</label>

          <input
            {...register("specialty")}
            className="w-full rounded border p-2"
            placeholder="e.g. Large Animal Medicine"
          />

          {errors.specialty && (
            <p className="text-red-500">
              {errors.specialty.message}
            </p>
          )}
        </div>

        <div>
          <label>Bio</label>

          <textarea
            {...register("bio")}
            className="w-full rounded border p-2"
            placeholder="Tell farmers about yourself"
            rows={4}
          />

          {errors.bio && (
            <p className="text-red-500">
              {errors.bio.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          className="w-full rounded bg-blue-600 p-2 text-white"
        >
          Create Profile
        </button>
      </form>
    </div>
  );
}