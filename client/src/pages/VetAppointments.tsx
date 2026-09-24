import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  Building2,
  Hospital,
  MapPin,
  PawPrint,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Avatar from "../components/ui/Avatar";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import LocationButton from "../components/ui/LocationButton";
import StatusBadge from "../components/ui/StatusBadge";
import api from "../lib/api";

interface Appointment {
  id: number;
  status: string;
  notes: string | null;

  appointmentType:
    | "CLINIC"
    | "FARM_VISIT"
    | "OTHER";

  visitLocationName: string | null;
  visitAddress: string | null;
  visitLatitude: number | null;
  visitLongitude: number | null;

  slot: {
    startTime: string;
    endTime: string;

    appointmentType:
      | "CLINIC"
      | "FARM_VISIT"
      | "OTHER";

    appointmentLocationName: string | null;
    appointmentAddress: string | null;
    appointmentLatitude: number | null;
    appointmentLongitude: number | null;
  };

  farmer: {
    id: number;
    name: string;
    email: string;
    photoUrl: string | null;
  };
}

interface StatusUpdate {
  appointmentId: number;
  status: string;
}

function AppointmentSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 animate-pulse rounded-full bg-gray-200" />

        <div className="flex-1">
          <div className="h-5 w-40 animate-pulse rounded bg-gray-200" />

          <div className="mt-2 h-4 w-56 animate-pulse rounded bg-gray-200" />
        </div>

        <div className="h-7 w-24 animate-pulse rounded-full bg-gray-200" />
      </div>

      <div className="mt-5 rounded-xl bg-gray-50 p-4">
        <div className="h-4 w-28 animate-pulse rounded bg-gray-200" />

        <div className="mt-2 h-5 w-56 animate-pulse rounded bg-gray-200" />
      </div>

      <div className="mt-4 h-28 animate-pulse rounded-xl bg-gray-50" />

      <div className="mt-4 h-24 animate-pulse rounded-xl bg-gray-50" />

      <div className="mt-5 flex gap-2">
        <div className="h-10 w-24 animate-pulse rounded-lg bg-gray-200" />

        <div className="h-10 w-20 animate-pulse rounded-lg bg-gray-200" />
      </div>
    </div>
  );
}

function VetAppointmentsSkeleton() {
  return (
    <div className="min-h-screen bg-[#F8FBF7] p-5 sm:p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <div className="h-8 w-52 animate-pulse rounded-lg bg-gray-200" />

          <div className="mt-2 h-4 w-72 animate-pulse rounded bg-gray-200" />
        </div>

        <div className="space-y-5">
          <AppointmentSkeleton />
          <AppointmentSkeleton />
          <AppointmentSkeleton />
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
    return <Hospital size={17} />;
  }

  if (type === "FARM_VISIT") {
    return <PawPrint size={17} />;
  }

  return <Building2 size={17} />;
}

