import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  Timestamp,
  doc,
  deleteDoc,
  getDocs,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Budget } from "@/types";

// 🔁 Normalize Firestore data
const normalizeBudget = (docSnap: any): Budget => {
  const d = docSnap.data();

  return {
    id: docSnap.id,
    ...d,
    createdAt:
      d.createdAt instanceof Timestamp ? d.createdAt.toDate() : d.createdAt,
  };
};

// 📥 GET budgets (one-time fetch)
export const getBudgets = async (userId: string): Promise<Budget[]> => {
  try {
    const ref = collection(db, "users", userId, "budgets");
    const q = query(ref, orderBy("createdAt", "desc"));

    const snapshot = await getDocs(q);

    return snapshot.docs.map(normalizeBudget);
  } catch (err) {
    console.error("Error fetching budgets:", err);
    throw err;
  }
};

// ➕ ADD Budget
export const addBudget = async (userId: string, data: Budget) => {
  try {
    const ref = collection(db, `users/${userId}/budgets`);

    return await addDoc(ref, {
      ...data,
      createdAt: new Date(), // ✅ consistent timestamp
    });
  } catch (err) {
    console.error("Error adding budget:", err);
    throw err;
  }
};

// ✏️ UPDATE Budget
export const updateBudget = async (
  userId: string,
  budgetId: string,
  data: { category: string; allocated: number },
) => {
  try {
    const ref = doc(db, "users", userId, "budgets", budgetId);

    await updateDoc(ref, {
      category: data.category,
      allocated: data.allocated,
    });
  } catch (err) {
    console.error("Error updating budget:", err);
    throw err;
  }
};

// 🗑 DELETE Budget
export const deleteBudget = async (userId: string, budgetId: string) => {
  try {
    const ref = doc(db, `users/${userId}/budgets/${budgetId}`);
    await deleteDoc(ref);
  } catch (err) {
    console.error("Error deleting budget:", err);
    throw err;
  }
};

// 🔴 REAL-TIME budgets
export const subscribeToBudgets = (
  userId: string,
  callback: (data: Budget[]) => void,
) => {
  const ref = collection(db, `users/${userId}/budgets`);
  const q = query(ref, orderBy("createdAt", "desc"));

  return onSnapshot(
    q,
    (snapshot) => {
      const data = snapshot.docs.map(normalizeBudget);
      callback(data);
    },
    (error) => {
      console.error("Realtime budgets error:", error);
    },
  );
};
