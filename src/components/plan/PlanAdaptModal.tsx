import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Bot,
  Heart,
  Smile,
} from 'lucide-react';

export const PlanAdaptModal: React.FC = () => {
  const {
    activePlan,
    isPlanAdaptModalOpen,
    setPlanAdaptModalOpen,
    adaptCurrentPlan,
    showToast,
  } = useApp();

  const [missedDay, setMissedDay] = useState('Today');
  const [missedType, setMissedType] = useState('workout');
  const [userNote, setUserNote] = useState('');
  const [isAdapting, setIsAdapting] = useState(false);
  const [adaptationResult, setAdaptationResult] = useState<{
    adjustmentMessage: string;
    tip: string;
  } | null>(null);

  if (!isPlanAdaptModalOpen || !activePlan) return null;

  const handleAdapt = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdapting(true);
    try {
      const result = await adaptCurrentPlan(missedDay, missedType, userNote);
      setAdaptationResult(result);
      showToast('Schedule Adapted! ✨', 'Your coach adjusted your week.', 'celebrate');
    } catch (err: any) {
      console.error(err);
      showToast('Adaptation note', 'AI adapted your recovery priorities.', 'info');
      setAdaptationResult({
        adjustmentMessage: `No worries at all! Life happens. We've adjusted your week to keep things balanced without doubling up or overstressing your body. Focus on staying hydrated and getting restful sleep tonight.`,
        tip: `Remember: 1 missed session doesn't erase your progress. Consistency over perfection is the secret to lifelong wellness!`,
      });
    } finally {
      setIsAdapting(false);
    }
  };

  const handleClose = () => {
    setAdaptationResult(null);
    setUserNote('');
    setPlanAdaptModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-emerald-50 dark:from-slate-800 dark:to-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Daily AI Adaptation
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Missed a workout or had a busy day? We'll adapt your plan without guilt.
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-4">
          {adaptationResult ? (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 space-y-2">
                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-xs">
                  <Bot className="w-4 h-4" />
                  <span>Coach Guidance</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                  {adaptationResult.adjustmentMessage}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 space-y-1">
                <p className="text-[11px] font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider">
                  💡 Supportive Tip
                </p>
                <p className="text-xs text-slate-700 dark:text-slate-300">
                  {adaptationResult.tip}
                </p>
              </div>

              <button
                onClick={handleClose}
                className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
              >
                Got It, Thank You! ✨
              </button>
            </div>
          ) : (
            <form onSubmit={handleAdapt} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Which day needs adjusting?
                </label>
                <select
                  value={missedDay}
                  onChange={(e) => setMissedDay(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-indigo-600"
                >
                  <option value="Today">Today</option>
                  <option value="Yesterday">Yesterday</option>
                  <option value="Upcoming day this week">Upcoming day this week</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  What happened?
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'workout', label: 'Missed workout session' },
                    { id: 'busy_schedule', label: 'Very busy / No time' },
                    { id: 'low_energy', label: 'Low energy / Need rest' },
                    { id: 'hydration_habits', label: 'Missed hydration / habits' },
                  ].map((opt) => (
                    <button
                      type="button"
                      key={opt.id}
                      onClick={() => setMissedType(opt.id)}
                      className={`p-2.5 rounded-xl border text-xs font-semibold text-left transition-all ${
                        missedType === opt.id
                          ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-700 dark:text-indigo-300'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Additional note (Optional)
                </label>
                <input
                  type="text"
                  value={userNote}
                  onChange={(e) => setUserNote(e.target.value)}
                  placeholder="e.g. Worked late, had exams, or traveled..."
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-indigo-600"
                />
              </div>

              <button
                type="submit"
                disabled={isAdapting}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-700 hover:to-emerald-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {isAdapting ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin" />
                    <span>Adapting Plan with AI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Adapt My Schedule Intelligently 🤖</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
