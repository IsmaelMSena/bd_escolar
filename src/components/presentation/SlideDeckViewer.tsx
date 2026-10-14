import React, { useState, useEffect, useCallback } from 'react';
import { SLIDES_DATA, SlideContent } from '../../data/presentationData';
import { FourTablesDiagram } from '../common/FourTablesDiagram';
import { TableAnatomyInspector } from '../common/TableAnatomyInspector';
import { InteractiveSqlBlock } from '../common/InteractiveSqlBlock';
import { PracticeChallenges } from '../common/PracticeChallenges';
import { 
  ChevronLeft, ChevronRight, School, Shield, List, 
  CheckCircle2, Sun, Moon, AlertTriangle, RotateCcw
} from 'lucide-react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  slideNumber: number;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

// Error Boundary defensivo para evitar que un fallo imprevisto deje la pantalla en blanco
class SlideErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(`Error capturado en Diapositiva ${this.props.slideNumber}:`, error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 rounded-3xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-center space-y-4 my-4 animate-fadeIn">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/60 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-amber-900 dark:text-amber-200 text-base">
              Inconveniente en la Diapositiva {this.props.slideNumber}
            </h3>
            <p className="text-xs text-amber-800 dark:text-amber-300 mt-1 max-w-md mx-auto">
              {this.state.error?.message || 'Error inesperado de visualización.'}
            </p>
          </div>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 transition shadow-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reintentar cargar diapositiva</span>
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

interface SlideDeckViewerProps {
  onOpenTeacherPanel: () => void;
  isDark?: boolean;
  onToggleTheme?: () => void;
}

export const SlideDeckViewer: React.FC<SlideDeckViewerProps> = ({ 
  onOpenTeacherPanel,
  isDark = false,
  onToggleTheme
}) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);
  const [showToc, setShowToc] = useState<boolean>(false);

  const currentSlide: SlideContent = SLIDES_DATA[currentSlideIndex] || SLIDES_DATA[0];
  const totalSlides = SLIDES_DATA.length;

  const goToNext = useCallback(() => {
    if (currentSlideIndex < totalSlides - 1) {
      setCurrentSlideIndex(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentSlideIndex, totalSlides]);

  const goToPrev = useCallback(() => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentSlideIndex]);

  // Soporte de navegación mediante teclado (Flechas y Espacio)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
        e.preventDefault();
        goToNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        goToPrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNext, goToPrev]);

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col font-sans text-slate-900 dark:text-slate-100 select-none transition-colors duration-200">
      {/* Top Header / Presentation Bar */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          {/* Brand & Project Name */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-2xs">
              <School className="w-4 h-4" />
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-slate-100 block leading-tight">
                Mi primera base de datos escolar
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium hidden sm:inline">
                {currentSlide.blockTitle}
              </span>
            </div>
          </div>

          {/* Center / Right controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme Toggle Button (Claro / Oscuro) */}
            {onToggleTheme && (
              <button
                onClick={onToggleTheme}
                className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
              >
                {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
              </button>
            )}

            {/* Slide Index Badge & TOC Trigger */}
            <button
              onClick={() => setShowToc(!showToc)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold font-mono transition"
              title="Ver índice de diapositivas"
            >
              <List className="w-3.5 h-3.5" />
              <span>Diapositiva {currentSlide.slideNumber} de {totalSlides}</span>
            </button>

            {/* Teacher Access (Discreet lock) */}
            <button
              onClick={onOpenTeacherPanel}
              className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Acceso docente (administración y calificaciones)"
            >
              <Shield className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </button>
          </div>
        </div>
      </header>

      {/* Table of Contents Modal */}
      {showToc && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 dark:bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full max-h-[80vh] overflow-y-auto p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                Índice de la Presentación ({totalSlides} diapositivas)
              </h3>
              <button
                onClick={() => setShowToc(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1 text-xs">
              {SLIDES_DATA.map((s, idx) => (
                <button
                  key={s.slideNumber}
                  onClick={() => {
                    setCurrentSlideIndex(idx);
                    setShowToc(false);
                  }}
                  className={`w-full text-left p-2.5 rounded-xl transition flex items-center justify-between ${
                    idx === currentSlideIndex
                      ? 'bg-indigo-600 text-white font-bold'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span className="truncate pr-2">
                    {s.slideNumber}. {s.title}
                  </span>
                  <span className="text-[10px] opacity-75 shrink-0 font-mono">
                    B{s.blockNumber}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Slide Canvas */}
      <main className="flex-1 flex flex-col justify-center max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <SlideErrorBoundary key={currentSlide.slideNumber} slideNumber={currentSlide.slideNumber}>
          <div 
            key={currentSlide.slideNumber} 
            className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-10 flex flex-col justify-between space-y-6 transition-colors duration-200 animate-fadeIn"
          >
            {/* Slide Heading Area */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold text-[11px] uppercase tracking-wider font-mono">
                  {currentSlide.blockTitle}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                {currentSlide.title}
              </h1>

              {currentSlide.subtitle && (
                <p className="text-sm sm:text-base font-semibold text-indigo-700 dark:text-indigo-400">
                  {currentSlide.subtitle}
                </p>
              )}

              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
                {currentSlide.explanation}
              </p>
            </div>

            {/* Slide Core Visual Content */}
            <div className="py-2">
              {/* Diapositiva 1 & 5: 4 tablas relacionadas */}
              {currentSlide.type === 'four-tables-overview' && (
                <FourTablesDiagram 
                  key={`four-tables-${currentSlide.slideNumber}`}
                  highlightRelation={currentSlide.highlightRelation} 
                />
              )}

              {/* Diapositiva 3: Tabla alumnos destacada */}
              {currentSlide.type === 'single-table-focus' && (
                <FourTablesDiagram 
                  key={`single-focus-${currentSlide.slideNumber}`}
                  focusTableOnly={currentSlide.extraContent?.tableName || 'alumnos'} 
                />
              )}

              {/* Diapositiva 4: Anatomía de la tabla (Campo, Registro, Celda) */}
              {currentSlide.type === 'table-anatomy' && (
                <TableAnatomyInspector key={`anatomy-${currentSlide.slideNumber}`} />
              )}

              {/* Diapositiva 7, 8, 9, 10, 15, 17, 18, 19: Código SQL Interactivo */}
              {currentSlide.type === 'sql-code-interactive' && currentSlide.sqlSnippet && (
                <InteractiveSqlBlock
                  key={`sql-${currentSlide.slideNumber}`}
                  sql={currentSlide.sqlSnippet.sql}
                  parts={currentSlide.sqlSnippet.parts}
                  generalExplanation={currentSlide.sqlSnippet.generalExplanation}
                />
              )}

              {/* Diapositiva 11: Tipos de datos */}
              {currentSlide.type === 'data-types-table' && (
                <div className="space-y-4 my-2">
                  <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                    <table className="w-full text-left text-sm font-sans">
                      <thead className="bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 font-bold text-xs uppercase font-mono">
                        <tr>
                          <th className="p-3 w-32 text-indigo-700 dark:text-indigo-400">Tipo de Dato</th>
                          <th className="p-3">¿Qué información guarda?</th>
                          <th className="p-3 w-40">Ejemplo en la escuela</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs sm:text-sm">
                        <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="p-3 font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50/20 dark:bg-indigo-950/20">INTEGER</td>
                          <td className="p-3 text-slate-800 dark:text-slate-200">Números enteros (sin decimales). Ideal para identificadores.</td>
                          <td className="p-3 font-mono text-slate-600 dark:text-slate-400">1, 2, 3 (id_curso, id_alumno)</td>
                        </tr>
                        <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="p-3 font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50/20 dark:bg-emerald-950/20">TEXT</td>
                          <td className="p-3 text-slate-800 dark:text-slate-200">Cadenas de texto, palabras, nombres y descripciones.</td>
                          <td className="p-3 font-mono text-slate-600 dark:text-slate-400">'Lucía', 'Pérez', '1.º A'</td>
                        </tr>
                        <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="p-3 font-mono font-bold text-amber-600 dark:text-amber-400 bg-amber-50/20 dark:bg-amber-950/20">REAL</td>
                          <td className="p-3 text-slate-800 dark:text-slate-200">Números con coma o punto decimal.</td>
                          <td className="p-3 font-mono text-slate-600 dark:text-slate-400">8.5, 9.75 (calificaciones)</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 space-y-1">
                    <p>
                      💡 <strong>En nuestro proyecto:</strong> Los identificadores (<code className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">id_curso</code>, <code className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">id_alumno</code>, <code className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">id_materia</code>, <code className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">id_inscripcion</code>) son de tipo <code>INTEGER</code> y su rol único se define con la restricción <code>PRIMARY KEY</code>.
                    </p>
                  </div>
                </div>
              )}

              {/* Diapositiva 12: Las claves permiten establecer relaciones */}
              {currentSlide.type === 'er-relationships' && (
                <FourTablesDiagram key={`rel-${currentSlide.slideNumber}`} highlightRelation="all" />
              )}

              {/* Diapositiva 13: Explicación de JOIN */}
              {currentSlide.type === 'join-explanation' && currentSlide.sqlSnippet && (
                <div className="space-y-4 my-2">
                  <InteractiveSqlBlock
                    key={`join-sql-${currentSlide.slideNumber}`}
                    sql={currentSlide.sqlSnippet.sql}
                    parts={currentSlide.sqlSnippet.parts}
                    generalExplanation={currentSlide.sqlSnippet.generalExplanation}
                  />
                  <div className="p-4 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-950 dark:text-indigo-200 flex items-center justify-between">
                    <span>
                      🔄 <strong>El recorrido entre las 3 tablas:</strong> Comenzamos en <code>inscripciones</code> ➔ unimos <code>alumnos</code> por su <code>id_alumno</code> ➔ unimos <code>materias</code> por su <code>id_materia</code>.
                    </span>
                  </div>
                </div>
              )}

              {/* Diapositiva 16: Secuencia recomendada de INSERT INTO */}
              {currentSlide.type === 'insert-sequence' && (
                <div className="space-y-4 my-2">
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    {[
                      { step: 1, table: 'cursos', desc: 'Primero se crean los cursos para que existan sus id.' },
                      { step: 2, table: 'alumnos', desc: 'Luego los alumnos, asignando el id_curso existente.' },
                      { step: 3, table: 'materias', desc: 'Las asignaturas dictadas con sus id.' },
                      { step: 4, table: 'inscripciones', desc: 'Al final las inscripciones, vinculando los alumnos y materias.' }
                    ].map((s) => (
                      <div key={s.step} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-center space-y-1.5">
                        <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold font-mono text-xs inline-flex items-center justify-center">
                          {s.step}
                        </span>
                        <h4 className="font-bold font-mono text-slate-900 dark:text-slate-100 text-sm">{s.table}</h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">{s.desc}</p>
                      </div>
                    ))}
                  </div>

                  <div className="bg-slate-950 text-emerald-400 p-4 rounded-2xl font-mono text-xs overflow-x-auto space-y-2 border border-slate-800">
                    <div className="text-slate-400 font-sans text-[11px] font-bold">Ejemplos de inserción respetando las relaciones:</div>
                    <pre className="text-emerald-400">
{`-- 1. Primero el curso
INSERT INTO cursos VALUES (1, '1.º A');

-- 2. Después el alumno vinculado al curso 1
INSERT INTO alumnos VALUES (1, 'Lucía', 'Pérez', 1);

-- 3. La materia
INSERT INTO materias VALUES (2, 'Informática');

-- 4. Por último, la inscripción que relaciona alumno 1 con materia 2
INSERT INTO inscripciones VALUES (1, 1, 2);`}
                    </pre>
                  </div>
                </div>
              )}

              {/* Diapositiva 20: Desafíos de práctica con soluciones revelables */}
              {currentSlide.type === 'practice-challenges' && (
                <PracticeChallenges key={`challenges-${currentSlide.slideNumber}`} />
              )}

              {/* Conceptos de texto y listas breves (Diapositivas 2, 6, 14) */}
              {currentSlide.type === 'text-concept' && currentSlide.extraContent?.points && (
                <div className="space-y-3 my-4">
                  {currentSlide.extraContent.points.map((pt: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-800 dark:text-slate-200">
                      <CheckCircle2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom Slide Deck Navigation Bar */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <button
                onClick={goToPrev}
                disabled={currentSlideIndex === 0}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30 flex items-center gap-1.5 transition active:scale-95"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Anterior</span>
              </button>

              {/* Keyboard hints & Progress dots */}
              <div className="hidden sm:flex items-center gap-1">
                <span className="text-[11px] text-slate-400 dark:text-slate-500 mr-2 font-mono">
                  ← / → del teclado
                </span>
                {SLIDES_DATA.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlideIndex(idx)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      idx === currentSlideIndex
                        ? 'bg-indigo-600 dark:bg-indigo-400 w-4'
                        : 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600'
                    }`}
                    title={`Ir a diapositiva ${idx + 1}`}
                  />
                ))}
              </div>

              {currentSlideIndex < totalSlides - 1 ? (
                <button
                  onClick={goToNext}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs flex items-center gap-1.5 transition active:scale-95"
                >
                  <span>Siguiente</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <div className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>¡Presentación completada!</span>
                </div>
              )}
            </div>
          </div>
        </SlideErrorBoundary>
      </main>

      {/* Subtle Footer */}
      <footer className="py-3 text-center text-[11px] text-slate-400 dark:text-slate-500">
        Mi primera base de datos escolar • Presentación interactiva paso a paso
      </footer>
    </div>
  );
};
