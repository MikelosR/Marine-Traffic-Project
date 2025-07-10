import { useState, useEffect } from "react";
import styles from "./Constraints.module.css";
import { motion } from "framer-motion";
import {
  getShipIconComponent,
  vesselTypeMap,
  detailedStatusMap,
  generalStatusReverseMap,
} from "../../utils";
import RangeSlider from "react-range-slider-input";
import "react-range-slider-input/dist/style.css";

const Constraints = ({ constraints, setConstraints }) => {
  const [openIndex, setOpenIndex] = useState(null);

  // handle accordion toggle
  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  // CONSTRAINTS
  // ====== SHIP TYPE ======
  const shipTypes = Array.from(new Set(Object.values(vesselTypeMap)));

  const toggleCategory = (id) => {
    setConstraints((prev) => {
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
    setConstraints((prev) => ({ ...prev, speed: newRange }));
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

    // update the speed range state and the constraints
    setSpeedRange(nextRange);
    setConstraints((prev) => ({ ...prev, speed: nextRange }));
  };

  useEffect(() => {
    const [min, max] = constraints.speed || [minSpeed, maxSpeed];
    setSpeedRange([min, max]);
    setSpeedInputs([min.toString(), max.toString()]);
  }, [constraints.speed]);

  // ====== STATUS ======
  // get general ship statuses
  const shipStatuses = Object.keys(generalStatusReverseMap).map((key) => ({
    id: key,
    label:
      key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, " $1"),
  }));

  const toggleStatus = (generalStatusId) => {
    setConstraints((prev) => {
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
  const clearConstraints = () => {
    setConstraints((prev) => ({
      ...prev,
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
    return detailedNames.every((name) => constraints.statuses.includes(name));
  };

  const isShipTypeActive = constraints.shipTypes.length > 0;
  const isSpeedActive =
    constraints.speed[0] !== 0 || constraints.speed[1] !== 100;
  const isStatusActive = constraints.statuses.length > 0;

  return (
    <div className={styles.sidebarConstraints}>
      {/* ───────── SHIP TYPE ───────── */}
      <div className={styles.accordion}>
        <div
          className={`${styles.accordionButton} ${
            isShipTypeActive ? styles.active : ""
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
                    checked={constraints.shipTypes.includes(category)}
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
          className={`${styles.accordionButton} ${
            isSpeedActive ? styles.active : ""
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
          className={`${styles.accordionButton} ${
            isStatusActive ? styles.active : ""
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
      {/* CLEAR CONSTRAINTS */}
      <div className={styles.accordion}>
        <button
          type="button"
          className={styles.clearConstraintsButton}
          onClick={clearConstraints}
        >
          Clear Constraints
        </button>
      </div>
    </div>
  );
};

export default Constraints;
