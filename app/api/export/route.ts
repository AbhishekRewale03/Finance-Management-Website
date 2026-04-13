import { NextResponse } from "next/server"
import { db } from "@/lib/firebase"
import { collection, getDocs, doc, getDoc } from "firebase/firestore"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 })
    }

    const userRef = doc(db, "users", userId)
    const userSnap = await getDoc(userRef)

    const transactionsSnap = await getDocs(
      collection(db, `users/${userId}/transactions`)
    )

    const goalsSnap = await getDocs(
      collection(db, `users/${userId}/goals`)
    )

    const budgetsSnap = await getDocs(
      collection(db, `users/${userId}/budgets`)
    )

    return NextResponse.json({
      profile: userSnap.data(),
      transactions: transactionsSnap.docs.map((d) => d.data()),
      goals: goalsSnap.docs.map((d) => d.data()),
      budgets: budgetsSnap.docs.map((d) => d.data()),
    })
  } catch (error) {
    console.error("EXPORT ERROR:", error)

    return NextResponse.json(
      { error: "Failed to export data" },
      { status: 500 }
    )
  }
}