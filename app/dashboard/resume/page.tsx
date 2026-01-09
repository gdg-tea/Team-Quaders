import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { ResumeUpload } from "@/components/dashboard/resume-upload"

export default async function ResumePage() {
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
      <ResumeUpload />
    </DashboardLayout>
  )
}
