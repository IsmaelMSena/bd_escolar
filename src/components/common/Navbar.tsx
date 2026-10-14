import React, { useState } from 'react';
import { 
  Database, Shield, User, Award, Home, 
  Check, Menu, X, School 
} from 'lucide-react';
import { StudentSession, ViewState, ModuleProgress } from '../../types';

interface NavbarProps {
  viewState: ViewState;
  onNavigate: (view: ViewState) => void;
  currentStudent: StudentSession | null;
  onOpenAuthModal: () => void;
  modulesProgress: Record<number, ModuleProgress>;
}

export const Navbar: React.FC<NavbarProps> = ({
  viewState,
  onNavigate,
  currentStudent,
  onOpenAuthModal,
  modulesProgress
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isCurrent = (type: string, modId?: number) => {
    if (viewState.type !== type) return false;
    if (type === 'module' || type === 'quiz') {
      return (viewState as any).moduleId === modId;
    }
    return true;
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div 
            onClick={() => onNavigate({ type: 'home' })}
            className="flex items-center gap-2.5 cursor-pointer group shrink-0"
          >
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition">
              <School className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-sm sm:text-base tracking-tight text-slate-900 block leading-tight">
                MI PRIMERA BASE DE DATOS
              </span>
              <span className="text-[10px] text-indigo-600 font-semibold uppercase tracking-wider">
                Proyecto Escolar
              </span>
            </div>
          </div>

          {/* Desktop Navigation: Home + 5 Classes + Diploma */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => onNavigate({ type: 'home' })}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                viewState.type === 'home'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>Proyecto Final</span>
            </button>

            {[1, 2, 3, 4, 5].map((m) => {
              const active = isCurrent('module', m) || isCurrent('quiz', m);
              const progress = modulesProgress[m];
              const isPassed = progress?.quizPassed;

              return (
                <button
                  key={m}
                  onClick={() => onNavigate({ type: 'module', moduleId: m })}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                    active
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : isPassed
                      ? 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {isPassed && <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />}
                  <span>Clase {m}</span>
                </button>
              );
            })}

            <button
              onClick={() => onNavigate({ type: 'diploma' })}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                viewState.type === 'diploma'
                  ? 'bg-amber-500 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Award className="w-3.5 h-3.5 text-amber-500" />
              <span>Diploma</span>
            </button>
          </nav>

          {/* Right Toolbar: Student Badge & Teacher Access */}
          <div className="flex items-center gap-2">
            {/* Student session button */}
            <button
              onClick={onOpenAuthModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition border border-slate-200/80"
              title="Cambiar perfil o código de aula"
            >
              {currentStudent ? (
                <>
                  <span className="text-sm">{currentStudent.avatar}</span>
                  <span className="max-w-[90px] truncate hidden sm:inline">{currentStudent.name}</span>
                </>
              ) : (
                <>
                  <User className="w-3.5 h-3.5 text-slate-500" />
                  <span className="hidden sm:inline">Alumno</span>
                </>
              )}
            </button>

            {/* Teacher button */}
            <button
              onClick={() => onNavigate({ type: 'teacher' })}
              className={`p-2 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                viewState.type === 'teacher'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-500 hover:text-indigo-600 hover:bg-indigo-50'
              }`}
              title="Panel Privado Docente"
            >
              <Shield className="w-4 h-4 text-purple-600" />
              <span className="hidden sm:inline text-slate-700 text-xs">Docente</span>
            </button>

            {/* Mobile toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-4 space-y-1 text-xs">
          <button
            onClick={() => {
              onNavigate({ type: 'home' });
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-xl font-bold text-slate-700 hover:bg-slate-100"
          >
            Proyecto Final
          </button>
          {[1, 2, 3, 4, 5].map((m) => (
            <button
              key={m}
              onClick={() => {
                onNavigate({ type: 'module', moduleId: m });
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-xl font-semibold text-slate-700 hover:bg-slate-100 flex items-center justify-between"
            >
              <span>Clase {m}</span>
              {modulesProgress[m]?.quizPassed && (
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                  Aprobado
                </span>
              )}
            </button>
          ))}
          <button
            onClick={() => {
              onNavigate({ type: 'diploma' });
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-xl font-bold text-amber-600 hover:bg-amber-50"
          >
            Diploma de Logro
          </button>
        </div>
      )}
    </header>
  );
};
