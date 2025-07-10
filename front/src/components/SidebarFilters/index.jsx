import { useState } from "react";
import styles from "./SidebarFilters.module.css";
import { motion } from "framer-motion";
import {
  getShipIconComponent,
  vesselTypeMap,
  detailedStatusMap,
  generalStatusReverseMap,
} from "../../utils";
import RangeSlider from "react-range-slider-input";
import "react-range-slider-input/dist/style.css";

const SidebarFilters = ({ filters, setFilters }) => {
  const [openIndex, setOpenIndex] = useState(null);


  // handle accordion toggle
  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };


  // FILTERS
  // ====== MY FLEET ====== 
  const toggleMyFleet = () =>
    setFilters((prev) => ({ ...prev, myFleet: !prev.myFleet }));

  // ====== SHIP TYPE ====== 
  const shipTypes = Array.from(new Set(Object.values(vesselTypeMap)));

  const toggleCategory = (id) => {
    setFilters((prev) => {
      const shipTypes = prev.shipTypes || [];
      const newShipTypes = shipTypes.includes(id)
        ? shipTypes.filter((cat) => cat !== id)
        : [...shipTypes, id];

      return {
        ...prev,
        shipTypes: newShipTypes,
      };
    });
  };

  // ====== SPEED ====== 
  const minSpeed = 0;
  const maxSpeed = 100;
  const [speedRange, setSpeedRange] = useState([minSpeed, maxSpeed]);
  const [speedInputs, setSpeedInputs] = useState([
    minSpeed.toString(),
    maxSpeed.toString(),
  ]);

  // handle speed range change
  const onSpeedRangeChange = (newRange) => {
    setSpeedRange(newRange);
    setSpeedInputs([`${newRange[0]}`, `${newRange[1]}`]);
    setFilters((prev) => ({ ...prev, speed: newRange }));
  };


  // handle speed inputs change
  const onSpeedInputChange = (idx, val) => {

    // visually update the input values
    setSpeedInputs((prev) => {
      const next = [...prev];
      next[idx] = val;
      return next;
    });


    // parse the input value
    // and ensure it is within the min/max bounds
    let parsed = parseFloat(val);
    if (idx === 0 && (parsed < minSpeed || parsed >= maxSpeed))
      parsed = minSpeed;
    if (idx === 1 && (parsed > maxSpeed || parsed <= minSpeed))
      parsed = maxSpeed;

    if (isNaN(parsed) && idx === 0) {
      parsed = minSpeed;
    } else if (isNaN(parsed) && idx === 1) {
      parsed = maxSpeed;
    }

    // clamp the value between min and max
    // and update the speed range accordingly
    let clamped = Math.min(Math.max(parsed, minSpeed), maxSpeed);
    const nextRange = [...speedRange];

    if (idx === 0) {
      // ensure min doesn't exceed current max
      clamped = Math.min(clamped, nextRange[1]);
      nextRange[0] = clamped;
    } else {
      // ensure max doesn't go below current min
      clamped = Math.max(clamped, nextRange[0]);
      nextRange[1] = clamped;
    }

    // update the speed range state and the filters
    setSpeedRange(nextRange);
    setFilters((prev) => ({ ...prev, speed: nextRange }));
  };


  // ====== STATUS ====== 
  // get general ship statuses
  const shipStatuses = Object.keys(generalStatusReverseMap).map((key) => ({
    id: key,
    label:
      key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, " $1"),
  }));

  const toggleStatus = (generalStatusId) => {
    setFilters((prev) => {
      const detailedIds = generalStatusReverseMap[generalStatusId] || [];
      const detailedNames = detailedIds.map((id) => detailedStatusMap[id]);
      const selectedNames = prev.statuses;
      const allSelected = detailedNames.every((name) =>
        selectedNames.includes(name)
      );

      let newStatuses;

      if (allSelected) {
        newStatuses = selectedNames.filter(
          (name) => !detailedNames.includes(name)
        );
      } else {
        newStatuses = [...new Set([...selectedNames, ...detailedNames])];
      }

      return {
        ...prev,
        statuses: newStatuses,
      };
    });
  };


  // HANDLE CLEAR
  const clearFilters = () => {
    setFilters((prev) => ({
      ...prev,
      myFleet: false,
      shipTypes: [],
      speed: [minSpeed, maxSpeed],
      statuses: [],
    }));

    setSpeedRange([minSpeed, maxSpeed]);
    setSpeedInputs([minSpeed.toString(), maxSpeed.toString()]);
  };


  // FLAGS 
  const isStatusIdActive = (generalStatusId) => {
    const detailedIds = generalStatusReverseMap[generalStatusId] || [];
    const detailedNames = detailedIds.map((id) => detailedStatusMap[id]);
    return detailedNames.every((name) => filters.statuses.includes(name));
  };

  const isShipTypeActive = filters.shipTypes.length > 0;
  const isSpeedActive = filters.speed[0] !== 0 || filters.speed[1] !== 100;
  const isStatusActive = filters.statuses.length > 0;

  return (
    <div className={styles.sidebarFilters}>
      {/* ───────── MY FLEET ───────── */}
      <div className={styles.accordion}>
        <div
          className={`${styles.optionsButton} ${filters.myFleet ? styles.active : ""
            }`}
          onClick={toggleMyFleet}
        >
          <p className={styles.optionsLabel}>My Fleet</p>
          <motion.svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            viewBox="0 0 24 24"
            initial={false}
            animate={{ scale: filters.myFleet ? 1.25 : 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            style={{ display: "block" }}
          >
            <path
              d="M22 8.862a5.95 5.95 0 0 1-1.654 4.13c-2.441 2.531-4.809 5.17-7.34 7.608c-.581.55-1.502.53-2.057-.045l-7.295-7.562c-2.205-2.286-2.205-5.976 0-8.261a5.58 5.58 0 0 1 8.08 0l.266.274l.265-.274A5.6 5.6 0 0 1 16.305 3c1.52 0 2.973.624 4.04 1.732A5.95 5.95 0 0 1 22 8.862Z"
              fill={filters.myFleet ? "var(--accent-red)" : "none"}
              stroke="var(--white-transparent)"
              strokeLinejoin="round"
              strokeWidth="1.5"
              style={{ transition: "fill .25s ease" }}
            />
          </motion.svg>
        </div>
      </div>

      {/* ───────── SHIP TYPE ───────── */}
      <div className={styles.accordion}>
        <div
          className={`${styles.accordionButton} ${isShipTypeActive ? styles.active : ""
            }`}
          onClick={() => toggleAccordion(0)}
        >
          <p className={styles.accordionLabel}>Ship Type</p>
          <svg
            className={openIndex === 0 ? styles.rotated : ""}
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            viewBox="0 0 24 24"
          >
            <path
              fill="none"
              stroke="var(--white-transparent)"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="m19 9l-7 6l-7-6"
            />
          </svg>
        </div>

        {openIndex === 0 && (
          <div
            className={`${styles.accordionContent} ${styles.accordionContentType}`}
          >
            {shipTypes.map((category) => {
              const IconComponent = getShipIconComponent(category);
              const label =
                category.charAt(0).toUpperCase() + category.slice(1);
              return (
                <div key={category} className={styles.checkboxItem}>
                  <label htmlFor={category} className={styles.itemLabel}>
                    <IconComponent />
                    <p className={styles.itemCategory}>{label}</p>
                  </label>
                  <input
                    className={styles.checkbox}
                    id={category}
                    type="checkbox"
                    checked={filters.shipTypes.includes(category)}
                    onChange={() => toggleCategory(category)}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ───────── SPEED ───────── */}
      <div className={styles.accordion}>
        <div
          className={`${styles.accordionButton} ${isSpeedActive ? styles.active : ""
            }`}
          onClick={() => toggleAccordion(1)}
        >
          <p className={styles.accordionLabel}>Speed</p>
          <svg
            className={openIndex === 1 ? styles.rotated : ""}
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            viewBox="0 0 24 24"
          >
            <path
              fill="none"
              stroke="var(--white-transparent)"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="m19 9l-7 6l-7-6"
            />
          </svg>
        </div>

        {openIndex === 1 && (
          <div className={styles.accordionContent}>
            <div className={styles.speedInputsWrapper}>
              <input
                type="number"
                min={minSpeed}
                max={maxSpeed}
                value={speedInputs[0]}
                onChange={(e) => onSpeedInputChange(0, e.target.value)}
                className={styles.numberInput}
              />

              <div className={styles.sliderContainer}>
                <RangeSlider
                  className="custom-range-slider"
                  min={minSpeed}
                  max={maxSpeed}
                  step={1}
                  value={speedRange}
                  onInput={onSpeedRangeChange}
                  minLabel={minSpeed.toString()}
                  maxLabel={maxSpeed.toString()}
                />
              </div>

              <input
                type="number"
                min={minSpeed}
                max={maxSpeed}
                value={speedInputs[1]}
                onChange={(e) => onSpeedInputChange(1, e.target.value)}
                className={styles.numberInput}
              />
            </div>
          </div>
        )}
      </div>

      {/* ───────── STATUS ───────── */}
      <div className={styles.accordion}>
        <div
          className={`${styles.accordionButton} ${isStatusActive ? styles.active : ""
            }`}
          onClick={() => toggleAccordion(2)}
        >
          <p className={styles.accordionLabel}>Status</p>
          <svg
            className={openIndex === 2 ? styles.rotated : ""}
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            viewBox="0 0 24 24"
          >
            <path
              fill="none"
              stroke="var(--white-transparent)"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="m19 9l-7 6l-7-6"
            />
          </svg>
        </div>

        {openIndex === 2 && (
          <div className={styles.accordionContent}>
            {shipStatuses.map((status) => (
              <div key={status.id} className={styles.checkboxItem}>
                <label htmlFor={status.id} className={styles.itemLabel}>
                  <p className={styles.itemCategory}>{status.label}</p>
                </label>

                <input
                  id={status.id}
                  type="checkbox"
                  className={styles.checkbox}
                  checked={isStatusIdActive(status.id)}
                  onChange={() => toggleStatus(status.id)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
      {/* CLEAR FILTERS */}
      <div className={styles.accordion}>
        <button
          type="button"
          className={styles.clearFiltersButton}
          onClick={clearFilters}
        >
          Clear Filters
        </button>
      </div>
    </div>
  );
};

export default SidebarFilters;
