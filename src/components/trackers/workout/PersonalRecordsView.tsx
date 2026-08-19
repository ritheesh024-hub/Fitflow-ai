import React from 'react';
import { Trophy, Dumbbell, Clock, Flame, Sparkles, Award } from 'lucide-react';
import { PersonalRecord } from '../../../types';

interface PersonalRecordsViewProps {
  records: PersonalRecord[];
  workoutStreak: number;
}

export const PersonalRecordsView: React.FC<PersonalRecordsViewProps> = ({
  records,
  workoutStreak,
}) => {
  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-emerald-500/10 border border-amber-200/60 dark:border-amber-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/30">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              Personal Records & Milestones
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Celebrating your personal consistency, endurance, and strength gains
            </p>
          </div>
        </div>

        {/* Consistency streak pill */}
        <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 rounded-2xl border border-amber-200 dark:border-amber-800/40 self-start sm:self-auto">
          <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
            {workoutStreak} Day Streak
          </span>
        </div>
      </div>

      {/* PR Cards Grid */}
      {records.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950 text-amber-500 mx-auto flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            No Personal Records Logged Yet
          </h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Complete workouts and log your weights or reps to automatically unlock and track your personal bests here!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {records.map((pr) => {
            const isDuration = pr.metricType === 'longest_duration';
            const isReps = pr.metricType === 'most_reps';

            return (
              <div
                key={pr.id}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-amber-300 dark:hover:border-amber-700/60 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-900/40">
                      {isDuration
                        ? 'Longest Session'
                        : isReps
                        ? 'Highest Rep Count'
                        : 'Personal Best'}
                    </span>
                    <span className="text-[11px] font-medium text-slate-400">
                      {pr.date}
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-slate-900 dark:text-white">
                    {pr.exerciseName}
                  </h4>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-baseline justify-between">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-extrabold text-amber-500">
                      {pr.value}
                    </span>
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                      {pr.unit}
                    </span>
                  </div>
                  {pr.workoutTitle && (
                    <span className="text-[11px] text-slate-400 truncate max-w-[120px]">
                      {pr.workoutTitle}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
