import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  DEMO_CURSOS, DEMO_ALUMNOS, DEMO_MATERIAS, DEMO_INSCRIPCIONES, DEMO_CURSO_MATERIA,
  TABLES_META 
} from '../../data/demoSchoolDb';
import { Key, Link as LinkIcon, Table, Layers, Info } from 'lucide-react';

export type RelationId = 
  | 'cursos-inscripciones' 
  | 'alumnos-inscripciones' 
  | 'cursos-cursomateria' 
  | 'materias-cursomateria';

interface FiveTablesDiagramProps {
  highlightRelation?: 'all' | RelationId | 'none';
  focusTableOnly?: string;
  showExplanationCard?: boolean;
}

interface LineCoord {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export const FiveTablesDiagram: React.FC<FiveTablesDiagramProps> = ({
  highlightRelation = 'all',
  focusTableOnly,
  showExplanationCard = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedRelation, setSelectedRelation] = useState<RelationId | null>(null);
  const [lineCoords, setLineCoords] = useState<{
    cursosInscripciones?: LineCoord;
    alumnosInscripciones?: LineCoord;
    cursosCursoMateria?: LineCoord;
    materiasCursoMateria?: LineCoord;
  }>({});

  const activeRelation: RelationId | null = 
    selectedRelation || (highlightRelation !== 'all' && highlightRelation !== 'none' ? highlightRelation : null);

  const isRelActive = (rel: RelationId) => {
    if (!activeRelation) return true;
    return activeRelation === rel;
  };

  const isRelFocused = (rel: RelationId) => {
    return activeRelation === rel;
  };

  // Medición reactiva de puertos para trazado SVG
  const updateCoords = useCallback(() => {
    if (!containerRef.current || focusTableOnly) return;
    const containerRect = containerRef.current.getBoundingClientRect();

    const getPortCoord = (id: string, side: 'left' | 'right') => {
      const el = containerRef.current?.querySelector(`[data-port="${id}"]`);
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      return {
        x: (side === 'left' ? rect.left : rect.right) - containerRect.left,
        y: rect.top + rect.height / 2 - containerRect.top
      };
    };

    // Puertos
    const pCursosPk = getPortCoord('cursos-id_curso', 'left');
    const pInscripcionesFkCurso = getPortCoord('inscripciones-id_curso', 'left');

    const pAlumnosPk = getPortCoord('alumnos-id_alumno', 'left');
    const pInscripcionesFkAlumno = getPortCoord('inscripciones-id_alumno', 'left');

    const pCursosPkRight = getPortCoord('cursos-id_curso', 'right');
    const pCursoMateriaFkCurso = getPortCoord('cursomateria-id_curso', 'left');

    const pMateriasPk = getPortCoord('materias-id_materia', 'right');
    const pCursoMateriaFkMateria = getPortCoord('cursomateria-id_materia', 'right');

    if (pCursosPk && pInscripcionesFkCurso && pAlumnosPk && pInscripcionesFkAlumno && pCursosPkRight && pCursoMateriaFkCurso && pMateriasPk && pCursoMateriaFkMateria) {
      setLineCoords({
        cursosInscripciones: { x1: pCursosPk.x, y1: pCursosPk.y, x2: pInscripcionesFkCurso.x, y2: pInscripcionesFkCurso.y },
        alumnosInscripciones: { x1: pAlumnosPk.x, y1: pAlumnosPk.y, x2: pInscripcionesFkAlumno.x, y2: pInscripcionesFkAlumno.y },
        cursosCursoMateria: { x1: pCursosPkRight.x, y1: pCursosPkRight.y, x2: pCursoMateriaFkCurso.x, y2: pCursoMateriaFkCurso.y },
        materiasCursoMateria: { x1: pMateriasPk.x, y1: pMateriasPk.y, x2: pCursoMateriaFkMateria.x, y2: pCursoMateriaFkMateria.y },
      });
    }
  }, [focusTableOnly]);

  useEffect(() => {
    updateCoords();
    const t1 = setTimeout(updateCoords, 60);
    const t2 = setTimeout(updateCoords, 300);

    const ro = new ResizeObserver(() => {
      updateCoords();
    });

    if (containerRef.current) {
      ro.observe(containerRef.current);
    }

    window.addEventListener('resize', updateCoords);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      ro.disconnect();
      window.removeEventListener('resize', updateCoords);
    };
  }, [updateCoords]);

