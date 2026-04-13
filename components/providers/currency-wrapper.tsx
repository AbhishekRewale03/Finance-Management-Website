"use client";

import { useEffect, useState, ReactNode } from "react";
import { CurrencyProvider } from "@/app/context/currency-context";
import { useAuth } from "@/hooks/useAuth";
import { getUserSettings } from "@/services/settings.service";

interface CurrencyWrapperProps {
  children: ReactNode;
}

type Currency = "inr" | "usd" | "eur";

export function CurrencyWrapper({ children }: CurrencyWrapperProps) {
  const { user, loading } = useAuth();

  const [currency, setCurrency] = useState<Currency>("inr");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // ⛔ wait for auth
    if (loading) return;

    // 👤 Not logged in → fallback INR
    if (!user) {
      setReady(true);
      return;
    }

    const load = async () => {
      try {
        const settings = await getUserSettings(user.uid);

        if (
          settings?.currency === "inr" ||
          settings?.currency === "usd" ||
          settings?.currency === "eur"
        ) {
          setCurrency(settings.currency);
        }
      } catch (err) {
        console.error("Currency load error:", err);
      } finally {
        setReady(true);
      }
    };

    load();
  }, [user, loading]);

  // 🚫 Prevent flicker / wrong currency render
  if (!ready) return null;

  return (
    <CurrencyProvider initialCurrency={currency}>{children}</CurrencyProvider>
  );
}
