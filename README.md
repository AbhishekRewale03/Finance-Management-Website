# 💰 Money Manager – Finance Dashboard

A modern, full-stack **Finance Management Dashboard** built with **Next.js 15**, **Firebase**, **TypeScript** and **Tailwind CSS**.
Track your income, expenses, budgets, and financial goals with a clean, responsive UI and real-time updates.

---

## 🚀 Features

### 🔐 Authentication

* Email & Password Authentication
* Google Sign-In
* Secure logout
* Account deletion

### 💳 Transactions

* Add / Edit / Delete transactions
* Categorized expenses & income
* Date-based tracking
* Search & filter functionality
* Export transactions to Excel

### 📊 Dashboard

* Total Balance overview
* Income vs Expenses analytics
* Savings rate calculation
* Monthly financial insights
* Interactive charts (bar + pie)

### 🎯 Budgets

* Create category-based budgets
* Track spending vs budget
* Budget alerts (overspending warnings)

### 🏆 Goals

* Add financial goals
* Track progress visually
* Edit & delete goals

### 📈 Reports

* Category-wise expense breakdown
* Monthly reports & trends
* Visual analytics using charts

### ⚙️ Settings

* Currency switch (₹ INR / $ USD / € EUR)
* Notification preferences

  * Budget alerts
  * Payment reminders
* Data export
* Delete account

### 🌗 UI/UX

* Dark / Light mode
* Fully responsive (mobile, tablet, desktop)
* Clean SaaS-style layout
* Toast notifications
* Loading states & skeletons

---

## 🛠 Tech Stack

### Frontend

* **Next.js 15 (App Router)**
* **React 19**
* **TypeScript**
* **Tailwind CSS**
* **shadcn/ui + Radix UI**
* **Recharts**

### Backend / Services

* **Firebase Authentication**
* **Firebase Firestore (Database)**

### State & Forms

* React Hook Form
* Zod (Validation)

### Utilities

* Date-fns
* XLSX (Excel export)

---

## 📦 Installation

```bash
# Clone repository
git clone https://github.com/your-username/money-manager.git

# Navigate to project
cd money-management

# Install dependencies
npm install

# Run development server
npm run dev
```

---

## 🔑 Environment Variables

Create a `.env` file in the root:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

---

## 🏗 Project Structure

```
src/
│── app/                # Next.js App Router pages
│── components/         # Reusable UI components
│── hooks/              # Custom React hooks
│── services/           # Firebase & business logic
│── lib/                # Utility functions
│── context/            # Global state (Auth, Currency)
```

---

## ⚡ Performance Optimizations

* Server Components (minimal `"use client"`)
* Optimized bundle size
* Efficient state management

---

## 🧠 Type Safety

This project is built with **TypeScript** for better scalability and maintainability.

* Strongly typed components and props
* Type-safe API and data models
* Improved developer experience with IntelliSense
* Reduced runtime errors

---

## 📱 Responsive Design

* Mobile-first approach
* Tailwind breakpoints (`sm`, `md`, `lg`)
* Optimized layouts for all screen sizes

---



## 🔒 Security

* Firebase Auth for secure login
* Protected routes
* Input validation using Zod
* Safe data handling

---

## 🧪 Future Improvements

* Multi-user collaboration
* Recurring transactions
* AI-based spending insights
* Notifications (email / push)
* PWA support

---

## 👨‍💻 Author

**Abhishek**
Frontend Developer Intern

---

## 📄 License

This project is licensed under the MIT License.

---

## ⭐ Acknowledgements

* Next.js Team
* Firebase
* shadcn/ui
* Open-source community

---

## 💡 Screenshots

*Add your screenshots here (Dashboard, Reports, Mobile view, etc.)*

---

## 🚀 Live Demo

👉 *Add your deployed link here*

---

### ⚡ Built for performance, scalability, and real-world usage.
