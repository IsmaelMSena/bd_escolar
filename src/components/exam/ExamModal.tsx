import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MODULE_EXAMS, ModuleExamConfig } from '../../data/examsData';
import { ExamQuestion, ExamAttempt, ExamAnswerRecord, ActiveExamSession, StudentSession } from '../../types';
import { 
  getCurrentStudent, saveCurrentStudent, saveExamAttempt, getActiveExamSession, 
  saveActiveExamSession, clearActiveExamSession, getExamAttemptsCount, 
  generateUUID, startServerExamSession, getOrCreateStudentToken
} from '../../services/storageService';
import { 
  Clock, CheckCircle2, XCircle, AlertTriangle, 
  Award, ArrowLeft, ArrowRight, Send, RotateCcw, 
  FileText, X, Sparkles, User, Info, Check, Edit3
} from 'lucide-react';

const QUICK_AVATARS = ['🎓', '🦁', '🦊', '🚀', '⚡', '🌟', '💻', '🧪'];

interface ExamModalProps {
  moduleId: number;
  isOpen: boolean;
  onClose: () => void;
  onExamFinished?: (attempt: ExamAttempt) => void;
}

export const ExamModal: React.FC<ExamModalProps> = ({
  moduleId,
  isOpen,
  onClose,
  onExamFinished
}) => {
  const examConfig: ModuleExamConfig | undefined = MODULE_EXAMS[moduleId];

  // Modos de pantalla: 'intro' | 'exam' | 'result'
  const [screenMode, setScreenMode] = useState<'intro' | 'exam' | 'result'>('intro');

  // Datos de identidad escolar del estudiante
  const [currentStudent, setCurrentStudent] = useState<StudentSession | null>(() => getCurrentStudent());
  const [studentName, setStudentName] = useState<string>(() => currentStudent?.name || '');
  const [classroomCode, setClassroomCode] = useState<string>(() => currentStudent?.classroomCode || '');
  const [selectedAvatar, setSelectedAvatar] = useState<string>(() => currentStudent?.avatar || '🎓');
  const [isEditingProfile, setIsEditingProfile] = useState<boolean>(() => !currentStudent || !currentStudent.name.trim());

  // Estado del intento y temporizador
  const [attemptId, setAttemptId] = useState<string>('');
  const [startedAt, setStartedAt] = useState<string>('');
  const [expiresAt, setExpiresAt] = useState<string>('');
  const [remainingSeconds, setRemainingSeconds] = useState<number>(2400); // 40 minutos

  // Respuestas del estudiante: questionId -> optionIndex
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [currentQIndex, setCurrentQIndex] = useState<number>(0);

  // Modales y bloqueos
  const [showConfirmSubmit, setShowConfirmSubmit] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [finalAttempt, setFinalAttempt] = useState<ExamAttempt | null>(null);

  // Ref para el timer
  const timerRef = useRef<number | null>(null);

  // Inicializar o recuperar sesión activa
  useEffect(() => {
    if (!isOpen || !examConfig) return;

    // Recargar perfil actual de estudiante guardado
    const loadedStudent = getCurrentStudent();
    if (loadedStudent && loadedStudent.name.trim()) {
      setCurrentStudent(loadedStudent);
      setStudentName(loadedStudent.name);
      setClassroomCode(loadedStudent.classroomCode || '');
      setSelectedAvatar(loadedStudent.avatar || '🎓');
      setIsEditingProfile(false);
    } else {
      setIsEditingProfile(true);
    }

    const existingSession = getActiveExamSession(moduleId);
    if (existingSession) {
      const now = Date.now();
      const expTime = new Date(existingSession.expires_at).getTime();
      const remaining = Math.max(0, Math.floor((expTime - now) / 1000));

      if (remaining > 0) {
        // Restaurar sesión activa
        setAttemptId(existingSession.attempt_id);
        setStartedAt(existingSession.started_at);
        setExpiresAt(existingSession.expires_at);
        setRemainingSeconds(remaining);
        setUserAnswers(existingSession.answers || {});
        setScreenMode('exam');
      } else {
        // El tiempo expiró mientras el estudiante estuvo fuera
        handleFinishExam('timeout', existingSession.attempt_id, existingSession.started_at, existingSession.answers || {});
      }
    } else {
      // Estado inicial en la pantalla de bienvenida
      setScreenMode('intro');
      setUserAnswers({});
      setCurrentQIndex(0);
      setShowConfirmSubmit(false);
      setIsSubmitting(false);
      setFinalAttempt(null);
    }
  }, [isOpen, moduleId, examConfig]);

  // Efecto del temporizador con marcas de tiempo reales
  useEffect(() => {
    if (screenMode !== 'exam' || !expiresAt) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    const checkTimer = () => {
      const now = Date.now();
      const expTime = new Date(expiresAt).getTime();
      const diffSecs = Math.max(0, Math.floor((expTime - now) / 1000));
      setRemainingSeconds(diffSecs);

      if (diffSecs <= 0) {
        if (timerRef.current) clearInterval(timerRef.current);
        handleFinishExam('timeout');
      }
    };

    checkTimer();
    timerRef.current = window.setInterval(checkTimer, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [screenMode, expiresAt]);

  // Guardar respuestas en localStorage ante cada cambio
  const handleSelectOption = (questionId: string, optionIndex: number) => {
    if (screenMode !== 'exam' || isSubmitting) return;

    setUserAnswers(prev => {
      const updated = { ...prev, [questionId]: optionIndex };
      // Persistir sesión activa con respuestas actualizadas
      if (attemptId && startedAt && expiresAt) {
        const studentId = currentStudent?.id || `anon_${attemptId.substring(0, 8)}`;
        const studentNameVal = currentStudent?.name || (studentName.trim() || 'Estudiante');
        const classCodeVal = currentStudent?.classroomCode || (classroomCode.trim() || 'Sin aula');

        saveActiveExamSession({
          attempt_id: attemptId,
          student_id: studentId,
          student_name: studentNameVal,
          classroom_code: classCodeVal,
          module_id: moduleId,
          module_name: examConfig?.moduleName || `Módulo ${moduleId}`,
          started_at: startedAt,
          expires_at: expiresAt,
          time_limit_seconds: 2400,
          answers: updated,
          attempt_number: getExamAttemptsCount(moduleId, studentId) + 1
        });
      }
      return updated;
    });
  };

  // Iniciar el examen asegurando la identidad del estudiante
  const handleStartExam = async () => {
    if (!examConfig) return;

    const trimmedName = studentName.trim();
    const trimmedClass = classroomCode.trim().toUpperCase();

    // Validación estricta de identidad escolar
    if (trimmedName.length < 2 || trimmedClass.length < 1) {
      setIsEditingProfile(true);
      return;
    }

    // Persistir o actualizar perfil de estudiante
    let studentToUse = currentStudent;
    if (!studentToUse || isEditingProfile || studentToUse.name !== trimmedName || studentToUse.classroomCode !== trimmedClass) {
      studentToUse = {
        id: currentStudent?.id || generateUUID(),
        name: trimmedName,
        classroomCode: trimmedClass,
        avatar: selectedAvatar || '🎓',
        createdAt: currentStudent?.createdAt || new Date().toISOString(),
        lastActiveAt: new Date().toISOString()
      };
      setIsEditingProfile(false);
    }

    if (!studentToUse.token) {
      studentToUse.token = getOrCreateStudentToken(studentToUse.id);
    }
    // Garantizar que el estudiante quede registrado en Supabase antes de iniciar la sesión de examen
    await saveCurrentStudent(studentToUse);
    setCurrentStudent(studentToUse);

    const newAttemptId = generateUUID();
    const studentToken = studentToUse.token;

    // Iniciar sesión oficial en el servidor Supabase
    const startRes = await startServerExamSession(newAttemptId, studentToUse.id, studentToken, moduleId);
    if (!startRes.success) {
      alert(`No se pudo iniciar la sesión de examen en el servidor: ${startRes.error || 'Error de conexión'}.\n\nPor favor, verificá que tengas conexión a internet activa antes de comenzar.`);
      return;
    }

    const nowIso = new Date().toISOString();
    const expIso = new Date(Date.now() + 40 * 60 * 1000).toISOString();
    const attemptNumber = getExamAttemptsCount(moduleId, studentToUse.id) + 1;

    setAttemptId(newAttemptId);
    setStartedAt(nowIso);
    setExpiresAt(expIso);
    setRemainingSeconds(2400);
    setUserAnswers({});
    setCurrentQIndex(0);
    setIsSubmitting(false);

    // Guardar sesión activa inicial
    saveActiveExamSession({
      attempt_id: newAttemptId,
      student_id: studentToUse.id,
      student_name: studentToUse.name,
      classroom_code: studentToUse.classroomCode,
      module_id: moduleId,
      module_name: examConfig.moduleName,
      started_at: nowIso,
      expires_at: expIso,
      time_limit_seconds: 2400,
      answers: {},
      attempt_number: attemptNumber
    });

    setScreenMode('exam');
  };

  // Finalizar y calificar el examen
  const handleFinishExam = useCallback(async (
    reason: 'voluntary' | 'timeout' | 'interrupted',
    customAttemptId?: string,
    customStartedAt?: string,
    customAnswers?: Record<string, number>
  ) => {
    if (isSubmitting || !examConfig) return;
    setIsSubmitting(true);
    if (timerRef.current) clearInterval(timerRef.current);

    const effAttemptId = customAttemptId || attemptId;
    const effStartedAt = customStartedAt || startedAt || new Date().toISOString();
    const effAnswers = customAnswers || userAnswers;
    const finishedAtIso = new Date().toISOString();

    const durationSecs = Math.min(
      2400,
      Math.max(1, Math.floor((new Date(finishedAtIso).getTime() - new Date(effStartedAt).getTime()) / 1000))
    );

    const studentId = currentStudent?.id || `std_${effAttemptId.substring(0, 8)}`;
    const studentNameVal = currentStudent?.name || (studentName.trim() || 'Estudiante');
    const classroomCodeVal = currentStudent?.classroomCode || (classroomCode.trim().toUpperCase() || 'Sin aula');
    const attemptNumber = getExamAttemptsCount(moduleId, studentId) + 1;

    // Calificar cada pregunta
    let correctCount = 0;
    let answeredCount = 0;

    const detailedAnswers: ExamAnswerRecord[] = examConfig.questions.map(q => {
      const selectedIdx = effAnswers[q.id] !== undefined ? effAnswers[q.id] : -1;
      const hasAnswered = selectedIdx >= 0;
      if (hasAnswered) answeredCount++;

      const isCorrect = selectedIdx === q.correctIndex;
      if (isCorrect) correctCount++;

      return {
        questionId: q.id,
        questionText: q.question,
        selectedOptionIndex: selectedIdx,
        selectedOptionText: hasAnswered ? q.options[selectedIdx] : 'Sin responder',
        correctOptionIndex: q.correctIndex,
        correctOptionText: q.options[q.correctIndex],
        isCorrect,
        explanation: q.explanation
      };
    });

    const totalQ = examConfig.questions.length;
    const incorrectCount = answeredCount - correctCount;
    const unansweredCount = totalQ - answeredCount;
    const scorePercentage = Math.round((correctCount / totalQ) * 100);
    const passed = scorePercentage >= examConfig.passingScorePercentage;

    const attemptRecord: ExamAttempt = {
      attempt_id: effAttemptId,
      student_id: studentId,
      student_name: studentNameVal,
      classroom_code: classroomCodeVal,
      module_id: moduleId,
      module_name: examConfig.moduleName,
      started_at: effStartedAt,
      finished_at: finishedAtIso,
      duration_seconds: durationSecs,
      time_limit_seconds: 2400,
      status: 'completed',
      completion_reason: reason,
      total_questions: totalQ,
      answered_questions: answeredCount,
      correct_answers: correctCount,
      incorrect_answers: incorrectCount,
      unanswered_questions: unansweredCount,
      score_percentage: scorePercentage,
      passed,
      attempt_number: attemptNumber,
      answers: detailedAnswers
    };

    // Guardar en almacenamiento verificable (localStorage / Supabase)
    await saveExamAttempt(attemptRecord);
    clearActiveExamSession(moduleId);

    setFinalAttempt(attemptRecord);
    setShowConfirmSubmit(false);
    setScreenMode('result');
    setIsSubmitting(false);

    if (onExamFinished) {
      onExamFinished(attemptRecord);
    }
  }, [isSubmitting, examConfig, attemptId, startedAt, userAnswers, currentStudent, studentName, classroomCode, moduleId, onExamFinished]);

  if (!isOpen || !examConfig) return null;

  // Formatear minutos y segundos
  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const answeredQuestionsCount = Object.keys(userAnswers).length;
  const currentQuestion: ExamQuestion = examConfig.questions[currentQIndex];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 transition-colors overflow-hidden">

        {/* ===================================================================
            1. PANTALLA DE BIENVENIDA / INSTRUCCIONES DEL EXAMEN
            =================================================================== */}
        {screenMode === 'intro' && (
          <div className="p-6 sm:p-8 space-y-6 overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block">
                    Evaluación Calificada · {examConfig.badge}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                    Examen Integrador — {examConfig.moduleName}
                  </h3>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Identificación del estudiante */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 transition-all space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Identificación del Estudiante
                </span>
                {!isEditingProfile && currentStudent && (
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile(true)}
                    className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Cambiar datos</span>
                  </button>
                )}
              </div>

              {!isEditingProfile && currentStudent ? (
                <div className="flex items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xl shadow-xs">
                      {currentStudent.avatar || '🎓'}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-slate-900 dark:text-white">
                        {currentStudent.name}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                        Curso: <span className="text-indigo-600 dark:text-indigo-400 font-bold">{currentStudent.classroomCode}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                      <Check className="w-3 h-3" /> Identificado
                    </span>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-indigo-200 dark:border-indigo-900/60 shadow-xs">
                  {/* Selector rápido de avatar */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                      Elegí tu icono:
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {QUICK_AVATARS.map((av) => (
                        <button
                          key={av}
                          type="button"
                          onClick={() => setSelectedAvatar(av)}
                          className={`text-lg p-1.5 rounded-xl transition cursor-pointer ${
                            selectedAvatar === av
                              ? 'bg-indigo-100 dark:bg-indigo-950 ring-2 ring-indigo-500 scale-105'
                              : 'bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700'
                          }`}
                        >
                          {av}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Tu Nombre y Apellido <span className="text-rose-500">*</span>:
                      </label>
                      <input
                        type="text"
                        value={studentName}
                        onChange={(e) => setStudentName(e.target.value)}
                        placeholder="Ej: Lucía Pérez"
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Curso / División <span className="text-rose-500">*</span>:
                      </label>
                      <input
                        type="text"
                        value={classroomCode}
                        onChange={(e) => setClassroomCode(e.target.value)}
                        placeholder="Ej: 4.° A o 3.° 2.ª"
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs uppercase font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    💡 Estos datos son necesarios para que el docente pueda asociar tu calificación a tu nombre y división. No solicitamos contraseñas ni correos electrónicos.
                  </p>
                </div>
              )}
            </div>

            {/* Ficha técnica del examen */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/80">
                <Clock className="w-5 h-5 mx-auto text-indigo-600 dark:text-indigo-400 mb-1" />
                <span className="text-lg font-black text-slate-900 dark:text-white block font-mono">
                  {examConfig.durationMinutes} min
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Duración máxima</span>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/80">
                <FileText className="w-5 h-5 mx-auto text-indigo-600 dark:text-indigo-400 mb-1" />
                <span className="text-lg font-black text-slate-900 dark:text-white block font-mono">
                  {examConfig.totalQuestions}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Preguntas</span>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/80">
                <Award className="w-5 h-5 mx-auto text-emerald-600 dark:text-emerald-400 mb-1" />
                <span className="text-lg font-black text-emerald-700 dark:text-emerald-400 block font-mono">
                  {examConfig.passingScorePercentage} %
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Aprobación (14/20)</span>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/80">
                <Sparkles className="w-5 h-5 mx-auto text-amber-600 dark:text-amber-400 mb-1" />
                <span className="text-lg font-black text-slate-900 dark:text-white block font-mono">
                  {getExamAttemptsCount(moduleId, currentStudent?.id) + 1}.º
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">N.° de intento</span>
              </div>
            </div>

            {/* Instrucciones detalladas */}
            <div className="space-y-3">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Instrucciones importantes antes de comenzar:
              </h4>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                {examConfig.instructions.map((inst, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span>{inst}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Aviso sobre recargas y seguridad */}
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-950 dark:text-amber-200 flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Temporizador con marcas de tiempo reales:</span>
                <span>
                  El reloj no se detiene si cerrás la pestaña o recargás la página. Si se agota el tiempo, el examen se entregará de forma automática con las respuestas guardadas hasta ese momento.
                </span>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={onClose}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                Volver a la clase
              </button>

              <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                {!(studentName.trim().length >= 2 && classroomCode.trim().length >= 1) && (
                  <span className="text-[11px] text-amber-700 dark:text-amber-400 font-medium text-center sm:text-right">
                    Ingresá tu nombre y curso para habilitar el examen
                  </span>
                )}
                <button
                  onClick={handleStartExam}
                  disabled={!(studentName.trim().length >= 2 && classroomCode.trim().length >= 1)}
                  className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition shadow-md ${
                    studentName.trim().length >= 2 && classroomCode.trim().length >= 1
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer active:scale-95 shadow-indigo-600/20'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed shadow-none'
                  }`}
                >
                  <span>Comenzar Examen</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
            2. PANTALLA ACTIVA DEL EXAMEN (EN CURSO)
            =================================================================== */}
        {screenMode === 'exam' && (
          <div className="flex flex-col h-full max-h-[92vh]">
            {/* Header del examen con temporizador visible */}
            <div className="p-4 sm:p-5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block">
                  {examConfig.moduleName}
                </span>
                <h4 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                  Pregunta {currentQIndex + 1} de {examConfig.totalQuestions}
                </h4>
              </div>

              {/* Temporizador */}
              <div
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-2xl font-mono text-xs sm:text-sm font-bold border transition ${
                  remainingSeconds <= 60
                    ? 'bg-rose-50 dark:bg-rose-950/70 border-rose-500 text-rose-700 dark:text-rose-300 animate-pulse'
                    : remainingSeconds <= 600
                    ? 'bg-amber-50 dark:bg-amber-950/70 border-amber-500 text-amber-800 dark:text-amber-300'
                    : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200'
                }`}
                title="Tiempo restante para la entrega"
              >
                <Clock className="w-4 h-4" />
                <span>{formatTimer(remainingSeconds)}</span>
              </div>
            </div>

            {/* Aviso visual de tiempo restante cuando queda poco */}
            {remainingSeconds <= 600 && remainingSeconds > 60 && (
              <div className="bg-amber-50 dark:bg-amber-950/80 border-b border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-200 px-4 py-1.5 text-xs text-center font-semibold">
                ⚠️ Quedan menos de 10 minutos para finalizar el examen.
              </div>
            )}
            {remainingSeconds <= 60 && (
              <div className="bg-rose-50 dark:bg-rose-950/90 border-b border-rose-300 dark:border-rose-900 text-rose-900 dark:text-rose-200 px-4 py-1.5 text-xs text-center font-bold animate-pulse">
                ⏰ ¡Atención! Queda menos de 1 minuto. El examen se entregará automáticamente al llegar a cero.
              </div>
            )}

            {/* Navegador rápido de preguntas (1 a 20) */}
            <div className="bg-slate-50 dark:bg-slate-850 px-4 py-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto scrollbar-none shrink-0">
              <div className="flex items-center gap-1.5 min-w-max">
                {examConfig.questions.map((q, idx) => {
                  const isCurrent = idx === currentQIndex;
                  const isAnswered = userAnswers[q.id] !== undefined;

                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentQIndex(idx)}
                      className={`w-7 h-7 rounded-lg text-xs font-bold transition flex items-center justify-center border ${
                        isCurrent
                          ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs'
                          : isAnswered
                          ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                      }`}
                      title={`Pregunta ${idx + 1}: ${isAnswered ? 'Respondida' : 'Pendiente'}`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Cuerpo de la pregunta actual */}
            <div className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-1">
              <div className="space-y-3">
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 uppercase tracking-wider">
                  Pregunta {currentQIndex + 1} de {examConfig.totalQuestions}
                </span>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-relaxed">
                  {currentQuestion.question}
                </h3>
              </div>

              {/* Opciones de respuesta */}
              <div className="space-y-2.5">
                {currentQuestion.options.map((option, optIdx) => {
                  const isSelected = userAnswers[currentQuestion.id] === optIdx;

                  return (
                    <button
                      key={optIdx}
                      onClick={() => handleSelectOption(currentQuestion.id, optIdx)}
                      className={`w-full text-left p-4 rounded-2xl border text-xs sm:text-sm flex items-start gap-3 transition ${
                        isSelected
                          ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-600 dark:border-indigo-500 text-indigo-950 dark:text-indigo-200 shadow-xs font-medium'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-850'
                      }`}
                    >
                      <span
                        className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-600 text-white'
                            : 'border-slate-300 dark:border-slate-600 text-slate-500'
                        }`}
                      >
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <span className="leading-relaxed flex-1">{option}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Footer de navegación entre preguntas y entrega */}
            <div className="p-4 sm:p-5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0">
              <button
                onClick={() => setCurrentQIndex(prev => Math.max(0, prev - 1))}
                disabled={currentQIndex === 0}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition ${
                  currentQIndex === 0
                    ? 'opacity-40 cursor-not-allowed border-slate-200 dark:border-slate-800 text-slate-400'
                    : 'border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Anterior</span>
              </button>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline">
                  {answeredQuestionsCount} de {examConfig.totalQuestions} respondidas
                </span>

                {/* Botón Entregar */}
                <button
                  onClick={() => setShowConfirmSubmit(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition active:scale-95"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Entregar Examen</span>
                </button>

                {currentQIndex < examConfig.totalQuestions - 1 && (
                  <button
                    onClick={() => setCurrentQIndex(prev => Math.min(examConfig.totalQuestions - 1, prev + 1))}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition active:scale-95"
                  >
                    <span>Siguiente</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Modal de confirmación de entrega voluntaria */}
            {showConfirmSubmit && (
              <div className="fixed inset-0 z-60 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
                <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 space-y-5 border border-slate-200 dark:border-slate-800 shadow-2xl animate-scaleUp">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-base text-slate-900 dark:text-white">
                        ¿Confirmás la entrega del examen?
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Una vez entregado, se calculará tu nota final y no podrás modificar tus respuestas.
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Preguntas respondidas:</span>
                      <span className="font-bold text-slate-900 dark:text-white font-mono">{answeredQuestionsCount} / {examConfig.totalQuestions}</span>
                    </div>
                    {answeredQuestionsCount < examConfig.totalQuestions && (
                      <div className="flex items-center justify-between text-rose-600 dark:text-rose-400 font-semibold">
                        <span>Preguntas sin responder:</span>
                        <span className="font-mono">{examConfig.totalQuestions - answeredQuestionsCount}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Tiempo restante:</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">{formatTimer(remainingSeconds)}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2.5 pt-2">
                    <button
                      onClick={() => setShowConfirmSubmit(false)}
                      disabled={isSubmitting}
                      className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    >
                      Continuar respondiendo
                    </button>
                    <button
                      onClick={() => handleFinishExam('voluntary')}
                      disabled={isSubmitting}
                      className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs flex items-center gap-1.5"
                    >
                      {isSubmitting ? (
                        <span>Calificando...</span>
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Sí, entregar ahora</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===================================================================
            3. PANTALLA DE RESULTADOS DEL EXAMEN (POST-ENTREGA)
            =================================================================== */}
        {screenMode === 'result' && finalAttempt && (
          <div className="p-6 sm:p-8 space-y-6 overflow-y-auto">
            {/* Header del resultado */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block">
                  Resultado Oficial · Intento {finalAttempt.attempt_number}
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  Examen Integrador — {finalAttempt.module_name}
                </h3>
              </div>

              <button
                onClick={onClose}
                className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Banner de Aprobación */}
            <div
              className={`p-6 rounded-3xl border text-center space-y-3 ${
                finalAttempt.passed
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200'
                  : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-950 dark:text-rose-200'
              }`}
            >
              <div
                className={`w-14 h-14 rounded-2xl mx-auto flex items-center justify-center ${
                  finalAttempt.passed
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                    : 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                }`}
              >
                {finalAttempt.passed ? <Award className="w-8 h-8" /> : <XCircle className="w-8 h-8" />}
              </div>

              <div>
                <span className="text-3xl sm:text-4xl font-black font-mono tracking-tight block">
                  {finalAttempt.score_percentage} %
                </span>
                <h4 className="text-lg font-extrabold mt-1">
                  {finalAttempt.passed ? '¡Felicitaciones! Examen Aprobado' : 'Examen No Aprobado'}
                </h4>
                <p className="text-xs sm:text-sm mt-0.5 opacity-90 max-w-md mx-auto">
                  {finalAttempt.passed
                    ? `Alcanzaste el criterio mínimo de aprobación del 70 % con ${finalAttempt.correct_answers} respuestas correctas sobre ${finalAttempt.total_questions}.`
                    : `Obtuviste ${finalAttempt.correct_answers} de ${finalAttempt.total_questions} correctas. Se requiere un 70 % (al menos 14 respuestas correctas) para aprobar.`}
                </p>
              </div>
            </div>

            {/* Métricas clave */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/80">
                <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Correctas</span>
                <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono">
                  {finalAttempt.correct_answers} / {finalAttempt.total_questions}
                </span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/80">
                <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Incorrectas</span>
                <span className="text-lg font-black text-rose-600 dark:text-rose-400 font-mono">
                  {finalAttempt.incorrect_answers}
                </span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/80">
                <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Tiempo utilizado</span>
                <span className="text-lg font-black text-slate-900 dark:text-white font-mono">
                  {Math.floor(finalAttempt.duration_seconds / 60)}m {finalAttempt.duration_seconds % 60}s
                </span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/80">
                <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Motivo entrega</span>
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 block mt-1">
                  {finalAttempt.completion_reason === 'voluntary' ? 'Entrega voluntaria' : 'Tiempo agotado'}
                </span>
              </div>
            </div>

            {/* Revisión pedagógica detallada de cada pregunta */}
            <div className="space-y-4">
              <h4 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Revisión pedagógica de tus respuestas:
              </h4>

              <div className="space-y-4">
                {finalAttempt.answers.map((ans, idx) => (
                  <div
                    key={ans.questionId}
                    className={`p-4 rounded-2xl border text-xs sm:text-sm space-y-2 ${
                      ans.isCorrect
                        ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/60'
                        : 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold text-xs">
                      <span className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center text-[10px]">
                          {idx + 1}
                        </span>
                        <span className="text-slate-900 dark:text-white">Pregunta {idx + 1}</span>
                      </span>

                      <span className={`flex items-center gap-1 font-bold ${
                        ans.isCorrect ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'
                      }`}>
                        {ans.isCorrect ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" /> Correcta
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5" /> Incorrecta
                          </>
                        )}
                      </span>
                    </div>

                    <p className="font-semibold text-slate-900 dark:text-slate-100">
                      {ans.questionText}
                    </p>

                    <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1 text-xs">
                      <p className="text-slate-700 dark:text-slate-300">
                        <strong className="text-slate-500 dark:text-slate-400">Tu respuesta: </strong>
                        <span className={ans.isCorrect ? 'text-emerald-700 dark:text-emerald-400 font-bold' : 'text-rose-700 dark:text-rose-400 font-bold'}>
                          {ans.selectedOptionText}
                        </span>
                      </p>

                      {!ans.isCorrect && (
                        <p className="text-emerald-800 dark:text-emerald-300 font-medium">
                          <strong>Respuesta correcta: </strong>
                          {ans.correctOptionText}
                        </p>
                      )}

                      <p className="text-slate-600 dark:text-slate-400 text-[11px] pt-1 border-t border-slate-100 dark:border-slate-800">
                        <strong>Explicación: </strong>{ans.explanation}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Acciones finales */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={handleStartExam}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold hover:bg-indigo-50 dark:hover:bg-indigo-950 transition w-full sm:w-auto justify-center"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Rendir un nuevo intento</span>
              </button>

              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-xs w-full sm:w-auto"
              >
                Volver a la clase
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