  // Generador de ruta ortogonal: Gutter izquierdo superior (Cursos -> Inscripciones)
  const renderCursosInscripcionesPath = (coords: LineCoord, active: boolean, focused: boolean) => {
    const { x1, y1, x2, y2 } = coords;
    const gx = Math.min(x1, x2) - 26;
    const r = 8;
    const d = `M ${x1} ${y1} H ${gx + r} Q ${gx} ${y1} ${gx} ${y1 + r} V ${y2 - r} Q ${gx} ${y2} ${gx + r} ${y2} H ${x2}`;
    const color = '#4f46e5'; // Indigo

    return (
      <g key="rel-cursos-inscripciones" className="cursor-pointer" onClick={() => setSelectedRelation(activeRelation === 'cursos-inscripciones' ? null : 'cursos-inscripciones')}>
        <path d={d} fill="none" stroke="transparent" strokeWidth="22" pointerEvents="stroke" />
        <path 
          d={d} 
          fill="none" 
          stroke={color} 
          strokeWidth={focused ? '3.5' : '2.5'} 
          className="transition-all duration-300"
          style={{ opacity: active ? 1 : 0.25, filter: focused ? 'drop-shadow(0 0 6px rgba(99, 102, 241, 0.7))' : 'none' }}
        />
        {/* PK 1 */}
        <circle cx={x1} cy={y1} r="4" fill={color} style={{ opacity: active ? 1 : 0.25 }} />
        <rect x={gx - 14} y={y1 - 9} width="16" height="18" rx="4" fill="#4f46e5" />
        <text x={gx - 6} y={y1 + 4} textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold" fontFamily="monospace">1</text>
        {/* FK N */}
        <path d={`M ${x2 - 7} ${y2 - 4} L ${x2} ${y2} L ${x2 - 7} ${y2 + 4}`} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
        <rect x={gx - 14} y={y2 - 9} width="16" height="18" rx="4" fill="#4f46e5" />
        <text x={gx - 6} y={y2 + 4} textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold" fontFamily="monospace">N</text>
      </g>
    );
  };

  // Generador de ruta ortogonal: Gutter izquierdo inferior (Alumnos -> Inscripciones)
  const renderAlumnosInscripcionesPath = (coords: LineCoord, active: boolean, focused: boolean) => {
    const { x1, y1, x2, y2 } = coords;
    const gx = Math.min(x1, x2) - 18;
    const r = 8;
    const d = `M ${x1} ${y1} H ${gx + r} Q ${gx} ${y1} ${gx} ${y1 - r} V ${y2 + r} Q ${gx} ${y2} ${gx + r} ${y2} H ${x2}`;
    const color = '#9333ea'; // Purple

    return (
      <g key="rel-alumnos-inscripciones" className="cursor-pointer" onClick={() => setSelectedRelation(activeRelation === 'alumnos-inscripciones' ? null : 'alumnos-inscripciones')}>
        <path d={d} fill="none" stroke="transparent" strokeWidth="22" pointerEvents="stroke" />
        <path 
          d={d} 
          fill="none" 
          stroke={color} 
          strokeWidth={focused ? '3.5' : '2.5'} 
          className="transition-all duration-300"
          style={{ opacity: active ? 1 : 0.25, filter: focused ? 'drop-shadow(0 0 6px rgba(168, 85, 247, 0.7))' : 'none' }}
        />
        {/* PK 1 */}
        <circle cx={x1} cy={y1} r="4" fill={color} style={{ opacity: active ? 1 : 0.25 }} />
        <rect x={gx - 14} y={y1 - 9} width="16" height="18" rx="4" fill="#9333ea" />
        <text x={gx - 6} y={y1 + 4} textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold" fontFamily="monospace">1</text>
        {/* FK N */}
        <path d={`M ${x2 - 7} ${y2 - 4} L ${x2} ${y2} L ${x2 - 7} ${y2 + 4}`} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
        <rect x={gx - 14} y={y2 - 9} width="16" height="18" rx="4" fill="#9333ea" />
        <text x={gx - 6} y={y2 + 4} textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold" fontFamily="monospace">N</text>
      </g>
    );
  };

