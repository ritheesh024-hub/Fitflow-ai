import React, { useState } from 'react';
import {
  Bookmark,
  Plus,
  Play,
  Trash2,
  Dumbbell,
  Layers,
  Sparkles,
  Search,
} from 'lucide-react';
import { WorkoutTemplate, WorkoutSession, ExerciseDefinition } from '../../../types';
import { ExerciseLibraryModal } from './ExerciseLibraryModal';

interface WorkoutTemplatesViewProps {
  templates: WorkoutTemplate[];
  onStartTemplate: (template: WorkoutTemplate) => void;
  onCreateTemplate: (template: Omit<WorkoutTemplate, 'id'>) => Promise<void>;
  onDeleteTemplate: (templateId: string) => Promise<void>;
}

export const WorkoutTemplatesView: React.FC<WorkoutTemplatesViewProps> = ({
  templates,
  onStartTemplate,
  onCreateTemplate,
  onDeleteTemplate,
}) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<WorkoutSession['category']>('Full Body');
  const [newNotes, setNewNotes] = useState('');
  const [selectedExercises, setSelectedExercises] = useState<{
    name: string;
    category: any;
    muscleGroup: string;
    equipment: string;
    defaultSets: number;
    defaultReps: number;
    defaultWeightKg: number;
  }[]>([]);

  const [isLibraryOpen, setIsLibraryOpen] = useState(false);

  const handleAddExerciseToTemplate = (exDef: ExerciseDefinition) => {
    setSelectedExercises((prev) => [
      ...prev,
      {
        name: exDef.name,
        category: exDef.category,
        muscleGroup: exDef.muscleGroup,
        equipment: exDef.equipment,
        defaultSets: 3,
        defaultReps: 10,
        defaultWeightKg: 20,
      },
    ]);
  };

  const handleRemoveExerciseFromTemplate = (idx: number) => {
    setSelectedExercises((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSaveNewTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    await onCreateTemplate({
      title: newTitle.trim(),
      category: newCategory,
      notes: newNotes,
      exercises: selectedExercises.length > 0 ? selectedExercises : [
        {
          name: 'Bench Press',
          category: 'strength',
          muscleGroup: 'Chest',
          equipment: 'Barbell',
          defaultSets: 3,
          defaultReps: 10,
          defaultWeightKg: 40,
        },
      ],
    });

    setIsCreateModalOpen(false);
    setNewTitle('');
    setNewNotes('');
    setSelectedExercises([]);
  };

  return (
    <div className="space-y-6">
      {/* Header with + Create Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Workout Routines & Templates
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Save your favorite routines and launch them in one tap
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 flex items-center gap-2 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create Custom Routine</span>
        </button>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((tpl) => {
          const isPreset = tpl.id.startsWith('tpl-');

          return (
            <div
              key={tpl.id}
              className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-700/60 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300">
                    {tpl.category}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-semibold text-slate-400">
                      {tpl.exercises.length} exercises
                    </span>
                    {!isPreset && (
                      <button
                        onClick={() => {
                          if (window.confirm(`Delete custom template "${tpl.title}"?`)) {
                            onDeleteTemplate(tpl.id);
                          }
                        }}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-500 transition-colors"
                        title="Delete Template"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  {tpl.title}
                </h4>

                {tpl.notes && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {tpl.notes}
                  </p>
                )}

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {tpl.exercises.slice(0, 5).map((ex, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-lg text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                    >
                      {ex.name}
                    </span>
                  ))}
                  {tpl.exercises.length > 5 && (
                    <span className="px-1.5 py-0.5 text-[10px] text-slate-400 font-medium">
                      +{tpl.exercises.length - 5}
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={() => onStartTemplate(tpl)}
                className="mt-5 w-full py-2.5 rounded-2xl bg-slate-100 hover:bg-indigo-600 hover:text-white dark:bg-slate-800 dark:hover:bg-indigo-600 dark:hover:text-white text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Start Routine</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Create Custom Template Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            className="relative w-full max-w-lg max-h-[90vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white">Create Custom Routine</h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveNewTemplate} className="p-5 overflow-y-auto space-y-4 flex-1">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Routine Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Legs & Core Focus"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none"
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

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Exercises ({selectedExercises.length})
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsLibraryOpen(true)}
                    className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Exercise</span>
                  </button>
                </div>

                {selectedExercises.length === 0 ? (
                  <div className="p-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-center text-xs text-slate-400">
                    No exercises added yet. Click "+ Add Exercise" to choose from the library.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {selectedExercises.map((ex, i) => (
                      <div
                        key={i}
                        className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-between text-xs"
                      >
                        <span className="font-bold text-slate-800 dark:text-slate-200">{ex.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400">{ex.defaultSets} sets × {ex.defaultReps} reps</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveExerciseFromTemplate(i)}
                            className="text-slate-400 hover:text-rose-500"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Notes (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="Target warmups or guidance..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md"
                >
                  Save Routine
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Library Picker */}
      <ExerciseLibraryModal
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        onSelectExercise={handleAddExerciseToTemplate}
        alreadySelectedIds={selectedExercises.map((e) => e.name)}
      />
    </div>
  );
};
