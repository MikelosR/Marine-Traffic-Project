import styles from "./ResetPopup.module.css";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import resetPasswordSchema from "../../schemas/resetPasswordSchema";
import { useToastSuccess, useToastError } from "../../hooks";
import { axiosPostPrivate } from "../../api";
import { LoadingSpinner } from "../../components";

const PasswordInput = ({
  placeholder,
  label,
  name,
  onChange,
  value,
  hasError,
  onFocus,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <div className={styles.inputWrapper}>
      <label htmlFor={name} className={styles.label}>
        {label}
      </label>
      <div className={`${styles.inputContainer} ${hasError && styles.error}`}>
        <div className={styles.inputContainerInner}>
          <input
            id={name}
            name={name}
            type={showPassword ? "text" : "password"}
            placeholder={placeholder}
            className={styles.input}
            onChange={onChange}
            onFocus={onFocus}
            value={value}
          />
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
  );
};

const ErrorMessage = ({ message }) => {
  return (
    <AnimatePresence>
      {message && (
        <motion.span
          className={styles.errorMessage}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {message}
        </motion.span>
      )}
    </AnimatePresence>
  );
};

export default function ResetPopup({ onClose }) {
  const [form, setForm] = useState({
    oldPass: "",
    newPass: "",
    confirmNewPass: "",
  });
  const [errors, setErrors] = useState({});
  const showToast = useToastSuccess("Your password was reset successfully!");
  const showToastError = useToastError();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // joi validation
  const validateForm = () => {
    const options = { abortEarly: false };
    const { error } = resetPasswordSchema.validate(form, options);

    if (!error) return null;

    const errors = {};
    for (let item of error.details) {
      errors[item.path[0]] = item.message;
    }

    return errors;
  };

  const handleFocus = (e) => {
    const name = e.target.name;
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleChange = (e) => {
    const name = e.target.name;
    const value = e.target.value;

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // helper function to check password requirements
  const checkPasswordStrength = (password) => {
    const minLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);

    return { minLength, hasUpperCase, hasLowerCase, hasNumber };
  };

  const { minLength, hasUpperCase, hasLowerCase, hasNumber } =
    checkPasswordStrength(form.newPass);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    const errors = validateForm();
    setErrors(errors || {});
    if (errors) return;
    setLoading(true);
    try {
      const payload = {
        currentPassword: form.oldPass,
        newPassword: form.newPass,
      };

      const response = await axiosPostPrivate("reset-password", payload);
      if (!response.success) throw new Error(response.error);

      if (response.status !== 200) {
        setError(response.data || "An error occurred");
        setLoading(false);
        return;
      }
      showToast(response.data);
      onClose();
    } catch (err) {
      setError(err.message);
      showToastError(err.message);
      onClose();
    } finally {
      setLoading(false);
    }
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
        <div className={styles.popupTop}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="50"
            height="50"
            viewBox="0 0 24 24"
          >
            <g
              fill="none"
              stroke="#fff"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              color="currentColor"
            >
              <path d="M21.5 12A9.5 9.5 0 1 1 12 2.5a9.5 9.5 0 0 1 8.71 5.7m.79-2.7l-.475 3.175L18 8" />
              <path d="M10 11V9.5a2 2 0 1 1 4 0V11m-2.75 5.5h1.5c1.173 0 1.76 0 2.163-.31a1.5 1.5 0 0 0 .277-.277c.31-.404.31-.99.31-2.163s0-1.76-.31-2.163a1.5 1.5 0 0 0-.277-.277c-.404-.31-.99-.31-2.163-.31h-1.5c-1.173 0-1.76 0-2.163.31a1.5 1.5 0 0 0-.277.277c-.31.404-.31.99-.31 2.163s0 1.76.31 2.163a1.5 1.5 0 0 0 .277.277c.404.31.99.31 2.163.31" />
            </g>
          </svg>

          <h2 className={styles.popupTitle}>Reset Password</h2>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.topFormWrapper}>
            <div className={styles.resetForm}>
              <PasswordInput
                label="CURRENT PASSWORD"
                name="oldPass"
                placeholder="Enter your password"
                onChange={handleChange}
                value={form.oldPass}
                hasError={errors.oldPass}
                onFocus={handleFocus}
              />
              {errors.oldPass && <ErrorMessage message={errors.oldPass} />}

              <PasswordInput
                label="NEW PASSWORD"
                name="newPass"
                placeholder="Enter a new password"
                onChange={handleChange}
                value={form.newPass}
                hasError={errors.newPass}
                onFocus={handleFocus}
              />
              {errors.newPass && <ErrorMessage message={errors.newPass} />}

              <PasswordInput
                label="CONFIRM NEW PASSWORD"
                name="confirmNewPass"
                placeholder="Confirm your new password"
                onChange={handleChange}
                value={form.confirmNewPass}
                hasError={errors.confirmNewPass}
                onFocus={handleFocus}
              />

              {errors.confirmNewPass && (
                <span className={styles.errorMessage}>
                  {errors.confirmNewPass}
                </span>
              )}
            </div>

            <div className={styles.resetWarnings}>
              <p className={styles.warnignsTop}>Your password must have:</p>

              <ul className={styles.warningsList}>
                <li
                  className={
                    form.newPass && !minLength ? styles.warningError : ""
                  }
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill="var(--white-transparent2)"
                      d="M4 12a8 8 0 1 1 16 0a8 8 0 0 1-16 0m8-10C6.477 2 2 6.477 2 12s4.477 10 10 10s10-4.477 10-10S17.523 2 12 2m5.457 7.457l-1.414-1.414L11 13.086l-2.793-2.793l-1.414 1.414L11 15.914z"
                    />
                  </svg>

                  <p className={styles.warningsText}>At least 8 characters.</p>
                </li>

                <li
                  className={
                    form.newPass && (!hasLowerCase || !hasUpperCase)
                      ? styles.warningError
                      : undefined
                  }
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill="var(--white-transparent2)"
                      d="M4 12a8 8 0 1 1 16 0a8 8 0 0 1-16 0m8-10C6.477 2 2 6.477 2 12s4.477 10 10 10s10-4.477 10-10S17.523 2 12 2m5.457 7.457l-1.414-1.414L11 13.086l-2.793-2.793l-1.414 1.414L11 15.914z"
                    />
                  </svg>

                  <p className={styles.warningsText}>
                    Upper and lowercase letters.
                  </p>
                </li>

                <li
                  className={
                    form.newPass && !hasNumber ? styles.warningError : undefined
                  }
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill="var(--white-transparent2)"
                      d="M4 12a8 8 0 1 1 16 0a8 8 0 0 1-16 0m8-10C6.477 2 2 6.477 2 12s4.477 10 10 10s10-4.477 10-10S17.523 2 12 2m5.457 7.457l-1.414-1.414L11 13.086l-2.793-2.793l-1.414 1.414L11 15.914z"
                    />
                  </svg>

                  <p className={styles.warningsText}>At least one number.</p>
                </li>
              </ul>
            </div>
          </div>

          {error && <p className={styles.errorMessage}>{error}</p>}

          <div className={styles.buttonsWrapper}>
            <motion.button
              className={styles.resetButton}
              type="submit"
              whileHover={{
                y: -2,
                transition: { duration: 0.2 },
              }}
            >
              {loading ? (
                <LoadingSpinner />
              ) : (
                <p className={styles.buttonText}>Reset Password</p>
              )}
            </motion.button>

            <motion.button
              className={styles.cancelButton}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
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
