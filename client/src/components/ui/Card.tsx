import type { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hover?: boolean;
}

export default function Card({
  children,
  className = "",
  hover = false,
  ...props
}: CardProps) {
  return (
    <div
      className={`rounded-2xl border border-gray-200 bg-white shadow-sm ${
        hover
          ? "transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
          : ""
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}