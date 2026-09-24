interface StatusBadgeProps {
  status: string;
}

const statusStyles: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  CONFIRMED: "bg-blue-50 text-blue-700 border-blue-200",
  COMPLETED: "bg-green-50 text-green-700 border-green-200",
  CANCELLED: "bg-red-50 text-red-700 border-red-200",
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const normalizedStatus = status.toUpperCase();

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${
        statusStyles[normalizedStatus] ||
        "bg-gray-50 text-gray-600 border-gray-200"
      }`}
    >
      {normalizedStatus}
    </span>
  );
}