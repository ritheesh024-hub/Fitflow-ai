import React from 'react';
import { useApp } from '../../context/AppContext';
import { PlanOnboardingFlow } from '../onboarding/PlanOnboardingFlow';
import { X } from 'lucide-react';

export const CreatePlanModal: React.FC = () => {
  const { isPlanCreateModalOpen, setPlanCreateModalOpen } = useApp();

  if (!isPlanCreateModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-2xl my-auto">
        <button
          onClick={() => setPlanCreateModalOpen(false)}
          className="absolute top-4 right-4 z-50 p-2 rounded-full bg-white dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white shadow-md transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <PlanOnboardingFlow
          isStandaloneModal={true}
          onClose={() => setPlanCreateModalOpen(false)}
          onComplete={() => setPlanCreateModalOpen(false)}
        />
      </div>
    </div>
  );
};
