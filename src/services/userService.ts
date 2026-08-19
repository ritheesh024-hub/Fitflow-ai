import { doc, getDoc, setDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { UserProfile } from '../types';

export function subscribeToUserProfile(
  uid: string,
  onData: (profile: UserProfile | null) => void,
  onError?: (err: Error) => void
) {
  const userRef = doc(db, 'users', uid);
  return onSnapshot(
    userRef,
    (snap) => {
      if (snap.exists()) {
        const d = snap.data();
        const profile: UserProfile = {
          id: uid,
          name: d.displayName || d.name || 'FitFlow Member',
          email: d.email || '',
          avatar: d.photoURL || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
          memberSince: d.createdAt ? new Date(d.createdAt).getFullYear().toString() : '2026',
          interests: d.interests || ['Strength & Tone', 'Mobility & Posture', 'Restful Sleep', 'Hydration Habit'],
          waterGoalMl: d.waterGoalMl || 2500,
          dailyStepGoal: d.dailyStepGoal || 8000,
          sleepGoalHours: d.sleepGoalHours || 8,
          weeklyWorkoutGoal: d.weeklyWorkoutGoal || 3,
          theme: d.theme || 'light',
          notificationsEnabled: d.notificationsEnabled ?? true,
          notifications: d.notifications || {
            hydration: true,
            workout: true,
            habits: true,
            sleep: true,
          },
          isOnboarded: d.onboardingCompleted ?? true,
        };
        onData(profile);
      } else {
        onData(null);
      }
    },
    (err) => {
      console.warn('User profile listener error:', err);
      onError?.(err);
    }
  );
}

export async function updateUserProfile(uid: string, updates: Partial<UserProfile>): Promise<void> {
  const userRef = doc(db, 'users', uid);
  const dataToUpdate: Record<string, any> = {
    updatedAt: new Date().toISOString(),
  };

  if (updates.name !== undefined) dataToUpdate.displayName = updates.name;
  if (updates.avatar !== undefined) dataToUpdate.photoURL = updates.avatar;
  if (updates.waterGoalMl !== undefined) dataToUpdate.waterGoalMl = updates.waterGoalMl;
  if (updates.dailyStepGoal !== undefined) dataToUpdate.dailyStepGoal = updates.dailyStepGoal;
  if (updates.sleepGoalHours !== undefined) dataToUpdate.sleepGoalHours = updates.sleepGoalHours;
  if (updates.weeklyWorkoutGoal !== undefined) dataToUpdate.weeklyWorkoutGoal = updates.weeklyWorkoutGoal;
  if (updates.theme !== undefined) dataToUpdate.theme = updates.theme;
  if (updates.notificationsEnabled !== undefined) dataToUpdate.notificationsEnabled = updates.notificationsEnabled;
  if (updates.interests !== undefined) dataToUpdate.interests = updates.interests;
  if (updates.isOnboarded !== undefined) dataToUpdate.onboardingCompleted = updates.isOnboarded;

  await updateDoc(userRef, dataToUpdate);
}
