import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  Plus,
  Trash2,
  CheckCircle2,
  Sparkles,
  Timer,
  Clock,
  Dumbbell,
  Layers,
  Save,
  X,
  ChevronDown,
  Info,
  Check,
  RotateCcw,
} from 'lucide-react';
import { WorkoutSession, Exercise, ExerciseSet, ExerciseDefinition } from '../../../types';
import { ExerciseLibraryModal } from './ExerciseLibraryModal';
import { RestTimerFloating } from './RestTimerFloating';
import { saveActiveWorkoutLocally } from '../../../services/workoutService';

interface ActiveWorkoutViewProps {
  workout: WorkoutSession;
  onUpdateWorkout: (workout: WorkoutSession) => void;
  onFinishWorkout: () => void;
  onCancelWorkout: () => void;
  onSaveAsTemplate?: (workout: WorkoutSession) => void;
}

export const ActiveWorkoutView: React.FC<ActiveWorkoutViewProps> = ({
  workout,
  onUpdateWorkout,
  onFinishWorkout,
  onCancelWorkout,
  onSaveAsTemplate,
}) => {
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(workout.durationMinutes * 60 || 0);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isRestTimerOpen, setIsRestTimerOpen] = useState(false);
  const [restTimerSeconds, setRestTimerSeconds] = useState(60);

  // Live stopwatch counter
  useEffect(() => {
    let timer: any = null;
    if (!isPaused) {
      timer = setInterval(() => {
        setElapsedSeconds((prev) => {
          const next = prev + 1;
          // Update parent state duration
          if (next % 10 === 0) {
            const updated = {
              ...workout,
              durationMinutes: Math.max(1, Math.round(next / 60)),
            };
            onUpdateWorkout(updated);
            saveActiveWorkoutLocally(updated);
          }
          return next;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPaused, workout, onUpdateWorkout]);

  // Sync state to local storage for offline resilience
  const updateWorkoutState = (updated: WorkoutSession) => {
    onUpdateWorkout(updated);
    saveActiveWorkoutLocally(updated);
  };

  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Add Exercise from Library
  const handleAddExerciseFromLibrary = (def: ExerciseDefinition) => {
    const newEx: Exercise = {
      id: `ex-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: def.name,
      category: def.category,
      muscleGroup: def.muscleGroup,
      equipment: def.equipment,
      instructions: def.instructions,
      sets: [
        { setNumber: 1, reps: 10, weightKg: 20, completed: false },
        { setNumber: 2, reps: 10, weightKg: 20, completed: false },
        { setNumber: 3, reps: 10, weightKg: 20, completed: false },
      ],
    };

    const updated = {
      ...workout,
      exercises: [...workout.exercises, newEx],
    };
    updateWorkoutState(updated);
  };

  // Remove Exercise
  const handleRemoveExercise = (exerciseId: string) => {
    const updated = {
      ...workout,
      exercises: workout.exercises.filter((e) => e.id !== exerciseId),
    };
    updateWorkoutState(updated);
  };

  // Add Set to Exercise
  const handleAddSet = (exerciseId: string) => {
    const updated = {
      ...workout,
      exercises: workout.exercises.map((ex) => {
        if (ex.id !== exerciseId) return ex;
        const lastSet = ex.sets[ex.sets.length - 1];
        const newSet: ExerciseSet = {
          setNumber: ex.sets.length + 1,
          reps: lastSet ? lastSet.reps : 10,
          weightKg: lastSet ? lastSet.weightKg : 20,
          weightUnit: lastSet?.weightUnit || 'kg',
          completed: false,
        };
        return {
          ...ex,
          sets: [...ex.sets, newSet],
        };
      }),
    };
    updateWorkoutState(updated);
  };

  // Remove Set from Exercise
  const handleRemoveSet = (exerciseId: string, setIndex: number) => {
    const updated = {
      ...workout,
      exercises: workout.exercises.map((ex) => {
        if (ex.id !== exerciseId) return ex;
        const newSets = ex.sets
          .filter((_, idx) => idx !== setIndex)
          .map((s, idx) => ({ ...s, setNumber: idx + 1 }));
        return { ...ex, sets: newSets };
      }),
    };
    updateWorkoutState(updated);
  };

  // Update Set details (Weight, Reps)
  const handleUpdateSet = (
    exerciseId: string,
    setIndex: number,
    field: keyof ExerciseSet,
    val: any
  ) => {
    const updated = {
      ...workout,
      exercises: workout.exercises.map((ex) => {
        if (ex.id !== exerciseId) return ex;
        const newSets = [...ex.sets];
        newSets[setIndex] = {
          ...newSets[setIndex],
          [field]: val,
        };
        return { ...ex, sets: newSets };
      }),
    };
    updateWorkoutState(updated);
  };

  // Toggle Set Complete (triggers Rest Timer)
  const handleToggleSetComplete = (exerciseId: string, setIndex: number) => {
    let willBeCompleted = false;
    const updated = {
      ...workout,
      exercises: workout.exercises.map((ex) => {
        if (ex.id !== exerciseId) return ex;
        const newSets = [...ex.sets];
        willBeCompleted = !newSets[setIndex].completed;
        newSets[setIndex] = {
          ...newSets[setIndex],
          completed: willBeCompleted,
          completedAt: willBeCompleted
            ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : undefined,
        };
        return { ...ex, sets: newSets };
      }),
    };
    updateWorkoutState(updated);

    // Auto open rest timer on set completion
    if (willBeCompleted) {
      setRestTimerSeconds(60);
      setIsRestTimerOpen(true);
    }
  };

  const totalSets = workout.exercises.reduce((acc, ex) => acc + ex.sets.length, 0);
  const completedSets = workout.exercises.reduce(
    (acc, ex) => acc + ex.sets.filter((s) => s.completed).length,
    0
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. TOP ACTIVE WORKOUT BAR */}
      <div className="sticky top-16 z-30 bg-slate-900 text-white rounded-3xl p-4 sm:p-6 shadow-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Title and Category */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center font-bold text-white shadow-md shadow-indigo-500/30">
            <Dumbbell className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {workout.category}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                {completedSets} of {totalSets} sets done
              </span>
            </div>
            <h2 className="text-base sm:text-xl font-bold text-white mt-0.5">
              {workout.title}
            </h2>
          </div>
        </div>

        {/* Stopwatch & Action Controls */}
        <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
          {/* Timer Display */}
          <div className="flex items-center gap-2 bg-slate-800/80 px-3.5 py-2 rounded-2xl border border-slate-700 font-mono text-sm sm:text-base font-bold text-emerald-400">
            <Clock className="w-4 h-4 text-emerald-400" />
            <span>{formatTimer(elapsedSeconds)}</span>
          </div>

          {/* Pause / Resume */}
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
            title={isPaused ? 'Resume Workout' : 'Pause Workout'}
          >
            {isPaused ? <Play className="w-4 h-4 fill-current" /> : <Pause className="w-4 h-4" />}
          </button>

          {/* Rest Timer Button */}
          <button
            onClick={() => setIsRestTimerOpen(true)}
            className="p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
            title="Open Rest Timer"
          >
            <Timer className="w-4 h-4 text-indigo-400" />
          </button>

          {/* Finish Workout Primary Button */}
          <button
            onClick={onFinishWorkout}
            className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/30 flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Finish</span>
          </button>

          {/* Discard Workout */}
          <button
            onClick={onCancelWorkout}
            className="p-2.5 rounded-2xl text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
            title="Discard Workout"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. EXERCISE CARDS LIST */}
      <div className="space-y-4">
        {workout.exercises.map((ex, exIndex) => (
          <div
            key={ex.id}
            className="p-4 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4 transition-all"
          >
            {/* Exercise Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold text-xs flex items-center justify-center">
                  {exIndex + 1}
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    {ex.name}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {ex.muscleGroup && <span>{ex.muscleGroup}</span>}
                    {ex.equipment && <span>• {ex.equipment}</span>}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleRemoveExercise(ex.id)}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  title="Remove Exercise"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Sets Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2">
                    <th className="pb-2 pl-2 w-12">Set</th>
                    <th className="pb-2">Weight (kg)</th>
                    <th className="pb-2">Reps</th>
                    <th className="pb-2 pr-2 text-right">Complete</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {ex.sets.map((set, sIdx) => (
                    <tr
                      key={sIdx}
                      className={`transition-colors ${
                        set.completed ? 'bg-emerald-50/40 dark:bg-emerald-950/20' : ''
                      }`}
                    >
                      {/* Set Number */}
                      <td className="py-2.5 pl-2 font-bold text-slate-700 dark:text-slate-300">
                        {set.setNumber}
                      </td>

                      {/* Weight Input */}
                      <td className="py-2.5 pr-2">
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min="0"
                            step="0.5"
                            value={set.weightKg === undefined ? '' : set.weightKg}
                            onChange={(e) =>
                              handleUpdateSet(
                                ex.id,
                                sIdx,
                                'weightKg',
                                parseFloat(e.target.value) || 0
                              )
                            }
                            className="w-16 sm:w-20 px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                          />
                          <span className="text-[11px] text-slate-400 font-semibold">kg</span>
                        </div>
                      </td>

                      {/* Reps Input */}
                      <td className="py-2.5 pr-2">
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min="0"
                            value={set.reps || ''}
                            onChange={(e) =>
                              handleUpdateSet(
                                ex.id,
                                sIdx,
                                'reps',
                                parseInt(e.target.value, 10) || 0
                              )
                            }
                            className="w-16 sm:w-20 px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                          />
                          <span className="text-[11px] text-slate-400 font-semibold">reps</span>
                        </div>
                      </td>

                      {/* Complete Checkbox Action */}
                      <td className="py-2.5 pr-2 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleToggleSetComplete(ex.id, sIdx)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer active:scale-95 ${
                              set.completed
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950 text-slate-600 dark:text-slate-300 hover:text-emerald-600'
                            }`}
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>{set.completed ? 'Done' : 'Check'}</span>
                          </button>

                          {ex.sets.length > 1 && (
                            <button
                              onClick={() => handleRemoveSet(ex.id, sIdx)}
                              className="p-1 text-slate-300 hover:text-rose-500 transition-colors"
                              title="Delete Set"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Add Set Button */}
            <div className="pt-1">
              <button
                onClick={() => handleAddSet(ex.id)}
                className="py-2 px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Set</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 3. BOTTOM ACTIONS: ADD EXERCISE & FINISH */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button
          onClick={() => setIsLibraryOpen(true)}
          className="flex-1 py-3.5 rounded-2xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/80 border border-dashed border-slate-300 dark:border-slate-700 text-indigo-600 dark:text-indigo-400 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add Exercise from Library</span>
        </button>

        <button
          onClick={onFinishWorkout}
          className="flex-1 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 active:scale-98 transition-all cursor-pointer"
        >
          <CheckCircle2 className="w-5 h-5" />
          <span>Finish & Save Workout</span>
        </button>
      </div>

      {/* Exercise Library Selection Modal */}
      <ExerciseLibraryModal
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        onSelectExercise={handleAddExerciseFromLibrary}
        alreadySelectedIds={workout.exercises.map((e) => e.name)}
      />

      {/* Floating Rest Timer */}
      <RestTimerFloating
        isOpen={isRestTimerOpen}
        initialSeconds={restTimerSeconds}
        onClose={() => setIsRestTimerOpen(false)}
      />
    </div>
  );
};
