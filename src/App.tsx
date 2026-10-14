import React, { useState, useEffect } from 'react';
import { SlideDeckViewer } from './components/presentation/SlideDeckViewer';
import { TeacherDashboard } from './components/teacher/TeacherDashboard';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'presentation' | 'teacher'>('presentation');
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('theme');
      if (saved) return saved === 'dark';
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      if (isDark) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
    } catch (e) {
      console.error('Error sincronizando tema:', e);
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(prev => !prev);

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-indigo-600 selection:text-white font-sans antialiased transition-colors">
      {currentView === 'presentation' ? (
        <SlideDeckViewer 
          onOpenTeacherPanel={() => setCurrentView('teacher')} 
          isDark={isDark}
          onToggleTheme={toggleTheme}
        />
      ) : (
        <div className="py-6 px-4 max-w-5xl mx-auto">
          <TeacherDashboard onBackToApp={() => setCurrentView('presentation')} />
        </div>
      )}
    </div>
  );
};
