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
import {
  HydrationDay,
  HydrationEntry,
  HydrationNotificationSettings,
} from '../types';

export function subscribeToTodayHydration(
  uid: string,
  date: string,
  onData: (data: HydrationDay | null) => void,
  onError?: (err: Error) => void
) {
  const docRef = doc(db, 'users', uid, 'hydration', date);
  return onSnapshot(
    docRef,
    (snap) => {
      if (snap.exists()) {
        const d = snap.data();
        onData({
          id: snap.id,
          date: d.date || date,
          waterMl: Number(d.waterMl || 0),
          goalMl: Number(d.goalMl || 2500),
          entries: d.entries || [],
        });
      } else {
        onData(null);
      }
    },
    (err) => {
      console.warn('Hydration listener notice:', err);
      onError?.(err);
    }
  );
}

export function subscribeToHydrationHistory(
  uid: string,
  limitDays: number = 30,
  onData: (days: HydrationDay[]) => void,
  onError?: (err: Error) => void
) {
  const hydrationColl = collection(db, 'users', uid, 'hydration');
  const q = query(hydrationColl, orderBy('date', 'desc'), limit(limitDays));

  return onSnapshot(
    q,
    (snap) => {
      const items: HydrationDay[] = snap.docs.map((docSnap) => {
        const d = docSnap.data();
        return {
          id: docSnap.id,
          date: d.date || docSnap.id,
          waterMl: Number(d.waterMl || 0),
          goalMl: Number(d.goalMl || 2500),
          entries: d.entries || [],
        };
      });
      onData(items);
    },
    (err) => {
      console.warn('Hydration history listener notice:', err);
      onError?.(err);
    }
  );
}

export async function addHydrationEntry(
  uid: string,
  date: string,
  amountMl: number,
  currentDay: HydrationDay | null,
  userGoalMl: number = 2500
): Promise<void> {
  const validAmount = Math.max(10, Math.round(Number(amountMl) || 250));
  const docRef = doc(db, 'users', uid, 'hydration', date);
  const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const newEntry: HydrationEntry = {
    id: 'hyd-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    timestamp: timeStr,
    amountMl: validAmount,
    createdAt: new Date().toISOString(),
  };

  const currentWater = currentDay?.waterMl || 0;
  const currentEntries = currentDay?.entries || [];

  const updatedData = {
    id: date,
    userId: uid,
    date,
    waterMl: currentWater + validAmount,
    goalMl: currentDay?.goalMl || userGoalMl,
    entries: [newEntry, ...currentEntries],
    updatedAt: new Date().toISOString(),
  };

  await setDoc(docRef, updatedData, { merge: true });
}

// Backward compatibility alias
export const addWaterIntake = addHydrationEntry;

export async function updateHydrationEntry(
  uid: string,
  date: string,
  entryId: string,
  newAmountMl: number,
  currentDay: HydrationDay
): Promise<void> {
  const validAmount = Math.max(10, Math.round(Number(newAmountMl) || 250));
  const docRef = doc(db, 'users', uid, 'hydration', date);

  const updatedEntries = currentDay.entries.map((entry) =>
    entry.id === entryId ? { ...entry, amountMl: validAmount } : entry
  );

  const recalculatedTotal = updatedEntries.reduce((acc, e) => acc + e.amountMl, 0);

  await setDoc(
    docRef,
    {
      waterMl: recalculatedTotal,
      entries: updatedEntries,
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );
}

export async function deleteHydrationEntry(
  uid: string,
  date: string,
  entryId: string,
  currentDay: HydrationDay
): Promise<void> {
  const docRef = doc(db, 'users', uid, 'hydration', date);
  const updatedEntries = currentDay.entries.filter((entry) => entry.id !== entryId);
  const recalculatedTotal = updatedEntries.reduce((acc, e) => acc + e.amountMl, 0);

  await setDoc(
    docRef,
    {
      waterMl: recalculatedTotal,
      entries: updatedEntries,
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );
}

export async function setHydrationTarget(
  uid: string,
  date: string,
  newGoalMl: number
): Promise<void> {
  const validGoal = Math.max(500, Math.round(Number(newGoalMl) || 2500));
  const docRef = doc(db, 'users', uid, 'hydration', date);

  await setDoc(
    docRef,
    {
      goalMl: validGoal,
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );
}

// ----------------------------------------------------
// HYDRATION NOTIFICATION / REMINDER SETTINGS
// ----------------------------------------------------
export const DEFAULT_HYDRATION_SETTINGS: HydrationNotificationSettings = {
  enabled: false,
  intervalHours: 2,
  quietHoursStart: '22:00',
  quietHoursEnd: '07:00',
  soundEnabled: true,
};

export function subscribeToHydrationNotificationSettings(
  uid: string,
  onData: (settings: HydrationNotificationSettings) => void
) {
  const docRef = doc(db, 'users', uid, 'notificationSettings', 'hydration');
  return onSnapshot(docRef, (snap) => {
    if (snap.exists()) {
      const data = snap.data() as HydrationNotificationSettings;
      onData({
        enabled: Boolean(data.enabled),
        intervalHours: Number(data.intervalHours || 2),
        quietHoursStart: data.quietHoursStart || '22:00',
        quietHoursEnd: data.quietHoursEnd || '07:00',
        soundEnabled: data.soundEnabled !== false,
      });
    } else {
      onData(DEFAULT_HYDRATION_SETTINGS);
    }
  });
}

export async function saveHydrationNotificationSettings(
  uid: string,
  settings: Partial<HydrationNotificationSettings>
): Promise<void> {
  const docRef = doc(db, 'users', uid, 'notificationSettings', 'hydration');
  await setDoc(
    docRef,
    {
      ...settings,
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );
}
