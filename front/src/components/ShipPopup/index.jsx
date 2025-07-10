import React, { useState } from "react";
import styles from "./ShipPopup.module.css";
import { getShipIconComponent, countryNameToCode } from "../../utils";
import Flag from "react-world-flags";
import { Link } from "react-router-dom";
import { useFleetToggle } from "../../hooks";
import LoadingSpinner from "../LoadingSpinner";

export default function ShipPopup({ ship, role, type }) {
  const [isInFleet, setIsInFleet] = useState(ship?.isInFleet || false);
  const [reload, setReload] = useState(false);
  const [loading, setLoading] = useState(false);

  const { handleToggleFleet } = useFleetToggle({
    setReloadCallback: setReload,
    setLoading: setLoading,
  });

  async function onToggleFleet(e) {
    e.preventDefault();
    e.stopPropagation();

    const previousValue = isInFleet;
    setIsInFleet(!previousValue);

    try {
      await handleToggleFleet(e, ship?.mmsi, previousValue);
    } catch (error) {
      setIsInFleet(previousValue);
    }
  }

  if (type === "hover") {
    return (
      <div className={styles.popup + " " + styles.popupHover}>
        <div className={styles.header}>
          <h3>{ship?.name || "Unknown"}</h3>

          <div className={styles.headerIcons}>
            <div className={styles.vesselType}>
              {(() => {
                const generalShipType = ship?.type?.toLowerCase();
                const IconComponent = getShipIconComponent(generalShipType);
                return <IconComponent />;
              })()}
            </div>

            <Flag
              code={countryNameToCode[ship?.country]}
              style={{ width: "auto", height: "20px" }}
            />
          </div>
        </div>

        <div className={styles.infoList}>
          <ul>
            <li style={{ textTransform: "capitalize" }}>
              {ship?.type || "Unknown"}
            </li>
            <li style={{ textTransform: "capitalize" }}>
              Status: {ship?.status || "-"}
            </li>
          </ul>
        </div>
      </div>
    );
  } else {
    return (
      <div className={styles.popup}>
        <div className={styles.header}>
          <h3>{ship?.name || "Unknown"}</h3>

          <div className={styles.headerIcons}>
            <div className={styles.vesselType}>
              {(() => {
                const generalShipType = ship?.type?.toLowerCase();
                const IconComponent = getShipIconComponent(generalShipType);
                return <IconComponent />;
              })()}
            </div>

            <Flag
              code={countryNameToCode[ship?.country]}
              style={{ width: "auto", height: "20px" }}
            />
          </div>
        </div>

        <div className={styles.infoList}>
          <ul>
            <li style={{ textTransform: "capitalize" }}>
              {ship?.type || "Unknown"}
            </li>
            <li style={{ textTransform: "capitalize" }}>
              Status: {ship?.status || "-"}
            </li>
          </ul>
        </div>

        <div className={styles.infoList}>
          <ul>
            <li>POSITION</li>
            <li>Latitude: {ship?.latitude || "-"}</li>
            <li>Longitude: {ship?.longitude || "-"}</li>
            <li>Heading: {ship?.heading || "-"}°</li>
          </ul>
        </div>

        <Link to={`/ships/${ship?.mmsi}`} className={styles.shipDetailsButton}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="13"
            viewBox="0 0 24 24"
          >
            <path
              fill="white"
              d="M11 17h2v-6h-2zm1-8q.425 0 .713-.288T13 8t-.288-.712T12 7t-.712.288T11 8t.288.713T12 9m0 13q-2.075 0-3.9-.788t-3.175-2.137T2.788 15.9T2 12t.788-3.9t2.137-3.175T8.1 2.788T12 2t3.9.788t3.175 2.137T21.213 8.1T22 12t-.788 3.9t-2.137 3.175t-3.175 2.138T12 22"
            />
          </svg>

          <span>SHIP DETAILS</span>
        </Link>

        <div className={styles.popupButtons}>
          <Link
            to={`/past-track/${ship?.mmsi}`}
            className={styles.pastTrackButton}
          >
            Past Track
          </Link>

          {(role === "ADMIN" || role === "USER") && (
            <button
              className={`${styles.addFleetButton} ${
                isInFleet && styles.inFleetButton
              }`}
              onClick={onToggleFleet}
            >
              {loading ? (
                <LoadingSpinner />
              ) : (
                <>
                  {" "}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill="none"
                      stroke="var(--link-color)"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      d="M22 8.862a5.95 5.95 0 0 1-1.654 4.13c-2.441 2.531-4.809 5.17-7.34 7.608c-.581.55-1.502.53-2.057-.045l-7.295-7.562c-2.205-2.286-2.205-5.976 0-8.261a5.58 5.58 0 0 1 8.08 0l.266.274l.265-.274A5.6 5.6 0 0 1 16.305 3c1.52 0 2.973.624 4.04 1.732A5.95 5.95 0 0 1 22 8.862Z"
                    />
                  </svg>
                  {!isInFleet && <span>My Fleet</span>}
                </>
              )}
            </button>
          )}
        </div>
      </div>
    );
  }
}
