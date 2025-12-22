"use client";

import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Leaflet default marker fix (Next.js/static bundling)
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function parseCoordString(value?: string | null): { lat: number; lng: number } | null {
  if (!value) return null;
  const parts = value.split(",").map((p) => p.trim());
  if (parts.length !== 2) return null;
  const lat = Number(parts[0]);
  const lng = Number(parts[1]);
  if (!isFinite(lat) || !isFinite(lng)) return null;
  return { lat, lng };
}

function formatCoordString(lat: number, lng: number): string {
  return `${lat.toFixed(6)},${lng.toFixed(6)}`;
}

interface LocationPickerProps {
  value?: string | null; // "lat,lng"
  onChange: (value: string) => void;
  className?: string;
}

export default function LocationPicker({ value, onChange, className }: LocationPickerProps) {
  const initial = parseCoordString(value) ?? { lat: -6.2088, lng: 106.8456 }; // default: Jakarta
  const [position, setPosition] = useState<{ lat: number; lng: number }>(initial);
  const [geoLoading, setGeoLoading] = useState(false);

  useEffect(() => {
    delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });
  }, []);

  useEffect(() => {
    const parsed = parseCoordString(value);
    if (parsed) setPosition(parsed);
  }, [value]);

  const ClickHandler = useMemo(
    () =>
      function ClickHandler() {
        useMapEvents({
          click: (e) => {
            const { lat, lng } = e.latlng;
            setPosition({ lat, lng });
            onChange(formatCoordString(lat, lng));
          },
        });
        return null;
      },
    [onChange]
  );

  const useMyLocation = async () => {
    if (!("geolocation" in navigator)) return;
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setPosition({ lat, lng });
        onChange(formatCoordString(lat, lng));
        setGeoLoading(false);
      },
      () => {
        // ignore error silently
        setGeoLoading(false);
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  };

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-gray-600">Klik peta untuk memilih lokasi. Seret marker untuk koreksi.</p>
        <button
          type="button"
          onClick={useMyLocation}
          disabled={geoLoading}
          aria-busy={geoLoading}
          className={`px-3 py-1 text-sm rounded flex items-center gap-2 ${geoLoading ? "bg-gray-200 text-gray-500 cursor-not-allowed" : "bg-gray-100 hover:bg-gray-200"}`}
        >
          {geoLoading && (
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
            </svg>
          )}
          {geoLoading ? "Mengambil lokasi…" : "Gunakan lokasiku"}
        </button>
      </div>
      <div className="w-full h-[320px] md:h-[420px] rounded-lg overflow-hidden border border-gray-200">
        <MapContainer center={[position.lat, position.lng]} zoom={15} scrollWheelZoom style={{ height: "100%", width: "100%" }}>
          <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <ClickHandler />
          <Marker
            position={[position.lat, position.lng]}
            icon={icon}
            draggable
            eventHandlers={{
              dragend: (e) => {
                const m = e.target as L.Marker;
                const { lat, lng } = m.getLatLng();
                setPosition({ lat, lng });
                onChange(formatCoordString(lat, lng));
              },
            }}
          >
            <Popup>
              <div className="text-sm">Koordinat: {formatCoordString(position.lat, position.lng)}</div>
            </Popup>
          </Marker>
        </MapContainer>
      </div>
    </div>
  );
}
