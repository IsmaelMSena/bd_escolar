// Definición de tipos para Mi Primera Base de Datos Escolar

export interface StudentSession {
  id: string;
  name: string;
  classroomCode: string;
  avatar: string;
  createdAt: string;
  lastActiveAt: string;
}

export interface QuizQuestion {
  id: string;
  moduleId: number;
  question: string;
  explanation: string;
  options: string[];
  correctIndex: number;
  conceptTag: string;
}

export interface QuizAttemptAnswer {
  questionId: string;
  selectedIndex: number;
  isCorrect: boolean;
}

export interface QuizAttempt {
  id: string;
  studentId: string;
  studentName: string;
  classroomCode: string;
  moduleId: number;
  score: number; // 0 a 100
  totalQuestions: number;
  correctCount: number;
  answers: QuizAttemptAnswer[];
  timestamp: string;
}

export interface ModuleProgress {
  moduleId: number;
  isCompleted: boolean;
  quizScore?: number;
  quizPassed?: boolean;
  attemptsCount: number;
  lastVisitedAt?: string;
}

export interface ExternalPlatformConfig {
  name: string;
  url: string;
  hint: string;
}

export type ViewState = 
  | { type: 'home' }
  | { type: 'module'; moduleId: number; screenIndex?: number }
  | { type: 'quiz'; moduleId: number }
  | { type: 'teacher' }
  | { type: 'diploma' };