  // Generador de ruta ortogonal: Corredor Central (Cursos -> Curso_Materia)
  const renderCursosCursoMateriaPath = (coords: LineCoord, active: boolean, focused: boolean) => {
    const { x1, y1, x2, y2 } = coords;
    const midX = (x1 + x2) / 2;
    const r = Math.min(8, Math.max(2, Math.abs(y2 - y1) / 2));
    const dirY = y2 >= y1 ? 1 : -1;
    const d = `M ${x1} ${y1} H ${midX - r} Q ${midX} ${y1} ${midX} ${y1 + dirY * r} V ${y2 - dirY * r} Q ${midX} ${y2} ${midX + r} ${y2} H ${x2}`;
    const color = '#2563eb'; // Blue

    return (
      <g key="rel-cursos-cursomateria" className="cursor-pointer" onClick={() => setSelectedRelation(activeRelation === 'cursos-cursomateria' ? null : 'cursos-cursomateria')}>
        <path d={d} fill="none" stroke="transparent" strokeWidth="22" pointerEvents="stroke" />
        <path 
          d={d} 
          fill="none" 
          stroke={color} 
          strokeWidth={focused ? '3.5' : '2.5'} 
          className="transition-all duration-300"
          style={{ opacity: active ? 1 : 0.25, filter: focused ? 'drop-shadow(0 0 6px rgba(37, 99, 235, 0.7))' : 'none' }}
        />
        {/* PK 1 */}
        <circle cx={x1} cy={y1} r="4" fill={color} style={{ opacity: active ? 1 : 0.25 }} />
        <rect x={x1 + 6} y={y1 - 9} width="16" height="18" rx="4" fill="#2563eb" />
        <text x={x1 + 14} y={y1 + 4} textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold" fontFamily="monospace">1</text>
        {/* FK N */}
        <path d={`M ${x2 - 7} ${y2 - 4} L ${x2} ${y2} L ${x2 - 7} ${y2 + 4}`} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
        <rect x={x2 - 22} y={y2 - 9} width="16" height="18" rx="4" fill="#2563eb" />
        <text x={x2 - 14} y={y2 + 4} textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold" fontFamily="monospace">N</text>
      </g>
    );
  };

  // Generador de ruta ortogonal: Gutter derecho (Materias -> Curso_Materia)
  const renderMateriasCursoMateriaPath = (coords: LineCoord, active: boolean, focused: boolean) => {
    const { x1, y1, x2, y2 } = coords;
    const gx = Math.max(x1, x2) + 24;
    const r = 8;
    const d = `M ${x1} ${y1} H ${gx - r} Q ${gx} ${y1} ${gx} ${y1 + r} V ${y2 - r} Q ${gx} ${y2} ${gx - r} ${y2} H ${x2}`;
    const color = '#059669'; // Emerald

    return (
      <g key="rel-materias-cursomateria" className="cursor-pointer" onClick={() => setSelectedRelation(activeRelation === 'materias-cursomateria' ? null : 'materias-cursomateria')}>
        <path d={d} fill="none" stroke="transparent" strokeWidth="22" pointerEvents="stroke" />
        <path 
          d={d} 
          fill="none" 
          stroke={color} 
          strokeWidth={focused ? '3.5' : '2.5'} 
          className="transition-all duration-300"
          style={{ opacity: active ? 1 : 0.25, filter: focused ? 'drop-shadow(0 0 6px rgba(5, 150, 105, 0.7))' : 'none' }}
        />
        {/* PK 1 */}
        <circle cx={x1} cy={y1} r="4" fill={color} style={{ opacity: active ? 1 : 0.25 }} />
        <rect x={gx - 2} y={y1 - 9} width="16" height="18" rx="4" fill="#059669" />
        <text x={gx + 6} y={y1 + 4} textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold" fontFamily="monospace">1</text>
        {/* FK N */}
        <path d={`M ${x2 + 7} ${y2 - 4} L ${x2} ${y2} L ${x2 + 7} ${y2 + 4}`} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
        <rect x={gx - 2} y={y2 - 9} width="16" height="18" rx="4" fill="#059669" />
        <text x={gx + 6} y={y2 + 4} textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold" fontFamily="monospace">N</text>
      </g>
    );
  };

  const isFieldHighlighted = (tableName: string, fieldName: string) => {
    if (!activeRelation) return false;
    if (activeRelation === 'cursos-inscripciones') {
      return (tableName === 'Cursos' && fieldName === 'id_curso') ||
             (tableName === 'Inscripciones' && fieldName === 'id_curso');
    }
    if (activeRelation === 'alumnos-inscripciones') {
      return (tableName === 'Alumnos' && fieldName === 'id_alumno') ||
             (tableName === 'Inscripciones' && fieldName === 'id_alumno');
    }
    if (activeRelation === 'cursos-cursomateria') {
      return (tableName === 'Cursos' && fieldName === 'id_curso') ||
             (tableName === 'Curso_Materia' && fieldName === 'id_curso');
    }
    if (activeRelation === 'materias-cursomateria') {
      return (tableName === 'Materias' && fieldName === 'id_materia') ||
             (tableName === 'Curso_Materia' && fieldName === 'id_materia');
    }
    return false;
  };

