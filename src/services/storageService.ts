import { StudentSession, QuizAttempt, ModuleProgress, UnitProgress, ExamAttempt, ActiveExamSession } from '../types';
import { getSupabaseClient } from './supabaseClient';

const STORAGE_KEYS = {
  CURRENT_STUDENT: 'bd_escolar_student_session',
  ATTEMPTS: 'bd_escolar_quiz_attempts',
  MODULES_PROGRESS: 'bd_escolar_modules_progress',
  UNITS_PROGRESS: 'bd_escolar_units_progress',
  EXAM_ATTEMPTS: 'bd_escolar_exam_attempts',
  ACTIVE_EXAM_PREFIX: 'bd_escolar_active_exam_',
};

// Generador de ID simple y seguro
export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'id_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now();
}

/* ==========================================================================
   SESIÓN DEL ESTUDIANTE Y TOKEN DE SEGURIDAD
   ========================================================================== */

export function getOrCreateStudentToken(studentId: string): string {
  try {
    const key = `bd_escolar_token_${studentId}`;
    let token = localStorage.getItem(key);
    if (!token) {
      token = generateUUID().replace(/-/g, '') + Math.random().toString(36).substring(2);
      localStorage.setItem(key, token);
    }
    return token;
  } catch {
    return generateUUID().replace(/-/g, '');
  }
}

export function getCurrentStudent(): StudentSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_STUDENT);
    if (!raw) return null;
    const session: StudentSession = JSON.parse(raw);
    if (!session.token) {
      session.token = getOrCreateStudentToken(session.id);
      localStorage.setItem(STORAGE_KEYS.CURRENT_STUDENT, JSON.stringify(session));
    }
    return session;
  } catch (e) {
    console.error('Error leyendo sesión del estudiante:', e);
    return null;
  }
}

export async function saveCurrentStudent(student: StudentSession): Promise<void> {
  try {
    if (!student.token) {
      student.token = getOrCreateStudentToken(student.id);
    }
    localStorage.setItem(STORAGE_KEYS.CURRENT_STUDENT, JSON.stringify(student));
    
    // Si Supabase está disponible, registra o actualiza el estudiante de forma segura vía RPC
    const supabase = getSupabaseClient();
    if (supabase) {
      const { error } = await supabase.rpc('registrar_estudiante', {
        p_id: student.id,
        p_token: student.token,
        p_nombre: student.name,
        p_codigo_aula: student.classroomCode,
        p_avatar: student.avatar || '🎓'
      });
      if (error) {
        console.warn('Registro en Supabase (RPC registrar_estudiante):', error.message);
      }
    }
  } catch (e) {
    console.error('Error guardando estudiante:', e);
  }
}

export async function startServerExamSession(
  sessionId: string,
  studentId: string,
  token: string,
  moduleId: number
): Promise<{ success: boolean; error?: string; sessionData?: any }> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    // Si Supabase no está configurado, la app opera en modo local
    return { success: true };
  }

  try {
    const { data, error } = await supabase.rpc('iniciar_examen', {
      p_sesion_id: sessionId,
      p_estudiante_id: studentId,
      p_token: token,
      p_modulo_id: moduleId
    });

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true, sessionData: data };
  } catch (e: any) {
    return { success: false, error: e?.message || 'Error de conexión con el servidor de exámenes.' };
  }
}

/* ==========================================================================
   PROGRESO DE MÓDULOS
   ========================================================================== */

export function getAllModulesProgress(): Record<number, ModuleProgress> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MODULES_PROGRESS);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error leyendo progreso de módulos:', e);
    return {};
  }
}

export function saveModuleProgress(progress: ModuleProgress): void {
  try {
    const all = getAllModulesProgress();
    const existing = all[progress.moduleId];
    
    all[progress.moduleId] = {
      ...existing,
      ...progress,
      attemptsCount: (existing?.attemptsCount || 0) + (progress.quizScore !== undefined ? 1 : 0),
      lastVisitedAt: new Date().toISOString()
    };
    
    localStorage.setItem(STORAGE_KEYS.MODULES_PROGRESS, JSON.stringify(all));
  } catch (e) {
    console.error('Error guardando progreso del módulo:', e);
  }
}

