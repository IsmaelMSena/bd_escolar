import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, HelpCircle, RotateCcw, Award, Sparkles } from 'lucide-react';
import { QuizQuestion } from '../../data/unitsData';

interface ConceptCheckWidgetProps {
  questions: QuizQuestion[];
  unitNumber: number;
  onCompleted?: (score: number) => void;
}

export const ConceptCheckWidget: React.FC<ConceptCheckWidgetProps> = ({
  questions,
  unitNumber,
  onCompleted
}) => {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState<boolean>(false);

  // Reiniciar estado al cambiar de unidad o preguntas
  useEffect(() => {
    setSelectedAnswers({});
    setSubmitted(false);
  }, [unitNumber, questions]);

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    if (submitted) return; // No permitir cambios si ya se comprobó
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach(q => {
      if (selectedAnswers[q.id] === q.correctIndex) {
        correct++;
      }
    });
    return {
      correct,
      total: questions.length,
      percentage: Math.round((correct / questions.length) * 100)
    };
  };

  const handleCheck = () => {
    setSubmitted(true);
    const { percentage } = calculateScore();
    if (onCompleted) {
      onCompleted(percentage);
    }
  };

  const handleReset = () => {
    setSelectedAnswers({});
    setSubmitted(false);
  };

  const allAnswered = questions.every(q => selectedAnswers[q.id] !== undefined);
  const { correct, total, percentage } = calculateScore();

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xs space-y-6 transition-colors">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 uppercase tracking-wider mb-2">
            <HelpCircle className="w-3.5 h-3.5" />
            Comprobación de Conceptos
          </span>
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">
            Preguntas Rápidas de la Unidad {unitNumber}
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1">
            Poné a prueba lo aprendido antes de avanzar. Seleccioná la opción correcta para cada pregunta.
          </p>
        </div>

        {submitted && (
          <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Intentar de nuevo</span>
            </button>
          </div>
        )}
      </div>

      {/* Lista de Preguntas */}
      <div className="space-y-6">
        {questions.map((q, qIdx) => {
          const userChoice = selectedAnswers[q.id];
          const isCorrect = userChoice === q.correctIndex;

          return (
            <div
              key={q.id}
              className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-3.5"
            >
              <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100 flex items-start gap-2.5">
                <span className="w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  {qIdx + 1}
                </span>
                <span>{q.question}</span>
              </h4>

              {/* Opciones */}
              <div className="space-y-2">
                {q.options.map((option, optIdx) => {
                  const isSelected = userChoice === optIdx;
                  let optionClass = 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200';

                  if (submitted) {
                    if (optIdx === q.correctIndex) {
                      optionClass = 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-medium';
                    } else if (isSelected && !isCorrect) {
                      optionClass = 'bg-rose-50 dark:bg-rose-950/60 border-rose-500 text-rose-900 dark:text-rose-200';
                    } else {
                      optionClass = 'bg-slate-100/50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 opacity-60';
                    }
                  } else if (isSelected) {
                    optionClass = 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-600 dark:border-indigo-500 text-indigo-900 dark:text-indigo-200 shadow-2xs font-medium';
                  }

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      disabled={submitted}
                      onClick={() => handleSelectOption(q.id, optIdx)}
                      className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm flex items-center justify-between gap-3 transition ${optionClass}`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] font-bold shrink-0 ${
                            isSelected
                              ? 'border-indigo-600 bg-indigo-600 text-white'
                              : 'border-slate-300 dark:border-slate-600 text-slate-500'
                          }`}
                        >
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span>{option}</span>
                      </div>

                      {submitted && optIdx === q.correctIndex && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      )}
                      {submitted && isSelected && !isCorrect && (
                        <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explicación pedagógica al comprobar */}
              {submitted && (
                <div
                  className={`p-3.5 rounded-xl text-xs flex items-start gap-2.5 animate-fadeIn ${
                    isCorrect
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                      : 'bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200'
                  }`}
                >
                  {isCorrect ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <span className="font-bold block">
                      {isCorrect ? '¡Respuesta correcta!' : 'Atención:'}
                    </span>
                    <span>{q.explanation}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Botón de Comprobación y Calificación */}
      {!submitted ? (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {allAnswered
              ? '¡Completaste todas las preguntas! Ya podés verificar tus respuestas.'
              : 'Respondé todas las preguntas para comprobar tus respuestas.'}
          </span>
          <button
            type="button"
            disabled={!allAnswered}
            onClick={handleCheck}
            className={`px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-xs ${
              allAnswered
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer active:scale-95'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Comprobar Respuestas</span>
          </button>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
                Resultado de la Comprobación:
              </span>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {correct} de {total} correctas ({percentage}%)
                {percentage === 100 && ' — ¡Excelente comprensión!'}
              </p>
            </div>
          </div>

          <button
            onClick={handleReset}
            className="px-4 py-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl transition"
          >
            Reintentar preguntas
          </button>
        </div>
      )}
    </div>
  );
};
