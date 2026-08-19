import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { SleepRecord } from '../types';

export function subscribeToTodaySleep(
  uid: string,
  date: string,
  onData: (data: SleepRecord | null) => void,
  onError?: (err: Error) => void
) {
  const docRef = doc(db, 'users', uid, 'sleep', date);
  return onSnapshot(
    docRef,
    (snap) => {
      if (snap.exists()) {
        const d = snap.data();
        onData({
          id: snap.id,
          date: d.date || date,
          durationMinutes: d.durationMinutes || 480,
          bedtime: d.bedtime || '23:00',
          wakeTime: d.wakeTime || '07:00',
          energyLevel: d.energyLevel || 4,
          recoveryRating: d.recoveryRating || 'Good Recovery',
          notes: d.notes || '',
        });
      } else {
        onData(null);
      }
    },
    (err) => {
      console.warn('Sleep listener notice:', err);
      onError?.(err);
    }
  );
}

export async function saveSleepRecord(
  uid: string,
  date: string,
  sleep: Omit<SleepRecord, 'id' | 'date'>
): Promise<void> {
  const docRef = doc(db, 'users', uid, 'sleep', date);
  const payload = {
    id: date,
    userId: uid,
    date,
    durationMinutes: sleep.durationMinutes,
    bedtime: sleep.bedtime,
    wakeTime: sleep.wakeTime,
    energyLevel: sleep.energyLevel,
    recoveryRating: sleep.recoveryRating,
    notes: sleep.notes || '',
    updatedAt: new Date().toISOString(),
  };

  await setDoc(docRef, payload, { merge: true });
}
