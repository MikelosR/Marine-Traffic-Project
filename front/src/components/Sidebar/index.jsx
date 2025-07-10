import { useEffect, useRef, useState } from "react";
import styles from "./Sidebar.module.css";
import { SearchOutlined } from "@ant-design/icons";
import { RiShipFill, RiFilter2Line } from "react-icons/ri";
import { FaRegHeart } from "react-icons/fa";
import { PiPolygonFill } from "react-icons/pi";
import { HiOutlineShieldExclamation } from "react-icons/hi";
import {
  axiosGetPrivate,
  axiosPostPrivate,
  axiosDeletePrivate,
} from "../../api";
import {
  SearchPopup,
  SidebarFilters,
  Constraints,
  ZoneOfInterestPopup,
} from "../../components";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAppContext } from "../../appContext";
import { detailedStatusReverseMap } from "../../utils";
import { useToastError, useToastSuccess } from "../../hooks";

export default function Sidebar({
  onTrackVessel,
  filters,
  setFilters,
  constraints,
  setConstraints,
}) {
  const navigate = useNavigate();
  const showToast = useToastSuccess();
  const showToastError = useToastError();
  const [expanded, setExpanded] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedControl, setSelectedControl] = useState(null);
  const [zonePopupVisible, setZonePopupVisible] = useState(false);

  const sidebarRef = useRef(null);
  const popupRef = useRef(null);
  const zonePopupRef = useRef(null);
  const { role, setSavedZone, setZoneSelected } = useAppContext();

  const [zone, setZone] = useState({
    startPoint: { lat: null, lon: null },
    endPoint: { lat: null, lon: null },
    types: [],
    status: [],
    speedMin: null,
    speedMax: null,
  });

  const [hasZone, setHasZone] = useState(false);
  const [zoneLoading, setZoneLoading] = useState(false);

  function validateZone(zone) {
    const { startPoint, endPoint, status, types, speedMin, speedMax } = zone;

    if (
      startPoint.lat == null ||
      startPoint.lon == null ||
      endPoint.lat == null ||
      endPoint.lon == null
    ) {
      showToastError("You must set all zone coordinates!");
      return false;
    }

    if (startPoint.lat <= endPoint.lat) {
      showToastError(
        "Upper Left Latitude must be greater than Bottom Right Latitude!"
      );
      return false;
    }

    if (startPoint.lon >= endPoint.lon) {
      showToastError(
        "Upper Left Longitude must be less than Bottom Right Longitude!"
      );
      return false;
    }

    const hasConstraint =
      (status && status.length > 0) ||
      (types && types.length > 0) ||
      (speedMin !== null && speedMin > 0) ||
      (speedMax !== null && speedMax < 100);

    if (!hasConstraint) {
      showToastError("You must set at least one constraint!");
      return false;
    }

    return true;
  }

  const handleSave = async () => {
    setZoneLoading(true);
    try {
      if (!validateZone(zone)) return;

      const statusCodes = zone.status
        .map((status) => detailedStatusReverseMap[status])
        .filter((code) => code !== undefined);

      const payload = {
        ...zone,
        status: statusCodes,
      };

      const response = await axiosPostPrivate("zone", payload);
      if (!response.success) throw new Error(response.error);

      const topLeft = zone.startPoint;
      const bottomRight = zone.endPoint;
      const topRight = { lat: zone.startPoint.lat, lon: zone.endPoint.lon };
      const bottomLeft = { lat: zone.endPoint.lat, lon: zone.startPoint.lon };

      setZonePopupVisible(false);
      showToast("Zone set successfully");
      setSavedZone({
        topLeft,
        topRight,
        bottomLeft,
        bottomRight,
      });
    } catch (err) {
      console.log(err.message);
      showToastError(err.message);
    }
  };

  const handleDelete = async () => {
    setZoneLoading(true);
    try {
      const response = await axiosDeletePrivate("zone");
      if (!response.success) throw new Error(response.error);

      setZonePopupVisible(false);
      showToast("Zone deleted successfully");
      setZone({
        startPoint: { lat: null, lon: null },
        endPoint: { lat: null, lon: null },
        types: [],
        status: [],
        speedMin: null,
        speedMax: null,
      });
      setSavedZone(null);
    } catch (err) {
      console.log(err.message);
      showToastError(err.message);
    }
  };

  // Disable leaflet event propagation on sidebar
  useEffect(() => {
    if (zonePopupRef.current) {
      import("leaflet").then((L) => {
        L.DomEvent.disableClickPropagation(zonePopupRef.current);
        L.DomEvent.disableScrollPropagation(zonePopupRef.current);
      });
    }
  }, []);

  // Close sidebar or popup on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      const target = event.target;

      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(target) &&
        (!popupRef.current || !popupRef.current.contains(target)) &&
        (!zonePopupRef.current || !zonePopupRef.current.contains(target))
      ) {
        setExpanded(false);
        setSearch("");
        setSelectedControl(null);
        setZonePopupVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!constraints) return;

    console.log(constraints);
    setZone((prev) => ({
      ...prev,
      types: constraints.shipTypes ?? [],
      status: constraints.statuses ?? [],
      speedMin: constraints.speed[0] ?? null,
      speedMax: constraints.speed[1] ?? null,
    }));
  }, [constraints]);

  useEffect(() => {
    async function loadUserZone() {
      try {
        const response = await axiosGetPrivate("zone");
        if (!response.success) throw new Error(response.data.error);
        if (
          response.data &&
          response.data.startPoint &&
          response.data.endPoint
        ) {
          setZone(response.data);
          setConstraints({
            shipTypes: response.data.types,
            statuses: response.data.status,
            speed: [response.data.speedMin, response.data.speedMax],
          });
          setHasZone(true);
          const topLeft = response.data.startPoint;
          const bottomRight = response.data.endPoint;
          const topRight = {
            lat: response.data.startPoint.lat,
            lon: response.data.endPoint.lon,
          };
          const bottomLeft = {
            lat: response.data.endPoint.lat,
            lon: response.data.startPoint.lon,
          };
          setSavedZone({
            topLeft,
            topRight,
            bottomLeft,
            bottomRight,
          });
        } else {
          setZone({
            startPoint: { lat: null, lon: null },
            endPoint: { lat: null, lon: null },
            types: [],
            status: [],
            speedMin: null,
            speedMax: null,
          });
          setHasZone(false);
          setSavedZone(null);
        }
      } catch (error) {
        // fallback init on error
        setZone({
          startPoint: { lat: null, lon: null },
          endPoint: { lat: null, lon: null },
          types: [],
          status: [],
          speedMin: null,
          speedMax: null,
        });
      }
    }

    loadUserZone();
  }, []);

  const handleControlClick = (controlName) => {
    if (selectedControl === controlName) {
      // toggle off
      setSelectedControl(null);
      if (controlName === "Zone of Interest") setZonePopupVisible(false);
    } else {
      setSelectedControl(controlName);
      if (controlName === "My Fleet") {
        navigate("/my-fleet");
      } else if (controlName === "Zone of Interest") {
        setZonePopupVisible(true);
      } else if (controlName === "Vessels") {
        navigate("/vessels");
      }
    }
    if (!expanded) setExpanded(true);
  };

  // Helpers to determine classes
  const getIconBoxClass = (title) => {
    const isSelected =
      title === "Zone of Interest" || title === "Constraints"
        ? selectedControl === "Zone of Interest" ||
          selectedControl === "Constraints"
        : selectedControl === title;

    const noHover =
      (title === "Filter" && selectedControl === "Filter") ||
      (title === "Constraints" && selectedControl === "Constraints");

    return [
      styles.iconBox,
      expanded ? styles.iconBoxExpanded : "",
      isSelected ? styles.iconBoxSelected : "",
      noHover ? styles.iconBoxNoHover : "",
    ]
      .filter(Boolean)
      .join(" ");
  };

  useEffect(() => {
    console.log("HHHH", selectedControl);
    if (selectedControl === "Zone of Interest") {
      setZoneSelected(true);
    } else {
      setZoneSelected(false);
    }
  }, [selectedControl]);

  return (
    <div style={{ position: "relative", height: "100%", width: "100%" }}>
      {/* Search popup */}
      <AnimatePresence>
        {expanded && search && (
          <motion.div
            ref={popupRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            style={{
              position: "absolute",
              top: "50px",
              right: "400px",
              zIndex: 1000,
            }}
          >
            <SearchPopup
              search={search}
              onClose={() => setExpanded(false)}
              onTrackVessel={onTrackVessel}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {zonePopupVisible && (
          <motion.div
            ref={zonePopupRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            style={{
              position: "absolute",
              top: "50px",
              right: "400px",
              zIndex: 1000,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <ZoneOfInterestPopup
              onClose={() => setZonePopupVisible(false)}
              onDelete={handleDelete}
              onSave={handleSave}
              zone={zone}
              setZone={setZone}
              hasZone={hasZone}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div
        ref={sidebarRef}
        className={`${styles.sidebar} ${expanded ? styles.expanded : ""}`}
      >
        {expanded ? (
          <div className={styles.searchContainer}>
            <div className={styles.searchBox}>
              <SearchOutlined className={styles.searchIcon} />
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Search"
                onChange={(e) => setSearch(e.target.value)}
                value={search}
              />
            </div>
          </div>
        ) : (
          <div
            className={`${styles.iconBox} ${styles.searchIconBox}`}
            onClick={() => setExpanded(true)}
          >
            <div className={styles.icon}>
              <SearchOutlined />
            </div>
          </div>
        )}

        {/* Now render controls explicitly */}

        {/* Role-based Controls */}
        {(role === "ADMIN" || role === "USER") && (
          <>
            {/* My Fleet */}
            <div
              className={getIconBoxClass("My Fleet")}
              onClick={() => handleControlClick("My Fleet")}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ")
                  handleControlClick("My Fleet");
              }}
            >
              <div className={styles.icon}>
                <div className={styles.iconTitleContainer}>
                  {expanded && (
                    <span className={styles.titleRight}>My Fleet</span>
                  )}
                  <span className={styles.iconLeft}>
                    <FaRegHeart />
                  </span>
                </div>
              </div>
            </div>

            {/* Vessels */}
            <div
              className={getIconBoxClass("Vessels")}
              onClick={() => handleControlClick("Vessels")}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ")
                  handleControlClick("Vessels");
              }}
            >
              <div className={styles.icon}>
                <div className={styles.iconTitleContainer}>
                  {expanded && (
                    <span className={styles.titleRight}>Vessels</span>
                  )}
                  <span className={styles.iconLeft}>
                    <RiShipFill />
                  </span>
                </div>
              </div>
            </div>

            {/* Filter */}
            <div
              className={getIconBoxClass("Filter")}
              onClick={() => handleControlClick("Filter")}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ")
                  handleControlClick("Filter");
              }}
            >
              <div className={styles.icon}>
                <div className={styles.iconTitleContainer}>
                  {expanded && (
                    <span className={styles.titleRight}>Filter</span>
                  )}
                  <span className={styles.iconLeft}>
                    <RiFilter2Line />
                  </span>
                </div>
              </div>
            </div>

            {selectedControl === "Filter" && (
              <div className={styles.sidebarFiltersWrapper}>
                <SidebarFilters filters={filters} setFilters={setFilters} />
              </div>
            )}

            {/* Zone of Interest */}
            <div
              className={getIconBoxClass("Zone of Interest")}
              onClick={() => handleControlClick("Zone of Interest")}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ")
                  handleControlClick("Zone of Interest");
              }}
            >
              <div className={styles.icon}>
                <div className={styles.iconTitleContainer}>
                  {expanded && (
                    <span className={styles.titleRight}>Zone of Interest</span>
                  )}
                  <span className={styles.iconLeft}>
                    <PiPolygonFill />
                  </span>
                </div>
              </div>
            </div>

            {/* Constraints (only show if Zone or Constraints selected) */}
            {(selectedControl === "Zone of Interest" ||
              selectedControl === "Constraints") && (
              <div
                className={getIconBoxClass("Constraints")}
                onClick={() => handleControlClick("Constraints")}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ")
                    handleControlClick("Constraints");
                }}
              >
                <div className={styles.icon}>
                  <div className={styles.iconTitleContainer}>
                    {expanded && (
                      <span className={styles.titleRight}>Constraints</span>
                    )}
                    <span className={styles.iconLeft}>
                      <HiOutlineShieldExclamation />
                    </span>
                  </div>
                </div>
              </div>
            )}

            {selectedControl === "Constraints" && (
              <div className={styles.sidebarFiltersWrapper}>
                <Constraints
                  constraints={constraints}
                  setConstraints={setConstraints}
                />
              </div>
            )}
          </>
        )}

        {/* For non-admin/non-user roles */}
        {role !== "ADMIN" && role !== "USER" && (
          <div
            className={getIconBoxClass("Vessels")}
            onClick={() => handleControlClick("Vessels")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ")
                handleControlClick("Vessels");
            }}
          >
            <div className={styles.icon}>
              <div className={styles.iconTitleContainer}>
                {expanded && <span className={styles.titleRight}>Vessels</span>}
                <span className={styles.iconLeft}>
                  <RiShipFill />
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
