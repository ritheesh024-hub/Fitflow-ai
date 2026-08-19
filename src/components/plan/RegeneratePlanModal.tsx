import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  RotateCcw,
  Sparkles,
  X,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Dumbbell,
} from 'lucide-react';

interface RegeneratePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RegeneratePlanModal: React.FC<RegeneratePlanModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    regenerateMyWeek,
    activePlan,
    user,
  } = useApp();

  const [customGoal, setCustomGoal] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const handleRegenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    try {
      await regenerateMyWeek(customGoal || undefined);
      onClose();
    } catch (err) {
      console.error('Error regenerating plan:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div
      id="regenerate-plan-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="regenerate-title"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white flex items-start justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-emerald-300 border border-white/10">
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Regenerate My Week</span>
            </div>
            <h2 id="regenerate-title" className="text-xl font-extrabold text-white tracking-tight">
              Create New Weekly Plan
            </h2>
          </div>

          <button
            id="close-regenerate-modal-btn"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors shrink-0 cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleRegenerate} className="p-5 sm:p-6 space-y-4">
          {/* Exact required confirmation text */}
          <div className="p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs sm:text-sm text-emerald-950 dark:text-emerald-100 font-medium">
              <p className="font-bold">History Protected</p>
              <p className="text-emerald-900/90 dark:text-emerald-200/90 leading-relaxed">
                Your current plan will remain saved. A new plan will be created based on your recent progress.
              </p>
            </div>
          </div>

          {/* Optional adjustments input */}
          <div className="space-y-1.5">
            <label
              htmlFor="regenerate-focus-input"
              className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider"
            >
              Any specific focus for this new week? (Optional)
            </label>
            <input
              type="text"
              id="regenerate-focus-input"
              value={customGoal}
              onChange={(e) => setCustomGoal(e.target.value)}
              placeholder="e.g. Focus more on upper body mobility, lighter intensity, or 3 workout days"
              className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              id="cancel-regenerate-btn"
              onClick={onClose}
              disabled={isGenerating}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="confirm-regenerate-btn"
              disabled={isGenerating}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-emerald-500/20 flex items-center gap-1.5 cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Generating New Week...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Generate New Plan</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
