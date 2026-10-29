import { MODULE_EXAMS } from '../src/data/examsData';

console.log('-- ========================================================================');
console.log('-- BANCO MAESTRO DE CLAVES OFICIALES (80 PREGUNTAS: MÓDULOS 1 A 4)');
console.log('-- GENERADO DIRECTAMENTE DESDE src/data/examsData.ts');
console.log('-- ========================================================================\n');

const tuples: string[] = [];

for (let modId = 1; modId <= 4; modId++) {
  const exam = MODULE_EXAMS[modId];
  console.log(`-- MÓDULO ${modId}: ${exam.moduleName}`);
  exam.questions.forEach((q) => {
    const escapedExp = q.explanation.replace(/'/g, "''");
    tuples.push(`('${q.id}', ${q.moduleId}, ${q.correctIndex}, '${escapedExp}')`);
  });
}

console.log('INSERT INTO public.claves_respuestas (pregunta_id, modulo_id, opcion_correcta_index, explicacion) VALUES\n' + tuples.join(',\n') + '\nON CONFLICT (pregunta_id) DO UPDATE SET\n  modulo_id = EXCLUDED.modulo_id,\n  opcion_correcta_index = EXCLUDED.opcion_correcta_index,\n  explicacion = EXCLUDED.explicacion;');
