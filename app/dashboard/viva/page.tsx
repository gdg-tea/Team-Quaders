import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { VivaSetup } from "@/components/dashboard/viva-setup"

export default async function VivaPage() {
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
      <VivaSetup />
    </DashboardLayout>
  )
}
