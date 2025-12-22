import React from "react";
import Skeleton from "./Skeleton";

export default function VenueCardSkeleton() {
  return (
    <div className="rounded-xl overflow-hidden shadow-lg bg-white">
      <Skeleton className="h-40 md:h-48 w-full" rounded="none" />
      <div className="p-4 md:p-5 space-y-3">
        <Skeleton className="h-5 w-3/4" rounded="md" />
        <Skeleton className="h-4 w-1/2" rounded="md" />
        <Skeleton className="h-4 w-2/3" rounded="md" />
      </div>
    </div>
  );
}
