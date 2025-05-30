import axios from "axios";
import { ApiResponse } from "@/constants/apiCode";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    // Extract data from standardized API response
    const apiResponse: ApiResponse = response.data;

    // For successful responses, return the standardized format
    if (apiResponse.status === "success") {
      // Keep the full response structure but also attach data to response.data for backward compatibility
      response.data = apiResponse;
      return response;
    }

    return response;
  },
  (error) => {
    // Handle error responses with new format
    if (error.response?.data) {
      const apiError: ApiResponse = error.response.data;

      // Create a more informative error object
      const enhancedError = {
        ...error,
        apiResponse: apiError,
        message: apiError.message || error.message,
        code: apiError.code,
        errors: apiError.errors,
      };

      // Only redirect on 401 if it's not a login/register request
      if (
        error.response?.status === 401 &&
        !error.config?.url?.includes("/auth/login") &&
        !error.config?.url?.includes("/auth/register")
      ) {
        // Handle unauthorized access for protected routes only
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }

      return Promise.reject(enhancedError);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
