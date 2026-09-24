import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  MessageSquareQuote,
  Star,
  UserRound,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import api from "../../lib/api";

interface Review {
  id: number;
  rating: number;
  comment: string | null;
  createdAt: string;
  farmer: {
    id: number;
    name: string;
    photoUrl: string | null;
  };
}

function ReviewSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 animate-pulse rounded-full bg-gray-200" />

          <div>
            <div className="mb-2 h-4 w-28 animate-pulse rounded bg-gray-200" />
            <div className="h-3 w-20 animate-pulse rounded bg-gray-200" />
          </div>
        </div>

        <div className="h-5 w-28 animate-pulse rounded bg-gray-200" />
      </div>

      <div className="mt-6 h-20 animate-pulse rounded-xl bg-gray-100" />
    </div>
  );
}

function Stars({
  rating,
  size = "md",
}: {
  rating: number;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClass = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  }[size];

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${sizeClass} ${
            star <= rating
              ? "fill-[#F4B400] text-[#F4B400]"
              : "text-gray-300"
          }`}
        />
      ))}
    </div>
  );
}

function getRatingLabel(rating: number) {
  if (rating === 5) return "Excellent";
  if (rating === 4) return "Very Good";
  if (rating === 3) return "Good";
  if (rating === 2) return "Fair";
  return "Needs Improvement";
}

export default function VetReviews() {
  const navigate = useNavigate();

  const {
    data: reviews = [],
    isLoading,
    isError,
  } = useQuery<Review[]>({
    queryKey: ["vet-reviews"],

    queryFn: async () => {
      const response = await api.get("/vets/reviews");

      return response.data;
    },
  });

  const averageRating =
    reviews.length > 0
      ? reviews.reduce(
          (sum, review) => sum + review.rating,
          0
        ) / reviews.length
      : null;

  return (
    <div className="min-h-screen bg-[#F8FBF7]">
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          to="/dashboard"
          className="mb-7 inline-flex items-center gap-2 text-sm font-semibold text-[#0D5E72] transition hover:text-[#094A5A]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        <div className="mb-8">
          <div className="mb-3 inline-flex items-center rounded-full bg-[#E3F3F5] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#0D5E72]">
            Vet Reviews
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-[#1F2937] sm:text-4xl">
            Your Patient Reviews
          </h1>

          <p className="mt-2 max-w-2xl text-gray-600">
            See what farmers have said about your consultations and
            veterinary care.
          </p>
        </div>

        <div className="mb-8 overflow-hidden rounded-2xl border border-[#D9E8E5] bg-white shadow-sm">
          <div className="grid sm:grid-cols-[1.2fr_0.8fr]">
            <div className="p-6 sm:p-7">
              <p className="text-sm font-semibold text-gray-500">
                Overall Rating
              </p>

              <div className="mt-3 flex items-center gap-5">
                <span className="text-5xl font-bold tracking-tight text-[#1F2937]">
                  {averageRating !== null
                    ? averageRating.toFixed(1)
                    : "—"}
                </span>

                <div>
                  {averageRating !== null ? (
                    <>
                      <Stars
                        rating={Math.round(averageRating)}
                        size="lg"
                      />

                      <p className="mt-1.5 text-sm text-gray-500">
                        Based on {reviews.length}{" "}
                        {reviews.length === 1
                          ? "review"
                          : "reviews"}
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-gray-500">
                      No ratings yet
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 border-t border-gray-100 bg-[#F3FAF8] p-6 sm:border-l sm:border-t-0 sm:p-7">
              <div>
                <p className="text-sm font-semibold text-gray-500">
                  Patient Feedback
                </p>

                <p className="mt-1 text-sm leading-5 text-gray-600">
                  Every review helps farmers feel confident about
                  choosing their veterinarian.
                </p>
              </div>

              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#E3F3F5]">
                <MessageSquareQuote className="h-7 w-7 text-[#0D5E72]" />
              </div>
            </div>
          </div>
        </div>

        {isLoading && (
          <div className="space-y-4">
            <ReviewSkeleton />
            <ReviewSkeleton />
            <ReviewSkeleton />
          </div>
        )}

        {isError && !isLoading && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <Star className="h-6 w-6 text-red-600" />
            </div>

            <p className="mt-4 font-semibold text-red-700">
              Failed to load reviews
            </p>

            <p className="mt-1 text-sm text-red-600">
              Please try again later.
            </p>
          </div>
        )}

        {!isLoading &&
          !isError &&
          reviews.length === 0 && (
            <div className="rounded-2xl border border-gray-200 bg-white px-6 py-12 text-center shadow-sm">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E3F3F5]">
                <Star className="h-8 w-8 text-[#0D5E72]" />
              </div>

              <h2 className="mt-5 text-xl font-bold text-[#1F2937]">
                No reviews yet
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                Reviews from farmers will appear here after completed
                consultations.
              </p>
            </div>
          )}

        {!isLoading &&
          !isError &&
          reviews.length > 0 && (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-[#1F2937]">
                    Recent Reviews
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Feedback from farmers you've consulted
                  </p>
                </div>

                <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 shadow-sm ring-1 ring-gray-200">
                  {reviews.length}{" "}
                  {reviews.length === 1
                    ? "Review"
                    : "Reviews"}
                </span>
              </div>

              <div className="space-y-4">
                {reviews.map((review) => {
                  const firstLetter = review.farmer.name
                    .charAt(0)
                    .toUpperCase();

                  return (
                    <div
                      key={review.id}
                      className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-[#C8E1E4] hover:shadow-md sm:p-6"
                    >
                      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex items-center gap-3.5">
                          <button
                            type="button"
                            onClick={() =>
                              navigate(
                                `/vet/farmer/${review.farmer.id}`
                              )
                            }
                            className="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-[#E3F3F5] text-[#0D5E72] ring-4 ring-[#F3FAF8] focus:outline-none focus:ring-2 focus:ring-[#0D5E72] focus:ring-offset-2"
                            title="View farmer profile"
                          >
                            {review.farmer.photoUrl ? (
                              <img
                                src={review.farmer.photoUrl}
                                alt={review.farmer.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center">
                                {review.farmer.name ? (
                                  <span className="text-base font-bold">
                                    {firstLetter}
                                  </span>
                                ) : (
                                  <UserRound className="h-5 w-5" />
                                )}
                              </div>
                            )}
                          </button>

                          <div>
                            <button
                              type="button"
                              onClick={() =>
                                navigate(
                                  `/vet/farmer/${review.farmer.id}`
                                )
                              }
                              className="text-left font-semibold text-[#1F2937] transition hover:text-[#0D5E72]"
                            >
                              {review.farmer.name}
                            </button>

                            <p className="mt-0.5 text-xs text-gray-500">
                              {new Date(
                                review.createdAt
                              ).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 self-start rounded-full bg-[#FFF9E8] px-3 py-2">
                          <Stars
                            rating={review.rating}
                            size="sm"
                          />

                          <span className="border-l border-[#EADCA8] pl-3 text-sm font-bold text-[#8A6500]">
                            {review.rating}.0
                          </span>
                        </div>
                      </div>

                      <div className="mt-5 rounded-xl border border-[#E3EEEE] bg-[#F8FBF7] px-4 py-4 sm:px-5">
                        <div className="flex gap-3">
                          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#E3F3F5]">
                            <MessageSquareQuote className="h-4 w-4 text-[#0D5E72]" />
                          </div>

                          <div className="min-w-0">
                            {review.comment ? (
                              <p className="text-sm leading-6 text-gray-700">
                                "{review.comment}"
                              </p>
                            ) : (
                              <p className="text-sm italic text-gray-400">
                                No written comment was provided.
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-400">
                          Patient feedback
                        </span>

                        <span className="rounded-full bg-[#EAF6EC] px-3 py-1 text-xs font-semibold text-[#2E7D32]">
                          {getRatingLabel(review.rating)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
      </main>
    </div>
  );
}