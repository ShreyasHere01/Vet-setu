import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Stethoscope } from "lucide-react";

import api from "../lib/api";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";

const treatmentSchema = z.object({
  diagnosis: z.string().min(1, "Diagnosis is required"),
  treatment: z.string().min(1, "Treatment is required"),
  medicine: z.string().optional(),
  notes: z.string().optional(),
  treatmentDate: z.string().min(1, "Treatment date is required"),
  followUpDate: z.string().optional(),
});

type TreatmentForm = z.infer<typeof treatmentSchema>;

export default function AddTreatment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TreatmentForm>({
    resolver: zodResolver(treatmentSchema),
    defaultValues: {
      diagnosis: "",
      treatment: "",
      medicine: "",
      notes: "",
      treatmentDate: new Date().toISOString().split("T")[0],
      followUpDate: "",
    },
  });

  const treatmentMutation = useMutation({
    mutationFn: async (data: TreatmentForm) => {
      const response = await api.post(`/animals/${id}/treatments`, {
        diagnosis: data.diagnosis,
        treatment: data.treatment,
        medicine: data.medicine || undefined,
        notes: data.notes || undefined,
        treatmentDate: new Date(
          data.treatmentDate
        ).toISOString(),
        followUpDate: data.followUpDate
          ? new Date(data.followUpDate).toISOString()
          : undefined,
      });

      return response.data;
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["animal", id],
      });

      navigate(`/animals/${id}`);
    },
  });

  const onSubmit = (data: TreatmentForm) => {
    treatmentMutation.mutate(data);
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
              <Stethoscope size={22} />
            </div>

            <div>
              <h1 className="text-3xl font-bold tracking-tight text-[#1F2937]">
                Add Treatment
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Add a new treatment record for this animal.
              </p>
            </div>
          </div>
        </div>

        <Card className="mt-6 p-5 sm:p-6">
          {treatmentMutation.isError && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
              <p className="text-sm font-medium text-red-600">
                {(treatmentMutation.error as any)?.response?.data?.error ||
                  "Failed to add treatment"}
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
                Diagnosis
              </label>

              <input
                {...register("diagnosis")}
                placeholder="Example: Fever, infection, injury"
                className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition ${
                  errors.diagnosis
                    ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/10"
                    : "border-gray-300 focus:border-[#0D5E72] focus:ring-2 focus:ring-[#0D5E72]/10"
                }`}
              />

              {errors.diagnosis && (
                <p className="mt-1.5 text-sm text-red-500">
                  {errors.diagnosis.message}
                </p>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                Treatment
              </label>

              <textarea
                {...register("treatment")}
                rows={4}
                placeholder="Describe the treatment given"
                className={`w-full resize-none rounded-lg border px-3 py-2.5 text-sm outline-none transition ${
                  errors.treatment
                    ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/10"
                    : "border-gray-300 focus:border-[#0D5E72] focus:ring-2 focus:ring-[#0D5E72]/10"
                }`}
              />

              {errors.treatment && (
                <p className="mt-1.5 text-sm text-red-500">
                  {errors.treatment.message}
                </p>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                Medicine
              </label>

              <input
                {...register("medicine")}
                placeholder="Medicine name (optional)"
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-[#0D5E72] focus:ring-2 focus:ring-[#0D5E72]/10"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                Treatment Date
              </label>

              <input
                type="date"
                {...register("treatmentDate")}
                className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition ${
                  errors.treatmentDate
                    ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/10"
                    : "border-gray-300 focus:border-[#0D5E72] focus:ring-2 focus:ring-[#0D5E72]/10"
                }`}
              />

              {errors.treatmentDate && (
                <p className="mt-1.5 text-sm text-red-500">
                  {errors.treatmentDate.message}
                </p>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                Follow-up Date
              </label>

              <input
                type="date"
                {...register("followUpDate")}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-[#0D5E72] focus:ring-2 focus:ring-[#0D5E72]/10"
              />

              <p className="mt-1.5 text-xs text-gray-400">
                Optional. Select if a follow-up visit is required.
              </p>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                Notes
              </label>

              <textarea
                {...register("notes")}
                rows={4}
                placeholder="Additional notes (optional)"
                className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-[#0D5E72] focus:ring-2 focus:ring-[#0D5E72]/10"
              />
            </div>

            <div className="flex flex-col gap-3 border-t border-gray-100 pt-5 sm:flex-row">
              <Button
                type="submit"
                loading={treatmentMutation.isPending}
                className="flex-1"
              >
                Save Treatment
              </Button>

              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate(`/animals/${id}`)}
                disabled={treatmentMutation.isPending}
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