/* ==========================================================================
   PROGRESO DE LAS 10 UNIDADES DE APRENDIZAJE
   ========================================================================== */

export function getAllUnitsProgress(): Record<number, UnitProgress> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.UNITS_PROGRESS);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error leyendo progreso de unidades:', e);
    return {};
  }
}

export function saveUnitProgress(update: {
  unitId: number;
  visited?: boolean;
  activityCompleted?: boolean;
  quizScore?: number;
}): void {
  try {
    const all = getAllUnitsProgress();
    const existing = all[update.unitId] || {
      unitId: update.unitId,
      visited: false,
      activityCompleted: false,
      lastVisitedAt: new Date().toISOString()
    };

    all[update.unitId] = {
      ...existing,
      ...update,
      visited: update.visited !== undefined ? update.visited : existing.visited,
      activityCompleted: update.activityCompleted !== undefined ? update.activityCompleted : existing.activityCompleted,
      quizScore: update.quizScore !== undefined ? update.quizScore : existing.quizScore,
      lastVisitedAt: new Date().toISOString()
    };

    localStorage.setItem(STORAGE_KEYS.UNITS_PROGRESS, JSON.stringify(all));
  } catch (e) {
    console.error('Error guardando progreso de unidad:', e);
  }
}

/* ==========================================================================
   INTENTOS DE CUESTIONARIOS
   ========================================================================== */

export function getLocalAttempts(): QuizAttempt[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ATTEMPTS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error leyendo intentos locales:', e);
    return [];
  }
}

export async function saveQuizAttempt(attempt: QuizAttempt): Promise<void> {
  try {
    // 1. Guardar localmente
    const attempts = getLocalAttempts();
    attempts.unshift(attempt);
    localStorage.setItem(STORAGE_KEYS.ATTEMPTS, JSON.stringify(attempts));

    // 2. Actualizar progreso del módulo local
    const isPassed = attempt.score >= 60;
    saveModuleProgress({
      moduleId: attempt.moduleId,
      isCompleted: isPassed,
      quizScore: attempt.score,
      quizPassed: isPassed,
      attemptsCount: 1
    });

    // 3. Persistir en Supabase si está activo
    const supabase = getSupabaseClient();
    if (supabase) {
      // Garantizar que el estudiante exista en public.estudiantes antes de insertar en tabla hija
      const currentStudent = getCurrentStudent();
      if (currentStudent && currentStudent.id === attempt.studentId) {
        await saveCurrentStudent(currentStudent);
      }

      await supabase.from('intentos_cuestionarios').insert({
        id: attempt.id,
        estudiante_id: attempt.studentId,
        nombre_estudiante: attempt.studentName,
        codigo_aula: attempt.classroomCode,
        modulo_id: attempt.moduleId,
        puntaje: attempt.score,
        total_preguntas: attempt.totalQuestions,
        respuestas_correctas: attempt.correctCount,
        respuestas_detalle: attempt.answers,
        creado_el: attempt.timestamp
      });
    }
  } catch (e) {
    console.error('Error guardando intento de cuestionario:', e);
  }
}

