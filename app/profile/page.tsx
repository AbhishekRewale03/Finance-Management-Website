import { ProfilePage } from "@/components/profile-page"

export default function Profile() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-6 sm:py-8 ">
        <ProfilePage />
      </div>
    </main>
  )
}
