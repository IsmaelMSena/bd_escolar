import React, { useState, useEffect, useCallback } from 'react';
import { LEARNING_UNITS, LearningUnit } from '../../data/unitsData';
import { FiveTablesDiagram } from '../common/FiveTablesDiagram';
import { TableAnatomyInspector } from '../common/TableAnatomyInspector';
import { InteractiveSqlBlock } from '../common/InteractiveSqlBlock';
import { SqlInteractivePractice } from '../common/SqlInteractivePractice';
import { ConceptCheckWidget } from '../common/ConceptCheckWidget';
import { getAllUnitsProgress, saveUnitProgress } from '../../services/storageService';
import { UnitProgress } from '../../types';
import { 
  ChevronLeft, ChevronRight, School, Shield, List, 
  CheckCircle2, Sun, Moon, AlertTriangle, RotateCcw, 
  Sparkles, BookOpen, Layers, Key, Share2, Code2, 
  Database, PlusCircle, Search, GitMerge, BarChart3,
  Check, X, Award
} from 'lucide-react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  unitNumber: number;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class UnitErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(`Error en Unidad ${this.props.unitNumber}:`, error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 rounded-3xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-center space-y-4 my-6 animate-fadeIn">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/60 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-amber-900 dark:text-amber-200 text-base">
              Inconveniente en la Unidad {this.props.unitNumber}
            </h3>
            <p className="text-xs text-amber-800 dark:text-amber-300 mt-1 max-w-md mx-auto">
              {this.state.error?.message || 'Error inesperado de renderizado.'}
            </p>
          </div>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 transition shadow-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reintentar cargar unidad</span>
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

interface UnitViewerProps {
  onOpenTeacherPanel: () => void;
  isDark?: boolean;
  onToggleTheme?: () => void;
}

