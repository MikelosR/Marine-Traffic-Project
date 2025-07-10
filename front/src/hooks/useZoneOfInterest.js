// src/hooks/useZoneOfInterest.js
import { useEffect, useRef, useState } from "react";
import L from "leaflet";

/**
 * Lets the user click exactly 4 points on the map, builds a polygon
 * for visual feedback, supports undo / delete, and returns the points.
 *
 * @param {L.Map|null} map             – Leaflet map instance (or null until ready)
 * @param {boolean}    active          – whether 'zone mode' is ON
 * @param {Function}   onComplete      – called once with [[lat,lng] x4] when done
 * @param {Function}   onDeactivate    – called when zone is cleared
 */
export default function useZoneOfInterest(map, active, onComplete, onDeactivate) {
  const [points, setPoints] = useState([]);           // [{lat,lng}, …]
  const markersRef = useRef([]);                      // L.Marker[]
  const polyRef = useRef(null);                       // L.Polyline / L.Polygon

  /* ───── handle map clicks ───── */
  useEffect(() => {
    if (!map || !active) return;

    const handleClick = (e) => {
      // ignore clicks after 4
      if (points.length >= 4) return;

      const { lat, lng } = e.latlng;

      // 1 ▸ update state
      setPoints((prev) => [...prev, { lat, lng }]);

      // 2 ▸ place tiny marker
      const m = L.circleMarker([lat, lng], {
        radius: 5,
        color: "#6aa0d1",
        fillOpacity: 1,
      }).addTo(map);
      markersRef.current.push(m);
    };

    map.on("click", handleClick);
    return () => map.off("click", handleClick);
  }, [map, active, points.length]);

  /* ───── draw or update polyline ───── */
  useEffect(() => {
    if (!map) return;

    // remove previous line
    if (polyRef.current) {
      map.removeLayer(polyRef.current);
      polyRef.current = null;
    }

    if (points.length >= 2) {
      const latlngs = points.map((p) => [p.lat, p.lng]);
      polyRef.current = L.polyline(latlngs, {
        color: "#e63946",
        weight: 2,
      }).addTo(map);
    }

    // close polygon and callback when finished
    if (points.length === 4) {
      polyRef.current.setLatLngs([...polyRef.current.getLatLngs(), points[0]]);
      const coords = points.map((p) => [p.lat, p.lng]);
      onComplete && onComplete(coords);
    }
  }, [map, points, onComplete]);

  /* ───── helper actions ───── */
  const undo = () => {
    if (!map || points.length === 0) return;

    // remove last marker
    const last = markersRef.current.pop();
    map.removeLayer(last);

    setPoints((prev) => prev.slice(0, -1));
  };

  const clear = () => {
    markersRef.current.forEach((m) => map.removeLayer(m));
    markersRef.current = [];

    if (polyRef.current) {
      map.removeLayer(polyRef.current);
      polyRef.current = null;
    }

    setPoints([]);
    onDeactivate && onDeactivate();
  };

  return { points, undo, clear };
}
