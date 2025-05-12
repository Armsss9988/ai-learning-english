export interface UserResponse {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
}

export interface ApiError {
  error: string;
  status: number;
}

export interface Question {
  id: string;
  question: string;
  type: 'multiple_choice' | 'fill_blank' | 'essay' | 'speaking' | 'reading' | 'drag_drop' | 'matching' | 'ordering' | 'categorization' | 'highlighting';
  options?: string[];
  correctAnswer?: string;
  explanation?: string;
  categories?: string[]; // For categorization questions
  evaluationCriteria?: string[]; // For evaluation purposes
  audioUrl?: string; // For listening questions
  audioText?: string; // Added for audioText questions
}