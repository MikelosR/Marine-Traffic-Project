import privateAxios from "../network/privateAxios";

// DELETE request to a private API route
export const axiosDeletePrivate = async (url, config = {}) => {
  try {
    const response = await privateAxios.delete(`/api/${url}`, config);
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

    console.error(`DELETE /api/${url} failed:`, message);

    return {
      success: false,
      error: message,
      status,
    };
  }
};
