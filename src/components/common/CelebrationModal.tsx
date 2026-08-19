import React from 'react';
import { useApp } from '../../context/AppContext';
import { Sparkles, X, Trophy } from 'lucide-react';

export const CelebrationModal: React.FC = () => {
  const { celebration, closeCelebration } = useApp();

  if (!celebration.isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in zoom-in-95 duration-200">
      <div className="relative bg-white dark:bg-slate-900 border border-indigo-200/50 dark:border-indigo-900/50 rounded-3xl w-full max-w-sm p-6 text-center shadow-2xl overflow-hidden">
        {/* Background glow */}
        <div className="absolute -top-16 -left-16 w-36 h-36 bg-indigo-500/20 dark:bg-indigo-500/30 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-36 h-36 bg-emerald-500/20 dark:bg-emerald-500/30 rounded-full blur-2xl pointer-events-none" />

        <button
          onClick={closeCelebration}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Badge / Icon Animation */}
        <div className="mx-auto w-20 h-20 rounded-3xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 text-white flex items-center justify-center text-4xl shadow-xl shadow-indigo-500/30 mb-4 animate-bounce">
          {celebration.badgeIcon || '🎉'}
        </div>

        <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
          {celebration.title}
        </h3>

        <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 font-medium">
          {celebration.subtitle}
        </p>

        <div className="mt-6 flex flex-col gap-2">
          <button
            onClick={closeCelebration}
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-semibold text-sm shadow-md shadow-indigo-500/20 active:scale-98 transition-all"
          >
            Awesome! ✨
          </button>
        </div>
      </div>
    </div>
  );
};
