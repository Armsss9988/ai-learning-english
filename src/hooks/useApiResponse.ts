import { useState, useCallback } from "react";
import { message } from "antd";
import { ApiResponse } from "@/constants/apiCode";

interface UseApiResponseOptions {
  showSuccessMessage?: boolean;
  showErrorMessage?: boolean;
  successMessage?: string;
  errorMessage?: string;
}

interface UseApiResponseReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  errors: string[] | null;
  execute: (
    apiCall: () => Promise<{ data: ApiResponse<T> }>
  ) => Promise<T | null>;
  reset: () => void;
}

export function useApiResponse<T = unknown>(
  options: UseApiResponseOptions = {}
): UseApiResponseReturn<T> {
  const {
    showSuccessMessage = false,
    showErrorMessage = true,
    successMessage,
    errorMessage,
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[] | null>(null);

  const execute = useCallback(
    async (
      apiCall: () => Promise<{ data: ApiResponse<T> }>
    ): Promise<T | null> => {
      setLoading(true);
      setError(null);
      setErrors(null);

      try {
        const response = await apiCall();
        const apiResponse: ApiResponse<T> = response.data;

        if (apiResponse.status === "success") {
          setData(apiResponse.data || null);

          if (showSuccessMessage) {
            message.success(successMessage || apiResponse.message);
          }

          return apiResponse.data || null;
        } else {
          // Handle API error response
          const errorMsg =
            errorMessage || apiResponse.message || "An error occurred";
          setError(errorMsg);
          setErrors(apiResponse.errors || null);

          if (showErrorMessage) {
            if (apiResponse.errors && apiResponse.errors.length > 0) {
              message.error(apiResponse.errors.join(", "));
            } else {
              message.error(errorMsg);
            }
          }

          return null;
        }
      } catch (err: unknown) {
        // Handle network errors or enhanced API errors
        let errorMsg = errorMessage || "An unexpected error occurred";
        let errorsList: string[] | null = null;

        if (err && typeof err === "object" && "apiResponse" in err) {
          // Enhanced error from axios interceptor
          const enhancedError = err as { apiResponse: ApiResponse };
          errorMsg = enhancedError.apiResponse.message || errorMsg;
          errorsList = enhancedError.apiResponse.errors || null;
        } else if (err && typeof err === "object" && "response" in err) {
          // Fallback error handling
          const responseError = err as {
            response?: { data?: { message?: string } };
          };
          errorMsg = responseError.response?.data?.message || errorMsg;
        } else if (err && typeof err === "object" && "message" in err) {
          const messageError = err as { message: string };
          errorMsg = messageError.message;
        }

        setError(errorMsg);
        setErrors(errorsList);

        if (showErrorMessage) {
          if (errorsList && errorsList.length > 0) {
            message.error(errorsList.join(", "));
          } else {
            message.error(errorMsg);
          }
        }

        return null;
      } finally {
        setLoading(false);
      }
    },
    [showSuccessMessage, showErrorMessage, successMessage, errorMessage]
  );

  const reset = useCallback(() => {
    setData(null);
    setLoading(false);
    setError(null);
    setErrors(null);
  }, []);

  return {
    data,
    loading,
    error,
    errors,
    execute,
    reset,
  };
}

// Specialized hook for GET requests with pagination
export function useApiPagination<T = unknown>(
  options: UseApiResponseOptions = {}
) {
  const baseHook = useApiResponse<T[]>(options);
  const [pagination, setPagination] = useState<{
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null>(null);

  const execute = useCallback(
    async (apiCall: () => Promise<{ data: ApiResponse<T[]> }>) => {
      const response = await apiCall();

      if (response) {
        const apiResponse: ApiResponse<T[]> = response.data || response;
        if (apiResponse.meta?.pagination) {
          setPagination(apiResponse.meta.pagination);
        }
      }

      return baseHook.execute(() => Promise.resolve(response));
    },
    [baseHook]
  );

  const reset = useCallback(() => {
    baseHook.reset();
    setPagination(null);
  }, [baseHook]);

  return {
    ...baseHook,
    pagination,
    execute,
    reset,
  };
}

// Utility function to extract data from API response
export function extractApiData<T>(response: {
  data: ApiResponse<T>;
}): T | null {
  const apiResponse: ApiResponse<T> = response?.data;
  return apiResponse?.data || null;
}

// Utility function to check if response is successful
export function isApiSuccess(response: { data: ApiResponse }): boolean {
  const apiResponse: ApiResponse = response?.data;
  return apiResponse?.status === "success";
}
