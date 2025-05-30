import { NextResponse } from "next/server";
import {
  ApiResponse,
  ApiStatus,
  ApiCode,
  API_STATUS,
  API_CODE,
  API_MESSAGE,
  PaginationMeta,
} from "@/constants/apiCode";

// Generate unique request ID
const generateRequestId = (): string => {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Base response creator
const createResponse = <T = unknown>(
  status: ApiStatus,
  message: string,
  code: ApiCode,
  data?: T,
  errors?: string[],
  pagination?: PaginationMeta
): ApiResponse<T> => {
  const response: ApiResponse<T> = {
    status,
    message,
    code,
    meta: {
      timestamp: new Date().toISOString(),
      requestId: generateRequestId(),
    },
  };

  if (data !== undefined) {
    response.data = data;
  }

  if (errors && errors.length > 0) {
    response.errors = errors;
  }

  if (pagination) {
    response.meta!.pagination = {
      page: pagination.page,
      limit: pagination.limit,
      total: pagination.total,
      totalPages: pagination.totalPages,
    };
  }

  return response;
};

// Success response creators
export const ApiSuccess = {
  // Generic success
  ok: <T = unknown>(data?: T, message: string = API_MESSAGE.SUCCESS) => {
    return NextResponse.json(
      createResponse(API_STATUS.SUCCESS, message, API_CODE.SUCCESS, data),
      { status: 200 }
    );
  },

  // Created resource
  created: <T = unknown>(data?: T, message: string = API_MESSAGE.CREATED) => {
    return NextResponse.json(
      createResponse(API_STATUS.SUCCESS, message, API_CODE.CREATED, data),
      { status: 201 }
    );
  },

  // No content
  noContent: (message: string = "No content") => {
    return NextResponse.json(
      createResponse(API_STATUS.SUCCESS, message, API_CODE.NO_CONTENT),
      { status: 204 }
    );
  },

  // Login success
  login: <T = unknown>(
    data: T,
    message: string = API_MESSAGE.LOGIN_SUCCESS
  ) => {
    return NextResponse.json(
      createResponse(API_STATUS.SUCCESS, message, API_CODE.SUCCESS, data),
      { status: 200 }
    );
  },

  // Registration success
  register: <T = unknown>(
    data: T,
    message: string = API_MESSAGE.REGISTER_SUCCESS
  ) => {
    return NextResponse.json(
      createResponse(API_STATUS.SUCCESS, message, API_CODE.CREATED, data),
      { status: 201 }
    );
  },

  // With pagination
  withPagination: <T = unknown>(
    data: T[],
    pagination: PaginationMeta,
    message: string = API_MESSAGE.SUCCESS
  ) => {
    return NextResponse.json(
      createResponse(
        API_STATUS.SUCCESS,
        message,
        API_CODE.SUCCESS,
        data,
        undefined,
        pagination
      ),
      { status: 200 }
    );
  },
};

// Error response creators
export const ApiError = {
  // Bad request
  badRequest: (
    message: string = API_MESSAGE.BAD_REQUEST,
    errors?: string[]
  ) => {
    return NextResponse.json(
      createResponse(
        API_STATUS.ERROR,
        message,
        API_CODE.BAD_REQUEST,
        undefined,
        errors
      ),
      { status: 400 }
    );
  },

  // Unauthorized
  unauthorized: (message: string = API_MESSAGE.UNAUTHORIZED) => {
    return NextResponse.json(
      createResponse(API_STATUS.ERROR, message, API_CODE.UNAUTHORIZED),
      { status: 401 }
    );
  },

  // Forbidden
  forbidden: (message: string = API_MESSAGE.FORBIDDEN) => {
    return NextResponse.json(
      createResponse(API_STATUS.ERROR, message, API_CODE.FORBIDDEN),
      { status: 403 }
    );
  },

  // Not found
  notFound: (message: string = API_MESSAGE.NOT_FOUND) => {
    return NextResponse.json(
      createResponse(API_STATUS.ERROR, message, API_CODE.NOT_FOUND),
      { status: 404 }
    );
  },

  // Method not allowed
  methodNotAllowed: (message: string = API_MESSAGE.METHOD_NOT_ALLOWED) => {
    return NextResponse.json(
      createResponse(API_STATUS.ERROR, message, API_CODE.METHOD_NOT_ALLOWED),
      { status: 405 }
    );
  },

  // Validation error
  validation: (
    message: string = API_MESSAGE.VALIDATION_ERROR,
    errors?: string[]
  ) => {
    return NextResponse.json(
      createResponse(
        API_STATUS.ERROR,
        message,
        API_CODE.VALIDATION_ERROR,
        undefined,
        errors
      ),
      { status: 422 }
    );
  },

  // Too many requests
  tooManyRequests: (message: string = API_MESSAGE.TOO_MANY_REQUESTS) => {
    return NextResponse.json(
      createResponse(API_STATUS.ERROR, message, API_CODE.TOO_MANY_REQUESTS),
      { status: 429 }
    );
  },

  // Internal server error
  internal: (
    message: string = API_MESSAGE.INTERNAL_SERVER_ERROR,
    error?: unknown
  ) => {
    console.error("Internal Server Error:", error);
    return NextResponse.json(
      createResponse(API_STATUS.ERROR, message, API_CODE.INTERNAL_SERVER_ERROR),
      { status: 500 }
    );
  },

  // Service unavailable
  serviceUnavailable: (message: string = API_MESSAGE.SERVICE_UNAVAILABLE) => {
    return NextResponse.json(
      createResponse(API_STATUS.ERROR, message, API_CODE.SERVICE_UNAVAILABLE),
      { status: 503 }
    );
  },

  // Custom business logic errors
  custom: (
    code: ApiCode,
    message: string,
    httpStatus: number = 400,
    errors?: string[]
  ) => {
    return NextResponse.json(
      createResponse(API_STATUS.ERROR, message, code, undefined, errors),
      { status: httpStatus }
    );
  },

  // Authentication specific errors
  invalidCredentials: (message: string = API_MESSAGE.INVALID_CREDENTIALS) => {
    return NextResponse.json(
      createResponse(API_STATUS.ERROR, message, API_CODE.INVALID_CREDENTIALS),
      { status: 401 }
    );
  },

  emailExists: (message: string = API_MESSAGE.EMAIL_ALREADY_EXISTS) => {
    return NextResponse.json(
      createResponse(API_STATUS.ERROR, message, API_CODE.EMAIL_ALREADY_EXISTS),
      { status: 409 }
    );
  },

  userNotFound: (message: string = API_MESSAGE.USER_NOT_FOUND) => {
    return NextResponse.json(
      createResponse(API_STATUS.ERROR, message, API_CODE.USER_NOT_FOUND),
      { status: 404 }
    );
  },

  tokenExpired: (message: string = API_MESSAGE.TOKEN_EXPIRED) => {
    return NextResponse.json(
      createResponse(API_STATUS.ERROR, message, API_CODE.TOKEN_EXPIRED),
      { status: 401 }
    );
  },

  invalidToken: (message: string = API_MESSAGE.INVALID_TOKEN) => {
    return NextResponse.json(
      createResponse(API_STATUS.ERROR, message, API_CODE.INVALID_TOKEN),
      { status: 401 }
    );
  },
};

// Wrapper for handling async operations with consistent error handling
export const apiHandler = async <T = unknown>(
  operation: () => Promise<T>,
  errorMessage: string = API_MESSAGE.INTERNAL_SERVER_ERROR
): Promise<NextResponse | T> => {
  try {
    return await operation();
  } catch (error) {
    console.error("API Handler Error:", error);
    return ApiError.internal(errorMessage, error);
  }
};

// Validation helper
export const validateRequired = (fields: Record<string, unknown>): string[] => {
  const errors: string[] = [];

  for (const [field, value] of Object.entries(fields)) {
    if (value === undefined || value === null || value === "") {
      errors.push(`${field} is required`);
    }
  }

  return errors;
};

// Pagination helper
export const createPagination = (
  page: number,
  limit: number,
  total: number
): PaginationMeta => {
  const totalPages = Math.ceil(total / limit);

  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
};
