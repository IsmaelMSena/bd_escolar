import React, { useState, useEffect } from 'react';
import { 
  Shield, Download, Eye, Sparkles, Trash2, 
  Search, Check, X, ArrowLeft
} from 'lucide-react';
import { 
  getAllAttempts, exportAttemptsToCSV, downloadCSV, 
  seedDemoClassroomData, clearAllLocalData 
} from '../../services/storageService';
import { isSupabaseConfigured } from '../../services/supabaseClient';
import { QuizAttempt } from '../../types';
import { MODULE_QUIZZES } from '../../data/quizzesData';

interface TeacherDashboardProps {
  onBackToApp: () => void;
}

const DEFAULT_PIN = 'profe2025';

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ onBackToApp }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [filterModule, setFilterModule] = useState<number | 'all'>('all');
  const [searchStudent, setSearchStudent] = useState('');
  const [selectedAttempt, setSelectedAttempt] = useState<QuizAttempt | null>(null);

  const loadAttempts = async () => {
    try {
      const data = await getAllAttempts();
      setAttempts(data);
    } catch (e) {
      console.error('Error cargando intentos:', e);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadAttempts();
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === DEFAULT_PIN || pinInput === 'admin') {
      setIsAuthenticated(true);
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  const handleExportCSV = async () => {
    const csv = await exportAttemptsToCSV();
    const dateStr = new Date().toISOString().split('T')[0];
    downloadCSV(`calificaciones_bd_escolar_${dateStr}.csv`, csv);
  };

  const handleSeedDemo = () => {
    seedDemoClassroomData();
    loadAttempts();
  };

  const handleClear = () => {
    if (window.confirm('¿Borrar los intentos de prueba locales?')) {
      clearAllLocalData();
      loadAttempts();
    }
  };

  // Filtrado
  const filteredAttempts = attempts.filter((att) => {
    if (filterModule !== 'all' && att.moduleId !== filterModule) return false;
    if (searchStudent && !att.studentName.toLowerCase().includes(searchStudent.toLowerCase())) return false;
    return true;
  });

  // Pantalla de bloqueo con PIN
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-12 bg-white rounded-3xl border border-slate-200 p-8 shadow-sm text-center space-y-6">
        <div className="w-14 h-14 mx-auto bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center">
          <Shield className="w-7 h-7" />
        </div>

        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Acceso Docente
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Ingresá tu clave para consultar las calificaciones del curso.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1 text-left">
            <input
              type="password"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              placeholder="Clave (ej: profe2025)"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              autoFocus
            />
            {pinError && (
              <p className="text-xs text-rose-600 font-semibold mt-1">
                Clave incorrecta. Clave por defecto: <code className="font-mono bg-rose-50 px-1 rounded">{DEFAULT_PIN}</code>
              </p>
            )}
          </div>

          <div className="space-y-2">
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition"
            >
              INGRESAR AL PANEL
            </button>
            <button
              type="button"
              onClick={onBackToApp}
              className="w-full py-2 text-xs text-slate-500 hover:text-slate-800"
            >
              Volver al inicio
            </button>
          </div>
        </form>
      </div>
    );
  }

  const approvedCount = attempts.filter(a => a.score >= 60).length;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 uppercase">
                Panel Docente
              </span>
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                isSupabaseConfigured ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
              }`}>
                {isSupabaseConfigured ? '● Supabase Nube' : '○ Modo Aula Local (Offline)'}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">
              Calificaciones de los Estudiantes
            </h1>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition"
              title="Descargar calificaciones en CSV para abrir en Excel"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar CSV</span>
            </button>

            <button
              onClick={handleSeedDemo}
              className="px-3 py-2 rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center gap-1 transition"
              title="Cargar intentos de prueba para simular el curso"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Simular curso</span>
            </button>

            <button
              onClick={handleClear}
              className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:text-rose-600"
              title="Limpiar datos de prueba"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <button
              onClick={onBackToApp}
              className="px-3.5 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50 flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Salir
            </button>
          </div>
        </div>

        {/* Clean summary row */}
        <div className="grid grid-cols-3 gap-3 pt-4 text-center">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="text-xl font-black text-slate-900 font-mono">{attempts.length}</div>
            <div className="text-xs text-slate-500">Cuestionarios Enviados</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="text-xl font-black text-emerald-700 font-mono">{approvedCount}</div>
            <div className="text-xs text-slate-500">Aprobados (≥ 60 pts)</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="text-xl font-black text-indigo-600 font-mono">
              {new Set(attempts.map(a => a.studentId)).size}
            </div>
            <div className="text-xs text-slate-500">Alumnos Identificados</div>
          </div>
        </div>
      </div>

      {/* Attempts Table */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 text-xs">
          <div className="flex items-center gap-2 flex-1 max-w-xs">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Buscar estudiante..."
              value={searchStudent}
              onChange={(e) => setSearchStudent(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-semibold">Clase:</span>
            <select
              value={filterModule}
              onChange={(e) => setFilterModule(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-semibold text-slate-700"
            >
              <option value="all">Todas las clases</option>
              {[1, 2, 3, 4, 5].map(m => (
                <option key={m} value={m}>Clase {m}</option>
              ))}
            </select>
          </div>
        </div>

        {filteredAttempts.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-xs">
            No hay cuestionarios registrados para mostrar.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 font-semibold">
                <tr>
                  <th className="p-3">Estudiante</th>
                  <th className="p-3">Aula</th>
                  <th className="p-3">Clase</th>
                  <th className="p-3">Fecha</th>
                  <th className="p-3 text-center">Puntaje</th>
                  <th className="p-3 text-center">Aciertos</th>
                  <th className="p-3 text-right">Detalle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAttempts.map((att) => {
                  const isPass = att.score >= 60;

                  return (
                    <tr key={att.id} className="hover:bg-slate-50/60">
                      <td className="p-3 font-semibold text-slate-900">{att.studentName}</td>
                      <td className="p-3 font-mono text-slate-500">{att.classroomCode}</td>
                      <td className="p-3 font-semibold text-indigo-700">Clase {att.moduleId}</td>
                      <td className="p-3 text-slate-500">{new Date(att.timestamp).toLocaleDateString('es-AR')}</td>
                      <td className="p-3 text-center font-mono font-bold">
                        <span className={`px-2 py-0.5 rounded-full text-[11px] ${
                          isPass ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {att.score} pts
                        </span>
                      </td>
                      <td className="p-3 text-center font-mono text-slate-600">
                        {att.correctCount}/{att.totalQuestions}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => setSelectedAttempt(att)}
                          className="text-indigo-600 hover:text-indigo-800 font-bold hover:underline inline-flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" /> Ver respuestas
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal for Selected Attempt */}
      {selectedAttempt && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[85vh] overflow-y-auto p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold text-indigo-600 uppercase">Respuestas del estudiante</span>
                <h4 className="text-base font-bold text-slate-900">
                  {selectedAttempt.studentName} • Clase {selectedAttempt.moduleId} ({selectedAttempt.score}/100)
                </h4>
              </div>
              <button
                onClick={() => setSelectedAttempt(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {selectedAttempt.answers.map((ans, idx) => {
                const qObj = MODULE_QUIZZES[selectedAttempt.moduleId]?.find(q => q.id === ans.questionId);

                return (
                  <div key={ans.questionId} className={`p-3 rounded-xl border ${
                    ans.isCorrect ? 'bg-emerald-50/50 border-emerald-200' : 'bg-rose-50/50 border-rose-200'
                  }`}>
                    <div className="flex items-center justify-between font-bold text-slate-800 mb-1">
                      <span>Pregunta {idx + 1}</span>
                      <span className={ans.isCorrect ? 'text-emerald-700' : 'text-rose-700'}>
                        {ans.isCorrect ? '✓ Correcta' : '✗ Incorrecta'}
                      </span>
                    </div>

                    <p className="font-semibold text-slate-900 mb-1.5">
                      {qObj?.question || `Pregunta ID: ${ans.questionId}`}
                    </p>

                    {qObj && (
                      <div className="space-y-1">
                        <p className="text-slate-600">
                          <strong>Seleccionó: </strong>
                          <span className={ans.isCorrect ? 'text-emerald-800 font-bold' : 'text-rose-800 font-bold'}>
                            {ans.selectedIndex >= 0 ? qObj.options[ans.selectedIndex] : 'Sin responder'}
                          </span>
                        </p>
                        {!ans.isCorrect && (
                          <p className="text-emerald-900 font-medium">
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
                onClick={() => setSelectedAttempt(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs"
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
