import React, { useState, useMemo } from 'react';
import {
  X,
  Search,
  Dumbbell,
  Plus,
  Info,
  ChevronRight,
  Sparkles,
  Layers,
  Check,
} from 'lucide-react';
import { EXERCISE_LIBRARY } from '../../../data/exerciseLibrary';
import { ExerciseDefinition, MuscleGroup, ExerciseEquipment, Exercise } from '../../../types';

interface ExerciseLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectExercise: (exercise: ExerciseDefinition) => void;
  alreadySelectedIds?: string[];
}

const MUSCLE_GROUPS: (MuscleGroup | 'All')[] = [
  'All',
  'Chest',
  'Back',
  'Shoulders',
  'Arms',
  'Legs',
  'Core',
  'Cardio & Mobility',
];

const EQUIPMENT_LIST: (ExerciseEquipment | 'All')[] = [
  'All',
  'Barbell',
  'Dumbbell',
  'Cable',
  'Machine',
  'Bodyweight',
];

export const ExerciseLibraryModal: React.FC<ExerciseLibraryModalProps> = ({
  isOpen,
  onClose,
  onSelectExercise,
  alreadySelectedIds = [],
}) => {
  const [search, setSearch] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleGroup | 'All'>('All');
  const [selectedEquipment, setSelectedEquipment] = useState<ExerciseEquipment | 'All'>('All');
  const [inspectingExercise, setInspectingExercise] = useState<ExerciseDefinition | null>(null);

  const filteredExercises = useMemo(() => {
    return EXERCISE_LIBRARY.filter((ex) => {
      const matchSearch =
        ex.name.toLowerCase().includes(search.toLowerCase()) ||
        ex.muscleGroup.toLowerCase().includes(search.toLowerCase()) ||
        (ex.secondaryMuscles && ex.secondaryMuscles.some((m) => m.toLowerCase().includes(search.toLowerCase())));
      const matchMuscle = selectedMuscle === 'All' || ex.muscleGroup === selectedMuscle;
      const matchEquipment = selectedEquipment === 'All' || ex.equipment === selectedEquipment;
      return matchSearch && matchMuscle && matchEquipment;
    });
  }, [search, selectedMuscle, selectedEquipment]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <Dumbbell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Exercise Library</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Browse movements, technique instructions, and add to routine
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

        {/* Search & Filters */}
        <div className="p-4 space-y-3 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search exercise by name or muscle (e.g. Bench Press, Quads)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          {/* Muscle Group Pill Selector */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {MUSCLE_GROUPS.map((mg) => (
              <button
                key={mg}
                onClick={() => setSelectedMuscle(mg)}
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedMuscle === mg
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60'
                }`}
              >
                {mg}
              </button>
            ))}
          </div>

          {/* Equipment Selector */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
            <span className="text-slate-400 font-medium shrink-0">Equipment:</span>
            {EQUIPMENT_LIST.map((eq) => (
              <button
                key={eq}
                onClick={() => setSelectedEquipment(eq)}
                className={`px-2.5 py-0.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  selectedEquipment === eq
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                }`}
              >
                {eq}
              </button>
            ))}
          </div>
        </div>

        {/* Exercises List */}
        <div className="flex-1 overflow-y-auto p-4 divide-y divide-slate-100 dark:divide-slate-800/60">
          {filteredExercises.length === 0 ? (
            <div className="text-center py-12 space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
                <Search className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No exercises found</p>
              <p className="text-xs text-slate-400">Try adjusting your search query or filters.</p>
            </div>
          ) : (
            filteredExercises.map((ex) => {
              const isSelected = alreadySelectedIds.includes(ex.name);
              return (
                <div
                  key={ex.id}
                  className="py-3 px-2 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-2xl transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {ex.name}
                      </h4>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {ex.equipment}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
                      <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{ex.muscleGroup}</span>
                      {ex.secondaryMuscles && ex.secondaryMuscles.length > 0 && (
                        <>
                          <span>•</span>
                          <span className="truncate">{ex.secondaryMuscles.join(', ')}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setInspectingExercise(ex)}
                      className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors"
                      title="View Instructions"
                    >
                      <Info className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => {
                        onSelectExercise(ex);
                        onClose();
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs active:scale-95'
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Added</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Exercise Detail Modal Overlay (Instructions) */}
        {inspectingExercise && (
          <div className="absolute inset-0 z-20 bg-white dark:bg-slate-900 flex flex-col p-6 overflow-y-auto animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                  {inspectingExercise.muscleGroup} • {inspectingExercise.difficulty}
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                  {inspectingExercise.name}
                </h3>
              </div>
              <button
                onClick={() => setInspectingExercise(null)}
                className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 py-4 text-xs sm:text-sm">
              <div>
                <h4 className="font-bold text-slate-700 dark:text-slate-300 mb-1">Equipment</h4>
                <p className="text-slate-600 dark:text-slate-400 font-medium">{inspectingExercise.equipment}</p>
              </div>

              <div>
                <h4 className="font-bold text-slate-700 dark:text-slate-300 mb-1">Description</h4>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
                  {inspectingExercise.description}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-700 dark:text-slate-300 mb-2">Step-by-Step Instructions</h4>
                <ol className="space-y-2">
                  {inspectingExercise.instructions.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-slate-600 dark:text-slate-400">
                      <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="leading-relaxed">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800 flex gap-3">
              <button
                onClick={() => setInspectingExercise(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs"
              >
                Back to Library
              </button>
              <button
                onClick={() => {
                  onSelectExercise(inspectingExercise);
                  setInspectingExercise(null);
                  onClose();
                }}
                className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md"
              >
                Add {inspectingExercise.name}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
