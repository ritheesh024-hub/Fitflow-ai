import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Sparkles,
  X,
  Trophy,
  CheckCircle2,
  TrendingUp,
  RotateCcw,
  Bot,
  Calendar,
  Flame,
  Droplets,
  Footprints,
  Dumbbell,
  Moon,
  CheckSquare,
  ShieldCheck,
} from 'lucide-react';

interface WeeklyReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WeeklyReviewModal: React.FC<WeeklyReviewModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    currentWeeklyReview,
    isLoadingWeeklyReview,
    fetchWeeklyReview,
    setIsRegenerateModalOpen,
    setActiveTab,
  } = useApp();

  if (!isOpen) return null;

  return (
    <div
      id="weekly-review-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="weekly-review-title"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white flex items-start justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-emerald-300 border border-white/10">
              <Trophy className="w-3.5 h-3.5" />
              <span>Your Week ✨</span>
            </div>
            <h2 id="weekly-review-title" className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              AI Weekly Review & Consistency
            </h2>
            <p className="text-xs sm:text-sm text-emerald-200 font-medium">
              Transparent, science-informed reflection across your 5 core pillars
            </p>
          </div>

          <button
            id="close-weekly-review-btn"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors shrink-0 cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {isLoadingWeeklyReview ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-3">
              <div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
                Compiling your 7-day consistency data...
              </p>
            </div>
          ) : !currentWeeklyReview ? (
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border text-center space-y-3">
              <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                No weekly review data available yet.
              </p>
              <button
                id="generate-review-btn"
                onClick={() => fetchWeeklyReview(true)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
              >
                Generate Review
              </button>
            </div>
          ) : (
            <>
              {/* Score & Data Completeness Card */}
              <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-emerald-950/80 via-slate-900 to-indigo-950/80 text-white border border-emerald-800/60 shadow-md">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                      Weekly Consistency Score
                    </span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-5xl sm:text-6xl font-extrabold text-white">
                        {currentWeeklyReview.consistencyScore}
                      </span>
                      <span className="text-xl font-bold text-emerald-400">/ 100</span>
                    </div>
                  </div>

                  <div className="space-y-1 sm:text-right">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-white/10 text-emerald-300 border border-white/10">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Data Completeness: {currentWeeklyReview.dataCompleteness || 80}%</span>
                    </span>
                    <p className="text-[11px] text-slate-400">
                      Based on workouts, steps, water, habits & recovery
                    </p>
                  </div>
                </div>

                {/* Metric Breakdown Bars */}
                {currentWeeklyReview.metricBreakdown && (
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 mt-5 pt-4 border-t border-white/10">
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] text-slate-300 font-semibold">
                        <span>Workouts</span>
                        <span>{currentWeeklyReview.metricBreakdown.workoutsScore}%</span>
                      </div>
                      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-400 rounded-full"
                          style={{ width: `${currentWeeklyReview.metricBreakdown.workoutsScore}%` }}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] text-slate-300 font-semibold">
                        <span>Activity</span>
                        <span>{currentWeeklyReview.metricBreakdown.activityScore}%</span>
                      </div>
                      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-teal-400 rounded-full"
                          style={{ width: `${currentWeeklyReview.metricBreakdown.activityScore}%` }}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] text-slate-300 font-semibold">
                        <span>Hydration</span>
                        <span>{currentWeeklyReview.metricBreakdown.hydrationScore}%</span>
                      </div>
                      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-cyan-400 rounded-full"
                          style={{ width: `${currentWeeklyReview.metricBreakdown.hydrationScore}%` }}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] text-slate-300 font-semibold">
                        <span>Habits</span>
                        <span>{currentWeeklyReview.metricBreakdown.habitsScore}%</span>
                      </div>
                      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-400 rounded-full"
                          style={{ width: `${currentWeeklyReview.metricBreakdown.habitsScore}%` }}
                        />
                      </div>
                    </div>

                    <div className="space-y-1 col-span-2 sm:col-span-1">
                      <div className="flex justify-between text-[11px] text-slate-300 font-semibold">
                        <span>Recovery</span>
                        <span>{currentWeeklyReview.metricBreakdown.recoveryScore}%</span>
                      </div>
                      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-purple-400 rounded-full"
                          style={{ width: `${currentWeeklyReview.metricBreakdown.recoveryScore}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* AI Summary */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <Bot className="w-4 h-4 text-indigo-500" />
                  <span>AI Coach Weekly Summary</span>
                </div>
                <p className="text-sm sm:text-base text-slate-800 dark:text-slate-100 leading-relaxed font-medium">
                  {currentWeeklyReview.summary}
                </p>
              </div>

              {/* Strongest Habit & Area to Improve */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                    <Trophy className="w-3.5 h-3.5" />
                    <span>Strongest Habit</span>
                  </div>
                  <p className="text-sm font-bold text-emerald-950 dark:text-emerald-100">
                    {currentWeeklyReview.strongestHabit}
                  </p>
                  <p className="text-xs text-emerald-800/80 dark:text-emerald-300/80">
                    Great consistency anchor throughout your week.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>Area to Improve</span>
                  </div>
                  <p className="text-sm font-bold text-amber-950 dark:text-amber-100">
                    {currentWeeklyReview.areaToImprove}
                  </p>
                  <p className="text-xs text-amber-800/80 dark:text-amber-300/80">
                    A gentle focus target for the coming days.
                  </p>
                </div>
              </div>

              {/* What Went Well Grid */}
              {currentWeeklyReview.whatWentWell && currentWeeklyReview.whatWentWell.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    What Went Well
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {currentWeeklyReview.whatWentWell.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 flex items-start gap-3"
                      >
                        <span className="text-xl shrink-0">{item.icon || '✨'}</span>
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                            {item.title}
                          </p>
                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            id="regenerate-from-review-btn"
            onClick={() => {
              onClose();
              setIsRegenerateModalOpen(true);
            }}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-md shadow-emerald-500/20 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Regenerate Next Week's Plan</span>
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              id="ask-coach-review-btn"
              onClick={() => {
                onClose();
                setActiveTab('aicoach');
              }}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Bot className="w-3.5 h-3.5" />
              <span>Ask Coach</span>
            </button>
            <button
              id="close-review-footer-btn"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
