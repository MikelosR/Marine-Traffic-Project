import styles from "./VesselsTable.module.css";
import { useEffect, useState } from "react";
import Flag from "react-world-flags";
import {
  Pagination,
  SearchBar,
  VesselsFilters,
  Loading,
} from "../../components";
import {
  getShipIconComponent,
  getGeneralShipCategory,
  countryNameToCode,
} from "../../utils";
import { ErrorIllustration, NoResults } from "../../assets";
import { Link, useNavigate } from "react-router-dom";
import { useAppContext } from "../../appContext";
import {
  axiosGetPublic,
  axiosGetPrivate,
  axiosPutPrivate,
  axiosDeletePrivate,
} from "../../api";
import { useFleetToggle } from "../../hooks";
import Cookies from "js-cookie";

const SortDesArrow = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
    >
      <path
        fill="var(--very-dark-blue)"
        d="M11.178 19.569a.998.998 0 0 0 1.644 0l9-13A.999.999 0 0 0 21 5H3a1.002 1.002 0 0 0-.822 1.569z"
      />
    </svg>
  );
};

const SortAscArrow = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
    >
      <path
        fill="var(--very-dark-blue)"
        d="M3 19h18a1.002 1.002 0 0 0 .823-1.569l-9-13c-.373-.539-1.271-.539-1.645 0l-9 13A.999.999 0 0 0 3 19"
      />
    </svg>
  );
};

const SortDefaultArrow = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
    >
      <path
        fill="#838A92"
        d="M3 19h18a1.002 1.002 0 0 0 .823-1.569l-9-13c-.373-.539-1.271-.539-1.645 0l-9 13A.999.999 0 0 0 3 19"
      />
    </svg>
  );
};

// highlight matching text based on search
const highlightMatch = (text, query) => {
  if (!text) return null;
  const str = text.toString();
  if (!query) return str;

  const parts = str.split(new RegExp(`(${query})`, "gi"));
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <span key={i} className={styles.highlight}>
        {part}
      </span>
    ) : (
      part
    )
  );
};

