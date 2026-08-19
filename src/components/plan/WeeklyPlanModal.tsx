import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  Sparkles,
  Calendar,
  Dumbbell,
  Droplets,
  Moon,
  Footprints,
  Play,
  RotateCcw,
  Plus,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { DayOfWeekKey } from '../../types';

export const WeeklyPlanModal: React.FC = () => {
  const {
    activePlan,
    isPlanModalOpen,
    setPlanModalOpen,
    setPlanAdaptModalOpen,
    setPlanCreateModalOpen,
    setIsPlanHistoryOpen,
    setIsRegenerateModalOpen,
    startWorkoutFromPlan,
    togglePlanTask,
  } = useApp();

  const [expandedDay, setExpandedDay] = useState<DayOfWeekKey | null>(null);

  if (!isPlanModalOpen || !activePlan) return null;

  const toggleDayExpansion = (day: DayOfWeekKey) => {
    setExpandedDay((prev) => (prev === day ? null : day));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-white dark:from-slate-800/80 dark:to-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-lg font-bold shadow-md shadow-indigo-500/20">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-md">
                  Active Weekly Routine
                </span>
                <span className="text-xs text-slate-400">
                  {activePlan.days.filter((d) => d.workout).length} workout days / week
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {activePlan.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setPlanModalOpen(false);
                setIsPlanHistoryOpen(true);
              }}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>History</span>
            </button>

            <button
              onClick={() => {
                setPlanModalOpen(false);
                setIsRegenerateModalOpen(true);
              }}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Regenerate</span>
            </button>

            <button
              onClick={() => setPlanModalOpen(false)}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Plan Summary Banner */}
        <div className="px-6 py-3 bg-indigo-600/5 dark:bg-indigo-950/30 border-b border-indigo-100/60 dark:border-indigo-900/40 text-xs text-slate-600 dark:text-slate-300 flex items-center justify-between">
          <p className="line-clamp-1">{activePlan.summary}</p>
          <button
            onClick={() => {
              setPlanModalOpen(false);
              setPlanAdaptModalOpen(true);
            }}
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline shrink-0 ml-4 flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" /> Adapt Daily
          </button>
        </div>

        {/* 7-Day List */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-3 flex-1">
          {activePlan.days.map((day) => {
            const isWorkout = !!day.workout;
            const isExpanded = expandedDay === day.dayOfWeek;
            const completedCount = day.tasks.filter((t) => t.completed).length;

            return (
              <div
                key={day.dayOfWeek}
                className={`rounded-2xl border transition-all ${
                  isWorkout
                    ? 'bg-white dark:bg-slate-800/80 border-indigo-200/80 dark:border-indigo-800/60'
                    : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-700/60'
                }`}
              >
                {/* Day Header Row */}
                <div
                  onClick={() => toggleDayExpansion(day.dayOfWeek)}
                  className="p-4 flex items-center justify-between cursor-pointer select-none"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-xl text-xs font-extrabold ${
                        isWorkout
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {day.dayName}
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {day.focusTheme}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {isWorkout
                          ? `🏋️ ${day.workout?.title} (${day.workout?.durationMinutes} mins)`
                          : '🌿 Active Recovery & Light Movement'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-slate-400">
                      {completedCount}/{day.tasks.length} tasks
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-1 space-y-4 border-t border-slate-100 dark:border-slate-700/60 animate-in fade-in duration-150">
                    {/* Workout breakdown if present */}
                    {isWorkout && day.workout && (
                      <div className="p-3.5 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                              Planned Workout Session
                            </span>
                            <h5 className="text-sm font-bold text-slate-900 dark:text-white">
                              {day.workout.title}
                            </h5>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setPlanModalOpen(false);
                              startWorkoutFromPlan(day.workout!);
                            }}
                            className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 cursor-pointer"
                          >
                            <Play className="w-3.5 h-3.5 fill-white" />
                            <span>Start This Workout</span>
                          </button>
                        </div>

                        {/* Exercise list */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                          {day.workout.exercises.map((ex, idx) => (
                            <div
                              key={idx}
                              className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-xs flex justify-between items-center"
                            >
                              <span className="font-semibold text-slate-800 dark:text-slate-200">
                                {ex.name}
                              </span>
                              <span className="text-[11px] text-slate-500">
                                {ex.sets} sets × {ex.reps} reps
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Daily Checklist Tasks */}
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Daily Routine Tasks
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {day.tasks.map((task) => (
                          <button
                            key={task.id}
                            onClick={() => togglePlanTask(day.dayOfWeek, task.id)}
                            className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                              task.completed
                                ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100'
                                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
                            }`}
                          >
                            <div className="min-w-0 pr-2">
                              <p className={`text-xs font-semibold truncate ${task.completed ? 'line-through opacity-70' : ''}`}>
                                {task.title}
                              </p>
                              <p className="text-[10px] text-slate-400">
                                {task.category} • {task.targetValue || 'Daily'}
                              </p>
                            </div>
                            <div
                              className={`w-4 h-4 rounded-md flex items-center justify-center border shrink-0 ${
                                task.completed
                                  ? 'bg-emerald-600 border-emerald-600 text-white'
                                  : 'border-slate-300 dark:border-slate-600'
                              }`}
                            >
                              {task.completed && <CheckCircle2 className="w-3 h-3" />}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end bg-slate-50 dark:bg-slate-800/50">
          <button
            onClick={() => setPlanModalOpen(false)}
            className="px-5 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-semibold text-xs transition-colors cursor-pointer"
          >
            Close Plan Viewer
          </button>
        </div>
      </div>
    </div>
  );
};
