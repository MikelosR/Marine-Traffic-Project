import { axiosDeletePrivate, axiosPutPrivate } from "../api";

// Handles adding/removing vessel from fleet
export default function useFleetToggle({ setReloadCallback, setLoading }) {
  const handleToggleFleet = async (e, mmsi, isInFleet) => {
    // Prevent default event behavior if event passed
    if (e?.preventDefault) {
      e.preventDefault();
      e.stopPropagation();
    }

    // Set loading state for the vessel
    if (setLoading) setLoading(mmsi);

    try {
      // Call API to add or remove vessel from fleet
      const response = isInFleet
        ? await axiosDeletePrivate(`vessel/fleet?id=${mmsi}`)
        : await axiosPutPrivate(`vessel/fleet?id=${mmsi}`);

      if (!response.success) throw new Error(response.data.error);

      // Trigger reload callback to refresh data
      if (typeof setReloadCallback === "function") {
        setReloadCallback((prev) => !prev);
      }
    } catch (err) {
      console.warn(err.message);
    } finally {
      // Clear loading state
      if (setLoading) setLoading(null);
    }
  };

  return { handleToggleFleet };
}
