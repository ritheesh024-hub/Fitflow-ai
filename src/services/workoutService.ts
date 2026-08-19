import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { WorkoutSession, WorkoutTemplate, PersonalRecord } from '../types';
import { DEFAULT_PRESET_TEMPLATES } from '../data/defaultTemplates';

const ACTIVE_WORKOUT_STORAGE_KEY = 'fitflow_active_workout_state';

// ----------------------------------------------------
// LOCAL CACHING FOR ACTIVE WORKOUTS (OFFLINE-RESILIENT)
// ----------------------------------------------------
export const saveActiveWorkoutLocally = (workout: WorkoutSession | null) => {
  try {
    if (!workout) {
      localStorage.removeItem(ACTIVE_WORKOUT_STORAGE_KEY);
    } else {
      localStorage.setItem(ACTIVE_WORKOUT_STORAGE_KEY, JSON.stringify(workout));
    }
  } catch (e) {
    console.error('Error caching active workout locally:', e);
  }
};

export const loadActiveWorkoutLocally = (): WorkoutSession | null => {
  try {
    const raw = localStorage.getItem(ACTIVE_WORKOUT_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as WorkoutSession;
  } catch (e) {
    console.error('Error loading cached active workout:', e);
    return null;
  }
};

export const clearActiveWorkoutLocally = () => {
  try {
    localStorage.removeItem(ACTIVE_WORKOUT_STORAGE_KEY);
  } catch (e) {
    console.error('Error clearing cached active workout:', e);
  }
};

// ----------------------------------------------------
// FIRESTORE WORKOUTS SUBSCRIPTION & CRUD
// ----------------------------------------------------

export const subscribeToUserWorkouts = (
  userId: string,
  onUpdate: (workouts: WorkoutSession[]) => void
) => {
  if (!userId) {
    onUpdate([]);
    return () => {};
  }

  const workoutsRef = collection(db, 'users', userId, 'workouts');
  const q = query(workoutsRef, orderBy('date', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const workouts: WorkoutSession[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        workouts.push({
          id: docSnap.id,
          title: data.title || 'Workout Session',
          category: data.category || 'Custom',
          date: data.date || new Date().toISOString().split('T')[0],
          durationMinutes: data.durationMinutes || 0,
          exercises: data.exercises || [],
          notes: data.notes || '',
          completed: data.completed ?? true,
          completedAt: data.completedAt || '',
          startedAt: data.startedAt || '',
          createdAt: data.createdAt ? data.createdAt.toString() : '',
          updatedAt: data.updatedAt ? data.updatedAt.toString() : '',
        });
      });
      onUpdate(workouts);
    },
    (error) => {
      console.error('Error listening to user workouts:', error);
      onUpdate([]);
    }
  );
};

export const saveUserWorkout = async (
  userId: string,
  workout: Omit<WorkoutSession, 'id'> & { id?: string }
): Promise<string> => {
  if (!userId) throw new Error('User must be authenticated to save workouts');

  const workoutId = workout.id && !workout.id.startsWith('active-')
    ? workout.id
    : 'wo_' + Date.now().toString() + '_' + Math.random().toString(36).substring(2, 7);

  const docRef = doc(db, 'users', userId, 'workouts', workoutId);

  const cleanData = {
    id: workoutId,
    userId,
    title: workout.title,
    category: workout.category || 'Custom',
    date: workout.date || new Date().toISOString().split('T')[0],
    durationMinutes: Number(workout.durationMinutes) || 0,
    exercises: (workout.exercises || []).map((ex) => ({
      id: ex.id || 'ex_' + Math.random().toString(36).substring(2, 7),
      name: ex.name,
      category: ex.category || 'strength',
      muscleGroup: ex.muscleGroup || '',
      equipment: ex.equipment || '',
      targetMuscle: ex.targetMuscle || '',
      notes: ex.notes || '',
      sets: (ex.sets || []).map((s, idx) => ({
        setNumber: s.setNumber || idx + 1,
        reps: Number(s.reps) || 0,
        weightKg: Number(s.weightKg) || 0,
        weightUnit: s.weightUnit || 'kg',
        durationSeconds: Number(s.durationSeconds) || 0,
        notes: s.notes || '',
        completed: Boolean(s.completed),
        completedAt: s.completedAt || '',
      })),
    })),
    notes: workout.notes || '',
    completed: workout.completed ?? true,
    completedAt: workout.completedAt || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    startedAt: workout.startedAt || '',
    updatedAt: new Date().toISOString(),
  };

  await setDoc(docRef, cleanData, { merge: true });
  clearActiveWorkoutLocally();
  return workoutId;
};

export const deleteUserWorkout = async (userId: string, workoutId: string) => {
  if (!userId || !workoutId) return;
  const docRef = doc(db, 'users', userId, 'workouts', workoutId);
  await deleteDoc(docRef);
};

// ----------------------------------------------------
// FIRESTORE WORKOUT TEMPLATES
// ----------------------------------------------------

