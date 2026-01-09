"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { History, Briefcase, GraduationCap, Clock, TrendingUp, Loader2 } from "lucide-react"

interface Session {
  id: string
  mode: "placement" | "viva"
  role?: string
  subject?: string
  difficulty?: string
  started_at: string
  completed_at?: string
  overall_score?: number
  question_count: number
  duration_seconds: number
  status: string
}

export function HistoryView() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await fetch("/api/sessions")
        const { sessions: data } = await response.json()
        setSessions(data || [])
      } catch (error) {
        console.error("Failed to fetch sessions:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchSessions()
  }, [])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    return `${mins}m`
  }

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-green-500"
    if (score >= 70) return "text-amber-500"
    return "text-red-500"
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  const completedSessions = sessions.filter((s) => s.status === "completed")

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Session History</h1>
        <p className="text-muted-foreground">Review your past interview and viva sessions</p>
      </div>

      {completedSessions.length > 0 ? (
        <div className="grid gap-4">
          {completedSessions.map((session) => (
            <Card key={session.id} className="hover:border-primary/50 transition-colors">
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-primary/10">
                      {session.mode === "placement" ? (
                        <Briefcase className="w-6 h-6 text-primary" />
                      ) : (
                        <GraduationCap className="w-6 h-6 text-primary" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold">
                        {session.mode === "placement" ? session.role : `${session.subject?.toUpperCase()} Viva`}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {new Date(session.started_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          <Clock className="w-3 h-3 mr-1" />
                          {formatTime(session.duration_seconds)}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          Q{session.question_count}
                        </Badge>
                        {session.mode === "viva" && session.difficulty && (
                          <Badge variant="secondary" className="text-xs capitalize">
                            {session.difficulty}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Score</p>
                      <p className={`text-2xl font-bold ${getScoreColor(session.overall_score || 0)}`}>
                        {session.overall_score || 0}%
                      </p>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link
                        href={`/dashboard/results?sessionId=${session.id}&mode=${session.mode}&questions=${session.question_count}&time=${session.duration_seconds}`}
                      >
                        View Details
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <History className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold mb-2">No sessions yet</h3>
              <p className="text-sm text-muted-foreground mb-4 max-w-sm">
                Complete your first interview or viva session to see your history here.
              </p>
              <div className="flex gap-3">
                <Button asChild>
                  <Link href="/dashboard/placement">Start Placement</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/dashboard/viva">Start Viva</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance Chart Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Performance Trends
          </CardTitle>
          <CardDescription>Your score progression over time</CardDescription>
        </CardHeader>
        <CardContent>
          {completedSessions.length >= 2 ? (
            <div className="h-64 flex items-center justify-center">
              <div className="w-full space-y-4">
                {completedSessions.slice(0, 5).map((session, index) => (
                  <div key={session.id} className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground w-24 truncate">
                      {session.mode === "placement" ? session.role : session.subject?.toUpperCase()}
                    </span>
                    <div className="flex-1 h-4 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${session.overall_score || 0}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium w-12">{session.overall_score || 0}%</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center border-2 border-dashed rounded-lg">
              <p className="text-muted-foreground">Performance chart will appear after more sessions</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
