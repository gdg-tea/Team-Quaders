"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/providers/auth-provider"
import { createClient } from "@/lib/supabase/client"
import { Mic, MicOff, Volume2, VolumeX, Clock, ArrowLeft, Loader2 } from "lucide-react"

// REMOVED the "web-speech-api" import to fix your error

interface InterviewSessionProps {
  mode: "placement" | "viva"
  role?: string
  year?: string
  subject?: string
  difficulty?: string
}

interface Message {
  role: "interviewer" | "candidate"
  content: string
  timestamp: Date
}

const MAX_QUESTIONS = 5; // DEMO LIMIT

export function InterviewSession({ mode, role, year, subject, difficulty }: InterviewSessionProps) {
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isEvaluating, setIsEvaluating] = useState(false) 
  const [messages, setMessages] = useState<Message[]>([])
  const [currentTranscript, setCurrentTranscript] = useState("")
  const [elapsedTime, setElapsedTime] = useState(0)
  const [questionCount, setQuestionCount] = useState(0)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [resumeContext, setResumeContext] = useState<string>("")
  const [showFinalize, setShowFinalize] = useState(false)
  const [finalQuestionCount, setFinalQuestionCount] = useState<number | null>(null)
  
  // Changed ref to 'any' to fix type errors without installing packages
  const recognitionRef = useRef<any>(null)
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const keepListeningRef = useRef(false)
  const waitingForConclusionRef = useRef(false)
  
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  const supabase = createClient()

  // Timer
  useEffect(() => {
    const timer = setInterval(() => setElapsedTime((prev) => prev + 1), 1000)
    return () => clearInterval(timer)
  }, [])

  // Cleanup speech on unmount
  useEffect(() => {
    return () => {
      try { if (typeof window !== 'undefined' && 'speechSynthesis' in window) speechSynthesis.cancel() } catch (e) {}
    }
  }, [])

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // 1. Initialize Session
  useEffect(() => {
    const initSession = async () => {
      if (!user) return
      try {
        // Create session in DB
        const response = await fetch("/api/sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mode, role, year, subject, difficulty }),
        })
        const { session } = await response.json()
        if (session) setSessionId(session.id)

        // Fetch Resume (for Placement Mode)
        if (mode === 'placement') {
          const { data: resumes } = await supabase
            .from("resumes")
            .select("skills, projects, education, experience")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(1)

          if (resumes && resumes.length > 0) {
            const r = resumes[0]
            setResumeContext(`Skills: ${r.skills}; Projects: ${JSON.stringify(r.projects)}`)
          }
        }
      } catch (error) {
        console.error("Session init failed:", error)
      }
    }
    initSession()
  }, [user, mode, role, year, subject, difficulty, supabase])

  // 2. Initial Greeting
  useEffect(() => {
    const generateGreeting = async () => {
      if (messages.length > 0) return
      setIsLoading(true)
      const greeting = mode === "placement"
        ? `Hello! I am your interviewer for the ${role} role. Let's start. Tell me about yourself.`
        : `Hello! Starting your Viva for ${subject}. Define the core concept of this subject.`;

      // Local UI update
      addMessage("interviewer", greeting)
      speak(greeting)
      setQuestionCount(1)

      // Persist greeting to DB if session created
      if (sessionId) {
        try {
          const greetingMsg = [{ role: "interviewer", content: greeting, timestamp: new Date().toISOString() }]
          await supabase.from("interview_sessions").update({ messages: greetingMsg }).eq("id", sessionId)
        } catch (e) {
          console.error("Failed to save greeting:", e)
        }
      }

      setIsLoading(false)
    }
    const timer = setTimeout(generateGreeting, 1000)
    return () => clearTimeout(timer)
  }, [mode, role, subject, sessionId, messages.length]) // eslint-disable-line

  // Helper Functions
  const addMessage = (role: "interviewer" | "candidate", content: string) => {
    setMessages((prev) => [...prev, { role, content, timestamp: new Date() }])
  }

  const speak = (text: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window && !isMuted) {
      try { speechSynthesis.cancel() } catch (e) {}
      setIsSpeaking(true)
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = "en-IN" // Indian Accent
      utterance.onend = () => setIsSpeaking(false)
      synthRef.current = utterance
      speechSynthesis.speak(utterance)
    }
  }

  // 3. Speech Recognition
  const startListening = useCallback(() => {
    if (showFinalize) {
      // Finalization pending — don't accept more answers
      return
    }
    // Cast window to any to avoid TS errors
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      alert("Speech not supported in this browser. Please use Chrome, Edge, or Safari.")
      return
    }
    
    const SpeechAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    recognitionRef.current = new SpeechAPI()
    recognitionRef.current.lang = "en-IN"
    // keep listening across short pauses; we'll restart onend if needed
    recognitionRef.current.continuous = true
    recognitionRef.current.interimResults = true
    recognitionRef.current.maxAlternatives = 1

    recognitionRef.current.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error)
      if (event.error === 'network') {
        toast({ title: "Network Error", description: "Check your internet connection", variant: "destructive" })
      } else if (event.error === 'no-speech') {
        // User didn't speak, but don't show error - just continue listening
      } else {
        toast({ title: "Mic Error", description: `Error: ${event.error}`, variant: "destructive" })
      }
    }

    recognitionRef.current.onresult = (event: any) => {
      let interimTranscript = ""
      let finalTranscript = ""
      
      // Get all accumulated final transcripts up to the current point
      for (let i = 0; i < event.resultIndex; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript + " "
        }
      }
      
      // Get the current interim result (if any)
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript + " "
        } else {
          interimTranscript += event.results[i][0].transcript
        }
      }

      // Combine final and interim for display
      const displayText = (finalTranscript + interimTranscript).trim()
      setCurrentTranscript(displayText)
    }

    // restart recognition on end to survive short pauses, unless user stopped
    recognitionRef.current.onend = () => {
      setIsListening(false)
      if (keepListeningRef.current) {
        try {
          setTimeout(() => {
            try { recognitionRef.current?.start() } catch (e) { /* ignore */ }
            setIsListening(true)
          }, 300)
        } catch (e) {
          console.warn("Error restarting recognition:", e)
        }
      }
    }

    // start
    try {
      recognitionRef.current.start()
      // clear any previous interim transcript and begin
      setCurrentTranscript("")
      setIsListening(true)
      keepListeningRef.current = true
    } catch (e) {
      console.error("Error starting speech recognition:", e)
      toast({ title: "Microphone Error", description: "Could not start microphone. Check permissions.", variant: "destructive" })
    }
  }, [messages, questionCount, showFinalize, toast]) // eslint-disable-line

  const stopListening = (sendTranscript = false) => {
    try {
      // indicate user intentionally stopped listening
      keepListeningRef.current = false
      recognitionRef.current?.stop()
    } catch (e) {
      console.warn("stopListening error", e)
    }
    setIsListening(false)

    if (sendTranscript && currentTranscript && currentTranscript.trim().length > 0) {
      const transcriptToSend = currentTranscript.trim()
      setCurrentTranscript("")
      // fire-and-forget; handleCandidateResponse will manage loading/state
      void handleCandidateResponse(transcriptToSend)
    }
  }

  // 4. Handle Candidate Answer & Check Limit
  const handleCandidateResponse = async (answer: string) => {
    stopListening()
    
    // NOTE: We allow processing of the final answer — we'll end after handling it.
    setIsLoading(true)
    
    // Optimistic Update
    const userMsgObject: Message = { role: "candidate", content: answer, timestamp: new Date() }
    const updatedMessages = [...messages, userMsgObject]
    setMessages(updatedMessages)

    try {
      // 1. Save CANDIDATE message to DB
      if (sessionId) {
        await supabase.from("interview_sessions").update({
          messages: updatedMessages
        }).eq("id", sessionId)
      }
      // 2. Call AI
      const isFinalAnswer = questionCount >= MAX_QUESTIONS
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `History: ${JSON.stringify(updatedMessages)}\nUser said: ${answer}`,
          mode, role, subject, difficulty,
          context: resumeContext,
          final: isFinalAnswer,
        })
      })
      const data = await res.json()

      if (data.response) {
        const aiResponse = data.response

        // 3. Update UI
        const aiMsgObject: Message = { role: "interviewer", content: aiResponse, timestamp: new Date() }
        const finalMessages = [...updatedMessages, aiMsgObject]

        setMessages(finalMessages)
        speak(aiResponse)

        // Persist AI message
        if (sessionId) {
          await supabase.from("interview_sessions").update({ messages: finalMessages }).eq("id", sessionId)
        }

        if (isFinalAnswer) {
          // This was the candidate's answer to the final question — AI returned a short review.
          setFinalQuestionCount(questionCount)
          setShowFinalize(true)
          return
        } else {
          // Normal flow: AI asked the next question — increment question count
          setQuestionCount((prev) => prev + 1)
        }
      }
    } catch (e) {
      console.error(e)
      toast({ title: "Error", description: "AI failed to respond.", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  // 5. End Interview & Calculate Score
  const handleEndInterview = async (finalQuestionCount?: number) => {
    stopListening()
    setIsEvaluating(true)

    const proceedToEvaluate = async () => {
      try {
        const questionsToSend = typeof finalQuestionCount === 'number' ? finalQuestionCount : questionCount

        // Save metrics to database
        if (sessionId) {
          try {
            await supabase.from("interview_sessions").update({
              question_count: questionsToSend,
              duration: elapsedTime
            }).eq("id", sessionId)
          } catch (e) {
            console.warn("Failed to save metrics:", e)
          }
        }

        const response = await fetch("/api/ai/evaluate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId })
        })

        if (!response.ok) throw new Error("Evaluation failed")

        router.push(`/dashboard/results?sessionId=${sessionId}&questions=${questionsToSend}&time=${elapsedTime}&mode=${mode}`)
      } catch (error) {
        console.error("End interview error:", error)
        toast({ title: "Error", description: "Could not generate score.", variant: "destructive" })
        router.push(`/dashboard/results?sessionId=${sessionId}&questions=${questionCount}&time=${elapsedTime}&mode=${mode}`)
      }
    }

    try {
      // 1. Ask AI to provide a short concluding summary as the interviewer/faculty
      try {
        const transcriptForAI = JSON.stringify(messages)
        const genRes = await fetch("/api/ai/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: `TRANSCRIPT: ${transcriptForAI}\nPlease provide a concluding summary as the interviewer/faculty.`,
            mode, role, subject, difficulty,
            context: resumeContext,
            final: true,
          })
        })

        const genData = await genRes.json()
        if (genData?.response) {
          const conclusion = genData.response
          const conclusionMsg: Message = { role: "interviewer", content: conclusion, timestamp: new Date() }
          const withConclusion = [...messages, conclusionMsg]
          setMessages(withConclusion)

          if (sessionId) {
            try {
              await supabase.from("interview_sessions").update({ messages: withConclusion }).eq("id", sessionId)
            } catch (e) {
              console.error("Failed to save conclusion message:", e)
            }
          }

          // If muted, skip speaking and immediately evaluate
          if (isMuted || typeof window === 'undefined' || !('speechSynthesis' in window)) {
            await proceedToEvaluate()
            return
          }

          // Otherwise, speak conclusion and wait for end before evaluating
          waitingForConclusionRef.current = true
          try {
            speechSynthesis.cancel()
          } catch (e) {}
          const utter = new SpeechSynthesisUtterance(conclusion)
          utter.lang = 'en-IN'
          utter.onend = async () => {
            waitingForConclusionRef.current = false
            await proceedToEvaluate()
          }
          synthRef.current = utter
          speechSynthesis.speak(utter)
        } else {
          // no conclusion, evaluate immediately
          await proceedToEvaluate()
        }
      } catch (e) {
        console.warn("Could not generate final conclusion:", e)
        await proceedToEvaluate()
      }
    } catch (error) {
      console.error("End interview flow error:", error)
      await proceedToEvaluate()
    }
  }

  if (isEvaluating) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-background space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <h2 className="text-xl font-semibold">Analyzing your performance...</h2>
        <p className="text-muted-foreground">Generating detailed scorecard</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="h-16 border-b flex items-center justify-between px-6">
        <div className="flex items-center gap-2">
           <Button variant="ghost" onClick={() => router.back()}><ArrowLeft /></Button>
           <span className="font-bold"> Interview ({questionCount}/{MAX_QUESTIONS})</span>
        </div>
        <div className="flex gap-4">
           <Badge variant="outline"><Clock className="w-4 h-4 mr-1"/> {Math.floor(elapsedTime / 60)}:{(elapsedTime % 60).toString().padStart(2, '0')}</Badge>
           <Button variant="destructive" size="sm" onClick={() => handleEndInterview()}>End Interview</Button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-w-3xl mx-auto w-full">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'candidate' ? 'justify-end' : 'justify-start'}`}>
            <div className={`p-4 rounded-xl max-w-[80%] ${m.role === 'candidate' ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>
              {m.content}
            </div>
          </div>
        ))}
        {isListening && currentTranscript && (
          <div className="flex justify-end">
            <div className="p-4 rounded-xl max-w-[80%] bg-primary/80 text-primary-foreground">
              {currentTranscript}
              <span className="ml-2 animate-pulse">▌</span>
            </div>
          </div>
        )}
        {isLoading && <div className="text-sm text-muted-foreground animate-pulse">AI is thinking...</div>}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-6 border-t bg-background/95 backdrop-blur">
        <div className="max-w-md mx-auto flex justify-center gap-6">
          <Button size="icon" variant="outline" onClick={async () => {
            const newMuted = !isMuted
            if (newMuted && typeof window !== "undefined" && "speechSynthesis" in window) {
              try { speechSynthesis.cancel() } catch (e) { /* ignore */ }
              setIsSpeaking(false)
            }
            setIsMuted(newMuted)

            // If we were waiting for the spoken conclusion, skip speech and evaluate immediately
            if (newMuted && waitingForConclusionRef.current) {
              waitingForConclusionRef.current = false
              try {
                const response = await fetch("/api/ai/evaluate", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ sessionId })
                })
                // ignore response status and navigate regardless
              } catch (e) {
                console.error("Evaluation after mute failed:", e)
              }
              const questionsToSend = questionCount
              router.push(`/dashboard/results?sessionId=${sessionId}&questions=${questionsToSend}&time=${elapsedTime}&mode=${mode}`)
            }
          }} disabled={showFinalize}>
            {isMuted ? <VolumeX /> : <Volume2 />}
          </Button>

            {!showFinalize ? (
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-center">
                    <Button
                      size="lg"
                      className="h-16 w-16 rounded-full"
                      onClick={() => startListening()}
                      title="Start listening"
                      aria-label="Start listening"
                      disabled={isListening || showFinalize}
                    >
                      <Mic className="h-8 w-8" />
                    </Button>
                    <span className="text-xs mt-2 text-muted-foreground">Start</span>
                  </div>

                  <div className="flex flex-col items-center">
                    <Button
                      size="lg"
                      className={`h-16 w-16 rounded-full ${isListening ? 'bg-red-500 animate-pulse' : ''}`}
                      onClick={() => stopListening(true)}
                      title="Stop and submit answer"
                      aria-label="Stop and submit answer"
                      disabled={!isListening || showFinalize}
                    >
                      <MicOff className="h-8 w-8" />
                    </Button>
                    <span className="text-xs mt-2 text-muted-foreground">Stop</span>
                  </div>
                </div>
              </div>
            ) : (
            <div className="w-full text-center">
             <p className="text-sm mb-2 text-muted-foreground">Final question recorded. Click to get your score.</p>
             <Button size="lg" onClick={() => {
              setShowFinalize(false)
              handleEndInterview(finalQuestionCount ?? questionCount)
             }}>
              Get your score
             </Button>
            </div>
          )}
        </div>
        <p className="text-center mt-2 text-xs text-muted-foreground">
          {isListening ? `Listening... "${currentTranscript}"` : showFinalize ? "Awaiting finalization" : "Click mic to answer"}
        </p>
      </div>
    </div>
  )
}