export async function getAllAttempts(filters?: {
  moduleId?: number;
  classroomCode?: string;
  studentId?: string;
}): Promise<QuizAttempt[]> {
  const supabase = getSupabaseClient();
  
  if (supabase) {
    try {
      let query = supabase.from('intentos_cuestionarios').select('*').order('creado_el', { ascending: false });
      
      if (filters?.moduleId) query = query.eq('modulo_id', filters.moduleId);
      if (filters?.classroomCode) query = query.eq('codigo_aula', filters.classroomCode);
      if (filters?.studentId) query = query.eq('estudiante_id', filters.studentId);
      
      const { data, error } = await query;
      if (!error && data) {
        return data.map((d: any) => ({
          id: d.id,
          studentId: d.estudiante_id,
          studentName: d.nombre_estudiante,
          classroomCode: d.codigo_aula,
          moduleId: d.modulo_id,
          score: d.puntaje,
          totalQuestions: d.total_preguntas,
          correctCount: d.respuestas_correctas,
          answers: d.respuestas_detalle || [],
          timestamp: d.creado_el
        }));
      }
    } catch (e) {
      console.warn('Fallback a almacenamiento local tras error en Supabase:', e);
    }
  }

  // Fallback local
  let list = getLocalAttempts();
  if (filters?.moduleId) list = list.filter(a => a.moduleId === filters.moduleId);
  if (filters?.classroomCode) list = list.filter(a => a.classroomCode.toLowerCase() === filters.classroomCode!.toLowerCase());
  if (filters?.studentId) list = list.filter(a => a.studentId === filters.studentId);
  return list;
}

/* ==========================================================================
   EXPORTACIÓN A CSV
   ========================================================================== */

export async function exportAttemptsToCSV(): Promise<string> {
  const attempts = await getAllAttempts();
  const headers = ['ID Intento', 'Fecha', 'Código Aula', 'ID Estudiante', 'Nombre Estudiante', 'Clase', 'Puntaje', 'Respuestas Correctas', 'Total Preguntas', 'Estado'];
  
  const rows = attempts.map(a => [
    sanitizeCSVValue(a.id),
    sanitizeCSVValue(new Date(a.timestamp).toLocaleDateString('es-AR')),
    sanitizeCSVValue(a.classroomCode),
    sanitizeCSVValue(a.studentId),
    sanitizeCSVValue(a.studentName),
    sanitizeCSVValue(`Clase ${a.moduleId}`),
    sanitizeCSVValue(a.score),
    sanitizeCSVValue(a.correctCount),
    sanitizeCSVValue(a.totalQuestions),
    sanitizeCSVValue(a.score >= 60 ? 'Aprobado' : 'Requiere Repaso')
  ]);

  const csvContent = '\uFEFF' + [headers.map(h => `"${h}"`).join(','), ...rows.map(r => r.join(','))].join('\n');
  return csvContent;
}

export function downloadCSV(filename: string, content: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/* ==========================================================================
   SANITIZACIÓN CSV Y PREVENCIÓN DE INYECCIÓN DE FÓRMULAS
   ========================================================================== */

export function sanitizeCSVValue(val: string | number | boolean | null | undefined): string {
  if (val === null || val === undefined) return '""';
  const str = String(val);
  // Prevenir inyección de fórmulas en Excel/LibreOffice: anteponer comilla simple si inicia con =, +, -, @
  const safeStr = /^[=+\-@\t\r]/.test(str) ? `'${str}` : str;
  return `"${safeStr.replace(/"/g, '""')}"`;
}

/* ==========================================================================
   EXÁMENES INTEGRADORES (MÓDULOS 1 A 4)
   ========================================================================== */

export function getLocalExamAttempts(): ExamAttempt[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EXAM_ATTEMPTS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error leyendo intentos de examen locales:', e);
    return [];
  }
}

export function getExamAttemptsCount(moduleId: number, studentId?: string): number {
  const all = getLocalExamAttempts();
  return all.filter(a => a.module_id === moduleId && (!studentId || a.student_id === studentId)).length;
}

