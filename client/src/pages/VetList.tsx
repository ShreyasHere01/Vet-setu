import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import api from "../lib/api";

interface Vet {
  id: number;
  specialty: string;
  bio: string | null;
  user: {
    name: string;
  };
}

export default function VetList() {
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

  if (isLoading) {
    return <p className="p-8">Loading vets...</p>;
  }

  if (isError) {
    return <p className="p-8">Failed to load vets.</p>;
  }

  return (
    <div className="p-8">
      <h1 className="mb-6 text-2xl font-bold">
        Available Vets
      </h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {vets?.map((vet) => (
          <Link
            key={vet.id}
            to={`/vets/${vet.id}`}
            className="block rounded-lg border p-4 shadow-sm transition hover:shadow-md"
          >
            <h2 className="text-lg font-semibold">
              {vet.user.name}
            </h2>

            <p className="text-sm text-gray-600">
              {vet.specialty}
            </p>

            {vet.bio && (
              <p className="mt-2 text-sm text-gray-500">
                {vet.bio}
              </p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}