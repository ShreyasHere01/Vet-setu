import { UserRound } from "lucide-react";

interface AvatarProps {
  src?: string | null;
  name?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizeClasses = {
  sm: "h-8 w-8 text-xs",
  md: "h-11 w-11 text-sm",
  lg: "h-16 w-16 text-xl",
  xl: "h-24 w-24 text-2xl",
};

export default function Avatar({
  src,
  name = "",
  size = "md",
}: AvatarProps) {
  const firstLetter = name.trim().charAt(0).toUpperCase();

  return (
    <div
      className={`shrink-0 overflow-hidden rounded-full bg-[#E3F3F5] text-[#0D5E72] ${sizeClasses[size]}`}
    >
      {src ? (
        <img
          src={src}
          alt={name || "Profile"}
          className="h-full w-full object-cover"
        />
      ) : firstLetter ? (
        <div className="flex h-full w-full items-center justify-center font-bold">
          {firstLetter}
        </div>
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <UserRound className="h-1/2 w-1/2" />
        </div>
      )}
    </div>
  );
}