  return (
    <div className="w-full space-y-4">
      {/* Barra de Leyenda Interactiva */}
      {!focusTableOnly && (
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-50 dark:bg-slate-900/80 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 transition-colors shadow-2xs">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px] mr-1 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-indigo-500" />
              Líneas Relacionales:
            </span>

            {/* Relación 1 */}
            <button
              onClick={() => setSelectedRelation(activeRelation === 'cursos-inscripciones' ? null : 'cursos-inscripciones')}
              className={`px-2.5 py-1 rounded-lg font-mono text-[11px] font-semibold transition border flex items-center gap-1 ${
                isRelFocused('cursos-inscripciones')
                  ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-900/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/40'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
              <span>Cursos ➔ Inscripciones (1:N)</span>
            </button>

            {/* Relación 2 */}
            <button
              onClick={() => setSelectedRelation(activeRelation === 'alumnos-inscripciones' ? null : 'alumnos-inscripciones')}
              className={`px-2.5 py-1 rounded-lg font-mono text-[11px] font-semibold transition border flex items-center gap-1 ${
                isRelFocused('alumnos-inscripciones')
                  ? 'bg-purple-600 text-white border-purple-700 shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-900/60 hover:bg-purple-50 dark:hover:bg-purple-950/40'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-purple-500" />
              <span>Alumnos ➔ Inscripciones (1:N)</span>
            </button>

            {/* Relación 3 */}
            <button
              onClick={() => setSelectedRelation(activeRelation === 'cursos-cursomateria' ? null : 'cursos-cursomateria')}
              className={`px-2.5 py-1 rounded-lg font-mono text-[11px] font-semibold transition border flex items-center gap-1 ${
                isRelFocused('cursos-cursomateria')
                  ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900/60 hover:bg-blue-50 dark:hover:bg-blue-950/40'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span>Cursos ➔ Curso_Materia (1:N)</span>
            </button>

            {/* Relación 4 */}
            <button
              onClick={() => setSelectedRelation(activeRelation === 'materias-cursomateria' ? null : 'materias-cursomateria')}
              className={`px-2.5 py-1 rounded-lg font-mono text-[11px] font-semibold transition border flex items-center gap-1 ${
                isRelFocused('materias-cursomateria')
                  ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Materias ➔ Curso_Materia (1:N)</span>
            </button>

            {activeRelation && (
              <button
                onClick={() => setSelectedRelation(null)}
                className="px-2 py-1 rounded-lg text-[11px] font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 underline"
              >
                Ver todas
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-1 font-semibold text-amber-700 dark:text-amber-400">
              <Key className="w-3 h-3 text-amber-500" /> Clave Primaria (PK)
            </span>
            <span className="inline-flex items-center gap-1 font-semibold text-indigo-700 dark:text-indigo-400">
              <LinkIcon className="w-3 h-3 text-indigo-500" /> Clave Foránea (FK)
            </span>
          </div>
        </div>
      )}

      {/* Contenedor del Diagrama */}
      <div className="overflow-x-auto pb-4 pt-1">
        <div 
          ref={containerRef}
          className={`relative ${
            focusTableOnly 
              ? 'max-w-md mx-auto p-4' 
              : 'min-w-[760px] max-w-5xl mx-auto px-10 py-6'
          }`}
        >
          {/* Capa vectorial SVG con líneas ortogonales */}
          {!focusTableOnly && (
            <svg 
              className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible"
              style={{ minHeight: '100%' }}
            >
              {/* Relación 1: Cursos -> Inscripciones */}
              {lineCoords.cursosInscripciones && renderCursosInscripcionesPath(
                lineCoords.cursosInscripciones, 
                isRelActive('cursos-inscripciones'),
                isRelFocused('cursos-inscripciones')
              )}

              {/* Relación 2: Alumnos -> Inscripciones */}
              {lineCoords.alumnosInscripciones && renderAlumnosInscripcionesPath(
                lineCoords.alumnosInscripciones, 
                isRelActive('alumnos-inscripciones'),
                isRelFocused('alumnos-inscripciones')
              )}

              {/* Relación 3: Cursos -> Curso_Materia */}
              {lineCoords.cursosCursoMateria && renderCursosCursoMateriaPath(
                lineCoords.cursosCursoMateria, 
                isRelActive('cursos-cursomateria'),
                isRelFocused('cursos-cursomateria')
              )}

              {/* Relación 4: Materias -> Curso_Materia */}
              {lineCoords.materiasCursoMateria && renderMateriasCursoMateriaPath(
                lineCoords.materiasCursoMateria, 
                isRelActive('materias-cursomateria'),
                isRelFocused('materias-cursomateria')
              )}
            </svg>
          )}

          {/* Grid de 2 Columnas para las 5 Tablas */}
          <div className={`grid gap-x-12 gap-y-8 ${focusTableOnly ? 'grid-cols-1' : 'grid-cols-2'}`}>
            
            {/* ================= COLUMNA IZQUIERDA ================= */}
            <div className="space-y-8">
              
              {/* TABLA 1: CURSOS */}
              {(!focusTableOnly || focusTableOnly === 'Cursos') && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-indigo-200 dark:border-indigo-900/60 shadow-sm overflow-hidden transition-all">
                  <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-4 py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Table className="w-4 h-4 text-indigo-200" />
                      <span className="font-mono font-bold text-sm tracking-wide">Cursos</span>
                    </div>
                    <span className="text-[10px] font-mono bg-indigo-800/80 px-2 py-0.5 rounded-full border border-indigo-500/40">
                      3 registros
                    </span>
                  </div>

                  {/* Columnas */}
                  <div className="p-3 bg-slate-50/80 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-xs font-mono space-y-1">
                    <div className="text-[10px] font-sans font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 pb-1">
                      Columnas (Estructura MySQL)
                    </div>

                    <div 
                      data-port="cursos-id_curso"
                      className={`flex items-center justify-between p-1.5 rounded-lg transition ${
                        isFieldHighlighted('Cursos', 'id_curso')
                          ? 'bg-indigo-100 dark:bg-indigo-950/90 text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-400'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700 flex items-center gap-1">
                          <Key className="w-2.5 h-2.5 text-amber-600" /> PK
                        </span>
                        <span className="font-bold text-slate-800 dark:text-slate-100">id_curso</span>
                      </div>
                      <span className="text-slate-400 dark:text-slate-500 text-[11px]">INT AUTO_INCREMENT</span>
                    </div>

                    <div className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/50">
                      <div className="flex items-center gap-2">
                        <span className="w-8 text-center text-slate-400">•</span>
                        <span className="text-slate-700 dark:text-slate-300">nombre</span>
                      </div>
                      <span className="text-slate-400 dark:text-slate-500 text-[11px]">VARCHAR(50)</span>
                    </div>

                    <div className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/50">
                      <div className="flex items-center gap-2">
                        <span className="w-8 text-center text-slate-400">•</span>
                        <span className="text-slate-700 dark:text-slate-300">anio</span>
                      </div>
                      <span className="text-slate-400 dark:text-slate-500 text-[11px]">INT</span>
                    </div>
                  </div>

                  {/* Registros */}
                  <div className="p-3 text-xs">
                    <table className="w-full text-left font-mono text-[11px]">
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {DEMO_CURSOS.map((c) => (
                          <tr key={c.id_curso} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                            <td className="py-1 px-2 text-indigo-600 dark:text-indigo-400 font-bold w-12">{c.id_curso}</td>
                            <td className="py-1 px-2 text-slate-800 dark:text-slate-200">{c.nombre}</td>
                            <td className="py-1 px-2 text-slate-500 dark:text-slate-400 text-right">Año {c.anio}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TABLA 4: INSCRIPCIONES (Pivote Cursos-Alumnos) */}
              {(!focusTableOnly || focusTableOnly === 'Inscripciones') && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-indigo-300 dark:border-indigo-800/80 shadow-sm overflow-hidden transition-all">
                  <div className="bg-gradient-to-r from-indigo-700 to-purple-700 text-white px-4 py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Table className="w-4 h-4 text-purple-200" />
                      <span className="font-mono font-bold text-sm tracking-wide">Inscripciones</span>
                    </div>
                    <span className="text-[10px] font-mono bg-indigo-900/80 px-2 py-0.5 rounded-full border border-indigo-400/40">
                      3 registros (1:N)
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50/80 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-xs font-mono space-y-1">
                    <div className="text-[10px] font-sans font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 pb-1">
                      Columnas (Estructura MySQL)
                    </div>

                    <div className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/50">
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700 flex items-center gap-1">
                          <Key className="w-2.5 h-2.5 text-amber-600" /> PK
                        </span>
                        <span className="font-bold text-slate-800 dark:text-slate-100">id_inscripcion</span>
                      </div>
                      <span className="text-slate-400 dark:text-slate-500 text-[11px]">INT AUTO_INCREMENT</span>
                    </div>

                    <div 
                      data-port="inscripciones-id_alumno"
                      className={`flex items-center justify-between p-1.5 rounded-lg transition ${
                        isFieldHighlighted('Inscripciones', 'id_alumno')
                          ? 'bg-purple-100 dark:bg-purple-950/90 text-purple-900 dark:text-purple-200 ring-2 ring-purple-400'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-700 flex items-center gap-1">
                          <LinkIcon className="w-2.5 h-2.5 text-purple-600" /> FK
                        </span>
                        <span className="font-bold text-purple-700 dark:text-purple-400">id_alumno</span>
                      </div>
                      <span className="text-slate-400 dark:text-slate-500 text-[11px]">INT</span>
                    </div>

                    <div 
                      data-port="inscripciones-id_curso"
                      className={`flex items-center justify-between p-1.5 rounded-lg transition ${
                        isFieldHighlighted('Inscripciones', 'id_curso')
                          ? 'bg-indigo-100 dark:bg-indigo-950/90 text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-400'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-700 flex items-center gap-1">
                          <LinkIcon className="w-2.5 h-2.5 text-indigo-600" /> FK
                        </span>
                        <span className="font-bold text-indigo-700 dark:text-indigo-400">id_curso</span>
                      </div>
                      <span className="text-slate-400 dark:text-slate-500 text-[11px]">INT</span>
                    </div>

                    <div className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/50">
                      <div className="flex items-center gap-2">
                        <span className="w-8 text-center text-slate-400">•</span>
                        <span className="text-slate-700 dark:text-slate-300">fecha</span>
                      </div>
                      <span className="text-slate-400 dark:text-slate-500 text-[11px]">DATE</span>
                    </div>
                  </div>

                  <div className="p-3 text-xs">
                    <table className="w-full text-left font-mono text-[11px]">
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {DEMO_INSCRIPCIONES.map((i) => (
                          <tr key={i.id_inscripcion} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                            <td className="py-1 px-1.5 text-slate-400 w-8">{i.id_inscripcion}</td>
                            <td className="py-1 px-1.5 text-purple-600 dark:text-purple-400 font-bold">Alumno {i.id_alumno}</td>
                            <td className="py-1 px-1.5 text-indigo-600 dark:text-indigo-400 font-bold">Curso {i.id_curso}</td>
                            <td className="py-1 px-1.5 text-slate-500 dark:text-slate-400 text-right">{i.fecha}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TABLA 3: ALUMNOS */}
              {(!focusTableOnly || focusTableOnly === 'Alumnos') && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-purple-200 dark:border-purple-900/60 shadow-sm overflow-hidden transition-all">
                  <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Table className="w-4 h-4 text-purple-200" />
                      <span className="font-mono font-bold text-sm tracking-wide">Alumnos</span>
                    </div>
                    <span className="text-[10px] font-mono bg-purple-800/80 px-2 py-0.5 rounded-full border border-purple-500/40">
                      3 registros
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50/80 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-xs font-mono space-y-1">
                    <div className="text-[10px] font-sans font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 pb-1">
                      Columnas (Estructura MySQL)
                    </div>

                    <div 
                      data-port="alumnos-id_alumno"
                      className={`flex items-center justify-between p-1.5 rounded-lg transition ${
                        isFieldHighlighted('Alumnos', 'id_alumno')
                          ? 'bg-purple-100 dark:bg-purple-950/90 text-purple-900 dark:text-purple-200 ring-2 ring-purple-400'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700 flex items-center gap-1">
                          <Key className="w-2.5 h-2.5 text-amber-600" /> PK
                        </span>
                        <span className="font-bold text-slate-800 dark:text-slate-100">id_alumno</span>
                      </div>
                      <span className="text-slate-400 dark:text-slate-500 text-[11px]">INT AUTO_INCREMENT</span>
                    </div>

                    <div className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/50">
                      <div className="flex items-center gap-2">
                        <span className="w-8 text-center text-slate-400">•</span>
                        <span className="text-slate-700 dark:text-slate-300">nombre</span>
                      </div>
                      <span className="text-slate-400 dark:text-slate-500 text-[11px]">VARCHAR(100)</span>
                    </div>

                    <div className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/50">
                      <div className="flex items-center gap-2">
                        <span className="w-8 text-center text-slate-400">•</span>
                        <span className="text-slate-700 dark:text-slate-300">apellido</span>
                      </div>
                      <span className="text-slate-400 dark:text-slate-500 text-[11px]">VARCHAR(100)</span>
                    </div>

                    <div className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/50">
                      <div className="flex items-center gap-2">
                        <span className="w-8 text-center text-slate-400">•</span>
                        <span className="text-slate-700 dark:text-slate-300">email</span>
                      </div>
                      <span className="text-slate-400 dark:text-slate-500 text-[11px]">VARCHAR(150)</span>
                    </div>
                  </div>

                  <div className="p-3 text-xs">
                    <table className="w-full text-left font-mono text-[11px]">
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {DEMO_ALUMNOS.map((a) => (
                          <tr key={a.id_alumno} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                            <td className="py-1 px-1.5 text-purple-600 dark:text-purple-400 font-bold w-8">{a.id_alumno}</td>
                            <td className="py-1 px-1.5 text-slate-800 dark:text-slate-200 font-sans">{a.nombre} {a.apellido}</td>
                            <td className="py-1 px-1.5 text-slate-500 dark:text-slate-400 font-sans text-right">{a.email}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

            </div>

            {/* ================= COLUMNA DERECHA ================= */}
            <div className="space-y-8">
              
              {/* TABLA 2: MATERIAS */}
              {(!focusTableOnly || focusTableOnly === 'Materias') && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-emerald-200 dark:border-emerald-900/60 shadow-sm overflow-hidden transition-all">
                  <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-4 py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Table className="w-4 h-4 text-emerald-200" />
                      <span className="font-mono font-bold text-sm tracking-wide">Materias</span>
                    </div>
                    <span className="text-[10px] font-mono bg-emerald-800/80 px-2 py-0.5 rounded-full border border-emerald-500/40">
                      3 registros
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50/80 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-xs font-mono space-y-1">
                    <div className="text-[10px] font-sans font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 pb-1">
                      Columnas (Estructura MySQL)
                    </div>

                    <div 
                      data-port="materias-id_materia"
                      className={`flex items-center justify-between p-1.5 rounded-lg transition ${
                        isFieldHighlighted('Materias', 'id_materia')
                          ? 'bg-emerald-100 dark:bg-emerald-950/90 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-400'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700 flex items-center gap-1">
                          <Key className="w-2.5 h-2.5 text-amber-600" /> PK
                        </span>
                        <span className="font-bold text-slate-800 dark:text-slate-100">id_materia</span>
                      </div>
                      <span className="text-slate-400 dark:text-slate-500 text-[11px]">INT AUTO_INCREMENT</span>
                    </div>

                    <div className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/50">
                      <div className="flex items-center gap-2">
                        <span className="w-8 text-center text-slate-400">•</span>
                        <span className="text-slate-700 dark:text-slate-300">nombre</span>
                      </div>
                      <span className="text-slate-400 dark:text-slate-500 text-[11px]">VARCHAR(100)</span>
                    </div>
                  </div>

                  <div className="p-3 text-xs">
                    <table className="w-full text-left font-mono text-[11px]">
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {DEMO_MATERIAS.map((m) => (
                          <tr key={m.id_materia} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                            <td className="py-1 px-2 text-emerald-600 dark:text-emerald-400 font-bold w-12">{m.id_materia}</td>
                            <td className="py-1 px-2 text-slate-800 dark:text-slate-200 font-sans">{m.nombre}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TABLA 5: CURSO_MATERIA (Relación N:M) */}
              {(!focusTableOnly || focusTableOnly === 'Curso_Materia') && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-blue-300 dark:border-blue-800/80 shadow-sm overflow-hidden transition-all">
                  <div className="bg-gradient-to-r from-blue-600 to-emerald-600 text-white px-4 py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Table className="w-4 h-4 text-blue-200" />
                      <span className="font-mono font-bold text-sm tracking-wide">Curso_Materia</span>
                    </div>
                    <span className="text-[10px] font-mono bg-blue-900/80 px-2 py-0.5 rounded-full border border-blue-400/40">
                      7 registros (N:M)
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50/80 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-xs font-mono space-y-1">
                    <div className="text-[10px] font-sans font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 pb-1">
                      PK Compuesta + 2 Claves Foráneas
                    </div>

                    <div 
                      data-port="cursomateria-id_curso"
                      className={`flex items-center justify-between p-1.5 rounded-lg transition ${
                        isFieldHighlighted('Curso_Materia', 'id_curso')
                          ? 'bg-blue-100 dark:bg-blue-950/90 text-blue-900 dark:text-blue-200 ring-2 ring-blue-400'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-700 flex items-center gap-1">
                          <LinkIcon className="w-2.5 h-2.5 text-blue-600" /> PK, FK
                        </span>
                        <span className="font-bold text-blue-700 dark:text-blue-400">id_curso</span>
                      </div>
                      <span className="text-slate-400 dark:text-slate-500 text-[11px]">INT ➔ Cursos</span>
                    </div>

                    <div 
                      data-port="cursomateria-id_materia"
                      className={`flex items-center justify-between p-1.5 rounded-lg transition ${
                        isFieldHighlighted('Curso_Materia', 'id_materia')
                          ? 'bg-emerald-100 dark:bg-emerald-950/90 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-400'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 flex items-center gap-1">
                          <LinkIcon className="w-2.5 h-2.5 text-emerald-600" /> PK, FK
                        </span>
                        <span className="font-bold text-emerald-700 dark:text-emerald-400">id_materia</span>
                      </div>
                      <span className="text-slate-400 dark:text-slate-500 text-[11px]">INT ➔ Materias</span>
                    </div>
                  </div>

                  <div className="p-3 text-xs">
                    <table className="w-full text-left font-mono text-[11px]">
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {DEMO_CURSO_MATERIA.map((cm, idx) => (
                          <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                            <td className="py-1 px-1.5 text-blue-600 dark:text-blue-400 font-bold">Curso {cm.id_curso}</td>
                            <td className="py-1 px-1.5 text-emerald-600 dark:text-emerald-400 font-bold">Materia {cm.id_materia}</td>
                            <td className="py-1 px-1.5 text-slate-400 text-right font-sans text-[10px]">
                              {cm.id_curso === 1 ? '1 A' : cm.id_curso === 2 ? '1 B' : '2 A'} ➔ {cm.id_materia === 1 ? 'Mat' : cm.id_materia === 2 ? 'Inf' : 'His'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>

      {/* Tarjeta explicativa de la relación seleccionada */}
      {showExplanationCard && activeRelation && (
        <div className="p-4 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-950 dark:text-indigo-200 flex items-start gap-3 animate-fadeIn shadow-2xs">
          <Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            {activeRelation === 'cursos-inscripciones' && (
              <>
                <h4 className="font-bold text-sm text-indigo-900 dark:text-indigo-100">
                  Relación: Cursos ➔ Inscripciones (1:N)
                </h4>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  <code className="font-mono text-indigo-700 dark:text-indigo-300 font-bold">Cursos.id_curso</code> es la <strong>Clave Primaria (PK)</strong> y <code className="font-mono text-indigo-700 dark:text-indigo-300 font-bold">Inscripciones.id_curso</code> es la <strong>Clave Foránea (FK)</strong>. Un curso puede tener muchos alumnos matriculados. El número guardado en la inscripción indica a qué división pertenece el alumno.
                </p>
              </>
            )}

            {activeRelation === 'alumnos-inscripciones' && (
              <>
                <h4 className="font-bold text-sm text-purple-900 dark:text-purple-100">
                  Relación: Alumnos ➔ Inscripciones (1:N)
                </h4>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  <code className="font-mono text-purple-700 dark:text-purple-300 font-bold">Alumnos.id_alumno</code> es la <strong>Clave Primaria (PK)</strong> y <code className="font-mono text-purple-700 dark:text-purple-300 font-bold">Inscripciones.id_alumno</code> es la <strong>Clave Foránea (FK)</strong>. Permite vincular a cada estudiante con su ficha de matrícula formal.
                </p>
              </>
            )}

            {activeRelation === 'cursos-cursomateria' && (
              <>
                <h4 className="font-bold text-sm text-blue-900 dark:text-blue-100">
                  Relación: Cursos ➔ Curso_Materia (1:N de la relación N:M)
                </h4>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  <code className="font-mono text-blue-700 dark:text-blue-300 font-bold">Cursos.id_curso</code> es la <strong>Clave Primaria (PK)</strong> y se conecta con <code className="font-mono text-blue-700 dark:text-blue-300 font-bold">Curso_Materia.id_curso</code> como <strong>Clave Foránea (FK)</strong>. Permite asociar múltiples materias a un mismo curso escolar.
                </p>
              </>
            )}

            {activeRelation === 'materias-cursomateria' && (
              <>
                <h4 className="font-bold text-sm text-emerald-900 dark:text-emerald-100">
                  Relación: Materias ➔ Curso_Materia (1:N de la relación N:M)
                </h4>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  <code className="font-mono text-emerald-700 dark:text-emerald-300 font-bold">Materias.id_materia</code> es la <strong>Clave Primaria (PK)</strong> y se conecta con <code className="font-mono text-emerald-700 dark:text-emerald-300 font-bold">Curso_Materia.id_materia</code> como <strong>Clave Foránea (FK)</strong>. Permite que una misma materia (por ejemplo Matemática) se dicte en varios cursos diferentes (1 A, 1 B, 2 A).
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