export async function saveExamAttempt(attempt: ExamAttempt): Promise<void> {
  try {
    // 1. Guardar localmente
    const attempts = getLocalExamAttempts();
    
    // Evitar dobles entregas accidentales con el mismo attempt_id
    const existingIndex = attempts.findIndex(a => a.attempt_id === attempt.attempt_id);
    if (existingIndex >= 0) {
      attempts[existingIndex] = attempt;
    } else {
      attempts.unshift(attempt);
    }
    localStorage.setItem(STORAGE_KEYS.EXAM_ATTEMPTS, JSON.stringify(attempts));

    // 2. Limpiar sesión activa del examen
    clearActiveExamSession(attempt.module_id);

    // 3. Persistir y certificar en Supabase si está activo mediante RPC entregar_examen
    const supabase = getSupabaseClient();
    if (supabase) {
      const student = getCurrentStudent();
      const studentToken = student?.token || getOrCreateStudentToken(attempt.student_id);

      // Compatibilidad y resiliencia: incluir ID original (e1_q01) y alias m1_q01
      const payloadRespuestas: Array<{ questionId: string; selectedOptionIndex: number }> = [];
      attempt.answers.forEach(a => {
        payloadRespuestas.push({
          questionId: a.questionId,
          selectedOptionIndex: a.selectedOptionIndex
        });
        if (a.questionId.startsWith('e') && a.questionId.includes('_q')) {
          payloadRespuestas.push({
            questionId: 'm' + a.questionId.slice(1),
            selectedOptionIndex: a.selectedOptionIndex
          });
        }
      });

      const { data: certData, error } = await supabase.rpc('entregar_examen', {
        p_intento_id: attempt.attempt_id,
        p_sesion_id: attempt.attempt_id,
        p_estudiante_id: attempt.student_id,
        p_token: studentToken,
        p_modulo_id: attempt.module_id,
        p_motivo: attempt.completion_reason === 'timeout' ? 'timeout' : 'voluntary',
        p_respuestas_enviadas: payloadRespuestas
      });

      if (!error && certData && !certData.error) {
        // Actualizar la nota local con la oficial certificada por el servidor
        attempt.score_percentage = certData.puntaje_porcentaje;
        attempt.passed = certData.aprobado;
        attempt.correct_answers = certData.respuestas_correctas;
        attempt.incorrect_answers = certData.respuestas_incorrectas;
        attempt.unanswered_questions = certData.sin_responder;
        attempt.duration_seconds = certData.duracion_segundos;
        attempt.attempt_number = certData.numero_intento;

        // Actualizar almacenamiento local
        const updatedAttempts = getLocalExamAttempts();
        const idx = updatedAttempts.findIndex(a => a.attempt_id === attempt.attempt_id);
        if (idx >= 0) {
          updatedAttempts[idx] = attempt;
          localStorage.setItem(STORAGE_KEYS.EXAM_ATTEMPTS, JSON.stringify(updatedAttempts));
        }
      } else if (error) {
        console.error('Error al certificar examen en Supabase (RPC entregar_examen):', error.message);
      }
    }
  } catch (e) {
    console.error('Error guardando intento de examen:', e);
  }
}

export async function getAllExamAttempts(filters?: {
  moduleId?: number;
  studentId?: string;
  passed?: boolean;
}): Promise<ExamAttempt[]> {
  const supabase = getSupabaseClient();
  
  if (supabase) {
    try {
      let query = supabase.from('intentos_examenes').select('*').order('inicio_el', { ascending: false });
      if (filters?.moduleId) query = query.eq('modulo_id', filters.moduleId);
      if (filters?.studentId) query = query.eq('estudiante_id', filters.studentId);
      if (filters?.passed !== undefined) query = query.eq('aprobado', filters.passed);
      
      const { data, error } = await query;
      if (!error && data) {
        return data.map((d: any) => ({
          attempt_id: d.id,
          student_id: d.estudiante_id,
          student_name: d.nombre_estudiante,
          classroom_code: d.codigo_aula,
          module_id: d.modulo_id,
          module_name: d.nombre_modulo,
          started_at: d.inicio_el,
          finished_at: d.finalizo_el,
          duration_seconds: d.duracion_segundos,
          time_limit_seconds: d.limite_segundos,
          status: d.estado,
          completion_reason: d.motivo_finalizacion,
          total_questions: d.total_preguntas,
          answered_questions: d.preguntas_respondidas,
          correct_answers: d.respuestas_correctas,
          incorrect_answers: d.respuestas_incorrectas,
          unanswered_questions: d.sin_responder,
          score_percentage: d.puntaje_porcentaje,
          passed: d.aprobado,
          attempt_number: d.numero_intento,
          answers: d.respuestas_detalle || []
        }));
      }
    } catch (e) {
      console.warn('Fallback local tras error en Supabase (exámenes):', e);
    }
  }

  // Fallback a almacenamiento local
  let list = getLocalExamAttempts();
  if (filters?.moduleId) list = list.filter(a => a.module_id === filters.moduleId);
  if (filters?.studentId) list = list.filter(a => a.student_id === filters.studentId);
  if (filters?.passed !== undefined) list = list.filter(a => a.passed === filters.passed);
  return list;
}

