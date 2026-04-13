// Transaction
export interface Transaction {
  id?: string
  type: "income" | "expense"
  amount: number
  description: string
  categoryId: string
  categoryName: string
  date: Date
  createdAt: Date
}

// Budget
export interface Budget {
  id?: string
  userId: string
  category: string
  allocated: number
  createdAt: Date
}

// Goal (for later)
export interface Goal {
  id?: string
  name: string
  targetAmount: number
  currentAmount: number
  targetDate: Date
  createdAt: Date
}