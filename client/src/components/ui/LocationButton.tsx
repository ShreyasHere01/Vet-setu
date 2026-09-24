import { ExternalLink, MapPin } from "lucide-react";

import { openLocationInMaps } from "../../lib/location";

interface LocationButtonProps {
  latitude?: number | null;
  longitude?: number | null;
  address?: string | null;
  label?: string;
}

export default function LocationButton({
  latitude,
  longitude,
  address,
  label = "Open in Maps",
}: LocationButtonProps) {
  const hasLocation =
    (latitude !== null &&
      latitude !== undefined &&
      longitude !== null &&
      longitude !== undefined) ||
    !!address?.trim();

  if (!hasLocation) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={() =>
        openLocationInMaps(latitude, longitude, address)
      }
      className="inline-flex items-center gap-2 text-sm font-semibold text-[#0D5E72] transition hover:text-[#094A5A] hover:underline"
    >
      <MapPin size={16} />
      {label}
      <ExternalLink size={14} />
    </button>
  );
}