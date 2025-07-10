import { useState, useEffect, useCallback } from "react";
import styles from "./SearchPopup.module.css";
import { Loading, LoadingSpinner } from "../../components";
import Flag from "react-world-flags";
import { useNavigate } from "react-router-dom";
import { axiosGetPublic } from "../../api";
import { debounce } from "lodash";
import { useToastError } from "../../hooks";

const SearchPopup = ({ search = "", onTrackVessel, onClose }) => {
  const showToastError = useToastError();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const navigate = useNavigate();

  // TODO
  const debouncedFetch = useCallback(
    debounce(async (searchTerm) => {
      setLoading(true);
      try {
        const response = await axiosGetPublic(
          `vessels/search?query=${encodeURIComponent(searchTerm)}`
        );
        if (!response.success) throw new Error(response.data.error);
        setResults(response.data);
      } catch (error) {
        console.error("Error fetching search results:", error);
        showToastError("Error fetching search results");
      } finally {
        setLoading(false);
      }
    }, 500),
    []
  );

  // fetch & filter data
  useEffect(() => {
    if (!search.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    debouncedFetch(search);

    // cancel debounce on unmount or before next call
    return () => debouncedFetch.cancel();
  }, [search, debouncedFetch]);

  // handle track
  const handleClick = (e, vessel) => {
    e.preventDefault();
    e.stopPropagation();

    onTrackVessel(vessel.latitude, vessel.longitude);
    onClose();
  };

  // handle item navigation
  const handleItemClick = (e, mmsi) => {
    e.preventDefault();
    e.stopPropagation();

    navigate(`ships/${mmsi}`);
  };

  // navigate to vessels page with search in the url params
  const handleMoreClick = (e) => {
    e.preventDefault();

    navigate(`/vessels?search=${encodeURIComponent(search)}`);
  };

  return (
    <div className={styles.popup}>
      <div className={styles.header}>
        <h5>Search Results</h5>
      </div>
      <div className={styles.body}>
        <div className={styles.list}>
          <Loading loading={loading} />

          {!loading &&
            results &&
            results.length > 0 &&
            results.map((vessel) => (
              <div
                key={vessel.mmsi}
                className={styles.resultItem}
                onClick={(e) => handleItemClick(e, vessel.mmsi)}
              >
                <div className={styles.left}>
                  <Flag
                    code={vessel.country || ""}
                    style={{ width: "27px", height: "20px" }}
                  />

                  <div className={styles.name}>{vessel.name}</div>
                </div>

                <div className={styles.type}>{vessel.type.name}</div>

                <button
                  className={styles.trackButton}
                  title="Track vessel"
                  onClick={(e) => handleClick(e, vessel)}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M7.25 0.5V2.0525C5.92998 2.21989 4.70306 2.82132 3.76219 3.76219C2.82132 4.70306 2.21989 5.92998 2.0525 7.25H0.5V8.75H2.0525C2.21989 10.07 2.82132 11.2969 3.76219 12.2378C4.70306 13.1787 5.92998 13.7801 7.25 13.9475V15.5H8.75V13.9475C10.07 13.7801 11.2969 13.1787 12.2378 12.2378C13.1787 11.2969 13.7801 10.07 13.9475 8.75H15.5V7.25H13.9475C13.7801 5.92998 13.1787 4.70306 12.2378 3.76219C11.2969 2.82132 10.07 2.21989 8.75 2.0525V0.5M7.25 3.56V5H8.75V3.5675C10.625 3.875 12.125 5.375 12.44 7.25H11V8.75H12.4325C12.125 10.625 10.625 12.125 8.75 12.44V11H7.25V12.4325C5.375 12.125 3.875 10.625 3.56 8.75H5V7.25H3.5675C3.875 5.375 5.375 3.875 7.25 3.56ZM8 7.25C7.80109 7.25 7.61032 7.32902 7.46967 7.46967C7.32902 7.61032 7.25 7.80109 7.25 8C7.25 8.19891 7.32902 8.38968 7.46967 8.53033C7.61032 8.67098 7.80109 8.75 8 8.75C8.19891 8.75 8.38968 8.67098 8.53033 8.53033C8.67098 8.38968 8.75 8.19891 8.75 8C8.75 7.80109 8.67098 7.61032 8.53033 7.46967C8.38968 7.32902 8.19891 7.25 8 7.25Z"
                      fill="white"
                    />
                  </svg>
                </button>
              </div>
            ))}

          {!loading && results && results.length === 0 && (
            <p className={styles.noresults}>No matching ships found.</p>
          )}

          {loading && (
            <div style={{ display: "flex", justifyContent: "center" }}>
              <LoadingSpinner size={20} />
            </div>
          )}
        </div>

        <button className={styles.moreButton} onClick={handleMoreClick}>
          Show More
        </button>
      </div>
    </div>
  );
};

export default SearchPopup;
