import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Sparkles,
  X,
  Bot,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  ArrowRight,
  TrendingUp,
  RotateCw,
  Droplets,
  Footprints,
  Dumbbell,
  Moon,
  CheckSquare,
} from 'lucide-react';

interface DailySummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DailySummaryModal: React.FC<DailySummaryModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    dailySummary,
    isLoadingDailySummary,
    fetchDailySummary,
    setActiveTab,
    wellnessScore,
    user,
  } = useApp();

  if (!isOpen) return null;

  return (
    <div
      id="daily-summary-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="summary-title"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white flex items-start justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-emerald-300 border border-white/10">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Daily Intelligence</span>
            </div>
            <h2 id="summary-title" className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Today's Daily Summary
            </h2>
            <p className="text-xs sm:text-sm text-indigo-200 font-medium">
              Grounded analysis of your actual tracked movement, habits, and rest
            </p>
          </div>

          <button
            id="close-daily-summary-btn"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors shrink-0 cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {isLoadingDailySummary ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-3">
              <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
                Analyzing your daily data with FitFlow AI...
              </p>
            </div>
          ) : !dailySummary?.isEnoughData ? (
            <div className="p-6 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 flex items-center justify-center mx-auto text-xl font-bold">
                📊
              </div>
              <h3 className="text-base font-bold text-amber-900 dark:text-amber-100">
                Not enough data yet.
              </h3>
              <p className="text-xs sm:text-sm text-amber-800/90 dark:text-amber-300/90 max-w-md mx-auto leading-relaxed">
                FitFlow AI analyzes your actual tracked workouts, steps, water, and habits. Start by logging today's activities to generate your full summary.
              </p>
              <div className="pt-2">
                <button
                  id="log-activity-summary-btn"
                  onClick={() => {
                    onClose();
                    setActiveTab('activity');
                  }}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                >
                  Log Activity & Habits
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Summary Narrative */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <span>AI Daily Overview</span>
                  <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold">
                    Data Completeness: {dailySummary.dataCompleteness || 80}%
                  </span>
                </div>
                <p className="text-sm sm:text-base text-slate-800 dark:text-slate-100 leading-relaxed font-medium">
                  {dailySummary.summary}
                </p>
              </div>

              {/* Positive Observations */}
              {dailySummary.positiveObservations && dailySummary.positiveObservations.length > 0 && (
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Positive Observations</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {dailySummary.positiveObservations.map((obs, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 text-xs sm:text-sm text-emerald-950 dark:text-emerald-100 font-medium flex items-start gap-2.5"
                      >
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold shrink-0">✓</span>
                        <span>{obs}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Gentle Areas to Balance (if any) */}
              {dailySummary.areasToImprove && dailySummary.areasToImprove.length > 0 && (
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                    <TrendingUp className="w-4 h-4" />
                    <span>Gentle Areas to Balance</span>
                  </div>
                  <div className="space-y-2">
                    {dailySummary.areasToImprove.map((area, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-2xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 text-xs sm:text-sm text-amber-950 dark:text-amber-100 font-medium flex items-start gap-2.5"
                      >
                        <span className="text-amber-600 dark:text-amber-400 font-bold shrink-0">•</span>
                        <span>{area}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actionable Suggestions */}
              {dailySummary.suggestions && dailySummary.suggestions.length > 0 && (
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400">
                    <Lightbulb className="w-4 h-4" />
                    <span>Practical Next Steps</span>
                  </div>
                  <div className="space-y-2">
                    {dailySummary.suggestions.map((sug, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/60 text-xs sm:text-sm text-indigo-950 dark:text-indigo-100 font-medium flex items-start gap-2.5"
                      >
                        <span className="text-indigo-600 dark:text-indigo-400 font-bold shrink-0">→</span>
                        <span>{sug}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 flex items-center justify-between gap-3">
          <button
            id="refresh-daily-summary-btn"
            onClick={() => fetchDailySummary(true)}
            disabled={isLoadingDailySummary}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isLoadingDailySummary ? 'animate-spin' : ''}`} />
            <span>Refresh Analysis</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              id="ask-coach-from-summary-btn"
              onClick={() => {
                onClose();
                setActiveTab('aicoach');
              }}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Bot className="w-3.5 h-3.5" />
              <span>Ask AI Coach</span>
            </button>
            <button
              id="close-summary-footer-btn"
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
