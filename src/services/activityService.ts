import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ActivityDay, ActivityLogEntry, ActivityType, DistanceUnit } from '../types';

export function subscribeToTodayActivity(
  uid: string,
  date: string,
  onData: (data: ActivityDay | null) => void,
  onError?: (err: Error) => void
) {
  const docRef = doc(db, 'users', uid, 'activity', date);
  return onSnapshot(
    docRef,
    (snap) => {
      if (snap.exists()) {
        const d = snap.data();
        onData({
          id: snap.id,
          date: d.date || date,
          steps: d.steps || 0,
          distanceKm: d.distanceKm || 0,
          activeMinutes: d.activeMinutes || 0,
          approxCalories: d.approxCalories || 0,
          logs: d.logs || [],
        });
      } else {
        onData(null);
      }
    },
    (err) => {
      console.warn('Activity listener notice:', err);
      onError?.(err);
    }
  );
}

export function subscribeToActivityHistory(
  uid: string,
  limitDays: number = 90,
  onData: (days: ActivityDay[]) => void,
  onError?: (err: Error) => void
) {
  const activityColl = collection(db, 'users', uid, 'activity');
  const q = query(activityColl, orderBy('date', 'desc'), limit(limitDays));

  return onSnapshot(
    q,
    (snap) => {
      const items: ActivityDay[] = snap.docs.map((docSnap) => {
        const d = docSnap.data();
        return {
          id: docSnap.id,
          date: d.date || docSnap.id,
          steps: Number(d.steps || 0),
          distanceKm: Number(d.distanceKm || 0),
          activeMinutes: Number(d.activeMinutes || 0),
          approxCalories: Number(d.approxCalories || 0),
          logs: d.logs || [],
        };
      });
      onData(items);
    },
    (err) => {
      console.warn('Activity history listener notice:', err);
      onError?.(err);
    }
  );
}

export async function logActivityEntry(
  uid: string,
  entry: {
    steps: number;
    distance?: number;
    distanceUnit?: DistanceUnit;
    activeMinutes?: number;
    activityType: ActivityType;
    date: string;
    timestamp?: string;
  },
  currentDay: ActivityDay | null
): Promise<void> {
  const validSteps = Math.max(0, Math.round(Number(entry.steps) || 0));
  const validMinutes = Math.max(0, Math.round(Number(entry.activeMinutes) || 0));
  const validDistInput = Math.max(0, Number(entry.distance) || 0);
  const unit = entry.distanceUnit || 'km';

  // If distance was not provided or 0, estimate from steps (avg step ~ 0.75m)
  const distKm =
    validDistInput > 0
      ? unit === 'mi'
        ? Number((validDistInput * 1.60934).toFixed(2))
        : Number(validDistInput.toFixed(2))
      : Number(((validSteps * 0.75) / 1000).toFixed(2));

  // Transparent approx calories calculation (estimate ~ 0.04 - 0.05 kcal per step/pace)
  const approxCal = Math.round(validSteps * 0.045 + validMinutes * 4);
  const timeStr =
    entry.timestamp ||
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const newLog: ActivityLogEntry = {
    id: 'act-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    activityType: entry.activityType || 'walking',
    steps: validSteps,
    distance: unit === 'mi' ? Number((distKm / 1.60934).toFixed(2)) : distKm,
    distanceUnit: unit,
    activeMinutes: validMinutes || Math.round(validSteps / 100),
    timestamp: timeStr,
    date: entry.date,
    createdAt: new Date().toISOString(),
  };

  const existingSteps = currentDay?.steps || 0;
  const existingDistKm = currentDay?.distanceKm || 0;
  const existingMinutes = currentDay?.activeMinutes || 0;
  const existingCalories = currentDay?.approxCalories || 0;
  const existingLogs = currentDay?.logs || [];

  const docRef = doc(db, 'users', uid, 'activity', entry.date);

  const payload: ActivityDay & { userId: string; updatedAt: string } = {
    id: entry.date,
    userId: uid,
    date: entry.date,
    steps: existingSteps + validSteps,
    distanceKm: Number((existingDistKm + distKm).toFixed(2)),
    activeMinutes: existingMinutes + (validMinutes || Math.round(validSteps / 100)),
    approxCalories: existingCalories + approxCal,
    logs: [newLog, ...existingLogs],
    updatedAt: new Date().toISOString(),
  };

  await setDoc(docRef, payload, { merge: true });
}

// Backward compatibility helper
export async function addActivityData(
  uid: string,
  date: string,
  stepsToAdd: number,
  durationMinutes: number = Math.round(stepsToAdd / 100),
  type: string = 'walk',
  currentActivity: ActivityDay | null = null
): Promise<void> {
  const mappedType: ActivityType =
    type === 'run' ? 'running' : type === 'cycling' ? 'cycling' : 'walking';

  await logActivityEntry(
    uid,
    {
      steps: stepsToAdd,
      activeMinutes: durationMinutes,
      activityType: mappedType,
      date,
      distanceUnit: 'km',
    },
    currentActivity
  );
}
