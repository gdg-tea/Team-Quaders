"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Briefcase, GraduationCap, CheckCircle } from "lucide-react"

export function ModesSection() {
  return (
    <section className="py-24">
      <div className="container px-4 mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Two Powerful Modes</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Choose between placement interview preparation or academic viva practice
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Placement Mode */}
          <Card className="relative overflow-hidden border-2 hover:border-primary transition-colors">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl" />
            <CardHeader>
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                <Briefcase className="w-7 h-7 text-primary" />
              </div>
              <CardTitle className="text-2xl">Placement Interview</CardTitle>
              <CardDescription>For campus placement preparation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <span className="text-sm">Resume-based questions about your projects</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <span className="text-sm">Role-specific technical challenges</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <span className="text-sm">HR and behavioral rounds</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <span className="text-sm">Company-specific preparation tips</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 pt-4">
                <Badge variant="secondary">Full Stack</Badge>
                <Badge variant="secondary">Backend</Badge>
                <Badge variant="secondary">Data Science</Badge>
                <Badge variant="secondary">+7 more</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Viva Mode */}
          <Card className="relative overflow-hidden border-2 hover:border-accent transition-colors">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-2xl" />
            <CardHeader>
              <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mb-4">
                <GraduationCap className="w-7 h-7 text-accent" />
              </div>
              <CardTitle className="text-2xl">Academic Viva</CardTitle>
              <CardDescription>GTU syllabus-aligned questions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-accent mt-0.5 shrink-0" />
                  <span className="text-sm">Year-wise subject selection</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-accent mt-0.5 shrink-0" />
                  <span className="text-sm">GTU curriculum coverage</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-accent mt-0.5 shrink-0" />
                  <span className="text-sm">Adaptive difficulty levels</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-accent mt-0.5 shrink-0" />
                  <span className="text-sm">Unit-wise topic focus</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 pt-4">
                <Badge variant="secondary">DBMS</Badge>
                <Badge variant="secondary">OS</Badge>
                <Badge variant="secondary">CN</Badge>
                <Badge variant="secondary">+7 more</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
