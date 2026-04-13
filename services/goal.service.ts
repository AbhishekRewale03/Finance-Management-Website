import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  Timestamp,
  doc,
  updateDoc,
  increment,
  deleteDoc,
} from "firebase/firestore"
import { db } from "@/lib/firebase"

export interface Goal {
  id?: string
  name: string
  targetAmount: number
  currentAmount: number
  targetDate: Date
  createdAt: Date
}

// ➕ Add Goal
export const addGoal = async (userId: string, data: Goal) => {
  const ref = collection(db, `users/${userId}/goals`)

  return await addDoc(ref, {
    ...data,
    createdAt: new Date(),
  })
}

// Update goal

export const updateGoal = async (
  userId: string,
  goalId: string,
  data: Partial<Goal>
) => {
  const ref = doc(db, "users", userId, "goals", goalId);
  await updateDoc(ref, data);
};

// 🔴 Real-time listener
export const subscribeToGoals = (
  userId: string,
  callback: (data: Goal[]) => void
) => {
  const ref = collection(db, `users/${userId}/goals`)
  const q = query(ref, orderBy("createdAt", "desc"))

  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map((doc) => {
      const d = doc.data()

      return {
        id: doc.id,
        ...d,
        targetDate:
          d.targetDate instanceof Timestamp
            ? d.targetDate.toDate()
            : d.targetDate,
        createdAt:
          d.createdAt instanceof Timestamp
            ? d.createdAt.toDate()
            : d.createdAt,
      }
    }) as Goal[]

    callback(data)
  })
}

// 💰 Add funds to goal
export const addFundsToGoal = async (
  userId: string,
  goalId: string,
  amount: number
) => {
  const ref = doc(db, `users/${userId}/goals/${goalId}`)

  await updateDoc(ref, {
    currentAmount: increment(amount),
  })
}

// 🔴 Delete Goal
export const deleteGoal = async (
  userId: string,
  goalId: string
) => {
  const ref = doc(db, `users/${userId}/goals/${goalId}`)
  await deleteDoc(ref)
}