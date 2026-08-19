import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { WorkoutSession, WorkoutTemplate, ExerciseDefinition } from '../../types';
import {
  Dumbbell,
  Play,
  CheckCircle2,
  Plus,
  Trash2,
  Clock,
  Flame,
  RotateCcw,
  Sparkles,
  Award,
  ChevronRight,
  Calendar,
  Layers,
  Bookmark,
  TrendingUp,
  Search,
  Check,
} from 'lucide-react';
import { ActiveWorkoutView } from './workout/ActiveWorkoutView';
import { WorkoutSetupModal } from './workout/WorkoutSetupModal';
import { WorkoutCompletionModal } from './workout/WorkoutCompletionModal';
import { WorkoutDetailModal } from './workout/WorkoutDetailModal';
import { ExerciseLibraryModal } from './workout/ExerciseLibraryModal';
import { PersonalRecordsView } from './workout/PersonalRecordsView';
import { WorkoutAnalyticsView } from './workout/WorkoutAnalyticsView';
import { WorkoutTemplatesView } from './workout/WorkoutTemplatesView';
import { EXERCISE_LIBRARY } from '../../data/exerciseLibrary';

export const WorkoutTracker: React.FC = () => {
  const {
    workouts,
    templates,
    personalRecords,
    workoutStreak,
    activeWorkout,
    startWorkoutSession,
    startWorkoutFromTemplate,
    updateActiveWorkout,
    finishActiveWorkout,
    cancelActiveWorkout,
    deleteWorkout,
    saveTemplate,
    deleteTemplate,
    user,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<
    'history' | 'library' | 'templates' | 'records' | 'analytics'
  >('history');

  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);
  const [isCompletionModalOpen, setIsCompletionModalOpen] = useState(false);
  const [selectedWorkoutDetail, setSelectedWorkoutDetail] = useState<WorkoutSession | null>(null);
  const [isLibraryPickerOpen, setIsLibraryPickerOpen] = useState(false);
  const [isSavingWorkout, setIsSavingWorkout] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];

  // Calculations for header metrics
  const completedWorkouts = workouts.filter((w) => w.completed);
  const todayWorkout = completedWorkouts.find((w) => w.date === todayStr);

  // Calculate past 7 days count
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const weeklyWorkouts = completedWorkouts.filter(
    (w) => new Date(w.date) >= sevenDaysAgo
  );

  const totalMinutesAllTime = completedWorkouts.reduce(
    (acc, w) => acc + (w.durationMinutes || 0),
    0
  );
  const totalHours = Math.floor(totalMinutesAllTime / 60);
  const totalMins = totalMinutesAllTime % 60;
  const formattedTotalTime =
    totalHours > 0 ? `${totalHours}h ${totalMins}m` : `${totalMins}m`;

  const handleFinishWorkflow = () => {
    setIsCompletionModalOpen(true);
  };

  const handleSaveCompletedWorkout = async (
    notes: string,
    saveAsTemplateName?: string
  ) => {
    setIsSavingWorkout(true);
    try {
      await finishActiveWorkout(notes, saveAsTemplateName);
      setIsCompletionModalOpen(false);
    } finally {
      setIsSavingWorkout(false);
    }
  };

  // If user has an active workout session in progress, render ActiveWorkoutView
  if (activeWorkout) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <ActiveWorkoutView
          workout={activeWorkout}
          onUpdateWorkout={updateActiveWorkout}
          onFinishWorkout={handleFinishWorkflow}
          onCancelWorkout={cancelActiveWorkout}
        />

        {/* Completion Modal */}
        <WorkoutCompletionModal
          isOpen={isCompletionModalOpen}
          onClose={() => setIsCompletionModalOpen(false)}
          workout={activeWorkout}
          onSave={handleSaveCompletedWorkout}
          isSaving={isSavingWorkout}
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* 1. HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
            <Dumbbell className="w-4 h-4" />
            <span>Strength & Conditioning</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            My Workouts
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
            Train consistently. Track your progress.
          </p>
        </div>

        {/* Prominent + Start Workout button */}
        <button
          onClick={() => setIsSetupModalOpen(true)}
          className="px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer shrink-0"
        >
          <Play className="w-4 h-4 fill-white" />
          <span>+ Start Workout</span>
        </button>
      </div>

      {/* 2. STATS ROW */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Today's Workout */}
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Today
          </span>
          <div className="flex items-center gap-1.5">
            {todayWorkout ? (
              <span className="text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 truncate">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span className="truncate">{todayWorkout.title}</span>
              </span>
            ) : (
              <span className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300">
                Ready to train
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400">
            {todayWorkout ? `${todayWorkout.durationMinutes}m completed` : 'No session yet'}
          </p>
        </div>

        {/* Weekly Count */}
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            This Week
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-extrabold text-slate-900 dark:text-white">
              {weeklyWorkouts.length}
            </span>
            <span className="text-xs font-semibold text-slate-400">
              / {user.weeklyWorkoutGoal || 4}
            </span>
          </div>
          <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold">
            {weeklyWorkouts.length >= (user.weeklyWorkoutGoal || 4)
              ? 'Target met! 🎯'
              : `${(user.weeklyWorkoutGoal || 4) - weeklyWorkouts.length} remaining`}
          </p>
        </div>

        {/* Total Training Time */}
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Total Time
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400">
              {formattedTotalTime}
            </span>
          </div>
          <p className="text-[11px] text-slate-400">All-time logged</p>
        </div>

        {/* Current Workout Streak */}
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Streak
          </span>
          <div className="flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span className="text-xl font-extrabold text-slate-900 dark:text-white">
              {workoutStreak}
            </span>
            <span className="text-xs font-semibold text-slate-400">days</span>
          </div>
          <p className="text-[11px] text-slate-400">Active consistency</p>
        </div>

        {/* Personal Records count */}
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1 col-span-2 sm:col-span-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            PRs Logged
          </span>
          <div className="flex items-center gap-1.5">
            <Award className="w-4 h-4 text-amber-500" />
            <span className="text-xl font-extrabold text-slate-900 dark:text-white">
              {personalRecords.length}
            </span>
          </div>
          <p className="text-[11px] text-slate-400">Milestones hit</p>
        </div>
      </div>

      {/* 3. NAVIGATION SUB-TABS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200/80 dark:border-slate-800 scrollbar-none">
        <button
          onClick={() => setActiveSubTab('history')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeSubTab === 'history'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          History & Logs ({completedWorkouts.length})
        </button>

        <button
          onClick={() => setActiveSubTab('library')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeSubTab === 'library'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Exercise Library ({EXERCISE_LIBRARY.length})
        </button>

        <button
          onClick={() => setActiveSubTab('templates')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeSubTab === 'templates'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Routines & Templates ({templates.length})
        </button>

        <button
          onClick={() => setActiveSubTab('records')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeSubTab === 'records'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Personal Records ({personalRecords.length})
        </button>

        <button
          onClick={() => setActiveSubTab('analytics')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeSubTab === 'analytics'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Analytics & Progress
        </button>
      </div>

      {/* 4. SUB-TAB CONTENT */}

      {/* TAB 1: HISTORY & LOGS */}
      {activeSubTab === 'history' && (
        <div className="space-y-4">
          {completedWorkouts.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 mx-auto flex items-center justify-center shadow-xs">
                <Dumbbell className="w-8 h-8" />
              </div>
              <div className="space-y-1 max-w-sm mx-auto">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Your journey starts here 💪
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Complete your first workout and it will appear here with full set logs, volume stats, and personal milestones.
                </p>
              </div>
              <button
                onClick={() => setIsSetupModalOpen(true)}
                className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-500/25 active:scale-95 transition-all cursor-pointer"
              >
                + Start Your First Workout
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {completedWorkouts.map((session) => {
                const totalSetsDone = session.exercises.reduce(
                  (acc, ex) => acc + ex.sets.filter((s) => s.completed).length,
                  0
                );

                return (
                  <div
                    key={session.id}
                    onClick={() => setSelectedWorkoutDetail(session)}
                    className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-700/60 transition-all cursor-pointer flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300">
                          {session.category}
                        </span>
                        <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{session.date}</span>
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {session.title}
                      </h3>

                      {session.notes && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1 italic">
                          "{session.notes}"
                        </p>
                      )}

                      {/* Exercise chips */}
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {session.exercises.slice(0, 4).map((ex, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-lg text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                          >
                            {ex.name}
                          </span>
                        ))}
                        {session.exercises.length > 4 && (
                          <span className="px-1.5 py-0.5 text-[10px] text-slate-400 font-medium">
                            +{session.exercises.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-3 font-semibold">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-indigo-500" />
                          <span>{session.durationMinutes}m</span>
                        </span>
                        <span>•</span>
                        <span>{session.exercises.length} exercises</span>
                        <span>•</span>
                        <span>{totalSetsDone} sets</span>
                      </div>

                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: EXERCISE LIBRARY */}
      {activeSubTab === 'library' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Browse movement instructions and exercise technique guides.
            </p>
            <button
              onClick={() => setIsLibraryPickerOpen(true)}
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-xs"
            >
              Open Full Library
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {EXERCISE_LIBRARY.map((ex) => (
              <div
                key={ex.id}
                className="p-4.5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                    {ex.muscleGroup}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400">
                    {ex.equipment}
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                  {ex.name}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {ex.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: ROUTINES & TEMPLATES */}
      {activeSubTab === 'templates' && (
        <WorkoutTemplatesView
          templates={templates}
          onStartTemplate={startWorkoutFromTemplate}
          onCreateTemplate={saveTemplate}
          onDeleteTemplate={deleteTemplate}
        />
      )}

      {/* TAB 4: PERSONAL RECORDS */}
      {activeSubTab === 'records' && (
        <PersonalRecordsView
          records={personalRecords}
          workoutStreak={workoutStreak}
        />
      )}

      {/* TAB 5: ANALYTICS */}
      {activeSubTab === 'analytics' && (
        <WorkoutAnalyticsView
          workouts={workouts}
          weeklyGoal={user.weeklyWorkoutGoal || 4}
        />
      )}

      {/* MODALS */}
      {/* 1. Setup Workout Flow */}
      <WorkoutSetupModal
        isOpen={isSetupModalOpen}
        onClose={() => setIsSetupModalOpen(false)}
        onStartWorkout={startWorkoutSession}
        templates={templates}
      />

      {/* 2. Workout Detail Modal */}
      <WorkoutDetailModal
        workout={selectedWorkoutDetail}
        onClose={() => setSelectedWorkoutDetail(null)}
        onDelete={deleteWorkout}
      />

      {/* 3. Exercise Library Browser */}
      <ExerciseLibraryModal
        isOpen={isLibraryPickerOpen}
        onClose={() => setIsLibraryPickerOpen(false)}
        onSelectExercise={(exDef) => {
          // If starting from library browser directly, start quick session with that exercise
          startWorkoutSession({
            id: 'active-' + Date.now(),
            title: `${exDef.name} Focus`,
            category: 'Custom',
            date: todayStr,
            durationMinutes: 0,
            startedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            exercises: [
              {
                id: 'ex-1',
                name: exDef.name,
                category: exDef.category,
                muscleGroup: exDef.muscleGroup,
                equipment: exDef.equipment,
                sets: [
                  { setNumber: 1, reps: 10, weightKg: 20, completed: false },
                  { setNumber: 2, reps: 10, weightKg: 20, completed: false },
                  { setNumber: 3, reps: 10, weightKg: 20, completed: false },
                ],
              },
            ],
            completed: false,
          });
        }}
      />
    </div>
  );
};
