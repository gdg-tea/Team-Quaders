"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { GTU_SUBJECTS, DIFFICULTY_LEVELS } from "@/lib/ai-config"
import { GraduationCap, ArrowRight, CheckCircle, BookOpen } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function VivaSetup() {
  const [selectedYear, setSelectedYear] = useState("3rd Year")
  const [selectedSubject, setSelectedSubject] = useState("")
  const [selectedDifficulty, setSelectedDifficulty] = useState("")
  const router = useRouter()

  const handleStart = () => {
    if (selectedSubject && selectedDifficulty) {
      router.push(
        `/dashboard/interview?mode=viva&year=${encodeURIComponent(selectedYear)}&subject=${encodeURIComponent(selectedSubject)}&difficulty=${selectedDifficulty}`,
      )
    }
  }

  const subjects = GTU_SUBJECTS[selectedYear as keyof typeof GTU_SUBJECTS] || []

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Academic Viva</h1>
        <p className="text-muted-foreground">Practice GTU syllabus-aligned viva questions</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Year & Subject Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Select Subject
            </CardTitle>
            <CardDescription>Choose your academic year and subject</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Tabs
              value={selectedYear}
              onValueChange={(v) => {
                setSelectedYear(v)
                setSelectedSubject("")
              }}
            >
              <TabsList className="w-full">
                <TabsTrigger value="3rd Year" className="flex-1">
                  3rd Year
                </TabsTrigger>
                <TabsTrigger value="4th Year" className="flex-1">
                  4th Year
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <RadioGroup value={selectedSubject} onValueChange={setSelectedSubject}>
              <div className="space-y-3">
                {subjects.map((subject) => (
                  <div key={subject.id}>
                    <RadioGroupItem value={subject.id} id={subject.id} className="peer sr-only" />
                    <Label
                      htmlFor={subject.id}
                      className="flex items-center justify-between rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary cursor-pointer transition-all"
                    >
                      <div>
                        <p className="font-medium">{subject.name}</p>
                        <p className="text-xs text-muted-foreground">{subject.units} Units</p>
                      </div>
                      {selectedSubject === subject.id && <CheckCircle className="w-5 h-5 text-primary" />}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Difficulty Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5" />
              Select Difficulty
            </CardTitle>
            <CardDescription>Choose the complexity level for your viva</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <RadioGroup value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
              <div className="space-y-3">
                {DIFFICULTY_LEVELS.map((level) => (
                  <div key={level.id}>
                    <RadioGroupItem value={level.id} id={level.id} className="peer sr-only" />
                    <Label
                      htmlFor={level.id}
                      className="flex items-center justify-between rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary cursor-pointer transition-all"
                    >
                      <div>
                        <p className="font-medium">{level.name}</p>
                        <p className="text-xs text-muted-foreground">{level.description}</p>
                      </div>
                      {selectedDifficulty === level.id && <CheckCircle className="w-5 h-5 text-primary" />}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>

            <Button
              onClick={handleStart}
              disabled={!selectedSubject || !selectedDifficulty}
              size="lg"
              className="w-full"
            >
              Start Viva
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
