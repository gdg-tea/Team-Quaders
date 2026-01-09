"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Briefcase, GraduationCap, FileText, TrendingUp, Clock, Target, ArrowRight, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/components/providers/auth-provider"

interface Stats {
  totalSessions: number
  avgTechnicalScore: number | null
  avgCommunicationScore: number | null
  hasResume: boolean
}

interface RecentSession {
  id: string
  mode: "placement" | "viva"
  role?: string
  subject?: string
  overall_score?: number
  started_at: string
  status: string
}

export function DashboardOverview() {
  const [stats, setStats] = useState<Stats>({
    totalSessions: 0,
    avgTechnicalScore: null,
    avgCommunicationScore: null,
    hasResume: false,
  })
  const [recentSessions, setRecentSessions] = useState<RecentSession[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const supabase = createClient()

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return

      try {
        // Fetch sessions
        const { data: sessions } = await supabase
          .from("interview_sessions")
          .select("*")
          .eq("user_id", user.id)
          .eq("status", "completed")
          .order("started_at", { ascending: false })

        // Fetch resume status
        const { data: resumes } = await supabase.from("resumes").select("id").eq("user_id", user.id).limit(1)

        if (sessions) {
          const completedSessions = sessions.filter((s) => s.overall_score)
          const avgTech =
            completedSessions.length > 0
              ? Math.round(
                  completedSessions.reduce((sum, s) => sum + (s.technical_score || 0), 0) / completedSessions.length,
                )
              : null
          const avgComm =
            completedSessions.length > 0
              ? Math.round(
                  completedSessions.reduce((sum, s) => sum + (s.communication_score || 0), 0) /
                    completedSessions.length,
                )
              : null

          setStats({
            totalSessions: sessions.length,
            avgTechnicalScore: avgTech,
            avgCommunicationScore: avgComm,
            hasResume: (resumes && resumes.length > 0) || false,
          })

          setRecentSessions(sessions.slice(0, 3))
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [user, supabase])

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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Ready to practice your interview skills?</p>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border-2 border-dashed hover:border-primary transition-colors cursor-pointer group">
          <Link href="/dashboard/resume">
            <CardHeader>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-2 group-hover:bg-primary/20 transition-colors">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="flex items-center justify-between">
                Upload Resume
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </CardTitle>
              <CardDescription>Get personalized interview questions based on your resume</CardDescription>
            </CardHeader>
          </Link>
        </Card>

        <Card className="border-2 border-dashed hover:border-primary transition-colors cursor-pointer group">
          <Link href="/dashboard/placement">
            <CardHeader>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-2 group-hover:bg-primary/20 transition-colors">
                <Briefcase className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="flex items-center justify-between">
                Placement Interview
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </CardTitle>
              <CardDescription>Practice for campus placements with role-specific questions</CardDescription>
            </CardHeader>
          </Link>
        </Card>

        <Card className="border-2 border-dashed hover:border-primary transition-colors cursor-pointer group">
          <Link href="/dashboard/viva">
            <CardHeader>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-2 group-hover:bg-primary/20 transition-colors">
                <GraduationCap className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="flex items-center justify-between">
                Academic Viva
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </CardTitle>
              <CardDescription>GTU syllabus-aligned viva practice for your subjects</CardDescription>
            </CardHeader>
          </Link>
        </Card>
      </div>

      {/* Stats - Now with real data */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSessions}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalSessions === 0 ? "Start practicing today" : "Completed interviews"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Technical Score</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${stats.avgTechnicalScore ? getScoreColor(stats.avgTechnicalScore) : ""}`}
            >
              {stats.avgTechnicalScore !== null ? `${stats.avgTechnicalScore}%` : "--"}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.avgTechnicalScore !== null ? "Based on all sessions" : "Complete a session to see"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Communication</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${stats.avgCommunicationScore ? getScoreColor(stats.avgCommunicationScore) : ""}`}
            >
              {stats.avgCommunicationScore !== null ? `${stats.avgCommunicationScore}%` : "--"}
            </div>
            <p className="text-xs text-muted-foreground">Based on clarity & confidence</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resume Status</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats.hasResume ? "text-green-500" : "text-amber-500"}`}>
              {stats.hasResume ? "Uploaded" : "Pending"}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.hasResume ? "Ready for personalized interviews" : "Upload to unlock features"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity - Now with real data */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your interview practice history</CardDescription>
        </CardHeader>
        <CardContent>
          {recentSessions.length > 0 ? (
            <div className="space-y-4">
              {recentSessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      {session.mode === "placement" ? (
                        <Briefcase className="w-5 h-5 text-primary" />
                      ) : (
                        <GraduationCap className="w-5 h-5 text-primary" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">
                        {session.mode === "placement" ? session.role : `${session.subject?.toUpperCase()} Viva`}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(session.started_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {session.overall_score && (
                      <Badge className={getScoreColor(session.overall_score)}>{session.overall_score}%</Badge>
                    )}
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/dashboard/results?sessionId=${session.id}`}>View</Link>
                    </Button>
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full bg-transparent" asChild>
                <Link href="/dashboard/history">View All History</Link>
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Clock className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold mb-2">No sessions yet</h3>
              <p className="text-sm text-muted-foreground mb-4 max-w-sm">
                Start your first interview practice session to see your history and progress here.
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
          )}
        </CardContent>
      </Card>
    </div>
  )
}
