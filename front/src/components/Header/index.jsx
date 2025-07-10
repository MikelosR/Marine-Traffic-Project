import styles from "./Header.module.css";
import { Logo } from "../../assets";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import {
  DeletePopup,
  ResetPopup,
  NotificationDropdown,
  LoadingSpinner,
} from "../../components";
import { Link, useNavigate } from "react-router-dom";
import { useAppContext } from "../../appContext";
import { axiosGetPrivate } from "../../api";
import { useOutsideClick } from "../../hooks";

const GuestHeader = () => {
  const navigate = useNavigate();

  return (
    <header className={styles.headerWrapper}>
      <Link to="/">
        <img src={Logo} alt="Logo" height={43} />
      </Link>

      <div className={styles.guestButtonsWrapper}>
        {/* SIGN IN BUTTON */}
        <motion.button
          onClick={() => navigate("/login")}
          className={styles.guestButton}
          whileHover={{
            y: -2,
            transition: { duration: 0.2 },
          }}
        >
          <p className={styles.guestButtonsText}>Sign In</p>

          <svg
            className={styles.guestButtonIcon}
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
          >
            <path
              fill="#fff"
              d="M4 15h2v5h12V4H6v5H4V3a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1zm6-4V8l5 4l-5 4v-3H2v-2z"
            />
          </svg>
        </motion.button>

        {/* SIGN UP BUTTON */}
        <motion.button
          onClick={() => navigate("/login")}
          className={styles.guestButton}
          whileHover={{
            y: -2,
            transition: { duration: 0.2 },
          }}
        >
          <p className={styles.guestButtonsText}>Sign Up</p>

          <svg
            className={styles.guestButtonIcon}
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
          >
            <path
              fill="#fff"
              d="M6.414 15.89L16.556 5.748l-1.414-1.414L5 14.476v1.414zm.829 2H3v-4.243L14.435 2.212a1 1 0 0 1 1.414 0l2.829 2.829a1 1 0 0 1 0 1.414zM3 19.89h18v2H3z"
            />
          </svg>
        </motion.button>
      </div>
    </header>
  );
};

