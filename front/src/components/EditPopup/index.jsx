import styles from "./EditPopup.module.css";
import { motion, AnimatePresence } from "framer-motion";
import Select from "react-select";
import { useState } from "react";
import { vesselTypeMap, countryNameToCode } from "../../utils";
import { useToastSuccess } from "../../hooks";
import editVesselSchema from "../../schemas/editVesselSchema";
import { axiosPutPrivate } from "../../api";
import { LoadingSpinner } from "../../components";

const shipTypes = Object.keys(vesselTypeMap).map((type) => ({
  value: type,
  label: type,
}));
const countryNames = Object.keys(countryNameToCode).map((name) => ({
  value: name,
  label: name,
}));

const customStyles = {
  control: (provided, state) => ({
    ...provided,
    height: 41,
    borderRadius: 10,
    borderColor: state.isFocused ? "var(--light-blue)" : "#CACACA",
    outlineColor: state.isFocused ? "var(--light-blue)" : "transparent",
    boxShadow: state.isFocused ? "0 0 0 2px var(--light-blue)" : "none",
    cursor: "pointer",
    fontSize: "1.5rem",
    textTransform: "capitalize",
    fontWeight: 500,
    letterSpacing: "1%",
    color: "#0D1B2A",
    backgroundColor: "white",
    paddingRight: "0.75rem",
    transition:
      "border-color 0.3s ease, box-shadow 0.3s ease , outline-color 0.3s ease",
  }),
  placeholder: (provided) => ({
    ...provided,
    fontWeight: 500,
    color: "#CACACA",
    letterSpacing: "1%",
  }),
  singleValue: (provided) => ({
    ...provided,
    fontWeight: 500,
    color: "#0D1B2A",
    letterSpacing: "1%",
  }),
  option: (provided, state) => ({
    ...provided,
    fontSize: "1.5rem",
    fontWeight: 500,
    letterSpacing: "1%",
    color: state.isDisabled ? "#CACACA" : "#0D1B2A",
    backgroundColor: state.isSelected
      ? "#e0f0ff"
      : state.isFocused
      ? "#f0faff"
      : "white",
    cursor: state.isDisabled ? "not-allowed" : "pointer",
  }),
  dropdownIndicator: (provided) => ({ ...provided, padding: 4 }),
  indicatorSeparator: () => null,
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

export default function EditPopup({ onClose, vessel, setReload }) {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");
  const showToast = useToastSuccess();

  const [form, setForm] = useState({
    name: vessel.name,
    type: vessel.type,
    country: vessel.country,
  });

  // joi validation
  const validateForm = () => {
    const options = { abortEarly: false };
    const { error } = editVesselSchema.validate(form, options);

    if (!error) return null;

    const errors = {};
    for (let item of error.details) {
      errors[item.path[0]] = item.message;
    }

    return errors;
  };

  // handlers
  const clearError = (field) => setErrors((prev) => ({ ...prev, [field]: "" }));

  const handleChange = ({ target: { name, value } }) =>
    setForm((prev) => ({ ...prev, [name]: value }));

  const handleSelectChange = (name) => (selected) => {
    setForm((prev) => ({ ...prev, [name]: selected?.value ?? "" }));
    clearError(name);
  };

  // const handleFocus = (e) => {
  //   const name = e.target.name;
  //   setErrors((prev) => ({ ...prev, [name]: "" }));
  // };

  // const handleFocusSelect = (name) => () => {
  //   setErrors((prev) => ({ ...prev, [name]: "" }));
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!vessel.mmsi) return;

    setError("");

    const errors = validateForm();
    setErrors(errors || {});
    if (errors) return;
    setLoading(true);

    try {
      const payload = {
        name: form.name,
        type: form.type,
        country: form.country,
      };

      const response = await axiosPutPrivate(`vessels/${vessel.mmsi}`, payload);
      if (!response.success) throw new Error(response.error);

      setReload((prev) => !prev);

      showToast("The vessel was edited successfully!");
      onClose();
    } catch (err) {
      setError(err?.message ?? "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const selectedType =
    shipTypes.find(({ value }) => value === form.type) || null;
  const selectedCountry =
    countryNames.find(({ value }) => value === form.country) || null;

  return (
    <motion.div
      className={styles.overlay}
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className={styles.popup}
        onClick={(e) => e.stopPropagation()}
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        <div className={styles.popupTop}>
          <h2>Edit</h2>

          <button
            className={styles.closeButton}
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="25"
              viewBox="0 0 16 16"
            >
              <path
                fill="var(--very-dark-blue)"
                d="m3.5 2.086l4.5 4.5l4.5-4.5L13.914 3.5L9.414 8l4.5 4.5l-1.414 1.414l-4.5-4.5l-4.5 4.5L2.086 12.5l4.5-4.5l-4.5-4.5z"
              />
            </svg>
          </button>
        </div>

        <form className={styles.popupForm} onSubmit={handleSubmit}>
          <div className={styles.formWrapper}>
            <div className={styles.formInputText}>
              <label htmlFor="name" className={styles.editLabel}>
                Name
              </label>
              <input
                type="text"
                name="name"
                id="name"
                placeholder="Name"
                value={form.name}
                onFocus={() => clearError("name")}
                onChange={handleChange}
              />
            </div>

            {errors.name && <ErrorMessage message={errors.name} />}

            <div className={styles.formInputSelect}>
              <label htmlFor="type" className={styles.editLabel}>
                Ship Type
              </label>
              <Select
                options={shipTypes}
                styles={customStyles}
                placeholder="Select type"
                isSearchable
                isClearable
                name="type"
                value={selectedType}
                onFocus={() => clearError("type")}
                onChange={handleSelectChange("type")}
              />
            </div>

            {errors.type && <ErrorMessage message={errors.type} />}

            <div className={styles.formInputSelect}>
              <label htmlFor="country" className={styles.editLabel}>
                Country
              </label>
              <Select
                options={countryNames}
                styles={customStyles}
                placeholder="Select country"
                isSearchable
                isClearable
                name="country"
                value={selectedCountry}
                onFocus={() => clearError("country")}
                onChange={handleSelectChange("country")}
              />
            </div>

            {errors.country && <ErrorMessage message={errors.country} />}
          </div>

          <div className={styles.buttonWrapper}>
            <motion.button
              className={styles.submitButton}
              type="submit"
              whileHover={{ y: -2 }}
              disabled={loading}
            >
              {loading ? (
                <LoadingSpinner />
              ) : (
                <>
                  <p>Save Changes</p>

                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="22"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill="white"
                      d="M7 19v-6h10v6h2V7.828L16.172 5H5v14zM4 3h13l4 4v13a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1m5 12v4h6v-4z"
                    />
                  </svg>
                </>
              )}
            </motion.button>

            {error && <p className={styles.errorMessage}>{error}</p>}

            <div className={styles.cancelButton} onClick={onClose}>
              <button type="button">Cancel</button>
            </div>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
