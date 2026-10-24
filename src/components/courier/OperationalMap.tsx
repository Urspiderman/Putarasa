
"use client";

import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";

export type OperationalLocation = {
  id: string;
  title: string;
  address: string;
  type: "pickup" | "delivery";
  latitude: number;
  longitude: number;
};

type Props = {
  locations: OperationalLocation[];
  selectedId?: string | null;
};

const pickupIcon = L.divIcon({
  className: "",
  html: `
    <div style="
      width:38px;
      height:38px;
      display:flex;
      align-items:center;
      justify-content:center;
      background:#47763A;
      border:3px solid white;
      border-radius:50%;
      box-shadow:0 3px 12px #0003;
      font-size:19px;
    ">♻️</div>
  `,
  iconSize: [38, 38],
  iconAnchor: [19, 38],
});

const deliveryIcon = L.divIcon({
  className: "",
  html: `
    <div style="
      width:38px;
      height:38px;
      display:flex;
      align-items:center;
      justify-content:center;
      background:#FFDA57;
      border:3px solid white;
      border-radius:50%;
      box-shadow:0 3px 12px #0003;
      font-size:19px;
    ">📦</div>
  `,
  iconSize: [38, 38],
  iconAnchor: [19, 38],
});

function MapController({
  locations,
  selectedId,
}: Props) {
  const map = useMap();

  useEffect(() => {
    const selected = locations.find(
      (item) => item.id === selectedId
    );

    if (selected) {
      map.flyTo(
        [selected.latitude, selected.longitude],
        15,
        { duration: 1 }
      );
      return;
    }

    if (locations.length > 0) {
      const bounds = L.latLngBounds(
        locations.map((item) => [
          item.latitude,
          item.longitude,
        ])
      );

      map.fitBounds(bounds, {
        padding: [45, 45],
        maxZoom: 14,
      });
    }
  }, [locations, selectedId, map]);

  return null;
}

export default function OperationalMap({
  locations,
  selectedId,
}: Props) {
  const [position, setPosition] =
    useState<[number, number] | null>(null);

  const [locationError, setLocationError] =
    useState("");

  function locateMe() {
    if (!navigator.geolocation) {
      setLocationError(
        "Browser tidak mendukung geolokasi."
      );
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (result) => {
        setPosition([
          result.coords.latitude,
          result.coords.longitude,
        ]);
        setLocationError("");
      },
      () => {
        setLocationError(
          "Lokasi tidak tersedia. Periksa izin lokasi browser."
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
      }
    );
  }

  return (
    <div className="relative h-[500px] w-full overflow-hidden rounded-[24px] bg-[#EAEFE4]">
      <MapContainer
        center={[-2.99, 104.76]}
        zoom={12}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapController
          locations={locations}
          selectedId={selectedId}
        />

        {locations.map((item) => (
          <Marker
            key={item.id}
            position={[
              item.latitude,
              item.longitude,
            ]}
            icon={
              item.type === "pickup"
                ? pickupIcon
                : deliveryIcon
            }
          >
            <Popup>
              <div className="space-y-1">
                <strong>{item.title}</strong>
                <p>{item.address}</p>
                <a
                  href={`https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${item.latitude}%2C${item.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Buka OpenStreetMap
                </a>
              </div>
            </Popup>
          </Marker>
        ))}

        {position && (
          <Marker position={position}>
            <Popup>Lokasi saya</Popup>
          </Marker>
        )}
      </MapContainer>

      <button
        type="button"
        onClick={locateMe}
        className="absolute right-4 top-4 z-[1000] rounded-xl bg-white px-4 py-3 text-sm font-bold text-[#47763A] shadow-md"
      >
        📍 Lokasi Saya
      </button>

      {locationError && (
        <div className="absolute bottom-4 left-4 right-4 z-[1000] rounded-xl bg-white p-3 text-xs text-red-600 shadow-md">
          {locationError}
        </div>
      )}
    </div>
  );
}
