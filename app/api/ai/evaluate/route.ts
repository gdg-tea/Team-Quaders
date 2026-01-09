import { createGroq } from "@ai-sdk/groq";
import { generateText } from "ai";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { sessionId } = await req.json();
    const supabase = await createClient();

    // 1. Fetch Session & Messages from DB
    const { data: session } = await supabase
      .from("interview_sessions")
      .select("messages, mode, role, subject, difficulty")
      .eq("id", sessionId)
      .single();

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // 2. Format Transcript for AI
    const transcript = Array.isArray(session.messages)
      ? session.messages
          .map((m: any) => `${m.role.toUpperCase()}: ${m.content}`)
          .join("\n")
      : "No conversation recorded.";

    // 3. Evaluation Prompt
    const systemPrompt = `
      You are an Expert Interview Evaluator.
      
      CONTEXT:
      - Interview Mode: ${session.mode}
      - Target: ${session.role || session.subject} (${session.difficulty || 'Standard'})
      
      TASK:
      Analyze the TRANSCRIPT below. Assign scores (0-100) based on the candidate's actual answers.
      
      OUTPUT FORMAT (Strict JSON only, no markdown):
      {
        "technical_score": number,
        "communication_score": number,
        "project_defense_score": number,
        "overall_score": number,
        "strengths": "string (2 bullet points)",
        "improvements": "string (2 bullet points)",
        "action_plan": ["string", "string", "string"]
      }
    `;

    // 4. Generate Score (Using Groq)
    const { text } = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      system: systemPrompt,
      prompt: `TRANSCRIPT:\n\n${transcript}`,
    });

    // 5. Parse JSON Safely
    const cleanJson = text.replace(/```json/g, "").replace(/```/g, "").trim();
    let evaluation;
    try {
      evaluation = JSON.parse(cleanJson);
    } catch (e) {
      console.error("JSON Parse Error", text);
      evaluation = {
        technical_score: 50,
        communication_score: 50,
        project_defense_score: 50,
        overall_score: 50,
        strengths: "Participation recorded",
        improvements: "Error parsing detailed feedback",
        action_plan: ["Review transcript manually"]
      };
    }

    // 6. Update Database
    const { error } = await supabase
      .from("interview_sessions")
      .update({
        technical_score: evaluation.technical_score,
        communication_score: evaluation.communication_score,
        project_defense_score: evaluation.project_defense_score,
        overall_score: evaluation.overall_score,
        strengths: evaluation.strengths,
        improvements: evaluation.improvements,
        action_plan: evaluation.action_plan,
        status: "completed",
        completed_at: new Date().toISOString()
      })
      .eq("id", sessionId);

    if (error) throw error;

    return NextResponse.json({ success: true, evaluation });

  } catch (error) {
    console.error("Evaluation Error:", error);
    return NextResponse.json({ error: "Failed to evaluate" }, { status: 500 });
  }
}