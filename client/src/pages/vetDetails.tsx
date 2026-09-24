import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  CheckCircle2,
  Clock3,
  ExternalLink,
  Home,
  Hospital,
  MapPin,
  Navigation,
  PawPrint,
  Stethoscope,
  X,
} from "lucide-react";

import api from "../lib/api";
import Avatar from "../components/ui/Avatar";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import LocationButton from "../components/ui/LocationButton";

interface Vet {
  id: number;
  specialty: string;
  bio: string | null;
  photoUrl: string | null;
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
  appointmentType: "CLINIC" | "FARM_VISIT" | "OTHER";
  appointmentLocationName: string | null;
  appointmentAddress: string | null;
  appointmentLatitude: number | null;
  appointmentLongitude: number | null;
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

interface FarmerProfile {
  name: string;
  email: string;
  farmAddress: string | null;
  farmLatitude: number | null;
  farmLongitude: number | null;
}

interface BookingLocation {
  visitLocationName: string;
  visitAddress: string;
  visitLatitude: number | null;
  visitLongitude: number | null;
}

function VetDetailsSkeleton() {
  return (
    <div className="min-h-screen bg-[#F8FBF7] px-5 py-8 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 h-5 w-32 animate-pulse rounded bg-gray-200" />

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex gap-5">
            <div className="h-20 w-20 animate-pulse rounded-full bg-gray-200" />

            <div className="flex-1">
              <div className="h-8 w-64 animate-pulse rounded bg-gray-200" />
              <div className="mt-3 h-5 w-40 animate-pulse rounded bg-gray-200" />
              <div className="mt-5 h-4 w-full animate-pulse rounded bg-gray-200" />
              <div className="mt-2 h-4 w-4/5 animate-pulse rounded bg-gray-200" />
            </div>
          </div>
        </div>

        <div className="mt-10">
          <div className="h-7 w-44 animate-pulse rounded bg-gray-200" />

          <div className="mt-4 space-y-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
              >
                <div className="h-5 w-48 animate-pulse rounded bg-gray-200" />
                <div className="mt-2 h-4 w-32 animate-pulse rounded bg-gray-200" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function getAppointmentTypeLabel(type: Slot["appointmentType"]) {
  if (type === "CLINIC") {
    return "Clinic / Hospital";
  }

  if (type === "FARM_VISIT") {
    return "Farm Visit";
  }

  return "Other Location";
}

function getAppointmentTypeIcon(type: Slot["appointmentType"]) {
  if (type === "CLINIC") {
    return <Hospital size={16} />;
  }

  if (type === "FARM_VISIT") {
    return <PawPrint size={16} />;
  }

  return <Building2 size={16} />;
}

export default function VetDetails() {
  const { id } = useParams();
  const queryClient = useQueryClient();

  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [bookingSlotId, setBookingSlotId] = useState<number | null>(null);

  const [locationMode, setLocationMode] = useState<
    "REGISTERED" | "CURRENT" | "OTHER" | null
  >(null);

  const [visitLocationName, setVisitLocationName] = useState("");
  const [visitAddress, setVisitAddress] = useState("");

  const [visitLatitude, setVisitLatitude] = useState<number | null>(null);
  const [visitLongitude, setVisitLongitude] = useState<number | null>(null);

  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState("");

  /*
   * Vet
   */
  const {
    data: vet,
    isLoading: vetLoading,
    isError: vetError,
  } = useQuery<Vet>({
    queryKey: ["vet", id],
    queryFn: async () => {
      const response = await api.get(`/vets/${id}`);
      return response.data;
    },
    enabled: !!id,
  });

  /*
   * Slots
   */
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
    enabled: !!id,
  });

  /*
   * Reviews
   */
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
    enabled: !!id,
  });

  /*
   * Farmer profile
   */
  const {
    data: farmerProfile,
    isLoading: farmerProfileLoading,
  } = useQuery<FarmerProfile>({
    queryKey: ["farmer-profile"],
    queryFn: async () => {
      const response = await api.get("/users/profile");
      return response.data;
    },
  });

  /*
   * Booking mutation
   */
  const bookingMutation = useMutation({
    mutationFn: async ({
      slotId,
      location,
    }: {
      slotId: number;
      location?: BookingLocation;
    }) => {
      const response = await api.post("/appointments", {
        slotId,
        visitLocationName: location?.visitLocationName ?? null,
        visitAddress: location?.visitAddress ?? null,
        visitLatitude: location?.visitLatitude ?? null,
        visitLongitude: location?.visitLongitude ?? null,
      });

      return response.data;
    },

    retry: false,

    onMutate: ({ slotId }) => {
      setBookingSlotId(slotId);
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["slots", id],
      });

      await queryClient.invalidateQueries({
        queryKey: ["my-appointments"],
      });

      setBookingSlotId(null);
      setSelectedSlot(null);
      resetLocationForm();
    },

    onError: () => {
      setBookingSlotId(null);
    },
  });

  /*
   * Reset farm visit location form
   */
  const resetLocationForm = () => {
    setLocationMode(null);
    setVisitLocationName("");
    setVisitAddress("");
    setVisitLatitude(null);
    setVisitLongitude(null);
    setLocationError("");
    setLocationLoading(false);
  };

  /*
   * Close booking modal
   */
  const closeBooking = () => {
    if (bookingMutation.isPending) {
      return;
    }

    setSelectedSlot(null);
    resetLocationForm();
    bookingMutation.reset();
  };

  /*
   * Registered farm location
   */
  const selectRegisteredLocation = () => {
    setLocationError("");

    if (
      !farmerProfile?.farmAddress ||
      farmerProfile.farmLatitude === null ||
      farmerProfile.farmLatitude === undefined ||
      farmerProfile.farmLongitude === null ||
      farmerProfile.farmLongitude === undefined
    ) {
      setLocationError(
        "You don't have a complete registered farm location. Please choose another location."
      );
      return;
    }

    setLocationMode("REGISTERED");

    setVisitLocationName("My Farm");
    setVisitAddress(farmerProfile.farmAddress);
    setVisitLatitude(farmerProfile.farmLatitude);
    setVisitLongitude(farmerProfile.farmLongitude);
  };

  /*
   * Current GPS location
   */
  const useCurrentLocation = () => {
    setLocationError("");

    if (!navigator.geolocation) {
      setLocationError(
        "Location services are not supported by your browser."
      );
      return;
    }

    setLocationMode("CURRENT");
    setLocationLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        setVisitLatitude(lat);
        setVisitLongitude(lon);

        try {
          const response = await api.get("/location/reverse-geocode", {
            params: {
              lat,
              lon,
            },
          });

          const data = response.data;

          setVisitLocationName(data.locationName || "Visit Location");

          setVisitAddress(data.address || data.displayName || "");
        } catch {
          setLocationError(
            "Location detected, but we couldn't find the address. Please enter it manually."
          );

          setVisitLocationName("Visit Location");
        } finally {
          setLocationLoading(false);
        }
      },
      (error) => {
        setLocationLoading(false);

        if (error.code === error.PERMISSION_DENIED) {
          setLocationError(
            "Location permission was denied. Please allow location access or enter the address manually."
          );
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          setLocationError(
            "Your current location could not be determined."
          );
        } else {
          setLocationError("Unable to detect your current location.");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };

  /*
   * Manual location
   */
  const selectOtherLocation = () => {
    setLocationMode("OTHER");
    setLocationError("");
    setVisitLocationName("");
    setVisitAddress("");
    setVisitLatitude(null);
    setVisitLongitude(null);
  };

  /*
   * Book slot
   */
  const handleBook = (slot: Slot) => {
    bookingMutation.reset();

    if (slot.appointmentType === "FARM_VISIT") {
      setSelectedSlot(slot);
      resetLocationForm();
      return;
    }

    bookingMutation.mutate({
      slotId: slot.id,
    });
  };

  /*
   * Confirm farm visit
   */
  const confirmFarmVisit = () => {
    if (!selectedSlot) {
      return;
    }

    if (!visitLocationName.trim()) {
      setLocationError("Please enter a location name.");
      return;
    }

    if (!visitAddress.trim()) {
      setLocationError("Please enter the complete address.");
      return;
    }

    bookingMutation.mutate({
      slotId: selectedSlot.id,
      location: {
        visitLocationName: visitLocationName.trim(),
        visitAddress: visitAddress.trim(),
        visitLatitude,
        visitLongitude,
      },
    });
  };

  /*
   * Loading state
   */
  if (vetLoading) {
    return <VetDetailsSkeleton />;
  }

  /*
   * Error state
   */
  if (vetError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FBF7] px-5 py-8">
        <Card className="w-full max-w-md p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500">
            <Stethoscope size={24} />
          </div>

          <h2 className="mt-5 text-xl font-bold text-[#1F2937]">
            Unable to load veterinarian
          </h2>

          <p className="mt-2 text-sm leading-6 text-gray-500">
            Something went wrong while loading this veterinarian.
          </p>

          <Link
            to="/vets"
            className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#0D5E72] hover:underline"
          >
            <ArrowLeft size={16} />
            Back to Veterinarians
          </Link>
        </Card>
      </div>
    );
  }

  /*
   * Vet not found
   */
  if (!vet) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FBF7] px-5 py-8">
        <Card className="w-full max-w-md p-8 text-center">
          <p className="font-medium text-gray-600">
            Veterinarian not found.
          </p>

          <Link
            to="/vets"
            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#0D5E72] hover:underline"
          >
            <ArrowLeft size={16} />
            Back to Veterinarians
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FBF7] px-5 py-8 sm:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Back */}
        <Link
          to="/vets"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[#0D5E72] hover:underline"
        >
          <ArrowLeft size={16} />
          Back to Veterinarians
        </Link>

        {/* Vet profile */}
        <Card className="p-6 sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            <Avatar
              src={vet.photoUrl}
              name={vet.user.name}
              size="xl"
            />

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-bold text-[#1F2937]">
                  Dr. {vet.user.name}
                </h1>

                {vet.verified && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700">
                    <CheckCircle2 size={14} />
                    Verified
                  </span>
                )}
              </div>

              {/* Dynamic specialty */}
              <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-[#E3F3F5] px-3 py-1.5">
                <Stethoscope
                  size={15}
                  className="text-[#0D5E72]"
                />

                <p className="text-sm font-semibold text-[#0D5E72]">
                  {vet.specialty}
                </p>
              </div>

              {vet.bio && (
                <p className="mt-4 max-w-3xl leading-7 text-gray-600">
                  {vet.bio}
                </p>
              )}
            </div>
          </div>
        </Card>

        {/* Available slots */}
        <section className="mt-10">
          <div className="mb-5">
            <h2 className="text-2xl font-bold text-[#1F2937]">
              Available Slots
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Choose a suitable time and appointment type.
            </p>
          </div>

          {/* Loading */}
          {slotsLoading && (
            <div className="space-y-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
                >
                  <div className="h-5 w-48 animate-pulse rounded bg-gray-200" />
                  <div className="mt-2 h-4 w-32 animate-pulse rounded bg-gray-200" />
                </div>
              ))}
            </div>
          )}

          {/* Error */}
          {slotsError && (
            <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-600">
              Failed to load available slots.
            </div>
          )}

          {/* No slots */}
          {!slotsLoading &&
            !slotsError &&
            slots?.length === 0 && (
              <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center">
                <Clock3
                  size={28}
                  className="mx-auto text-gray-400"
                />

                <p className="mt-3 font-semibold text-gray-700">
                  No available slots
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  This vet currently has no available appointment slots.
                </p>
              </div>
            )}

          {/* Slots */}
          {!slotsLoading &&
            !slotsError &&
            slots &&
            slots.length > 0 && (
              <div className="space-y-4">
                {slots.map((slot) => (
                  <Card
                    key={slot.id}
                    className="p-5 transition hover:shadow-md sm:p-6"
                  >
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                      <div className="min-w-0">
                        {/* Date/time */}
                        <div className="flex flex-wrap items-center gap-2">
                          <Clock3
                            size={17}
                            className="text-[#0D5E72]"
                          />

                          <p className="font-semibold text-[#1F2937]">
                            {formatDateTime(slot.startTime)}
                          </p>

                          <span className="text-gray-400">
                            →
                          </span>

                          <p className="font-semibold text-[#1F2937]">
                            {formatDateTime(slot.endTime)}
                          </p>
                        </div>

                        {/* Appointment type */}
                        <div className="mt-3">
                          <span className="inline-flex items-center gap-2 rounded-full bg-[#E8F5F7] px-3 py-1.5 text-xs font-semibold text-[#0D5E72]">
                            {getAppointmentTypeIcon(
                              slot.appointmentType
                            )}

                            {getAppointmentTypeLabel(
                              slot.appointmentType
                            )}
                          </span>
                        </div>

                        {/* Clinic / Hospital location */}
                        {slot.appointmentType !== "FARM_VISIT" &&
                          slot.appointmentAddress && (
                            <div className="mt-4 rounded-xl border border-gray-100 bg-gray-50 p-4">
                              <div className="flex items-start gap-3">
                                <MapPin
                                  size={18}
                                  className="mt-0.5 shrink-0 text-[#0D5E72]"
                                />

                                <div className="min-w-0">
                                  {slot.appointmentLocationName && (
                                    <p className="font-semibold text-[#1F2937]">
                                      {
                                        slot.appointmentLocationName
                                      }
                                    </p>
                                  )}

                                  <p className="mt-1 text-sm leading-6 text-gray-600">
                                    {slot.appointmentAddress}
                                  </p>

                                  <div className="mt-2">
                                    <LocationButton
                                      latitude={
                                        slot.appointmentLatitude
                                      }
                                      longitude={
                                        slot.appointmentLongitude
                                      }
                                      address={
                                        slot.appointmentAddress
                                      }
                                      label="Open in Maps"
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                        {/* Farm visit */}
                        {slot.appointmentType === "FARM_VISIT" && (
                          <div className="mt-4 flex items-start gap-3 rounded-xl border border-[#B7DDE3] bg-[#F1FAFB] p-4">
                            <Home
                              size={18}
                              className="mt-0.5 shrink-0 text-[#0D5E72]"
                            />

                            <div>
                              <p className="text-sm font-semibold text-[#1F2937]">
                                Vet will visit your location
                              </p>

                              <p className="mt-1 text-xs leading-5 text-gray-600">
                                You'll provide the exact visit location
                                when booking this slot.
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Book */}
                      <Button
                        type="button"
                        loading={
                          bookingMutation.isPending &&
                          bookingSlotId === slot.id
                        }
                        disabled={bookingMutation.isPending}
                        onClick={() => handleBook(slot)}
                        className="w-full shrink-0 sm:w-auto"
                      >
                        Book Appointment
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}

          {/* Success */}
          {bookingMutation.isSuccess && (
            <div className="mt-5 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-700">
              <CheckCircle2 size={18} />
              Appointment booked successfully.
            </div>
          )}

          {/* Error */}
          {bookingMutation.isError && (
            <div className="mt-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
              <AlertCircle
                size={18}
                className="mt-0.5 shrink-0"
              />

              <span>
                {(bookingMutation.error as any)?.response?.data
                  ?.error || "Booking failed. Please try again."}
              </span>
            </div>
          )}
        </section>

        {/* Reviews */}
        <section className="mt-10 pb-10">
          <h2 className="text-2xl font-bold text-[#1F2937]">
            Reviews
          </h2>

          {/* Loading */}
          {reviewsLoading && (
            <div className="mt-4 space-y-4">
              {[1, 2].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
                >
                  <div className="h-5 w-32 animate-pulse rounded bg-gray-200" />
                  <div className="mt-3 h-5 w-24 animate-pulse rounded bg-gray-200" />
                  <div className="mt-3 h-4 w-full animate-pulse rounded bg-gray-200" />
                </div>
              ))}
            </div>
          )}

          {/* Error */}
          {reviewsError && (
            <p className="mt-4 text-red-500">
              Failed to load reviews.
            </p>
          )}

          {/* No reviews */}
          {!reviewsLoading &&
            !reviewsError &&
            reviews?.length === 0 && (
              <div className="mt-4 rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center">
                <p className="text-gray-500">
                  No reviews yet.
                </p>
              </div>
            )}

          {/* Reviews */}
          {!reviewsLoading &&
            !reviewsError &&
            reviews &&
            reviews.length > 0 && (
              <div className="mt-4 space-y-4">
                {reviews.map((review) => (
                  <Card
                    key={review.id}
                    className="p-5"
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <p className="font-semibold text-[#1F2937]">
                        {review.farmer.name}
                      </p>

                      <p className="text-sm text-gray-500">
                        {new Date(
                          review.createdAt
                        ).toLocaleDateString("en-IN")}
                      </p>
                    </div>

                    <p className="mt-2 text-lg text-[#B77900]">
                      {"★".repeat(review.rating)}
                      {"☆".repeat(5 - review.rating)}
                    </p>

                    {review.comment && (
                      <p className="mt-2 leading-6 text-gray-600">
                        {review.comment}
                      </p>
                    )}
                  </Card>
                ))}
              </div>
            )}
        </section>
      </div>

      {/* Farm Visit Modal */}
      {selectedSlot &&
        selectedSlot.appointmentType === "FARM_VISIT" && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-xl">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-gray-100 p-5">
                <div>
                  <div className="flex items-center gap-2">
                    <Home
                      size={19}
                      className="text-[#0D5E72]"
                    />

                    <h2 className="text-lg font-bold text-[#1F2937]">
                      Farm Visit Location
                    </h2>
                  </div>

                  <p className="mt-1 text-sm text-gray-500">
                    Tell the vet where the visit should take place.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeBooking}
                  disabled={bookingMutation.isPending}
                  className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Body */}
              <div className="space-y-5 p-5">
                {/* Selected appointment */}
                <div className="rounded-xl bg-[#F8FBF7] p-4">
                  <p className="text-sm font-semibold text-[#1F2937]">
                    Selected appointment
                  </p>

                  <p className="mt-1 text-sm text-gray-600">
                    {formatDateTime(
                      selectedSlot.startTime
                    )}
                  </p>
                </div>

                {/* Location options */}
                <div>
                  <p className="mb-3 text-sm font-semibold text-gray-700">
                    Choose visit location
                  </p>

                  <div className="grid gap-3">
                    {/* Registered location */}
                    <button
                      type="button"
                      onClick={selectRegisteredLocation}
                      disabled={farmerProfileLoading}
                      className={`rounded-xl border-2 p-4 text-left transition ${
                        locationMode === "REGISTERED"
                          ? "border-[#0D5E72] bg-[#E8F5F7]"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <Home
                          size={20}
                          className="mt-0.5 text-[#0D5E72]"
                        />

                        <div>
                          <p className="font-semibold text-[#1F2937]">
                            Use my registered farm location
                          </p>

                          <p className="mt-1 text-xs text-gray-500">
                            Use the location saved in your profile.
                          </p>
                        </div>
                      </div>
                    </button>

                    {/* Current location */}
                    <button
                      type="button"
                      onClick={useCurrentLocation}
                      disabled={locationLoading}
                      className={`rounded-xl border-2 p-4 text-left transition ${
                        locationMode === "CURRENT"
                          ? "border-[#0D5E72] bg-[#E8F5F7]"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <Navigation
                          size={20}
                          className="mt-0.5 text-[#0D5E72]"
                        />

                        <div>
                          <p className="font-semibold text-[#1F2937]">
                            Use my current location
                          </p>

                          <p className="mt-1 text-xs text-gray-500">
                            Detect your current GPS location.
                          </p>
                        </div>
                      </div>
                    </button>

                    {/* Other location */}
                    <button
                      type="button"
                      onClick={selectOtherLocation}
                      className={`rounded-xl border-2 p-4 text-left transition ${
                        locationMode === "OTHER"
                          ? "border-[#0D5E72] bg-[#E8F5F7]"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <MapPin
                          size={20}
                          className="mt-0.5 text-[#0D5E72]"
                        />

                        <div>
                          <p className="font-semibold text-[#1F2937]">
                            Use another location
                          </p>

                          <p className="mt-1 text-xs text-gray-500">
                            Enter a different address manually.
                          </p>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Location error */}
                {locationError && (
                  <div className="flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-700">
                    <AlertCircle
                      size={17}
                      className="mt-0.5 shrink-0"
                    />

                    <span>{locationError}</span>
                  </div>
                )}

                {/* Location form */}
                {locationMode && (
                  <div className="space-y-4">
                    {/* Location name */}
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-gray-700">
                        Location name
                      </label>

                      <input
                        type="text"
                        value={visitLocationName}
                        onChange={(event) =>
                          setVisitLocationName(event.target.value)
                        }
                        placeholder="e.g. My Farm"
                        className="h-12 w-full rounded-xl border border-gray-300 px-4 text-sm outline-none transition focus:border-[#0D5E72] focus:ring-2 focus:ring-[#0D5E72]/10"
                      />
                    </div>

                    {/* Address */}
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-gray-700">
                        Full address
                      </label>

                      <textarea
                        rows={3}
                        value={visitAddress}
                        onChange={(event) =>
                          setVisitAddress(event.target.value)
                        }
                        placeholder="Enter the complete visit address"
                        className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-[#0D5E72] focus:ring-2 focus:ring-[#0D5E72]/10"
                      />
                    </div>

                    {/* Coordinates */}
                    {visitLatitude !== null &&
                      visitLongitude !== null && (
                        <div className="rounded-xl border border-green-200 bg-green-50 p-4">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-start gap-3">
                              <CheckCircle2
                                size={18}
                                className="mt-0.5 text-green-600"
                              />

                              <div>
                                <p className="text-sm font-semibold text-green-800">
                                  Location coordinates available
                                </p>

                                <p className="mt-1 text-xs text-green-700">
                                  {visitLatitude.toFixed(6)},{" "}
                                  {visitLongitude.toFixed(6)}
                                </p>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                window.open(
                                  `https://www.google.com/maps/search/?api=1&query=${visitLatitude},${visitLongitude}`,
                                  "_blank",
                                  "noopener,noreferrer"
                                )
                              }
                              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0D5E72] hover:underline"
                            >
                              <ExternalLink size={14} />
                              Maps
                            </button>
                          </div>
                        </div>
                      )}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex flex-col-reverse gap-3 border-t border-gray-100 bg-gray-50/70 p-5 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={closeBooking}
                  disabled={bookingMutation.isPending}
                >
                  Cancel
                </Button>

                <Button
                  type="button"
                  onClick={confirmFarmVisit}
                  loading={bookingMutation.isPending}
                  disabled={!locationMode || locationLoading}
                >
                  Confirm & Book
                </Button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}