import {
  collection,
  addDoc,
  query,
  onSnapshot,
  orderBy,
  Timestamp,
  doc,
  deleteDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

// ✅ DEFINE TYPE HERE
export interface Transaction {
  id?: string;
  type: "income" | "expense";
  amount: number;
  description: string;
  categoryId: string;
  categoryName: string;
  date: Date;
  createdAt: Date;
}

// ➕ Add Transaction
export const addTransaction = async (userId: string, data: Transaction) => {
  const ref = collection(db, `users/${userId}/transactions`);

  return await addDoc(ref, {
    ...data,
    createdAt: new Date(),
  });
};

// 🔴 Delete Transaction
export const deleteTransaction = async (
  userId: string,
  transactionId: string,
) => {
  const ref = doc(db, `users/${userId}/transactions/${transactionId}`);
  await deleteDoc(ref);
};

// 🟡 Update Transaction
export const updateTransaction = async (
  userId: string,
  transactionId: string,
  data: Partial<Omit<Transaction, "id" | "createdAt">>,
) => {
  const ref = doc(db, `users/${userId}/transactions/${transactionId}`);
  await updateDoc(ref, data);
};

// 🔴 Real-time listener
export const subscribeToTransactions = (
  userId: string,
  callback: (data: Transaction[]) => void,
) => {
  const ref = collection(db, `users/${userId}/transactions`);
  const q = query(ref, orderBy("createdAt", "desc"));

  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map((doc) => {
      const d = doc.data();

      return {
        id: doc.id,
        ...d,

        // 🔥 FIX: Firestore Timestamp → JS Date
        date: d.date instanceof Timestamp ? d.date.toDate() : d.date,
        createdAt:
          d.createdAt instanceof Timestamp ? d.createdAt.toDate() : new Date(),
      };
    }) as Transaction[];

    callback(data);
  });
};
