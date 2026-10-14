import React, { useState } from 'react';
import { Eye, EyeOff, Copy, Check, Terminal } from 'lucide-react';

interface ChallengeItem {
  id: number;
  title: string;
  consigna: string;
  solutionSql: string;
  explanation: string;
}

const CHALLENGES: ChallengeItem[] = [
  {
    id: 1,
    title: 'Desafío 1: Mostrar todos los cursos',
    consigna: 'Escribí la consulta SQL para recuperar todas las columnas de la tabla cursos.',
    solutionSql: 'SELECT * FROM cursos;',
    explanation: 'El asterisco (*) selecciona todas las columnas de la tabla cursos.'
  },
  {
    id: 2,
    title: 'Desafío 2: Mostrar nombres y apellidos',
    consigna: 'Consultá únicamente los nombres y apellidos de todos los estudiantes de la tabla alumnos.',
    solutionSql: 'SELECT nombre, apellido\nFROM alumnos;',
    explanation: 'Especificamos los dos campos separados por una coma después de SELECT.'
  },
  {
    id: 3,
    title: 'Desafío 3: Alumnos del curso con identificador 1',
    consigna: 'Recuperá todas las columnas de los alumnos que pertenecen al curso con id_curso igual a 1.',
    solutionSql: 'SELECT *\nFROM alumnos\nWHERE id_curso = 1;',
    explanation: 'WHERE id_curso = 1 filtra los registros que cumplen la condición numérica.'
  }
];

export const PracticeChallenges: React.FC = () => {
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const toggleReveal = (id: number) => {
    setRevealed(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopy = async (id: number, sql: string) => {
    try {
      await navigator.clipboard.writeText(sql);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-4 my-2">
      {CHALLENGES.map((ch) => {
        const isShown = Boolean(revealed[ch.id]);
        const isCopied = copiedId === ch.id;

        return (
          <div key={ch.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-3 transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                  {ch.title}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                  {ch.consigna}
                </p>
              </div>

              <button
                onClick={() => toggleReveal(ch.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition self-start sm:self-center shrink-0 ${
                  isShown
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-2xs'
                }`}
              >
                {isShown ? (
                  <>
                    <EyeOff className="w-3.5 h-3.5" />
                    <span>Ocultar solución</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-3.5 h-3.5" />
                    <span>Revelar posible solución</span>
                  </>
                )}
              </button>
            </div>

            {/* Revealed Solution Box */}
            {isShown && (
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-2 animate-fadeIn text-xs">
                <div className="flex items-center justify-between text-slate-400 font-mono text-[11px]">
                  <span className="flex items-center gap-1 text-indigo-400">
                    <Terminal className="w-3.5 h-3.5" /> Solución propuesta:
                  </span>
                  <button
                    onClick={() => handleCopy(ch.id, ch.solutionSql)}
                    className="flex items-center gap-1 text-slate-300 hover:text-white transition font-sans"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copiado</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar SQL</span>
                      </>
                    )}
                  </button>
                </div>

                <pre className="text-emerald-400 font-mono text-xs leading-relaxed selection:bg-indigo-600">
                  <code>{ch.solutionSql}</code>
                </pre>

                <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                  💡 {ch.explanation}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
