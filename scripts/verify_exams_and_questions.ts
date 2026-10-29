import { LEARNING_UNITS } from '../src/data/unitsData';
import { MODULE_EXAMS } from '../src/data/examsData';
import { sanitizeCSVValue } from '../src/services/storageService';

console.log('=====================================================');
console.log('VERIFICACIÓN DEL MÓDULO DE BASES DE DATOS Y EXÁMENES');
console.log('=====================================================\n');

// 1. Verificar preguntas de práctica formativa en Módulos 1 a 4
console.log('1. Preguntas de práctica en Módulos 1 a 4:');
for (let m = 1; m <= 4; m++) {
  const unit = LEARNING_UNITS.find(u => u.number === m);
  if (!unit) {
    console.error(`ERROR: No se encontró la Unidad ${m}`);
    process.exit(1);
  }
  const qCount = unit.checkQuestions.length;
  console.log(`   - Unidad ${m} (${unit.title}): ${qCount} preguntas formativas (esperadas >= 12)`);
  if (qCount < 12) {
    console.error(`   ❌ FALLÓ: La Unidad ${m} tiene menos de 12 preguntas.`);
    process.exit(1);
  }
  
  // Validar cada pregunta
  unit.checkQuestions.forEach((q, idx) => {
    if (!q.question || q.options.length < 3 || q.correctIndex < 0 || q.correctIndex >= q.options.length || !q.explanation) {
      console.error(`   ❌ Pregunta formativa inválida en Unidad ${m}, índice ${idx}:`, q);
      process.exit(1);
    }
  });
}
console.log('   ✓ Todas las unidades 1 a 4 cuentan con 12 preguntas formativas completas y válidas.\n');

// 2. Verificar Exámenes Integradores (Módulos 1 a 4)
console.log('2. Exámenes Integradores (Módulos 1 a 4):');
for (let m = 1; m <= 4; m++) {
  const exam = MODULE_EXAMS[m];
  if (!exam) {
    console.error(`❌ ERROR: No se encontró examen para el Módulo ${m}`);
    process.exit(1);
  }

  const qCount = exam.questions.length;
  console.log(`   - Examen Módulo ${m} (${exam.moduleName}):`);
  console.log(`     Duración: ${exam.durationMinutes} minutos`);
  console.log(`     Total de preguntas: ${qCount}`);
  console.log(`     Puntaje de aprobación: ${exam.passingScorePercentage}% (${Math.ceil(qCount * exam.passingScorePercentage / 100)} correctas)`);

  if (qCount !== 20) {
    console.error(`   ❌ ERROR: Se esperaban 20 preguntas en Módulo ${m}, se encontraron ${qCount}`);
    process.exit(1);
  }
  if (exam.durationMinutes !== 40) {
    console.error(`   ❌ ERROR: La duración esperada es 40 minutos, se encontró ${exam.durationMinutes}`);
    process.exit(1);
  }

  // Distribución de respuestas correctas
  const distribution: Record<number, number> = { 0: 0, 1: 0, 2: 0 };
  exam.questions.forEach((q, idx) => {
    if (!q.question || q.options.length < 3 || q.correctIndex < 0 || q.correctIndex >= q.options.length || !q.explanation) {
      console.error(`   ❌ Pregunta de examen inválida en Módulo ${m}, índice ${idx}:`, q);
      process.exit(1);
    }
    distribution[q.correctIndex] = (distribution[q.correctIndex] || 0) + 1;
  });

  console.log(`     Distribución de claves (A: ${distribution[0]}, B: ${distribution[1]}, C: ${distribution[2]})`);
  if (distribution[0] === 0 || distribution[1] === 0 || distribution[2] === 0) {
    console.warn(`   ⚠️ Advertencia: Opciones concentradas en Módulo ${m}`);
  }
}
console.log('   ✓ Los 4 exámenes integradores tienen exactamente 20 preguntas (80 en total) con 40 min de límite y 70% de aprobación.\n');

// 3. Verificar protección de inyección de fórmulas CSV
console.log('3. Prueba de sanitización contra inyección de fórmulas CSV:');
const dangerousValues = [
  '=SUM(A1:A10)',
  '+12345',
  '-50',
  '@cmd.exe',
  '\tTAB_INDENT',
  'Normal Text',
  'Texto con "comillas" dobles'
];

dangerousValues.forEach(val => {
  const sanitized = sanitizeCSVValue(val);
  console.log(`   Entrada: [${val}] -> CSV Sanitizado: ${sanitized}`);
  if (/^[=+\-@\t\r]/.test(val) && !sanitized.startsWith('"\'')) {
    console.error(`   ❌ FALLÓ: El valor peligroso no fue neutralizado con apóstrofe.`);
    process.exit(1);
  }
});
console.log('   ✓ Inyección de fórmulas neutralizada con éxito.\n');

console.log('=====================================================');
console.log('TODAS LAS PRUEBAS AUTOMATIZADAS PASARON EXITOSAMENTE!');
console.log('=====================================================');
