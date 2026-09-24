import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "../store/authStore";
import api from "../lib/api";

import Card from "../components/ui/Card";
import Avatar from "../components/ui/Avatar";
import StatusBadge from "../components/ui/StatusBadge";

import {
  CalendarDays,
  HeartPulse,
  PawPrint,
  Stethoscope,
  ArrowRight,
  ShieldCheck,
  Star,
  Clock3,
  ChevronRight,
} from "lucide-react";

import type { ReactNode } from "react";

interface DashboardCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  iconClass: string;
  to: string;
}

interface VetDashboardStats {
  appointmentCount: number;
  availableSlotCount: number;
  averageRating: number | null;
  reviewCount: number;
}

interface VetStatCardProps {
  value: string | number;
  label: string;
  action: string;
  icon: ReactNode;
  iconClass: string;
  to: string;
}

interface ProfileData {
  name: string;
  photoUrl: string | null;
}

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
    photoUrl: string | null;
    user: {
      name: string;
    };
  };
}

interface Animal {
  id: number;
  name: string;
  species: string;
  breed: string | null;
  photoUrl: string | null;
}

function DashboardCard({
  title,
  description,
  icon,
  iconClass,
  to,
}: DashboardCardProps) {
  return (
    <Link to={to} className="group block">
      <Card
        hover
        className="min-h-[190px] h-full p-6 transition-all duration-200 group-hover:border-[#B8DDE3]"
      >
        <div className="flex items-center justify-between">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-xl ${iconClass}`}
          >
            {icon}
          </div>

          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-50 text-gray-400 transition group-hover:bg-[#E8F5F7] group-hover:text-[#0D5E72]">
            <ArrowRight
              size={18}
              className="transition-transform duration-200 group-hover:translate-x-0.5"
            />
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-bold text-[#1F2937]">
            {title}
          </h3>

          <p className="mt-2 max-w-sm text-sm leading-6 text-gray-500">
            {description}
          </p>
        </div>
      </Card>
    </Link>
  );
}

function VetStatCard({
  value,
  label,
  action,
  icon,
  iconClass,
  to,
}: VetStatCardProps) {
  return (
    <Link to={to} className="group block">
      <Card
        hover
        className="min-h-[190px] h-full p-6 transition-all duration-200 group-hover:border-[#B8DDE3]"
      >
        <div className="flex items-start justify-between">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-xl ${iconClass}`}
          >
            {icon}
          </div>

          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-50 text-gray-400 transition group-hover:bg-[#E8F5F7] group-hover:text-[#0D5E72]">
            <ArrowRight
              size={18}
              className="transition-transform duration-200 group-hover:translate-x-0.5"
            />
          </div>
        </div>

        <div className="mt-6">
          <p className="text-3xl font-bold tracking-tight text-[#1F2937]">
            {value}
          </p>

          <p className="mt-1.5 text-sm font-medium text-gray-500">
            {label}
          </p>

          <div className="mt-5 flex items-center gap-1.5 text-sm font-semibold text-[#0D5E72]">
            <span>{action}</span>

            <ArrowRight
              size={15}
              className="transition-transform duration-200 group-hover:translate-x-0.5"
            />
          </div>
        </div>
      </Card>
    </Link>
  );
}

function DashboardSkeleton() {
  return (
    <div className="min-h-screen animate-pulse bg-[#F8FBF7]">
      <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
        <section className="overflow-hidden rounded-3xl bg-white px-7 py-9 shadow-sm sm:px-10 sm:py-10">
          <div className="h-5 w-36 rounded bg-gray-200" />

          <div className="mt-5 h-9 w-72 rounded-lg bg-gray-200 sm:w-96" />

          <div className="mt-4 h-4 w-full max-w-2xl rounded bg-gray-200" />

          <div className="mt-2 h-4 w-4/5 max-w-xl rounded bg-gray-200" />
        </section>

        <section className="mt-9">
          <div className="mb-5">
            <div className="h-6 w-48 rounded bg-gray-200" />
            <div className="mt-2 h-4 w-72 rounded bg-gray-200" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </section>

        <footer className="mt-12 border-t border-gray-200 py-7">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-gray-200" />

              <div>
                <div className="h-4 w-48 rounded bg-gray-200" />
                <div className="mt-2 h-3 w-56 rounded bg-gray-200" />
              </div>
            </div>

            <div className="h-3 w-20 rounded bg-gray-200" />
          </div>
        </footer>
      </main>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="min-h-[190px] rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="h-12 w-12 rounded-xl bg-gray-200" />
        <div className="h-9 w-9 rounded-full bg-gray-200" />
      </div>

      <div className="mt-6 h-5 w-40 rounded bg-gray-200" />

      <div className="mt-3 h-4 w-full rounded bg-gray-200" />

      <div className="mt-2 h-4 w-4/5 rounded bg-gray-200" />
    </div>
  );
}

function VetStatsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <SkeletonStatCard />
      <SkeletonStatCard />
      <SkeletonStatCard />
    </div>
  );
}

function SkeletonStatCard() {
  return (
    <div className="min-h-[190px] animate-pulse rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="h-12 w-12 rounded-xl bg-gray-200" />

      <div className="mt-6 h-7 w-16 rounded bg-gray-200" />

      <div className="mt-2 h-4 w-28 rounded bg-gray-200" />

      <div className="mt-5 h-4 w-36 rounded bg-gray-200" />
    </div>
  );
}

function UpcomingAppointmentSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="h-14 w-14 rounded-full bg-gray-200" />

        <div className="flex-1">
          <div className="h-5 w-40 rounded bg-gray-200" />
          <div className="mt-2 h-4 w-28 rounded bg-gray-200" />
        </div>

        <div className="h-7 w-24 rounded-full bg-gray-200" />
      </div>

      <div className="mt-5 h-12 rounded-xl bg-gray-200" />
    </div>
  );
}

function AnimalSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="h-14 w-14 rounded-full bg-gray-200" />

        <div className="flex-1">
          <div className="h-4 w-28 rounded bg-gray-200" />

          <div className="mt-2 h-3 w-20 rounded bg-gray-200" />

          <div className="mt-2 h-3 w-24 rounded bg-gray-200" />
        </div>
      </div>

      <div className="mt-5 h-4 w-24 rounded bg-gray-200" />
    </div>
  );
}

function UpcomingAppointment({
  appointment,
}: {
  appointment: Appointment;
}) {
  const startDate = new Date(appointment.slot.startTime);
  const endDate = new Date(appointment.slot.endTime);

  const dateText = startDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const startTime = startDate.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  });

  const endTime = endDate.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <Card className="p-5">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Avatar
            src={appointment.vet.photoUrl}
            name={appointment.vet.user.name}
            size="lg"
          />

          <div>
            <h3 className="text-base font-bold text-[#1F2937]">
              Dr. {appointment.vet.user.name}
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Upcoming veterinary appointment
            </p>
          </div>
        </div>

        <StatusBadge status={appointment.status} />
      </div>

      <div className="mt-5 grid gap-3 rounded-xl bg-[#F8FBF7] p-4 sm:grid-cols-2">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#E8F5F7] text-[#0D5E72]">
            <CalendarDays size={18} />
          </div>

          <div>
            <p className="text-xs font-medium text-gray-400">
              Date
            </p>

            <p className="text-sm font-semibold text-[#1F2937]">
              {dateText}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#E8F5F7] text-[#0D5E72]">
            <Clock3 size={18} />
          </div>

          <div>
            <p className="text-xs font-medium text-gray-400">
              Time
            </p>

            <p className="text-sm font-semibold text-[#1F2937]">
              {startTime} – {endTime}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <Link
          to="/appointments"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0D5E72] transition hover:text-[#094A5A]"
        >
          View Appointment
          <ChevronRight size={16} />
        </Link>
      </div>
    </Card>
  );
}

