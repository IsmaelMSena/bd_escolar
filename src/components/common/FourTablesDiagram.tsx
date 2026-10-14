import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  DEMO_CURSOS, DEMO_ALUMNOS, DEMO_MATERIAS, DEMO_INSCRIPCIONES, 
  TABLES_META 
} from '../../data/demoSchoolDb';
import { Key, Link as LinkIcon, Info, Table, Check, Layers } from 'lucide-react';

export type RelationId = 'cursos-alumnos' | 'alumnos-inscripciones' | 'materias-inscripciones';

interface FourTablesDiagramProps {
  highlightRelation?: 'all' | 'cursos-alumnos' | 'alumnos-inscripciones' | 'materias-inscripciones' | 'none';
  selectedTableInitial?: string;
  focusTableOnly?: string;
}

interface LineCoord {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export const FourTablesDiagram: React.FC<FourTablesDiagramProps> = ({
  highlightRelation = 'all',
  focusTableOnly,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedRelation, setSelectedRelation] = useState<RelationId | null>(null);
  const [lineCoords, setLineCoords] = useState<{
    cursosAlumnos?: LineCoord;
    alumnosInscripciones?: LineCoord;
    materiasInscripciones?: LineCoord;
  }>({});

  // Determinar si una relación específica está activa
  const activeRelation: RelationId | null = 
    selectedRelation || (highlightRelation !== 'all' && highlightRelation !== 'none' ? highlightRelation : null);

  const isRelActive = (rel: RelationId) => {
    if (!activeRelation) return true; // Si no hay una específica seleccionada, todas están activas
    return activeRelation === rel;
  };

  const isRelFocused = (rel: RelationId) => {
    return activeRelation === rel;
  };

  // Cálculo reactivo de coordenadas de los puertos de conexión
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

    const pCursosPk = getPortCoord('cursos-id_curso', 'left');
    const pAlumnosFkCurso = getPortCoord('alumnos-id_curso', 'left');

    const pAlumnosPk = getPortCoord('alumnos-id_alumno', 'right');
    const pInscripcionesFkAlumno = getPortCoord('inscripciones-id_alumno', 'left');

    const pMateriasPk = getPortCoord('materias-id_materia', 'right');
    const pInscripcionesFkMateria = getPortCoord('inscripciones-id_materia', 'right');

    if (pCursosPk && pAlumnosFkCurso && pAlumnosPk && pInscripcionesFkAlumno && pMateriasPk && pInscripcionesFkMateria) {
      setLineCoords({
        cursosAlumnos: { x1: pCursosPk.x, y1: pCursosPk.y, x2: pAlumnosFkCurso.x, y2: pAlumnosFkCurso.y },
        alumnosInscripciones: { x1: pAlumnosPk.x, y1: pAlumnosPk.y, x2: pInscripcionesFkAlumno.x, y2: pInscripcionesFkAlumno.y },
        materiasInscripciones: { x1: pMateriasPk.x, y1: pMateriasPk.y, x2: pInscripcionesFkMateria.x, y2: pInscripcionesFkMateria.y },
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

  // Generador de ruta ortogonal: Gutter izquierdo (cursos -> alumnos)
  const renderLeftGutterPath = (coords: LineCoord, active: boolean, focused: boolean) => {
    const { x1, y1, x2, y2 } = coords;
    const gx = Math.min(x1, x2) - 24;
    const r = 8;
    const d = `M ${x1} ${y1} H ${gx + r} Q ${gx} ${y1} ${gx} ${y1 + r} V ${y2 - r} Q ${gx} ${y2} ${gx + r} ${y2} H ${x2}`;
    const color = '#4f46e5'; // Indigo

    return (
      <g 
        key="rel-cursos-alumnos" 
        className="cursor-pointer group" 
        onClick={() => setSelectedRelation(activeRelation === 'cursos-alumnos' ? null : 'cursos-alumnos')}
      >
        {/* Invisible hit-box expandida para facilitar hover y toque */}
        <path d={d} fill="none" stroke="transparent" strokeWidth="22" pointerEvents="stroke" />

        {/* Línea principal */}
        <path 
          d={d} 
          fill="none" 
          stroke={color} 
          strokeWidth={focused ? '3.5' : '2.5'} 
          strokeDasharray={focused ? 'none' : 'none'}
          className="transition-all duration-300"
          style={{
            opacity: active ? 1 : 0.25,
            filter: focused ? 'drop-shadow(0 0 6px rgba(99, 102, 241, 0.6))' : 'none'
          }}
        />

        {/* Puerto de Origen (PK: 1) */}
        <circle cx={x1} cy={y1} r="4" fill={color} style={{ opacity: active ? 1 : 0.25 }} />
        <rect x={gx - 14} y={y1 - 9} width="16" height="18" rx="4" fill="#4f46e5" className="shadow-xs" />
        <text x={gx - 6} y={y1 + 4} textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold" fontFamily="monospace">1</text>

        {/* Puerto de Destino (FK: N) con punta de flecha */}
        <path 
          d={`M ${x2 - 7} ${y2 - 4} L ${x2} ${y2} L ${x2 - 7} ${y2 + 4}`} 
          fill="none" 
          stroke={color} 
          strokeWidth="2.5" 
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ opacity: active ? 1 : 0.25 }} 
        />
        <rect x={gx - 14} y={y2 - 9} width="16" height="18" rx="4" fill="#4f46e5" className="shadow-xs" />
        <text x={gx - 6} y={y2 + 4} textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold" fontFamily="monospace">N</text>

        {/* Etiqueta flotante de cardinalidad en el centro vertical */}
        <g transform={`translate(${gx - 18}, ${(y1 + y2) / 2 - 10})`}>
          <rect width="24" height="20" rx="6" fill="#1e1b4b" stroke={color} strokeWidth="1" />
          <text x="12" y="14" textAnchor="middle" fill="#c7d2fe" fontSize="9" fontWeight="bold" fontFamily="monospace">1:N</text>
        </g>
      </g>
    );
  };

  // Generador de ruta ortogonal: Corredor central (alumnos -> inscripciones)
  const renderCenterCorridorPath = (coords: LineCoord, active: boolean, focused: boolean) => {
    const { x1, y1, x2, y2 } = coords;
    const midX = (x1 + x2) / 2;
    const dirY = y2 >= y1 ? 1 : -1;
    const r = Math.min(8, Math.max(2, Math.abs(y2 - y1) / 2));
    const d = `M ${x1} ${y1} H ${midX - r} Q ${midX} ${y1} ${midX} ${y1 + dirY * r} V ${y2 - dirY * r} Q ${midX} ${y2} ${midX + r} ${y2} H ${x2}`;
    const color = '#9333ea'; // Purple

    return (
      <g 
        key="rel-alumnos-inscripciones" 
        className="cursor-pointer group"
        onClick={() => setSelectedRelation(activeRelation === 'alumnos-inscripciones' ? null : 'alumnos-inscripciones')}
      >
        {/* Invisible hit-box */}
        <path d={d} fill="none" stroke="transparent" strokeWidth="22" pointerEvents="stroke" />

        {/* Línea principal */}
        <path 
          d={d} 
          fill="none" 
          stroke={color} 
          strokeWidth={focused ? '3.5' : '2.5'} 
          className="transition-all duration-300"
          style={{
            opacity: active ? 1 : 0.25,
            filter: focused ? 'drop-shadow(0 0 6px rgba(168, 85, 247, 0.6))' : 'none'
          }}
        />

        {/* Puerto de Origen (PK: 1) */}
        <circle cx={x1} cy={y1} r="4" fill={color} style={{ opacity: active ? 1 : 0.25 }} />
        <rect x={x1 + 6} y={y1 - 9} width="16" height="18" rx="4" fill="#9333ea" className="shadow-xs" />
        <text x={x1 + 14} y={y1 + 4} textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold" fontFamily="monospace">1</text>

        {/* Puerto de Destino (FK: N) con punta de flecha */}
        <path 
          d={`M ${x2 - 7} ${y2 - 4} L ${x2} ${y2} L ${x2 - 7} ${y2 + 4}`} 
          fill="none" 
          stroke={color} 
          strokeWidth="2.5" 
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ opacity: active ? 1 : 0.25 }} 
        />
        <rect x={x2 - 22} y={y2 - 9} width="16" height="18" rx="4" fill="#9333ea" className="shadow-xs" />
        <text x={x2 - 14} y={y2 + 4} textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold" fontFamily="monospace">N</text>

        {/* Etiqueta flotante de cardinalidad en el centro */}
        <g transform={`translate(${midX - 12}, ${(y1 + y2) / 2 - 10})`}>
          <rect width="24" height="20" rx="6" fill="#3b0764" stroke={color} strokeWidth="1" />
          <text x="12" y="14" textAnchor="middle" fill="#e9d5ff" fontSize="9" fontWeight="bold" fontFamily="monospace">1:N</text>
        </g>
      </g>
    );
  };

