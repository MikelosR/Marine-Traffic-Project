// src/components/ZoneToolbar.jsx
import React from "react";
import styles from "./ZoneToolbar.module.css";

const ZoneToolbar = ({ canUndo, onUndo, onDelete }) => (
  <div className={styles.toolbar}>
    <button
      className={styles.btn}
      onClick={onUndo}
      disabled={!canUndo}
    >
      Undo
    </button>

    <button className={styles.btnDanger} onClick={onDelete}>
      Delete Zone
    </button>
  </div>
);

export default ZoneToolbar;
