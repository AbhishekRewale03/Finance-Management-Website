"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { deleteUser } from "firebase/auth";
import { doc, deleteDoc, collection, getDocs } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

import { EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";

import { useTransactions } from "@/hooks/useTransactions";
import { exportToExcel } from "@/utils/export";

import {
  getUserSettings,
  saveUserSettings,
  UserSettings,
  defaultSettings,
} from "@/services/settings.service";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useToast } from "@/hooks/use-toast";
import { useCurrency } from "@/app/context/currency-context";
import { useRouter } from "next/navigation";
import { DotLoader } from "./DotLoader";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import { Input } from "./ui/input";

export function SettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const { setCurrency } = useCurrency();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");

  const { transactions, loading: txLoading } = useTransactions(user?.uid);

  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const router = useRouter();

  // 🔥 LOAD SETTINGS
  useEffect(() => {
    if (!user) return; // safe early return

    const load = async () => {
      try {
        const data = await getUserSettings(user.uid); // ✅ safe
        setSettings(data);
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to load settings",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user, toast]);

  // ✅ Better loading UI

  const [minLoaderDone, setMinLoaderDone] = useState(false);

  // Minimum loader timer (1s)
  useEffect(() => {
    const timer = setTimeout(() => setMinLoaderDone(true), 700);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [authLoading, user, router]);

  if (loading || authLoading || !minLoaderDone)
    return (
      <div className="flex items-center justify-center h-screen">
        <DotLoader size={12} className="text-emerald-500" />
      </div>
    );

  if (!user) return null;

  // ===============================
  // 🔥 SAVE SETTINGS
  // ===============================
  const handleSave = async () => {
    try {
      setSaving(true);
      await saveUserSettings(user.uid, settings);

      // Update currency immediately
      setCurrency(settings.currency);

      toast({
        title: "Settings saved",
        description: "Your preferences updated successfully",
        variant: "success",
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // ===============================
  // 🔥 EXPORT DATA
  // ===============================
  const handleExport = async () => {
    try {
      const res = await fetch(`/api/export?userId=${user.uid}`);
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Export failed");
      }

      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "my-finance-data.json";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      toast({
        title: "Export failed",
        description: "Unable to export your data",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAccount = async (password: string) => {
    if (!user) return;

    if (!password) {
      toast({
        title: "Password required",
        description: "Enter your password",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);

      // 🔥 Re-auth
      const credential = EmailAuthProvider.credential(user.email!, password);
      await reauthenticateWithCredential(user, credential);

      // 🔥 Delete collections
      const collectionsList = ["transactions", "goals", "budgets"];

      for (const col of collectionsList) {
        const ref = collection(db, `users/${user.uid}/${col}`);
        const snap = await getDocs(ref);

        const deletePromises = snap.docs.map((docItem) =>
          deleteDoc(docItem.ref),
        );

        await Promise.all(deletePromises);
      }

      // 🔥 Delete settings
      await deleteDoc(doc(db, "users", user.uid, "meta", "settings"));

      // 🔥 Delete root doc
      await deleteDoc(doc(db, "users", user.uid));

      // 🔥 Delete auth
      await deleteUser(user);

      toast({
        title: "Account deleted",
        description: "Your account has been permanently deleted",
        variant: "destructive",
      });

      window.location.href = "/login";
    } catch (err: any) {
      let message = "Failed to delete account";

      if (err.code === "auth/wrong-password") {
        message = "Incorrect password";
      } else if (err.code === "auth/requires-recent-login") {
        message = "Please login again";
      }

      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };
  // ===============================
  // UI
  // ===============================
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-emerald-800 dark:text-emerald-400">
          Settings
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Customize your app experience
        </p>
      </div>

      {/* GRID */}
      <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">
              Notifications
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="flex items-center justify-between gap-2">
              <Label className="text-sm sm:text-base">Budget Alerts</Label>
              <Switch
                checked={settings.budgetAlerts}
                onCheckedChange={(val) =>
                  setSettings({ ...settings, budgetAlerts: val })
                }
              />
            </div>

            <div className="flex items-center justify-between gap-2">
              <Label className="text-sm sm:text-base">Payment Reminders</Label>
              <Switch
                checked={settings.paymentReminders}
                onCheckedChange={(val) =>
                  setSettings({ ...settings, paymentReminders: val })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Currency */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Currency</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <Select
              value={settings.currency}
              onValueChange={(val) => {
                const newCurrency = val as "inr" | "usd" | "eur";

                setSettings({
                  ...settings,
                  currency: newCurrency,
                });

                setCurrency(newCurrency);
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="inr">₹ INR</SelectItem>
                <SelectItem value="usd">$ USD</SelectItem>
                <SelectItem value="eur">€ EUR</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Data & Privacy */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">
              Data & Privacy
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-3 sm:space-y-4">
            <Button
              disabled={transactions.length === 0}
              variant="outline"
              className="w-full text-sm sm:text-base"
              onClick={() => {
                if (transactions.length === 0) {
                  toast({
                    title: "No data",
                    description: "No transactions available to export",
                    variant: "destructive",
                  });
                  return;
                }

                exportToExcel(transactions);
              }}
            >
              Export Transactions
            </Button>

            <Button
              variant="destructive"
              className="w-full text-sm sm:text-base"
              onClick={() => setDeleteDialogOpen(true)}
              disabled
            >
              Delete Account
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* ✅ FIXED: Dialog moved OUTSIDE card */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">
              Delete Account
            </DialogTitle>
          </DialogHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleDeleteAccount(deletePassword);
              setDeleteDialogOpen(false);
            }}
            className="space-y-3 sm:space-y-4"
          >
            <div className="min-w-0">
              <Label className="text-sm sm:text-base ">
                Enter Password To Delete Your Account
              </Label>
              <Input
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                required
                className="w-full text-sm sm:text-base !mt-2"
              />
            </div>

            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDeleteDialogOpen(false)}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>

              <Button
                type="submit"
                variant="destructive"
                disabled={saving}
                className="w-full sm:w-auto"
              >
                {saving ? "Deleting..." : "Delete"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* SAVE BUTTON */}
      <Button onClick={handleSave} disabled={saving} className="w-full ">
        {saving ? "Saving..." : "Save Settings"}
      </Button>
    </div>
  );
}
