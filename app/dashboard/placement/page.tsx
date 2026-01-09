import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { PlacementSetup } from "@/components/dashboard/placement-setup"

export default async function PlacementPage() {
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
      <PlacementSetup />
    </DashboardLayout>
  )
}
