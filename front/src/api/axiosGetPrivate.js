import privateAxios from "../network/privateAxios";

// GET request to a private API route
export const axiosGetPrivate = async (url) => {
  try {
    const response = await privateAxios.get(`/api/${url}`);
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
