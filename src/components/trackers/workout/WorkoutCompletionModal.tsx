import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Dumbbell,
  Clock,
  Layers,
  CheckCircle2,
  Trophy,
  Flame,
  Bookmark,
} from 'lucide-react';
import { WorkoutSession, PersonalRecord } from '../../../types';

interface WorkoutCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  workout: WorkoutSession;
  onSave: (notes: string, saveAsTemplateName?: string) => Promise<void>;
  newPRs?: PersonalRecord[];
  isSaving: boolean;
}

export const WorkoutCompletionModal: React.FC<WorkoutCompletionModalProps> = ({
  isOpen,
  onClose,
  workout,
  onSave,
  newPRs = [],
  isSaving,
}) => {
  const [notes, setNotes] = useState(workout.notes || '');
  const [saveAsTemplate, setSaveAsTemplate] = useState(false);
  const [templateName, setTemplateName] = useState(workout.title || 'My Routine');

  if (!isOpen) return null;

  const totalExercises = workout.exercises.length;
  const totalSets = workout.exercises.reduce(
    (acc, ex) => acc + ex.sets.filter((s) => s.completed).length,
    0
  );
  const totalVolumeKg = workout.exercises.reduce((acc, ex) => {
    return (
      acc +
      ex.sets
        .filter((s) => s.completed)
        .reduce((sAcc, s) => sAcc + (s.weightKg || 0) * (s.reps || 0), 0)
    );
  }, 0);

  const durationMin = Math.max(1, workout.durationMinutes || 1);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(notes, saveAsTemplate ? templateName : undefined);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Confetti / Trophy Banner */}
        <div className="p-6 text-center bg-gradient-to-br from-indigo-900 via-indigo-800 to-emerald-900 text-white relative overflow-hidden">
          <div className="w-16 h-16 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 text-emerald-300 mx-auto flex items-center justify-center text-3xl shadow-lg shadow-black/20 mb-3">
            🎉
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/15 backdrop-blur-md border border-white/10 text-emerald-300 uppercase tracking-wider inline-block mb-1">
            Session Finished
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Workout Complete!</h2>
          <p className="text-xs text-indigo-100 font-medium mt-1">
            {durationMin} minutes of balanced movement & strength
          </p>
        </div>

        {/* New PR Badge Banner if any */}
        {newPRs.length > 0 && (
          <div className="px-6 py-3 bg-amber-50 dark:bg-amber-950/50 border-b border-amber-200 dark:border-amber-900/60 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200">
                New Personal Record 🎉
              </h4>
              <p className="text-[11px] text-amber-700 dark:text-amber-300 font-medium">
                {newPRs.map((p) => `${p.exerciseName}: ${p.value} ${p.unit}`).join(', ')}
              </p>
            </div>
          </div>
        )}

        {/* Summary Grid */}
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-3 gap-2.5 text-center">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/70">
              <span className="text-lg font-extrabold text-slate-900 dark:text-white block">
                {totalExercises}
              </span>
              <span className="text-[11px] text-slate-400 font-medium">Exercises</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/70">
              <span className="text-lg font-extrabold text-slate-900 dark:text-white block">
                {totalSets}
              </span>
              <span className="text-[11px] text-slate-400 font-medium">Sets Done</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/70">
              <span className="text-lg font-extrabold text-slate-900 dark:text-white block">
                {durationMin}m
              </span>
              <span className="text-[11px] text-slate-400 font-medium">Duration</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Workout Notes (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Felt great today, increased reps on incline press..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            {/* Save as Template Option */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/70 space-y-2">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={saveAsTemplate}
                  onChange={(e) => setSaveAsTemplate(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Save as reusable template
                </span>
              </label>

              {saveAsTemplate && (
                <input
                  type="text"
                  placeholder="Template Name (e.g. My Upper Body Routine)"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none"
                />
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Back to Session
              </button>

              <button
                type="submit"
                disabled={isSaving}
                className="flex-2 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isSaving ? 'Saving...' : 'Save Workout'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
