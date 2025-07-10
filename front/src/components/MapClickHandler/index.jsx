import { useMapEvents } from "react-leaflet";

export function MapClickHandler({ zoneCoords, setZoneCoords, setZonePolygon }) {
  useMapEvents({
    click(e) {
      if (zoneCoords.length >= 4) return;
      const newCoords = [...zoneCoords, [e.latlng.lat, e.latlng.lng]];
      setZoneCoords(newCoords);
      if (newCoords.length === 4) {
        setZonePolygon(newCoords); // signals polygon is done
      }
    }
  });
  return null;
}
