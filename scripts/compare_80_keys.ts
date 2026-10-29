import fs from 'fs';
import path from 'path';
import { MODULE_EXAMS } from '../src/data/examsData';

console.log('========================================================================');
console.log('COMPARACIÓN RIGUROSA: 80 CLAVES SQL EN supabase_schema.sql VS examsData.ts');
console.log('========================================================================\n');

const sqlPath = path.resolve(process.cwd(), 'supabase_schema.sql');
const sqlContent = fs.readFileSync(sqlPath, 'utf-8');

// Extraer tuplas INSERT INTO public.claves_respuestas: ('e1_q01', 1, 0, '...')
const regex = /\('([a-z0-9_]+)',\s*(\d+),\s*(\d+),\s*'((?:[^']|'')*)'\)/g;
const sqlKeys: Record<string, { moduleId: number; correctIndex: number; explanation: string }> = {};

let match;
while ((match = regex.exec(sqlContent)) !== null) {
  const [_, qId, modId, correctIdx, explanation] = match;
  sqlKeys[qId] = {
    moduleId: parseInt(modId, 10),
    correctIndex: parseInt(correctIdx, 10),
    explanation: explanation.replace(/''/g, "'")
  };
}

const sqlKeyCount = Object.keys(sqlKeys).length;
console.log(`Claves encontradas en supabase_schema.sql: ${sqlKeyCount} (esperadas: 80)\n`);

if (sqlKeyCount !== 80) {
  console.error(`❌ ERROR: El número de claves en SQL es ${sqlKeyCount}, se esperaban exactamente 80.`);
  process.exit(1);
}

let differencesCount = 0;
let totalCompared = 0;

for (let modId = 1; modId <= 4; modId++) {
  const exam = MODULE_EXAMS[modId];
  if (!exam) {
    console.error(`❌ ERROR: No se encontró examen para el módulo ${modId}`);
    process.exit(1);
  }

  console.log(`--- Verificando Módulo ${modId}: ${exam.moduleName} ---`);
  exam.questions.forEach((q, idx) => {
    totalCompared++;
    const sqlItem = sqlKeys[q.id];

    if (!sqlItem) {
      console.error(`  ❌ Falta en SQL: pregunta ${q.id} (Módulo ${modId}, pregunta #${idx + 1})`);
      differencesCount++;
      return;
    }

    if (sqlItem.moduleId !== modId) {
      console.error(`  ❌ Discrepancia de Módulo para ${q.id}: SQL=${sqlItem.moduleId}, examsData=${modId}`);
      differencesCount++;
    }

    if (sqlItem.correctIndex !== q.correctIndex) {
      console.error(`  ❌ DISCREPANCIA EN RESPUESTA CORRECTA para ${q.id}: SQL=${sqlItem.correctIndex}, examsData=${q.correctIndex}`);
      differencesCount++;
    } else {
      const optLetter = ['A', 'B', 'C'][q.correctIndex];
      const snippet = q.question.substring(0, 45);
      console.log(`  ✓ [${q.id}] Opción ${optLetter} (${q.correctIndex}) coincidencia exacta: "${snippet}..."`);
    }
  });
  console.log('');
}

console.log('========================================================================');
console.log(`TOTAL COMPARADAS: ${totalCompared} preguntas.`);
console.log(`DIFERENCIAS ENCONTRADAS: ${differencesCount}`);
if (differencesCount === 0) {
  console.log('✓ TODAS LAS 80 PREGUNTAS Y CLAVES COINCIDEN AL 100%');
} else {
  console.error('❌ SE ENCONTRARON DIFERENCIAS QUE DEBEN SER CORREGIDAS.');
  process.exit(1);
}
console.log('========================================================================');
