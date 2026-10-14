import React, { useState } from 'react';
import { Columns, Rows, Box, Info } from 'lucide-react';
import { DEMO_ALUMNOS } from '../../data/demoSchoolDb';

export const TableAnatomyInspector: React.FC = () => {
  const [activeElement, setActiveElement] = useState<'columna' | 'fila' | 'celda' | 'encabezado'>('columna');

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4 my-2 transition-colors">
      {/* Switcher Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
          Tocá un elemento para ver qué representa:
        </span>
        <div className="flex flex-wrap gap-1.5 text-xs">
          <button
            onClick={() => setActiveElement('columna')}
            className={`px-3 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition ${
              activeElement === 'columna'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Columns className="w-3.5 h-3.5" /> Columna = Campo
          </button>
          <button
            onClick={() => setActiveElement('fila')}
            className={`px-3 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition ${
              activeElement === 'fila'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Rows className="w-3.5 h-3.5" /> Fila = Registro
          </button>
          <button
            onClick={() => setActiveElement('celda')}
            className={`px-3 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition ${
              activeElement === 'celda'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Box className="w-3.5 h-3.5" /> Celda = Valor
          </button>
        </div>
      </div>

      {/* Table alumnos */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
        <table className="w-full text-left text-sm font-sans">
          <thead className="bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 font-mono text-xs uppercase">
            <tr>
              <th className="p-3 w-12 text-center text-slate-400 dark:text-slate-500">#</th>
              <th className="p-3">id_alumno</th>
              <th className={`p-3 transition-colors ${activeElement === 'columna' ? 'bg-indigo-600 text-white font-bold' : ''}`}>
                nombre (Campo)
              </th>
              <th className="p-3">apellido</th>
              <th className="p-3">id_curso</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {DEMO_ALUMNOS.map((a, idx) => {
              const isRowActive = activeElement === 'fila' && idx === 0;

              return (
                <tr
                  key={a.id_alumno}
                  className={`transition-colors ${
                    isRowActive ? 'bg-emerald-50 dark:bg-emerald-950/40 font-semibold' : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/30'
                  }`}
                >
                  <td className={`p-3 text-center text-xs font-mono ${isRowActive ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 dark:text-slate-500'}`}>
                    {idx + 1}
                  </td>
                  <td className="p-3 font-mono text-indigo-600 dark:text-indigo-400 font-bold">{a.id_alumno}</td>
                  <td className={`p-3 font-medium transition-colors ${
                    activeElement === 'celda' && idx === 0
                      ? 'bg-amber-400 dark:bg-amber-500 text-amber-950 font-bold ring-2 ring-amber-300 rounded'
                      : activeElement === 'columna'
                      ? 'bg-indigo-50 dark:bg-indigo-950/40 font-bold text-indigo-900 dark:text-indigo-300'
                      : 'text-slate-900 dark:text-slate-100'
                  }`}>
                    {a.nombre}
                  </td>
                  <td className="p-3 text-slate-800 dark:text-slate-200">{a.apellido}</td>
                  <td className="p-3 font-mono text-slate-600 dark:text-slate-400">{a.id_curso}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Discrete Explanation Callout */}
      <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 text-xs leading-relaxed">
        {activeElement === 'columna' && (
          <p className="text-indigo-950 dark:text-indigo-200 bg-indigo-50/60 dark:bg-indigo-950/40 p-2.5 rounded-lg flex items-start gap-2">
            <Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
            <span>
              <strong>COLUMNA (Campo):</strong> Representa una característica específica que comparten todos los alumnos (por ejemplo, el campo <code>nombre</code>). El nombre de la columna identifica qué información se guarda allí.
            </span>
          </p>
        )}
        {activeElement === 'fila' && (
          <p className="text-emerald-950 dark:text-emerald-200 bg-emerald-50/60 dark:bg-emerald-950/40 p-2.5 rounded-lg flex items-start gap-2">
            <Info className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <span>
              <strong>FILA (Registro):</strong> La fila completa reúne todos los datos pertenecientes a un mismo alumno (Lucía Pérez, con id_alumno 1 y curso 1).
            </span>
          </p>
        )}
        {activeElement === 'celda' && (
          <p className="text-amber-950 dark:text-amber-200 bg-amber-50/60 dark:bg-amber-950/40 p-2.5 rounded-lg flex items-start gap-2">
            <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <span>
              <strong>CELDA (Valor o Dato):</strong> La intersección de una fila y una columna contiene un valor individual concreto (por ejemplo, <code>"Lucía"</code>).
            </span>
          </p>
        )}
      </div>
    </div>
  );
};
