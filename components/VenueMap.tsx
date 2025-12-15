"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";

// Fix for default marker icon
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface VenueMapProps {
  latitude: number;
  longitude: number;
  venueName: string;
  address: string;
}

export default function VenueMap({ latitude, longitude, venueName, address }: VenueMapProps) {
  useEffect(() => {
    // Fix Leaflet default icon path issue
    delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });
  }, []);

  return (
    <div className="w-full h-[400px] md:h-[500px] rounded-xl overflow-hidden shadow-lg border-2 border-gray-200">
      <MapContainer center={[latitude, longitude]} zoom={15} scrollWheelZoom={true} style={{ height: "100%", width: "100%" }} className="z-0">
        <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={[latitude, longitude]} icon={icon}>
          <Popup>
            <div className="text-center p-2">
              <h3 className="font-bold text-[#0d47a1] mb-1">{venueName}</h3>
              <p className="text-sm text-gray-600">{address}</p>
              <a href={`https://www.google.com/maps?q=${latitude},${longitude}`} target="_blank" rel="noopener noreferrer" className="text-xs text-[#0d47a1] hover:underline mt-2 inline-block">
                Buka di Google Maps →
              </a>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
