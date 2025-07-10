import styles from "./VesselsInfo.module.css";
import {
  getGeneralShipCategory,
  getShipIconComponent,
  countryNameToCode,
} from "../../utils";
import Flag from "react-world-flags";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { NoResults, ErrorIllustration } from "../../assets";
import { EditPopup, LoadingSpinner } from "../../components";
import { useAppContext } from "../../appContext";
import { useFleetToggle } from "../../hooks";

export default function VesselsInfo({ vessel, error, loading, setReload }) {
  const { role } = useAppContext();
  const navigate = useNavigate();

  const [popupOpen, setPopupOpen] = useState(false);

  const handlePopupToggle = () => {
    setPopupOpen(!popupOpen);
  };

  const [fleetLoading, setFleetLoading] = useState(false);

  const { handleToggleFleet } = useFleetToggle({
    setReloadCallback: setReload,
    setLoading: setFleetLoading,
  });

  return (
    <div className={styles.vesselWrapper}>
      {vessel && !error && !loading && (
        <div className={styles.vesselInfoBox}>
          <div className={styles.vesselHead}>
            <div className={styles.vesselHeadLeft}>
              {/* VESSEL TYPE ICON  */}
              <div className={styles.vesselType}>
                {(() => {
                  const IconComponent = getShipIconComponent(
                    vessel?.type?.toLowerCase()
                  );
                  return <IconComponent />;
                })()}
              </div>

              {/* VESSEL FLAG */}
              <Flag
                code={countryNameToCode[vessel?.country] || ""}
                style={{ width: "auto", height: "40px" }}
              />

              {/* VESSEL BASIC INFO */}
              <div className={styles.headInfo}>
                <h3 className={styles.vesselTitle}>
                  {vessel?.name || "Unknown"}
                </h3>
                <p className={styles.vesselCountry}>
                  {vessel?.country || "Unknown"}
                </p>
              </div>
            </div>

            <button className={styles.backButton} onClick={() => navigate(-1)}>
              <p className={styles.backButtonText}>Back</p>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                viewBox="0 0 24 24"
              >
                <path
                  fill="var(--dark-blue)"
                  d="m4 8l-.707.707L2.586 8l.707-.707zm5 12a1 1 0 1 1 0-2zm-.707-6.293l-5-5l1.414-1.414l5 5zm-5-6.414l5-5l1.414 1.414l-5 5zM4 7h10.5v2H4zm10.5 13H9v-2h5.5zm6.5-6.5a6.5 6.5 0 0 1-6.5 6.5v-2a4.5 4.5 0 0 0 4.5-4.5zM14.5 7a6.5 6.5 0 0 1 6.5 6.5h-2A4.5 4.5 0 0 0 14.5 9z"
                />
              </svg>
            </button>
          </div>

          <div className={styles.vesselBody}>
            <div className={styles.vesselBodyInner}>
              <div className={styles.vesselCol}>
                <div className={styles.vesselColInfo}>
                  <h5 className={styles.vesselLabel}>GENERAL</h5>

                  <table className={styles.infoTable}>
                    <tbody>
                      <tr>
                        <td className={styles.labelCell}>Name</td>
                        <td className={styles.valueCell}>
                          {vessel?.name || "Unknown"}
                        </td>
                      </tr>
                      <tr>
                        <td className={styles.labelCell}>Country</td>
                        <td className={styles.valueCell}>
                          {vessel?.country || "Unknown"}
                        </td>
                      </tr>
                      <tr>
                        <td className={styles.labelCell}>MMSI</td>
                        <td className={styles.valueCell}>{vessel?.mmsi}</td>
                      </tr>
                      <tr>
                        <td className={styles.labelCell}>IMO</td>
                        <td className={styles.valueCell}>
                          {vessel?.imo || "-"}
                        </td>
                      </tr>
                      <tr>
                        <td className={styles.labelCell}>Call Sign</td>
                        <td className={styles.valueCell}>
                          {vessel?.callSign || "-"}
                        </td>
                      </tr>
                      <tr>
                        <td className={styles.labelCell}>Ship Type</td>
                        <td
                          className={styles.valueCell}
                          style={{ textTransform: "capitalize" }}
                        >
                          {getGeneralShipCategory(vessel?.type)}
                        </td>
                      </tr>
                      <tr>
                        <td className={styles.labelCell}>Detailed Ship Type</td>
                        <td
                          className={styles.valueCell}
                          style={{ textTransform: "capitalize" }}
                        >
                          {vessel?.type || "Unknown"}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className={styles.vesselButtonWrapper}>
                  {/* <motion.div
                    whileHover={{ y: -2 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Link to="/" className={styles.pastButton}>
                      <p>Past Track</p>
                    </Link>
                  </motion.div> */}

                  <motion.div
                    whileHover={{ y: -2 }}
                    transition={{ duration: 0.3 }}
                    onClick={() => navigate(`/past-track/${vessel?.mmsi}`)}
                    className={styles.pastButton}
                  >
                    <p>Past Track</p>
                  </motion.div>

                  {(role === "ADMIN" || role === "USER") && (
                    <motion.button
                      className={`${
                        vessel?.isInFleet ? styles.inFleet : styles.addButton
                      }`}
                      onClick={(e) =>
                        handleToggleFleet(e, vessel?.mmsi, vessel?.isInFleet)
                      }
                      whileHover={{ y: -2 }}
                    >
                      {fleetLoading ? (
                        <LoadingSpinner />
                      ) : (
                        <>
                          {" "}
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="22"
                            viewBox="0 0 24 24"
                          >
                            <path
                              fill="none"
                              stroke="white"
                              strokeLinejoin="round"
                              strokeWidth="1.5"
                              d="M22 8.862a5.95 5.95 0 0 1-1.654 4.13c-2.441 2.531-4.809 5.17-7.34 7.608c-.581.55-1.502.53-2.057-.045l-7.295-7.562c-2.205-2.286-2.205-5.976 0-8.261a5.58 5.58 0 0 1 8.08 0l.266.274l.265-.274A5.6 5.6 0 0 1 16.305 3c1.52 0 2.973.624 4.04 1.732A5.95 5.95 0 0 1 22 8.862Z"
                            />
                          </svg>
                          <p>My Fleet</p>{" "}
                        </>
                      )}
                    </motion.button>
                  )}

                  {role === "ADMIN" && (
                    <motion.button
                      className={styles.addButton}
                      onClick={handlePopupToggle}
                      whileHover={{ y: -2 }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="22"
                        viewBox="0 0 24 24"
                      >
                        <g
                          fill="none"
                          stroke="white"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                        >
                          <path d="m16.475 5.408l2.117 2.117m-.756-3.982L12.109 9.27a2.1 2.1 0 0 0-.58 1.082L11 13l2.648-.53c.41-.082.786-.283 1.082-.579l5.727-5.727a1.853 1.853 0 1 0-2.621-2.621" />
                          <path d="M19 15v3a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h3" />
                        </g>
                      </svg>
                      <p>Edit</p>
                    </motion.button>
                  )}
                </div>
              </div>

              <div className={styles.vesselCol}>
                <div className={styles.vesselColInfo}>
                  <h5 className={styles.vesselLabel}>VOYAGE DATA</h5>

                  <table className={styles.infoTable}>
                    <tbody>
                      <tr>
                        <td className={styles.labelCell}>Status</td>
                        <td className={styles.valueCell}>
                          {vessel?.status || "Unknown"}
                        </td>
                      </tr>
                      <tr>
                        <td className={styles.labelCell}>Draught</td>
                        <td className={styles.valueCell}>
                          {vessel?.draught || "-"}m
                        </td>
                      </tr>
                      <tr>
                        <td className={styles.labelCell}>Speed</td>
                        <td className={styles.valueCell}>
                          {vessel?.speed || "-"}kn
                        </td>
                      </tr>
                      <tr>
                        <td className={styles.labelCell}>Latitude</td>
                        <td className={styles.valueCell}>
                          {vessel?.latitude || "-"}
                        </td>
                      </tr>
                      <tr>
                        <td className={styles.labelCell}>Longitude</td>
                        <td className={styles.valueCell}>
                          {vessel?.longitude || "-"}
                        </td>
                      </tr>
                      <tr>
                        <td className={styles.labelCell}>Course</td>
                        <td className={styles.valueCell}>
                          {vessel?.courseOverGround || "-"}°
                        </td>
                      </tr>

                      <tr>
                        <td className={styles.labelCell}>Heading</td>
                        <td className={styles.valueCell}>
                          {vessel?.heading || "-"}°
                        </td>
                      </tr>
                      <tr>
                        <td className={styles.labelCell}>Rate of Turn:</td>
                        <td className={styles.valueCell}>
                          {vessel?.rateOfTurn || "-"}°/min
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {!vessel && !error && !loading && (
        <div className={styles.noResultsWrapper}>
          <img src={NoResults} width={350} />
          <p>No Vessel Found...</p>
        </div>
      )}

      {/* ERROR  */}
      {error && !loading && (
        <div className={styles.noResultsWrapper}>
          <img src={ErrorIllustration} width={350} />
          <p>{error}</p>
        </div>
      )}

      <AnimatePresence>
        {popupOpen && (
          <EditPopup
            onClose={handlePopupToggle}
            vessel={vessel}
            setReload={setReload}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
