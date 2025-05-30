// Export all API codes and constants
export * from "./apiCode";

// You can add other constants here as needed
export const APP_CONFIG = {
  APP_NAME: "IELTS Learning Hub",
  VERSION: "1.0.0",
  DEFAULT_PAGINATION_LIMIT: 10,
  MAX_PAGINATION_LIMIT: 100,
  JWT_EXPIRY: "7d",
  SUPPORTED_FILE_TYPES: ["jpg", "jpeg", "png", "pdf", "doc", "docx"],
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
} as const;

export const IELTS_LEVELS = {
  MIN: 0.0,
  MAX: 9.0,
  STEP: 0.5,
  LEVELS: [
    0.0, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0, 5.5, 6.0, 6.5, 7.0,
    7.5, 8.0, 8.5, 9.0,
  ],
} as const;

export const QUESTION_TYPES = {
  MULTIPLE_CHOICE: "multiple_choice",
  FILL_BLANK: "fill_blank",
  ESSAY: "essay",
  SPEAKING: "speaking",
  READING: "reading",
  LISTENING: "listening",
  ORDERING: "ordering",
} as const;

export const LESSON_STATUS = {
  NOT_STARTED: "not_started",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
} as const;
