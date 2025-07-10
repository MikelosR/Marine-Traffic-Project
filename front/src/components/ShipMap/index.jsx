import { useState, useEffect, useCallback } from "react";
import { debounce } from "lodash";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Tooltip,
  ZoomControl,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-rotatedmarker";
import Cookies from "js-cookie";
import { Polygon } from "react-leaflet";

import {
  connectWebSocket,
  disconnectWebSocket,
} from "../../utils/webSocketUtil";
import { getGeneralShipCategory, getShipIcon } from "../../utils";
import { ShipPopup, Sidebar, Loading } from "../../components";
import { useAppContext } from "../../appContext";
// import useZoneOfInterest from "../../hooks/useZoneOfInterest";
// import ZoneToolbar from "../../components/ZoneToolbar";
import { axiosGetPublic, axiosGetPrivate } from "../../api";
import { useToastError } from "../../hooks";

const MAP_CENTER = [48.09213, -4.645487];
const MAPTILER_KEY = "iJoGfZDgf3vwxym9FjKH";

// Extracted helper to build bounds query string
const buildBoundsQuery = (bounds) => {
  const nw = bounds.getNorthWest();
  const se = bounds.getSouthEast();

  const minLat = se.lat;
  const maxLat = nw.lat;
  const minLon = nw.lng;
  const maxLon = se.lng;

  return { start: `${minLon},${minLat}`, end: `${maxLon},${maxLat}` };
};

