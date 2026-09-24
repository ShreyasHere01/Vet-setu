import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import api from "../lib/api";

interface Treatment {
  id: number;
  diagnosis: string;
  treatment: string;
  medicine?: string | null;
  notes?: string | null;
  treatmentDate: string;
  followUpDate?: string | null;
}

interface Vaccination {
  id: number;
  vaccineName: string;
  administeredAt: string;
  nextDueAt?: string | null;
  notes?: string | null;
}

interface Animal {
  id: number;
  name: string;
  species: string;
  breed?: string | null;
  gender?: string | null;
  birthDate?: string | null;
  tagNumber?: string | null;
  photoUrl?: string | null;
  treatments: Treatment[];
  vaccinations: Vaccination[];
}

function AnimalDetailsSkeleton() {
  return (
    <div className="min-h-screen animate-pulse bg-[#F8FBF7] p-8">
      <div className="mx-auto max-w-6xl">
        <div className="h-5 w-40 rounded bg-gray-200" />

        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-6 md:flex-row">
            <div className="h-48 w-48 shrink-0 rounded-xl bg-gray-200" />

            <div className="flex-1">
              <div className="flex flex-col justify-between gap-4 sm:flex-row">
                <div>
                  <div className="h-9 w-48 rounded-lg bg-gray-200" />
                  <div className="mt-3 h-5 w-32 rounded bg-gray-200" />
                </div>

                <div className="h-10 w-28 rounded bg-gray-200" />
              </div>

              <div className="mt-6 space-y-3">
                <div className="h-4 w-40 rounded bg-gray-200" />
                <div className="h-4 w-48 rounded bg-gray-200" />
                <div className="h-4 w-36 rounded bg-gray-200" />
                <div className="h-4 w-44 rounded bg-gray-200" />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="h-7 w-52 rounded bg-gray-200" />
            <div className="h-9 w-32 rounded bg-gray-200" />
          </div>

          <div className="mt-5 h-24 rounded-lg bg-gray-200" />
          <div className="mt-4 h-24 rounded-lg bg-gray-200" />
        </div>

        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="h-7 w-48 rounded bg-gray-200" />
            <div className="h-9 w-28 rounded bg-gray-200" />
          </div>

          <div className="mt-5 h-24 rounded-lg bg-gray-200" />
          <div className="mt-4 h-24 rounded-lg bg-gray-200" />
        </div>
      </div>
    </div>
  );
}

