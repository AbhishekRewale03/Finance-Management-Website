import {
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";

import { auth } from "@/lib/firebase";
import { createUserIfNotExists, NewUserInput } from "@/services/user.service";

// ===============================
// 🔐 PROVIDER
// ===============================
const provider = new GoogleAuthProvider();

// ===============================
// 🔥 GOOGLE LOGIN
// ===============================
export const signInWithGoogle = async () => {
  const res = await signInWithPopup(auth, provider);

  // ✅ Ensure Firestore user exists
  await createUserIfNotExists(res.user);

  return res.user;
};

// ===============================
// 🔥 EMAIL LOGIN
// ===============================
export const loginWithEmail = async (email: string, password: string) => {
  const res = await signInWithEmailAndPassword(auth, email, password);
  return res.user;
};

// ===============================
// 🔥 SIGNUP (EMAIL + NAME)
// ===============================
export const signupWithEmail = async (
  name: string,
  email: string,
  password: string,
) => {
  // 1️⃣ Create Auth user
  const res = await createUserWithEmailAndPassword(auth, email, password);

  // 2️⃣ Update display name in Firebase Auth
  await updateProfile(res.user, { displayName: name });

  // 3️⃣ Create Firestore user
  const newUser: NewUserInput = {
    uid: res.user.uid,
    name,
    email: res.user.email,
    photoURL: res.user.photoURL,
  };

  await createUserIfNotExists(newUser);

  return res.user;
};
