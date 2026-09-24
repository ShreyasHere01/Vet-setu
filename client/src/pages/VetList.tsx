import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Search,
  ShieldCheck,
  Star,
  Stethoscope,
  X,
} from "lucide-react";

import Avatar from "../components/ui/Avatar";
import Card from "../components/ui/Card";
import api from "../lib/api";

interface Vet {
  id: number;
  specialty: string;
  bio: string | null;
  photoUrl: string | null;
  verified: boolean;
  averageRating: number | null;
  reviewCount: number;
  user: {
    name: string;
  };
}

function VetCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="h-1.5 animate-pulse bg-gray-200" />

      <div className="p-5">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 shrink-0 animate-pulse rounded-full bg-gray-200" />

          <div className="min-w-0 flex-1">
            <div className="h-5 w-36 animate-pulse rounded bg-gray-200" />
            <div className="mt-2 h-6 w-28 animate-pulse rounded-full bg-gray-200" />
          </div>
        </div>

        <div className="mt-5 h-4 w-28 animate-pulse rounded bg-gray-200" />

        <div className="mt-4 space-y-2">
          <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-4/5 animate-pulse rounded bg-gray-200" />
        </div>

        <div className="mt-5 h-10 animate-pulse rounded-lg bg-gray-200" />
      </div>
    </Card>
  );
}

function VetListSkeleton() {
  return (
    <div className="min-h-screen bg-[#F8FBF7] px-5 py-8 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="animate-pulse">
          <div className="h-9 w-60 rounded-lg bg-gray-200" />
          <div className="mt-3 h-4 w-96 max-w-full rounded bg-gray-200" />
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <VetCardSkeleton />
          <VetCardSkeleton />
          <VetCardSkeleton />
          <VetCardSkeleton />
          <VetCardSkeleton />
          <VetCardSkeleton />
        </div>
      </div>
    </div>
  );
}

