import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { User } from "firebase/auth";

// ===============================
// 👤 USER PROFILE TYPE
// ===============================
export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  phone?: string;
  dob?: string;
  photoURL?: string;
  createdAt?: Date;
}

// ===============================
// 🆕 CUSTOM USER INPUT
// ===============================
export type NewUserInput = {
  uid: string;
  email: string | null;
  name: string;
  photoURL?: string | null;
};

// ===============================
// 🔍 TYPE GUARD
// ===============================
const isNewUser = (user: User | NewUserInput): user is NewUserInput => {
  return (user as NewUserInput).name !== undefined;
};

// ===============================
// 🔥 CREATE USER (IF NOT EXISTS)
// ===============================
export const createUserIfNotExists = async (
  user: User | NewUserInput,
): Promise<void> => {
  const uid = user.uid;
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    const name = isNewUser(user) ? user.name : user.displayName || "";

    await setDoc(ref, {
      uid,
      name,
      email: user.email || "",
      phone: "",
      dob: "",
      photoURL: user.photoURL || "",
      createdAt: new Date(),
    });
  }
};

// ===============================
// 📥 GET USER PROFILE
// ===============================
export const getUserProfile = async (
  uid: string,
): Promise<UserProfile | null> => {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) return null;

  return snap.data() as UserProfile;
};

// ===============================
// 💾 SAVE USER PROFILE
// ===============================
export const saveUserProfile = async (
  uid: string,
  data: Partial<UserProfile>,
): Promise<void> => {
  const ref = doc(db, "users", uid);

  await setDoc(
    ref,
    {
      ...data,
      uid,
    },
    { merge: true },
  );
};
