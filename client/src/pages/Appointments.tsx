import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Building2,
  Home,
  Hospital,
  MapPin,
} from "lucide-react";

import Avatar from "../components/ui/Avatar";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import StatusBadge from "../components/ui/StatusBadge";
import LocationButton from "../components/ui/LocationButton";
import api from "../lib/api";

interface Appointment {
  id: number;
  status: string;
  notes: string | null;
  hasReview: boolean;

  appointmentType: "CLINIC" | "FARM_VISIT" | "OTHER";
  visitLocationName: string | null;
  visitAddress: string | null;
  visitLatitude: number | null;
  visitLongitude: number | null;

  slot: {
    startTime: string;
    endTime: string;

    appointmentType: "CLINIC" | "FARM_VISIT" | "OTHER";
    appointmentLocationName: string | null;
    appointmentAddress: string | null;
    appointmentLatitude: number | null;
    appointmentLongitude: number | null;
  };

  vet: {
    id: number;
    photoUrl: string | null;
    user: {
      name: string;
    };
  };
}

function AppointmentCardSkeleton() {
  return (
    <Card className="p-5 sm:p-6">
      <div className="flex items-center gap-3">
        <div className="h-11 w-11 animate-pulse rounded-full bg-gray-200" />

        <div className="flex-1">
          <div className="h-5 w-40 animate-pulse rounded bg-gray-200" />
          <div className="mt-2 h-4 w-32 animate-pulse rounded bg-gray-200" />
        </div>

        <div className="h-7 w-24 animate-pulse rounded-full bg-gray-200" />
      </div>

      <div className="mt-5 h-20 animate-pulse rounded-xl bg-gray-200" />

      <div className="mt-5 h-10 w-28 animate-pulse rounded-lg bg-gray-200" />
    </Card>
  );
}

function AppointmentsSkeleton() {
  return (
    <div className="min-h-screen bg-[#F8FBF7] px-5 py-8 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-7 animate-pulse">
          <div className="h-8 w-56 rounded-lg bg-gray-200" />
          <div className="mt-2 h-4 w-72 rounded bg-gray-200" />
        </div>

        <div className="space-y-5">
          <AppointmentCardSkeleton />
          <AppointmentCardSkeleton />
          <AppointmentCardSkeleton />
        </div>
      </div>
    </div>
  );
}

function getAppointmentTypeLabel(
  type: Appointment["appointmentType"]
) {
  if (type === "CLINIC") {
    return "Clinic / Hospital";
  }

  if (type === "FARM_VISIT") {
    return "Farm Visit";
  }

  return "Other Location";
}

function getAppointmentTypeIcon(
  type: Appointment["appointmentType"]
) {
  if (type === "CLINIC") {
    return <Hospital size={16} />;
  }

  if (type === "FARM_VISIT") {
    return <Home size={16} />;
  }

  return <Building2 size={16} />;
}