export function getActiveExamSession(moduleId: number): ActiveExamSession | null {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEYS.ACTIVE_EXAM_PREFIX}${moduleId}`);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error leyendo sesión de examen activa:', e);
    return null;
  }
}

export function saveActiveExamSession(session: ActiveExamSession): void {
  try {
    localStorage.setItem(
      `${STORAGE_KEYS.ACTIVE_EXAM_PREFIX}${session.module_id}`,
      JSON.stringify(session)
    );
  } catch (e) {
    console.error('Error guardando sesión de examen activa:', e);
  }
}

export function clearActiveExamSession(moduleId: number): void {
  try {
    localStorage.removeItem(`${STORAGE_KEYS.ACTIVE_EXAM_PREFIX}${moduleId}`);
  } catch (e) {
    console.error('Error eliminando sesión de examen activa:', e);
  }
}

/* ==========================================================================
   EXPORTACIÓN DE EXÁMENES A CSV (SECCIÓN 5 Y 6)
   ========================================================================== */

export async function exportExamAttemptsToCSV(customList?: ExamAttempt[]): Promise<string> {
  const attempts = customList || (await getAllExamAttempts());
  
  const headers = [
    'ID Intento',
    'ID Estudiante',
    'Nombre Estudiante',
    'Código Aula',
    'ID Módulo',
    'Nombre Módulo',
    'Fecha Inicio',
    'Fecha Finalización',
    'Duración Real (Seg)',
    'Duración Formateada',
    'Límite Tiempo (Seg)',
    'Estado',
    'Motivo Finalización',
    'Total Preguntas',
    'Preguntas Respondidas',
    'Respuestas Correctas',
    'Respuestas Incorrectas',
    'Sin Responder',
    'Puntaje (%)',
    'Resultado Aprobación',
    'Número de Intento'
  ];

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s}s`;
  };

  const rows = attempts.map(a => [
    sanitizeCSVValue(a.attempt_id),
    sanitizeCSVValue(a.student_id),
    sanitizeCSVValue(a.student_name),
    sanitizeCSVValue(a.classroom_code || 'N/A'),
    sanitizeCSVValue(a.module_id),
    sanitizeCSVValue(a.module_name),
    sanitizeCSVValue(new Date(a.started_at).toLocaleString('es-AR')),
    sanitizeCSVValue(new Date(a.finished_at).toLocaleString('es-AR')),
    sanitizeCSVValue(a.duration_seconds),
    sanitizeCSVValue(formatDuration(a.duration_seconds)),
    sanitizeCSVValue(a.time_limit_seconds),
    sanitizeCSVValue(a.status),
    sanitizeCSVValue(
      a.completion_reason === 'voluntary'
        ? 'Entrega voluntaria'
        : a.completion_reason === 'timeout'
        ? 'Tiempo agotado (40 min)'
        : 'Interrupción'
    ),
    sanitizeCSVValue(a.total_questions),
    sanitizeCSVValue(a.answered_questions),
    sanitizeCSVValue(a.correct_answers),
    sanitizeCSVValue(a.incorrect_answers),
    sanitizeCSVValue(a.unanswered_questions),
    sanitizeCSVValue(a.score_percentage),
    sanitizeCSVValue(a.passed ? 'Aprobado (≥ 70 %)' : 'Desaprobado (< 70 %)'),
    sanitizeCSVValue(a.attempt_number)
  ]);

  // UTF-8 BOM (\uFEFF) para compatibilidad nativa con Microsoft Excel y LibreOffice
  const csvContent = '\uFEFF' + [headers.map(h => `"${h}"`).join(','), ...rows.map(r => r.join(','))].join('\n');
  return csvContent;
}

