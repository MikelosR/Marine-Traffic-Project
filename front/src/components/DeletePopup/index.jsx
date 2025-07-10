import styles from "./DeletePopup.module.css";
import { motion } from "framer-motion";
import { axiosDeletePrivate } from "../../api";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../appContext";
import { useToastError } from "../../hooks";
import { LoadingSpinner } from "../../components";

// DELETE PROFILE POPUP
export default function DeletePopup({ onClose }) {
  const navigate = useNavigate();
  const { logout } = useAppContext();
  const showToast = useToastError();

  // Password visibility and input states
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPass, setConfirmPass] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Handlers
  const clearError = () => setError("");

  // Profile deletion
  const handleDelete = async (e) => {
    e.preventDefault();

    // Validation
    if (confirmPass.trim() === "") {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await axiosDeletePrivate("user", {
        params: { confirmPassword: confirmPass },
      });
      if (!response.success) throw new Error(response.error);

      // On success: logout, redirect, close popup
      logout();
      navigate("/login");
      onClose();
    } catch (err) {
      showToast(err.message);

      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleFocus = () => {
    setError("");
  };

  return (
    <motion.div
      className={styles.overlay}
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className={styles.popup}
        onClick={(e) => {
          e.stopPropagation();
        }}
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        {/* Popup header */}
        <div className={styles.popupTop}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="50"
            height="50"
            viewBox="0 0 256 256"
          >
            <path
              fill="var(--dark-red)"
              d="M233.34 190.09L145.88 38.22a20.75 20.75 0 0 0-35.76 0L22.66 190.09a19.52 19.52 0 0 0 0 19.71A20.36 20.36 0 0 0 40.54 220h174.92a20.36 20.36 0 0 0 17.86-10.2a19.52 19.52 0 0 0 .02-19.71m-6.94 15.71a12.47 12.47 0 0 1-10.94 6.2H40.54a12.47 12.47 0 0 1-10.94-6.2a11.45 11.45 0 0 1 0-11.72l87.45-151.87a12.76 12.76 0 0 1 21.9 0l87.45 151.87a11.45 11.45 0 0 1 0 11.72M124 144v-40a4 4 0 0 1 8 0v40a4 4 0 0 1-8 0m12 36a8 8 0 1 1-8-8a8 8 0 0 1 8 8"
            />
          </svg>
          <h2 className={styles.popupTitle}>Delete Profile</h2>
        </div>

        <p className={styles.popupText}>
          Are you sure you want to delete your profile?
        </p>

        {/* Form for password confirmation */}
        <form onSubmit={handleDelete} className={styles.form}>
          <div className={styles.inputWrapper}>
            <label htmlFor="confirmPass" className={styles.label}>
              PASSWORD
            </label>
            <div
              className={`${styles.inputContainer} ${error && styles.error}`}
            >
              <div className={styles.inputContainerInner}>
                <input
                  id="confirmPass"
                  name="confirmPass"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className={styles.input}
                  onChange={(e) => setConfirmPass(e.target.value)}
                  onFocus={() => clearError()}
                  value={confirmPass}
                />
                {/* Toggle password visibility */}
                <button
                  type="button"
                  className={styles.eyeButton}
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                    >
                      <path
                        fill="#fff"
                        d="M17.883 19.297A10.95 10.95 0 0 1 12 21c-5.392 0-9.878-3.88-10.818-9A11 11 0 0 1 4.52 5.935L1.394 2.808l1.414-1.414l19.799 19.798l-1.414 1.415zM5.936 7.35A8.97 8.97 0 0 0 3.223 12a9.005 9.005 0 0 0 13.201 5.838l-2.028-2.028A4.5 4.5 0 0 1 8.19 9.604zm6.978 6.978l-3.242-3.241a2.5 2.5 0 0 0 3.241 3.241m7.893 2.265l-1.431-1.431A8.9 8.9 0 0 0 20.778 12A9.005 9.005 0 0 0 9.552 5.338L7.974 3.76C9.221 3.27 10.58 3 12 3c5.392 0 9.878 3.88 10.819 9a10.95 10.95 0 0 1-2.012 4.593m-9.084-9.084Q11.86 7.5 12 7.5a4.5 4.5 0 0 1 4.492 4.778z"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                    >
                      <path
                        fill="#fff"
                        d="M12 3c5.392 0 9.878 3.88 10.819 9c-.94 5.12-5.427 9-10.819 9s-9.878-3.88-10.818-9C2.122 6.88 6.608 3 12 3m0 16a9.005 9.005 0 0 0 8.778-7a9.005 9.005 0 0 0-17.555 0A9.005 9.005 0 0 0 12 19m0-2.5a4.5 4.5 0 1 1 0-9a4.5 4.5 0 0 1 0 9m0-2a2.5 2.5 0 1 0 0-5a2.5 2.5 0 0 0 0 5"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Error message */}
          {error && <span className={styles.errorMessage}>{error}</span>}

          {/* Toggle password visibility */}
          <div className={styles.buttonsWrapper}>
            <motion.button
              className={styles.deleteButton}
              whileHover={{
                y: -2,
                transition: { duration: 0.2 },
              }}
              type="submit"
            >
              {loading ? (
                <LoadingSpinner />
              ) : (
                <>
                  <p className={styles.buttonText}>Yes, Delete Profile</p>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill="white"
                      d="M7.616 20q-.667 0-1.141-.475T6 18.386V6h-.5q-.213 0-.356-.144T5 5.499t.144-.356T5.5 5H9q0-.31.23-.54t.54-.23h4.46q.31 0 .54.23T15 5h3.5q.213 0 .356.144t.144.357t-.144.356T18.5 6H18v12.385q0 .666-.475 1.14t-1.14.475zM17 6H7v12.385q0 .269.173.442t.443.173h8.769q.269 0 .442-.173t.173-.442zm-6.692 11q.213 0 .357-.144t.143-.356v-8q0-.213-.144-.356T10.307 8t-.356.144t-.143.356v8q0 .213.144.356q.144.144.356.144m3.385 0q.213 0 .356-.144t.143-.356v-8q0-.213-.144-.356Q13.904 8 13.692 8q-.213 0-.357.144t-.143.356v8q0 .213.144.356t.357.144M7 6v13z"
                    />
                  </svg>
                </>
              )}
            </motion.button>

            <motion.button
              type="button"
              className={styles.cancelButton}
              onClick={onClose}
              whileHover={{
                y: -2,
                transition: { duration: 0.2 },
              }}
            >
              <p className={styles.buttonText}>Cancel</p>
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