export default function Appointments() {
  const navigate = useNavigate();

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

  if (isLoading) {
    return <AppointmentsSkeleton />;
  }

  if (isError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FBF7] px-5 py-8">
        <Card className="w-full max-w-md p-8 text-center">
          <p className="font-medium text-red-500">
            Failed to load appointments.
          </p>

          <p className="mt-1 text-sm text-gray-500">
            Please try again later.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FBF7] px-5 py-8 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-7">
          <h1 className="text-2xl font-bold tracking-tight text-[#1F2937]">
            My Appointments
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            View your upcoming and previous veterinary appointments.
          </p>
        </div>

        {appointments?.length === 0 && (
          <Card className="border-dashed p-10 text-center sm:p-14">
            <CalendarDays
              size={28}
              className="mx-auto text-gray-400"
            />

            <p className="mt-4 font-medium text-gray-600">
              You have no appointments
            </p>

            <p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-gray-400">
              Appointments you book with veterinarians will appear here.
            </p>
          </Card>
        )}

        <div className="space-y-5">
          {appointments?.map((appointment) => {
            const startDate = new Date(
              appointment.slot.startTime
            );

            const endDate = new Date(
              appointment.slot.endTime
            );

            const isDifferentDay =
              startDate.toDateString() !==
              endDate.toDateString();

            const startDateText =
              startDate.toLocaleDateString("en-IN", {
                weekday: "short",
                day: "numeric",
                month: "short",
                year: "numeric",
              });

            const endDateText =
              endDate.toLocaleDateString("en-IN", {
                weekday: "short",
                day: "numeric",
                month: "short",
                year: "numeric",
              });

            const startTime =
              startDate.toLocaleTimeString("en-IN", {
                hour: "numeric",
                minute: "2-digit",
              });

            const endTime =
              endDate.toLocaleTimeString("en-IN", {
                hour: "numeric",
                minute: "2-digit",
              });

            const appointmentType =
              appointment.appointmentType ||
              appointment.slot.appointmentType;

            const isFarmVisit =
              appointmentType === "FARM_VISIT";

            const locationName = isFarmVisit
              ? appointment.visitLocationName
              : appointment.slot.appointmentLocationName;

            const address = isFarmVisit
              ? appointment.visitAddress
              : appointment.slot.appointmentAddress;

            const latitude = isFarmVisit
              ? appointment.visitLatitude
              : appointment.slot.appointmentLatitude;

            const longitude = isFarmVisit
              ? appointment.visitLongitude
              : appointment.slot.appointmentLongitude;

            return (
              <Card
                key={appointment.id}
                hover
                className="overflow-hidden"
              >
                <div className="h-1 bg-[#0D5E72]" />

                <div className="p-5 sm:p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          navigate(`/vets/${appointment.vet.id}`)
                        }
                        className="shrink-0 rounded-full focus:outline-none focus:ring-2 focus:ring-[#0D5E72] focus:ring-offset-2"
                        aria-label={`View Dr. ${appointment.vet.user.name}'s profile`}
                      >
                        <Avatar
                          src={appointment.vet.photoUrl}
                          name={appointment.vet.user.name}
                          size="md"
                        />
                      </button>

                      <div className="min-w-0">
                        <button
                          type="button"
                          onClick={() =>
                            navigate(`/vets/${appointment.vet.id}`)
                          }
                          className="block max-w-full truncate text-left text-lg font-semibold text-[#1F2937] hover:text-[#0D5E72] focus:outline-none focus:underline"
                        >
                          Dr. {appointment.vet.user.name}
                        </button>

                        <p className="text-sm text-gray-500">
                          Veterinarian
                        </p>
                      </div>
                    </div>

                    <StatusBadge status={appointment.status} />
                  </div>

                  <div className="mt-5 rounded-xl border border-[#E8F1EC] bg-[#F7FBF8] p-4">
                    <div className="flex items-start gap-3">
                      <CalendarDays
                        size={18}
                        className="mt-0.5 shrink-0 text-[#2E7D32]"
                      />

                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-[#2E7D32]">
                          Appointment
                        </p>

                        <p className="mt-1 font-semibold text-[#1F2937]">
                          {startDateText}
                        </p>

                        <div className="mt-1 flex items-center gap-1.5 text-sm text-gray-600">
                          <Clock3 size={14} />

                          <span>
                            {startTime} –{" "}
                            {isDifferentDay &&
                              `${endDateText}, `}
                            {endTime}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 rounded-xl border border-[#B7DDE3] bg-[#F1FAFB] p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#D9F0F3] text-[#0D5E72]">
                        {getAppointmentTypeIcon(
                          appointmentType
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-wide text-[#0D5E72]">
                          Appointment Type
                        </p>

                        <p className="mt-1 font-semibold text-[#1F2937]">
                          {getAppointmentTypeLabel(
                            appointmentType
                          )}
                        </p>

                        {appointmentType ===
                          "FARM_VISIT" && (
                          <p className="mt-1 text-sm leading-5 text-gray-600">
                            The veterinarian will visit your selected
                            location.
                          </p>
                        )}
                      </div>
                    </div>

                    {address && (
                      <div className="mt-4 border-t border-[#D7ECEF] pt-4">
                        <div className="flex items-start gap-3">
                          <MapPin
                            size={18}
                            className="mt-0.5 shrink-0 text-[#0D5E72]"
                          />

                          <div className="min-w-0">
                            {locationName && (
                              <p className="font-semibold text-[#1F2937]">
                                {locationName}
                              </p>
                            )}

                            <p className="mt-1 text-sm leading-6 text-gray-600">
                              {address}
                            </p>

                            <div className="mt-2">
                              <LocationButton
                                latitude={latitude}
                                longitude={longitude}
                                address={address}
                                label="Open in Maps"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {appointment.notes && (
                    <div className="mt-4 rounded-xl border border-gray-100 bg-gray-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                        Your Notes
                      </p>

                      <p className="mt-1 text-sm leading-6 text-gray-600">
                        {appointment.notes}
                      </p>
                    </div>
                  )}

                  {appointment.status === "COMPLETED" &&
                    appointment.hasReview && (
                      <div className="mt-5 flex items-start gap-3 rounded-xl bg-green-50 px-4 py-3">
                        <CheckCircle2
                          size={18}
                          className="mt-0.5 shrink-0 text-green-600"
                        />

                        <div>
                          <p className="text-sm font-semibold text-green-700">
                            Review submitted
                          </p>

                          <p className="mt-0.5 text-xs text-green-600">
                            Thank you for sharing your experience.
                          </p>
                        </div>
                      </div>
                    )}

                  {appointment.status === "COMPLETED" &&
                    !appointment.hasReview && (
                      <div className="mt-5 border-t border-gray-100 pt-5">
                        <div className="rounded-xl border border-[#D9E8E5] bg-[#F8FBF7] p-4">
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <p className="font-semibold text-[#1F2937]">
                                How was your experience?
                              </p>

                              <p className="mt-1 text-sm text-gray-500">
                                Share your feedback about Dr.{" "}
                                {appointment.vet.user.name}.
                              </p>
                            </div>

                            <Button
                              type="button"
                              onClick={() =>
                                navigate("/create-review", {
                                  state: {
                                    appointmentId:
                                      appointment.id,
                                    vetName:
                                      appointment.vet.user.name,
                                    vetPhotoUrl:
                                      appointment.vet.photoUrl,
                                  },
                                })
                              }
                            >
                              Review Vet
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}