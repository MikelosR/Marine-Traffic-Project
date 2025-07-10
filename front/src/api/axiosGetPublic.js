import publicAxios from "../network/publicAxios";

// GET request to a public API route
export const axiosGetPublic = async (url) => {
  try {
    const response = await publicAxios.get(`/api/${url}`);
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

    console.error(`GET /api/${url} failed:`, message);

    return {
      success: false,
      error: message,
      status,
    };
  }
};