  // Generador de ruta ortogonal: Gutter derecho (materias -> inscripciones)
  const renderRightGutterPath = (coords: LineCoord, active: boolean, focused: boolean) => {
    const { x1, y1, x2, y2 } = coords;
    const gx = Math.max(x1, x2) + 24;
    const r = 8;
    const d = `M ${x1} ${y1} H ${gx - r} Q ${gx} ${y1} ${gx} ${y1 + r} V ${y2 - r} Q ${gx} ${y2} ${gx - r} ${y2} H ${x2}`;
    const color = '#059669'; // Emerald

    return (
      <g 
        key="rel-materias-inscripciones" 
        className="cursor-pointer group"
        onClick={() => setSelectedRelation(activeRelation === 'materias-inscripciones' ? null : 'materias-inscripciones')}
      >
        {/* Invisible hit-box */}
        <path d={d} fill="none" stroke="transparent" strokeWidth="22" pointerEvents="stroke" />

        {/* Línea principal */}
        <path 
          d={d} 
          fill="none" 
          stroke={color} 
          strokeWidth={focused ? '3.5' : '2.5'} 
          className="transition-all duration-300"
          style={{
            opacity: active ? 1 : 0.25,
            filter: focused ? 'drop-shadow(0 0 6px rgba(16, 185, 129, 0.6))' : 'none'
          }}
        />

        {/* Puerto de Origen (PK: 1) */}
        <circle cx={x1} cy={y1} r="4" fill={color} style={{ opacity: active ? 1 : 0.25 }} />
        <rect x={gx - 2} y={y1 - 9} width="16" height="18" rx="4" fill="#059669" className="shadow-xs" />
        <text x={gx + 6} y={y1 + 4} textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold" fontFamily="monospace">1</text>

        {/* Puerto de Destino (FK: N) con punta de flecha */}
        <path 
          d={`M ${x2 + 7} ${y2 - 4} L ${x2} ${y2} L ${x2 + 7} ${y2 + 4}`} 
          fill="none" 
          stroke={color} 
          strokeWidth="2.5" 
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ opacity: active ? 1 : 0.25 }} 
        />
        <rect x={gx - 2} y={y2 - 9} width="16" height="18" rx="4" fill="#059669" className="shadow-xs" />
        <text x={gx + 6} y={y2 + 4} textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold" fontFamily="monospace">N</text>

