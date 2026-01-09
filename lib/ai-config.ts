// AI Configuration for Hybrid AI Orchestrator
export const AI_CONFIG = {
  /*gemini: {
    apiKey: "AIzaSyAlPhBfXaCL-sXIhEV-iD3qRmERSmjR03M",
    models: {
      flash: "gemini-2.5-flash",
      flashLite: "gemini-2.5-flash-lite",
      tts: "gemini-2.5-flash-tts",
    },
  },*/
  grok: {
    apiKey: "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",
    models: {
      small: "llama-3.1-8b-instant",
      large: "llama-3.3-70b-versatile",
    },
  },
}

// GTU Syllabus Data
export const GTU_SUBJECTS = {
  "3rd Year": [
    { id: "dbms", name: "Database Management Systems (DBMS)", units: 5 },
    { id: "os", name: "Operating Systems", units: 5 },
    { id: "cn", name: "Computer Networks", units: 5 },
    { id: "se", name: "Software Engineering", units: 5 },
    { id: "daa", name: "Design & Analysis of Algorithms", units: 5 },
  ],
  "4th Year": [
    { id: "ml", name: "Machine Learning", units: 5 },
    { id: "ai", name: "Artificial Intelligence", units: 5 },
    { id: "cc", name: "Cloud Computing", units: 5 },
    { id: "is", name: "Information Security", units: 5 },
    { id: "bdp", name: "Big Data Processing", units: 5 },
  ],
}

export const DIFFICULTY_LEVELS = [
  { id: "easy", name: "Easy", description: "Definitions and basic concepts" },
  { id: "medium", name: "Medium", description: "Comparative analysis and applications" },
  { id: "hard", name: "Hard", description: "System design and applied logic" },
]

export const TARGET_ROLES = [
  "Full Stack Developer",
  "Backend Developer",
  "Frontend Developer",
  "Data Scientist",
  "Machine Learning Engineer",
  "DevOps Engineer",
  "Cloud Engineer",
  "Software Engineer",
  "Mobile Developer",
  "QA Engineer",
]

// Basic expected skills per role used for simple ATS scoring and gap detection.
// These are intentionally conservative / illustrative; adjust to your needs.
export const ROLE_SKILLS: Record<string, string[]> = {
  "Full Stack Developer": [
    "JavaScript",
    "TypeScript",
    "React",
    "Node.js",
    "HTML",
    "CSS",
    "SQL",
    "REST",
  ],
  "Backend Developer": ["Node.js", "Python", "Django", "Flask", "SQL", "REST", "APIs"],
  "Frontend Developer": ["JavaScript", "TypeScript", "React", "Vue", "HTML", "CSS", "Accessibility"],
  "Data Scientist": ["Python", "Pandas", "NumPy", "scikit-learn", "Statistics", "Machine Learning"],
  "Machine Learning Engineer": ["Python", "TensorFlow", "PyTorch", "ML", "Model Deployment"],
  "DevOps Engineer": ["Docker", "Kubernetes", "CI/CD", "Terraform", "AWS", "Monitoring"],
  "Cloud Engineer": ["AWS", "Azure", "GCP", "Cloud Architecture", "Terraform"],
  "Software Engineer": ["Algorithms", "Data Structures", "Testing", "Design Patterns", "Git"],
  "Mobile Developer": ["Android", "iOS", "React Native", "Swift", "Kotlin"],
  "QA Engineer": ["Testing", "Automation", "Selenium", "Cypress", "Test Planning"],
}