export default function AnimalDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const {
    data: animal,
    isLoading,
    isError,
  } = useQuery<Animal>({
    queryKey: ["animal", id],
    queryFn: async () => {
      const response = await api.get(`/animals/${id}`);
      return response.data;
    },
    enabled: !!id,
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await api.delete(`/animals/${id}`);
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["my-animals"],
      });

      navigate("/animals");
    },
  });

  const photoMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();

      formData.append("photo", file);

      await api.post(`/animals/${id}/photo`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["animal", id],
      });

      queryClient.invalidateQueries({
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

    const previewUrl = URL.createObjectURL(file);
    setPhotoPreview(previewUrl);
  };

  const handlePhotoUpload = () => {
    if (!selectedFile) {
      return;
    }

    photoMutation.mutate(selectedFile);
  };

  const handleCancelPhoto = () => {
    setSelectedFile(null);
    setPhotoPreview(null);
  };

  const handleDelete = () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this animal?"
    );

    if (!confirmed) {
      return;
    }

    deleteMutation.mutate();
  };

  const openPhotoModal = (photoUrl: string) => {
    setSelectedPhoto(photoUrl);
    setShowPhotoModal(true);
  };

  const closePhotoModal = () => {
    setShowPhotoModal(false);
    setSelectedPhoto(null);
  };

  if (isLoading) {
    return <AnimalDetailsSkeleton />;
  }

  if (isError || !animal) {
    return (
      <div className="min-h-screen bg-[#F8FBF7] p-8">
        <div className="mx-auto max-w-6xl">
          <Link
            to="/animals"
            className="text-sm font-medium text-[#0D5E72] hover:underline"
          >
            ← Back to Animals
          </Link>

          <div className="mt-6 rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
            <div className="text-4xl">⚠️</div>

            <h2 className="mt-3 text-xl font-semibold text-gray-800">
              Unable to load animal
            </h2>

            <p className="mt-2 text-gray-500">
              Something went wrong while loading this animal's details.
            </p>

            <button
              onClick={() =>
                queryClient.invalidateQueries({
                  queryKey: ["animal", id],
                })
              }
              className="mt-5 rounded-lg bg-[#0D5E72] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#09495A]"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FBF7] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl">
        <Link
          to="/animals"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#0D5E72] hover:underline"
        >
          ← Back to Animals
        </Link>

        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-6 md:flex-row">
            <div className="shrink-0">
              {photoPreview || animal.photoUrl ? (
                <img
                  src={photoPreview || animal.photoUrl || ""}
                  alt={animal.name}
                  onClick={() =>
                    openPhotoModal(
                      photoPreview || animal.photoUrl || ""
                    )
                  }
                  className="h-48 w-48 cursor-pointer rounded-xl object-cover shadow-sm transition hover:opacity-90"
                />
              ) : (
                <div className="flex h-48 w-48 items-center justify-center rounded-xl bg-[#E8F5EA] text-6xl">
                  🐄
                </div>
              )}

              <label className="mt-3 block cursor-pointer text-center text-sm font-medium text-[#0D5E72] hover:underline">
                Change Photo

                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </label>

              {selectedFile && (
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={handlePhotoUpload}
                    disabled={photoMutation.isPending}
                    className="flex-1 rounded-lg bg-[#0D5E72] px-3 py-2 text-sm font-medium text-white hover:bg-[#09495A] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {photoMutation.isPending
                      ? "Uploading..."
                      : "Upload"}
                  </button>

                  <button
                    onClick={handleCancelPhoto}
                    disabled={photoMutation.isPending}
                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            <div className="flex-1">
              <div className="flex flex-col justify-between gap-4 sm:flex-row">
                <div>
                  <h1 className="text-3xl font-bold text-gray-800">
                    {animal.name}
                  </h1>

                  <p className="mt-1 text-lg text-[#2E7D32]">
                    {animal.species}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      navigate(`/animals/${animal.id}/edit`)
                    }
                    className="rounded-lg border border-[#0D5E72] px-4 py-2 text-sm font-medium text-[#0D5E72] hover:bg-[#E8F4F7]"
                  >
                    Edit Animal
                  </button>

                  <button
                    onClick={handleDelete}
                    disabled={deleteMutation.isPending}
                    className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                  >
                    {deleteMutation.isPending
                      ? "Deleting..."
                      : "Delete"}
                  </button>
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    Breed
                  </p>

                  <p className="mt-1 text-sm font-medium text-gray-700">
                    {animal.breed || "Not provided"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    Gender
                  </p>

                  <p className="mt-1 text-sm font-medium text-gray-700">
                    {animal.gender || "Not provided"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    Birth Date
                  </p>

                  <p className="mt-1 text-sm font-medium text-gray-700">
                    {animal.birthDate
                      ? new Date(
                          animal.birthDate
                        ).toLocaleDateString()
                      : "Not provided"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    Tag Number
                  </p>

                  <p className="mt-1 text-sm font-medium text-gray-700">
                    {animal.tagNumber || "Not provided"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Vaccination History
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Keep track of your animal's vaccinations.
              </p>
            </div>

            <Link
              to={`/animals/${animal.id}/vaccination/add`}
              className="rounded-lg bg-[#2E7D32] px-4 py-2 text-sm font-medium text-white hover:bg-[#256629]"
            >
              + Add Vaccination
            </Link>
          </div>

          <div className="mt-5 space-y-4">
            {animal.vaccinations.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
                <div className="text-3xl">💉</div>

                <p className="mt-2 font-medium text-gray-700">
                  No vaccinations recorded
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  Add the first vaccination record for this animal.
                </p>
              </div>
            ) : (
              animal.vaccinations.map((vaccination) => (
                <div
                  key={vaccination.id}
                  className="rounded-xl border border-gray-200 bg-gray-50 p-4"
                >
                  <div className="flex flex-col justify-between gap-3 sm:flex-row">
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        {vaccination.vaccineName}
                      </h3>

                      <p className="mt-1 text-sm text-gray-500">
                        Administered:{" "}
                        {new Date(
                          vaccination.administeredAt
                        ).toLocaleDateString()}
                      </p>
                    </div>

                    {vaccination.nextDueAt && (
                      <div className="rounded-lg bg-[#FFF7E0] px-3 py-2 text-sm text-[#8A6200]">
                        Next due:{" "}
                        {new Date(
                          vaccination.nextDueAt
                        ).toLocaleDateString()}
                      </div>
                    )}
                  </div>

                  {vaccination.notes && (
                    <p className="mt-3 text-sm text-gray-600">
                      {vaccination.notes}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Treatment History
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Previous diagnoses and treatments.
              </p>
            </div>

            <Link
              to={`/animals/${animal.id}/treatment/add`}
              className="rounded-lg bg-[#0D5E72] px-4 py-2 text-sm font-medium text-white hover:bg-[#09495A]"
            >
              + Add Treatment
            </Link>
          </div>

          <div className="mt-5 space-y-4">
            {animal.treatments.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
                <div className="text-3xl">🩺</div>

                <p className="mt-2 font-medium text-gray-700">
                  No treatment records
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  Treatment history will appear here.
                </p>
              </div>
            ) : (
              animal.treatments.map((treatment) => (
                <div
                  key={treatment.id}
                  className="rounded-xl border border-gray-200 bg-gray-50 p-4"
                >
                  <div className="flex flex-col justify-between gap-3 sm:flex-row">
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        {treatment.diagnosis}
                      </h3>

                      <p className="mt-1 text-sm text-gray-500">
                        Date:{" "}
                        {new Date(
                          treatment.treatmentDate
                        ).toLocaleDateString()}
                      </p>
                    </div>

                    {treatment.followUpDate && (
                      <div className="rounded-lg bg-[#E8F4F7] px-3 py-2 text-sm text-[#0D5E72]">
                        Follow-up:{" "}
                        {new Date(
                          treatment.followUpDate
                        ).toLocaleDateString()}
                      </div>
                    )}
                  </div>

                  <div className="mt-3">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">
                        Treatment:
                      </span>{" "}
                      {treatment.treatment}
                    </p>

                    {treatment.medicine && (
                      <p className="mt-1 text-sm text-gray-700">
                        <span className="font-medium">
                          Medicine:
                        </span>{" "}
                        {treatment.medicine}
                      </p>
                    )}

                    {treatment.notes && (
                      <p className="mt-2 text-sm text-gray-600">
                        {treatment.notes}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {showPhotoModal && selectedPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={closePhotoModal}
        >
          <div
            className="relative max-h-[90vh] max-w-4xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              onClick={closePhotoModal}
              className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-xl text-white hover:bg-black/80"
            >
              ×
            </button>

            <img
              src={selectedPhoto}
              alt={animal.name}
              className="max-h-[85vh] max-w-full rounded-xl object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}