export const subscribeToWorkoutTemplates = (
  userId: string,
  onUpdate: (templates: WorkoutTemplate[]) => void
) => {
  if (!userId) {
    onUpdate(DEFAULT_PRESET_TEMPLATES);
    return () => {};
  }

  const templatesRef = collection(db, 'users', userId, 'workoutTemplates');
  return onSnapshot(
    templatesRef,
    (snapshot) => {
      const userTemplates: WorkoutTemplate[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        userTemplates.push({
          id: docSnap.id,
          userId,
          title: data.title || 'Custom Template',
          category: data.category || 'Custom',
          notes: data.notes || '',
          exercises: data.exercises || [],
          createdAt: data.createdAt || '',
        });
      });

      // Merge user custom templates with the built-in preset routines
      const combined = [...DEFAULT_PRESET_TEMPLATES, ...userTemplates];
      onUpdate(combined);
    },
    (error) => {
      console.error('Error listening to templates:', error);
      onUpdate(DEFAULT_PRESET_TEMPLATES);
    }
  );
};

export const saveWorkoutTemplate = async (
  userId: string,
  template: Omit<WorkoutTemplate, 'id'> & { id?: string }
): Promise<string> => {
  if (!userId) throw new Error('User must be authenticated to save templates');

  const templateId = template.id || 'tpl_' + Date.now().toString();
  const docRef = doc(db, 'users', userId, 'workoutTemplates', templateId);

  const cleanData = {
    id: templateId,
    userId,
    title: template.title,
    category: template.category || 'Custom',
    notes: template.notes || '',
    exercises: template.exercises || [],
    createdAt: new Date().toISOString(),
  };

  await setDoc(docRef, cleanData, { merge: true });
  return templateId;
};

export const deleteWorkoutTemplate = async (userId: string, templateId: string) => {
  if (!userId || !templateId) return;
  // Protect built-in presets
  if (templateId.startsWith('tpl-')) return;
  const docRef = doc(db, 'users', userId, 'workoutTemplates', templateId);
  await deleteDoc(docRef);
};

// ----------------------------------------------------
// PERSONAL RECORDS (PR) DETECTION ENGINE
// ----------------------------------------------------

export const calculatePersonalRecords = (workouts: WorkoutSession[]): PersonalRecord[] => {
  const prMap = new Map<string, PersonalRecord>();

  // Sort workouts chronologically
  const sorted = [...workouts]
    .filter((w) => w.completed)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  for (const w of sorted) {
    for (const ex of w.exercises) {
      const exName = ex.name.trim();

      // Heaviest weight
      const completedSets = ex.sets.filter((s) => s.completed);
      for (const s of completedSets) {
        const weight = s.weightKg || 0;
        if (weight > 0) {
          const key = `${exName}__weight`;
          const existing = prMap.get(key);
          if (!existing || weight > existing.value) {
            prMap.set(key, {
              id: key,
              exerciseName: exName,
              metricType: 'heaviest_weight',
              value: weight,
              unit: s.weightUnit || 'kg',
              date: w.date,
              workoutTitle: w.title,
            });
          }
        }

        // Most reps in a single set
        const reps = s.reps || 0;
        if (reps > 0) {
          const key = `${exName}__reps`;
          const existing = prMap.get(key);
          if (!existing || reps > existing.value) {
            prMap.set(key, {
              id: key,
              exerciseName: exName,
              metricType: 'most_reps',
              value: reps,
              unit: 'reps',
              date: w.date,
              workoutTitle: w.title,
            });
          }
        }
      }
    }
  }

  // Longest workout duration
  let longestDuration = 0;
  let longestWorkout: WorkoutSession | null = null;
  for (const w of sorted) {
    if (w.durationMinutes > longestDuration) {
      longestDuration = w.durationMinutes;
      longestWorkout = w;
    }
  }

  const results = Array.from(prMap.values());
  if (longestWorkout && longestDuration > 0) {
    results.unshift({
      id: 'longest_workout',
      exerciseName: 'Full Training Session',
      metricType: 'longest_duration',
      value: longestDuration,
      unit: 'mins',
      date: longestWorkout.date,
      workoutTitle: longestWorkout.title,
    });
  }

  return results;
};

export const checkForNewPRs = (
  newWorkout: WorkoutSession,
  allWorkouts: WorkoutSession[]
): PersonalRecord[] => {
  const previousWorkouts = allWorkouts.filter((w) => w.id !== newWorkout.id && w.completed);
  const previousPRs = calculatePersonalRecords(previousWorkouts);

  const prevMap = new Map<string, number>();
  for (const pr of previousPRs) {
    prevMap.set(`${pr.exerciseName}__${pr.metricType}`, pr.value);
  }

  const newPRs: PersonalRecord[] = [];

  for (const ex of newWorkout.exercises) {
    for (const s of ex.sets) {
      if (!s.completed) continue;
      const weight = s.weightKg || 0;
      if (weight > 0) {
        const key = `${ex.name.trim()}__heaviest_weight`;
        const prevBest = prevMap.get(key) || 0;
        if (weight > prevBest && !newPRs.some((p) => p.id === key)) {
          newPRs.push({
            id: key,
            exerciseName: ex.name,
            metricType: 'heaviest_weight',
            value: weight,
            unit: s.weightUnit || 'kg',
            date: newWorkout.date,
            workoutTitle: newWorkout.title,
          });
          prevMap.set(key, weight); // update running best
        }
      }
    }
  }

  return newPRs;
};
