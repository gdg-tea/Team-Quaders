"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import {
  Brain,
  Target,
  MessageSquare,
  Clock,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Home,
  Loader2,
} from "lucide-react"

interface ResultsViewProps {
  mode: string
  questionCount: number
  duration: number
  sessionId?: string
}

interface EvaluationData {
  technical_score: number
  communication_score: number
  project_defense_score: number
  overall_score: number
  strengths: string
  improvements: string
  action_plan: string[]
}

export function ResultsView({ mode, questionCount, duration, sessionId }: ResultsViewProps) {
  const [evaluation, setEvaluation] = useState<EvaluationData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrEvaluate = async () => {
      if (!sessionId) {
        setLoading(false)
        return
      }

      try {
        // First, try to get existing evaluation from session
        const sessionResponse = await fetch(`/api/sessions/${sessionId}`)
        const { session } = await sessionResponse.json()

        if (session?.overall_score) {
          // Session already evaluated
          setEvaluation({
            technical_score: session.technical_score,
            communication_score: session.communication_score,
            project_defense_score: session.project_defense_score,
            overall_score: session.overall_score,
            strengths: session.strengths,
            improvements: session.improvements,
            action_plan: session.action_plan,
          })
        } else if (session?.messages?.length > 0) {
          // Need to evaluate
          const evalResponse = await fetch("/api/ai/evaluate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sessionId,
              messages: session.messages,
              mode: session.mode,
              role: session.role,
              subject: session.subject,
              difficulty: session.difficulty,
            }),
          })

          const { evaluation: evalData } = await evalResponse.json()
          setEvaluation(evalData)
        }
      } catch (error) {
        console.error("Failed to fetch/evaluate:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrEvaluate()
  }, [sessionId])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-green-500"
    if (score >= 70) return "text-amber-500"
    return "text-red-500"
  }

  const getScoreLabel = (score: number) => {
    if (score >= 85) return "Excellent"
    if (score >= 70) return "Good"
    if (score >= 50) return "Needs Improvement"
    return "Poor"
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Evaluating your performance...</p>
      </div>
    )
  }

  // Default values if no evaluation
  const scores = evaluation || {
    technical_score: 70,
    communication_score: 70,
    project_defense_score: 70,
    overall_score: 70,
    strengths: "Good attempt at answering questions.",
    improvements: "Consider providing more detailed explanations.",
    action_plan: ["Practice more mock interviews", "Review core concepts", "Work on communication skills"],
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between px-4 mx-auto">
          <div className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-primary" />
            <span className="font-semibold">Interview Results</span>
          </div>
          <Button variant="outline" asChild>
            <Link href="/dashboard">
              <Home className="mr-2 h-4 w-4" />
              Dashboard
            </Link>
          </Button>
        </div>
      </header>

      <main className="container px-4 py-8 mx-auto max-w-4xl">
        <div className="space-y-8">
          {/* Overall Score */}
          <Card className="border-2 border-primary/20">
            <CardContent className="pt-8 pb-8">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-primary/10 mb-4">
                  <span className={`text-5xl font-bold ${getScoreColor(scores.overall_score)}`}>
                    {scores.overall_score}
                  </span>
                </div>
                <h2 className="text-2xl font-bold mb-2">Overall Score</h2>
                <Badge variant={scores.overall_score >= 70 ? "default" : "secondary"} className="text-lg px-4 py-1">
                  {getScoreLabel(scores.overall_score)}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <MessageSquare className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Questions</p>
                    <p className="text-2xl font-bold">{questionCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Clock className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Duration</p>
                    <p className="text-2xl font-bold">{formatTime(duration)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <TrendingUp className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Mode</p>
                    <p className="text-2xl font-bold capitalize">{mode}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Scores */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Breakdown</CardTitle>
              <CardDescription>Detailed analysis of your interview</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Technical Accuracy
                  </span>
                  <span className={`font-medium ${getScoreColor(scores.technical_score)}`}>
                    {scores.technical_score}%
                  </span>
                </div>
                <Progress value={scores.technical_score} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Communication
                  </span>
                  <span className={`font-medium ${getScoreColor(scores.communication_score)}`}>
                    {scores.communication_score}%
                  </span>
                </div>
                <Progress value={scores.communication_score} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <Brain className="w-4 h-4" />
                    Project Defense
                  </span>
                  <span className={`font-medium ${getScoreColor(scores.project_defense_score)}`}>
                    {scores.project_defense_score}%
                  </span>
                </div>
                <Progress value={scores.project_defense_score} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Feedback */}
          <Card>
            <CardHeader>
              <CardTitle>AI Feedback & Recommendations</CardTitle>
              <CardDescription>Areas to focus on for improvement</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3 p-4 rounded-lg bg-green-500/10">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium text-green-700 dark:text-green-400">Strengths</p>
                  <p className="text-sm text-muted-foreground">{scores.strengths}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-500/10">
                <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-700 dark:text-amber-400">Areas for Improvement</p>
                  <p className="text-sm text-muted-foreground">{scores.improvements}</p>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-secondary">
                <p className="font-medium mb-2">Action Plan</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {scores.action_plan.map((item, index) => (
                    <li key={index}>• {item}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild className="flex-1">
              <Link href={`/dashboard/${mode === "placement" ? "placement" : "viva"}`}>
                Practice Again
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" asChild className="flex-1 bg-transparent">
              <Link href="/dashboard/history">View History</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
