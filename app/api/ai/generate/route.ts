import { createGroq } from "@ai-sdk/groq";
import { generateText } from "ai"; // We use generateText (blocking) instead of streamText
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt, mode, role, subject, difficulty, final } = body; // Read parameters safely
    
    const supabase = await createClient();

    // 1. Auth Check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Fetch Resume (Only if in placement mode)
    let resumeContext = "";
    if (mode === "placement") {
      const { data: resume } = await supabase
        .from("resumes")
        .select("skills, projects")
        .eq("user_id", user.id)
        .single();

      if (resume) {
        // Format projects for the AI
        const projects = Array.isArray(resume.projects) 
          ? resume.projects.map((p: any) => `${p.name}: ${p.description || ''}`).join("\n") 
          : "No specific projects found.";
          
        const skills = Array.isArray(resume.skills) 
          ? resume.skills.join(", ") 
          : resume.skills;

        resumeContext = `
        CANDIDATE RESUME CONTEXT:
        - Skills: ${skills}
        - Projects: ${projects}
        `;
      }
    }

    // 3. Define the System Persona
    let systemPrompt = "";
    
    if (final) {
      systemPrompt = `
      You are an Interview Evaluator. The candidate has just answered the final question.
      TASK:
      - Provide a concise review of the candidate's last answer in 2-4 short sentences.
      - Offer a brief appreciation sentence (one line) and 1-2 quick suggestions for improvement.
      - Do NOT ask any further questions.
      - Keep tone professional and encouraging.
      `
    } else if (mode === "placement") {
      systemPrompt = `
      You are a strict Technical Interviewer for the role of '${role}'.
      ${resumeContext}
      
      INSTRUCTIONS:
      1. Use the 'Candidate Resume Context' above.
      2. Ask a specific question about a Project or Skill listed in their resume.
      3. Example: "I see you used [Skill] in [Project]. How did you handle [Specific Problem]?"
      4. Keep your response concise (2-3 sentences max).
      5. Speak in a professional Indian English tone.
      `;
    } else {
      systemPrompt = `
      You are a strict External Examiner from GTU conducting a Viva for '${subject}' (Year: ${difficulty || '3rd'}).
      
      INSTRUCTIONS:
      1. Ask theoretical definitions and curriculum-based questions for the subject '${subject}'.
      2. If the student is wrong, correct them immediately.
      3. Keep your response concise (2-3 sentences max).
      `;
    }

    // 4. Generate the Text (Blocking, not Streaming)
    const { text } = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      system: systemPrompt,
      prompt: prompt || "Start the interview.", // Ensure prompt is never empty
    });

    // 5. Return JSON (Matches your frontend)
    return NextResponse.json({ response: text });

  } catch (error) {
    console.error("AI Generation Error:", error);
    return NextResponse.json({ error: "Failed to generate response" }, { status: 500 });
  }
}