/* ==========================================================================
   DATOS DE DEMOSTRACIÓN PARA EL DOCENTE (5 PREGUNTAS POR CUESTIONARIO)
   ========================================================================== */

export function seedDemoClassroomData(): void {
  const mockStudents = [
    { name: 'Lucas Benítez', code: '3A-2025', avatar: '🦁' },
    { name: 'Martina Rodríguez', code: '3A-2025', avatar: '🦊' },
    { name: 'Santiago López', code: '3A-2025', avatar: '🐼' },
    { name: 'Camila Navarro', code: '3A-2025', avatar: '🐬' },
    { name: 'Mateo Morales', code: '3A-2025', avatar: '🚀' },
    { name: 'Julieta Giménez', code: '3A-2025', avatar: '🦉' }
  ];

  const now = Date.now();
  const demoAttempts: QuizAttempt[] = [];

  mockStudents.forEach((student, sIdx) => {
    const studentId = `mock_std_${sIdx + 1}`;
    const completedClasses = (sIdx % 3) + 3; // entre 3 y 5 clases

    for (let mod = 1; mod <= completedClasses; mod++) {
      const correctCount = 3 + ((sIdx + mod) % 3); // 3, 4 o 5 aciertos
      const totalQuestions = 5;
      const score = Math.round((correctCount / totalQuestions) * 100);

      demoAttempts.push({
        id: `att_demo_${sIdx + 1}_c${mod}`,
        studentId,
        studentName: student.name,
        classroomCode: student.code,
        moduleId: mod,
        score,
        totalQuestions,
        correctCount,
        timestamp: new Date(now - (mockStudents.length - sIdx) * 3600000 * 5 - mod * 1800000).toISOString(),
        answers: Array.from({ length: totalQuestions }, (_, qIdx) => ({
          questionId: `m${mod}_q${qIdx + 1}`,
          selectedIndex: qIdx < correctCount ? 0 : 1,
          isCorrect: qIdx < correctCount
        }))
      });
    }
  });

  localStorage.setItem(STORAGE_KEYS.ATTEMPTS, JSON.stringify(demoAttempts));

  // Generar intentos de exámenes integradores de demostración para el panel docente
  const demoExamAttempts: ExamAttempt[] = [
    {
      attempt_id: 'exam_demo_1_m1',
      student_id: 'mock_std_1',
      student_name: 'Lucas Benítez',
      classroom_code: '3A-2025',
      module_id: 1,
      module_name: '¿Qué es una base de datos y cómo modela la realidad?',
      started_at: new Date(now - 86400000 * 2).toISOString(),
      finished_at: new Date(now - 86400000 * 2 + 1820000).toISOString(),
      duration_seconds: 1820,
      time_limit_seconds: 2400,
      status: 'completed',
      completion_reason: 'voluntary',
      total_questions: 20,
      answered_questions: 20,
      correct_answers: 18,
      incorrect_answers: 2,
      unanswered_questions: 0,
      score_percentage: 90,
      passed: true,
      attempt_number: 1,
      answers: []
    },
    {
      attempt_id: 'exam_demo_2_m1',
      student_id: 'mock_std_2',
      student_name: 'Martina Rodríguez',
      classroom_code: '3A-2025',
      module_id: 1,
      module_name: '¿Qué es una base de datos y cómo modela la realidad?',
      started_at: new Date(now - 86400000 * 2).toISOString(),
      finished_at: new Date(now - 86400000 * 2 + 2100000).toISOString(),
      duration_seconds: 2100,
      time_limit_seconds: 2400,
      status: 'completed',
      completion_reason: 'voluntary',
      total_questions: 20,
      answered_questions: 20,
      correct_answers: 15,
      incorrect_answers: 5,
      unanswered_questions: 0,
      score_percentage: 75,
      passed: true,
      attempt_number: 1,
      answers: []
    },
    {
      attempt_id: 'exam_demo_3_m1',
      student_id: 'mock_std_3',
      student_name: 'Santiago López',
      classroom_code: '3A-2025',
      module_id: 1,
      module_name: '¿Qué es una base de datos y cómo modela la realidad?',
      started_at: new Date(now - 86400000 * 2).toISOString(),
      finished_at: new Date(now - 86400000 * 2 + 2400000).toISOString(),
      duration_seconds: 2400,
      time_limit_seconds: 2400,
      status: 'completed',
      completion_reason: 'timeout',
      total_questions: 20,
      answered_questions: 16,
      correct_answers: 11,
      incorrect_answers: 5,
      unanswered_questions: 4,
      score_percentage: 55,
      passed: false,
      attempt_number: 1,
      answers: []
    },
    {
      attempt_id: 'exam_demo_4_m2',
      student_id: 'mock_std_4',
      student_name: 'Camila Navarro',
      classroom_code: '3A-2025',
      module_id: 2,
      module_name: 'Conocer las tablas: Registros, Campos y Tipos de Datos',
      started_at: new Date(now - 86400000).toISOString(),
      finished_at: new Date(now - 86400000 + 1650000).toISOString(),
      duration_seconds: 1650,
      time_limit_seconds: 2400,
      status: 'completed',
      completion_reason: 'voluntary',
      total_questions: 20,
      answered_questions: 20,
      correct_answers: 19,
      incorrect_answers: 1,
      unanswered_questions: 0,
      score_percentage: 95,
      passed: true,
      attempt_number: 1,
      answers: []
    },
    {
      attempt_id: 'exam_demo_5_m3',
      student_id: 'mock_std_5',
      student_name: 'Mateo Morales',
      classroom_code: '3A-2025',
      module_id: 3,
      module_name: 'Claves Primarias y Foráneas: La Columna Vertebral',
      started_at: new Date(now - 43200000).toISOString(),
      finished_at: new Date(now - 43200000 + 1980000).toISOString(),
      duration_seconds: 1980,
      time_limit_seconds: 2400,
      status: 'completed',
      completion_reason: 'voluntary',
      total_questions: 20,
      answered_questions: 20,
      correct_answers: 14,
      incorrect_answers: 6,
      unanswered_questions: 0,
      score_percentage: 70,
      passed: true,
      attempt_number: 1,
      answers: []
    },
    {
      attempt_id: 'exam_demo_6_m4',
      student_id: 'mock_std_6',
      student_name: 'Julieta Giménez',
      classroom_code: '3A-2025',
      module_id: 4,
      module_name: 'Relaciones entre Tablas: 1 a N y N a M',
      started_at: new Date(now - 21600000).toISOString(),
      finished_at: new Date(now - 21600000 + 1740000).toISOString(),
      duration_seconds: 1740,
      time_limit_seconds: 2400,
      status: 'completed',
      completion_reason: 'voluntary',
      total_questions: 20,
      answered_questions: 20,
      correct_answers: 17,
      incorrect_answers: 3,
      unanswered_questions: 0,
      score_percentage: 85,
      passed: true,
      attempt_number: 1,
      answers: []
    }
  ];
  localStorage.setItem(STORAGE_KEYS.EXAM_ATTEMPTS, JSON.stringify(demoExamAttempts));
}

export function clearAllLocalData(): void {
  localStorage.removeItem(STORAGE_KEYS.ATTEMPTS);
  localStorage.removeItem(STORAGE_KEYS.MODULES_PROGRESS);
  localStorage.removeItem(STORAGE_KEYS.UNITS_PROGRESS);
  localStorage.removeItem(STORAGE_KEYS.EXAM_ATTEMPTS);
  [1, 2, 3, 4].forEach(m => clearActiveExamSession(m));
}
