import React, { useState } from 'react';
import { QuizQuestion, StudentSession, QuizAttempt } from '../../types';
import { saveQuizAttempt, generateUUID } from '../../services/storageService';
import { 
  Award, CheckCircle2, XCircle, ChevronRight, ChevronLeft, 
  RotateCcw, ArrowRight, Check, BookOpen, User 
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface QuizRunnerProps {
  moduleId: number;
  moduleTitle: string;
  questions: QuizQuestion[];
  currentStudent: StudentSession | null;
  onRequestLogin: () => void;
  onContinue: () => void;
}

export const QuizRunner: React.FC<QuizRunnerProps> = ({
  moduleId,
  moduleTitle,
  questions,
  currentStudent,
  onRequestLogin,
  onContinue
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isFinished, setIsFinished] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [calculatedAttempt, setCalculatedAttempt] = useState<QuizAttempt | null>(null);

  const currentQ = questions[currentIndex];
  const isAnswered = selectedAnswers[currentIndex] !== undefined;

  const handleSelectOption = (optIndex: number) => {
    if (isFinished) return;
    setSelectedAnswers(prev => ({ ...prev, [currentIndex]: optIndex }));
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const prevQuestion = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleFinishQuiz = async () => {
    const student = currentStudent || {
      id: 'anon_student',
      name: 'Estudiante',
      classroomCode: '3A-2025',
      avatar: '🎓',
      createdAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString()
    };

    let correctCount = 0;
    const answerDetails = questions.map((q, idx) => {
      const chosen = selectedAnswers[idx] ?? -1;
      const isCorrect = chosen === q.correctIndex;
      if (isCorrect) correctCount++;
      return {
        questionId: q.id,
        selectedIndex: chosen,
        isCorrect
      };
    });

    const totalQuestions = questions.length;
    const finalScore = Math.round((correctCount / totalQuestions) * 100);

    const attempt: QuizAttempt = {
      id: generateUUID(),
      studentId: student.id,
      studentName: student.name,
      classroomCode: student.classroomCode,
      moduleId,
      score: finalScore,
      totalQuestions,
      correctCount,
      answers: answerDetails,
      timestamp: new Date().toISOString()
    };

    await saveQuizAttempt(attempt);
    setCalculatedAttempt(attempt);
    setIsFinished(true);

    if (finalScore >= 60) {
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
    }
  };

  const restartQuiz = () => {
    setSelectedAnswers({});
    setCurrentIndex(0);
    setIsFinished(false);
    setShowReview(false);
    setCalculatedAttempt(null);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
      {/* Top Banner */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 text-xs text-slate-500">
        <span className="font-bold text-indigo-600 uppercase tracking-wide">
          Cuestionario Breve • Clase {moduleId}
        </span>
        {currentStudent ? (
          <div className="flex items-center gap-1.5 font-semibold text-slate-700">
            <span>{currentStudent.avatar}</span>
            <span>{currentStudent.name}</span>
          </div>
        ) : (
          <button onClick={onRequestLogin} className="text-indigo-600 font-bold hover:underline flex items-center gap-1">
            <User className="w-3.5 h-3.5" /> Identificarme
          </button>
        )}
      </div>

      {!isFinished ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-400">
                Pregunta {currentIndex + 1} de {questions.length}
              </span>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
                {moduleTitle}
              </h3>
            </div>
            <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              {currentQ.conceptTag}
            </span>
          </div>

          {/* Question Text */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
            <p className="text-base font-semibold text-slate-900">
              {currentQ.question}
            </p>
          </div>

          {/* Options */}
          <div className="space-y-2.5">
            {currentQ.options.map((option, optIdx) => {
              const isSelected = selectedAnswers[currentIndex] === optIdx;

              return (
                <div
                  key={optIdx}
                  onClick={() => handleSelectOption(optIdx)}
                  className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between text-sm ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/60 text-indigo-950 font-semibold shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold font-mono ${
                      isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {String.fromCharCode(65 + optIdx)}
                    </span>
                    <span>{option}</span>
                  </div>
                  {isSelected && (
                    <div className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              onClick={prevQuestion}
              disabled={currentIndex === 0}
              className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" /> Anterior
            </button>

            {currentIndex < questions.length - 1 ? (
              <button
                onClick={nextQuestion}
                disabled={!isAnswered}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs disabled:opacity-40 flex items-center gap-1.5 transition"
              >
                <span>Siguiente</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleFinishQuiz}
                disabled={Object.keys(selectedAnswers).length < questions.length}
                className="px-6 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs disabled:opacity-40 flex items-center gap-2 transition"
              >
                <span>Finalizar Cuestionario</span>
                <Award className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Results Card */
        <div className="space-y-6 text-center py-4">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-indigo-100 text-indigo-600 flex items-center justify-center text-3xl">
            {calculatedAttempt && calculatedAttempt.score >= 60 ? '🏆' : '📚'}
          </div>

          <div>
            <h4 className="text-2xl font-extrabold text-slate-900">
              {calculatedAttempt && calculatedAttempt.score >= 60 ? '¡Cuestionario Aprobado!' : '¡Buen intento! Repasemos'}
            </h4>
            <div className="text-3xl font-black text-indigo-600 font-mono mt-2">
              {calculatedAttempt?.score} <span className="text-base text-slate-500 font-sans font-normal">/ 100 puntos</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Respondiste correctamente {calculatedAttempt?.correctCount} de {calculatedAttempt?.totalQuestions} preguntas.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setShowReview(!showReview)}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs flex items-center gap-1.5 hover:bg-slate-50"
            >
              <BookOpen className="w-4 h-4" />
              <span>{showReview ? 'Ocultar revisión' : 'Revisar respuestas'}</span>
            </button>

            <button
              onClick={restartQuiz}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs flex items-center gap-1.5 hover:bg-slate-50"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reintentar</span>
            </button>

            <button
              onClick={onContinue}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs flex items-center gap-2"
            >
              <span>Continuar a la siguiente clase</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Answers Review */}
          {showReview && (
            <div className="pt-6 border-t border-slate-200 text-left space-y-4">
              <h5 className="font-bold text-slate-900 text-sm">Revisión de respuestas:</h5>
              {questions.map((q, idx) => {
                const chosen = selectedAnswers[idx];
                const isCorrect = chosen === q.correctIndex;

                return (
                  <div
                    key={q.id}
                    className={`p-4 rounded-xl border text-xs space-y-1.5 ${
                      isCorrect ? 'bg-emerald-50/50 border-emerald-200' : 'bg-rose-50/50 border-rose-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-700">Pregunta {idx + 1}</span>
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {isCorrect ? 'Correcta' : 'Incorrecta'}
                      </span>
                    </div>
                    <p className="font-semibold text-slate-900">{q.question}</p>
                    <p className="text-slate-600">
                      <strong>Tu respuesta: </strong>
                      <span className={isCorrect ? 'text-emerald-800 font-bold' : 'text-rose-800 font-bold'}>
                        {chosen !== undefined ? q.options[chosen] : 'Sin responder'}
                      </span>
                    </p>
                    {!isCorrect && (
                      <p className="text-emerald-900">
                        <strong>Correcta: </strong>{q.options[q.correctIndex]}
                      </p>
                    )}
                    <p className="text-[11px] text-slate-500 pt-1">💡 {q.explanation}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
