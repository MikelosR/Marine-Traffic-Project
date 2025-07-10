import publicAxios from "../network/publicAxios";

// POST request to a public API route
export const axiosPostPublic = async (url, payload) => {
  try {
    const response = await publicAxios.post(`/api/${url}`, payload);
    return {
      success: true,
      data: response.data,
      status: response.status,
    };
  } catch (error) {
    const status = error.response?.status ?? null;
    const rawMessage = error.response?.data;
    const message =
      typeof rawMessage === "string"
        ? rawMessage
        : error.message || "Unknown error";

    console.error(`POST /api/${url} failed:`, message);

    return {
      success: false,
      error: message,
      status,
    };
  }
};
