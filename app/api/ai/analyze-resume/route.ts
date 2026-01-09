import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { createOpenAI } from "@ai-sdk/openai"
import { createClient } from "@/lib/supabase/server"
import { ROLE_SKILLS } from "@/lib/ai-config"
import mammoth from "mammoth"
// @ts-ignore
import PDFParser from "pdf2json"

const grok = createOpenAI({
  baseURL: 'https://api.groq.com/openai/v1',
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { storagePath, resumeId, roles } = await request.json()

    // 1. Download file from Supabase
    const { data: fileData, error: downloadError } = await supabase.storage
      .from("resumes")
      .download(storagePath)

    if (downloadError) {
      console.error("Download Error:", downloadError)
      return NextResponse.json({ error: "Failed to download file" }, { status: 500 })
    }

    // 2. Extract Text
    let extractedText = ""
    const buffer = Buffer.from(await fileData.arrayBuffer())

    try {
      if (storagePath.endsWith(".pdf")) {
        // FIXED: Changed '1' to 'true' to satisfy TypeScript
        extractedText = await new Promise((resolve, reject) => {
          const pdfParser = new PDFParser(null, true); 
          
          pdfParser.on("pdfParser_dataError", (errData: any) => reject(errData.parserError));
          
          pdfParser.on("pdfParser_dataReady", () => {
            const raw = pdfParser.getRawTextContent();
            resolve(raw);
          });
          
          pdfParser.parseBuffer(buffer);
        });
      }
      else if (storagePath.endsWith(".docx")) {
        const result = await mammoth.extractRawText({ buffer })
        extractedText = result.value
      }
    } catch (e) {
      console.error("Text Extraction Error:", e)
      return NextResponse.json({ error: "Failed to read document text" }, { status: 500 })
    }

    // 3. Analyze with Groq
    const { text } = await generateText({
      model: grok("llama-3.3-70b-versatile"),
      system: `You are an expert resume analyzer. Return ONLY a JSON object with this structure:
      {
        "skills": ["skill1", "skill2"],
        "projects": [{ "name": "Project Name", "description": "Desc", "technologies": ["tech"] }],
        "education": "Education Summary",
        "experience": ["Exp 1", "Exp 2"]
      }
      Do not add markdown formatting.`,
      prompt: `Analyze this resume content:\n\n${extractedText.slice(0, 30000)}`,
    })

    // 4. Parse JSON safely
    let parsedData: any = { skills: [], projects: [], education: "", experience: [] }
    try {
      const cleanJson = text.replace(/```json\n?|\n?```/g, "").trim()
      parsedData = JSON.parse(cleanJson)
    } catch (e) {
      console.error("JSON Parse Error:", e)
    }

    // 4.a Compute ATS score and skill gaps (if a role is provided)
    try {
      const selectedRole = Array.isArray(roles) && roles.length > 0 ? roles[0] : null
      if (selectedRole && ROLE_SKILLS[selectedRole]) {
        const required = ROLE_SKILLS[selectedRole]

        // Ensure skills is an array before mapping to avoid runtime errors
        const parsedSkillsArray = Array.isArray(parsedData.skills) ? parsedData.skills : []
        const normalizedParsedSkills = parsedSkillsArray.map((s: any) => String(s).toLowerCase().trim())

        const parsedText = String(extractedText || "").toLowerCase()

        const matched: string[] = []
        const gaps: string[] = []

        for (const req of required) {
          const key = req.toLowerCase()
          const inSkills = normalizedParsedSkills.includes(key)
          const inText = parsedText.includes(key)

          if (inSkills || inText) matched.push(req)
          else gaps.push(req)
        }

        const atsScore = required.length > 0 ? Math.round((matched.length / required.length) * 100) : 0

        parsedData.atsScore = atsScore
        parsedData.skillGaps = gaps
      }
    } catch (e) {
      console.error("ATS Scoring Error:", e)
    }

    // 5. Update Database (include atsScore and skillGaps where available)
    if (resumeId) {
      await supabase.from("resumes").update({
        ...parsedData,
        raw_text: extractedText,
        analyzed_at: new Date().toISOString()
      }).eq("id", resumeId)
    }

    return NextResponse.json({ data: parsedData })
  } catch (error) {
    console.error("Route Error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}