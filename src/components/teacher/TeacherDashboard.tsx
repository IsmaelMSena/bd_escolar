import React, { useState, useEffect } from 'react';
import { 
  Shield, Download, Eye, Sparkles, Trash2, 
  Search, Check, X, ArrowLeft, BookOpen, Layers,
  Award, Clock, CheckCircle2, XCircle, AlertTriangle,
  FileText, Filter, Calendar, LogOut, User
} from 'lucide-react';
import { 
  getAllAttempts, exportAttemptsToCSV, downloadCSV, 
  seedDemoClassroomData, clearAllLocalData, getAllUnitsProgress,
  getAllExamAttempts, exportExamAttemptsToCSV
} from '../../services/storageService';
import { isSupabaseConfigured, getSupabaseClient } from '../../services/supabaseClient';
import { QuizAttempt, UnitProgress, ExamAttempt } from '../../types';
import { MODULE_QUIZZES } from '../../data/quizzesData';
import { LEARNING_UNITS } from '../../data/unitsData';

interface TeacherDashboardProps {
  onBackToApp: () => void;
}

// Clave de acceso para demostraciones locales cuando Supabase no está conectado
const TEACHER_OFFLINE_PASSWORD = 'Profesor2026';

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ onBackToApp }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [authErrorMsg, setAuthErrorMsg] = useState<string | null>(null);
  const [isSubmittingAuth, setIsSubmittingAuth] = useState(false);
  const [teacherEmail, setTeacherEmail] = useState<string | null>(null);
  const [isOfflineDemoMode, setIsOfflineDemoMode] = useState(!isSupabaseConfigured);

  // Subpestañas del panel: 'exams' (Exámenes Integradores) | 'quizzes' (Cuestionarios Rápidos)
  const [activeTab, setActiveTab] = useState<'exams' | 'quizzes'>('exams');

  // Estado de Exámenes Integradores (Módulos 1 a 4)
  const [examAttempts, setExamAttempts] = useState<ExamAttempt[]>([]);
  const [filterExamModule, setFilterExamModule] = useState<number | 'all'>('all');
  const [searchExamStudent, setSearchExamStudent] = useState('');
  const [filterExamPassed, setFilterExamPassed] = useState<'all' | 'passed' | 'failed'>('all');
  const [filterExamReason, setFilterExamReason] = useState<'all' | 'voluntary' | 'timeout'>('all');
  const [selectedExamAttempt, setSelectedExamAttempt] = useState<ExamAttempt | null>(null);

  // Estado de Cuestionarios y Progreso
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>([]);
  const [filterQuizModule, setFilterQuizModule] = useState<number | 'all'>('all');
  const [searchQuizStudent, setSearchQuizStudent] = useState('');
  const [selectedQuizAttempt, setSelectedQuizAttempt] = useState<QuizAttempt | null>(null);
  const [unitsProgress, setUnitsProgress] = useState<Record<number, UnitProgress>>({});

  // Mensaje de notificación
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Comprobar sesión activa de Supabase Auth al montar
  useEffect(() => {
    const supabase = getSupabaseClient();
    if (supabase) {
      supabase.auth.getSession().then(async ({ data }) => {
        if (data.session?.user) {
          const { data: esDocente } = await supabase.rpc('es_docente');
          if (esDocente) {
            setIsAuthenticated(true);
            setTeacherEmail(data.session.user.email || 'Docente');
          }
        }
      }).catch((e) => console.warn('Error verificando sesión previa de Supabase:', e));
    }
  }, []);

  const loadAllData = async () => {
    try {
      const exams = await getAllExamAttempts();
      setExamAttempts(exams);
      const quizzes = await getAllAttempts();
      setQuizAttempts(quizzes);
      const uProgress = getAllUnitsProgress();
      setUnitsProgress(uProgress);
    } catch (e) {
      console.error('Error cargando datos docentes:', e);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadAllData();
    }
  }, [isAuthenticated]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthErrorMsg(null);

    const supabase = getSupabaseClient();

    if (supabase && !isOfflineDemoMode) {
      if (!emailInput.trim() || !passwordInput) {
        setAuthErrorMsg('Por favor ingresá tu email docente y contraseña.');
        return;
      }

      setIsSubmittingAuth(true);
      try {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: emailInput.trim(),
          password: passwordInput
        });

        if (authError || !authData.user) {
          setAuthErrorMsg('Credenciales inválidas de Supabase Auth.');
          setIsSubmittingAuth(false);
          return;
        }

        const { data: esDocente, error: rpcError } = await supabase.rpc('es_docente');
        if (rpcError || !esDocente) {
          await supabase.auth.signOut();
          setAuthErrorMsg('Acceso denegado: este usuario no está registrado en la tabla de docentes autorizados.');
          setIsSubmittingAuth(false);
          return;
        }

        setIsAuthenticated(true);
        setTeacherEmail(authData.user.email || 'Docente');
        setPasswordInput('');
        setEmailInput('');
      } catch (err: any) {
        setAuthErrorMsg(err?.message || 'Error de conexión con Supabase.');
      } finally {
        setIsSubmittingAuth(false);
      }
    } else {
      // Modo local de demostración en aula
      if (passwordInput === TEACHER_OFFLINE_PASSWORD) {
        setIsAuthenticated(true);
        setIsOfflineDemoMode(true);
        setTeacherEmail('Modo Demostración Local');
        setPasswordInput('');
      } else {
        setAuthErrorMsg('Contraseña incorrecta.');
      }
    }
  };

  const handleLogout = async () => {
    const supabase = getSupabaseClient();
    if (supabase && !isOfflineDemoMode) {
      await supabase.auth.signOut();
    }
    setIsAuthenticated(false);
    setTeacherEmail(null);
    setIsOfflineDemoMode(!isSupabaseConfigured);
  };

  // Exportar Exámenes a CSV
  const handleExportExamsCSV = async () => {
    if (filteredExamAttempts.length === 0) {
      setStatusMessage('No se encontraron exámenes para exportar con los filtros seleccionados.');
      setTimeout(() => setStatusMessage(null), 3500);
      return;
    }
    const csv = await exportExamAttemptsToCSV(filteredExamAttempts);
    const dateStr = new Date().toISOString().split('T')[0];
    downloadCSV(`resultados_examenes_bd_escolar_${dateStr}.csv`, csv);
    setStatusMessage(`Exportación completada: ${filteredExamAttempts.length} exámenes guardados.`);
    setTimeout(() => setStatusMessage(null), 3500);
  };

  // Exportar Cuestionarios Rápidos a CSV
  const handleExportQuizzesCSV = async () => {
    const csv = await exportAttemptsToCSV();
    const dateStr = new Date().toISOString().split('T')[0];
    downloadCSV(`cuestionarios_practica_bd_escolar_${dateStr}.csv`, csv);
    setStatusMessage('Cuestionarios rápidos exportados correctamente.');
    setTimeout(() => setStatusMessage(null), 3500);
  };

  const handleSeedDemo = () => {
    seedDemoClassroomData();
    loadAllData();
    setStatusMessage('Datos de simulación cargados para demostración en clase.');
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleClear = () => {
    if (window.confirm('¿Borrar todos los registros locales de prueba y exámenes?')) {
      clearAllLocalData();
      loadAllData();
      setStatusMessage('Almacenamiento local restablecido.');
      setTimeout(() => setStatusMessage(null), 3000);
    }
  };

  // Filtrado de Exámenes
  const filteredExamAttempts = examAttempts.filter((att) => {
    if (filterExamModule !== 'all' && att.module_id !== filterExamModule) return false;
    if (searchExamStudent) {
      const q = searchExamStudent.toLowerCase();
      const matchName = att.student_name.toLowerCase().includes(q);
      const matchId = att.student_id.toLowerCase().includes(q);
      const matchClassroom = (att.classroom_code || '').toLowerCase().includes(q);
      if (!matchName && !matchId && !matchClassroom) return false;
    }
    if (filterExamPassed === 'passed' && !att.passed) return false;
    if (filterExamPassed === 'failed' && att.passed) return false;
    if (filterExamReason !== 'all' && att.completion_reason !== filterExamReason) return false;
    return true;
  });

  // Filtrado de Cuestionarios
  const filteredQuizAttempts = quizAttempts.filter((att) => {
    if (filterQuizModule !== 'all' && att.moduleId !== filterQuizModule) return false;
    if (searchQuizStudent && !att.studentName.toLowerCase().includes(searchQuizStudent.toLowerCase())) return false;
    return true;
  });

  // Formato de segundos
  const formatSeconds = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s}s`;
  };

  // =========================================================================
  // PANTALLA DE ACCESO DOCENTE CON CLAVE O SUPABASE AUTH
  // =========================================================================
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-14 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm text-center space-y-6 transition-colors">
        <div className="w-14 h-14 mx-auto bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center">
          <Shield className="w-7 h-7" />
        </div>

        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Acceso Docente
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isSupabaseConfigured && !isOfflineDemoMode
              ? 'Iniciá sesión con tu cuenta docente de Supabase para ver los exámenes centralizados.'
              : 'Ingresá la contraseña docente para acceder en modo local de aula.'}
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 text-left">
          {isSupabaseConfigured && !isOfflineDemoMode ? (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Correo Electrónico Docente
                </label>
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => {
                    setEmailInput(e.target.value);
                    if (authErrorMsg) setAuthErrorMsg(null);
                  }}
                  placeholder="profesor@colegio.edu.ar"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  autoFocus
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Contraseña de Supabase Auth
                </label>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    if (authErrorMsg) setAuthErrorMsg(null);
                  }}
                  placeholder="••••••••••••"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  required
                />
              </div>
            </>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Contraseña Docente (Modo Aula)
              </label>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  if (authErrorMsg) setAuthErrorMsg(null);
                }}
                placeholder="Ingresá la contraseña docente"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                autoFocus
                required
              />
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                Clave por defecto: <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded font-mono text-indigo-600 dark:text-indigo-400">Profesor2026</code>
              </p>
            </div>
          )}

          {authErrorMsg && (
            <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 font-medium">
              {authErrorMsg}
            </div>
          )}

          <div className="space-y-2 pt-1">
            <button
              type="submit"
              disabled={isSubmittingAuth}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-bold text-xs shadow-xs transition cursor-pointer flex items-center justify-center gap-2"
            >
              {isSubmittingAuth 
                ? 'Verificando credenciales...' 
                : (isSupabaseConfigured && !isOfflineDemoMode ? 'INGRESAR CON SUPABASE AUTH' : 'INGRESAR AL MODO LOCAL')}
            </button>

            {isSupabaseConfigured && (
              <button
                type="button"
                onClick={() => {
                  setIsOfflineDemoMode(!isOfflineDemoMode);
                  setAuthErrorMsg(null);
                }}
                className="w-full py-2 text-xs text-indigo-600 dark:text-indigo-400 hover:underline transition"
              >
                {isOfflineDemoMode
                  ? '← Cambiar a inicio con Supabase Auth (Nube)'
                  : '¿Sin conexión? Entrar en modo demostración local'}
              </button>
            )}

            <button
              type="button"
              onClick={onBackToApp}
              className="w-full py-2 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            >
              Volver al inicio
            </button>
          </div>
        </form>

        <p className="text-[11px] text-slate-400 dark:text-slate-500 border-t border-slate-100 dark:border-slate-800 pt-4 leading-relaxed">
          {isSupabaseConfigured
            ? 'Los resultados de exámenes están protegidos en Supabase mediante Row Level Security (RLS) y sólo los docentes autorizados pueden consultarlos.'
            : 'Nota de arquitectura: en modo local para aula sin conexión, los datos residen en el navegador.'}
        </p>
      </div>
    );
  }

  // Métricas generales de exámenes
  const totalExamsCount = examAttempts.length;
  const passedExamsCount = examAttempts.filter(a => a.passed).length;
  const examPassRate = totalExamsCount > 0 ? Math.round((passedExamsCount / totalExamsCount) * 100) : 0;
  const uniqueStudentsCount = new Set(examAttempts.map(a => a.student_id)).size;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16 animate-fadeIn">
      {/* Toast de estado */}
      {statusMessage && (
        <div className="p-3.5 bg-indigo-600 text-white rounded-2xl text-xs font-semibold flex items-center justify-between shadow-lg shadow-indigo-600/20 animate-fadeIn">
          <span>{statusMessage}</span>
          <button onClick={() => setStatusMessage(null)} className="text-white/80 hover:text-white">✕</button>
        </div>
      )}

      {/* Header General */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm transition-colors space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 uppercase">
                Panel Docente
              </span>
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                isSupabaseConfigured && !isOfflineDemoMode ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}>
                {isSupabaseConfigured && !isOfflineDemoMode ? '● Supabase Nube' : '○ Modo Aula Local (Offline)'}
              </span>
              {teacherEmail && (
                <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300 flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                  <User className="w-3 h-3 text-indigo-500" /> {teacherEmail}
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              Seguimiento Pedagógico y Calificaciones
            </h1>
          </div>

          {/* Acciones principales */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={activeTab === 'exams' ? handleExportExamsCSV : handleExportQuizzesCSV}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition cursor-pointer"
              title="Descargar resultados en CSV compatible con Excel y LibreOffice"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar {activeTab === 'exams' ? 'Exámenes CSV' : 'Cuestionarios CSV'}</span>
            </button>

            <button
              onClick={handleSeedDemo}
              className="px-3 py-2 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center gap-1 transition cursor-pointer"
              title="Cargar intentos de demostración para pruebas docentes"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Simular curso</span>
            </button>

            <button
              onClick={handleClear}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition cursor-pointer"
              title="Limpiar datos locales"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <button
              onClick={handleLogout}
              className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-1.5 transition cursor-pointer"
              title="Cerrar sesión del panel docente"
            >
              <LogOut className="w-3.5 h-3.5" /> Cerrar Sesión
            </button>

            <button
              onClick={onBackToApp}
              className="px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 font-semibold text-xs flex items-center gap-1 transition cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Volver al Inicio
            </button>
          </div>
        </div>

        {/* Pestañas de sección */}
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab('exams')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'exams'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Resultados de Exámenes Integradores (Módulos 1 a 4)</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
              {examAttempts.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('quizzes')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'quizzes'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Cuestionarios Rápidos de Práctica</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/10 dark:bg-white/10">
              {quizAttempts.length}
            </span>
          </button>
        </div>

        {/* Resumen numérico */}
        {activeTab === 'exams' ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/80">
              <div className="text-xl font-black text-slate-900 dark:text-white font-mono">{totalExamsCount}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Exámenes Rendidos</div>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/80">
              <div className="text-xl font-black text-emerald-700 dark:text-emerald-400 font-mono">{passedExamsCount}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Aprobados (≥ 70 %)</div>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/80">
              <div className="text-xl font-black text-indigo-600 dark:text-indigo-400 font-mono">{examPassRate} %</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Tasa de Aprobación</div>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/80">
              <div className="text-xl font-black text-amber-600 dark:text-amber-400 font-mono">{uniqueStudentsCount}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Estudiantes Evaluados</div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/80">
              <div className="text-xl font-black text-slate-900 dark:text-white font-mono">{quizAttempts.length}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Cuestionarios Rápidos</div>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/80">
              <div className="text-xl font-black text-emerald-700 dark:text-emerald-400 font-mono">
                {quizAttempts.filter(a => a.score >= 60).length}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Aprobados (≥ 60 %)</div>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/80">
              <div className="text-xl font-black text-indigo-600 dark:text-indigo-400 font-mono">
                {Object.values(unitsProgress).filter(u => u.activityCompleted).length} / 10
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Unidades Visitadas</div>
            </div>
          </div>
        )}
      </div>

      {/* =====================================================================
          SECCIÓN 1: RESULTADOS DE EXÁMENES INTEGRADORES (MÓDULOS 1 A 4)
          ===================================================================== */}
      {activeTab === 'exams' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4 transition-colors">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800 text-xs">
            {/* Buscador */}
            <div className="flex items-center gap-2 flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Buscar por estudiante o ID..."
                value={searchExamStudent}
                onChange={(e) => setSearchExamStudent(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
              />
            </div>

            {/* Filtros */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Filtro Módulo */}
              <div className="flex items-center gap-1">
                <span className="text-slate-500 dark:text-slate-400 font-semibold">Módulo:</span>
                <select
                  value={filterExamModule}
                  onChange={(e) => setFilterExamModule(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold text-slate-700 dark:text-slate-200"
                >
                  <option value="all">Todos (Módulos 1 a 4)</option>
                  <option value={1}>Módulo 1: ¿Qué es una base de datos?</option>
                  <option value={2}>Módulo 2: Conocer las tablas</option>
                  <option value={3}>Módulo 3: Claves PK y FK</option>
                  <option value={4}>Módulo 4: Relaciones 1:N y N:M</option>
                </select>
              </div>

              {/* Filtro Aprobación */}
              <div className="flex items-center gap-1">
                <span className="text-slate-500 dark:text-slate-400 font-semibold">Estado:</span>
                <select
                  value={filterExamPassed}
                  onChange={(e) => setFilterExamPassed(e.target.value as any)}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold text-slate-700 dark:text-slate-200"
                >
                  <option value="all">Todos los estados</option>
                  <option value="passed">Aprobados (≥ 70 %)</option>
                  <option value="failed">Desaprobados (&lt; 70 %)</option>
                </select>
              </div>

              {/* Filtro Motivo */}
              <div className="flex items-center gap-1">
                <span className="text-slate-500 dark:text-slate-400 font-semibold">Motivo:</span>
                <select
                  value={filterExamReason}
                  onChange={(e) => setFilterExamReason(e.target.value as any)}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold text-slate-700 dark:text-slate-200"
                >
                  <option value="all">Todos los motivos</option>
                  <option value="voluntary">Entrega voluntaria</option>
                  <option value="timeout">Tiempo agotado (40 min)</option>
                </select>
              </div>
            </div>
          </div>

          {filteredExamAttempts.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs space-y-2">
              <Award className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600" />
              <p className="font-semibold text-slate-600 dark:text-slate-400">
                No hay resultados de exámenes integradores que coincidan con la búsqueda.
              </p>
              <p className="text-slate-400 dark:text-slate-500 text-[11px]">
                Los estudiantes verán el examen integrador al final de cada uno de los módulos 1, 2, 3 y 4.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 font-semibold">
                  <tr>
                    <th className="p-3">Estudiante / ID</th>
                    <th className="p-3">Módulo</th>
                    <th className="p-3">Fecha y Hora</th>
                    <th className="p-3 text-center">Duración</th>
                    <th className="p-3 text-center">Puntaje</th>
                    <th className="p-3 text-center">Aprobación</th>
                    <th className="p-3">Motivo</th>
                    <th className="p-3 text-center">N.° Intento</th>
                    <th className="p-3 text-right">Detalle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                  {filteredExamAttempts.map((att) => (
                    <tr key={att.attempt_id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/50">
                      <td className="p-3 font-semibold">
                        <div className="text-slate-900 dark:text-white flex items-center gap-1.5 flex-wrap">
                          <span>{att.student_name}</span>
                          {att.classroom_code && (
                            <span className="px-1.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-[10px] font-mono">
                              {att.classroom_code}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] font-mono text-slate-400">{att.student_id}</div>
                      </td>
                      <td className="p-3 font-semibold text-indigo-700 dark:text-indigo-400">
                        Módulo {att.module_id}
                      </td>
                      <td className="p-3 text-slate-500 dark:text-slate-400">
                        {new Date(att.started_at).toLocaleString('es-AR', {
                          day: '2-digit', month: '2-digit', year: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </td>
                      <td className="p-3 text-center font-mono text-slate-600 dark:text-slate-300">
                        {formatSeconds(att.duration_seconds)}
                      </td>
                      <td className="p-3 text-center font-mono font-bold">
                        <span className={`px-2 py-0.5 rounded-full text-[11px] ${
                          att.passed
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                            : 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
                        }`}>
                          {att.score_percentage} % ({att.correct_answers}/20)
                        </span>
                      </td>
                      <td className="p-3 text-center font-semibold">
                        {att.passed ? (
                          <span className="text-emerald-700 dark:text-emerald-400 flex items-center justify-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Aprobado
                          </span>
                        ) : (
                          <span className="text-rose-700 dark:text-rose-400 flex items-center justify-center gap-1">
                            <XCircle className="w-3.5 h-3.5" /> Desaprobado
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-slate-600 dark:text-slate-400 text-[11px]">
                        {att.completion_reason === 'voluntary' ? 'Entrega voluntaria' : 'Tiempo agotado (40m)'}
                      </td>
                      <td className="p-3 text-center font-mono text-slate-500">
                        #{att.attempt_number}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => setSelectedExamAttempt(att)}
                          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" /> Ver examen
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* =====================================================================
          SECCIÓN 2: CALIFICACIONES DE CUESTIONARIOS RÁPIDOS
          ===================================================================== */}
      {activeTab === 'quizzes' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4 transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800 text-xs">
            <div className="flex items-center gap-2 flex-1 max-w-xs">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Buscar estudiante..."
                value={searchQuizStudent}
                onChange={(e) => setSearchQuizStudent(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 dark:text-slate-400 font-semibold">Unidad:</span>
              <select
                value={filterQuizModule}
                onChange={(e) => setFilterQuizModule(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold text-slate-700 dark:text-slate-200"
              >
                <option value="all">Todas las unidades</option>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(m => (
                  <option key={m} value={m}>Unidad {m}</option>
                ))}
              </select>
            </div>
          </div>

          {filteredQuizAttempts.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs">
              No hay cuestionarios registrados para mostrar.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 font-semibold">
                  <tr>
                    <th className="p-3">Estudiante</th>
                    <th className="p-3">Aula</th>
                    <th className="p-3">Unidad</th>
                    <th className="p-3">Fecha</th>
                    <th className="p-3 text-center">Puntaje</th>
                    <th className="p-3 text-center">Aciertos</th>
                    <th className="p-3 text-right">Detalle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                  {filteredQuizAttempts.map((att) => (
                    <tr key={att.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/50">
                      <td className="p-3 font-semibold text-slate-900 dark:text-white">{att.studentName}</td>
                      <td className="p-3 font-mono text-slate-500 dark:text-slate-400">{att.classroomCode}</td>
                      <td className="p-3 font-semibold text-indigo-700 dark:text-indigo-400">Unidad {att.moduleId}</td>
                      <td className="p-3 text-slate-500 dark:text-slate-400">{new Date(att.timestamp).toLocaleDateString('es-AR')}</td>
                      <td className="p-3 text-center font-mono font-bold">
                        <span className={`px-2 py-0.5 rounded-full text-[11px] ${
                          att.score >= 60 ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300' : 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
                        }`}>
                          {att.score} pts
                        </span>
                      </td>
                      <td className="p-3 text-center font-mono text-slate-600 dark:text-slate-400">
                        {att.correctCount}/{att.totalQuestions}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => setSelectedQuizAttempt(att)}
                          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" /> Ver respuestas
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* =====================================================================
          MODAL DE DETALLE DE EXAMEN INTEGRADOR
          ===================================================================== */}
      {selectedExamAttempt && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-3xl w-full max-h-[88vh] overflow-y-auto p-6 space-y-5 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block">
                  Examen Integrador · Intento #{selectedExamAttempt.attempt_number}
                </span>
                <h4 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  {selectedExamAttempt.student_name} — {selectedExamAttempt.module_name}
                </h4>
              </div>
              <button
                onClick={() => setSelectedExamAttempt(null)}
                className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Ficha técnica rápida */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-center">
              <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <span className="text-slate-400 block text-[10px]">Puntaje</span>
                <span className="font-bold text-slate-900 dark:text-white text-sm font-mono">
                  {selectedExamAttempt.score_percentage}% ({selectedExamAttempt.correct_answers}/20)
                </span>
              </div>
              <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <span className="text-slate-400 block text-[10px]">Resultado</span>
                <span className={`font-bold text-sm ${selectedExamAttempt.passed ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {selectedExamAttempt.passed ? 'Aprobado' : 'Desaprobado'}
                </span>
              </div>
              <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <span className="text-slate-400 block text-[10px]">Duración</span>
                <span className="font-bold text-slate-900 dark:text-white text-sm font-mono">
                  {formatSeconds(selectedExamAttempt.duration_seconds)}
                </span>
              </div>
              <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <span className="text-slate-400 block text-[10px]">Motivo</span>
                <span className="font-bold text-slate-700 dark:text-slate-300 text-xs">
                  {selectedExamAttempt.completion_reason === 'voluntary' ? 'Voluntario' : 'Tiempo agotado'}
                </span>
              </div>
            </div>

            {/* Lista de las 20 preguntas y respuestas */}
            <div className="space-y-3 text-xs">
              <span className="font-bold text-slate-700 dark:text-slate-300 block uppercase tracking-wider text-[11px]">
                Detalle de las 20 preguntas respondidas:
              </span>

              {selectedExamAttempt.answers.map((ans, idx) => (
                <div
                  key={ans.questionId}
                  className={`p-3.5 rounded-2xl border ${
                    ans.isCorrect
                      ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/60'
                      : 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold mb-1">
                    <span className="text-slate-800 dark:text-slate-200">Pregunta {idx + 1}</span>
                    <span className={ans.isCorrect ? 'text-emerald-700 dark:text-emerald-400 font-bold' : 'text-rose-700 dark:text-rose-400 font-bold'}>
                      {ans.isCorrect ? '✓ Correcta' : '✗ Incorrecta'}
                    </span>
                  </div>

                  <p className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
                    {ans.questionText}
                  </p>

                  <div className="space-y-1 text-slate-700 dark:text-slate-300">
                    <p>
                      <strong>Respuesta del alumno: </strong>
                      <span className={ans.isCorrect ? 'text-emerald-700 dark:text-emerald-400 font-bold' : 'text-rose-700 dark:text-rose-400 font-bold'}>
                        {ans.selectedOptionText}
                      </span>
                    </p>
                    {!ans.isCorrect && (
                      <p className="text-emerald-800 dark:text-emerald-300 font-medium">
                        <strong>Respuesta correcta: </strong>{ans.correctOptionText}
                      </p>
                    )}
                    <p className="text-slate-500 dark:text-slate-400 text-[11px] pt-1 border-t border-slate-100 dark:border-slate-800">
                      <strong>Explicación: </strong>{ans.explanation}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setSelectedExamAttempt(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-800 text-white font-bold text-xs cursor-pointer"
              >
                Cerrar Detalle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL DE DETALLE DE CUESTIONARIO RÁPIDO
          ===================================================================== */}
      {selectedQuizAttempt && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full max-h-[85vh] overflow-y-auto p-6 space-y-4 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase">Cuestionario de Práctica</span>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  {selectedQuizAttempt.studentName} • Unidad {selectedQuizAttempt.moduleId} ({selectedQuizAttempt.score} pts)
                </h4>
              </div>
              <button
                onClick={() => setSelectedQuizAttempt(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {selectedQuizAttempt.answers.map((ans, idx) => {
                const legacyQ = MODULE_QUIZZES[selectedQuizAttempt.moduleId]?.find(q => q.id === ans.questionId);
                const unitQ = LEARNING_UNITS.find(u => u.number === selectedQuizAttempt.moduleId)?.checkQuestions.find(q => q.id === ans.questionId);
                const qObj = legacyQ || (unitQ ? {
                  question: unitQ.question,
                  options: unitQ.options,
                  correctIndex: unitQ.correctIndex,
                  explanation: unitQ.explanation
                } : null);

                return (
                  <div key={ans.questionId} className={`p-3 rounded-xl border ${
                    ans.isCorrect ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800' : 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800'
                  }`}>
                    <div className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-200 mb-1">
                      <span>Pregunta {idx + 1}</span>
                      <span className={ans.isCorrect ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}>
                        {ans.isCorrect ? '✓ Correcta' : '✗ Incorrecta'}
                      </span>
                    </div>

                    <p className="font-semibold text-slate-900 dark:text-white mb-1.5">
                      {qObj?.question || `Pregunta ID: ${ans.questionId}`}
                    </p>

                    {qObj && (
                      <div className="space-y-1">
                        <p className="text-slate-600 dark:text-slate-300">
                          <strong>Seleccionó: </strong>
                          <span className={ans.isCorrect ? 'text-emerald-800 dark:text-emerald-300 font-bold' : 'text-rose-800 dark:text-rose-300 font-bold'}>
                            {ans.selectedIndex >= 0 ? qObj.options[ans.selectedIndex] : 'Sin responder'}
                          </span>
                        </p>
                        {!ans.isCorrect && (
                          <p className="text-emerald-900 dark:text-emerald-300 font-medium">
                            <strong>Respuesta correcta: </strong>{qObj.options[qObj.correctIndex]}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setSelectedQuizAttempt(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-800 text-white font-bold text-xs cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
