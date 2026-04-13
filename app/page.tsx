"use client";

import { DashboardPage } from "@/components/dashboard-page";
import { DotLoader } from "@/components/DotLoader";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { user, loading:authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [user, authLoading]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <DotLoader size={12} className="text-emerald-500" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <main className="min-h-screen">
      <DashboardPage />
    </main>
  );
}
