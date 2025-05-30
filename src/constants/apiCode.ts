// API Response Status
export const API_STATUS = {
  SUCCESS: "success",
  ERROR: "error",
  FAILED: "failed",
  WARNING: "warning",
} as const;

// API Response Codes
export const API_CODE = {
  // Success codes (2xx)
  SUCCESS: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,

  // Client Error codes (4xx)
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  VALIDATION_ERROR: 422,
  TOO_MANY_REQUESTS: 429,

  // Server Error codes (5xx)
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,

  // Custom codes for specific business logic
  EMAIL_ALREADY_EXISTS: 1001,
  INVALID_CREDENTIALS: 1002,
  TOKEN_EXPIRED: 1003,
  INVALID_TOKEN: 1004,
  USER_NOT_FOUND: 1005,
  LESSON_NOT_FOUND: 1006,
  LEARNING_PATH_NOT_FOUND: 1007,
  INSUFFICIENT_PERMISSION: 1008,
  QUIZ_ALREADY_COMPLETED: 1009,
  INVALID_IELTS_LEVEL: 1010,
} as const;

// API Response Messages
export const API_MESSAGE = {
  // Success messages
  SUCCESS: "Operation completed successfully",
  CREATED: "Resource created successfully",
  UPDATED: "Resource updated successfully",
  DELETED: "Resource deleted successfully",
  LOGIN_SUCCESS: "Login successful",
  REGISTER_SUCCESS: "Registration successful",
  LOGOUT_SUCCESS: "Logout successful",

  // Auth messages
  INVALID_CREDENTIALS: "Invalid email or password",
  EMAIL_ALREADY_EXISTS: "Email already exists",
  USER_NOT_FOUND: "User not found",
  TOKEN_EXPIRED: "Token has expired",
  INVALID_TOKEN: "Invalid token provided",
  UNAUTHORIZED: "Unauthorized access",
  FORBIDDEN: "Access forbidden",

  // Learning path messages
  LEARNING_PATH_CREATED: "Learning path created successfully",
  LEARNING_PATH_NOT_FOUND: "Learning path not found",
  LEARNING_PATH_UPDATED: "Learning path updated successfully",
  LEARNING_PATH_DELETED: "Learning path deleted successfully",

  // Lesson messages
  LESSON_CREATED: "Lesson created successfully",
  LESSON_NOT_FOUND: "Lesson not found",
  LESSON_UPDATED: "Lesson updated successfully",
  LESSON_COMPLETED: "Lesson completed successfully",

  // Question messages
  QUESTION_ANSWERED: "Question answered successfully",
  QUIZ_COMPLETED: "Quiz completed successfully",
  QUIZ_ALREADY_COMPLETED: "Quiz already completed",

  // Validation messages
  VALIDATION_ERROR: "Validation error",
  REQUIRED_FIELD_MISSING: "Required field is missing",
  INVALID_EMAIL_FORMAT: "Invalid email format",
  PASSWORD_TOO_SHORT: "Password must be at least 6 characters",
  INVALID_IELTS_LEVEL: "IELTS level must be between 0.0 and 9.0",

  // Server error messages
  INTERNAL_SERVER_ERROR: "Internal server error occurred",
  SERVICE_UNAVAILABLE: "Service temporarily unavailable",
  BAD_REQUEST: "Bad request",
  NOT_FOUND: "Resource not found",
  METHOD_NOT_ALLOWED: "Method not allowed",
  TOO_MANY_REQUESTS: "Too many requests, please try again later",

  // File upload messages
  FILE_UPLOAD_SUCCESS: "File uploaded successfully",
  FILE_UPLOAD_FAILED: "File upload failed",
  INVALID_FILE_TYPE: "Invalid file type",
  FILE_TOO_LARGE: "File size too large",

  // AI/Generation messages
  AI_GENERATION_SUCCESS: "AI content generated successfully",
  AI_GENERATION_FAILED: "AI content generation failed",
  AI_SERVICE_UNAVAILABLE: "AI service temporarily unavailable",
} as const;

// Type definitions for better TypeScript support
export type ApiStatus = (typeof API_STATUS)[keyof typeof API_STATUS];
export type ApiCode = (typeof API_CODE)[keyof typeof API_CODE];
export type ApiMessage = (typeof API_MESSAGE)[keyof typeof API_MESSAGE];

// Standard API Response Interface
export interface ApiResponse<T = unknown> {
  status: ApiStatus;
  message: string;
  code: ApiCode;
  data?: T;
  errors?: string[];
  meta?: {
    timestamp: string;
    requestId?: string;
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

// Error details interface
export interface ApiErrorDetail {
  field?: string;
  message: string;
  code?: string;
}

// Pagination interface
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}
