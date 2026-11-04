import { useAsync } from "@/hooks/useAsync";
import { useGeolocation } from "@/hooks/useGeolocation";
import { api } from "@/lib/api";
import { PlacesMap } from "@/components/map/PlacesMap";

export function HomePage() {
  const location = useGeolocation();

  const nearby = useAsync(
    () =>
      api.getPlaces({
        lat: location.point.lat,
        lng: location.point.lng,
        limit: 8
      }),
    [location.point.lat, location.point.lng]
  );

  const nearbyPlaces = nearby.data ?? [];

  return (
    <main id="main-content" className="pb-10">
      <section className="pt-4 sm:pt-6">
        <div className="shell">
          <PlacesMap
            places={nearbyPlaces}
            userLocation={location.point}
            locationStatus={location.status}
            onRetryLocation={location.retry}
          />
        </div>
      </section>
    </main>
  );
}
