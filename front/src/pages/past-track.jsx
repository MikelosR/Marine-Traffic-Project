import React, { useState, useMemo, useEffect } from "react";
import { Header, Footer } from "../components";
import TimeRangeSlider from "../components/TimeRangeSlider";
import { addMinutes, formatISO } from "date-fns";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Tooltip,
  ZoomControl,
  Polyline,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { getShipIcon } from "../utils";
import "leaflet-rotatedmarker";
import { axiosGetPublic } from "../api";
import L from "leaflet";
import "leaflet-rotatedmarker";
import { useParams } from "react-router-dom";

function generate12HourTimestamps(startDate) {
  const timestamps = [];
  const interval = 15; // ανα ποσα λεπτα μπορει να δειχνει
  const totalMinutes = 12 * 60;

  for (let mins = 0; mins <= totalMinutes; mins += interval) {
    const time = addMinutes(startDate, mins);
    timestamps.push(formatISO(time));
  }

  return timestamps;
}

export default function PastTrack() {
  const { mmsi } = useParams();
  const [trackPoints, setTrackPoints] = useState([]);
  const [selectedRange, setSelectedRange] = useState([0, 0]);
  const maptilerKey = "iJoGfZDgf3vwxym9FjKH";
  const [center, setCenter] = useState([37.9838, 23.7275]);

  useEffect(() => {
    const fetchTrack = async () => {
      try {
        const response = await axiosGetPublic(`vessels/${mmsi}/track`);
        if (!response.success) throw new Error(response.data.error);

        const track = response.data.trackPoints.map((point) => ({
          ...point,
          timestamp: Number(point.timestamp) * 1000, // convert to ms
          heading: 0, // placeholder (you can calculate or fetch real heading if needed)
        }));

        setTrackPoints(track);
        setSelectedRange([0, track.length - 1]);

        if (track.length > 0) {
          const mid = Math.floor(track.length / 2);
          setCenter([track[mid].latitude, track[mid].longitude]);
        }
      } catch (err) {
        console.error(err.message);
      }
    };

    if (mmsi) fetchTrack();
  }, [mmsi]);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="var(--dark-blue)"><path d="M18.2 13.3L12 7L5.8 13.3C5.6 13.5 5.5 13.8 5.5 14C5.5 14.2 5.6 14.5 5.8 14.7C6 14.9 6.2 15 6.5 15H17.5C17.8 15 18 14.9 18.2 14.7C18.4 14.5 18.5 14.2 18.5 14C18.5 13.8 18.4 13.5 18.2 13.3Z" fill="#0D1B2A" fill-opacity="1"/></svg>`;
  const encoded = encodeURIComponent(svg);
  const iconUrl = `data:image/svg+xml;charset=UTF-8,${encoded}`;

  const arrowIcon = new L.Icon({
    iconUrl: iconUrl,
    iconSize: [30, 30],
    iconAnchor: [15, 15], // το κέντρο του εικονιδίου
  });

  /* ───────── JSX ───────── */
  return (
      <div className="page-wrapper">
        <Header />

        <div style={{ height: "calc(100vh - 111px)", width: "100%" }}>
          <MapContainer
              center={center}
              zoom={6}
              minZoom={3}
              maxZoom={18}
              zoomControl={false}
              scrollWheelZoom
              style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
                url={`https://api.maptiler.com/maps/ocean/{z}/{x}/{y}.png?key=${maptilerKey}`}
                attribution='&copy; <a href="https://www.maptiler.com/copyright/" target="_blank">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <ZoomControl position="bottomleft" />

            {trackPoints.length > 0 && (
                <>
                  {/* Dotted full path */}
                  <Polyline
                      positions={trackPoints.map((p) => [p.latitude, p.longitude])}
                      color="#4b5563"
                      weight={3}
                      dashArray="8, 5"
                  />

                  {/* Selected path */}
                  <Polyline
                      positions={trackPoints
                          .slice(selectedRange[0], selectedRange[1] + 1)
                          .map((p) => [p.latitude, p.longitude])}
                      color="var(--dark-blue)"
                      weight={3.5}
                  />

                  {/* Ship marker at last selected point */}
                  <Marker
                      key="ship-marker"
                      position={[
                        trackPoints[selectedRange[1]].latitude,
                        trackPoints[selectedRange[1]].longitude,
                      ]}
                      icon={getShipIcon("cargo")}
                      rotationOrigin="center"
                      zIndexOffset={1000}
                  >
                    {trackPoints.length > 0 &&
                        selectedRange[1] >= 0 &&
                        selectedRange[1] < trackPoints.length && (
                            <>
                              <Popup>
                                <div
                                    style={{
                                      backgroundColor: "var(--dark-blue)",
                                      color: "white",
                                      padding: "10px",
                                      borderRadius: "8px",
                                      fontSize: "12px",
                                    }}
                                >
                                  {new Date(
                                      trackPoints[selectedRange[1]].timestamp
                                  ).toLocaleString("el-GR")}
                                </div>
                              </Popup>

                              <Tooltip
                                  direction="top"
                                  offset={[0, -20]}
                                  opacity={1}
                                  sticky
                              >
                                <div
                                    style={{
                                      backgroundColor: "var(--dark-blue)",
                                      color: "white",
                                      padding: "10px",
                                      borderRadius: "8px",
                                      fontSize: "12px",
                                    }}
                                >
                                  {new Date(
                                      trackPoints[selectedRange[1]].timestamp
                                  ).toLocaleString("el-GR")}
                                </div>
                              </Tooltip>
                            </>
                        )}
                  </Marker>

                  {/* Final arrow icon */}
                  <Marker
                      position={[
                        trackPoints[trackPoints.length - 1].latitude,
                        trackPoints[trackPoints.length - 1].longitude,
                      ]}
                      icon={arrowIcon}
                      rotationAngle={trackPoints[trackPoints.length - 1].heading}
                      rotationOrigin="center"
                      zIndexOffset={0}
                  />
                </>
            )}
          </MapContainer>

          <TimeRangeSlider
              timestamps={trackPoints.map((p) =>
                  new Date(p.timestamp).toISOString()
              )}
              selectedRange={selectedRange}
              onChange={setSelectedRange}
          />
        </div>

        <Footer />
      </div>
  );
}
