import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../lib/api";

interface Appointment {
  id: number;
  status: string;
  notes: string | null;
  slot: {
    startTime: string;
    endTime: string;
  };
  farmer: {
    name: string;
    email: string;
  };
}

export default function VetAppointments() {
  const queryClient = useQueryClient();

  const {
    data: appointments,
    isLoading,
    isError,
  } = useQuery<Appointment[]>({
    queryKey: ["vet-appointments"],
    queryFn: async () => {
      const response = await api.get("/appointments/vet/my");
      return response.data;
    },
  });

  const statusMutation = useMutation({
    mutationFn: async ({
      appointmentId,
      status,
    }: {
      appointmentId: number;
      status: string;
    }) => {
      const response = await api.patch(
        `/appointments/${appointmentId}/status`,
        { status }
      );

      return response.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["vet-appointments"],
      });
    },
  });

  if (isLoading) {
    return <p className="p-8">Loading appointments...</p>;
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
              {appointment.farmer.name}
            </h2>

            <p className="text-sm text-gray-500">
              {appointment.farmer.email}
            </p>

            <p className="mt-3">
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

            <p className="mt-3">
              Status:{" "}
              <span className="font-medium">
                {appointment.status}
              </span>
            </p>

            <div className="mt-4 flex gap-2">
              {appointment.status === "PENDING" && (
                <>
                  <button
                    onClick={() =>
                      statusMutation.mutate({
                        appointmentId: appointment.id,
                        status: "CONFIRMED",
                      })
                    }
                    disabled={statusMutation.isPending}
                    className="rounded bg-green-600 px-3 py-2 text-white disabled:opacity-50"
                  >
                    Confirm
                  </button>

                  <button
                    onClick={() =>
                      statusMutation.mutate({
                        appointmentId: appointment.id,
                        status: "CANCELLED",
                      })
                    }
                    disabled={statusMutation.isPending}
                    className="rounded bg-red-600 px-3 py-2 text-white disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </>
              )}

              {appointment.status === "CONFIRMED" && (
                <button
                  onClick={() =>
                    statusMutation.mutate({
                      appointmentId: appointment.id,
                      status: "COMPLETED",
                    })
                  }
                  disabled={statusMutation.isPending}
                  className="rounded bg-blue-600 px-3 py-2 text-white disabled:opacity-50"
                >
                  Mark Completed
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}