const UserHeader = ({ user, loading, error }) => {
  const { logout } = useAppContext();
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [showResetPopup, setShowResetPopup] = useState(false);
  const popupRef = useRef(null);

  useOutsideClick(popupRef, () => {
    setShowPopup(false);
  });

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowPopup((prev) => !prev);
  };

  return (
    <header className={styles.headerWrapper}>
      <Link to="/">
        <img src={Logo} alt="Logo" height={43} />
      </Link>

      <div className={styles.rightWrapper}>
        <div className={styles.userWrapper}>
          {!loading && !error && (
            <div className={styles.userInfoWrapper} onClick={handleClick}>
              <p className={styles.userName}>
                {user?.firstName || "Name"} {user?.lastName || "Surname"}
              </p>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="42"
                height="42"
                viewBox="0 0 32 32"
              >
                <path
                  fill="none"
                  d="M8.007 24.93A4.996 4.996 0 0 1 13 20h6a4.996 4.996 0 0 1 4.993 4.93a11.94 11.94 0 0 1-15.986 0M20.5 12.5A4.5 4.5 0 1 1 16 8a4.5 4.5 0 0 1 4.5 4.5"
                />
                <path
                  fill="var(--link-color)"
                  d="M26.749 24.93A13.99 13.99 0 1 0 2 16a13.9 13.9 0 0 0 3.251 8.93l-.02.017c.07.084.15.156.222.239c.09.103.187.2.28.3q.418.457.87.87q.14.124.28.242q.48.415.99.782c.044.03.084.069.128.1v-.012a13.9 13.9 0 0 0 16 0v.012c.044-.031.083-.07.128-.1q.51-.368.99-.782q.14-.119.28-.242q.451-.413.87-.87c.093-.1.189-.197.28-.3c.071-.083.152-.155.222-.24ZM16 8a4.5 4.5 0 1 1-4.5 4.5A4.5 4.5 0 0 1 16 8M8.007 24.93A4.996 4.996 0 0 1 13 20h6a4.996 4.996 0 0 1 4.993 4.93a11.94 11.94 0 0 1-15.986 0"
                />
              </svg>

              {/* USER PROFILE POPUP */}
              <AnimatePresence>
                {showPopup && (
                  <motion.div
                    ref={popupRef}
                    className={styles.popup}
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* USER INFO */}
                    <div className={styles.popupInfo}>
                      <p className={styles.popupLabel}>
                        <span className={styles.bolder}>NAME: </span>
                        {user?.firstName || "Name"}{" "}
                        {user?.lastName || "Surname"}
                      </p>
                      <p className={styles.popupLabel}>
                        <span className={styles.bolder}>EMAIL: </span>
                        {user?.email || "someone@email.com"}
                      </p>
                    </div>

                    <div className={styles.popupMainButtons}>
                      {/* RESET PASSWORD */}
                      <button
                        className={styles.resetButton}
                        onClick={(e) => {
                          e.preventDefault();
                          setShowResetPopup(true);
                        }}
                      >
                        <p className={styles.mainButtonText}>Reset Password</p>
                      </button>

                      {/* DELETE PROFILE */}
                      <button
                        className={styles.deleteButton}
                        onClick={(e) => {
                          e.preventDefault();
                          setShowDeletePopup(true);
                        }}
                      >
                        <p className={styles.mainButtonText}>Delete Profile</p>
                      </button>
                    </div>

                    {/* SIGN OUT BUTTON */}
                    <motion.button
                      onClick={(e) => {
                        e.stopPropagation();
                        logout();
                        navigate("/login");
                      }}
                      className={styles.signOutButton}
                      whileHover={{
                        scale: 1.02,
                        transition: { duration: 0.2 },
                      }}
                    >
                      <p className={styles.signOutButtonText}>Sign Out</p>

                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                      >
                        <path
                          fill="#fff"
                          d="M5 22a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v3h-2V4H6v16h12v-2h2v3a1 1 0 0 1-1 1zm13-6v-3h-7v-2h7V8l5 4z"
                        />
                      </svg>
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {showDeletePopup && (
                  <DeletePopup onClose={() => setShowDeletePopup(false)} />
                )}
              </AnimatePresence>

              <AnimatePresence>
                {showResetPopup && (
                  <ResetPopup onClose={() => setShowResetPopup(false)} />
                )}
              </AnimatePresence>
            </div>
          )}

          {loading && <LoadingSpinner size={24} />}

          {error && !loading && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="26"
              height="26"
              viewBox="0 0 24 24"
            >
              <path
                fill="var(--red)"
                d="M12 17q.425 0 .713-.288T13 16t-.288-.712T12 15t-.712.288T11 16t.288.713T12 17m0-4q.425 0 .713-.288T13 12V8q0-.425-.288-.712T12 7t-.712.288T11 8v4q0 .425.288.713T12 13m0 9q-2.075 0-3.9-.788t-3.175-2.137T2.788 15.9T2 12t.788-3.9t2.137-3.175T8.1 2.788T12 2t3.9.788t3.175 2.137T21.213 8.1T22 12t-.788 3.9t-2.137 3.175t-3.175 2.138T12 22"
              />
            </svg>
          )}
        </div>

        <NotificationDropdown user={user} />
      </div>
    </header>
  );
};

