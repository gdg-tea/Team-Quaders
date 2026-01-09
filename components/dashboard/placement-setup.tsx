"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { toast } from "@/hooks/use-toast" // Ensure you have this or use your own toast

const ROLES = [
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Mobile App Developer",
  "Data Scientist",
  "DevOps Engineer"
]

export function PlacementSetup() {
  const [role, setRole] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleStart = async () => {
    if (!role) return

    setLoading(true)
    try {
      // 1. Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      // 2. Create the Session in Supabase
      const { data, error } = await supabase
        .from("interview_sessions")
        .insert({
          user_id: user.id,
          mode: "placement",
          role: role,  // <--- This is crucial for the AI to know the target
          status: "in_progress"
        })
        .select()
        .single()

      if (error) throw error

      // 3. Redirect to the Interview Page with the new Session ID
      router.push(`/dashboard/interview?sessionId=${data.id}`)
      
    } catch (error) {
      console.error(error)
      toast({
        title: "Error",
        description: "Failed to start interview session.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto mt-10">
      <CardHeader>
        <CardTitle>Placement Interview Setup</CardTitle>
        <CardDescription>
          Select the role you are applying for. The AI will analyze your resume projects against this role.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Target Role</label>
          <Select onValueChange={setRole}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a role..." />
            </SelectTrigger>
            <SelectContent>
              {ROLES.map((r) => (
                <SelectItem key={r} value={r}>{r}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button 
          className="w-full" 
          onClick={handleStart} 
          disabled={!role || loading}
        >
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Start Interview
        </Button>
      </CardContent>
    </Card>
  )
}