export default function VetAppointments() {
  const navigate = useNavigate();

  const queryClient = useQueryClient();

  const [
    updatingAppointmentId,
    setUpdatingAppointmentId,
  ] = useState<number | null>(null);

  const {
    data: appointments,
    isLoading,
    isError,
  } = useQuery<Appointment[]>({
    queryKey: ["vet-appointments"],

    queryFn: async () => {
      const response = await api.get(
        "/appointments/vet/my"
      );

      return response.data;
    },
  });

  const statusMutation = useMutation({
    mutationFn: async ({
      appointmentId,
      status,
    }: StatusUpdate) => {
      const response = await api.patch(
        `/appointments/${appointmentId}/status`,
        {
          status,
        }
      );

      return response.data;
    },

    onMutate: ({ appointmentId }) => {
      setUpdatingAppointmentId(appointmentId);
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["vet-appointments"],
      });

      await queryClient.invalidateQueries({
        queryKey: ["my-appointments"],
      });

      setUpdatingAppointmentId(null);
    },

    onError: () => {
      setUpdatingAppointmentId(null);
    },
  });

  if (isLoading) {
    return <VetAppointmentsSkeleton />;
  }

  if (isError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FBF7] p-5">
        <Card className="p-8 text-center">
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
    <div className="min-h-screen bg-[#F8FBF7] p-5 sm:p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-7">
          <h1 className="text-2xl font-bold text-[#1F2937]">
            My Appointments
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Review and manage appointments booked by farmers.
          </p>
        </div>

        {statusMutation.isError && (
          <Card className="mb-5 border-red-100 bg-red-50 px-4 py-3 shadow-none">
            <p className="text-sm text-red-600">
              {(statusMutation.error as any)?.response?.data
                ?.error ||
                "Failed to update appointment."}
            </p>
          </Card>
        )}

        {appointments?.length === 0 && (
          <Card className="border-dashed p-10 text-center">
            <p className="font-medium text-gray-600">
              You have no appointments.
            </p>

            <p className="mt-1 text-sm text-gray-400">
              New appointments from farmers will appear here.
            </p>
          </Card>
        )}

        <div className="space-y-5">
          {appointments?.map((appointment) => {
            const isUpdating =
              updatingAppointmentId === appointment.id;

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

            let locationName: string | null = null;
            let address: string | null = null;
            let latitude: number | null = null;
            let longitude: number | null = null;

            if (appointmentType === "FARM_VISIT") {
              locationName =
                appointment.visitLocationName;

              address =
                appointment.visitAddress;

              latitude =
                appointment.visitLatitude;

              longitude =
                appointment.visitLongitude;
            } else {
              locationName =
                appointment.slot
                  .appointmentLocationName;

              address =
                appointment.slot.appointmentAddress;

              latitude =
                appointment.slot.appointmentLatitude;

              longitude =
                appointment.slot.appointmentLongitude;
            }

            return (
              <Card
                key={appointment.id}
                hover
              >
                <div className="p-5 sm:p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            `/vet/farmer/${appointment.farmer.id}`
                          )
                        }
                        className="shrink-0 rounded-full focus:outline-none focus:ring-2 focus:ring-[#0D5E72] focus:ring-offset-2"
                        title="View farmer profile"
                      >
                        <Avatar
                          src={
                            appointment.farmer
                              .photoUrl
                          }
                          name={
                            appointment.farmer
                              .name
                          }
                          size="md"
                        />
                      </button>

                      <div className="min-w-0">
                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              `/vet/farmer/${appointment.farmer.id}`
                            )
                          }
                          className="block max-w-full truncate text-left text-lg font-semibold text-[#1F2937] transition hover:text-[#0D5E72]"
                        >
                          {appointment.farmer.name}
                        </button>

                        <p className="truncate text-sm text-gray-500">
                          {appointment.farmer.email}
                        </p>
                      </div>
                    </div>

                    <StatusBadge
                      status={appointment.status}
                    />
                  </div>

                  <div className="mt-5 rounded-xl border border-[#E8F1EC] bg-[#F7FBF8] p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#2E7D32]">
                      Appointment
                    </p>

                    <p className="mt-1 font-semibold text-[#1F2937]">
                      {startDateText}
                    </p>

                    <p className="mt-1 text-sm text-gray-600">
                      {startTime} –{" "}
                      {isDifferentDay &&
                        `${endDateText}, `}
                      {endTime}
                    </p>
                  </div>

                  <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4">
                    <div className="flex items-center gap-2">
                      <span className="text-[#0D5E72]">
                        {getAppointmentTypeIcon(
                          appointmentType
                        )}
                      </span>

                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                          Appointment Type
                        </p>

                        <p className="mt-1 text-sm font-semibold text-[#1F2937]">
                          {getAppointmentTypeLabel(
                            appointmentType
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 border-t border-gray-100 pt-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#E8F5F7] text-[#0D5E72]">
                          <MapPin size={17} />
                        </div>

                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-[#1F2937]">
                            {appointmentType ===
                            "FARM_VISIT"
                              ? "Farmer's Visit Location"
                              : "Appointment Location"}
                          </p>

                          {locationName && (
                            <p className="mt-1 text-sm font-medium text-gray-700">
                              {locationName}
                            </p>
                          )}

                          {address && (
                            <p className="mt-1 text-sm leading-6 text-gray-600">
                              {address}
                            </p>
                          )}

                          {!locationName &&
                            !address && (
                              <p className="mt-1 text-sm text-gray-500">
                                {appointmentType ===
                                "FARM_VISIT"
                                  ? "Farmer has not provided a visit location."
                                  : "Location was not provided."}
                              </p>
                            )}
                        </div>
                      </div>

                      {(latitude !== null ||
                        longitude !== null ||
                        address) && (
                        <div className="mt-4">
                          <LocationButton
                            latitude={latitude}
                            longitude={longitude}
                            address={address}
                            label="Open location in Maps"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {appointment.notes && (
                    <div className="mt-4 rounded-xl border border-gray-100 bg-gray-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                        Farmer's Notes
                      </p>

                      <p className="mt-1 text-sm leading-6 text-gray-600">
                        {appointment.notes}
                      </p>
                    </div>
                  )}

                  <div className="mt-5 border-t border-gray-100 pt-5">
                    {appointment.status ===
                      "PENDING" && (
                      <div className="flex flex-wrap gap-3">
                        <Button
                          type="button"
                          variant="primary"
                          loading={isUpdating}
                          onClick={() =>
                            statusMutation.mutate({
                              appointmentId:
                                appointment.id,
                              status: "CONFIRMED",
                            })
                          }
                        >
                          Confirm
                        </Button>

                        <Button
                          type="button"
                          variant="danger"
                          loading={isUpdating}
                          onClick={() =>
                            statusMutation.mutate({
                              appointmentId:
                                appointment.id,
                              status: "CANCELLED",
                            })
                          }
                        >
                          Cancel
                        </Button>
                      </div>
                    )}

                    {appointment.status ===
                      "CONFIRMED" && (
                      <Button
                        type="button"
                        variant="secondary"
                        loading={isUpdating}
                        onClick={() =>
                          statusMutation.mutate({
                            appointmentId:
                              appointment.id,
                            status: "COMPLETED",
                          })
                        }
                      >
                        Mark Completed
                      </Button>
                    )}

                    {appointment.status ===
                      "COMPLETED" && (
                      <div className="rounded-xl bg-green-50 px-4 py-3">
                        <p className="text-sm font-semibold text-green-700">
                          Appointment completed
                        </p>

                        <p className="mt-0.5 text-xs text-green-600">
                          This appointment has been successfully
                          completed.
                        </p>
                      </div>
                    )}

                    {appointment.status ===
                      "CANCELLED" && (
                      <div className="rounded-xl bg-red-50 px-4 py-3">
                        <p className="text-sm font-semibold text-red-700">
                          Appointment cancelled
                        </p>

                        <p className="mt-0.5 text-xs text-red-600">
                          This appointment is no longer active.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}