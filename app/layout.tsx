import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { ThemeProvider } from "@/components/theme-provider";
import { Sidebar } from "@/components/sidebar";
import { MobileSidebar } from "@/components/mobile-sidebar";
import { Toaster } from "@/components/ui/toaster";
import { CurrencyWrapper } from "@/components/providers/currency-wrapper";
import { ToastProvider } from "@/components/ui/toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Money Management Dashboard",
  description:
    "Advanced money management application with React and Tailwind CSS",
  generator: "v0.dev",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <ToastProvider>
            <CurrencyWrapper>
              <div className="flex min-h-screen">
                {/* Desktop Sidebar */}
                <Sidebar className="hidden md:block w-64 border-r" />

                {/* Main content */}
                <main className="flex-1 overflow-auto md:ml-64">
                  {/* Mobile Header */}
                  <div className="md:hidden p-4 border-b flex items-center">
                    <MobileSidebar />
                    <div className="ml-4 flex items-center">
                      <span className="font-bold text-xl">Money Manager</span>
                    </div>
                  </div>

                  {/* Page content */}
                  {children}
                </main>
              </div>
              <Toaster />
            </CurrencyWrapper>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
