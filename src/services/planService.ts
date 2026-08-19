import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  where,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { UserPersonalPlan, PlanPreferences, UserProfile, DayOfWeekKey } from '../types';

export async function requestAIPersonalPlan(
  preferences: PlanPreferences,
  profile: UserProfile
): Promise<UserPersonalPlan> {
  const response = await fetch('/api/gemini/generate-plan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ preferences, profile }),
  });

  if (!response.ok) {
    throw new Error(`AI Plan generation failed with status ${response.status}`);
  }

  const data = await response.json();
  if (!data.plan || !Array.isArray(data.plan.days) || data.plan.days.length !== 7) {
    throw new Error('Received invalid plan structure from server');
  }

  return data.plan;
}

export async function requestAIPlanAdaptation(
  currentPlan: UserPersonalPlan,
  missedDay: string,
  missedType: string,
  userNote?: string
): Promise<{ adjustmentMessage: string; tip: string; adaptedPlan: UserPersonalPlan }> {
  const response = await fetch('/api/gemini/adapt-plan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ currentPlan, missedDay, missedType, userNote }),
  });

  if (!response.ok) {
    throw new Error('Failed to adapt plan');
  }

  return await response.json();
}

export function subscribeToUserPlans(
  userId: string,
  onData: (plans: UserPersonalPlan[]) => void,
  onError?: (err: Error) => void
) {
  const plansRef = collection(db, 'users', userId, 'plans');
  return onSnapshot(
    plansRef,
    (snapshot) => {
      const plans: UserPersonalPlan[] = [];
      snapshot.forEach((docSnap) => {
        plans.push(docSnap.data() as UserPersonalPlan);
      });
      onData(plans);
    },
    (err) => {
      console.warn('Plans subscription warning:', err);
      onError?.(err);
    }
  );
}

export function subscribeToUserActivePlan(
  userId: string,
  onData: (plan: UserPersonalPlan | null) => void,
  onError?: (err: Error) => void
) {
  const plansRef = collection(db, 'users', userId, 'plans');
  const q = query(plansRef, where('status', '==', 'active'));

  return onSnapshot(
    q,
    (snapshot) => {
      if (!snapshot.empty) {
        // Return first active plan
        const docSnap = snapshot.docs[0];
        onData(docSnap.data() as UserPersonalPlan);
      } else {
        onData(null);
      }
    },
    (err) => {
      console.warn('Active plan subscription warning:', err);
      onError?.(err);
    }
  );
}

export async function saveUserPlan(userId: string, plan: UserPersonalPlan): Promise<void> {
  const planRef = doc(db, 'users', userId, 'plans', plan.id);
  const userRef = doc(db, 'users', userId);

  // Save the plan object
  await setDoc(planRef, {
    ...plan,
    userId,
    updatedAt: new Date().toISOString(),
  });

  // Update activePlanId on the user profile doc
  await updateDoc(userRef, {
    activePlanId: plan.id,
    onboardingCompleted: true,
    updatedAt: new Date().toISOString(),
  });
}

export async function updatePlanStatus(
  userId: string,
  planId: string,
  status: 'active' | 'paused' | 'completed'
): Promise<void> {
  const planRef = doc(db, 'users', userId, 'plans', planId);
  await updateDoc(planRef, {
    status,
    updatedAt: new Date().toISOString(),
  });
}

export async function togglePlanTaskInFirestore(
  userId: string,
  plan: UserPersonalPlan,
  dayOfWeek: DayOfWeekKey,
  taskId: string,
  isNowCompleted: boolean
): Promise<UserPersonalPlan> {
  const updatedDays = plan.days.map((d) => {
    if (d.dayOfWeek !== dayOfWeek) return d;

    const updatedTasks = d.tasks.map((t) => {
      if (t.id !== taskId) return t;
      return {
        ...t,
        completed: isNowCompleted,
        completedAt: isNowCompleted ? new Date().toISOString() : undefined,
      };
    });

    return {
      ...d,
      tasks: updatedTasks,
    };
  });

  const updatedPlan: UserPersonalPlan = {
    ...plan,
    days: updatedDays,
    updatedAt: new Date().toISOString(),
  };

  const planRef = doc(db, 'users', userId, 'plans', plan.id);
  await updateDoc(planRef, {
    days: updatedDays,
    updatedAt: updatedPlan.updatedAt,
  });

  return updatedPlan;
}

export async function deleteUserPlan(userId: string, planId: string): Promise<void> {
  const planRef = doc(db, 'users', userId, 'plans', planId);
  await deleteDoc(planRef);
}
