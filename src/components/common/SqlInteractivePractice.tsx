import React, { useState, useEffect } from 'react';
import { 
  Play, RotateCcw, Lightbulb, Eye, EyeOff, 
  CheckCircle2, XCircle, Sparkles, Table, Code2, 
  Database, ArrowRight, HelpCircle 
} from 'lucide-react';
import { ActivityDefinition } from '../../data/unitsData';

interface SqlInteractivePracticeProps {
  activity: ActivityDefinition;
  unitNumber: number;
  onCompleted?: () => void;
}

export const SqlInteractivePractice: React.FC<SqlInteractivePracticeProps> = ({
  activity,
  unitNumber,
  onCompleted
}) => {
  // Estado para el editor SQL
  const [userQuery, setUserQuery] = useState<string>(activity.defaultQuery || '');
  const [showHint, setShowHint] = useState<boolean>(false);
  const [showSolution, setShowSolution] = useState<boolean>(false);
  const [executionState, setExecutionState] = useState<{
    tested: boolean;
    success: boolean;
    message?: string;
  }>({ tested: false, success: false });

  // Estado para actividades de clasificación / opciones
  const [userSelections, setUserSelections] = useState<Record<string, string>>({});
  const [classificationFeedback, setClassificationFeedback] = useState<{
    tested: boolean;
    allCorrect: boolean;
    feedbackMap: Record<string, boolean>;
  }>({ tested: false, allCorrect: false, feedbackMap: {} });

  // Estado para actividades de completar espacios
  const [blankInputs, setBlankInputs] = useState<Record<string, string>>({});
  const [blanksFeedback, setBlanksFeedback] = useState<{
    tested: boolean;
    allCorrect: boolean;
    errors: Record<string, boolean>;
  }>({ tested: false, allCorrect: false, errors: {} });

  // Reiniciar estado cuando cambia la actividad
  useEffect(() => {
    setUserQuery(activity.defaultQuery || '');
    setShowHint(false);
    setShowSolution(false);
    setExecutionState({ tested: false, success: false });
    setUserSelections({});
    setClassificationFeedback({ tested: false, allCorrect: false, feedbackMap: {} });
    setBlankInputs({});
    setBlanksFeedback({ tested: false, allCorrect: false, errors: {} });
  }, [activity.id, activity.defaultQuery]);

  // =========================================================================
  // EJECUCIÓN Y VALIDACIÓN SEMÁNTICA PARA SQL
  // =========================================================================
  const handleExecuteSql = () => {
    const raw = userQuery.trim();
    if (!raw) {
      setExecutionState({
        tested: true,
        success: false,
        message: 'Por favor escribí una sentencia SQL antes de ejecutar.'
      });
      return;
    }

    const cleanSql = raw.replace(/\s+/g, ' ').toUpperCase();
    const expected = activity.expectedSqlKeywords || [];

    const missingKeywords: string[] = [];
    expected.forEach(keyword => {
      const kwUpper = keyword.toUpperCase();
      if (!cleanSql.includes(kwUpper)) {
        missingKeywords.push(keyword);
      }
    });

    if (missingKeywords.length > 0) {
      setExecutionState({
        tested: true,
        success: false,
        message: `Tu consulta no incluye todos los elementos requeridos. Verificá si incluiste: ${missingKeywords.join(', ')}.`
      });
      return;
    }

    // Validación semántica según la unidad
    if (unitNumber === 6) {
      // CREATE TABLE Alumnos
      if (!cleanSql.includes('CREATE TABLE') || !cleanSql.includes('ALUMNOS')) {
        setExecutionState({
          tested: true,
          success: false,
          message: 'Asegurate de usar CREATE TABLE Alumnos con sus campos correspondientes.'
        });
        return;
      }
    } else if (unitNumber === 7) {
      // INSERT INTO Alumnos
      if (!cleanSql.includes('INSERT INTO') || !cleanSql.includes('ALUMNOS') || !cleanSql.includes('VALUES')) {
        setExecutionState({
          tested: true,
          success: false,
          message: 'Recordá la estructura: INSERT INTO Alumnos (...) VALUES (...);'
        });
        return;
      }
    } else if (unitNumber === 8) {
      // SELECT WHERE apellido = 'López'
      if (!cleanSql.includes('SELECT') || !cleanSql.includes('FROM') || !cleanSql.includes('WHERE') || !cleanSql.includes('LÓPEZ') && !cleanSql.includes('LOPEZ')) {
        setExecutionState({
          tested: true,
          success: false,
          message: "Para filtrar a Juan López necesitás: WHERE apellido = 'López';"
        });
        return;
      }
    } else if (unitNumber === 9) {
      // INNER JOIN con WHERE 1 A
      if (!cleanSql.includes('INNER JOIN') || !cleanSql.includes('1 A')) {
        setExecutionState({
          tested: true,
          success: false,
          message: "No olvides filtrar por el curso requerido agregando: WHERE Cursos.nombre = '1 A';"
        });
        return;
      }
    } else if (unitNumber === 10) {
      // LEFT JOIN con COUNT y GROUP BY
      if (!cleanSql.includes('LEFT JOIN') || !cleanSql.includes('COUNT') || !cleanSql.includes('GROUP BY')) {
        setExecutionState({
          tested: true,
          success: false,
          message: 'La consulta debe incluir LEFT JOIN, COUNT(...) y GROUP BY.'
        });
        return;
      }
    }

    // Consulta validada con éxito
    setExecutionState({
      tested: true,
      success: true,
      message: '¡Excelente! Consulta SQL ejecutada correctamente.'
    });

    if (onCompleted) {
      onCompleted();
    }
  };

  const handleResetSql = () => {
    setUserQuery(activity.defaultQuery || '');
    setExecutionState({ tested: false, success: false });
  };

  const handleUseSolution = () => {
    if (activity.solutionSql) {
      setUserQuery(activity.solutionSql);
      setExecutionState({ tested: false, success: false });
      setShowSolution(false);
    }
  };

  // =========================================================================
  // MANEJADORES PARA ACTIVIDADES DE CLASIFICACIÓN (U1, U3, U5)
  // =========================================================================
  const handleClassificationSelect = (itemKey: string, category: string) => {
    setUserSelections(prev => ({
      ...prev,
      [itemKey]: category
    }));
    // Limpiar feedback al cambiar
    if (classificationFeedback.tested) {
      setClassificationFeedback({ tested: false, allCorrect: false, feedbackMap: {} });
    }
  };

  const handleCheckClassification = () => {
    let allOk = true;
    const fMap: Record<string, boolean> = {};

    if (unitNumber === 1) {
      // U1: Alumnos -> Tabla, email -> Campo, Ana Pérez -> Registro
      const c1 = userSelections['alumnos'] === 'tabla';
      const c2 = userSelections['email'] === 'campo';
      const c3 = userSelections['ana'] === 'registro';
      fMap['alumnos'] = c1;
      fMap['email'] = c2;
      fMap['ana'] = c3;
      allOk = c1 && c2 && c3;
    } else if (unitNumber === 3) {
      // U3: id_inscripcion -> PK, id_alumno -> FK, id_curso -> FK
      const c1 = userSelections['id_inscripcion'] === 'pk';
      const c2 = userSelections['id_alumno'] === 'fk';
      const c3 = userSelections['id_curso'] === 'fk';
      fMap['id_inscripcion'] = c1;
      fMap['id_alumno'] = c2;
      fMap['id_curso'] = c3;
      allOk = c1 && c2 && c3;
    } else if (unitNumber === 5) {
      // U5: emparejar comandos SQL
      const c1 = userSelections['create'] === 'crear';
      const c2 = userSelections['insert'] === 'guardar';
      const c3 = userSelections['select'] === 'consultar';
      const c4 = userSelections['where'] === 'filtrar';
      fMap['create'] = c1;
      fMap['insert'] = c2;
      fMap['select'] = c3;
      fMap['where'] = c4;
      allOk = c1 && c2 && c3 && c4;
    }

    setClassificationFeedback({
      tested: true,
      allCorrect: allOk,
      feedbackMap: fMap
    });

    if (allOk && onCompleted) {
      onCompleted();
    }
  };

  // =========================================================================
  // MANEJADORES PARA ACTIVIDADES DE COMPLETAR ESPACIOS (U2, U4)
  // =========================================================================
  const handleCheckBlanks = () => {
    let allOk = true;
    const errs: Record<string, boolean> = {};

    if (unitNumber === 2) {
      // U2: id_alumno = 2, id_curso = 1
      const a1 = (blankInputs['id_alumno'] || '').trim();
      const a2 = (blankInputs['id_curso'] || '').trim();
      const ok1 = a1 === '2';
      const ok2 = a2 === '1';
      errs['id_alumno'] = !ok1;
      errs['id_curso'] = !ok2;
      allOk = ok1 && ok2;
    } else if (unitNumber === 4) {
      // U4: curso 2 con materias 1 y 3
      const f1 = (blankInputs['fila1'] || '').replace(/\s+/g, '');
      const f2 = (blankInputs['fila2'] || '').replace(/\s+/g, '');
      const ok1 = f1 === '2,1' || f1 === '2;1' || (f1.includes('2') && f1.includes('1'));
      const ok2 = f2 === '2,3' || f2 === '2;3' || (f2.includes('2') && f2.includes('3'));
      errs['fila1'] = !ok1;
      errs['fila2'] = !ok2;
      allOk = ok1 && ok2;
    }

    setBlanksFeedback({
      tested: true,
      allCorrect: allOk,
      errors: errs
    });

    if (allOk && onCompleted) {
      onCompleted();
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xs space-y-6 transition-colors">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Práctica Interactiva
          </span>
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">
            {activity.title}
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1">
            {activity.instruction}
          </p>
        </div>

        {/* Botones de ayuda */}
        <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
          <button
            onClick={() => setShowHint(prev => !prev)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/60 transition"
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span>{showHint ? 'Ocultar pista' : 'Ver pista'}</span>
          </button>

          <button
            onClick={() => setShowSolution(prev => !prev)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
          >
            {showSolution ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{showSolution ? 'Ocultar solución' : 'Ver solución'}</span>
          </button>
        </div>
      </div>

      {/* Pista colapsable */}
      {showHint && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 text-xs sm:text-sm text-amber-900 dark:text-amber-200 flex items-start gap-3 animate-fadeIn">
          <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block">Pista pedagógica:</span>
            <span>{activity.hint}</span>
          </div>
        </div>
      )}

      {/* Solución explicada colapsable */}
      {showSolution && (
        <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/80 text-xs sm:text-sm text-indigo-950 dark:text-indigo-200 space-y-2 animate-fadeIn">
          <div className="flex items-center justify-between">
            <span className="font-bold flex items-center gap-1.5 text-indigo-700 dark:text-indigo-300">
              <Sparkles className="w-4 h-4" />
              Solución explicada:
            </span>
            {activity.type === 'sql-editor' && activity.solutionSql && (
              <button
                onClick={handleUseSolution}
                className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition"
              >
                Cargar esta solución en el editor
              </button>
            )}
          </div>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
            {activity.explanation}
          </p>
          {activity.solutionSql && (
            <pre className="p-3 bg-slate-900 text-emerald-400 rounded-xl font-mono text-xs overflow-x-auto">
              <code>{activity.solutionSql}</code>
            </pre>
          )}
        </div>
      )}

      {/* =====================================================================
          TIPO 1: EDITOR SQL INTERACTIVO (UNIDADES 6, 7, 8, 9, 10)
          ===================================================================== */}
      {activity.type === 'sql-editor' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden shadow-xs">
            <div className="bg-slate-900 px-4 py-2 flex items-center justify-between text-xs font-mono text-slate-300 border-b border-slate-800">
              <span className="flex items-center gap-2 text-indigo-400 font-semibold">
                <Code2 className="w-4 h-4" />
                <span>Consola MySQL Interactiva</span>
              </span>
              <button
                onClick={handleResetSql}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition text-[11px]"
                title="Restablecer consulta original"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Restablecer</span>
              </button>
            </div>

            <textarea
              value={userQuery}
              onChange={(e) => setUserQuery(e.target.value)}
              rows={6}
              spellCheck={false}
              className="w-full p-4 bg-slate-950 text-emerald-400 font-mono text-xs sm:text-sm focus:outline-hidden resize-y leading-relaxed selection:bg-indigo-600"
              placeholder="Escribí aquí tu instrucción SQL..."
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Presioná el botón para comprobar la sintaxis MySQL y simular el resultado.
            </span>
            <button
              onClick={handleExecuteSql}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white transition shadow-md shadow-indigo-600/20"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Ejecutar y Comprobar</span>
            </button>
          </div>

          {/* Resultado de la ejecución */}
          {executionState.tested && (
            <div
              className={`p-4 rounded-2xl border text-xs sm:text-sm animate-fadeIn space-y-3 ${
                executionState.success
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200'
                  : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-950 dark:text-rose-200'
              }`}
            >
              <div className="flex items-start gap-2.5">
                {executionState.success ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <h4 className="font-bold text-sm">
                    {executionState.success ? '¡Resultado Correcto!' : 'Revisión Necesaria'}
                  </h4>
                  <p className="mt-0.5">{executionState.message}</p>
                </div>
              </div>

              {/* Vista previa simulada de la base de datos si tuvo éxito */}
              {executionState.success && (
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-emerald-200 dark:border-emerald-800/80 p-3.5 space-y-2 mt-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                    <Table className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Resultado simulado en la Base de Datos Escolar:</span>
                  </div>

                  {/* Renderizado de resultado según la unidad */}
                  {unitNumber === 6 && (
                    <div className="text-xs text-slate-600 dark:text-slate-300 space-y-2">
                      <p className="font-semibold text-emerald-700 dark:text-emerald-300">
                        ✓ Tabla "Alumnos" creada exitosamente con el siguiente esquema:
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono">
                        <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                          <span className="font-bold block text-slate-800 dark:text-slate-200">id_alumno</span>
                          <span className="text-slate-500 text-[10px]">INT, PK, AUTO_INC</span>
                        </div>
                        <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                          <span className="font-bold block text-slate-800 dark:text-slate-200">nombre</span>
                          <span className="text-slate-500 text-[10px]">VARCHAR(100), NOT NULL</span>
                        </div>
                        <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                          <span className="font-bold block text-slate-800 dark:text-slate-200">apellido</span>
                          <span className="text-slate-500 text-[10px]">VARCHAR(100), NOT NULL</span>
                        </div>
                        <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                          <span className="font-bold block text-slate-800 dark:text-slate-200">email</span>
                          <span className="text-slate-500 text-[10px]">VARCHAR(150), NOT NULL</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {unitNumber === 7 && (
                    <div className="text-xs space-y-2">
                      <p className="text-slate-600 dark:text-slate-300">
                        1 fila insertada. Tabla <span className="font-mono font-bold">Alumnos</span> actualizada:
                      </p>
                      <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
                        <table className="w-full text-[11px] text-left">
                          <thead className="bg-slate-100 dark:bg-slate-800 font-mono text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                            <tr>
                              <th className="py-1.5 px-3">id_alumno</th>
                              <th className="py-1.5 px-3">nombre</th>
                              <th className="py-1.5 px-3">apellido</th>
                              <th className="py-1.5 px-3">email</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            <tr className="text-slate-500">
                              <td className="py-1.5 px-3 font-mono">1</td>
                              <td className="py-1.5 px-3">Ana</td>
                              <td className="py-1.5 px-3">Pérez</td>
                              <td className="py-1.5 px-3 font-mono">ana@escuela.com</td>
                            </tr>
                            <tr className="text-slate-500">
                              <td className="py-1.5 px-3 font-mono">2</td>
                              <td className="py-1.5 px-3">Juan</td>
                              <td className="py-1.5 px-3">López</td>
                              <td className="py-1.5 px-3 font-mono">juan@escuela.com</td>
                            </tr>
                            <tr className="text-slate-500">
                              <td className="py-1.5 px-3 font-mono">3</td>
                              <td className="py-1.5 px-3">María</td>
                              <td className="py-1.5 px-3">Gómez</td>
                              <td className="py-1.5 px-3 font-mono">maria@escuela.com</td>
                            </tr>
                            <tr className="bg-emerald-50 dark:bg-emerald-950/60 font-semibold text-emerald-900 dark:text-emerald-200">
                              <td className="py-1.5 px-3 font-mono">4 (nuevo)</td>
                              <td className="py-1.5 px-3">Lucas</td>
                              <td className="py-1.5 px-3">Benítez</td>
                              <td className="py-1.5 px-3 font-mono">lucas@escuela.com</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {(unitNumber === 8 || unitNumber === 9 || unitNumber === 10) && activity.expectedSampleRows && (
                    <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
                      <table className="w-full text-[11px] text-left">
                        <thead className="bg-slate-100 dark:bg-slate-800 font-mono text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                          <tr>
                            {activity.expectedResultColumns?.map((col) => (
                              <th key={col} className="py-1.5 px-3">{col}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                          {activity.expectedSampleRows.map((row, rIdx) => (
                            <tr key={rIdx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                              {activity.expectedResultColumns?.map((col) => (
                                <td key={col} className="py-1.5 px-3 font-mono">
                                  {String(row[col])}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* =====================================================================
          TIPO 2: CLASIFICACIÓN / MATCHING (UNIDADES 1, 3, 5)
          ===================================================================== */}
      {activity.type === 'drag-drop' && (
        <div className="space-y-4">
          {unitNumber === 1 && (
            <div className="space-y-3">
              {[
                { key: 'alumnos', label: '1. "Alumnos" (la cuadrícula completa con todos los estudiantes)', target: 'tabla' },
                { key: 'email', label: '2. "email" (la columna vertical con los correos)', target: 'campo' },
                { key: 'ana', label: '3. "Ana Pérez, ana@escuela.com" (la fila horizontal con sus datos)', target: 'registro' }
              ].map((item) => {
                const selected = userSelections[item.key];
                const isTested = classificationFeedback.tested;
                const isCorrect = classificationFeedback.feedbackMap[item.key];

                return (
                  <div key={item.key} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <span className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200">
                      {item.label}
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {[
                        { val: 'tabla', name: 'Tabla' },
                        { val: 'campo', name: 'Campo' },
                        { val: 'registro', name: 'Registro' }
                      ].map((opt) => (
                        <button
                          key={opt.val}
                          onClick={() => handleClassificationSelect(item.key, opt.val)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition border ${
                            selected === opt.val
                              ? isTested
                                ? isCorrect
                                  ? 'bg-emerald-600 text-white border-emerald-700'
                                  : 'bg-rose-600 text-white border-rose-700'
                                : 'bg-indigo-600 text-white border-indigo-700'
                              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          {opt.name}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {unitNumber === 3 && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Identificá si cada columna de la tabla <span className="font-mono font-bold">Inscripciones</span> es Clave Primaria (PK) o Clave Foránea (FK):
              </p>
              {[
                { key: 'id_inscripcion', label: '1. id_inscripcion (número único de cada fila de inscripción)', correct: 'pk' },
                { key: 'id_alumno', label: '2. id_alumno (hace referencia a la tabla Alumnos)', correct: 'fk' },
                { key: 'id_curso', label: '3. id_curso (hace referencia a la tabla Cursos)', correct: 'fk' }
              ].map((item) => {
                const selected = userSelections[item.key];
                const isTested = classificationFeedback.tested;
                const isCorrect = classificationFeedback.feedbackMap[item.key];

                return (
                  <div key={item.key} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <span className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200">
                      {item.label}
                    </span>
                    <div className="flex items-center gap-2 shrink-0">
                      {[
                        { val: 'pk', name: 'Clave Primaria (PK)' },
                        { val: 'fk', name: 'Clave Foránea (FK)' }
                      ].map((opt) => (
                        <button
                          key={opt.val}
                          onClick={() => handleClassificationSelect(item.key, opt.val)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition border ${
                            selected === opt.val
                              ? isTested
                                ? isCorrect
                                  ? 'bg-emerald-600 text-white border-emerald-700'
                                  : 'bg-rose-600 text-white border-rose-700'
                                : 'bg-indigo-600 text-white border-indigo-700'
                              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          {opt.name}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {unitNumber === 5 && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Asigná a cada palabra clave de SQL su propósito en el sistema escolar:
              </p>
              {[
                { key: 'create', label: 'CREATE TABLE Alumnos (...)', correct: 'crear' },
                { key: 'insert', label: 'INSERT INTO Alumnos (...) VALUES (...)', correct: 'guardar' },
                { key: 'select', label: 'SELECT * FROM Cursos', correct: 'consultar' },
                { key: 'where', label: 'WHERE anio = 1', correct: 'filtrar' }
              ].map((item) => {
                const selected = userSelections[item.key];
                const isTested = classificationFeedback.tested;
                const isCorrect = classificationFeedback.feedbackMap[item.key];

                return (
                  <div key={item.key} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <span className="text-xs sm:text-sm font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      {item.label}
                    </span>
                    <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                      {[
                        { val: 'crear', name: 'Crear tabla' },
                        { val: 'guardar', name: 'Guardar datos' },
                        { val: 'consultar', name: 'Consultar datos' },
                        { val: 'filtrar', name: 'Filtrar condición' }
                      ].map((opt) => (
                        <button
                          key={opt.val}
                          onClick={() => handleClassificationSelect(item.key, opt.val)}
                          className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition border ${
                            selected === opt.val
                              ? isTested
                                ? isCorrect
                                  ? 'bg-emerald-600 text-white border-emerald-700'
                                  : 'bg-rose-600 text-white border-rose-700'
                                : 'bg-indigo-600 text-white border-indigo-700'
                              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          {opt.name}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Seleccioná una opción para cada fila y verificá tu respuesta.
            </span>
            <button
              onClick={handleCheckClassification}
              className="flex items-center gap-2 px-5 py-2 rounded-xl font-bold text-xs sm:text-sm bg-indigo-600 hover:bg-indigo-700 text-white transition active:scale-95 shadow-md shadow-indigo-600/20"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Comprobar Clasificación</span>
            </button>
          </div>

          {classificationFeedback.tested && (
            <div
              className={`p-4 rounded-2xl border text-xs sm:text-sm animate-fadeIn flex items-center gap-3 ${
                classificationFeedback.allCorrect
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200'
                  : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-950 dark:text-rose-200'
              }`}
            >
              {classificationFeedback.allCorrect ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
              )}
              <div>
                <span className="font-bold block">
                  {classificationFeedback.allCorrect ? '¡Perfecto! Todo coincide correctamente.' : 'Hay opciones incorrectas o incompletas.'}
                </span>
                <span>{activity.explanation}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =====================================================================
          TIPO 3: COMPLETAR ESPACIOS EN BLANCO (UNIDADES 2, 4)
          ===================================================================== */}
      {activity.type === 'fill-blanks' && (
        <div className="space-y-4">
          {unitNumber === 2 && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-3">
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                Inscribir a <span className="font-bold text-slate-900 dark:text-slate-100">Juan López</span> (id_alumno = 2) en el curso <span className="font-bold text-slate-900 dark:text-slate-100">1.º A</span> (id_curso = 1):
              </p>
              <div className="flex flex-wrap items-center gap-3 font-mono text-xs sm:text-sm">
                <span className="text-slate-500">Fila en Inscripciones: (id_inscripcion: 2,</span>
                <label className="flex items-center gap-1.5">
                  <span className="text-slate-700 dark:text-slate-300 font-bold">id_alumno =</span>
                  <input
                    type="text"
                    value={blankInputs['id_alumno'] || ''}
                    onChange={(e) => setBlankInputs(prev => ({ ...prev, id_alumno: e.target.value }))}
                    placeholder="2"
                    className={`w-16 px-2.5 py-1 rounded-lg border text-center font-bold font-mono focus:outline-hidden ${
                      blanksFeedback.tested
                        ? blanksFeedback.errors['id_alumno']
                          ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-700'
                          : 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700'
                        : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100'
                    }`}
                  />
                </label>
                <span className="text-slate-500">,</span>
                <label className="flex items-center gap-1.5">
                  <span className="text-slate-700 dark:text-slate-300 font-bold">id_curso =</span>
                  <input
                    type="text"
                    value={blankInputs['id_curso'] || ''}
                    onChange={(e) => setBlankInputs(prev => ({ ...prev, id_curso: e.target.value }))}
                    placeholder="1"
                    className={`w-16 px-2.5 py-1 rounded-lg border text-center font-bold font-mono focus:outline-hidden ${
                      blanksFeedback.tested
                        ? blanksFeedback.errors['id_curso']
                          ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-700'
                          : 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700'
                        : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100'
                    }`}
                  />
                </label>
                <span className="text-slate-500">, fecha: '2026-03-01')</span>
              </div>
            </div>
          )}

          {unitNumber === 4 && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-3">
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                Completá las dos combinaciones (id_curso, id_materia) para vincular <span className="font-bold">1.º B</span> (id_curso = 2) con <span className="font-bold">Matemática</span> (id_materia = 1) e <span className="font-bold">Historia</span> (id_materia = 3):
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm font-mono">
                <label className="flex items-center gap-2 p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500">Fila 1 (Matemática):</span>
                  <input
                    type="text"
                    value={blankInputs['fila1'] || ''}
                    onChange={(e) => setBlankInputs(prev => ({ ...prev, fila1: e.target.value }))}
                    placeholder="2, 1"
                    className={`w-28 px-2 py-1 rounded-lg border text-center font-mono font-bold focus:outline-hidden ${
                      blanksFeedback.tested
                        ? blanksFeedback.errors['fila1']
                          ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-700'
                          : 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700'
                        : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100'
                    }`}
                  />
                </label>

                <label className="flex items-center gap-2 p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500">Fila 2 (Historia):</span>
                  <input
                    type="text"
                    value={blankInputs['fila2'] || ''}
                    onChange={(e) => setBlankInputs(prev => ({ ...prev, fila2: e.target.value }))}
                    placeholder="2, 3"
                    className={`w-28 px-2 py-1 rounded-lg border text-center font-mono font-bold focus:outline-hidden ${
                      blanksFeedback.tested
                        ? blanksFeedback.errors['fila2']
                          ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-700'
                          : 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700'
                        : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100'
                    }`}
                  />
                </label>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Ingresá los números correspondientes y comprobá.
            </span>
            <button
              onClick={handleCheckBlanks}
              className="flex items-center gap-2 px-5 py-2 rounded-xl font-bold text-xs sm:text-sm bg-indigo-600 hover:bg-indigo-700 text-white transition active:scale-95 shadow-md shadow-indigo-600/20"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Verificar Valores</span>
            </button>
          </div>

          {blanksFeedback.tested && (
            <div
              className={`p-4 rounded-2xl border text-xs sm:text-sm animate-fadeIn flex items-center gap-3 ${
                blanksFeedback.allCorrect
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200'
                  : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-950 dark:text-rose-200'
              }`}
            >
              {blanksFeedback.allCorrect ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
              )}
              <div>
                <span className="font-bold block">
                  {blanksFeedback.allCorrect ? '¡Correcto! Los valores coinciden exactamente.' : 'Alguno de los valores no es correcto.'}
                </span>
                <span>{activity.explanation}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
