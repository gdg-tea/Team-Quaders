"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { ResultsView } from "@/components/interview/results-view"
import { Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

function ResultsContent() {
  const searchParams = useSearchParams()
  const [sessionData, setSessionData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  let sessionId = searchParams.get("sessionId") || undefined
  let mode = searchParams.get("mode") || "placement"
  let questions = Number(searchParams.get("questions")) || 0
  let time = Number(searchParams.get("time")) || 0

  // Fetch session data if params are missing or 0
  useEffect(() => {
    const fetchSessionData = async () => {
      if (!sessionId) {
        setLoading(false)
        return
      }

      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from("interview_sessions")
          .select("*")
          .eq("id", sessionId)
          .single()

        if (data) {
          setSessionData(data)
          // Override with actual session data if params are missing
          if (questions === 0 && data.question_count) questions = data.question_count
          if (time === 0 && data.duration) time = data.duration
          if (!mode && data.mode) mode = data.mode
        }
      } catch (error) {
        console.error("Failed to fetch session:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchSessionData()
  }, [sessionId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return <ResultsView sessionId={sessionId} mode={mode} questionCount={questions} duration={time} />
}

export default function ResultsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }
    >
      <ResultsContent />
    </Suspense>
  )
}
