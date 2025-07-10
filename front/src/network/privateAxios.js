import axios from "axios"
import Cookies from "js-cookie"

// Private API client (auth)
const apiUrl = "http://localhost:8080"

// Create axios instance with base URL
const privateAxios = axios.create({
  baseURL: apiUrl,
})

// Attach auth token if role is valid
privateAxios.interceptors.request.use((config) => {
  const role = Cookies.get("role") || null
  const accessToken = Cookies.get("token") || null

  // Validate role and token presence
  const roleInvalid = role !== "ADMIN" && role !== "USER"
  if (!accessToken || roleInvalid) throw new Error("No valid auth token or role provided.")

  config.headers["Authorization"] = `Bearer ${accessToken}`
  return config
})


// Handle auth-related errors globally
privateAxios.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status
    if (status === 401 || status === 403) {
      console.error("Unauthorized: Token may be invalid or expired.")
      Cookies.remove("token")
      Cookies.remove("role")
      window.location.href = "/login"
    }
    throw error
  }
)

export default privateAxios