export default function ShipMap() {
  const showToastError = useToastError();
  const { role } = useAppContext();

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [mapInstance, setMapInstance] = useState(null);

  const [filters, setFilters] = useState({
    myFleet: false,
    shipTypes: [],
    speed: [0, 100],
    statuses: [],
  });

  const [constraints, setConstraints] = useState({
    myFleet: false,
    shipTypes: [],
    speed: [0, 100],
    statuses: [],
  });

  useEffect(() => {
    if (!mapInstance) return;

    const fetchVessels = async () => {
      setLoading(true);

      const bounds = mapInstance.getBounds();
      const { start, end } = buildBoundsQuery(bounds);

      try {
        const fetcher = Cookies.get("token") ? axiosGetPrivate : axiosGetPublic;
        const response = await fetcher(
          `vessels/positions?start=${start}&end=${end}`
        );

        if (!response.success) throw new Error(response.data.error);

        setResults(response.data);
      } catch (error) {
        console.error("Error fetching vessels:", error.message);
        showToastError("Failed to fetch vessels");
      } finally {
        setLoading(false);
      }
    };

    const debouncedFetch = debounce(fetchVessels, 400);

    fetchVessels();

    mapInstance.on("moveend", fetchVessels);

    return () => {
      mapInstance.off("moveend", fetchVessels); // cleanup
      debouncedFetch.cancel();
    };
  }, [mapInstance]);

  // Fly to a vessel's position on map
  const handleTrackVessel = useCallback(
    (lat, lon) => {
      if (!mapInstance || isNaN(lat) || isNaN(lon)) {
        showToastError("Vessel coordinates not found");
        return;
      }
      mapInstance.flyTo([lat, lon], 10);
    },
    [mapInstance, showToastError]
  );

  // Real-time updates via WebSocket
  useEffect(() => {
    connectWebSocket((aisData) => {
      const mmsi = aisData.sourcemmsi;

      setResults((prev) => {
        const index = prev.findIndex((ship) => ship.mmsi === mmsi);

        if (index === -1) {
          return [
            ...prev,
            {
              mmsi,
              latitude: aisData.lat,
              longitude: aisData.lon,
              speed: aisData.speedoverground,
              heading: aisData.courseoverground,
              timestamp: aisData.timestamp,
              type: aisData.type,
            },
          ];
        } else {
          const updatedShip = {
            ...prev[index],
            latitude: aisData.lat,
            longitude: aisData.lon,
            speed: aisData.speedoverground,
            heading: aisData.courseoverground,
            timestamp: aisData.timestamp,
            type: aisData.type,
          };
          const newResults = [...prev];
          newResults[index] = updatedShip;
          return newResults;
        }
      });
    });
  }, []);

  const { savedZone, zoneSelected } = useAppContext();
  /* ─────────────────────────────────────────
       ZONE-OF-INTEREST state & hook
    ─────────────────────────────────────────*/
  // const [zoneMode, setZoneMode] = useState(false); // drawing mode flag
  // const [zoneCoords, setZoneCoords] = useState(null); // final 4-point array

  // const { undo, clear, points } = useZoneOfInterest(
  //   mapInstance,
  //   zoneMode,
  //   (coords) => {
  //     setZoneCoords(coords); // keep polygon on map
  //     setZoneMode(false); // leave draw mode but keep shape
  //   },
  //   () => {
  //     setZoneCoords(null);
  //     setZoneMode(false);
  //   }
  // );

  /* ───────── helper for Sidebar toggle ───────── */
  // const handleZoneToggle = () => {
  //   if (!zoneMode) {
  //     clear(); // only clear when starting
  //     setZoneCoords(null);
  //     setZoneMode(true);
  //   }
  // };

  // Internal component to capture Leaflet map ref
  const MapRefSetter = ({ setRef }) => {
    const map = useMap();
    useEffect(() => {
      setRef(map);
    }, [map, setRef]);
    return null;
  };

  useEffect(() => {
    if (savedZone && mapInstance && zoneSelected) {
      const bounds = [
        [savedZone.bottomLeft.lat, savedZone.bottomLeft.lon],
        [savedZone.topRight.lat, savedZone.topRight.lon],
      ];
      mapInstance.fitBounds(bounds);
    }
  }, [savedZone, mapInstance, zoneSelected]);

  // Render markers
  // Filter vessels based on filters state
  const filteredResults = results.filter((ship) => {
    const typeMatch =
      filters.shipTypes.length === 0 ||
      filters.shipTypes.includes(
        getGeneralShipCategory(ship?.type?.toLowerCase())
      );

    const speed = parseFloat(ship.speed);
    const speedMatch =
      !isNaN(speed) && speed >= filters.speed[0] && speed <= filters.speed[1];

    const statusMatch =
      filters.statuses.length === 0 ||
      filters.statuses.includes(ship.status?.toLowerCase());

    const fleetMatch = !filters.myFleet || ship.isInFleet;

    return typeMatch && speedMatch && statusMatch && fleetMatch;
  });
  const markerList = Object.values(filteredResults);

  return (
    <div style={{ height: "calc(100vh - 111px)", width: "100%" }}>
      <Loading loading={loading} />

      <MapContainer
        center={MAP_CENTER}
        zoom={6}
        minZoom={3}
        maxZoom={18}
        zoomControl={false}
        scrollWheelZoom
        style={{ height: "100%", width: "100%" }}
        aria-label="Ship positions map"
      >
        <MapRefSetter setRef={setMapInstance} />

        <TileLayer
          url={`https://api.maptiler.com/maps/ocean/{z}/{x}/{y}.png?key=${MAPTILER_KEY}`}
          attribution='&copy; <a href="https://www.maptiler.com/copyright/" target="_blank">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* Ship Markers */}
        {markerList.map((ship) => (
          <Marker
            key={ship.mmsi}
            position={[ship.latitude, ship.longitude]}
            icon={getShipIcon(ship?.type?.toLowerCase())}
            rotationAngle={ship.heading}
            rotationOrigin="center"
            keyboard={true}
            title={ship.name || "Ship marker"}
          >
            <Popup>
              <ShipPopup ship={ship} role={role} type="click" />
            </Popup>
            <Tooltip direction="top" offset={[0, -20]} opacity={1} sticky>
              <ShipPopup ship={ship} role={role} type="hover" />
            </Tooltip>
          </Marker>
        ))}

        <ZoomControl position="bottomleft" />

        {savedZone && zoneSelected && (
          <Polygon
            positions={[
              [savedZone.topLeft.lat, savedZone.topLeft.lon],
              [savedZone.topRight.lat, savedZone.topRight.lon],
              [savedZone.bottomRight.lat, savedZone.bottomRight.lon],
              [savedZone.bottomLeft.lat, savedZone.bottomLeft.lon],
            ]}
            pathOptions={{ color: "blue", weight: 2, fillOpacity: 0.2 }}
          />
        )}

        <Sidebar
          onTrackVessel={handleTrackVessel}
          filters={filters}
          setFilters={setFilters}
          constraints={constraints}
          setConstraints={setConstraints}
        />
      </MapContainer>

      {/* ───────── Toolbar stays while drawing ─────────
      {zoneMode && (
        <ZoneToolbar
          canUndo={points.length > 0}
          onUndo={undo}
          onDelete={clear}
        />
      )} */}
    </div>
  );
}
