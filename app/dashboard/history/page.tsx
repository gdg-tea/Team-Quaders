import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { HistoryView } from "@/components/dashboard/history-view"

export default async function HistoryPage() {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/login")
  }

  return (
    <DashboardLayout>
      <HistoryView />
    </DashboardLayout>
  )
}
