import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

import api from "../lib/api";

const animalSchema = z.object({
  name: z.string().min(1, "Animal name is required"),
  species: z.string().min(1, "Species is required"),
  breed: z.string().optional(),
  gender: z.string().optional(),
  birthDate: z.string().optional(),
  tagNumber: z.string().optional(),
});

type AnimalFormData = z.infer<typeof animalSchema>;

export default function AddAnimal() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(
    null
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AnimalFormData>({
    resolver: zodResolver(animalSchema),
    defaultValues: {
      name: "",
      species: "",
      breed: "",
      gender: "",
      birthDate: "",
      tagNumber: "",
    },
  });

  const animalMutation = useMutation({
    mutationFn: async (data: AnimalFormData) => {
      // Step 1: Create animal
      const response = await api.post("/animals", {
        name: data.name,
        species: data.species,
        breed: data.breed || null,
        gender: data.gender || null,
        birthDate: data.birthDate
          ? new Date(data.birthDate).toISOString()
          : null,
        tagNumber: data.tagNumber || null,
      });

      const animal = response.data;

      // Step 2: Upload photo if selected
      if (photo) {
        const formData = new FormData();

        formData.append("photo", photo);

        await api.post(
          `/animals/${animal.id}/photo`,
          formData
        );
      }

      return animal;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["my-animals"],
      });

      navigate("/animals");
    },
  });

  const onSubmit = (data: AnimalFormData) => {
    animalMutation.mutate(data);
  };

  const handlePhotoChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image size must be less than 5MB.");
      return;
    }

    setPhoto(file);

    const previewUrl = URL.createObjectURL(file);
    setPhotoPreview(previewUrl);
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-8">
      <form
        noValidate
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-md space-y-4 rounded-lg border p-6 shadow-sm"
      >
        <h1 className="text-2xl font-bold">
          Add Animal
        </h1>

        {animalMutation.isError && (
          <p className="text-sm text-red-500">
            {(animalMutation.error as any)?.response?.data?.error ||
              "Failed to add animal"}
          </p>
        )}

        {/* Animal Photo */}
        <div>
          <label className="block font-medium">
            Animal Photo
          </label>

          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            className="w-full rounded border p-2"
          />

          {photoPreview && (
            <div className="mt-3">
              <img
                src={photoPreview}
                alt="Animal preview"
                className="h-40 w-40 rounded-lg object-cover"
              />
            </div>
          )}

          <p className="mt-1 text-xs text-gray-500">
            JPG, PNG, WEBP — maximum 5MB
          </p>
        </div>

        {/* Animal Name */}
        <div>
          <label className="block font-medium">
            Animal Name
          </label>

          <input
            {...register("name")}
            className="w-full rounded border p-2"
            placeholder="e.g. Gauri"
          />

          {errors.name && (
            <p className="text-sm text-red-500">
              {errors.name.message}
            </p>
          )}
        </div>

        {/* Species */}
        <div>
          <label className="block font-medium">
            Species
          </label>

          <select
            {...register("species")}
            className="w-full rounded border p-2"
          >
            <option value="">Select species</option>
            <option value="Cow">Cow</option>
            <option value="Buffalo">Buffalo</option>
            <option value="Goat">Goat</option>
            <option value="Sheep">Sheep</option>
            <option value="Other">Other</option>
          </select>

          {errors.species && (
            <p className="text-sm text-red-500">
              {errors.species.message}
            </p>
          )}
        </div>

        {/* Breed */}
        <div>
          <label className="block font-medium">
            Breed
          </label>

          <input
            {...register("breed")}
            className="w-full rounded border p-2"
            placeholder="e.g. Jersey"
          />
        </div>

        {/* Gender */}
        <div>
          <label className="block font-medium">
            Gender
          </label>

          <select
            {...register("gender")}
            className="w-full rounded border p-2"
          >
            <option value="">Select gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>

        {/* Birth Date */}
        <div>
          <label className="block font-medium">
            Birth Date
          </label>

          <input
            type="date"
            {...register("birthDate")}
            className="w-full rounded border p-2"
          />
        </div>

        {/* Tag Number */}
        <div>
          <label className="block font-medium">
            Tag Number
          </label>

          <input
            {...register("tagNumber")}
            className="w-full rounded border p-2"
            placeholder="e.g. MH12345"
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={animalMutation.isPending}
            className="flex-1 rounded bg-blue-600 p-2 text-white disabled:opacity-50"
          >
            {animalMutation.isPending
              ? "Adding..."
              : "Add Animal"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/animals")}
            disabled={animalMutation.isPending}
            className="flex-1 rounded border p-2 disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}