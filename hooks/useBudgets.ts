import { useEffect, useState } from "react";
import { subscribeToBudgets } from "@/services/budget.service";
import { Budget } from "@/types";

export const useBudgets = (uid?: string) => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) {
      setBudgets([]); // ✅ safe default
      setLoading(false); // ✅ stop loading
      return;
    }

    setLoading(true);

    const unsubscribe = subscribeToBudgets(uid, (data) => {
      setBudgets(data || []); // ✅ fallback safety
      setLoading(false); // ✅ after data arrives
    });

    return () => unsubscribe();
  }, [uid]);

  return { budgets, loading };
};
