import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  deleteDoc,
  query,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Habit, HabitFrequency } from '../types';

export function subscribeToUserHabits(
  uid: string,
  onData: (habits: Habit[]) => void,
  onError?: (err: Error) => void
) {
  const colRef = collection(db, 'users', uid, 'habits');
  const q = query(colRef);

  return onSnapshot(
    q,
    (snap) => {
      const list: Habit[] = [];
      snap.forEach((docSnap) => {
        const d = docSnap.data();
        const completedDates: string[] = Array.isArray(d.completedDates)
          ? d.completedDates
          : [];

        // Calculate real current and best streak
        const { currentStreak, bestStreak, weeklyConsistency, monthlyConsistency } =
          calculateHabitStreaks(completedDates, d.bestStreak || 0);

        list.push({
          id: docSnap.id,
          userId: uid,
          name: d.name || 'Daily Habit',
          icon: d.icon || '✨',
          description: d.description || '',
          category: d.category || 'lifestyle',
          frequency: (d.frequency as HabitFrequency) || 'daily',
          reminderEnabled: Boolean(d.reminderEnabled),
          reminderTime: d.reminderTime || '09:00',
          streak: currentStreak,
          bestStreak: Math.max(bestStreak, d.bestStreak || 0),
          weeklyConsistency,
          monthlyConsistency,
          active: d.active ?? true,
          completedDates,
          createdAt: d.createdAt,
          updatedAt: d.updatedAt,
        });
      });
      onData(list);
    },
    (err) => {
      console.warn('Habits listener notice:', err);
      onError?.(err);
    }
  );
}

export async function createNewHabit(
  uid: string,
  habitData: {
    name: string;
    icon: string;
    description?: string;
    category?: Habit['category'];
    frequency?: HabitFrequency;
    reminderEnabled?: boolean;
    reminderTime?: string;
  }
): Promise<string> {
  const nameTrimmed = habitData.name?.trim();
  if (!nameTrimmed) {
    throw new Error('Habit name cannot be empty');
  }

  const id = 'habit-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
  const docRef = doc(db, 'users', uid, 'habits', id);

  const payload: Habit = {
    id,
    userId: uid,
    name: nameTrimmed,
    icon: habitData.icon || '✨',
    description: habitData.description?.trim() || '',
    category: habitData.category || 'lifestyle',
    frequency: habitData.frequency || 'daily',
    reminderEnabled: Boolean(habitData.reminderEnabled),
    reminderTime: habitData.reminderTime || '09:00',
    streak: 0,
    bestStreak: 0,
    active: true,
    completedDates: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await setDoc(docRef, payload);
  return id;
}

export async function toggleHabitCompletion(
  uid: string,
  habit: Habit,
  targetDate: string
): Promise<boolean> {
  const habitDocRef = doc(db, 'users', uid, 'habits', habit.id);
  const completionDocRef = doc(
    db,
    'users',
    uid,
    'habits',
    habit.id,
    'completions',
    targetDate
  );

  const isCurrentlyCompleted = habit.completedDates.includes(targetDate);
  const now = new Date().toISOString();

  let updatedDates: string[];
  if (isCurrentlyCompleted) {
    updatedDates = habit.completedDates.filter((d) => d !== targetDate);
    // Delete or mark completion document as false
    await setDoc(completionDocRef, {
      date: targetDate,
      completed: false,
      updatedAt: now,
    });
  } else {
    updatedDates = [...habit.completedDates, targetDate];
    // Record explicit completion sub-document
    await setDoc(completionDocRef, {
      date: targetDate,
      completed: true,
      completedAt: now,
    });
  }

  const { currentStreak, bestStreak, weeklyConsistency, monthlyConsistency } =
    calculateHabitStreaks(updatedDates, habit.bestStreak);

  await setDoc(
    habitDocRef,
    {
      completedDates: updatedDates,
      streak: currentStreak,
      bestStreak: Math.max(habit.bestStreak, bestStreak),
      weeklyConsistency,
      monthlyConsistency,
      updatedAt: now,
    },
    { merge: true }
  );

  return !isCurrentlyCompleted;
}

export async function deleteUserHabit(uid: string, habitId: string): Promise<void> {
  const docRef = doc(db, 'users', uid, 'habits', habitId);
  await deleteDoc(docRef);
}

export async function updateUserHabit(
  uid: string,
  habitId: string,
  updates: Partial<Habit>
): Promise<void> {
  const docRef = doc(db, 'users', uid, 'habits', habitId);
  await setDoc(
    docRef,
    {
      ...updates,
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );
}

// ----------------------------------------------------
// STREAK & CONSISTENCY COMPUTATION (NON-SHAMING)
// ----------------------------------------------------
export function calculateHabitStreaks(
  completedDates: string[],
  previousBest: number = 0
): {
  currentStreak: number;
  bestStreak: number;
  weeklyConsistency: number;
  monthlyConsistency: number;
} {
  if (!completedDates || completedDates.length === 0) {
    return {
      currentStreak: 0,
      bestStreak: previousBest,
      weeklyConsistency: 0,
      monthlyConsistency: 0,
    };
  }

  const dateSet = new Set(completedDates);

  // 1. Calculate Current Streak
  const today = new Date();
  const formatYMD = (d: Date) => d.toISOString().split('T')[0];

  const todayStr = formatYMD(today);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = formatYMD(yesterday);

  let currentStreak = 0;
  let checkDate = new Date(today);

  // If today is completed, start streak check from today; if not completed, check if yesterday was completed
  if (dateSet.has(todayStr)) {
    while (dateSet.has(formatYMD(checkDate))) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }
  } else if (dateSet.has(yesterdayStr)) {
    checkDate = new Date(yesterday);
    while (dateSet.has(formatYMD(checkDate))) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }
  }

  // 2. Calculate Best All-Time Streak
  const sortedDates = Array.from(dateSet).sort();
  let maxStreak = 0;
  let running = 0;
  let prevTimestamp: number | null = null;

  for (const dStr of sortedDates) {
    const ts = new Date(dStr + 'T00:00:00Z').getTime();
    if (prevTimestamp === null) {
      running = 1;
    } else {
      const diffDays = Math.round((ts - prevTimestamp) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        running++;
      } else if (diffDays > 1) {
        running = 1;
      }
    }
    prevTimestamp = ts;
    if (running > maxStreak) maxStreak = running;
  }

  const finalBestStreak = Math.max(previousBest, maxStreak, currentStreak);

  // 3. Weekly Consistency (past 7 days)
  let past7Count = 0;
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    if (dateSet.has(formatYMD(d))) past7Count++;
  }
  const weeklyConsistency = Math.round((past7Count / 7) * 100);

  // 4. Monthly Consistency (past 30 days)
  let past30Count = 0;
  for (let i = 0; i < 30; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    if (dateSet.has(formatYMD(d))) past30Count++;
  }
  const monthlyConsistency = Math.round((past30Count / 30) * 100);

  return {
    currentStreak,
    bestStreak: finalBestStreak,
    weeklyConsistency,
    monthlyConsistency,
  };
}