export default function VetList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] =
    useState("All Specialties");

  const {
    data: vets,
    isLoading,
    isError,
  } = useQuery<Vet[]>({
    queryKey: ["vets"],
    queryFn: async () => {
      const response = await api.get("/vets");
      return response.data;
    },
  });

  const vetList = vets ?? [];

  /*
   * Generate specialties dynamically from the veterinarians
   * returned by the backend.
   *
   * This means if a new veterinarian with a new specialty
   * is added tomorrow, that specialty automatically appears
   * in the filter.
   */
  const specialties = useMemo(() => {
    const uniqueSpecialties = new Set<string>();

    vetList.forEach((vet) => {
      const specialty = vet.specialty?.trim();

      if (specialty) {
        uniqueSpecialties.add(specialty);
      }
    });

    return Array.from(uniqueSpecialties).sort((a, b) =>
      a.localeCompare(b)
    );
  }, [vetList]);

  /*
   * Filter veterinarians by:
   * 1. Search query → name or specialty
   * 2. Selected specialty
   */
  const filteredVets = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    return vetList.filter((vet) => {
      const matchesSearch =
        !normalizedSearch ||
        vet.user.name.toLowerCase().includes(normalizedSearch) ||
        vet.specialty.toLowerCase().includes(normalizedSearch);

      const matchesSpecialty =
        selectedSpecialty === "All Specialties" ||
        vet.specialty === selectedSpecialty;

      return matchesSearch && matchesSpecialty;
    });
  }, [vetList, searchQuery, selectedSpecialty]);

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    selectedSpecialty !== "All Specialties";

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedSpecialty("All Specialties");
  };

  if (isLoading) {
    return <VetListSkeleton />;
  }

  if (isError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FBF7] px-5 py-8">
        <Card className="w-full max-w-md p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500">
            <Stethoscope size={24} />
          </div>

          <h2 className="mt-5 text-xl font-bold text-[#1F2937]">
            Unable to load veterinarians
          </h2>

          <p className="mt-2 text-sm leading-6 text-gray-500">
            Something went wrong while loading the veterinarian list.
            Please try again later.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FBF7] px-5 py-8 sm:px-8">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="rounded-3xl bg-[#0D5E72] px-6 py-8 sm:px-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm font-medium text-white/75">
                <Stethoscope size={17} />
                Veterinary Care
              </div>

              <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Find a Veterinarian
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/75 sm:text-base">
                Connect with trusted veterinary professionals and get the
                right care for your animals.
              </p>
            </div>

            {vetList.length > 0 && (
              <div className="w-fit rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#0D5E72]">
                {vetList.length}{" "}
                {vetList.length === 1
                  ? "Veterinarian"
                  : "Veterinarians"}
              </div>
            )}
          </div>
        </div>

        {vetList.length === 0 ? (
          <Card className="mt-8 border-dashed p-10 text-center sm:p-14">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E3F3F5] text-[#0D5E72]">
              <Stethoscope size={26} />
            </div>

            <h2 className="mt-4 text-xl font-bold text-[#1F2937]">
              No veterinarians available
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
              There are currently no veterinarians available. Please check
              again later.
            </p>
          </Card>
        ) : (
          <>
            {/* Search & Filter */}
            <div className="mt-8">
              <div className="flex flex-col gap-3 lg:flex-row">
                {/* Search */}
                <div className="relative flex-1">
                  <Search
                    size={18}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(event) =>
                      setSearchQuery(event.target.value)
                    }
                    placeholder="Search by veterinarian name or specialty..."
                    className="h-11 w-full rounded-xl border border-gray-200 bg-white pl-10 pr-10 text-sm text-[#1F2937] outline-none transition placeholder:text-gray-400 focus:border-[#0D5E72] focus:ring-2 focus:ring-[#0D5E72]/10"
                  />

                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                      aria-label="Clear search"
                    >
                      <X size={15} />
                    </button>
                  )}
                </div>

                {/* Dynamic Specialty Filter */}
                <select
                  value={selectedSpecialty}
                  onChange={(event) =>
                    setSelectedSpecialty(event.target.value)
                  }
                  className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm font-medium text-[#1F2937] outline-none transition focus:border-[#0D5E72] focus:ring-2 focus:ring-[#0D5E72]/10 lg:w-64"
                >
                  <option value="All Specialties">
                    All Specialties
                  </option>

                  {specialties.map((specialty) => (
                    <option key={specialty} value={specialty}>
                      {specialty}
                    </option>
                  ))}
                </select>
              </div>

              {/* Result count / clear */}
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm text-gray-500">
                  {filteredVets.length}{" "}
                  {filteredVets.length === 1
                    ? "veterinarian"
                    : "veterinarians"}{" "}
                  found
                </p>

                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="text-sm font-semibold text-[#0D5E72] transition hover:text-[#094A5A]"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            </div>

            {/* Section Heading */}
            <div className="mt-8">
              <h2 className="text-xl font-bold text-[#1F2937]">
                Available Veterinarians
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Choose a veterinarian based on their area of expertise.
              </p>
            </div>

            {/* No Search Results */}
            {filteredVets.length === 0 ? (
              <Card className="mt-5 border-dashed p-10 text-center sm:p-14">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E3F3F5] text-[#0D5E72]">
                  <Search size={25} />
                </div>

                <h2 className="mt-4 text-xl font-bold text-[#1F2937]">
                  No veterinarians found
                </h2>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                  We couldn't find any veterinarians matching your
                  search or selected specialty.
                </p>

                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-5 inline-flex items-center justify-center rounded-lg bg-[#0D5E72] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#094A5A]"
                >
                  Clear Filters
                </button>
              </Card>
            ) : (
              /* Vet Cards */
              <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {filteredVets.map((vet) => (
                  <Link
                    key={vet.id}
                    to={`/vets/${vet.id}`}
                    className="group block"
                  >
                    <Card
                      hover
                      className="h-full overflow-hidden"
                    >
                      <div className="h-1.5 bg-[#0D5E72]" />

                      <div className="flex h-full flex-col p-5">
                        <div className="flex items-center gap-4">
                          <Avatar
                            src={vet.photoUrl}
                            name={vet.user.name}
                            size="lg"
                          />

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <h2 className="truncate text-lg font-bold text-[#1F2937]">
                                Dr. {vet.user.name}
                              </h2>

                              {vet.verified && (
                                <span title="Verified veterinarian">
                                  <ShieldCheck
                                    size={18}
                                    className="shrink-0 text-[#2E7D32]"
                                  />
                                </span>
                              )}
                            </div>

                            <div className="mt-1.5 flex max-w-fit items-center gap-1.5 rounded-full bg-[#E3F3F5] px-2.5 py-1">
                              <Stethoscope
                                size={12}
                                className="shrink-0 text-[#0D5E72]"
                              />

                              <span className="truncate text-xs font-semibold text-[#0D5E72]">
                                {vet.specialty}
                              </span>
                            </div>
                          </div>
                        </div>

                        {vet.reviewCount > 0 &&
                          vet.averageRating !== null && (
                            <div className="mt-4 flex items-center gap-2">
                              <div className="flex items-center gap-1">
                                <Star
                                  size={15}
                                  className="fill-[#F4B400] text-[#F4B400]"
                                />

                                <span className="text-sm font-bold text-[#1F2937]">
                                  {vet.averageRating.toFixed(1)}
                                </span>
                              </div>

                              <span className="text-sm text-gray-300">
                                •
                              </span>

                              <span className="text-sm text-gray-500">
                                {vet.reviewCount}{" "}
                                {vet.reviewCount === 1
                                  ? "review"
                                  : "reviews"}
                              </span>
                            </div>
                          )}

                        <div className="mt-4 flex-1">
                          {vet.bio ? (
                            <p className="line-clamp-2 text-sm leading-6 text-gray-500">
                              {vet.bio}
                            </p>
                          ) : (
                            <p className="text-sm italic leading-6 text-gray-400">
                              No biography available.
                            </p>
                          )}
                        </div>

                        <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">
                          <span className="text-sm font-semibold text-[#0D5E72]">
                            View Profile
                          </span>

                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E3F3F5] text-[#0D5E72] transition-transform duration-200 group-hover:translate-x-1">
                            <ArrowRight size={16} />
                          </span>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}