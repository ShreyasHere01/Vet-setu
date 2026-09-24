import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  ArrowRight,
  PawPrint,
  Plus,
  Tag,
  VenusAndMars,
  X,
} from "lucide-react";

import api from "../lib/api";
import Card from "../components/ui/Card";

interface Animal {
  id: number;
  name: string;
  species: string;
  breed: string | null;
  gender: string | null;
  birthDate: string | null;
  tagNumber: string | null;
  photoUrl: string | null;
}

function AnimalSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 rounded-full bg-gray-200" />

        <div className="flex-1">
          <div className="h-5 w-32 rounded bg-gray-200" />
          <div className="mt-2 h-4 w-20 rounded bg-gray-200" />
          <div className="mt-2 h-3 w-24 rounded bg-gray-200" />
        </div>
      </div>

      <div className="mt-5 h-10 rounded-lg bg-gray-200" />
    </div>
  );
}

export default function Animals() {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(
    null
  );

  const {
    data: animals,
    isLoading,
    isError,
  } = useQuery<Animal[]>({
    queryKey: ["my-animals"],
    queryFn: async () => {
      const response = await api.get("/animals/my");
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FBF7]">
        <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
          <div className="animate-pulse">
            <div className="h-8 w-40 rounded-lg bg-gray-200" />
            <div className="mt-3 h-4 w-72 rounded bg-gray-200" />
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <AnimalSkeleton />
            <AnimalSkeleton />
            <AnimalSkeleton />
          </div>
        </main>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-[#F8FBF7]">
        <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
          <Card className="p-8 text-center">
            <h2 className="text-lg font-bold text-[#1F2937]">
              Unable to load your animals
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Please try again in a moment.
            </p>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FBF7]">
      <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-[#0D5E72]">
              Animal Records
            </p>

            <h1 className="mt-1 text-3xl font-bold tracking-tight text-[#1F2937]">
              My Animals
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Manage your livestock and keep their health records organized.
            </p>
          </div>

          <Link
            to="/animals/add"
            className="inline-flex min-h-10 items-center justify-center gap-2 self-start rounded-lg bg-[#0D5E72] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#094A5A] sm:self-auto"
          >
            <Plus size={17} />
            Add Animal
          </Link>
        </div>

        {animals?.length === 0 && (
          <Card className="mt-8 border-dashed p-10 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#E8F5F7] text-[#0D5E72]">
              <PawPrint size={24} />
            </div>

            <h2 className="mt-4 text-lg font-bold text-[#1F2937]">
              No animals added yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
              Add your first animal to start keeping its veterinary,
              vaccination, and treatment records in one place.
            </p>

            <Link
              to="/animals/add"
              className="mt-5 inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-[#0D5E72] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#094A5A]"
            >
              <Plus size={17} />
              Add Your First Animal
            </Link>
          </Card>
        )}

        {animals && animals.length > 0 && (
          <>
            <div className="mt-8">
              <p className="text-sm font-semibold text-[#1F2937]">
                {animals.length}{" "}
                {animals.length === 1 ? "Animal" : "Animals"}
              </p>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {animals.map((animal) => (
                <Card
                  key={animal.id}
                  hover
                  className="p-5 transition-all duration-200 hover:border-[#B8DDE3]"
                >
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => {
                        if (animal.photoUrl) {
                          setSelectedPhoto(animal.photoUrl);
                        }
                      }}
                      className={`h-16 w-16 shrink-0 overflow-hidden rounded-full border-2 ${
                        animal.photoUrl
                          ? "cursor-pointer border-[#B8DDE3] hover:opacity-90"
                          : "cursor-default border-gray-100"
                      }`}
                    >
                      {animal.photoUrl ? (
                        <img
                          src={animal.photoUrl}
                          alt={animal.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-[#E8F5F7] text-[#0D5E72]">
                          <PawPrint size={25} />
                        </div>
                      )}
                    </button>

                    <div className="min-w-0">
                      <h2 className="truncate text-lg font-bold text-[#1F2937]">
                        {animal.name}
                      </h2>

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

                  <div className="mt-5 grid grid-cols-2 gap-2">
                    {animal.gender && (
                      <div className="rounded-lg bg-[#F8FBF7] px-3 py-2.5">
                        <div className="flex items-center gap-2 text-gray-400">
                          <VenusAndMars size={14} />
                          <span className="text-[11px] font-medium">
                            Gender
                          </span>
                        </div>

                        <p className="mt-1 text-sm font-semibold text-[#1F2937]">
                          {animal.gender}
                        </p>
                      </div>
                    )}

                    {animal.tagNumber && (
                      <div
                        className={`rounded-lg bg-[#F8FBF7] px-3 py-2.5 ${
                          !animal.gender ? "col-span-2" : ""
                        }`}
                      >
                        <div className="flex items-center gap-2 text-gray-400">
                          <Tag size={14} />
                          <span className="text-[11px] font-medium">
                            Tag
                          </span>
                        </div>

                        <p className="mt-1 truncate text-sm font-semibold text-[#1F2937]">
                          {animal.tagNumber}
                        </p>
                      </div>
                    )}
                  </div>

                  <Link
                    to={`/animals/${animal.id}`}
                    className="mt-4 flex min-h-10 items-center justify-center gap-2 rounded-lg border border-[#0D5E72] bg-white px-4 py-2 text-sm font-semibold text-[#0D5E72] transition hover:bg-[#E8F5F7]"
                  >
                    View Health History
                    <ArrowRight size={16} />
                  </Link>
                </Card>
              ))}
            </div>
          </>
        )}
      </main>

      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="relative max-h-[90vh] max-w-3xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedPhoto(null)}
              className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-black/70 text-white transition hover:bg-black"
              aria-label="Close photo"
            >
              <X size={18} />
            </button>

            <img
              src={selectedPhoto}
              alt="Animal"
              className="max-h-[90vh] max-w-full rounded-xl object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}