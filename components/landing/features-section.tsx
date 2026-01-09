"use client"

import { Brain, GraduationCap, Briefcase, LineChart, Volume2, FileUp, Zap, Target } from "lucide-react"

const features = [
  {
    icon: Brain,
    title: "Hybrid AI Engine",
    description: "Gemini for deep reasoning, Grok for real-time conversation. Auto-switches for optimal performance.",
  },
  {
    icon: Briefcase,
    title: "Placement Mode",
    description: "Questions based on your resume projects, skills, and target role. Practice for campus placements.",
  },
  {
    icon: GraduationCap,
    title: "Viva Mode (GTU)",
    description: "Subject-wise questions aligned with Gujarat Technological University syllabus.",
  },
  {
    icon: LineChart,
    title: "Performance Analytics",
    description: "Track your progress with interactive graphs showing improvement over time.",
  },
  {
    icon: Volume2,
    title: "Voice Interaction",
    description: "Speak naturally with Indian English accent recognition and neural voice responses.",
  },
  {
    icon: FileUp,
    title: "Resume Analysis",
    description: "Upload your resume and get AI-extracted insights for personalized interviews.",
  },
  {
    icon: Zap,
    title: "Instant Scoring",
    description: "Get immediate feedback on technical accuracy, communication, and project defense.",
  },
  {
    icon: Target,
    title: "Adaptive Difficulty",
    description: "Easy, Medium, Hard modes that adjust based on your skill level.",
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 bg-secondary/30">
      <div className="container px-4 mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Everything You Need to <span className="text-primary">Ace Your Interview</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            A comprehensive platform designed specifically for Indian students preparing for campus placements and
            university vivas.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-6 rounded-2xl bg-card border border-border hover:border-primary/50 hover:shadow-lg transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
