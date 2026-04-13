import { collection, addDoc, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getBudgets } from "@/services/budget.service";

export const seedTransactions = async (userId: string) => {
  try {
    const ref = collection(db, `users/${userId}/transactions`);

    // ❌ Prevent duplicate
    const existing = await getDocs(ref);
    if (!existing.empty) {
      console.log("⚠️ Already seeded");
      return;
    }

    const budgets = await getBudgets(userId);
    if (budgets.length === 0) {
      console.error("❌ Seed budgets first");
      return;
    }

    // ✅ 🔥 CREATE CATEGORY MAP (MOST IMPORTANT FIX)
    const categoryMap: Record<string, string> = {};
    budgets.forEach((b: any) => {
      categoryMap[b.category] = b.id;
    });

    const today = new Date();
    const data: any[] = [];

    for (let m = 5; m >= 0; m--) {
      const base = new Date(today.getFullYear(), today.getMonth() - m, 1);

      const year = base.getFullYear();
      const month = base.getMonth();

      const days = [1, 2, 3, 5, 8, 10, 15, 20, 25, 28];

      // 💰 Salary (no categoryId needed OR optional)
      data.push({
        type: "income",
        amount: 40000,
        categoryId: null,
        description: "Monthly Salary",
        date: new Date(year, month, 1),
        createdAt: new Date(),
      });

      days.forEach((day) => {
        const pushTx = (
          category: string,
          amount: number,
          description: string,
        ) => {
          const categoryId = categoryMap[category];

          if (!categoryId) {
            console.warn(`⚠️ Missing categoryId for ${category}`);
            return;
          }

          data.push({
            type: "expense",
            amount,
            categoryId, // ✅ FIXED
            description,
            date: new Date(year, month, day),
            createdAt: new Date(),
          });
        };

        // 🏠 Rent
        if (day === 3) {
          pushTx("Bills", 10000, "House Rent");
        }

        // ⚡ Bills
        if (day === 8) {
          pushTx("Bills", 2000, "Electricity + Internet");
        }

        // 🍔 Food
        if ([2, 5, 10, 15, 20, 25, 28].includes(day)) {
          pushTx(
            "Food",
            Math.floor(Math.random() * 300) + 100,
            "Food & Groceries",
          );
        }

        // 🚗 Transport
        if ([2, 8, 15, 25].includes(day)) {
          pushTx(
            "Transport",
            Math.floor(Math.random() * 150) + 50,
            "Auto / Travel",
          );
        }

        // 🛍 Shopping
        if (day === 15 && Math.random() > 0.4) {
          pushTx(
            "Shopping",
            Math.floor(Math.random() * 1500) + 500,
            "Shopping",
          );
        }

        // 🎬 Entertainment
        if (day === 20 && Math.random() > 0.5) {
          pushTx(
            "Entertainment",
            Math.floor(Math.random() * 800) + 200,
            "Movies / Outing",
          );
        }

        // 🏥 Health
        if (day === 10 && Math.random() > 0.7) {
          pushTx(
            "Health",
            Math.floor(Math.random() * 1000) + 300,
            "Medical Expense",
          );
        }

        // 🧾 Other
        if (Math.random() > 0.8) {
          pushTx(
            "Other",
            Math.floor(Math.random() * 500) + 100,
            "Misc Expense",
          );
        }
      });
    }

    // ✅ SORT
    data.sort((a, b) => a.date.getTime() - b.date.getTime());

    // 🔥 Upload
    for (const tx of data) {
      await addDoc(ref, tx);
    }

    console.log("✅ Clean timeline seeded with categoryId");
  } catch (err) {
    console.error("❌ Seeding failed:", err);
  }
};
