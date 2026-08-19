import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserPersonalPlan } from '../../types';
import {
  Calendar,
  X,
  Sparkles,
  CheckCircle2,
  Clock,
  ChevronRight,
  RotateCcw,
  Plus,
  Archive,
  Dumbbell,
  ShieldCheck,
} from 'lucide-react';

interface PlanHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PlanHistoryModal: React.FC<PlanHistoryModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    activePlan,
    allPlans,
    setIsRegenerateModalOpen,
    setPlanModalOpen,
    savePlan,
    showToast,
  } = useApp();

  const [selectedPlanToPreview, setSelectedPlanToPreview] = useState<UserPersonalPlan | null>(null);

  if (!isOpen) return null;

  // Group plans by active vs archived
  const activePlans = allPlans.filter((p) => p.status === 'active' || p.id === activePlan?.id);
  const historicalPlans = allPlans.filter((p) => p.status !== 'active' && p.id !== activePlan?.id);

  return (
    <div
      id="plan-history-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="history-title"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white flex items-start justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-emerald-300 border border-white/10">
              <Calendar className="w-3.5 h-3.5" />
              <span>Plan Management</span>
            </div>
            <h2 id="history-title" className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              My Plans & History
            </h2>
            <p className="text-xs sm:text-sm text-indigo-200 font-medium">
              View current, previous, and archived 7-day personalized routines
            </p>
          </div>

          <button
            id="close-plan-history-btn"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors shrink-0 cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* Active Plan Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Current Active Plan
              </span>
              <button
                id="regenerate-from-history-btn"
                onClick={() => {
                  onClose();
                  setIsRegenerateModalOpen(true);
                }}
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Regenerate My Week</span>
              </button>
            </div>

            {activePlan ? (
              <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50/80 via-white to-emerald-50/60 dark:from-slate-800/80 dark:via-slate-800/40 dark:to-slate-800/80 border border-indigo-200 dark:border-indigo-800/60 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1 max-w-md">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white uppercase tracking-wider">
                      Active
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      Created {new Date(activePlan.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                    {activePlan.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                    {activePlan.summary}
                  </p>
                </div>

                <button
                  id="view-active-plan-details-btn"
                  onClick={() => {
                    onClose();
                    setPlanModalOpen(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <span>View Schedule</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border text-center space-y-2">
                <p className="text-xs sm:text-sm text-slate-500 font-medium">
                  No active plan selected.
                </p>
              </div>
            )}
          </div>

          {/* Historical / Archived Plans */}
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Previous & Archived Plans ({historicalPlans.length})
            </span>

            {historicalPlans.length === 0 ? (
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700 text-center">
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  When you regenerate or finish a week, previous plans are safely archived here.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {historicalPlans.map((plan) => (
                  <div
                    key={plan.id}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 capitalize">
                          {plan.status || 'archived'}
                        </span>
                        <span className="text-xs text-slate-400">
                          {new Date(plan.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {plan.title}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                        {plan.summary}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => {
                          savePlan({ ...plan, status: 'active' });
                          showToast('Plan Activated', `${plan.title} is now active.`, 'success');
                          onClose();
                        }}
                        className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Make Active
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 flex items-center justify-between">
          <p className="text-xs text-slate-400">
            Full workout & task history preserved in Firestore
          </p>
          <button
            id="close-history-footer-btn"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
