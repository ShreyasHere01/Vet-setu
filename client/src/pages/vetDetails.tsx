import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { useState } from "react";

import api from "../lib/api";

interface Vet {
  id: number;
  specialty: string;
  bio: string | null;
  verified: boolean;
  user: {
    name: string;
    email: string;
  };
}

interface Slot {
  id: number;
  startTime: string;
  endTime: string;
  isBooked: boolean;
}

interface Review {
  id: number;
  rating: number;
  comment: string | null;
  createdAt: string;
  farmer: {
    name: string;
  };
}

export default function VetDetails() {
   
  const { id } = useParams();
  const queryClient = useQueryClient();

  const [bookingSlotId, setBookingSlotId] = useState<number | null>(
    null
  );

  // React Query:
  // Fetch vet details.
  const {
    data: vet,
    isLoading: vetLoading,
    isError: vetError,
  } = useQuery<Vet>({
    queryKey: ["vet", id],
    queryFn: async () => {
      const response = await api.get(`/vets/${id}`);

  console.log("REVIEWS FROM API:", response.data);
      return response.data;
    },
  });

  // React Query:
  // Fetch available slots for this vet.
  const {
    data: slots,
    isLoading: slotsLoading,
    isError: slotsError,
  } = useQuery<Slot[]>({
    queryKey: ["slots", id],
    queryFn: async () => {
      const response = await api.get(`/vets/${id}/slots`);
      return response.data;
    },
  });

  // React Query:
  // Fetch reviews for this vet.
  const {
    data: reviews,
    isLoading: reviewsLoading,
    isError: reviewsError,
  } = useQuery<Review[]>({
    queryKey: ["reviews", id],
    queryFn: async () => {
      const response = await api.get(`/reviews/vet/${id}`);
      return response.data;
    },
  });

  // React Query:
  // Creates an appointment when farmer books a slot.
  const bookingMutation = useMutation({
    mutationFn: async (slotId: number) => {
      const response = await api.post("/appointments", {
        slotId,
      });

      return response.data;
    },

    retry: false,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["slots", id],
      });

      setBookingSlotId(null);
    },

    onError: () => {
      setBookingSlotId(null);
    },
  });

  if (vetLoading) {
    return <p className="p-8">Loading vet...</p>;
  }

  if (vetError) {
    return (
      <p className="p-8">
        Failed to load vet.
      </p>
    );
  }

  if (!vet) {
    return (
      <p className="p-8">
        Vet not found.
      </p>
    );
  }

  const handleBook = (slotId: number) => {
    setBookingSlotId(slotId);
    bookingMutation.mutate(slotId);
  };

  return (
    <div className="p-8">

      {/* Back */}

      <Link
        to="/vets"
        className="mb-6 inline-block text-blue-600 hover:underline"
      >
        ← Back to Vets
      </Link>

      {/* Vet Details */}

      <h1 className="text-3xl font-bold">
        {vet.user.name}
      </h1>

      <p className="mt-2 text-gray-600">
        {vet.specialty}
      </p>

      {vet.bio && (
        <p className="mt-4">
          {vet.bio}
        </p>
      )}

      <p className="mt-4">
        {vet.verified
          ? "Verified Veterinarian"
          : "Not Verified"}
      </p>

      {/* Slots */}

      <div className="mt-8">
        <h2 className="text-xl font-bold">
          Available Slots
        </h2>

        {slotsLoading && (
          <p className="mt-4">
            Loading slots...
          </p>
        )}

        {slotsError && (
          <p className="mt-4 text-red-500">
            Failed to load slots.
          </p>
        )}

        {!slotsLoading &&
          !slotsError &&
          slots?.length === 0 && (
            <p className="mt-4 text-gray-500">
              No available slots.
            </p>
          )}

        <div className="mt-4 space-y-3">
          {slots?.map((slot) => (
            <div
              key={slot.id}
              className="flex items-center justify-between rounded-lg border p-4"
            >
              <div>
                <p className="font-medium">
                  {new Date(
                    slot.startTime
                  ).toLocaleString("en-IN")}
                </p>

                <p className="text-sm text-gray-500">
                  to{" "}
                  {new Date(
                    slot.endTime
                  ).toLocaleString("en-IN")}
                </p>
              </div>

              <button
                onClick={() => handleBook(slot.id)}
                disabled={
                  bookingMutation.isPending &&
                  bookingSlotId === slot.id
                }
                className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
              >
                {bookingMutation.isPending &&
                bookingSlotId === slot.id
                  ? "Booking..."
                  : "Book"}
              </button>
            </div>
          ))}
        </div>

        {bookingMutation.isSuccess && (
          <p className="mt-4 text-green-600">
            Appointment booked successfully!
          </p>
        )}

        {bookingMutation.isError && (
          <p className="mt-4 text-red-500">
            Booking failed. Please try again.
          </p>
        )}
      </div>

      {/* Reviews */}

      <div className="mt-10">
        <h2 className="text-xl font-bold">
          Reviews
        </h2>

        {reviewsLoading && (
          <p className="mt-4">
            Loading reviews...
          </p>
        )}

        {reviewsError && (
          <p className="mt-4 text-red-500">
            Failed to load reviews.
          </p>
        )}

        {!reviewsLoading &&
          !reviewsError &&
          reviews?.length === 0 && (
            <p className="mt-4 text-gray-500">
              No reviews yet.
            </p>
          )}

        <div className="mt-4 space-y-4">
          {reviews?.map((review) => (
            <div
              key={review.id}
              className="rounded-lg border p-4"
            >
              <div className="flex items-center justify-between">
                <p className="font-semibold">
                  {review.farmer.name}
                </p>

                <p className="text-sm text-gray-500">
                  {new Date(
                    review.createdAt
                  ).toLocaleDateString("en-IN")}
                </p>
              </div>

              <p className="mt-2 text-yellow-500">
                {"★".repeat(review.rating)}
                {"☆".repeat(5 - review.rating)}
              </p>

              {review.comment && (
                <p className="mt-2 text-gray-700">
                  {review.comment}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}