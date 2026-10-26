import { useEffect } from "react";
import { Link } from "react-router-dom";
import { CircleMarker, MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import { LocateFixed, MapPin } from "lucide-react";
import type { GeoPoint, PlaceSummary } from "@webuild/shared";
import { appConfig } from "@/config";
import { formatDistance } from "@/lib/format";
import { SafeImage } from "@/components/ui/SafeImage";
import { Stars } from "@/components/ui/Stars";
import { placeMarkerIcon, userMarkerIcon } from "./map-icons";

interface PlacesMapProps {
  places: PlaceSummary[];
  userLocation: GeoPoint;
  locationStatus: "locating" | "granted" | "fallback";
  onRetryLocation: () => void;
}

function MapController({
  places,
  userLocation
}: {
  places: PlaceSummary[];
  userLocation: GeoPoint;
}) {
  const map = useMap();

  useEffect(() => {
    if (places.length === 0) {
      map.setView([userLocation.lat, userLocation.lng], 12);
      return;
    }

    const bounds = L.latLngBounds([
      [userLocation.lat, userLocation.lng],
      ...places.map((place) => [place.latitude, place.longitude] as [number, number])
    ]);
    map.fitBounds(bounds, { padding: [36, 36], maxZoom: 14 });
  }, [map, places, userLocation.lat, userLocation.lng]);

  return null;
}

export function PlacesMap({
  places,
  userLocation,
  locationStatus,
  onRetryLocation
}: PlacesMapProps) {
  const statusText =
    locationStatus === "granted"
      ? "Using your location"
      : locationStatus === "locating"
        ? "Finding your location…"
        : `${appConfig.city} city centre`;

  return (
    <div
      className="relative overflow-hidden rounded-3xl border border-primary/15 shadow-soft"
      role="region"
      aria-label={`Map of nearby places in ${appConfig.city}`}
    >
      <MapContainer
        center={[userLocation.lat, userLocation.lng]}
        zoom={12}
        scrollWheelZoom={false}
        zoomControl={false}
        className="h-[46vh] min-h-[320px] max-h-[520px] w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapController places={places} userLocation={userLocation} />
        <CircleMarker
          center={[userLocation.lat, userLocation.lng]}
          radius={18}
          pathOptions={{
            color: "#16A34A",
            fillColor: "#16A34A",
            fillOpacity: 0.15,
            weight: 1
          }}
        />
        <Marker
          position={[userLocation.lat, userLocation.lng]}
          icon={userMarkerIcon}
          title="Your location"
          zIndexOffset={500}
        />
        {places.map((place) => (
          <Marker
            key={place.id}
            position={[place.latitude, place.longitude]}
            icon={placeMarkerIcon}
            title={place.name}
          >
            <Popup>
              <div className="overflow-hidden">
                <SafeImage
                  src={place.imageUrl}
                  alt={place.name}
                  className="h-24 w-full"
                />
                <div className="space-y-1.5 p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary-dark">
                    {place.category} · {place.area}
                  </p>
                  <h3 className="text-sm font-bold leading-snug text-ink">{place.name}</h3>
                  <div className="flex items-center justify-between gap-2">
                    <Stars value={place.rating} count={place.ratingCount} showValue />
                    <span className="text-[11px] text-muted">
                      {formatDistance(place.distanceKm)}
                    </span>
                  </div>
                  <Link
                    to={`/places/${place.slug}`}
                    className="mt-1 inline-flex w-full items-center justify-center rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-dark"
                  >
                    View details
                  </Link>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-3 p-3 sm:p-4">
        <div className="pointer-events-auto flex items-center gap-2.5 rounded-2xl border border-white/70 bg-white/95 px-3 py-2 shadow-card backdrop-blur">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-primary-tint text-primary-dark">
            <MapPin className="h-4 w-4" aria-hidden="true" />
          </span>
          <div className="leading-tight">
            <p className="text-xs font-bold text-ink">
              {places.length > 0 ? `${places.length} places near you` : "Explore Bangalore"}
            </p>
            <p className="text-[11px] text-muted" role="status">
              {statusText}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onRetryLocation}
          className="pointer-events-auto inline-flex items-center gap-1.5 rounded-full border border-white/70 bg-white/95 px-3 py-2 text-xs font-semibold text-primary-dark shadow-card backdrop-blur transition-colors hover:bg-primary-tint"
        >
          <LocateFixed
            className={`h-4 w-4 ${locationStatus === "locating" ? "animate-pulse" : ""}`}
            aria-hidden="true"
          />
          Locate me
        </button>
      </div>
    </div>
  );
}
