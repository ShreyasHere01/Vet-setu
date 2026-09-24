import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Syringe } from "lucide-react";

import api from "../lib/api";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";

const vaccinationSchema = z
  .object({
    vaccineName: z
      .string()
      .min(1, "Vaccine name is required"),

    administeredAt: z
      .string()
      .min(1, "Administered date is required"),

    nextDueAt: z.string().optional(),

    notes: z.string().optional(),
  })
  .refine(
    (data) => {
      if (!data.nextDueAt) {
        return true;
      }

      return (
        new Date(data.nextDueAt) >
        new Date(data.administeredAt)
      );
    },
    {
      message:
        "Next due date must be after administered date",
      path: ["nextDueAt"],
    }
  );

type VaccinationFormData =
  z.infer<typeof vaccinationSchema>;

export default function AddVaccination() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VaccinationFormData>({
    resolver: zodResolver(vaccinationSchema),
    defaultValues: {
      vaccineName: "",
      administeredAt: "",
      nextDueAt: "",
      notes: "",
    },
  });

  const vaccinationMutation = useMutation({
    mutationFn: async (data: VaccinationFormData) => {
      const response = await api.post(
        `/animals/${id}/vaccinations`,
        {
          vaccineName: data.vaccineName,
          administeredAt: new Date(
            data.administeredAt
          ).toISOString(),

          nextDueAt: data.nextDueAt
            ? new Date(
                data.nextDueAt
              ).toISOString()
            : null,

          notes: data.notes || null,
        }
      );

      return response.data;
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["animal", id],
      });

      navigate(`/animals/${id}`);
    },
  });

  const onSubmit = (data: VaccinationFormData) => {
    vaccinationMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-[#F8FBF7] px-5 py-8 sm:px-8">
      <div className="mx-auto max-w-2xl">
        <Link
          to={`/animals/${id}`}
          className="text-sm font-medium text-[#0D5E72] hover:underline"
        >
          ← Back to Animal
        </Link>

        <div className="mt-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E8F5F7] text-[#0D5E72]">
              <Syringe size={22} />
            </div>

            <div>
              <h1 className="text-3xl font-bold tracking-tight text-[#1F2937]">
                Add Vaccination
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Record a vaccination for this animal.
              </p>
            </div>
          </div>
        </div>

        <Card className="mt-6 p-5 sm:p-6">
          {vaccinationMutation.isError && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
              <p className="text-sm font-medium text-red-600">
                {(vaccinationMutation.error as any)
                  ?.response?.data?.error ||
                  "Failed to add vaccination"}
              </p>
            </div>
          )}

          <form
            noValidate
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-5"
          >
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                Vaccine Name
              </label>

              <input
                {...register("vaccineName")}
                className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition ${
                  errors.vaccineName
                    ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/10"
                    : "border-gray-300 focus:border-[#0D5E72] focus:ring-2 focus:ring-[#0D5E72]/10"
                }`}
                placeholder="e.g. FMD"
              />

              {errors.vaccineName && (
                <p className="mt-1.5 text-sm text-red-500">
                  {errors.vaccineName.message}
                </p>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                Administered Date
              </label>

              <input
                type="date"
                {...register("administeredAt")}
                className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition ${
                  errors.administeredAt
                    ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/10"
                    : "border-gray-300 focus:border-[#0D5E72] focus:ring-2 focus:ring-[#0D5E72]/10"
                }`}
              />

              {errors.administeredAt && (
                <p className="mt-1.5 text-sm text-red-500">
                  {errors.administeredAt.message}
                </p>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                Next Due Date
              </label>

              <input
                type="date"
                {...register("nextDueAt")}
                className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition ${
                  errors.nextDueAt
                    ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/10"
                    : "border-gray-300 focus:border-[#0D5E72] focus:ring-2 focus:ring-[#0D5E72]/10"
                }`}
              />

              <p className="mt-1.5 text-xs text-gray-400">
                Optional. Select when the next vaccination is due.
              </p>

              {errors.nextDueAt && (
                <p className="mt-1.5 text-sm text-red-500">
                  {errors.nextDueAt.message}
                </p>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                Notes
              </label>

              <textarea
                {...register("notes")}
                rows={4}
                className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-[#0D5E72] focus:ring-2 focus:ring-[#0D5E72]/10"
                placeholder="Optional notes about the vaccination"
              />
            </div>

            <div className="flex flex-col gap-3 border-t border-gray-100 pt-5 sm:flex-row">
              <Button
                type="submit"
                loading={vaccinationMutation.isPending}
                className="flex-1"
              >
                Save Vaccination
              </Button>

              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate(`/animals/${id}`)}
                disabled={vaccinationMutation.isPending}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}