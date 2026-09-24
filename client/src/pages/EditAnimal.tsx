import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  useEffect,
  useState,
} from "react";
import {
  useForm,
} from "react-hook-form";
import {
  zodResolver,
} from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

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

interface Animal {
  id: number;
  name: string;
  species: string;
  breed: string | null;
  gender: string | null;
  birthDate: string | null;
  tagNumber: string | null;
  photoUrl: string | null;
}

function EditAnimalSkeleton() {
  return (
    <div className="min-h-screen bg-[#F8FBF7] p-5 sm:p-8">
      <div className="mx-auto max-w-2xl">
        <div className="h-5 w-36 animate-pulse rounded bg-gray-200" />

        <div className="mt-6 h-9 w-52 animate-pulse rounded bg-gray-200" />

        <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="h-7 w-40 animate-pulse rounded bg-gray-200" />

          <div className="mt-6 flex flex-col items-center">
            <div className="h-48 w-48 animate-pulse rounded-xl bg-gray-200" />

            <div className="mt-4 h-10 w-40 animate-pulse rounded-lg bg-gray-200" />

            <div className="mt-2 h-4 w-48 animate-pulse rounded bg-gray-200" />
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="h-7 w-48 animate-pulse rounded bg-gray-200" />

          <div className="mt-6 space-y-5">
            <div>
              <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
              <div className="mt-2 h-10 w-full animate-pulse rounded-lg bg-gray-200" />
            </div>

            <div>
              <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
              <div className="mt-2 h-10 w-full animate-pulse rounded-lg bg-gray-200" />
            </div>

            <div>
              <div className="h-4 w-14 animate-pulse rounded bg-gray-200" />
              <div className="mt-2 h-10 w-full animate-pulse rounded-lg bg-gray-200" />
            </div>

            <div>
              <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
              <div className="mt-2 h-10 w-full animate-pulse rounded-lg bg-gray-200" />
            </div>

            <div>
              <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
              <div className="mt-2 h-10 w-full animate-pulse rounded-lg bg-gray-200" />
            </div>

            <div>
              <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
              <div className="mt-2 h-10 w-full animate-pulse rounded bg-gray-200" />
            </div>

            <div className="flex gap-2 pt-2">
              <div className="h-10 flex-1 animate-pulse rounded-lg bg-gray-200" />
              <div className="h-10 flex-1 animate-pulse rounded-lg bg-gray-200" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EditAnimal() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);

  const [photoPreview, setPhotoPreview] =
    useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AnimalFormData>({
    resolver: zodResolver(animalSchema),
  });

  const {
    data: animal,
    isLoading,
    isError,
  } = useQuery<Animal>({
    queryKey: ["animal", id],
    queryFn: async () => {
      const response = await api.get(
        `/animals/${id}`
      );

      return response.data;
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (!animal) {
      return;
    }

    reset({
      name: animal.name,
      species: animal.species,
      breed: animal.breed || "",
      gender: animal.gender || "",
      birthDate: animal.birthDate
        ? animal.birthDate.split("T")[0]
        : "",
      tagNumber: animal.tagNumber || "",
    });
  }, [animal, reset]);

  const updateMutation = useMutation({
    mutationFn: async (data: AnimalFormData) => {
      if (!id) {
        throw new Error("Animal ID is missing");
      }

      const response = await api.patch(
        `/animals/${id}`,
        {
          name: data.name,
          species: data.species,
          breed: data.breed || null,
          gender: data.gender || null,
          birthDate: data.birthDate
            ? new Date(
                data.birthDate
              ).toISOString()
            : null,
          tagNumber: data.tagNumber || null,
        }
      );

      return response.data;
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["animal", id],
      });

      await queryClient.invalidateQueries({
        queryKey: ["my-animals"],
      });

      navigate(`/animals/${id}`);
    },
  });

  const photoMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!id) {
        throw new Error("Animal ID is missing");
      }

      const formData = new FormData();

      formData.append("photo", file);

      const response = await api.post(
        `/animals/${id}/photo`,
        formData
      );

      return response.data;
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["animal", id],
      });

      await queryClient.invalidateQueries({
        queryKey: ["my-animals"],
      });

      setSelectedFile(null);
      setPhotoPreview(null);
    },
  });

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

    setSelectedFile(file);

    const previewUrl =
      URL.createObjectURL(file);

    setPhotoPreview(previewUrl);
  };

  const handlePhotoUpload = () => {
    if (!selectedFile) {
      return;
    }

    photoMutation.mutate(selectedFile);
  };

  const onSubmit = (data: AnimalFormData) => {
    updateMutation.mutate(data);
  };

  if (isLoading) {
    return <EditAnimalSkeleton />;
  }

  if (isError || !animal) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FBF7] p-5">
        <div className="rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm">
          <p className="text-red-500">
            Failed to load animal.
          </p>

          <button
            type="button"
            onClick={() =>
              navigate("/animals")
            }
            className="mt-4 rounded-lg bg-[#0D5E72] px-5 py-2 text-sm font-medium text-white"
          >
            Back to Animals
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FBF7] p-5 sm:p-8">
      <div className="mx-auto max-w-2xl">
        <Link
          to={`/animals/${animal.id}`}
          className="text-sm font-medium text-[#0D5E72] hover:underline"
        >
          ← Back to Animal
        </Link>

        <h1 className="mt-6 text-3xl font-bold text-[#1F2937]">
          Edit Animal
        </h1>

        <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-[#1F2937]">
            Profile Photo
          </h2>

          <div className="mt-4 flex flex-col items-center">
            {photoPreview ? (
              <img
                src={photoPreview}
                alt="New animal preview"
                className="h-48 w-48 rounded-xl object-cover"
              />
            ) : animal.photoUrl ? (
              <img
                src={animal.photoUrl}
                alt={animal.name}
                className="h-48 w-48 rounded-xl object-cover"
              />
            ) : (
              <div className="flex h-48 w-48 items-center justify-center rounded-xl bg-gray-100 text-7xl">
                🐄
              </div>
            )}

            <label className="mt-4 cursor-pointer rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50">
              Choose New Photo

              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
            </label>

            <p className="mt-2 text-xs text-gray-500">
              JPG, PNG, WEBP — maximum 5MB
            </p>

            {selectedFile && (
              <button
                type="button"
                onClick={handlePhotoUpload}
                disabled={photoMutation.isPending}
                className="mt-3 rounded-lg bg-[#2E7D32] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#256628] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {photoMutation.isPending
                  ? "Uploading..."
                  : "Save Photo"}
              </button>
            )}

            {photoMutation.isError && (
              <p className="mt-2 text-sm text-red-500">
                {(photoMutation.error as any)
                  ?.response?.data?.error ||
                  "Failed to upload photo"}
              </p>
            )}

            {photoMutation.isSuccess && (
              <p className="mt-2 text-sm text-green-600">
                Photo updated successfully.
              </p>
            )}
          </div>
        </div>

        <form
          noValidate
          onSubmit={handleSubmit(onSubmit)}
          className="mt-6 space-y-5 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
        >
          <h2 className="text-xl font-semibold text-[#1F2937]">
            Animal Information
          </h2>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Animal Name
            </label>

            <input
              {...register("name")}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none transition focus:border-[#0D5E72] focus:ring-2 focus:ring-[#0D5E72]/10"
              placeholder="e.g. Gauri"
            />

            {errors.name && (
              <p className="mt-1 text-sm text-red-500">
                {errors.name.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Species
            </label>

            <select
              {...register("species")}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none transition focus:border-[#0D5E72] focus:ring-2 focus:ring-[#0D5E72]/10"
            >
              <option value="">
                Select species
              </option>

              <option value="Cow">
                Cow
              </option>

              <option value="Buffalo">
                Buffalo
              </option>

              <option value="Goat">
                Goat
              </option>

              <option value="Sheep">
                Sheep
              </option>

              <option value="Other">
                Other
              </option>
            </select>

            {errors.species && (
              <p className="mt-1 text-sm text-red-500">
                {errors.species.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Breed
            </label>

            <input
              {...register("breed")}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none transition focus:border-[#0D5E72] focus:ring-2 focus:ring-[#0D5E72]/10"
              placeholder="e.g. Jersey"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Gender
            </label>

            <select
              {...register("gender")}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none transition focus:border-[#0D5E72] focus:ring-2 focus:ring-[#0D5E72]/10"
            >
              <option value="">
                Select gender
              </option>

              <option value="Male">
                Male
              </option>

              <option value="Female">
                Female
              </option>
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Birth Date
            </label>

            <input
              type="date"
              {...register("birthDate")}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none transition focus:border-[#0D5E72] focus:ring-2 focus:ring-[#0D5E72]/10"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Tag Number
            </label>

            <input
              {...register("tagNumber")}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none transition focus:border-[#0D5E72] focus:ring-2 focus:ring-[#0D5E72]/10"
              placeholder="e.g. MH12345"
            />
          </div>

          {updateMutation.isError && (
            <p className="text-sm text-red-500">
              {(updateMutation.error as any)
                ?.response?.data?.error ||
                "Failed to update animal"}
            </p>
          )}

          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="flex-1 rounded-lg bg-[#0D5E72] p-2.5 font-semibold text-white transition hover:bg-[#094B5B] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {updateMutation.isPending
                ? "Saving..."
                : "Save Changes"}
            </button>

            <button
              type="button"
              onClick={() =>
                navigate(`/animals/${animal.id}`)
              }
              disabled={updateMutation.isPending}
              className="flex-1 rounded-lg border border-gray-200 p-2.5 font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}