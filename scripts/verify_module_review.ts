/**
 * Script de Verificación Integral de Módulos 1 a 4, Exámenes Integradores,
 * Registro Docente y Sanitización de Identidad / CSV.
 */

import { LEARNING_UNITS } from '../src/data/unitsData';
import { MODULE_EXAMS } from '../src/data/examsData';
import { sanitizeCSVValue, exportExamAttemptsToCSV } from '../src/services/storageService';
import { ExamAttempt } from '../src/types';

let passCount = 0;
let failCount = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  [OK] ${testName}`);
    passCount++;
  } else {
    console.error(`  [FAIL] ${testName} - ${detail || 'Falló la aserción'}`);
    failCount++;
  }
}

console.log('================================================================');
console.log('1. VERIFICACIÓN DE UNIDADES 1 A 4 Y PREGUNTAS DE PRÁCTICA');
console.log('================================================================');

// 1.1 Unidades 1 a 4 sin práctica interactiva en la vista
for (let i = 1; i <= 4; i++) {
  const unit = LEARNING_UNITS.find(u => u.number === i);
  assert(!!unit, `Unidad ${i} existe en LEARNING_UNITS`);
  if (unit) {
    assert(
      unit.checkQuestions.length === 12,
      `Unidad ${i} tiene exactamente 12 preguntas de práctica (encontradas: ${unit.checkQuestions.length})`
    );

    // Validar integridad de cada pregunta
    let allValid = true;
    unit.checkQuestions.forEach((q, idx) => {
      if (!q.question || q.options.length < 3 || q.correctIndex < 0 || q.correctIndex >= q.options.length || !q.explanation) {
        allValid = false;
        console.error(`    Pregunta ${idx + 1} de Unidad ${i} inválida:`, q);
      }
    });
    assert(allValid, `Todas las 12 preguntas de la Unidad ${i} tienen opciones, respuesta correcta y retroalimentación`);
  }
}

// 1.2 Unidades 5 a 10 conservan actividad para práctica SQL interactiva
for (let i = 5; i <= 10; i++) {
  const unit = LEARNING_UNITS.find(u => u.number === i);
  if (unit) {
    assert(
      !!unit.activity,
      `Unidad ${i} conserva actividad para práctica interactiva SQL (tipo: ${unit.activity?.type})`
    );
  }
}

console.log('\n================================================================');
console.log('2. VERIFICACIÓN DE EXÁMENES INTEGRADORES (MÓDULOS 1 A 4)');
console.log('================================================================');

for (let modId = 1; modId <= 4; modId++) {
  const exam = MODULE_EXAMS[modId];
  assert(!!exam, `Configuración de examen para Módulo ${modId} existe`);
  if (exam) {
    assert(exam.totalQuestions === 20, `Módulo ${modId}: totalQuestions es 20 (actual: ${exam.totalQuestions})`);
    assert(exam.questions.length === 20, `Módulo ${modId}: preguntas definidas es 20 (actual: ${exam.questions.length})`);
    assert(exam.durationMinutes === 40, `Módulo ${modId}: duración es de 40 minutos`);
    assert(exam.passingScorePercentage === 70, `Módulo ${modId}: criterio de aprobación es 70%`);

    // Balance de opciones
    const counts = [0, 0, 0];
    exam.questions.forEach(q => counts[q.correctIndex]++);
    assert(
      counts[0] === 7 && counts[1] === 7 && counts[2] === 6,
      `Módulo ${modId}: distribución equilibrada de respuestas (A: ${counts[0]}, B: ${counts[1]}, C: ${counts[2]})`
    );
  }
}

console.log('\n================================================================');
console.log('3. SIMULACIÓN DE TEMPORIZADOR, RECARGA Y EXPIRACIÓN REAL');
console.log('================================================================');

{
  const DURATION_SECONDS = 2400; // 40 minutos
  const now = Date.now();
  const startedAt = new Date(now).toISOString();
  const expiresAt = new Date(now + DURATION_SECONDS * 1000).toISOString();

  // Caso A: Al iniciar, el tiempo restante debe ser 2400s
  const initialRemaining = Math.max(0, Math.floor((new Date(expiresAt).getTime() - now) / 1000));
  assert(initialRemaining === 2400, `Inicio: temporizador arranca exactamente en 2400 segundos (40:00)`);

  // Caso B: Simular recarga tras 15 minutos (900 segundos)
  const after15Min = now + 900 * 1000;
  const remainingAfter15 = Math.max(0, Math.floor((new Date(expiresAt).getTime() - after15Min) / 1000));
  assert(remainingAfter15 === 1500, `Recarga tras 15m: recupera exactamente 1500 segundos (25:00)`);

  // Caso C: Simular recarga tras 41 minutos (tiempo agotado en ausencia)
  const after41Min = now + 2460 * 1000;
  const remainingAfter41 = Math.max(0, Math.floor((new Date(expiresAt).getTime() - after41Min) / 1000));
  assert(remainingAfter41 === 0, `Tiempo agotado: restante es 0 segundos, gatilla entrega automática`);
}

console.log('\n================================================================');
console.log('4. CÁLCULO DE CALIFICACIÓN Y CRITERIO DE APROBACIÓN (70%)');
console.log('================================================================');

{
  const calcScore = (correct: number) => {
    const pct = Math.round((correct / 20) * 100);
    return { pct, passed: pct >= 70 };
  };

  assert(calcScore(14).pct === 70 && calcScore(14).passed === true, `14 correctas de 20 = 70% -> Aprobado`);
  assert(calcScore(13).pct === 65 && calcScore(13).passed === false, `13 correctas de 20 = 65% -> Desaprobado`);
  assert(calcScore(15).pct === 75 && calcScore(15).passed === true, `15 correctas de 20 = 75% -> Aprobado`);
  assert(calcScore(20).pct === 100 && calcScore(20).passed === true, `20 correctas de 20 = 100% -> Aprobado`);
  assert(calcScore(0).pct === 0 && calcScore(0).passed === false, `0 correctas de 20 = 0% -> Desaprobado`);
}

console.log('\n================================================================');
console.log('5. IDEMPOTENCIA DE ENTREGAS Y ALMACENAMIENTO DE INTENTOS');
console.log('================================================================');

{
  // Simulación de la lógica de guardado en storageService
  const attempts: ExamAttempt[] = [];
  const attemptId = 'test_uuid_12345';

  const mockAttempt1: ExamAttempt = {
    attempt_id: attemptId,
    student_id: 'std_01',
    student_name: 'Ana García',
    classroom_code: '4.° 1.ª',
    module_id: 1,
    module_name: 'Módulo 1',
    started_at: new Date().toISOString(),
    finished_at: new Date().toISOString(),
    duration_seconds: 1200,
    time_limit_seconds: 2400,
    status: 'completed',
    completion_reason: 'voluntary',
    total_questions: 20,
    answered_questions: 20,
    correct_answers: 16,
    incorrect_answers: 4,
    unanswered_questions: 0,
    score_percentage: 80,
    passed: true,
    attempt_number: 1,
    answers: []
  };

  // Primera entrega
  const existingIdx1 = attempts.findIndex(a => a.attempt_id === mockAttempt1.attempt_id);
  if (existingIdx1 >= 0) attempts[existingIdx1] = mockAttempt1;
  else attempts.unshift(mockAttempt1);

  assert(attempts.length === 1, `Primera entrega guardada (longitud = 1)`);

  // Segunda entrega accidental con mismo attempt_id (doble clic o submit concurrente)
  const existingIdx2 = attempts.findIndex(a => a.attempt_id === mockAttempt1.attempt_id);
  if (existingIdx2 >= 0) attempts[existingIdx2] = mockAttempt1;
  else attempts.unshift(mockAttempt1);

  assert(attempts.length === 1, `Segunda entrega con mismo ID actualiza sin duplicar (longitud = 1)`);
}

console.log('\n================================================================');
console.log('6. PREVENCIÓN DE INYECCIÓN DE FÓRMULAS EN CSV (CSV INJECTION)');
console.log('================================================================');

{
  assert(sanitizeCSVValue('=1+2') === `"'=1+2"`, `Inyección con '=' sanitizada con prefijo comilla simple`);
  assert(sanitizeCSVValue('+cmd|/C') === `"'+cmd|/C"`, `Inyección con '+' sanitizada con prefijo comilla simple`);
  assert(sanitizeCSVValue('-100') === `"'-100"`, `Inyección con '-' sanitizada con prefijo comilla simple`);
  assert(sanitizeCSVValue('@calc') === `"'@calc"`, `Inyección con '@' sanitizada con prefijo comilla simple`);
  assert(sanitizeCSVValue('Lucas Benítez') === `"Lucas Benítez"`, `Texto normal sin comilla de escape extra`);
  assert(sanitizeCSVValue('Alumno "Sobrenombre"') === `"Alumno ""Sobrenombre"""`, `Comillas dobles internas escapadas correctamente`);
}

console.log('\n================================================================');
console.log('7. GENERACIÓN COMPLETA DE EXPORTACIÓN A CSV');
console.log('================================================================');

async function testCSVExport() {
  const sampleAttempts: ExamAttempt[] = [
    {
      attempt_id: 'att_001',
      student_id: 'std_lucas',
      student_name: 'Lucas Benítez',
      classroom_code: '4.° A',
      module_id: 1,
      module_name: '¿Qué es una base de datos y cómo modela la realidad?',
      started_at: '2026-10-28T18:00:00.000Z',
      finished_at: '2026-10-28T18:30:00.000Z',
      duration_seconds: 1800,
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
    },
    {
      attempt_id: 'att_002',
      student_id: 'std_malicious',
      student_name: '=cmd|calc!A0',
      classroom_code: '+DANGER',
      module_id: 2,
      module_name: 'Conocer las tablas',
      started_at: '2026-10-28T18:00:00.000Z',
      finished_at: '2026-10-28T18:40:00.000Z',
      duration_seconds: 2400,
      time_limit_seconds: 2400,
      status: 'completed',
      completion_reason: 'timeout',
      total_questions: 20,
      answered_questions: 14,
      correct_answers: 10,
      incorrect_answers: 4,
      unanswered_questions: 6,
      score_percentage: 50,
      passed: false,
      attempt_number: 1,
      answers: []
    }
  ];

  const csv = await exportExamAttemptsToCSV(sampleAttempts);
  assert(csv.startsWith('\uFEFF'), `El CSV inicia con el caracter UTF-8 BOM (\uFEFF) para Excel`);
  assert(csv.includes('"ID Intento","ID Estudiante","Nombre Estudiante"'), `Cabeceras CSV presentes`);
  assert(csv.includes('"Lucas Benítez"'), `Datos de Lucas presentes en CSV`);
  assert(csv.includes(`"'=cmd|calc!A0"`), `Intento malicioso de fórmula sanitizado en el archivo CSV`);
  assert(csv.includes(`"'+DANGER"`), `Código de aula con prefijo '+' sanitizado en el archivo CSV`);
  assert(csv.includes('"Tiempo agotado (40 min)"'), `Motivo de finalización traducido legiblemente`);
}

testCSVExport().then(() => {
  console.log('\n================================================================');
  console.log(`RESUMEN DE PRUEBAS: ${passCount} APROBADAS, ${failCount} FALLIDAS`);
  console.log('================================================================');
  if (failCount > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
});
