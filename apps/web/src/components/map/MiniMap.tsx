import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import type { PlaceDetail } from "@webuild/shared";
import { placeMarkerIcon } from "./map-icons";

export function MiniMap({ place }: { place: PlaceDetail }) {
  return (
    <div
      className="overflow-hidden rounded-3xl border border-line"
      role="region"
      aria-label={`Map showing ${place.name}`}
    >
      <MapContainer
        center={[place.latitude, place.longitude]}
        zoom={15}
        scrollWheelZoom={false}
        className="h-64 w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker
          position={[place.latitude, place.longitude]}
          icon={placeMarkerIcon}
          title={place.name}
        >
          <Popup>
            <div className="p-3">
              <p className="text-sm font-bold text-ink">{place.name}</p>
              <p className="mt-0.5 text-xs text-muted">{place.address}</p>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
