import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

// ✅ TYPES
export type Currency = "inr" | "usd" | "eur";

export interface UserSettings {
  theme: "light" | "dark";
  animations: boolean;
  budgetAlerts: boolean;
  paymentReminders: boolean;
  currency: Currency;
  numberFormat: "indian" | "international";
}

// ✅ DEFAULTS
export const defaultSettings: UserSettings = {
  theme: "light",
  animations: true,
  budgetAlerts: true,
  paymentReminders: true,
  currency: "inr",
  numberFormat: "indian",
};

// ===============================
// 🔥 GET SETTINGS
// ===============================
export const getUserSettings = async (
  userId: string,
): Promise<UserSettings> => {
  try {
    const ref = doc(db, "users", userId, "meta", "settings");
    const snap = await getDoc(ref);

    if (!snap.exists()) return defaultSettings;

    const data = snap.data();

    return {
      ...defaultSettings,
      ...data,
      currency: ["inr", "usd", "eur"].includes(data?.currency)
        ? data.currency
        : "inr",
      numberFormat:
        data?.numberFormat === "international" ? "international" : "indian",
    } as UserSettings;
  } catch (err) {
    console.error("Error fetching settings:", err);
    return defaultSettings;
  }
};

// ===============================
// 🔥 SAVE SETTINGS
// ===============================
export const saveUserSettings = async (userId: string, data: UserSettings) => {
  try {
    const ref = doc(db, "users", userId, "meta", "settings");

    const safeData: UserSettings = {
      ...defaultSettings,
      ...data,
      currency: ["inr", "usd", "eur"].includes(data.currency)
        ? data.currency
        : "inr",
    };

    await setDoc(ref, safeData, { merge: true });
  } catch (err) {
    console.error("Error saving settings:", err);
    throw err;
  }
};
