import React from "react";

type LoadingIndicatorProps = {
  label?: string;
  center?: boolean;
  fullHeight?: boolean;
  size?: "sm" | "md" | "lg";
};

const sizeClass: Record<NonNullable<LoadingIndicatorProps["size"]>, string> = {
  sm: "h-5 w-5 border-2",
  md: "h-7 w-7 border-2",
  lg: "h-10 w-10 border-4",
};

export default function LoadingIndicator({ label = "Memuat...", center = true, fullHeight = false, size = "lg" }: LoadingIndicatorProps) {
  return (
    <div className={`flex items-center gap-3 text-gray-600 ${center ? "justify-center" : ""} ${fullHeight ? "min-h-[200px]" : ""}`} role="status" aria-live="polite">
      <span className={`rounded-full border-gray-200 border-t-[#0d47a1] animate-spin ${sizeClass[size]}`} />
      {label && <span className="text-sm font-semibold">{label}</span>}
    </div>
  );
}
