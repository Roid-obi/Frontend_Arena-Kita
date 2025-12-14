"use client";
import React, { useState, useEffect } from "react";
import { MapPin, Clock } from "lucide-react";
import Link from "next/link";

interface VenueCardProps {
  venue: {
    id: number;
    name: string;
    location: string;
    hours: string;
    images: string[];
    sportTypes?: string[];
  };
}

const VenueCard: React.FC<VenueCardProps> = ({ venue }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Auto-cycle images every 3 seconds (only when not hovered)
  useEffect(() => {
    if (venue.images.length <= 1 || isHovered) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % venue.images.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [venue.images.length, isHovered]);

  return (
    <Link href={`/venue/${venue.id}`}>
      <div
        className="rounded-lg overflow-hidden shadow-lg cursor-pointer transition bg-white hover:shadow-xl hover:scale-105"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Image Carousel */}
        <div className="relative w-full h-40 md:h-48 bg-gray-200 overflow-hidden">
          {venue.images.map((image, idx) => (
            <img
              key={idx}
              src={image}
              alt={`${venue.name} - ${idx + 1}`}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ease-in-out ${idx === currentImageIndex ? "opacity-100" : "opacity-0"}`}
            />
          ))}

          {/* Sport Type Badges */}
          {venue.sportTypes && venue.sportTypes.length > 0 && (
            <div className="absolute top-3 right-3 flex flex-wrap gap-1.5 max-w-[60%] justify-end z-10">
              {venue.sportTypes.slice(0, 3).map((sport, idx) => (
                <span key={idx} className="px-2 py-1 bg-[#0d47a1]/90 backdrop-blur-sm text-white text-xs font-semibold rounded-md shadow-md">
                  {sport}
                </span>
              ))}
              {venue.sportTypes.length > 3 && <span className="px-2 py-1 bg-[#f97316]/90 backdrop-blur-sm text-white text-xs font-semibold rounded-md shadow-md">+{venue.sportTypes.length - 3}</span>}
            </div>
          )}

          {/* Image indicators */}
          {venue.images.length > 1 && (
            <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
              {venue.images.map((_, idx) => (
                <div key={idx} className={`w-2 h-2 rounded-full transition-all ${idx === currentImageIndex ? "bg-white" : "bg-white opacity-50"}`} />
              ))}
            </div>
          )}
        </div>

        {/* Card Info */}
        <div className="p-4 md:p-5">
          <h3 className="font-bold text-base md:text-lg mb-2 truncate" title={venue.name}>
            {venue.name}
          </h3>
          <div className="flex items-center text-gray-600 mb-2">
            <MapPin size={16} className="mr-1" />
            <span className="text-xs md:text-sm">{venue.location}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <Clock size={16} className="mr-1" />
            <span className="text-xs md:text-sm">{venue.hours}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default VenueCard;
