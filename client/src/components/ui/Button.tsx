import { LoaderCircle } from "lucide-react";
import type {
  ButtonHTMLAttributes,
  ReactNode,
} from "react";

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger";
  loading?: boolean;
  icon?: ReactNode;
  children: ReactNode;
}

const variants = {
  primary:
    "bg-[#0D5E72] text-white hover:bg-[#094A5A]",
  secondary:
    "border border-[#0D5E72] bg-white text-[#0D5E72] hover:bg-[#E8F5F7]",
  danger:
    "bg-red-600 text-white hover:bg-red-700",
};

export default function Button({
  variant = "primary",
  loading = false,
  icon,
  disabled,
  children,
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    >
      {loading ? (
        <LoaderCircle className="h-4 w-4 animate-spin" />
      ) : (
        icon
      )}

      {loading ? "Loading..." : children}
    </button>
  );
}