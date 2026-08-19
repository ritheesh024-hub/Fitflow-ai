import React, { useState } from 'react';
import {
  X,
  Play,
  Zap,
  Layers,
  Plus,
  Dumbbell,
  Sparkles,
  ChevronRight,
  Bookmark,
  Calendar,
} from 'lucide-react';
import { WorkoutSession, WorkoutTemplate } from '../../../types';
import { DEFAULT_PRESET_TEMPLATES } from '../../../data/defaultTemplates';

interface WorkoutSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartWorkout: (session: WorkoutSession) => void;
  templates: WorkoutTemplate[];
}

export const WorkoutSetupModal: React.FC<WorkoutSetupModalProps> = ({
  isOpen,
  onClose,
  onStartWorkout,
  templates,
}) => {
  const [selectedTab, setSelectedTab] = useState<'presets' | 'saved' | 'custom'>('presets');
  const [customTitle, setCustomTitle] = useState('');
  const [customCategory, setCustomCategory] = useState<WorkoutSession['category']>('Custom');

  if (!isOpen) return null;

  const todayStr = new Date().toISOString().split('T')[0];

  const handleStartQuick = () => {
    const session: WorkoutSession = {
      id: 'active-' + Date.now(),
      title: 'Quick Workout',
      category: 'Custom',
      date: todayStr,
      durationMinutes: 0,
      startedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      exercises: [
        {
          id: 'ex-1',
          name: 'Bench Press',
          category: 'strength',
          muscleGroup: 'Chest',
          equipment: 'Barbell',
          sets: [
            { setNumber: 1, reps: 10, weightKg: 40, completed: false },
            { setNumber: 2, reps: 10, weightKg: 40, completed: false },
            { setNumber: 3, reps: 8, weightKg: 40, completed: false },
          ],
        },
      ],
      completed: false,
    };
    onStartWorkout(session);
    onClose();
  };

  const handleStartTemplate = (template: WorkoutTemplate) => {
    const session: WorkoutSession = {
      id: 'active-' + Date.now(),
      title: template.title,
      category: template.category,
      date: todayStr,
      durationMinutes: 0,
      startedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      exercises: template.exercises.map((ex, idx) => ({
        id: `ex-${idx + 1}-${Date.now()}`,
        name: ex.name,
        category: ex.category,
        muscleGroup: ex.muscleGroup,
        equipment: ex.equipment,
        sets: Array.from({ length: ex.defaultSets || 3 }).map((_, sIdx) => ({
          setNumber: sIdx + 1,
          reps: ex.defaultReps || 10,
          weightKg: ex.defaultWeightKg || 20,
          completed: false,
        })),
      })),
      completed: false,
      notes: template.notes || '',
    };
    onStartWorkout(session);
    onClose();
  };

  const handleStartCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const title = customTitle.trim() || 'Custom Session';
    const session: WorkoutSession = {
      id: 'active-' + Date.now(),
      title,
      category: customCategory,
      date: todayStr,
      durationMinutes: 0,
      startedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      exercises: [
        {
          id: 'ex-1',
          name: 'Squat',
          category: 'strength',
          muscleGroup: 'Legs',
          equipment: 'Barbell',
          sets: [
            { setNumber: 1, reps: 10, weightKg: 30, completed: false },
            { setNumber: 2, reps: 10, weightKg: 30, completed: false },
          ],
        },
      ],
      completed: false,
    };
    onStartWorkout(session);
    onClose();
  };

  const userSavedTemplates = templates.filter((t) => !t.id.startsWith('tpl-'));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
              <Dumbbell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Start Workout</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Choose a structured routine or start a quick session
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Workout Banner */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-indigo-50 via-purple-50 to-emerald-50 dark:from-indigo-950/40 dark:via-purple-950/20 dark:to-slate-900 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                <Zap className="w-3.5 h-3.5" />
                <span>Instant Launch</span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Quick Workout</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Jump right in and add exercises as you train.
              </p>
            </div>
            <button
              onClick={handleStartQuick}
              className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer shrink-0"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Start Quick Session</span>
            </button>
          </div>
        </div>

        {/* Tabs: Presets / Saved / Custom */}
        <div className="flex items-center gap-2 px-6 pt-4 border-b border-slate-100 dark:border-slate-800">
          <button
            onClick={() => setSelectedTab('presets')}
            className={`pb-3 text-xs font-bold transition-colors relative cursor-pointer ${
              selectedTab === 'presets'
                ? 'text-indigo-600 dark:text-indigo-400'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
            }`}
          >
            Preset Routines ({DEFAULT_PRESET_TEMPLATES.length})
            {selectedTab === 'presets' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-full" />
            )}
          </button>

          <button
            onClick={() => setSelectedTab('saved')}
            className={`pb-3 text-xs font-bold transition-colors relative cursor-pointer ${
              selectedTab === 'saved'
                ? 'text-indigo-600 dark:text-indigo-400'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
            }`}
          >
            My Templates ({userSavedTemplates.length})
            {selectedTab === 'saved' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-full" />
            )}
          </button>

          <button
            onClick={() => setSelectedTab('custom')}
            className={`pb-3 text-xs font-bold transition-colors relative cursor-pointer ${
              selectedTab === 'custom'
                ? 'text-indigo-600 dark:text-indigo-400'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
            }`}
          >
            + Create Custom
            {selectedTab === 'custom' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-full" />
            )}
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* TAB 1: PRESET ROUTINES */}
          {selectedTab === 'presets' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {DEFAULT_PRESET_TEMPLATES.map((tpl) => (
                <div
                  key={tpl.id}
                  className="p-4.5 rounded-3xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/70 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300">
                        {tpl.category}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-400">
                        {tpl.exercises.length} exercises
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {tpl.title}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {tpl.notes}
                    </p>

                    {/* Preview exercises */}
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {tpl.exercises.slice(0, 4).map((ex, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-lg text-[10px] font-medium bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60"
                        >
                          {ex.name}
                        </span>
                      ))}
                      {tpl.exercises.length > 4 && (
                        <span className="px-1.5 py-0.5 text-[10px] text-slate-400">
                          +{tpl.exercises.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleStartTemplate(tpl)}
                    className="mt-4 w-full py-2.5 rounded-2xl bg-white dark:bg-slate-800 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 dark:hover:text-white border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-98 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Start {tpl.title}</span>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* TAB 2: SAVED CUSTOM TEMPLATES */}
          {selectedTab === 'saved' && (
            <div>
              {userSavedTemplates.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 mx-auto flex items-center justify-center">
                    <Bookmark className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    No custom templates saved yet
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                    You can save any active workout as a reusable template during or after your training.
                  </p>
                  <button
                    onClick={() => setSelectedTab('custom')}
                    className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-xs"
                  >
                    Create a Template
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {userSavedTemplates.map((tpl) => (
                    <div
                      key={tpl.id}
                      className="p-4.5 rounded-3xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/70 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300">
                            Custom Template
                          </span>
                          <span className="text-[11px] font-semibold text-slate-400">
                            {tpl.exercises.length} exercises
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          {tpl.title}
                        </h4>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {tpl.exercises.map((ex, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded-lg text-[10px] font-medium bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60"
                            >
                              {ex.name}
                            </span>
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={() => handleStartTemplate(tpl)}
                        className="mt-4 w-full py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs"
                      >
                        <Play className="w-3.5 h-3.5 fill-white" />
                        <span>Start This Routine</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CREATE CUSTOM WORKOUT */}
          {selectedTab === 'custom' && (
            <form onSubmit={handleStartCustom} className="space-y-4 max-w-lg mx-auto py-2">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Workout Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Arms & Core Blast, Sunday Mobility"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Focus Category
                </label>
                <select
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value as any)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="Full Body">Full Body</option>
                  <option value="Upper Body">Upper Body</option>
                  <option value="Lower Body">Lower Body</option>
                  <option value="Push">Push</option>
                  <option value="Pull">Pull</option>
                  <option value="Legs">Legs</option>
                  <option value="Core & Cardio">Core & Cardio</option>
                  <option value="Mobility & Recovery">Mobility & Recovery</option>
                  <option value="Custom">Custom</option>
                </select>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400">
                You can add any exercises from the Exercise Library once the workout begins.
              </p>

              <button
                type="submit"
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-xs sm:text-sm shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer mt-4"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Launch Custom Workout</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
