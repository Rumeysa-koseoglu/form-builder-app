export interface User {
  id: string;
  email: string;
  password: string;
  name?: string;
}

export type QuestionType =
  | "SHORT_TEXT"
  | "LONG_TEXT"
  | "MULTIPLE_CHOICE"
  | "CHECKBOX"
  | "DROPDOWN";
[1];

export interface Question {
  id: string;
  formId: string;
  type: QuestionType;
  questionText: string;
  isRequired: boolean;
  options?: string[];
  order: number;
  points?: number;
  correctAnswer?: string | string[];
}

export interface Form {
  id: string;
  creatorId: string;
  title: string;
  description: string;
  isQuiz: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Answer {
  questionId: string;
  value: string | string[];
}

export interface FormResponse {
  id: string;
  formId: string;
  answers: Answer[];
  totalScore: number;
  submittedAt: string;
}