export default function VesselsTable({ isFleet = false, searchParam = "" }) {
  const { role } = useAppContext();
  const navigate = useNavigate();
  const [search, setSearch] = useState(searchParam || "");
  const [sortBy, setSortBy] = useState(null);
  const [sortAsc, setSortAsc] = useState(true);
  const [page, setPage] = useState(1);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [error, setError] = useState("");
  const [vessels, setVessels] = useState([]);
  const pageSize = 8;

  const [myFleet, setMyFleet] = useState([]);

  const [loading, setLoading] = useState(false);
  const [reload, setReload] = useState(false);

  const { handleToggleFleet } = useFleetToggle({
    setReloadCallback: setReload,
    setLoading: setLoading,
  });

  // fetch vessels
  useEffect(() => {
    const fetchVessels = async () => {
      setLoading(true);
      setError("");
      try {
        let response;
        if (Cookies.get("token")) {
          response = await axiosGetPrivate("vessels");
        } else {
          response = await axiosGetPublic("vessels");
        }

        if (!response.success) throw new Error(response.data.error);

        setVessels(response.data);
      } catch (error) {
        console.error("Error fetching vessels:", error.message);
        setError("Failed to fetch vessels");
      } finally {
        setLoading(false);
      }
    };

    const fetchFleet = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await axiosGetPrivate("fleet");
        if (!response.success) throw new Error(response.data.error);

        const data = response.data.map((vessel) => ({
          ...vessel,
          isInFleet: true,
        }));

        setMyFleet(data);
      } catch (error) {
        console.error("Error fetching vessels:", error.message);
        setError("Failed to fetch vessels");
      } finally {
        setLoading(false);
      }
    };

    if (!isFleet) {
      fetchVessels();
    } else {
      fetchFleet();
    }
  }, [isFleet, reload]);

  // reset page on filter/search change
  useEffect(() => {
    setPage(1);
  }, [search, selectedCategories]);

  // handle sort
  const handleSort = (key) => {
    if (sortBy === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortBy(key);
      setSortAsc(true);
    }
  };

  const currentVessels = isFleet ? myFleet : vessels;

  // filter data based on search query, sort and filters
  const filteredData = currentVessels
    .filter((v) => {
      const searchTerm = search.toLowerCase();
      return (
        (v.name?.toLowerCase() || "").includes(searchTerm) ||
        (v.country?.toLowerCase() || "").includes(searchTerm) ||
        (v.mmsi?.toString() || "").includes(searchTerm) ||
        (v.type?.toLowerCase() || "").includes(searchTerm)
      );
    })

    .sort((a, b) => {
      if (!sortBy) return 0;

      const valA = a[sortBy];
      const valB = b[sortBy];
      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    })

    .filter((v) => {
      if (selectedCategories.length === 0) return true;
      const generalCategory = getGeneralShipCategory(v?.type);
      return selectedCategories.includes(generalCategory);
    });

  // pagination logic
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = filteredData.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  return (
    <div className={styles.vesselsWrapper}>
      <div className={styles.vesselsHead}>
        <h1 className={styles.vesselsTitle}>
          {isFleet ? "My Fleet" : "Vessels"}
        </h1>
        <div className={styles.vesselsTools}>
          <SearchBar
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <VesselsFilters
            setSelectedCategories={setSelectedCategories}
            selectedCategories={selectedCategories}
          />

          {(role === "USER" || role === "ADMIN") && (
            <Link
              to="/my-fleet"
              className={`${isFleet && styles.fleetActive} ${
                styles.fleetButton
              }`}
            >
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
            </Link>
          )}
        </div>
      </div>

      <div className={styles.vesselsBodyWrapper}>
        <table className={styles.vesselsTable}>
          <thead>
            <tr>
              <th className={styles.colName} onClick={() => handleSort("name")}>
                <span>
                  <p>Vessel Name</p>
                  {sortBy === "name" ? (
                    sortAsc ? (
                      <SortAscArrow />
                    ) : (
                      <SortDesArrow />
                    )
                  ) : (
                    <SortDefaultArrow />
                  )}
                </span>
              </th>
              <th
                className={styles.colCountry}
                onClick={() => handleSort("country")}
              >
                <span>
                  <p>Country</p>
                  {sortBy === "country" ? (
                    sortAsc ? (
                      <SortAscArrow />
                    ) : (
                      <SortDesArrow />
                    )
                  ) : (
                    <SortDefaultArrow />
                  )}
                </span>
              </th>
              <th className={styles.colMMSI} onClick={() => handleSort("mmsi")}>
                <span>
                  <p>MMSI</p>
                  {sortBy === "mmsi" ? (
                    sortAsc ? (
                      <SortAscArrow />
                    ) : (
                      <SortDesArrow />
                    )
                  ) : (
                    <SortDefaultArrow />
                  )}
                </span>
              </th>
              <th className={styles.colType} onClick={() => handleSort("type")}>
                <span>
                  <p>Type</p>
                  {sortBy === "type" ? (
                    sortAsc ? (
                      <SortAscArrow />
                    ) : (
                      <SortDesArrow />
                    )
                  ) : (
                    <SortDefaultArrow />
                  )}
                </span>
              </th>
              <th className={styles.colButton}>{/* Button column */}</th>
            </tr>
          </thead>

          {paginatedData.length > 0 && !loading && !error && (
            <tbody>
              {paginatedData.map((vessel) => (
                <tr
                  key={vessel?.mmsi}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/ships/${vessel?.mmsi}`);
                  }}
                >
                  <td>
                    <p className={styles.vesselName}>
                      {highlightMatch(vessel?.name, search)}
                    </p>
                  </td>
                  <td>
                    <span className={styles.countryWrapper}>
                      <Flag
                        code={countryNameToCode[vessel?.country]}
                        style={{ width: "45px" }}
                      />
                      <p>{highlightMatch(vessel?.country, search)}</p>
                    </span>
                  </td>
                  <td>
                    <p className={styles.vesselMMSI}>
                      {highlightMatch(vessel?.mmsi?.toString(), search)}
                    </p>
                  </td>
                  <td>
                    <span className={styles.typeWrapper}>
                      {(() => {
                        const IconComponent = getShipIconComponent(
                          vessel.type || "unknown"
                        );
                        return <IconComponent />;
                      })()}
                      <p style={{ textTransform: "capitalize" }}>
                        {highlightMatch(vessel?.type, search)}
                      </p>
                    </span>
                  </td>

                  <td>
                    <span className={styles.vesselsButtonWrapper}>
                      <Link
                        to={`/past-track/${vessel?.mmsi}`}
                        className={styles.pastTrackButton}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <p>Past Track</p>
                      </Link>

                      {(role === "USER" || role === "ADMIN") &&
                        (vessel?.isInFleet ? (
                          <button
                            className={styles.addFleetButtonActive}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleFleet(
                                e,
                                vessel?.mmsi,
                                vessel?.isInFleet
                              );
                            }}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="22"
                              viewBox="0 0 24 24"
                            >
                              <path
                                fill="#ED2436"
                                stroke="#ED2436"
                                strokeLinejoin="round"
                                strokeWidth="1.5"
                                d="M22 8.862a5.95 5.95 0 0 1-1.654 4.13c-2.441 2.531-4.809 5.17-7.34 7.608c-.581.55-1.502.53-2.057-.045l-7.295-7.562c-2.205-2.286-2.205-5.976 0-8.261a5.58 5.58 0 0 1 8.08 0l.266.274l.265-.274A5.6 5.6 0 0 1 16.305 3c1.52 0 2.973.624 4.04 1.732A5.95 5.95 0 0 1 22 8.862Z"
                              />
                            </svg>
                          </button>
                        ) : (
                          <button
                            className={styles.addFleetButton}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleFleet(
                                e,
                                vessel?.mmsi,
                                vessel?.isInFleet
                              );
                            }}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="18"
                              viewBox="0 0 24 24"
                            >
                              <path
                                fill="none"
                                stroke="var(--light-blue)"
                                strokeLinejoin="round"
                                strokeWidth="1.5"
                                d="M22 8.862a5.95 5.95 0 0 1-1.654 4.13c-2.441 2.531-4.809 5.17-7.34 7.608c-.581.55-1.502.53-2.057-.045l-7.295-7.562c-2.205-2.286-2.205-5.976 0-8.261a5.58 5.58 0 0 1 8.08 0l.266.274l.265-.274A5.6 5.6 0 0 1 16.305 3c1.52 0 2.973.624 4.04 1.732A5.95 5.95 0 0 1 22 8.862Z"
                              />
                            </svg>
                            <p>My Fleet</p>
                          </button>
                        ))}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          )}

          <Loading loading={loading} />
        </table>

        {paginatedData.length === 0 && !loading && !error && (
          <div className={styles.noResultsWrapper}>
            <img src={NoResults} width={350} />
            <p>No Results Found...</p>
          </div>
        )}

        {/* ERROR  */}
        {error.trim() !== "" && !loading && (
          <div className={styles.noResultsWrapper}>
            <img src={ErrorIllustration} width={350} />
            <p>{error}</p>
          </div>
        )}

        {/* PAGINATION  */}
        {paginatedData.length > 0 && !loading && (
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        )}
      </div>
    </div>
  );
}