export const UnitViewer: React.FC<UnitViewerProps> = ({
  onOpenTeacherPanel,
  isDark = false,
  onToggleTheme
}) => {
  const [currentUnitIndex, setCurrentUnitIndex] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('bd_escolar_last_unit');
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed) && parsed >= 0 && parsed < LEARNING_UNITS.length) {
          return parsed;
        }
      }
    } catch {
      // Fallback
    }
    return 0;
  });

  const [showToc, setShowToc] = useState<boolean>(false);
  const [unitsProgress, setUnitsProgress] = useState<Record<number, UnitProgress>>({});

  const totalUnits = LEARNING_UNITS.length;
  const currentUnit: LearningUnit = LEARNING_UNITS[currentUnitIndex] || LEARNING_UNITS[0];

  // Cargar progreso guardado al montar
  useEffect(() => {
    const loaded = getAllUnitsProgress();
    setUnitsProgress(loaded);
  }, []);

  // Registrar visita a la unidad actual
  useEffect(() => {
    if (currentUnit) {
      saveUnitProgress({ unitId: currentUnit.id, visited: true });
      try {
        localStorage.setItem('bd_escolar_last_unit', String(currentUnitIndex));
      } catch (e) {
        console.error(e);
      }
      setUnitsProgress(getAllUnitsProgress());
    }
  }, [currentUnitIndex, currentUnit]);

  const goToNext = useCallback(() => {
    if (currentUnitIndex < totalUnits - 1) {
      setCurrentUnitIndex(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentUnitIndex, totalUnits]);

  const goToPrev = useCallback(() => {
    if (currentUnitIndex > 0) {
      setCurrentUnitIndex(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentUnitIndex]);

  // Navegación con teclado (Flecha Izquierda / Derecha)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'ArrowRight') {
        goToNext();
      } else if (e.key === 'ArrowLeft') {
        goToPrev();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNext, goToPrev]);

  // Manejo de actividad completada
  const handleActivityCompleted = () => {
    saveUnitProgress({ unitId: currentUnit.id, activityCompleted: true });
    setUnitsProgress(getAllUnitsProgress());
  };

  // Manejo de cuestionario completado
  const handleQuizCompleted = (score: number) => {
    saveUnitProgress({ unitId: currentUnit.id, quizScore: score });
    setUnitsProgress(getAllUnitsProgress());
  };

  // Icono contextual por unidad
  const getUnitIcon = (unitNumber: number) => {
    switch (unitNumber) {
      case 1: return <BookOpen className="w-4 h-4" />;
      case 2: return <Layers className="w-4 h-4" />;
      case 3: return <Key className="w-4 h-4" />;
      case 4: return <Share2 className="w-4 h-4" />;
      case 5: return <Code2 className="w-4 h-4" />;
      case 6: return <Database className="w-4 h-4" />;
      case 7: return <PlusCircle className="w-4 h-4" />;
      case 8: return <Search className="w-4 h-4" />;
      case 9: return <GitMerge className="w-4 h-4" />;
      case 10: return <BarChart3 className="w-4 h-4" />;
      default: return <BookOpen className="w-4 h-4" />;
    }
  };

  const progressPercentage = Math.round(((currentUnitIndex + 1) / totalUnits) * 100);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors flex flex-col">
      {/* =====================================================================
          1. HEADER FIJO SUPERIOR
          ===================================================================== */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors shadow-2xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          {/* Logo y título */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <School className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-600 dark:text-indigo-400 block leading-tight">
                Escuela Secundaria · Informática
              </span>
              <h1 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white leading-tight">
                Mi Primera Base de Datos Escolar
              </h1>
            </div>
          </div>

          {/* Acciones superiores */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Índice de Unidades */}
            <button
              onClick={() => setShowToc(prev => !prev)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition text-xs font-semibold"
              title="Abrir índice completo de unidades"
            >
              <List className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span className="hidden md:inline">Índice (10 Unidades)</span>
            </button>

            {/* Alternar Tema Claro / Oscuro */}
            {onToggleTheme && (
              <button
                onClick={onToggleTheme}
                className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition flex items-center justify-center"
                title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
              >
                {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
              </button>
            )}

            {/* Botón Docente discreto */}
            <button
              onClick={onOpenTeacherPanel}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition text-xs font-semibold"
              title="Panel del Docente (requiere clave)"
            >
              <Shield className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span className="hidden sm:inline">Docente</span>
            </button>
          </div>
        </div>

        {/* Stepper de 10 Unidades horizontal */}
        <div className="bg-slate-100/80 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800/80 px-2 sm:px-6 py-2 overflow-x-auto scrollbar-none">
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-1 sm:gap-2 min-w-max">
            {LEARNING_UNITS.map((unit, idx) => {
              const isCurrent = idx === currentUnitIndex;
              const p = unitsProgress[unit.id];
              const isCompleted = p?.activityCompleted || (p?.quizScore !== undefined && p.quizScore >= 60);

              return (
                <button
                  key={unit.id}
                  onClick={() => {
                    setCurrentUnitIndex(idx);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium transition shrink-0 ${
                    isCurrent
                      ? 'bg-indigo-600 text-white font-bold shadow-xs'
                      : isCompleted
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                  }`}
                  title={`Unidad ${unit.number}: ${unit.title}`}
                >
                  <span className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0 bg-black/10 dark:bg-white/10">
                    {isCompleted && !isCurrent ? <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> : unit.number}
                  </span>
                  <span className="text-[11px] whitespace-nowrap hidden lg:inline">
                    {unit.shortTitle}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Barra de progreso global del curso */}
        <div className="w-full bg-slate-200 dark:bg-slate-800 h-1">
          <div
            className="bg-indigo-600 h-1 transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </header>

      {/* =====================================================================
          2. CAJÓN LATERAL DE ÍNDICE (TOC)
          ===================================================================== */}
      {showToc && (
        <div className="fixed inset-0 z-50 flex justify-end animate-fadeIn">
          {/* Backdrop */}
          <div
            onClick={() => setShowToc(false)}
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs"
          />

          {/* Drawer content */}
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl p-6 overflow-y-auto z-10 flex flex-col justify-between border-l border-slate-200 dark:border-slate-800">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <List className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100">
                    Plan Curricular: 10 Unidades
                  </h3>
                </div>
                <button
                  onClick={() => setShowToc(false)}
                  className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400">
                Seleccioná cualquier unidad para navegar directamente:
              </p>

              <div className="space-y-2">
                {LEARNING_UNITS.map((unit, idx) => {
                  const isCurrent = idx === currentUnitIndex;
                  const p = unitsProgress[unit.id];
                  const isCompleted = p?.activityCompleted;

                  return (
                    <button
                      key={unit.id}
                      onClick={() => {
                        setCurrentUnitIndex(idx);
                        setShowToc(false);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className={`w-full text-left p-3 rounded-2xl border transition flex items-start gap-3 ${
                        isCurrent
                          ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-950 dark:text-indigo-200 font-semibold shadow-xs'
                          : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                          isCurrent
                            ? 'bg-indigo-600 text-white'
                            : isCompleted
                            ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {isCompleted ? <Check className="w-4 h-4" /> : unit.number}
                      </div>

                      <div className="space-y-0.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400">
                            {unit.badge}
                          </span>
                        </div>
                        <h4 className="text-xs sm:text-sm font-bold truncate">
                          {unit.title}
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                          {unit.shortTitle}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
              <span className="text-xs text-slate-400">
                Mi Primera Base de Datos Escolar · 2026
              </span>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          3. CONTENIDO PRINCIPAL DE LA UNIDAD
          ===================================================================== */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-8 space-y-8">
        <UnitErrorBoundary unitNumber={currentUnit.number}>
          {/* Banner de Unidad */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-4 transition-colors">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 flex items-center gap-1.5 uppercase tracking-wider">
                  {getUnitIcon(currentUnit.number)}
                  Unidad {currentUnit.number} de {totalUnits}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {currentUnit.badge}
                </span>
              </div>

              <span className="text-xs text-slate-400 font-mono">
                {progressPercentage}% completado
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {currentUnit.title}
            </h2>

            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
              {currentUnit.summary}
            </p>

            <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 text-xs sm:text-sm text-indigo-950 dark:text-indigo-200 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Propósito pedagógico de la clase:</span>
                <span>{currentUnit.intro}</span>
              </div>
            </div>
          </div>

          {/* Secciones teóricas */}
          <div className="space-y-6">
            {currentUnit.theorySections.map((sec, secIdx) => (
              <section
                key={secIdx}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-4 transition-colors"
              >
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-600" />
                  {sec.heading}
                </h3>

                <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
                  {sec.content}
                </p>

                {/* Viñetas si existen */}
                {sec.bulletPoints && sec.bulletPoints.length > 0 && (
                  <ul className="space-y-2.5 pt-1">
                    {sec.bulletPoints.map((bp, bpIdx) => (
                      <li key={bpIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        <span>{bp}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {/* Callouts (tip, warning, info, key) */}
                {sec.callout && (
                  <div
                    className={`p-4 rounded-2xl border text-xs sm:text-sm space-y-1 mt-4 ${
                      sec.callout.type === 'key'
                        ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800 text-indigo-950 dark:text-indigo-200'
                        : sec.callout.type === 'warning'
                        ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-950 dark:text-amber-200'
                        : sec.callout.type === 'tip'
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200'
                        : 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-blue-950 dark:text-blue-200'
                    }`}
                  >
                    <span className="font-bold flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                      {sec.callout.type === 'key' && <Key className="w-3.5 h-3.5" />}
                      {sec.callout.type === 'warning' && <AlertTriangle className="w-3.5 h-3.5" />}
                      {sec.callout.type === 'tip' && <Sparkles className="w-3.5 h-3.5" />}
                      {sec.callout.title}
                    </span>
                    <p className="leading-relaxed">{sec.callout.text}</p>
                  </div>
                )}
              </section>
            ))}
          </div>

          {/* =================================================================
              INTEGRACIÓN DE COMPONENTES VISUALES SEGÚN LA UNIDAD
              ================================================================= */}
          {/* Unidad 1: Anatomía de una Tabla */}
          {currentUnit.number === 1 && (
            <div className="space-y-3">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 px-1 flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                Explorador Interactivo: Partes de una Tabla Escolar
              </h3>
              <TableAnatomyInspector />
            </div>
          )}

          {/* Unidad 2: Presentación completa de las 5 tablas escolares */}
          {currentUnit.number === 2 && (
            <div className="space-y-3">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 px-1 flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                Diagrama de las 5 Tablas Escolares
              </h3>
              <FiveTablesDiagram highlightRelation="all" showExplanationCard={true} />
            </div>
          )}

          {/* Unidad 3: Claves Primarias y Foráneas */}
          {currentUnit.number === 3 && (
            <div className="space-y-3">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 px-1 flex items-center gap-2">
                <Key className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                Visualización de Claves Primarias (PK) y Foráneas (FK)
              </h3>
              <FiveTablesDiagram highlightRelation="all" showExplanationCard={true} />
            </div>
          )}

          {/* Unidad 4: Relaciones 1:N y N:M con Curso_Materia */}
          {currentUnit.number === 4 && (
            <div className="space-y-3">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 px-1 flex items-center gap-2">
                <Share2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                Relaciones 1:N y Muchos a Muchos (N:M)
              </h3>
              <FiveTablesDiagram highlightRelation="all" showExplanationCard={true} />
            </div>
          )}

          {/* Unidad 9: Diagrama enfocado en uniones INNER JOIN */}
          {currentUnit.number === 9 && (
            <div className="space-y-3">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 px-1 flex items-center gap-2">
                <GitMerge className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                Ruta de unión entre Alumnos, Inscripciones y Cursos
              </h3>
              <FiveTablesDiagram highlightRelation="alumnos-inscripciones" showExplanationCard={false} />
            </div>
          )}

          {/* Unidad 10: Diagrama enfocado en LEFT JOIN */}
          {currentUnit.number === 10 && (
            <div className="space-y-3">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 px-1 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                Unión externa Cursos LEFT JOIN Inscripciones
              </h3>
              <FiveTablesDiagram highlightRelation="cursos-inscripciones" showExplanationCard={false} />
            </div>
          )}

          {/* =================================================================
              EJEMPLOS SQL CON DESGLOSE DE TOKENS
              ================================================================= */}
          {currentUnit.sqlExamples && currentUnit.sqlExamples.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 px-1 flex items-center gap-2">
                <Code2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                Instrucciones SQL de la Unidad
              </h3>
              {currentUnit.sqlExamples.map((eg, egIdx) => (
                <div key={egIdx} className="space-y-2">
                  <div className="px-1">
                    <h4 className="font-bold text-sm sm:text-base text-slate-800 dark:text-slate-200">
                      {eg.title}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {eg.description}
                    </p>
                  </div>

                  <InteractiveSqlBlock
                    sql={eg.sql}
                    parts={eg.partsExplanation?.map(p => ({ token: p.token, explanation: p.desc }))}
                    generalExplanation={eg.description}
                  />

                  {/* Tabla esperada del ejemplo si existe */}
                  {eg.expectedTableResult && (
                    <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                      <span className="font-bold text-slate-700 dark:text-slate-300 block text-[11px] uppercase tracking-wider">
                        Resultado devuelto por MySQL:
                      </span>
                      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                        <table className="w-full text-left text-[11px]">
                          <thead className="bg-slate-100 dark:bg-slate-800 font-mono text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                            <tr>
                              {eg.expectedTableResult.headers.map((h) => (
                                <th key={h} className="py-1.5 px-3">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                            {eg.expectedTableResult.rows.map((r, rIdx) => (
                              <tr key={rIdx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                {r.map((cell, cIdx) => (
                                  <td key={cIdx} className="py-1.5 px-3">{String(cell)}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* =================================================================
              PRÁCTICA INTERACTIVA
              ================================================================= */}
          <SqlInteractivePractice
            activity={currentUnit.activity}
            unitNumber={currentUnit.number}
            onCompleted={handleActivityCompleted}
          />

          {/* =================================================================
              COMPROBACIÓN DE CONCEPTOS (CUESTIONARIO)
              ================================================================= */}
          <ConceptCheckWidget
            questions={currentUnit.checkQuestions}
            unitNumber={currentUnit.number}
            onCompleted={handleQuizCompleted}
          />

          {/* =================================================================
              SÍNTESIS DE LA CLASE
              ================================================================= */}
          <div className="bg-gradient-to-br from-indigo-50 to-white dark:from-slate-900 dark:to-slate-950 border border-indigo-100 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400">
              <Award className="w-5 h-5" />
              <h3 className="font-extrabold text-base sm:text-lg">
                Síntesis de la Unidad {currentUnit.number}
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentUnit.synthesis.keyIdeas.map((idea, iIdx) => (
                <div
                  key={iIdx}
                  className="p-3.5 rounded-2xl bg-white dark:bg-slate-850 border border-indigo-100 dark:border-slate-800 text-xs sm:text-sm text-slate-800 dark:text-slate-200 flex items-start gap-2.5"
                >
                  <span className="w-5 h-5 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    {iIdx + 1}
                  </span>
                  <span className="leading-relaxed">{idea}</span>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-2xl bg-indigo-600 text-white text-xs sm:text-sm font-semibold flex items-center gap-3 shadow-md shadow-indigo-600/20">
              <Sparkles className="w-5 h-5 shrink-0" />
              <span>Conclusión clave: {currentUnit.synthesis.takeaway}</span>
            </div>
          </div>
        </UnitErrorBoundary>
      </main>

      {/* =====================================================================
          4. FOOTER DE NAVEGACIÓN CONTINUA ENTRE UNIDADES
          ===================================================================== */}
      <footer className="sticky bottom-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 p-4 transition-colors">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          {/* Botón Unidad Anterior */}
          <button
            onClick={goToPrev}
            disabled={currentUnitIndex === 0}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition ${
              currentUnitIndex === 0
                ? 'opacity-40 cursor-not-allowed bg-slate-100 dark:bg-slate-800 text-slate-400'
                : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 active:scale-95'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Unidad Anterior</span>
          </button>

          {/* Indicador central */}
          <div className="text-center hidden sm:block">
            <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">
              {currentUnit.number} de {totalUnits} — {currentUnit.shortTitle}
            </span>
            <span className="text-[11px] text-slate-500">
              Usá las flechas del teclado ← → para avanzar
            </span>
          </div>

          {/* Botón Siguiente Unidad */}
          <button
            onClick={goToNext}
            disabled={currentUnitIndex === totalUnits - 1}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition shadow-xs ${
              currentUnitIndex === totalUnits - 1
                ? 'bg-emerald-600 text-white cursor-default'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white active:scale-95 shadow-indigo-600/20'
            }`}
          >
            <span>{currentUnitIndex === totalUnits - 1 ? '¡Módulo Finalizado!' : 'Siguiente Unidad'}</span>
            {currentUnitIndex < totalUnits - 1 && <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
      </footer>
    </div>
  );
};
