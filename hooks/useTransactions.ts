import { useEffect, useState } from "react";
import {
  subscribeToTransactions,
  Transaction,
} from "@/services/transaction.service";

export const useTransactions = (uid?: string) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) {
      setTransactions([]); // ✅ ensure defined
      setLoading(false); // ✅ stop loading
      return;
    }

    setLoading(true);

    const unsubscribe = subscribeToTransactions(uid, (data) => {
      setTransactions(data || []); // ✅ safety fallback
      setLoading(false);
    });

    return () => unsubscribe();
  }, [uid]);

  return { transactions, loading };
};
