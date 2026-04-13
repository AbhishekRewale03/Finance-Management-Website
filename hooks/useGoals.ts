import { useEffect, useState } from "react";
import { subscribeToGoals, Goal } from "@/services/goal.service";

export const useGoals = (uid?: string) => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) {
      setGoals([]); // ✅ ensure safe default
      setLoading(false); // ✅ stop loading
      return;
    }

    setLoading(true);

    const unsubscribe = subscribeToGoals(uid, (data) => {
      setGoals(data || []); // ✅ fallback safety
      setLoading(false); // ✅ only after data arrives
    });

    return () => unsubscribe();
  }, [uid]);

  return { goals, loading };
};
