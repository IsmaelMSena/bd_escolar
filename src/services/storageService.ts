import { StudentSession, QuizAttempt, ModuleProgress, UnitProgress } from '../types';
import { getSupabaseClient } from './supabaseClient';

const STORAGE_KEYS = {
  CURRENT_STUDENT: 'bd_escolar_student_session',
  ATTEMPTS: 'bd_escolar_quiz_attempts',
  MODULES_PROGRESS: 'bd_escolar_modules_progress',
  UNITS_PROGRESS: 'bd_escolar_units_progress',
};

// Generador de ID simple y seguro
export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'id_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now();
}

/* ==========================================================================
   SESIÓN DEL ESTUDIANTE
   ========================================================================== */

export function getCurrentStudent(): StudentSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_STUDENT);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error leyendo sesión del estudiante:', e);
    return null;
  }
}

export async function saveCurrentStudent(student: StudentSession): Promise<void> {
  try {
    localStorage.setItem(STORAGE_KEYS.CURRENT_STUDENT, JSON.stringify(student));
    
    // Si Supabase está disponible, registra o actualiza el estudiante
    const supabase = getSupabaseClient();
    if (supabase) {
      await supabase.from('estudiantes').upsert({
        id: student.id,
        nombre: student.name,
        codigo_aula: student.classroomCode,
        avatar: student.avatar,
        ultima_actividad: student.lastActiveAt
      });
    }
  } catch (e) {
    console.error('Error guardando estudiante:', e);
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
      if (!error && data && data.length > 0) {
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
    `"${a.id}"`,
    `"${new Date(a.timestamp).toLocaleDateString('es-AR')}"`,
    `"${a.classroomCode}"`,
    `"${a.studentId}"`,
    `"${a.studentName.replace(/"/g, '""')}"`,
    `"Clase ${a.moduleId}"`,
    a.score,
    a.correctCount,
    a.totalQuestions,
    `"${a.score >= 60 ? 'Aprobado' : 'Requiere Repaso'}"`
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
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
}

export function clearAllLocalData(): void {
  localStorage.removeItem(STORAGE_KEYS.ATTEMPTS);
  localStorage.removeItem(STORAGE_KEYS.MODULES_PROGRESS);
  localStorage.removeItem(STORAGE_KEYS.UNITS_PROGRESS);
}
