import React, { useMemo } from "react";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import styles from "./TimeRangeSlider.module.css";
import { format } from "date-fns";
import { el } from "date-fns/locale";

export default function TimeRangeSlider({ timestamps, selectedRange, onChange }) {
  const marks = useMemo(() => {
    const obj = {};
    timestamps.forEach((ts, i) => {
      const label = format(new Date(ts), "d/M/yyyy HH:mm", { locale: el });
      if (i === 0 || i === timestamps.length - 1 || i === Math.floor(timestamps.length / 2)) {
        obj[i] = label;
      }
    });
    return obj;
  }, [timestamps]);

  if (!timestamps?.length) return null;

  const [start, end] = selectedRange;

  const leftPercent = (start / (timestamps.length - 1)) * 100;
  const rightPercent = (end / (timestamps.length - 1)) * 100;

  return (
    <div className={styles["time-slider-container"]}>
      <div className={styles["slider-wrapper"]}>


        <Slider
          range
          min={0}
          max={timestamps.length - 1}
          value={selectedRange}
          onChange={onChange}
          allowCross={false}
          marks={marks}
          step={1}
        />


        <div className={styles["handle-labels"]}>
          <span
            className={styles["label"]}
            style={{ left: `calc(${leftPercent}% - 20px)` }}
          >
            {format(new Date(timestamps[start]), "d/M/yyyy HH:mm", { locale: el })}
          </span>

          <span
            className={styles["label"]}
            style={{ left: `calc(${rightPercent}% - 20px)` }}
          >
            {format(new Date(timestamps[end]), "d/M/yyyy HH:mm", { locale: el })}
          </span>
        </div>
      </div>
    </div>
  );
}
