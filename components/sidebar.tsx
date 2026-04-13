"use client";

import {
  HomeIcon,
  CreditCardIcon,
  DollarSignIcon,
  BarChart3Icon,
  PieChartIcon,
  UserIcon,
  SettingsIcon,
  LogOutIcon,
} from "lucide-react";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "firebase/auth";

import { auth } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";

interface SidebarProps {
  className?: string;
  onNavigate?: () => void;
}

export function Sidebar({ className, onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const { user } = useAuth();

  const routes = [
    { href: "/", icon: <HomeIcon className="h-5 w-5" />, label: "Dashboard" },
    {
      href: "/transactions",
      icon: <CreditCardIcon className="h-5 w-5" />,
      label: "Transactions",
    },
    {
      href: "/budgets",
      icon: <DollarSignIcon className="h-5 w-5" />,
      label: "Budgets",
    },
    {
      href: "/goals",
      icon: <BarChart3Icon className="h-5 w-5" />,
      label: "Goals",
    },
    {
      href: "/reports",
      icon: <PieChartIcon className="h-5 w-5" />,
      label: "Reports",
    },
    {
      href: "/profile",
      icon: <UserIcon className="h-5 w-5" />,
      label: "Profile",
    },
    {
      href: "/settings",
      icon: <SettingsIcon className="h-5 w-5" />,
      label: "Settings",
    },
  ];

  // 🔥 Logout function
  const handleLogout = async () => {
    try {
      await signOut(auth);
      onNavigate?.();
      router.replace("/login"); // redirect after logout
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <div
      className={cn(
        "fixed top-0 left-0 h-screen w-[280px] sm:w-64 bg-white dark:bg-slate-950 shadow-sm",
        className,
      )}
    >
      <div className="flex flex-col ">
        {/* Logo */}
        <div className="p-6 ">
          <div className="flex items-center gap-2 mb-8">
            <div className="h-8 w-8 rounded-full bg-emerald-600 flex items-center justify-center">
              <DollarSignIcon className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl font-bold">Money Manager</h1>
          </div>

          {/* Navigation */}
          <div className="space-y-1">
            {routes.map((route) => (
              <Button
                key={route.href}
                variant={pathname === route.href ? "secondary" : "ghost"}
                size="sm"
                className="w-full justify-start py-5 mb-1"
                asChild
              >
                <Link href={route.href} onClick={() => onNavigate?.()}>
                  {route.icon}
                  <span className="ml-2">{route.label}</span>
                </Link>
              </Button>
            ))}
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-auto p-6 border-t">
          {/* Theme */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium">Theme</span>
            <ThemeToggle />
          </div>

          {/* User Info */}
          <div className="flex  justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                <UserIcon className="h-4 w-4 text-emerald-600" />
              </div>

              <div className="flex ">
                <p className="text-sm font-medium">
                  {user?.displayName || "User"}
                </p>
              </div>
            </div>

            {/* Logout */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className=" flex items-center gap-2 px-2"
            >
              <LogOutIcon className="h-4 w-4 text-[#F43F5E]" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
