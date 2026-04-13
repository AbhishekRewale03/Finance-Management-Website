import { collection, addDoc, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"

export const addCategory = async (userId: string, name: string) => {
  const ref = collection(db, `users/${userId}/categories`)
  return await addDoc(ref, {
    name,
    createdAt: new Date(),
  })
}

export const getCategories = async (userId: string) => {
  const ref = collection(db, `users/${userId}/categories`)
  const snapshot = await getDocs(ref)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}