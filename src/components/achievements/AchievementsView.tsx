import React from 'react';
import { useApp } from '../../context/AppContext';
import { Trophy, Award, Sparkles, CheckCircle2, Lock } from 'lucide-react';

export const AchievementsView: React.FC = () => {
  const { achievements, unlockAchievement, triggerConfetti } = useApp();

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const totalCount = achievements.length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. HEADER SUMMARY */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-amber-500/15 via-indigo-500/10 to-emerald-500/10 border border-amber-200/60 dark:border-amber-900/40 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60 mb-2">
            <Trophy className="w-3.5 h-3.5" />
            <span>Badges & Milestones</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            Your Achievements
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {unlockedCount} of {totalCount} badges unlocked. Celebrate every milestone!
          </p>
        </div>

        <button
          onClick={triggerConfetti}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-bold text-xs shadow-md shadow-amber-500/20 flex items-center justify-center gap-1.5 self-start sm:self-center transition-all active:scale-95"
        >
          <Sparkles className="w-4 h-4" />
          <span>Celebrate Progress</span>
        </button>
      </div>

      {/* 2. ACHIEVEMENTS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {achievements.map((item) => (
          <div
            key={item.id}
            onClick={() => {
              if (!item.unlocked) {
                unlockAchievement(item.badgeKey);
              }
            }}
            className={`p-5 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between ${
              item.unlocked
                ? 'bg-white dark:bg-slate-900 border-amber-200 dark:border-amber-900/60 shadow-xs hover:shadow-md'
                : 'bg-slate-50/70 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800/60 opacity-80 hover:opacity-100'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl ${
                    item.unlocked
                      ? 'bg-amber-100 dark:bg-amber-950/70 text-amber-600 border border-amber-200 dark:border-amber-800'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                  }`}
                >
                  {item.icon}
                </div>

                {item.unlocked ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Unlocked
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Lock className="w-3 h-3" /> In Progress
                  </span>
                )}
              </div>

              <h3 className="text-base font-bold text-slate-900 dark:text-white">{item.title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                {item.description}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60">
              <div className="flex justify-between text-[11px] font-semibold text-slate-400 mb-1">
                <span>Progress</span>
                <span>{item.progress}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    item.unlocked ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                  style={{ width: `${item.progress}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
