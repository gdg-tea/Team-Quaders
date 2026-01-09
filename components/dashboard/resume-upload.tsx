"use client"

import type React from "react"
import { useState, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/components/providers/auth-provider"
import { FileText, Upload, Loader2, CheckCircle, X, Sparkles, Code, Briefcase, GraduationCap } from "lucide-react"
import { TARGET_ROLES } from "@/lib/ai-config"
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select"

interface ResumeData {
  skills: string[]
  projects: { name: string; description: string; technologies: string[] }[]
  education: string
  experience: string[]
  atsScore?: number
  skillGaps?: string[]
}

export function ResumeUpload() {
  
  const [file, setFile] = useState<File | null>(null)
  const [role, setRole] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [resumeData, setResumeData] = useState<ResumeData | null>(null)
  const { user } = useAuth()
  const { toast } = useToast()
  const supabase = createClient()

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      const droppedFile = e.dataTransfer.files[0]
      if (droppedFile && (droppedFile.type === "application/pdf" || droppedFile.name.endsWith(".docx"))) {
        setFile(droppedFile)
      } else {
        toast({
          title: "Invalid file",
          description: "Please upload a PDF or DOCX file",
          variant: "destructive",
        })
      }
    },
    [toast],
  )

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
    }
  }

  // single role selection using Select

  const handleUpload = async () => {
    if (!file || !user) return

    setUploading(true)
    try {
      const fileName = `${user.id}/${Date.now()}-${file.name}`

      // 1. Upload to Supabase Storage with upsert
      const { error: uploadError } = await supabase.storage
        .from("resumes")
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true 
        })

      if (uploadError) throw uploadError

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("resumes").getPublicUrl(fileName)

      // 2. Create resume record in database
      const { data: resumeRecord, error: insertError } = await supabase
        .from("resumes")
        .insert({
          user_id: user.id,
          file_name: file.name,
          file_url: publicUrl,
          file_size: file.size,
          roles: role ? [role] : null,
        })
        .select()
        .single()

      if (insertError) throw insertError

      toast({
        title: "Resume uploaded!",
        description: "Now analyzing your resume...",
      })

      setAnalyzing(true)

      // 3. Call AI Analysis API
      const response = await fetch("/api/ai/analyze-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storagePath: fileName,
          resumeId: resumeRecord.id,
          roles: role ? [role] : [],
        }),
      })

      // Check if the response is actually JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const errorText = await response.text();
        console.error("Server Error (HTML):", errorText);
        throw new Error("Server error. Check terminal for details.");
      }

      // FIXED: Read JSON only ONCE
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Analysis failed");
      }

      // 4. Update UI with Data
      const analyzedData = result.data; // Get data from the already parsed JSON

      if (analyzedData) {
        setResumeData(analyzedData)
        toast({
          title: "Analysis complete!",
          description: "Your resume has been processed",
        })
      }
    } catch (error: any) {
      console.error("Upload/Analysis error:", error)
      toast({
        title: "Process failed",
        description: error.message || "Please try again",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
      setAnalyzing(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Resume Analysis</h1>
        <p className="text-muted-foreground">Upload your resume to get personalized interview questions</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Upload Resume
            </CardTitle>
            <CardDescription>Supported formats: PDF, DOCX (Max 5MB)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">Select role for this resume</p>
                <Select value={role ?? undefined} onValueChange={(v) => setRole(v)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {TARGET_ROLES.map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer relative"
            >
              {file ? (
                <div className="flex items-center justify-center gap-3">
                  <FileText className="w-8 h-8 text-primary" />
                  <div className="text-left">
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation()
                      setFile(null)
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
                  <p className="font-medium mb-1">Drag and drop your resume</p>
                  <p className="text-sm text-muted-foreground mb-4">or click to browse</p>
                </>
              )}
              <input
                type="file"
                accept=".pdf,.docx"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>

            <Button onClick={handleUpload} disabled={!file || !role || uploading || analyzing} className="w-full">
              {uploading || analyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {uploading ? "Uploading..." : "Analyzing..."}
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Analyze Resume
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Analysis Results */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              AI Analysis
            </CardTitle>
            <CardDescription>Extracted information from your resume</CardDescription>
          </CardHeader>
          <CardContent>
            {resumeData ? (
              <div className="space-y-6">
                {resumeData.atsScore !== undefined && (
                  <div className="flex items-center justify-between p-4 rounded-lg bg-amber-600 text-white shadow-sm dark:bg-amber-500">
                    <div className="flex items-center gap-3">
                      <FileText className="w-6 h-6 text-white" />
                      <div>
                        <p className="text-sm font-semibold">ATS Score</p>
                        <p className="text-2xl font-extrabold leading-none">{Math.round(resumeData.atsScore || 0)}%</p>
                      </div>
                    </div>
                    {resumeData.skillGaps && resumeData.skillGaps.length > 0 && (
                      <div className="text-sm font-medium text-white/90">{resumeData.skillGaps.length} skill gap(s) detected</div>
                    )}
                  </div>
                )}

                {resumeData.skillGaps && resumeData.skillGaps.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Skill Gaps</h4>
                    <div className="flex flex-wrap gap-2">
                      {resumeData.skillGaps.map((gap) => (
                        <Badge key={gap} className="bg-red-600 text-white px-3 py-1 rounded-full text-sm">
                          {gap}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="font-medium flex items-center gap-2 mb-2">
                    <Code className="w-4 h-4" />
                    Skills Detected
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {resumeData.skills.map((skill) => (
                      <Badge key={skill} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium flex items-center gap-2 mb-2">
                    <Briefcase className="w-4 h-4" />
                    Projects
                  </h4>
                  <div className="space-y-3">
                    {resumeData.projects.map((project, i) => (
                      <div key={i} className="p-3 rounded-lg bg-secondary/50">
                        <p className="font-medium">{project.name}</p>
                        <p className="text-sm text-muted-foreground mb-2">{project.description}</p>
                        <div className="flex flex-wrap gap-1">
                          {project.technologies.map((tech) => (
                            <Badge key={tech} variant="outline" className="text-xs">
                              {tech}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium flex items-center gap-2 mb-2">
                    <GraduationCap className="w-4 h-4" />
                    Education
                  </h4>
                  <p className="text-sm">{resumeData.education}</p>
                </div>

                <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/10 text-primary">
                  <CheckCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">Ready for personalized interviews!</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Upload your resume to see AI-extracted insights</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}