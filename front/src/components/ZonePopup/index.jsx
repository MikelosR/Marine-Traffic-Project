import React, { useState } from "react";
import styles from "./ZonePopup.module.css";

export default function ZoneOfInterestPopup({
  onSave,
  onDelete,
  onClose,
  zone,
  setZone,
  hasZone,
}) {
  const [startPoint, setStartPoint] = useState(() => ({
    lat: zone?.startPoint?.lat ?? null,
    lon: zone?.startPoint?.lon ?? null,
  }));

  const [endPoint, setEndPoint] = useState(() => ({
    lat: zone?.endPoint?.lat ?? null,
    lon: zone?.endPoint?.lon ?? null,
  }));

  const handleChange = (point, field, value) => {
    const parsed = parseFloat(value);
    if (point === "startPoint") {
      const updated = { ...startPoint, [field]: parsed };
      setStartPoint(updated);
      setZone?.((prev) => ({ ...prev, startPoint: updated }));
    } else {
      const updated = { ...endPoint, [field]: parsed };
      setEndPoint(updated);
      setZone?.((prev) => ({ ...prev, endPoint: updated }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ startPoint, endPoint });
  };

  const handleDelete = () => {
    onDelete();
    onClose?.();
  };

  return (
    <div className={styles.popup} onClick={(e) => e.stopPropagation()}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <h3 className={styles.title}>Zone of Interest</h3>

        {hasZone && <p className={styles.info}>You have already set a zone</p>}

        <div className={styles.fieldGroup}>
          <label>
            Upper Left Latitude:
            <input
              type="number"
              step="any"
              value={startPoint.lat ?? ""}
              onChange={(e) =>
                handleChange("startPoint", "lat", e.target.value)
              }
              required
            />
          </label>
          <label>
            Upper Left Longitude:
            <input
              type="number"
              step="any"
              value={startPoint.lon ?? ""}
              onChange={(e) =>
                handleChange("startPoint", "lon", e.target.value)
              }
              required
            />
          </label>
        </div>

        <div className={styles.fieldGroup}>
          <label>
            Bottom Right Latitude:
            <input
              type="number"
              step="any"
              value={endPoint.lat ?? ""}
              onChange={(e) => handleChange("endPoint", "lat", e.target.value)}
              required
            />
          </label>
          <label>
            Bottom Right Longitude:
            <input
              type="number"
              step="any"
              value={endPoint.lon ?? ""}
              onChange={(e) => handleChange("endPoint", "lon", e.target.value)}
              required
            />
          </label>
        </div>

        <div className={styles.buttonGroup}>
          <button type="submit" className={styles.saveBtn} disabled={hasZone}>
            Save
          </button>
          <button
            type="button"
            className={styles.deleteBtn}
            onClick={handleDelete}
            disabled={!hasZone}
          >
            Delete
          </button>
        </div>
      </form>
    </div>
  );
}
