// Definición de tipos para Mi Primera Base de Datos Escolar

export interface StudentSession {
  id: string;
  token?: string; // Token secreto criptográfico para autenticar RPCs en Supabase
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

export interface UnitProgress {
  unitId: number;
  visited: boolean;
  activityCompleted: boolean;
  quizScore?: number;
  lastVisitedAt: string;
}

export interface ExternalPlatformConfig {
  name: string;
  url: string;
  hint: string;
}

/* ==========================================================================
   TIPOS PARA EXÁMENES INTEGRADORES (MÓDULOS 1 A 4)
   ========================================================================== */

export interface ExamQuestion {
  id: string;
  moduleId: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  category?: 'recognition' | 'understanding' | 'application' | 'scenario' | 'error_detection';
}

export interface ExamAnswerRecord {
  questionId: string;
  questionText: string;
  selectedOptionIndex: number; // -1 si no fue respondida
  selectedOptionText: string;
  correctOptionIndex: number;
  correctOptionText: string;
  isCorrect: boolean;
  explanation: string;
}

export interface ExamAttempt {
  attempt_id: string;
  student_id: string;
  student_name: string;
  classroom_code?: string;
  module_id: number;
  module_name: string;
  started_at: string;
  finished_at: string;
  duration_seconds: number;
  time_limit_seconds: number; // 2400 (40 minutos)
  status: 'completed' | 'timeout' | 'interrupted';
  completion_reason: 'voluntary' | 'timeout' | 'interrupted';
  total_questions: number; // 20
  answered_questions: number;
  correct_answers: number;
  incorrect_answers: number;
  unanswered_questions: number;
  score_percentage: number; // 0 a 100
  passed: boolean; // score_percentage >= 70
  attempt_number: number; // 1, 2, 3...
  answers: ExamAnswerRecord[];
}

export interface ActiveExamSession {
  attempt_id: string;
  student_id: string;
  student_name: string;
  classroom_code?: string;
  module_id: number;
  module_name: string;
  started_at: string; // ISO string
  expires_at: string; // ISO string (started_at + 40 min)
  time_limit_seconds: number; // 2400
  answers: Record<string, number>; // questionId -> selectedIndex
  attempt_number: number;
}

export type ViewState = 
  | { type: 'home' }
  | { type: 'module'; moduleId: number; screenIndex?: number }
  | { type: 'quiz'; moduleId: number }
  | { type: 'teacher' }
  | { type: 'diploma' };
