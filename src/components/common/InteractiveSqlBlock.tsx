import React, { useState, useEffect } from 'react';
import { Copy, Check, Terminal, Info } from 'lucide-react';

export interface SqlTokenPart {
  token: string;
  explanation: string;
}

interface InteractiveSqlBlockProps {
  sql: string;
  parts?: SqlTokenPart[];
  generalExplanation?: string;
  highlightedLine?: string;
}

export const InteractiveSqlBlock: React.FC<InteractiveSqlBlockProps> = ({
  sql,
  parts = [],
  generalExplanation,
  highlightedLine
}) => {
  const [copied, setCopied] = useState(false);
  const [selectedPartIndex, setSelectedPartIndex] = useState<number | null>(null);

  // Reiniciar selección y estado de copia de forma segura cuando cambia la sentencia o las partes
  useEffect(() => {
    setSelectedPartIndex(null);
    setCopied(false);
  }, [sql, parts]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(sql);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Error al copiar:', e);
    }
  };

  // Verificación defensiva de límites: previene TypeError si el índice guardado no existe en la diapositiva actual
  const selectedPart =
    selectedPartIndex !== null && selectedPartIndex >= 0 && selectedPartIndex < parts.length
      ? parts[selectedPartIndex]
      : null;

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs my-4 space-y-0 transition-colors">
      {/* Top Bar */}
      <div className="bg-slate-900 dark:bg-slate-950 text-slate-300 px-4 py-2.5 flex items-center justify-between text-xs font-mono border-b border-slate-800">
        <span className="flex items-center gap-2 text-indigo-400 font-semibold">
          <Terminal className="w-4 h-4" />
          <span>Ejemplo de Instrucción SQL</span>
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition font-sans text-xs font-semibold active:scale-95"
          title="Copiar código al portapapeles"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">¡Copiado!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copiar código</span>
            </>
          )}
        </button>
      </div>

      {/* Code Block */}
      <pre className="p-4 sm:p-5 bg-slate-950 text-emerald-400 font-mono text-xs sm:text-sm overflow-x-auto leading-relaxed selection:bg-indigo-600">
        <code>{sql.trim()}</code>
      </pre>

      {/* Clickable Parts Inspector */}
      {parts.length > 0 && (
        <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="font-bold uppercase tracking-wider text-[11px]">
              Hacé clic en cada parte para comprender qué significa:
            </span>
            <span className="text-[11px] italic">Seleccioná un elemento</span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {parts.map((p, idx) => {
              const isSelected = selectedPartIndex === idx;

              return (
                <button
                  key={idx}
                  onClick={() => setSelectedPartIndex(isSelected ? null : idx)}
                  className={`px-2.5 py-1 rounded-lg font-mono text-xs font-semibold transition border ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-700 dark:border-indigo-500 shadow-xs'
                      : 'bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {p.token}
                </button>
              );
            })}
          </div>

          {/* Explanation Callout for Selected Part */}
          {selectedPart && (
            <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-950 dark:text-indigo-200 flex items-start gap-2.5 animate-fadeIn">
              <Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <strong className="font-mono text-indigo-800 dark:text-indigo-300">
                  {selectedPart.token}:{' '}
                </strong>
                <span>{selectedPart.explanation}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* General Explanation */}
      {generalExplanation && (
        <div className="p-3.5 bg-slate-50 dark:bg-slate-900/40 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
          <strong className="text-slate-800 dark:text-slate-200">Nota clave: </strong>{generalExplanation}
        </div>
      )}
    </div>
  );
};
