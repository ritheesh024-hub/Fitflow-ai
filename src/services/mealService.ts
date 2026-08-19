import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  limit,
  orderBy,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { MealItem } from '../types';

export function subscribeToMeals(
  uid: string,
  onData: (meals: MealItem[]) => void,
  onError?: (err: Error) => void
) {
  const colRef = collection(db, 'users', uid, 'meals');
  // Order by createdAt or date
  const q = query(colRef, limit(200));

  return onSnapshot(
    q,
    (snap) => {
      const list: MealItem[] = [];
      snap.forEach((docSnap) => {
        const d = docSnap.data();
        list.push({
          id: docSnap.id,
          userId: d.userId || uid,
          date: d.date || new Date().toISOString().split('T')[0],
          mealType: d.mealType || 'lunch',
          name: d.name || d.description || 'Nourishing Meal',
          description: d.description || d.name || '',
          categories: d.categories || [],
          notes: d.notes || '',
          time: d.time || d.timestamp || '',
          timestamp: d.timestamp || d.time || '',
          feeling: d.feeling || 'energized',
          createdAt: d.createdAt || new Date().toISOString(),
          updatedAt: d.updatedAt || undefined,
        });
      });

      // Sort by date descending, then time descending
      list.sort((a, b) => {
        if (b.date !== a.date) {
          return b.date.localeCompare(a.date);
        }
        return (b.time || '').localeCompare(a.time || '');
      });

      onData(list);
    },
    (err) => {
      console.warn('Meals listener notice:', err);
      onError?.(err);
    }
  );
}

export async function saveMeal(
  uid: string,
  meal: Omit<MealItem, 'id'> & { id?: string }
): Promise<string> {
  const id = meal.id || 'meal-' + Date.now();
  const docRef = doc(db, 'users', uid, 'meals', id);

  const nowIso = new Date().toISOString();
  const payload = {
    id,
    userId: uid,
    date: meal.date,
    mealType: meal.mealType,
    name: meal.name,
    description: meal.description || meal.name,
    categories: meal.categories || [],
    notes: meal.notes || '',
    time: meal.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    timestamp: meal.timestamp || meal.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    feeling: meal.feeling || 'energized',
    createdAt: meal.createdAt || nowIso,
    updatedAt: nowIso,
  };

  await setDoc(docRef, payload, { merge: true });
  return id;
}

export async function updateUserMeal(
  uid: string,
  mealId: string,
  updates: Partial<MealItem>
): Promise<void> {
  const docRef = doc(db, 'users', uid, 'meals', mealId);
  const payload: any = {
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  if (updates.name && !updates.description) {
    payload.description = updates.name;
  }
  await updateDoc(docRef, payload);
}

export async function deleteUserMeal(uid: string, mealId: string): Promise<void> {
  const docRef = doc(db, 'users', uid, 'meals', mealId);
  await deleteDoc(docRef);
}
