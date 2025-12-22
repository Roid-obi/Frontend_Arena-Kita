import React from "react";

const radiusClass = {
  none: "rounded-none",
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  xl: "rounded-xl",
  full: "rounded-full",
} as const;

export type SkeletonProps = {
  className?: string;
  width?: number | string;
  height?: number | string;
  rounded?: keyof typeof radiusClass;
  animate?: boolean;
};

export default function Skeleton({ className = "", width, height, rounded = "lg", animate = true }: SkeletonProps) {
  return <div aria-hidden="true" className={`bg-gray-200 ${animate ? "animate-pulse" : ""} ${radiusClass[rounded] ?? radiusClass.lg} ${className}`} style={{ width, height }} />;
}
