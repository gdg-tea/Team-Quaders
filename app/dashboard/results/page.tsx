"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { ResultsView } from "@/components/interview/results-view"
import { Loader2 } from "lucide-react"

function ResultsContent() {
  const searchParams = useSearchParams()

  const sessionId = searchParams.get("sessionId") || undefined
  const mode = searchParams.get("mode") || "placement"
  const questions = Number(searchParams.get("questions")) || 0
  const time = Number(searchParams.get("time")) || 0

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
