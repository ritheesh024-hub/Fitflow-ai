import React from 'react';
import {
  X,
  Calendar,
  Clock,
  Dumbbell,
  Trash2,
  CheckCircle2,
  Layers,
  FileText,
} from 'lucide-react';
import { WorkoutSession } from '../../../types';

interface WorkoutDetailModalProps {
  workout: WorkoutSession | null;
  onClose: () => void;
  onDelete?: (workoutId: string) => Promise<void>;
}

export const WorkoutDetailModal: React.FC<WorkoutDetailModalProps> = ({
  workout,
  onClose,
  onDelete,
}) => {
  if (!workout) return null;

  const totalCompletedSets = workout.exercises.reduce(
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

  const handleDelete = async () => {
    if (onDelete) {
      await onDelete(workout.id);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <Dumbbell className="w-5 h-5" />
            </div>
            <div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300">
                {workout.category}
              </span>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                {workout.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {onDelete && (
              <button
                onClick={handleDelete}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                title="Delete Workout"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-2 p-4 bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 text-center">
          <div>
            <span className="text-xs text-slate-400 font-medium block">Date</span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{workout.date}</span>
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium block">Duration</span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{workout.durationMinutes}m</span>
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium block">Sets Done</span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{totalCompletedSets}</span>
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium block">Total Volume</span>
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
              {totalVolumeKg > 0 ? `${totalVolumeKg.toLocaleString()} kg` : 'Bodyweight'}
            </span>
          </div>
        </div>

        {/* Notes banner if any */}
        {workout.notes && (
          <div className="px-5 py-3 bg-amber-50/60 dark:bg-amber-950/30 border-b border-amber-200/50 dark:border-amber-900/40 flex items-start gap-2.5">
            <FileText className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-900 dark:text-amber-200 font-medium leading-relaxed">
              "{workout.notes}"
            </p>
          </div>
        )}

        {/* Exercise Details List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {workout.exercises.map((ex, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 font-bold text-xs flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {ex.name}
                  </h4>
                </div>
                {ex.muscleGroup && (
                  <span className="text-[11px] font-semibold text-slate-400">
                    {ex.muscleGroup}
                  </span>
                )}
              </div>

              {/* Sets Table */}
              <div className="space-y-1.5 pt-1">
                {ex.sets.map((s, sIdx) => (
                  <div
                    key={sIdx}
                    className="flex items-center justify-between py-1 px-2 rounded-xl bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-700/60"
                  >
                    <span className="text-slate-400 font-medium">Set {s.setNumber || sIdx + 1}</span>
                    <div className="flex items-center gap-3">
                      {s.weightKg !== undefined && s.weightKg > 0 && (
                        <span>{s.weightKg} {s.weightUnit || 'kg'}</span>
                      )}
                      <span>{s.reps} reps</span>
                      {s.completed ? (
                        <span className="text-emerald-500 font-bold">✓ Done</span>
                      ) : (
                        <span className="text-slate-400">Skipped</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition-colors"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};
