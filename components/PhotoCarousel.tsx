"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PhotoCarouselProps {
  photos: Array<{
    id: number;
    photo_url: string;
    created_at: string;
  }>;
}

export default function PhotoCarousel({ photos }: PhotoCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!photos || photos.length === 0) {
    return (
      <div className="w-full h-48 sm:h-64 md:h-96 bg-gray-200 rounded-lg flex items-center justify-center">
        <p className="text-gray-500 text-sm md:text-base">Tidak ada foto venue</p>
      </div>
    );
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % photos.length);
  };

  return (
    <div className="relative w-full h-48 sm:h-64 md:h-96 bg-gray-100 rounded-lg overflow-hidden group">
      {/* Main Image */}
      <Image src={photos[currentIndex].photo_url} alt={`Venue photo ${currentIndex + 1}`} fill className="object-cover" priority />

      {/* Previous Button */}
      {photos.length > 1 && (
        <button
          onClick={goToPrevious}
          className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/75 text-white p-1 sm:p-2 rounded-full z-10 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <ChevronLeft size={20} className="sm:w-6 sm:h-6" />
        </button>
      )}

      {/* Next Button */}
      {photos.length > 1 && (
        <button
          onClick={goToNext}
          className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/75 text-white p-1 sm:p-2 rounded-full z-10 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <ChevronRight size={20} className="sm:w-6 sm:h-6" />
        </button>
      )}

      {/* Photo Counter */}
      <div className="absolute bottom-2 sm:bottom-4 right-2 sm:right-4 bg-black/50 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm">
        {currentIndex + 1} / {photos.length}
      </div>

      {/* Thumbnail Navigation */}
      {photos.length > 1 && (
        <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 flex gap-1 sm:gap-2">
          {photos.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all ${index === currentIndex ? "bg-white w-4 sm:w-6" : "bg-white/50"}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
