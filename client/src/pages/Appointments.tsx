import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import api from "../lib/api";
import { reviewSchema } from "../schemas/review.schema";
import type { ReviewFormData } from "../schemas/review.schema";

interface Appointment {
  id: number;
  status: string;
  notes: string | null;
  hasReview: boolean;

  slot: {
    startTime: string;
    endTime: string;
  };

  vet: {
    id: number;
    user: {
      name: string;
    };
  };
}

export default function Appointments() {
  const queryClient = useQueryClient();

  const [reviewingAppointmentId, setReviewingAppointmentId] =
    useState<number | null>(null);

  const [successMessage, setSuccessMessage] = useState("");

  const {
    data: appointments,
    isLoading,
    isError,
  } = useQuery<Appointment[]>({
    queryKey: ["my-appointments"],
    queryFn: async () => {
      const response = await api.get("/appointments/my");
      return response.data;
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      appointmentId: 0,
      rating: "",
      comment: "",
    },
  });

  const reviewMutation = useMutation({
    mutationFn: async (data: ReviewFormData) => {
      const response = await api.post("/reviews", {
        appointmentId: data.appointmentId,
        rating: Number(data.rating),
        comment: data.comment,
      });

      return response.data;
    },

    onSuccess: () => {
      setSuccessMessage("Review submitted successfully!");

      setReviewingAppointmentId(null);

      reset();

      queryClient.invalidateQueries({
        queryKey: ["my-appointments"],
      });
    },
  });

  const onSubmit = (data: ReviewFormData) => {
    setSuccessMessage("");
    reviewMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <p className="p-8">
        Loading appointments...
      </p>
    );
  }

  if (isError) {
    return (
      <p className="p-8 text-red-500">
        Failed to load appointments.
      </p>
    );
  }

  return (
    <div className="p-8">
      <h1 className="mb-6 text-2xl font-bold">
        My Appointments
      </h1>

      {successMessage && (
        <p className="mb-4 text-green-600">
          {successMessage}
        </p>
      )}

      {appointments?.length === 0 && (
        <p className="text-gray-500">
          You have no appointments.
        </p>
      )}

      <div className="space-y-4">
        {appointments?.map((appointment) => (
          <div
            key={appointment.id}
            className="rounded-lg border p-4 shadow-sm"
          >
            <h2 className="text-lg font-semibold">
              Dr. {appointment.vet.user.name}
            </h2>

            <p className="mt-2">
              {new Date(
                appointment.slot.startTime
              ).toLocaleString("en-IN")}
            </p>

            <p className="text-sm text-gray-500">
              to{" "}
              {new Date(
                appointment.slot.endTime
              ).toLocaleString("en-IN")}
            </p>

            <p className="mt-2">
              Status:{" "}
              <span className="font-medium">
                {appointment.status}
              </span>
            </p>

            {appointment.status === "COMPLETED" &&
              appointment.hasReview && (
                <p className="mt-4 inline-block rounded bg-gray-100 px-4 py-2 text-gray-600">
                  ✓ Reviewed
                </p>
              )}

            {appointment.status === "COMPLETED" &&
              !appointment.hasReview && (
                <div className="mt-4">
                  {reviewingAppointmentId === appointment.id ? (
                    <form
                      onSubmit={handleSubmit(onSubmit)}
                      className="space-y-3 rounded-lg bg-gray-50 p-4"
                    >
                      <input
                        type="hidden"
                        {...register("appointmentId", {
                          valueAsNumber: true,
                        })}
                      />

                      <h3 className="font-semibold">
                        Review Dr. {appointment.vet.user.name}
                      </h3>

                      <div>
                        <label className="block font-medium">
                          Rating
                        </label>

                        <select
                          {...register("rating")}
                          className="mt-1 rounded border p-2"
                        >
                          <option value="">
                            Select rating
                          </option>

                          <option value="5">
                            ★★★★★ - 5
                          </option>

                          <option value="4">
                            ★★★★ - 4
                          </option>

                          <option value="3">
                            ★★★ - 3
                          </option>

                          <option value="2">
                            ★★ - 2
                          </option>

                          <option value="1">
                            ★ - 1
                          </option>
                        </select>

                        {errors.rating && (
                          <p className="mt-1 text-sm text-red-500">
                            {errors.rating.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block font-medium">
                          Comment
                        </label>

                        <textarea
                          {...register("comment")}
                          placeholder="Write your experience..."
                          rows={4}
                          className="mt-1 w-full rounded border p-2"
                        />

                        {errors.comment && (
                          <p className="mt-1 text-sm text-red-500">
                            {errors.comment.message}
                          </p>
                        )}
                      </div>

                      {reviewMutation.isError && (
                        <p className="text-sm text-red-500">
                          Failed to submit review.
                        </p>
                      )}

                      <div className="flex gap-2">
                        <button
                          type="submit"
                          disabled={reviewMutation.isPending}
                          className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
                        >
                          {reviewMutation.isPending
                            ? "Submitting..."
                            : "Submit Review"}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setReviewingAppointmentId(null);
                            reset();
                          }}
                          className="rounded border px-4 py-2"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <button
                      onClick={() => {
                        setSuccessMessage("");

                        setReviewingAppointmentId(
                          appointment.id
                        );

                        reset({
                          appointmentId: appointment.id,
                          rating: "",
                          comment: "",
                        });
                      }}
                      className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                    >
                      Review Vet
                    </button>
                  )}
                </div>
              )}
          </div>
        ))}
      </div>
    </div>
  );
}