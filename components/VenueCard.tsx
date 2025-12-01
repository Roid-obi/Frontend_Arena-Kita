"use client";
import React, { useState, useEffect } from "react";

interface VenueCardProps {
  venue: {
    id: number;
    name: string;
    location: string;
    hours: string;
    images: string[];
  };
}

const MapPinIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
    <circle cx="12" cy="10" r="3"></circle>
  </svg>
);

const ClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <polyline points="12 6 12 12 16 14"></polyline>
  </svg>
);

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
    <div className="rounded-lg overflow-hidden shadow-lg cursor-pointer transition bg-white" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
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
        <h3 className="font-bold text-base md:text-lg mb-2">{venue.name}</h3>
        <div className="flex items-center text-gray-600 mb-2">
          <div className="mr-1">
            <MapPinIcon />
          </div>
          <span className="text-xs md:text-sm">{venue.location}</span>
        </div>
        <div className="flex items-center text-gray-600">
          <div className="mr-1">
            <ClockIcon />
          </div>
          <span className="text-xs md:text-sm">{venue.hours}</span>
        </div>
      </div>
    </div>
  );
};

export default VenueCard;