function MyAnimalsSection({
  animals,
  isLoading,
}: {
  animals: Animal[] | undefined;
  isLoading: boolean;
}) {
  return (
    <div className="mt-9">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[#1F2937]">
            My Animals
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Keep track of your animals and their health records.
          </p>
        </div>

        <Link
          to="/animals"
          className="hidden items-center gap-1 text-sm font-semibold text-[#0D5E72] hover:text-[#094A5A] sm:flex"
        >
          View all
          <ChevronRight size={16} />
        </Link>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnimalSkeleton />
          <AnimalSkeleton />
          <AnimalSkeleton />
        </div>
      ) : animals && animals.length > 0 ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {animals.slice(0, 3).map((animal) => (
              <Link
                key={animal.id}
                to={`/animals/${animal.id}`}
                className="group block"
              >
                <Card
                  hover
                  className="p-5 transition-all duration-200 group-hover:border-[#B8DDE3]"
                >
                  <div className="flex items-center gap-4">
                    <Avatar
                      src={animal.photoUrl}
                      name={animal.name}
                      size="md"
                    />

                    <div className="min-w-0">
                      <h3 className="truncate text-base font-bold text-[#1F2937]">
                        {animal.name}
                      </h3>

                      <p className="mt-0.5 text-sm font-medium text-[#0D5E72]">
                        {animal.species}
                      </p>

                      {animal.breed && (
                        <p className="mt-0.5 truncate text-xs text-gray-500">
                          {animal.breed}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
                    <span className="text-xs font-medium text-gray-400">
                      Health records
                    </span>

                    <span className="flex items-center gap-1 text-sm font-semibold text-[#0D5E72]">
                      View
                      <ChevronRight
                        size={15}
                        className="transition-transform group-hover:translate-x-0.5"
                      />
                    </span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>

          <Link
            to="/animals"
            className="mt-4 flex items-center justify-center gap-1 text-sm font-semibold text-[#0D5E72] sm:hidden"
          >
            View all animals
            <ChevronRight size={16} />
          </Link>
        </>
      ) : (
        <Card className="border-dashed p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#E8F5F7] text-[#0D5E72]">
            <PawPrint size={22} />
          </div>

          <h3 className="mt-4 text-base font-bold text-[#1F2937]">
            No animals added yet
          </h3>

          <p className="mx-auto mt-1.5 max-w-md text-sm text-gray-500">
            Add your first animal to start keeping its health records
            organized.
          </p>

          <Link
            to="/animals/add"
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#0D5E72] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#094A5A]"
          >
            <PawPrint size={16} />
            Add Animal
          </Link>
        </Card>
      )}
    </div>
  );
}

export default function Dashboard() {
  const user = useAuthStore((state) => state.user);
  const isVet = user?.role === "VET";

  const { data: profile } = useQuery<ProfileData>({
    queryKey: [isVet ? "vet-profile" : "farmer-profile"],
    queryFn: async () => {
      const response = await api.get(
        isVet ? "/vets/profile" : "/users/profile"
      );

      return response.data;
    },
    enabled: !!user,
  });

  const {
    data: vetStats,
    isLoading: isVetStatsLoading,
  } = useQuery<VetDashboardStats>({
    queryKey: ["vet-dashboard"],
    queryFn: async () => {
      const response = await api.get("/vets/dashboard");
      return response.data;
    },
    enabled: !!user && isVet,
  });

  const {
    data: appointments,
    isLoading: isAppointmentsLoading,
  } = useQuery<Appointment[]>({
    queryKey: ["my-appointments"],
    queryFn: async () => {
      const response = await api.get("/appointments/my");
      return response.data;
    },
    enabled: !!user && !isVet,
  });

  const {
    data: animals,
    isLoading: isAnimalsLoading,
  } = useQuery<Animal[]>({
    queryKey: ["my-animals"],
    queryFn: async () => {
      const response = await api.get("/animals/my");
      return response.data;
    },
    enabled: !!user && !isVet,
  });

  if (!user) {
    return <DashboardSkeleton />;
  }

  const displayName = profile?.name || user.name;

  const upcomingAppointment = appointments
    ?.filter((appointment) => {
      const startTime = new Date(
        appointment.slot.startTime
      ).getTime();

      return (
        startTime > Date.now() &&
        appointment.status !== "CANCELLED" &&
        appointment.status !== "COMPLETED"
      );
    })
    .sort(
      (a, b) =>
        new Date(a.slot.startTime).getTime() -
        new Date(b.slot.startTime).getTime()
    )[0];

  return (
    <div className="min-h-screen bg-[#F8FBF7]">
      <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0D5E72] to-[#126E70] px-7 py-9 text-white shadow-sm sm:px-10 sm:py-10">
          <div className="absolute -right-16 -top-20 h-52 w-52 rounded-full bg-white/[0.06]" />

          <div className="absolute -bottom-24 right-24 h-48 w-48 rounded-full bg-white/[0.05]" />

          <div className="relative max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5">
              <ShieldCheck
                size={16}
                className="text-[#A7E3B1]"
              />

              <span className="text-xs font-semibold text-white/90">
                {isVet
                  ? "Veterinarian Portal"
                  : "Farmer Portal"}
              </span>
            </div>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Welcome, {displayName}
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/80 sm:text-base">
              {isVet
                ? "Manage your availability and appointments from one place."
                : "Connect with trusted veterinarians and keep your animals' health organized."}
            </p>
          </div>
        </section>

        <section className="mt-9">
          <div className="mb-5">
            <h2 className="text-xl font-bold tracking-tight text-[#1F2937]">
              {isVet
                ? "Veterinarian Dashboard"
                : "Your Dashboard"}
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {isVet
                ? "Manage your veterinary services and appointments."
                : "Everything you need to manage your animal care."}
            </p>
          </div>

          {isVet && (
            <>
              {isVetStatsLoading ? (
                <VetStatsSkeleton />
              ) : (
                <div className="grid gap-4 sm:grid-cols-3">
                  <VetStatCard
                    value={vetStats?.appointmentCount ?? 0}
                    label="Total Appointments"
                    action="Manage Appointments"
                    icon={<CalendarDays size={22} />}
                    iconClass="bg-[#E8F5F7] text-[#0D5E72]"
                    to="/vet/appointments"
                  />

                  <VetStatCard
                    value={vetStats?.availableSlotCount ?? 0}
                    label="Available Slots"
                    action="Create / Manage Slots"
                    icon={<Clock3 size={22} />}
                    iconClass="bg-[#FFF6DB] text-[#B77900]"
                    to="/vet/slots/create"
                  />

                  <VetStatCard
                    value={
                      vetStats?.averageRating !== null &&
                      vetStats?.averageRating !== undefined
                        ? vetStats.averageRating.toFixed(1)
                        : "—"
                    }
                    label={`${vetStats?.reviewCount ?? 0} ${
                      vetStats?.reviewCount === 1
                        ? "Review"
                        : "Reviews"
                    }`}
                    action="View Reviews"
                    icon={
                      <Star
                        size={22}
                        className="fill-[#F4B400]"
                      />
                    }
                    iconClass="bg-[#FFF6DB] text-[#B77900]"
                    to="/vet/reviews"
                  />
                </div>
              )}
            </>
          )}

          {!isVet && (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <DashboardCard
                  title="Find Veterinarians"
                  description="Browse verified veterinarians and book an appointment."
                  icon={<Stethoscope size={24} />}
                  iconClass="bg-[#E8F5F7] text-[#0D5E72]"
                  to="/vets"
                />

                <DashboardCard
                  title="My Appointments"
                  description="View your upcoming and previous veterinary appointments."
                  icon={<CalendarDays size={24} />}
                  iconClass="bg-[#E8F5F7] text-[#0D5E72]"
                  to="/appointments"
                />

                <DashboardCard
                  title="My Animals"
                  description="Manage your animals and keep their health records organized."
                  icon={<PawPrint size={24} />}
                  iconClass="bg-[#E8F5F7] text-[#0D5E72]"
                  to="/animals"
                />
              </div>

              <div className="mt-9">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold tracking-tight text-[#1F2937]">
                      Upcoming Appointment
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                      Your next scheduled veterinary visit.
                    </p>
                  </div>

                  <Link
                    to="/appointments"
                    className="hidden items-center gap-1 text-sm font-semibold text-[#0D5E72] hover:text-[#094A5A] sm:flex"
                  >
                    View all
                    <ChevronRight size={16} />
                  </Link>
                </div>

                {isAppointmentsLoading ? (
                  <UpcomingAppointmentSkeleton />
                ) : upcomingAppointment ? (
                  <UpcomingAppointment
                    appointment={upcomingAppointment}
                  />
                ) : (
                  <Card className="border-dashed p-8 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#E8F5F7] text-[#0D5E72]">
                      <CalendarDays size={22} />
                    </div>

                    <h3 className="mt-4 text-base font-bold text-[#1F2937]">
                      No upcoming appointments
                    </h3>

                    <p className="mx-auto mt-1.5 max-w-md text-sm text-gray-500">
                      Book a veterinarian when your animal needs
                      care.
                    </p>

                    <Link
                      to="/vets"
                      className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#0D5E72] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#094A5A]"
                    >
                      Find a Veterinarian
                      <ArrowRight size={16} />
                    </Link>
                  </Card>
                )}

                <Link
                  to="/appointments"
                  className="mt-4 flex items-center justify-center gap-1 text-sm font-semibold text-[#0D5E72] sm:hidden"
                >
                  View all appointments
                  <ChevronRight size={16} />
                </Link>
              </div>

              <MyAnimalsSection
                animals={animals}
                isLoading={isAnimalsLoading}
              />
            </>
          )}
        </section>

        <footer className="mt-12 border-t border-gray-200 py-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E8F5F7] text-[#0D5E72]">
                <HeartPulse size={18} />
              </div>

              <div>
                <p className="text-sm font-semibold text-[#1F2937]">
                  Healthy Animals. Stronger Farmers.
                </p>

                <p className="text-xs text-gray-500">
                  Connecting farmers with better veterinary care.
                </p>
              </div>
            </div>

            <p className="text-xs font-medium text-gray-400">
              © 2026 Vet-Setu
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}