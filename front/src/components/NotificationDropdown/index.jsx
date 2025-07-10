import { useState, useRef, useEffect } from "react";
import styles from "./NotificationDropdown.module.css";
import { useOutsideClick } from "../../hooks";
import { axiosGetPrivate, axiosDeletePrivate } from "../../api";
import { LoadingSpinner } from "../../components";
import {
  connectWebSocketViolations,
  disconnectWebSocketViolations,
} from "../../utils/webSocketViolations";

const ZoneNotification = ({ vessel, constraints, onClick }) => {
  const parts = [];

  if (constraints.Types?.length) {
    parts.push(`Type(s): ${constraints.Types.join(", ")}`);
  }
  if (constraints.Status?.length) {
    parts.push(`Status: ${constraints.Status.join(", ")}`);
  }
  if (constraints.Speed_min != null || constraints.Speed_max != null) {
    parts.push(
      `Speed: ${constraints.Speed_min ?? "?"} - ${constraints.Speed_max ?? "?"}`
    );
  }

  return (
    <li className={styles.notificationItem} onClick={onClick}>
      <span>
        <div className={styles.itemHeader}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="15"
            height="15"
            viewBox="0 0 512 512"
            style={{ marginRight: "5px" }}
          >
            <path
              fill="#c0392b"
              d="M256 48C141.1 48 48 141.1 48 256s93.1 208 208 208 208-93.1 208-208S370.9 48 256 48zM96 256c0-34.3 10.2-66.2 27.6-92.9l229.3 229.3C322.2 405.8 290.3 416 256 416c-88.2 0-160-71.8-160-160zm320 0c0 34.3-10.2 66.2-27.6 92.9L159.1 119.6C189.8 101.2 222.7 96 256 96c88.2 0 160 71.8 160 160z"
            />
          </svg>
          <p>
            <strong>{vessel.Name}</strong> violated:
          </p>
        </div>
        <ul className={styles.constraintsList}>
          {parts.map((part, idx) => (
            <li key={idx}>{part}</li>
          ))}
        </ul>
      </span>
    </li>
  );
};

const CollisionNotification = ({ vesselA, vesselB, onClick }) => (
  <li className={styles.notificationItem} onClick={onClick}>
    <div className={styles.itemHeader}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="14"
        height="14"
        viewBox="0 0 576 512"
        style={{ marginRight: "5px", verticalAlign: "middle" }}
      >
        <path
          fill="#e67e22"
          d="M569.517 440L327.517 40c-18.231-30.354-60.803-30.354-79.034 0L6.483 440c-18.897 31.425 3.216 72 39.517 72h484c36.301 0 58.414-40.575 39.517-72zM288 176c13.255 0 24 10.745 24 24v96c0 13.255-10.745 24-24 24s-24-10.745-24-24v-96c0-13.255 10.745-24 24-24zm0 208c-17.673 0-32-14.327-32-32s14.327-32 32-32 32 14.327 32 32-14.327 32-32 32z"
        />
      </svg>
      <p>
        <strong>{vesselA}</strong> and <strong>{vesselB}</strong> risk collision
      </p>
    </div>
  </li>
);

const NotificationDropdown = ({ user }) => {
  const id = user?.id;
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [results, setResults] = useState([]);

  useEffect(() => {
    connectWebSocketViolations((vData) => {
      const { type, vid, vessel, constraints, vesselA, vesselB } = vData;

      const newNotification = {
        id: vid, // <-- Add a real id field here
        type,
        ...(type === "zone"
          ? { vessel, constraints }
          : type === "collision"
          ? { vesselA, vesselB }
          : {}),
      };

      setResults((prev) => {
        const exists = prev.some((n) => n.id === newNotification.id);
        return exists ? prev : [...prev, newNotification];
      });
    });

    return () => disconnectWebSocketViolations();
  }, []);

  // Close dropdown on outside click
  useOutsideClick(dropdownRef, () => {
    setOpen(false);
  });

  // delete notification on click
  const handleNotificationClick = async (e, id) => {
    e.preventDefault();
    alert(id);
    // try {
    //     const response = await axiosDeletePrivate(`/notifications/${notification?.id}`);
    //     if (!response.success) throw new Error(response.data.error);

    // } catch (err) {
    //     console.error("Error deleting notification:", err.message);
    // }
  };

  return (
    <div ref={dropdownRef} className={styles.dropdownWrapper}>
      <button
        onClick={() => setOpen(!open)}
        className={styles.notificationsButton}
        title="Notifications"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 448 512"
        >
          <path
            fill="var(--dark-blue)"
            d="M224 512c35.32 0 63.97-28.65 63.97-64H160.03c0 35.35 28.65 64 63.97 64m215.39-149.71c-19.32-20.76-55.47-51.99-55.47-154.29c0-77.7-54.48-139.9-127.94-155.16V32c0-17.67-14.32-32-31.98-32s-31.98 14.33-31.98 32v20.84C118.56 68.1 64.08 130.3 64.08 208c0 102.3-36.15 133.53-55.47 154.29c-6 6.45-8.66 14.16-8.61 21.71c.11 16.4 12.98 32 32.1 32h383.8c19.12 0 32-15.6 32.1-32c.05-7.55-2.61-15.27-8.61-21.71"
          />
        </svg>{" "}
      </button>

      {results.length > 0 && (
        <span className={styles.notificationCount}>{results.length}</span>
      )}

      {open && (
        <div
          className={styles.notificationsDropdown}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={styles.dropdownHeader}>Notifications</div>
          <ul className={styles.dropdownList}>
            {loading ? (
              <LoadingSpinner size={25} />
            ) : results && results.length > 0 ? (
              results.map((n, i) => {
                if (n.type === "zone") {
                  return (
                    <ZoneNotification
                      key={i}
                      vessel={n.vessel}
                      constraints={n.constraints}
                      onClick={(e) => handleNotificationClick(e, n.id)}
                    />
                  );
                } else if (n.type === "collision") {
                  return (
                    <CollisionNotification
                      key={i}
                      vesselA={n.vesselA}
                      vesselB={n.vesselB}
                      onClick={(e) => handleNotificationClick(e, n.id)}
                    />
                  );
                }
                return null;
              })
            ) : (
              <li className={styles.noNotifications}>No notifications</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
