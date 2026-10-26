import { useCallback, useEffect, useState } from "react";
import type { GeoPoint } from "@webuild/shared";
import { appConfig } from "@/config";

type LocationStatus = "locating" | "granted" | "fallback";

interface LocationState {
  point: GeoPoint;
  status: LocationStatus;
  error: string | null;
}

const fallbackPoint: GeoPoint = { ...appConfig.defaultCenter };

export function useGeolocation() {
  const [state, setState] = useState<LocationState>({
    point: fallbackPoint,
    status: "locating",
    error: null
  });
  const [attempt, setAttempt] = useState(0);

  const retry = useCallback(() => {
    setAttempt((value) => value + 1);
  }, []);

  useEffect(() => {
    let active = true;

    if (!("geolocation" in navigator)) {
      setState({
        point: fallbackPoint,
        status: "fallback",
        error: "Geolocation is not supported by this browser."
      });
      return;
    }

    setState((current) => ({ ...current, status: "locating", error: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (!active) return;
        setState({
          point: {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          },
          status: "granted",
          error: null
        });
      },
      (error) => {
        if (!active) return;
        const message =
          error.code === error.PERMISSION_DENIED
            ? "Location permission denied. Showing Bangalore city centre."
            : "Could not get your location. Showing Bangalore city centre.";
        setState({
          point: fallbackPoint,
          status: "fallback",
          error: message
        });
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 5 * 60 * 1000 }
    );

    return () => {
      active = false;
    };
  }, [attempt]);

  return { ...state, retry };
}
