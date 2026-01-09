"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/components/providers/auth-provider"
import { createClient } from "@/lib/supabase/client"
import { InterviewSession } from "@/components/interview/interview-session"
import { Loader2 } from "lucide-react"

function InterviewContent() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  // State to hold session data
  const [sessionData, setSessionData] = useState<{
    mode?: string;
    role?: string;
    year?: string;
    subject?: string;
    difficulty?: string;
  } | null>(null)
  
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadSession() {
      if (authLoading) return
      if (!user) {
        router.push("/login")
        return
      }

      // 1. Check URL params first (Direct link)
      const urlMode = searchParams.get("mode")
      const sessionId = searchParams.get("sessionId")

      if (urlMode) {
        // Data is in URL
        setSessionData({
          mode: urlMode,
          role: searchParams.get("role") || undefined,
          year: searchParams.get("year") || undefined,
          subject: searchParams.get("subject") || undefined,
          difficulty: searchParams.get("difficulty") || undefined,
        })
        setLoading(false)
        return
      }

      // 2. If no URL params, fetch from DB using Session ID
      if (sessionId) {
        const { data, error } = await supabase
          .from("interview_sessions")
          .select("*")
          .eq("id", sessionId)
          .single()

        if (data && !error) {
          setSessionData({
            mode: data.mode,
            role: data.role,
            year: data.year,
            subject: data.subject,
            difficulty: data.difficulty,
          })
        }
      }
      setLoading(false)
    }

    loadSession()
  }, [user, authLoading, router, searchParams])

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2">Loading Session...</span>
      </div>
    )
  }

  if (!sessionData?.mode) {
    return <div className="p-10 text-center">Error: No interview mode selected.</div>
  }

  return (
    <InterviewSession
      mode={sessionData.mode as "placement" | "viva"}
      role={sessionData.role}
      year={sessionData.year}
      subject={sessionData.subject}
      difficulty={sessionData.difficulty}
    />
  )
}

export default function InterviewPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>}>
      <InterviewContent />
    </Suspense>
  )
}