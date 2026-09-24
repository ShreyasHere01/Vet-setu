export const openLocationInMaps = (
  latitude?: number | null,
  longitude?: number | null,
  address?: string | null
) => {
  if (
    latitude !== null &&
    latitude !== undefined &&
    longitude !== null &&
    longitude !== undefined
  ) {
    const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

    window.open(url, "_blank", "noopener,noreferrer");
    return;
  }

  if (address?.trim()) {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      address
    )}`;

    window.open(url, "_blank", "noopener,noreferrer");
  }
};