const AdminHeader = ({ user, error, loading }) => {
  const { logout } = useAppContext();
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(false);
  const [showResetPopup, setShowResetPopup] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const popupRef = useRef(null);

  // handle outside click
  useOutsideClick(popupRef, () => {
    setShowPopup(false);
  });

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowPopup((prev) => !prev);
  };

  return (
    <header className={styles.headerWrapper}>
      <Link to="/">
        <img src={Logo} alt="Logo" height={43} />
      </Link>

      <div className={styles.rightWrapper}>
        <div className={styles.userWrapper}>
          {!loading && !error && (
            <div className={styles.adminWrapper} onClick={handleClick}>
              <div className={styles.adminInfo}>
                <p className={styles.adminLabel}>ADMIN</p>

                <p className={styles.adminName}>
                  {user?.firstName || "Name"} {user?.lastName || "Surname"}
                </p>
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="42"
                height="42"
                viewBox="0 0 32 32"
              >
                <path
                  fill="none"
                  d="M8.007 24.93A4.996 4.996 0 0 1 13 20h6a4.996 4.996 0 0 1 4.993 4.93a11.94 11.94 0 0 1-15.986 0M20.5 12.5A4.5 4.5 0 1 1 16 8a4.5 4.5 0 0 1 4.5 4.5"
                />
                <path
                  fill="var(--link-color)"
                  d="M26.749 24.93A13.99 13.99 0 1 0 2 16a13.9 13.9 0 0 0 3.251 8.93l-.02.017c.07.084.15.156.222.239c.09.103.187.2.28.3q.418.457.87.87q.14.124.28.242q.48.415.99.782c.044.03.084.069.128.1v-.012a13.9 13.9 0 0 0 16 0v.012c.044-.031.083-.07.128-.1q.51-.368.99-.782q.14-.119.28-.242q.451-.413.87-.87c.093-.1.189-.197.28-.3c.071-.083.152-.155.222-.24ZM16 8a4.5 4.5 0 1 1-4.5 4.5A4.5 4.5 0 0 1 16 8M8.007 24.93A4.996 4.996 0 0 1 13 20h6a4.996 4.996 0 0 1 4.993 4.93a11.94 11.94 0 0 1-15.986 0"
                />
              </svg>

              {/* USER PROFILE POPUP */}
              <AnimatePresence>
                {showPopup && (
                  <motion.div
                    ref={popupRef}
                    className={styles.popup}
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* USER INFO */}
                    <div className={styles.popupInfo}>
                      <p className={styles.popupLabel}>
                        <span className={styles.bolder}>NAME: </span>
                        {user?.firstName || "Name"}{" "}
                        {user?.lastName || "Surname"}
                      </p>
                      <p className={styles.popupLabel}>
                        <span className={styles.bolder}>EMAIL: </span>
                        {user?.email || "admin@email.com"}
                      </p>
                    </div>

                    <div className={styles.popupMainButtons}>
                      {/* RESET PASSWORD */}
                      <button
                        className={styles.resetButton}
                        onClick={(e) => {
                          e.preventDefault();
                          setShowResetPopup(true);
                        }}
                      >
                        <p className={styles.mainButtonText}>Reset Password</p>
                      </button>

                      {/* DELETE PROFILE */}
                      <button
                        className={styles.deleteButton}
                        onClick={(e) => {
                          e.preventDefault();
                          setShowDeletePopup(true);
                        }}
                      >
                        <p className={styles.mainButtonText}>Delete Profile</p>
                      </button>
                    </div>

                    {/* SIGN OUT BUTTON */}
                    <motion.button
                      onClick={(e) => {
                        e.stopPropagation();
                        logout();
                        navigate("/login");
                      }}
                      className={styles.signOutButton}
                      whileHover={{
                        scale: 1.02,
                        transition: { duration: 0.2 },
                      }}
                    >
                      <p className={styles.signOutButtonText}>Sign Out</p>

                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                      >
                        <path
                          fill="#fff"
                          d="M5 22a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v3h-2V4H6v16h12v-2h2v3a1 1 0 0 1-1 1zm13-6v-3h-7v-2h7V8l5 4z"
                        />
                      </svg>
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {showDeletePopup && (
                  <DeletePopup onClose={() => setShowDeletePopup(false)} />
                )}
              </AnimatePresence>

              <AnimatePresence>
                {showResetPopup && (
                  <ResetPopup onClose={() => setShowResetPopup(false)} />
                )}
              </AnimatePresence>
            </div>
          )}

          {loading && <LoadingSpinner size={24} />}

          {error && !loading && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="26"
              height="26"
              viewBox="0 0 24 24"
            >
              <path
                fill="var(--red)"
                d="M12 17q.425 0 .713-.288T13 16t-.288-.712T12 15t-.712.288T11 16t.288.713T12 17m0-4q.425 0 .713-.288T13 12V8q0-.425-.288-.712T12 7t-.712.288T11 8v4q0 .425.288.713T12 13m0 9q-2.075 0-3.9-.788t-3.175-2.137T2.788 15.9T2 12t.788-3.9t2.137-3.175T8.1 2.788T12 2t3.9.788t3.175 2.137T21.213 8.1T22 12t-.788 3.9t-2.137 3.175t-3.175 2.138T12 22"
              />
            </svg>
          )}
        </div>

        <NotificationDropdown user={user} />
      </div>
    </header>
  );
};

export default function Header() {
  const { role } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      if (role === "ADMIN" || role === "USER") {
        setLoading(true);
        setError(false);
        try {
          const response = await axiosGetPrivate("user/me");
          if (!response.success) throw new Error(response.data.error);

          setUser(response.data);
        } catch (err) {
          console.error(err);
          setError(true);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUser();
  }, []);

  return (
    <>
      {role === "ADMIN" ? (
        <AdminHeader user={user} loading={loading} error={error} />
      ) : role === "USER" ? (
        <UserHeader user={user} loading={loading} error={error} />
      ) : (
        <GuestHeader />
      )}
    </>
  );
}
