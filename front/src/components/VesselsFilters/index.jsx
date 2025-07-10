import { useState, useEffect, useRef } from "react";
import styles from "./VesselsFilters.module.css";
import {
  getShipIconComponent,
  getGeneralShipCategory,
  vesselTypeMap,
} from "../../utils";
import { useOutsideClick } from "../../hooks";
import { AnimatePresence, motion } from "framer-motion";

export default function VesselsFilters({
  setSelectedCategories,
  selectedCategories,
}) {
  const [open, setOpen] = useState(false);
  const popupRef = useRef(null);

  const toggleCategory = (id) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((cat) => cat !== id) : [...prev, id]
    );
  };

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setOpen((prev) => !prev);
  };

  // handle outside click
  useOutsideClick(popupRef, () => {
    setOpen(false);
  });

  // Get unique general categories
  const generalCategories = Array.from(new Set(Object.values(vesselTypeMap)));

  return (
    <div style={{ position: "relative" }}>
      <button className={styles.filtersButton} onClick={handleClick}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="22"
          height="22"
          viewBox="-2 -2 24 24"
        >
          <path
            fill="white"
            d="m2.08 2l6.482 8.101A2 2 0 0 1 9 11.351V18l2-1.5v-5.15a2 2 0 0 1 .438-1.249L17.92 2zm0-2h15.84a2 2 0 0 1 1.561 3.25L13 11.35v5.15a2 2 0 0 1-.8 1.6l-2 1.5A2 2 0 0 1 7 18v-6.65L.519 3.25A2 2 0 0 1 2.08 0"
          />
        </svg>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            ref={popupRef}
            initial={{ y: -7, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -7, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className={styles.dropdown}
          >
            <p className={styles.filtersLabel}>Ship Type</p>
            {generalCategories.map((category) => {
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
                    checked={selectedCategories.includes(category)}
                    onChange={() => toggleCategory(category)}
                  />
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
