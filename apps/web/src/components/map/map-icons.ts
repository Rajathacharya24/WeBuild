import L from "leaflet";

export const placeMarkerIcon = L.divIcon({
  className: "",
  html: '<span class="map-pin"></span>',
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -28]
});

export const userMarkerIcon = L.divIcon({
  className: "",
  html: '<span class="map-user"></span>',
  iconSize: [18, 18],
  iconAnchor: [9, 9]
});
