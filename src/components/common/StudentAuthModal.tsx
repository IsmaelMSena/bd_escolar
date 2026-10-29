import React, { useState } from 'react';
import { StudentSession } from '../../types';
import { saveCurrentStudent, generateUUID } from '../../services/storageService';
import { User, GraduationCap, X } from 'lucide-react';

interface StudentAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStudent: StudentSession | null;
  onStudentSaved: (student: StudentSession) => void;
}

const AVATARS = ['🎓', '🦁', '🦊', '🐼', '🐬', '🚀', '🦉', '🐯', '⚡', '🌟', '💻', '🧪'];

export const StudentAuthModal: React.FC<StudentAuthModalProps> = ({
  isOpen,
  onClose,
  currentStudent,
  onStudentSaved
}) => {
  const [name, setName] = useState(currentStudent?.name || '');
  const [classroomCode, setClassroomCode] = useState(currentStudent?.classroomCode || '3A-2025');
  const [selectedAvatar, setSelectedAvatar] = useState(currentStudent?.avatar || '🎓');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Por favor, ingresá tu nombre o alias para guardar tus calificaciones.');
      return;
    }
    if (!classroomCode.trim()) {
      setError('Por favor, ingresá el código de tu curso o aula (ej: 3A-2025).');
      return;
    }

    const session: StudentSession = {
      id: currentStudent?.id || generateUUID(),
      name: name.trim(),
      classroomCode: classroomCode.trim().toUpperCase(),
      avatar: selectedAvatar,
      createdAt: currentStudent?.createdAt || new Date().toISOString(),
      lastActiveAt: new Date().toISOString()
    };

    await saveCurrentStudent(session);
    onStudentSaved(session);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 animate-scaleUp space-y-6 transition-colors">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Identificación Escolar</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Sin contraseñas complejas ni correo electrónico</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Avatar selector */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">Elegí tu Avatar:</label>
            <div className="grid grid-cols-6 gap-2">
              {AVATARS.map((av) => (
                <button
                  key={av}
                  type="button"
                  onClick={() => setSelectedAvatar(av)}
                  className={`text-2xl p-2 rounded-xl transition ${
                    selectedAvatar === av
                      ? 'bg-indigo-100 dark:bg-indigo-950 ring-2 ring-indigo-500 scale-105'
                      : 'bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  {av}
                </button>
              ))}
            </div>
          </div>

          {/* Name input */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Tu Nombre y Apellido:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              placeholder="Ej: Lucía Pérez"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              autoFocus
            />
          </div>

          {/* Classroom code input */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Curso / División:</label>
            <input
              type="text"
              value={classroomCode}
              onChange={(e) => {
                setClassroomCode(e.target.value);
                setError('');
              }}
              placeholder="Ej: 4.° A o 3.° 2.ª"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm uppercase focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
            />
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              El docente utiliza este código para agrupar los resultados de tu división.
            </p>
          </div>

          {error && (
            <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold">{error}</p>
          )}

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow transition cursor-pointer"
            >
              GUARDAR MI PERFIL
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