        {/* Etiqueta flotante de cardinalidad en el centro */}
        <g transform={`translate(${gx - 6}, ${(y1 + y2) / 2 - 10})`}>
          <rect width="24" height="20" rx="6" fill="#064e3b" stroke={color} strokeWidth="1" />
          <text x="12" y="14" textAnchor="middle" fill="#a7f3d0" fontSize="9" fontWeight="bold" fontFamily="monospace">1:N</text>
        </g>
      </g>
    );
  };

  // Helper para verificar si un campo está involucrado en la relación resaltada
  const isFieldHighlighted = (tableName: string, fieldName: string) => {
    if (!activeRelation) return false;
    if (activeRelation === 'cursos-alumnos') {
      return (tableName === 'cursos' && fieldName === 'id_curso') ||
             (tableName === 'alumnos' && fieldName === 'id_curso');
    }
    if (activeRelation === 'alumnos-inscripciones') {
      return (tableName === 'alumnos' && fieldName === 'id_alumno') ||
             (tableName === 'inscripciones' && fieldName === 'id_alumno');
    }
    if (activeRelation === 'materias-inscripciones') {
      return (tableName === 'materias' && fieldName === 'id_materia') ||
             (tableName === 'inscripciones' && fieldName === 'id_materia');
    }
    return false;
  };

  return (
    <div className="w-full space-y-4">
      {/* Visual Relationship Legend Banner & Interactive Filter */}
      {!focusTableOnly && (
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-50 dark:bg-slate-900/80 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 transition-colors shadow-2xs">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px] mr-1 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-indigo-500" />
              Líneas Relacionales:
            </span>

            {/* Botón Relación 1 */}
            <button
              onClick={() => setSelectedRelation(activeRelation === 'cursos-alumnos' ? null : 'cursos-alumnos')}
              className={`px-2.5 py-1 rounded-lg font-mono text-[11px] font-semibold transition border flex items-center gap-1 ${
                isRelFocused('cursos-alumnos')
                  ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-900/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/40'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
              <span>cursos.id_curso ➔ alumnos.id_curso (1:N)</span>
            </button>

            {/* Botón Relación 2 */}
            <button
              onClick={() => setSelectedRelation(activeRelation === 'alumnos-inscripciones' ? null : 'alumnos-inscripciones')}
              className={`px-2.5 py-1 rounded-lg font-mono text-[11px] font-semibold transition border flex items-center gap-1 ${
                isRelFocused('alumnos-inscripciones')
                  ? 'bg-purple-600 text-white border-purple-700 shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-900/60 hover:bg-purple-50 dark:hover:bg-purple-950/40'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-purple-500" />
              <span>alumnos.id_alumno ➔ inscripciones.id_alumno (1:N)</span>
            </button>

            {/* Botón Relación 3 */}
            <button
              onClick={() => setSelectedRelation(activeRelation === 'materias-inscripciones' ? null : 'materias-inscripciones')}
              className={`px-2.5 py-1 rounded-lg font-mono text-[11px] font-semibold transition border flex items-center gap-1 ${
                isRelFocused('materias-inscripciones')
                  ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>materias.id_materia ➔ inscripciones.id_materia (1:N)</span>
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

      {/* Relational Diagram Canvas Container */}
      <div className="overflow-x-auto pb-4 pt-1">
        <div 
          ref={containerRef}
          className={`relative ${
            focusTableOnly 
              ? 'max-w-md mx-auto p-4' 
              : 'min-w-[700px] max-w-4xl mx-auto px-10 py-6'
          }`}
        >
          {/* SVG Overlay con las Líneas Ortogonales Reales */}
          {!focusTableOnly && (
            <svg 
              className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible"
              style={{ minHeight: '100%' }}
            >
              {/* Relación 1: cursos.id_curso -> alumnos.id_curso (Gutter Izquierdo) */}
              {lineCoords.cursosAlumnos && renderLeftGutterPath(
                lineCoords.cursosAlumnos, 
                isRelActive('cursos-alumnos'),
                isRelFocused('cursos-alumnos')
              )}

              {/* Relación 2: alumnos.id_alumno -> inscripciones.id_alumno (Corredor Central) */}
              {lineCoords.alumnosInscripciones && renderCenterCorridorPath(
                lineCoords.alumnosInscripciones, 
                isRelActive('alumnos-inscripciones'),
                isRelFocused('alumnos-inscripciones')
              )}

              {/* Relación 3: materias.id_materia -> inscripciones.id_materia (Gutter Derecho) */}
              {lineCoords.materiasInscripciones && renderRightGutterPath(
                lineCoords.materiasInscripciones, 
                isRelActive('materias-inscripciones'),
                isRelFocused('materias-inscripciones')
              )}
            </svg>
          )}

          {/* Grid de 2 Columnas con las 4 Tablas */}
          <div className={`grid gap-x-12 gap-y-8 ${
            focusTableOnly ? 'grid-cols-1' : 'grid-cols-2'
          }`}>
            
            {/* ================= COLUMNA IZQUIERDA ================= */}
            <div className="space-y-8">
              
              {/* TABLA 1: CURSOS (Zona Superior Izquierda) */}
              {(!focusTableOnly || focusTableOnly === 'cursos') && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-indigo-200 dark:border-indigo-900/60 shadow-sm overflow-hidden transition-all">
                  {/* Encabezado Profesional */}
                  <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-4 py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Table className="w-4 h-4 text-indigo-200" />
                      <span className="font-mono font-bold text-sm tracking-wide">cursos</span>
                    </div>
                    <span className="text-[10px] font-mono bg-indigo-800/80 px-2 py-0.5 rounded-full border border-indigo-500/40">
                      3 registros
                    </span>
                  </div>

                  {/* Estructura de Campos (Columnas y Tipos) */}
                  <div className="p-3 bg-slate-50/80 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-xs font-mono space-y-1">
                    <div className="text-[10px] font-sans font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 pb-1">
                      Columnas (Estructura)
                    </div>

                    {/* id_curso (PK) */}
                    <div 
                      data-port="cursos-id_curso"
                      className={`flex items-center justify-between p-1.5 rounded-lg transition ${
                        isFieldHighlighted('cursos', 'id_curso')
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
                      <span className="text-slate-400 dark:text-slate-500 text-[11px]">INTEGER</span>
                    </div>

                    {/* nombre_curso */}
                    <div className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/50">
                      <div className="flex items-center gap-2">
                        <span className="w-8 text-center text-slate-400">•</span>
                        <span className="text-slate-700 dark:text-slate-300">nombre_curso</span>
                      </div>
                      <span className="text-slate-400 dark:text-slate-500 text-[11px]">TEXT</span>
                    </div>
                  </div>

                  {/* Registros de Ejemplo */}
                  <div className="p-3 text-xs">
                    <div className="text-[10px] font-sans font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
                      Registros de ejemplo
                    </div>
                    <table className="w-full text-left font-mono text-[11px]">
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {DEMO_CURSOS.map((c) => (
                          <tr key={c.id_curso} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                            <td className="py-1 px-2 text-indigo-600 dark:text-indigo-400 font-bold w-16">{c.id_curso}</td>
                            <td className="py-1 px-2 text-slate-700 dark:text-slate-300">{c.nombre_curso}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TABLA 2: ALUMNOS (Zona Central Izquierda) */}
              {(!focusTableOnly || focusTableOnly === 'alumnos') && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-purple-200 dark:border-purple-900/60 shadow-sm overflow-hidden transition-all">
                  {/* Encabezado */}
                  <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Table className="w-4 h-4 text-purple-200" />
                      <span className="font-mono font-bold text-sm tracking-wide">alumnos</span>
                    </div>
                    <span className="text-[10px] font-mono bg-purple-800/80 px-2 py-0.5 rounded-full border border-purple-500/40">
                      3 registros
                    </span>
                  </div>

                  {/* Estructura de Campos */}
                  <div className="p-3 bg-slate-50/80 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-xs font-mono space-y-1">
                    <div className="text-[10px] font-sans font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 pb-1">
                      Columnas (Estructura)
                    </div>

                    {/* id_alumno (PK) - Conector a inscripciones */}
                    <div 
                      data-port="alumnos-id_alumno"
                      className={`flex items-center justify-between p-1.5 rounded-lg transition ${
                        isFieldHighlighted('alumnos', 'id_alumno')
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
                      <span className="text-slate-400 dark:text-slate-500 text-[11px]">INTEGER</span>
                    </div>

                    {/* nombre */}
                    <div className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/50">
                      <div className="flex items-center gap-2">
                        <span className="w-8 text-center text-slate-400">•</span>
                        <span className="text-slate-700 dark:text-slate-300">nombre</span>
                      </div>
                      <span className="text-slate-400 dark:text-slate-500 text-[11px]">TEXT</span>
                    </div>

                    {/* apellido */}
                    <div className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/50">
                      <div className="flex items-center gap-2">
                        <span className="w-8 text-center text-slate-400">•</span>
                        <span className="text-slate-700 dark:text-slate-300">apellido</span>
                      </div>
                      <span className="text-slate-400 dark:text-slate-500 text-[11px]">TEXT</span>
                    </div>

                    {/* id_curso (FK) - Conector a cursos */}
                    <div 
                      data-port="alumnos-id_curso"
                      className={`flex items-center justify-between p-1.5 rounded-lg transition ${
                        isFieldHighlighted('alumnos', 'id_curso')
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
                      <span className="text-slate-400 dark:text-slate-500 text-[11px]">INTEGER</span>
                    </div>
                  </div>

                  {/* Registros de Ejemplo */}
                  <div className="p-3 text-xs">
                    <div className="text-[10px] font-sans font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
                      Registros de ejemplo
                    </div>
                    <table className="w-full text-left font-mono text-[11px]">
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {DEMO_ALUMNOS.map((a) => (
                          <tr key={a.id_alumno} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                            <td className="py-1 px-1.5 text-purple-600 dark:text-purple-400 font-bold w-8">{a.id_alumno}</td>
                            <td className="py-1 px-1.5 text-slate-800 dark:text-slate-200 font-sans">{a.nombre}</td>
                            <td className="py-1 px-1.5 text-slate-600 dark:text-slate-400 font-sans">{a.apellido}</td>
                            <td className="py-1 px-1.5 text-indigo-600 dark:text-indigo-400 font-bold text-center w-8 bg-indigo-50/40 dark:bg-indigo-950/20 rounded">
                              {a.id_curso}
                            </td>
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
              
              {/* TABLA 3: MATERIAS (Zona Superior Derecha) */}
              {(!focusTableOnly || focusTableOnly === 'materias') && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-emerald-200 dark:border-emerald-900/60 shadow-sm overflow-hidden transition-all">
                  {/* Encabezado */}
                  <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-4 py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Table className="w-4 h-4 text-emerald-200" />
                      <span className="font-mono font-bold text-sm tracking-wide">materias</span>
                    </div>
                    <span className="text-[10px] font-mono bg-emerald-800/80 px-2 py-0.5 rounded-full border border-emerald-500/40">
                      3 registros
                    </span>
                  </div>

                  {/* Estructura de Campos */}
                  <div className="p-3 bg-slate-50/80 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-xs font-mono space-y-1">
                    <div className="text-[10px] font-sans font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 pb-1">
                      Columnas (Estructura)
                    </div>

                    {/* id_materia (PK) */}
                    <div 
                      data-port="materias-id_materia"
                      className={`flex items-center justify-between p-1.5 rounded-lg transition ${
                        isFieldHighlighted('materias', 'id_materia')
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
                      <span className="text-slate-400 dark:text-slate-500 text-[11px]">INTEGER</span>
                    </div>

                    {/* nombre_materia */}
                    <div className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/50">
                      <div className="flex items-center gap-2">
                        <span className="w-8 text-center text-slate-400">•</span>
                        <span className="text-slate-700 dark:text-slate-300">nombre_materia</span>
                      </div>
                      <span className="text-slate-400 dark:text-slate-500 text-[11px]">TEXT</span>
                    </div>
                  </div>

                  {/* Registros de Ejemplo */}
                  <div className="p-3 text-xs">
                    <div className="text-[10px] font-sans font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
                      Registros de ejemplo
                    </div>
                    <table className="w-full text-left font-mono text-[11px]">
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {DEMO_MATERIAS.map((m) => (
                          <tr key={m.id_materia} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                            <td className="py-1 px-2 text-emerald-600 dark:text-emerald-400 font-bold w-16">{m.id_materia}</td>
                            <td className="py-1 px-2 text-slate-700 dark:text-slate-300 font-sans">{m.nombre_materia}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TABLA 4: INSCRIPCIONES (Zona Central Derecha) */}
              {(!focusTableOnly || focusTableOnly === 'inscripciones') && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-amber-200 dark:border-amber-900/60 shadow-sm overflow-hidden transition-all">
                  {/* Encabezado */}
                  <div className="bg-gradient-to-r from-amber-600 to-amber-700 text-white px-4 py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Table className="w-4 h-4 text-amber-200" />
                      <span className="font-mono font-bold text-sm tracking-wide">inscripciones</span>
                    </div>
                    <span className="text-[10px] font-mono bg-amber-800/80 px-2 py-0.5 rounded-full border border-amber-500/40">
                      4 registros
                    </span>
                  </div>

                  {/* Estructura de Campos */}
                  <div className="p-3 bg-slate-50/80 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-xs font-mono space-y-1">
                    <div className="text-[10px] font-sans font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 pb-1">
                      Columnas (Estructura)
                    </div>

                    {/* id_inscripcion (PK) */}
                    <div className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/50">
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700 flex items-center gap-1">
                          <Key className="w-2.5 h-2.5 text-amber-600" /> PK
                        </span>
                        <span className="font-bold text-slate-800 dark:text-slate-100">id_inscripcion</span>
                      </div>
                      <span className="text-slate-400 dark:text-slate-500 text-[11px]">INTEGER</span>
                    </div>

                    {/* id_alumno (FK) - Conector a alumnos */}
                    <div 
                      data-port="inscripciones-id_alumno"
                      className={`flex items-center justify-between p-1.5 rounded-lg transition ${
                        isFieldHighlighted('inscripciones', 'id_alumno')
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
                      <span className="text-slate-400 dark:text-slate-500 text-[11px]">INTEGER</span>
                    </div>

                    {/* id_materia (FK) - Conector a materias */}
                    <div 
                      data-port="inscripciones-id_materia"
                      className={`flex items-center justify-between p-1.5 rounded-lg transition ${
                        isFieldHighlighted('inscripciones', 'id_materia')
                          ? 'bg-emerald-100 dark:bg-emerald-950/90 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-400'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 flex items-center gap-1">
                          <LinkIcon className="w-2.5 h-2.5 text-emerald-600" /> FK
                        </span>
                        <span className="font-bold text-emerald-700 dark:text-emerald-400">id_materia</span>
                      </div>
                      <span className="text-slate-400 dark:text-slate-500 text-[11px]">INTEGER</span>
                    </div>
                  </div>

                  {/* Registros de Ejemplo */}
                  <div className="p-3 text-xs">
                    <div className="text-[10px] font-sans font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
                      Registros de ejemplo
                    </div>
                    <table className="w-full text-left font-mono text-[11px]">
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {DEMO_INSCRIPCIONES.map((i) => (
                          <tr key={i.id_inscripcion} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                            <td className="py-1 px-1.5 text-amber-600 dark:text-amber-400 font-bold w-8">{i.id_inscripcion}</td>
                            <td className="py-1 px-1.5 text-purple-600 dark:text-purple-400 font-bold text-center w-12 bg-purple-50/40 dark:bg-purple-950/20 rounded">
                              {i.id_alumno}
                            </td>
                            <td className="py-1 px-1.5 text-emerald-600 dark:text-emerald-400 font-bold text-center w-12 bg-emerald-50/40 dark:bg-emerald-950/20 rounded">
                              {i.id_materia}
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

      {/* Tarjeta Explicativa Interactiva de la Relación Activa */}
      {activeRelation && (
        <div className="p-4 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-950 dark:text-indigo-200 flex items-start gap-3 animate-fadeIn shadow-2xs">
          <Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            {activeRelation === 'cursos-alumnos' && (
              <>
                <h4 className="font-bold text-sm text-indigo-900 dark:text-indigo-100">
                  Relación: cursos ➔ alumnos (Uno a Muchos: 1:N)
                </h4>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  <code className="font-mono text-indigo-700 dark:text-indigo-300 font-bold">cursos.id_curso</code> es la <strong>Clave Primaria (PK)</strong> y <code className="font-mono text-indigo-700 dark:text-indigo-300 font-bold">alumnos.id_curso</code> es la <strong>Clave Foránea (FK)</strong>. Un curso puede tener muchos alumnos inscriptos. El valor numérico guardado en el alumno permite identificar a qué división escolar pertenece sin repetir el nombre del curso.
                </p>
              </>
            )}

            {activeRelation === 'alumnos-inscripciones' && (
              <>
                <h4 className="font-bold text-sm text-purple-900 dark:text-purple-100">
                  Relación: alumnos ➔ inscripciones (Uno a Muchos: 1:N)
                </h4>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  <code className="font-mono text-purple-700 dark:text-purple-300 font-bold">alumnos.id_alumno</code> es la <strong>Clave Primaria (PK)</strong> y <code className="font-mono text-purple-700 dark:text-purple-300 font-bold">inscripciones.id_alumno</code> es la <strong>Clave Foránea (FK)</strong>. Un alumno puede inscribirse a muchas materias. Cada registro en inscripciones conecta a un estudiante específico.
                </p>
              </>
            )}

            {activeRelation === 'materias-inscripciones' && (
              <>
                <h4 className="font-bold text-sm text-emerald-900 dark:text-emerald-100">
                  Relación: materias ➔ inscripciones (Uno a Muchos: 1:N)
                </h4>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  <code className="font-mono text-emerald-700 dark:text-emerald-300 font-bold">materias.id_materia</code> es la <strong>Clave Primaria (PK)</strong> y <code className="font-mono text-emerald-700 dark:text-emerald-300 font-bold">inscripciones.id_materia</code> es la <strong>Clave Foránea (FK)</strong>. Una materia puede tener muchas inscripciones (muchos alumnos cursándola).
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
