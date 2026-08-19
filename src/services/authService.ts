import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  User,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../lib/firebase';
import { UserProfile } from '../types';

export const INITIAL_USER_PREFERENCES: Omit<UserProfile, 'id' | 'name' | 'email' | 'avatar'> = {
  memberSince: new Date().getFullYear().toString(),
  interests: ['Strength & Tone', 'Mobility & Posture', 'Restful Sleep', 'Hydration Habit'],
  waterGoalMl: 2500,
  dailyStepGoal: 8000,
  sleepGoalHours: 8,
  weeklyWorkoutGoal: 3,
  theme: 'light',
  notificationsEnabled: true,
  notifications: {
    hydration: true,
    workout: true,
    habits: true,
    sleep: true,
  },
  isOnboarded: true,
};

export async function registerWithEmail(
  name: string,
  email: string,
  pass: string
): Promise<User> {
  const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
  const user = cred.user;

  if (name.trim()) {
    await updateProfile(user, { displayName: name.trim() });
  }

  // Create initial user document in Firestore
  const userRef = doc(db, 'users', user.uid);
  const newProfile = {
    userId: user.uid,
    displayName: name.trim() || user.displayName || 'FitFlow Member',
    email: user.email || '',
    photoURL: user.photoURL || '',
    waterGoalMl: 2500,
    dailyStepGoal: 8000,
    sleepGoalHours: 8,
    weeklyWorkoutGoal: 3,
    theme: 'light',
    notificationsEnabled: true,
    interests: ['Strength', 'Hydration', 'Sleep', 'Movement'],
    onboardingCompleted: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await setDoc(userRef, newProfile);
  return user;
}

export async function loginWithEmail(email: string, pass: string): Promise<User> {
  const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
  return cred.user;
}

export async function loginWithGoogle(): Promise<User> {
  const cred = await signInWithPopup(auth, googleProvider);
  const user = cred.user;

  // Check if profile exists, if not create it
  const userRef = doc(db, 'users', user.uid);
  const snapshot = await getDoc(userRef);

  if (!snapshot.exists()) {
    const newProfile = {
      userId: user.uid,
      displayName: user.displayName || 'FitFlow Member',
      email: user.email || '',
      photoURL: user.photoURL || '',
      waterGoalMl: 2500,
      dailyStepGoal: 8000,
      sleepGoalHours: 8,
      weeklyWorkoutGoal: 3,
      theme: 'light',
      notificationsEnabled: true,
      interests: ['Strength', 'Hydration', 'Sleep', 'Movement'],
      onboardingCompleted: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await setDoc(userRef, newProfile);
  } else {
    await updateDoc(userRef, {
      updatedAt: new Date().toISOString(),
    });
  }

  return user;
}

export async function resetUserPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email.trim());
}

export async function logoutUser(): Promise<void> {
  await signOut(auth);
}
