"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles, Mic, FileText, BarChart3 } from "lucide-react"
import Link from "next/link"

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />

      {/* Animated orb */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 left-1/4 w-72 h-72 bg-accent/20 rounded-full blur-3xl animate-pulse delay-1000" />

      <div className="relative z-10 container px-4 mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-primary">Powered by Hybrid AI (Gemini + Grok)</span>
        </div>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 text-balance">
          <span className="text-foreground">Master Your</span>
          <br />
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Interview Skills
          </span>
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 text-pretty">
          AI-powered interview simulation platform designed for Indian students. Practice placement interviews and
          university vivas with real-time feedback and Indian English accent support.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Button asChild size="lg" className="text-lg px-8">
            <Link href="/login">
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="text-lg px-8 bg-transparent">
            <Link href="#features">Learn More</Link>
          </Button>
        </div>

        {/* Feature cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 mx-auto">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Resume-Aware</h3>
            <p className="text-sm text-muted-foreground">Questions tailored to your actual projects and skills</p>
          </div>

          <div className="p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 mx-auto">
              <Mic className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Indian Accent</h3>
            <p className="text-sm text-muted-foreground">Calibrated for Indian English speech recognition</p>
          </div>

          <div className="p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 mx-auto">
              <BarChart3 className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Instant Feedback</h3>
            <p className="text-sm text-muted-foreground">Detailed scorecards with performance analytics</p>
          </div>
        </div>
      </div>
    </section>
  )
}
