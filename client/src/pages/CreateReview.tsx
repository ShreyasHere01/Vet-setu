  import { useState } from "react";
  import { useMutation, useQueryClient } from "@tanstack/react-query";
  import { Link, useLocation, useNavigate } from "react-router-dom";
  import { ArrowLeft, CheckCircle2, Star } from "lucide-react";
  import { useForm } from "react-hook-form";
  import { z } from "zod";
  import { zodResolver } from "@hookform/resolvers/zod";
  import api from "../lib/api";
  import Button from "../components/ui/Button";

  const reviewSchema = z.object({
    rating: z
      .number()
      .min(1, "Please select a rating")
      .max(5, "Rating must be between 1 and 5"),
    comment: z
      .string()
      .max(500, "Comment must be 500 characters or less")
      .optional(),
  });

  type ReviewFormData = z.infer<typeof reviewSchema>;

  interface LocationState {
    appointmentId?: number;
    vetName?: string;
    vetPhotoUrl?: string | null;
  }

  export default function CreateReview() {
    const navigate = useNavigate();
    const location = useLocation();
    const queryClient = useQueryClient();

    const state = (location.state || {}) as LocationState;

    const [hoverRating, setHoverRating] = useState(0);
    const [submitted, setSubmitted] = useState(false);

    const {
      register,
      handleSubmit,
      setValue,
      watch,
      formState: { errors },
    } = useForm<ReviewFormData>({
      resolver: zodResolver(reviewSchema),
      defaultValues: {
        rating: 0,
        comment: "",
      },
    });

    const rating = watch("rating");

    const reviewMutation = useMutation({
      mutationFn: async (data: ReviewFormData) => {
        const response = await api.post("/reviews", {
          appointmentId: state.appointmentId,
          rating: data.rating,
          comment: data.comment?.trim() || null,
        });

        return response.data;
      },

      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["my-appointments"],
        });

        queryClient.invalidateQueries({
          queryKey: ["vet-reviews"],
        });

        setSubmitted(true);
      },
    });

    const onSubmit = (data: ReviewFormData) => {
      if (!state.appointmentId) {
        return;
      }

      reviewMutation.mutate(data);
    };

    const ratingLabels: Record<number, string> = {
      1: "Poor",
      2: "Fair",
      3: "Good",
      4: "Very Good",
      5: "Excellent",
    };

    if (submitted) {
      return (
        <div className="min-h-screen bg-[#F8FBF7]">
          <main className="mx-auto flex min-h-[80vh] max-w-xl items-center justify-center px-4 py-10">
            <div className="w-full rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm sm:p-10">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#EAF6EC]">
                <CheckCircle2 className="h-9 w-9 text-[#2E7D32]" />
              </div>

              <h1 className="mt-5 text-2xl font-bold text-[#1F2937]">
                Review Submitted
              </h1>

              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-gray-600">
                Thank you for sharing your experience. Your feedback
                helps other farmers choose the right veterinarian.
              </p>

              <Button
                type="button"
                className="mt-7"
                onClick={() => navigate("/appointments")}
              >
                Back to Appointments
              </Button>
            </div>
          </main>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-[#F8FBF7]">
        <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
          <Link
            to="/appointments"
            className="mb-7 inline-flex items-center gap-2 text-sm font-semibold text-[#0D5E72] transition hover:text-[#094A5A]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Appointments
          </Link>

          <div className="mb-7">
            <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-[#0D5E72]">
              Patient Feedback
            </p>

            <h1 className="text-3xl font-bold tracking-tight text-[#1F2937]">
              Share Your Experience
            </h1>

            <p className="mt-2 text-gray-600">
              Your feedback helps other farmers make informed
              decisions.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
            {state.vetName && (
              <div className="mb-8 flex items-center gap-4 rounded-xl bg-[#F8FBF7] p-4">
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-[#E3F3F5] text-[#0D5E72]">
                  {state.vetPhotoUrl ? (
                    <img
                      src={state.vetPhotoUrl}
                      alt={state.vetName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-lg font-bold">
                      {state.vetName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-xs font-medium text-gray-500">
                    Your veterinarian
                  </p>

                  <p className="font-semibold text-[#1F2937]">
                    {state.vetName}
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)}>
              <div>
                <label className="text-sm font-semibold text-[#1F2937]">
                  How was your experience?
                </label>

                <div className="mt-4 flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((value) => {
                    const active =
                      value <= (hoverRating || rating);

                    return (
                      <button
                        key={value}
                        type="button"
                        onMouseEnter={() =>
                          setHoverRating(value)
                        }
                        onMouseLeave={() =>
                          setHoverRating(0)
                        }
                        onClick={() =>
                          setValue("rating", value, {
                            shouldValidate: true,
                          })
                        }
                        className="rounded-lg p-1 transition hover:scale-110"
                        aria-label={`Rate ${value} out of 5`}
                      >
                        <Star
                          className={`h-9 w-9 transition ${
                            active
                              ? "fill-[#F4B400] text-[#F4B400]"
                              : "text-gray-300 hover:text-[#F4B400]"
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>

                <div className="mt-2 min-h-6">
                  {rating > 0 && (
                    <p className="text-sm font-semibold text-[#B77900]">
                      {ratingLabels[rating]}
                    </p>
                  )}

                  {errors.rating && (
                    <p className="text-sm font-medium text-red-600">
                      {errors.rating.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-7">
                <label
                  htmlFor="comment"
                  className="text-sm font-semibold text-[#1F2937]"
                >
                  Your comments
                  <span className="ml-1 font-normal text-gray-400">
                    (optional)
                  </span>
                </label>

                <textarea
                  id="comment"
                  {...register("comment")}
                  rows={5}
                  placeholder="Tell us about your experience with the veterinarian..."
                  className="mt-2 w-full resize-none rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-[#1F2937] outline-none transition placeholder:text-gray-400 focus:border-[#0D5E72] focus:ring-2 focus:ring-[#0D5E72]/10"
                />

                <div className="mt-1 flex items-center justify-between">
                  {errors.comment ? (
                    <p className="text-sm font-medium text-red-600">
                      {errors.comment.message}
                    </p>
                  ) : (
                    <span />
                  )}

                  <p className="text-xs text-gray-400">
                    {watch("comment")?.length || 0}/500
                  </p>
                </div>
              </div>

              {reviewMutation.isError && (
                <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                  <p className="text-sm font-medium text-red-700">
                    {(reviewMutation.error as any)?.response?.data
                      ?.error ||
                      "Failed to submit review. Please try again."}
                  </p>
                </div>
              )}

              <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => navigate("/appointments")}
                  disabled={reviewMutation.isPending}
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  loading={reviewMutation.isPending}
                  disabled={!state.appointmentId}
                >
                  Submit Review
                </Button>
              </div>
            </form>
          </div>

          <p className="mt-4 text-center text-xs text-gray-400">
            Your honest feedback helps improve veterinary care for
            farmers.
          </p>
        </main>
      </div>
    );
  }