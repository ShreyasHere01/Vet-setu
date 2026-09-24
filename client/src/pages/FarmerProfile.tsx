import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  UserRound,
} from "lucide-react";

import api from "../lib/api";
import Avatar from "../components/ui/Avatar";
import Card from "../components/ui/Card";

interface FarmerProfile {
  id: number;
  name: string;
  photoUrl: string | null;
  role: string;
  createdAt: string;
}

export default function FarmerProfile() {
  const { userId } = useParams();

  const {
    data: farmer,
    isLoading,
    isError,
  } = useQuery<FarmerProfile>({
    queryKey: ["farmer-public-profile", userId],

    queryFn: async () => {
      const response = await api.get(`/users/${userId}`);

      return response.data;
    },

    enabled: !!userId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FBF7] px-5 py-8 sm:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="h-5 w-32 animate-pulse rounded bg-gray-200" />

          <Card className="mt-6 p-6 sm:p-8">
            <div className="flex flex-col items-center">
              <div className="h-24 w-24 animate-pulse rounded-full bg-gray-200" />

              <div className="mt-4 h-7 w-40 animate-pulse rounded bg-gray-200" />

              <div className="mt-2 h-4 w-24 animate-pulse rounded bg-gray-200" />
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (isError || !farmer) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FBF7] px-5">
        <Card className="w-full max-w-md p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
            <UserRound className="h-7 w-7 text-red-500" />
          </div>

          <h1 className="mt-4 text-xl font-bold text-[#1F2937]">
            Farmer not found
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            This farmer profile could not be loaded.
          </p>

          <Link
            to="/vet/appointments"
            className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#0D5E72] hover:text-[#094A5A]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Appointments
          </Link>
        </Card>
      </div>
    );
  }

  const joinedDate = new Date(
    farmer.createdAt
  ).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-[#F8FBF7] px-5 py-8 sm:px-8">
      <div className="mx-auto max-w-3xl">
        <Link
          to="/vet/appointments"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#0D5E72] transition hover:text-[#094A5A]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Appointments
        </Link>

        <Card className="mt-6 overflow-hidden">
          <div className="h-28 bg-[#0D5E72]" />

          <div className="px-6 pb-8 sm:px-8">
            <div className="-mt-12 flex flex-col items-center text-center">
              <div className="rounded-full border-4 border-white">
                <Avatar
                  src={farmer.photoUrl}
                  name={farmer.name}
                  size="xl"
                />
              </div>

              <h1 className="mt-4 text-2xl font-bold text-[#1F2937]">
                {farmer.name}
              </h1>

              <p className="mt-1 text-sm font-medium text-[#0D5E72]">
                Farmer
              </p>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-gray-200 bg-[#F8FBF7] p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E3F3F5] text-[#0D5E72]">
                    <UserRound className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                      Name
                    </p>

                    <p className="mt-1 font-semibold text-[#1F2937]">
                      {farmer.name}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-[#F8FBF7] p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E3F3F5] text-[#0D5E72]">
                    <CalendarDays className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                      Joined
                    </p>

                    <p className="mt-1 font-semibold text-[#1F2937]">
                      {joinedDate}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-[#B7DDE3] bg-[#F1FAFB] p-4">
              <p className="text-sm font-semibold text-[#0D5E72]">
                Farmer Profile
              </p>

              <p className="mt-1 text-sm leading-6 text-gray-600">
                This is a public profile view. Private farm
                location and account information are not displayed.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}