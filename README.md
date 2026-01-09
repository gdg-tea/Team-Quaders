# InterviewAI: Hybrid-Cloud Adaptive Interview & Viva Platform

A next-generation educational platform designed to simulate high-pressure academic (Viva) and professional (Placement) interview environments for Indian students.

## Features

- **AI-Powered Interviews**: Claude AI for intelligent conversation and evaluation
- **Resume-Aware**: Questions tailored to your actual projects and skills
- **GTU Syllabus-Aligned**: Viva questions specific to Gujarat Technological University curriculum
- **Indian English Accent**: Speech recognition calibrated for en-IN
- **Instant Feedback**: Detailed scorecards with performance analytics
- **Dark/Light Theme**: Eye-friendly design for long study sessions
- **Real-time Database**: All sessions, scores, and history persisted in Supabase

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **Authentication**: Supabase Auth (Email/Password + Google OAuth)
- **Database**: Supabase PostgreSQL with Row Level Security
- **Storage**: Supabase Storage for resume files
- **AI**: Vercel AI SDK with Claude (Anthropic)
- **Speech**: Web Speech API (en-IN)

## Project Structure

```
├── app/
│   ├── globals.css                    # Global styles with theme tokens
│   ├── layout.tsx                     # Root layout with providers
│   ├── page.tsx                       # Landing page
│   ├── login/
│   │   └── page.tsx                   # Authentication page
│   ├── api/
│   │   ├── ai/
│   │   │   ├── generate/
│   │   │   │   └── route.ts           # AI interview response generation
│   │   │   ├── analyze-resume/
│   │   │   │   └── route.ts           # Resume analysis endpoint
│   │   │   └── evaluate/
│   │   │       └── route.ts           # Interview evaluation endpoint
│   │   └── sessions/
│   │       ├── route.ts               # Create/list sessions
│   │       └── [id]/
│   │           └── route.ts           # Get/update single session
│   └── dashboard/
│       ├── page.tsx                   # Dashboard overview (server component)
│       ├── resume/
│       │   └── page.tsx               # Resume upload & analysis
│       ├── placement/
│       │   └── page.tsx               # Placement interview setup
│       ├── viva/
│       │   └── page.tsx               # Academic viva setup
│       ├── interview/
│       │   └── page.tsx               # Live interview session
│       ├── results/
│       │   └── page.tsx               # Interview results & feedback
│       ├── history/
│       │   └── page.tsx               # Session history
│       └── settings/
│           └── page.tsx               # User settings
│
├── components/
│   ├── auth/
│   │   └── login-form.tsx             # Email/Google authentication
│   ├── dashboard/
│   │   ├── dashboard-layout.tsx       # Dashboard shell with sidebar
│   │   ├── dashboard-overview.tsx     # Dashboard home with real stats
│   │   ├── resume-upload.tsx          # Resume upload & AI analysis
│   │   ├── placement-setup.tsx        # Role selection for placement
│   │   ├── viva-setup.tsx             # Subject/difficulty selection
│   │   ├── history-view.tsx           # Session history from database
│   │   └── settings-view.tsx          # User preferences
│   ├── interview/
│   │   ├── interview-session.tsx      # Live interview UI with AI
│   │   └── results-view.tsx           # Scorecard & feedback display
│   ├── landing/
│   │   ├── navbar.tsx                 # Landing page navigation
│   │   ├── hero-section.tsx           # Hero with CTAs
│   │   ├── features-section.tsx       # Feature grid
│   │   ├── modes-section.tsx          # Placement vs Viva comparison
│   │   └── footer.tsx                 # Site footer
│   ├── providers/
│   │   ├── auth-provider.tsx          # Supabase auth context
│   │   └── theme-provider.tsx         # Next-themes provider
│   └── ui/
│       ├── theme-toggle.tsx           # Dark/light mode switch
│       └── [shadcn components]        # Button, Card, Badge, etc.
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts                  # Browser Supabase client
│   │   ├── server.ts                  # Server Supabase client
│   │   └── middleware.ts              # Auth middleware helpers
│   ├── ai-config.ts                   # GTU subjects, difficulty levels, roles
│   └── utils.ts                       # Utility functions (cn)
│
├── scripts/
│   ├── 001_create_tables.sql          # Database schema & RLS policies
│   └── 002_profile_trigger.sql        # Auto-create profile on signup
│
├── hooks/
│   ├── use-toast.ts                   # Toast notifications
│   └── use-mobile.tsx                 # Mobile detection
│
├── proxy.ts                           # Next.js middleware for auth
│
└── README.md                          # This file
```

## Database Schema

### Tables

#### `profiles`
- `id` (UUID, PK) - References auth.users
- `email` (TEXT)
- `full_name` (TEXT)
- `avatar_url` (TEXT)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

#### `resumes`
- `id` (UUID, PK)
- `user_id` (UUID, FK)
- `file_name` (TEXT)
- `file_url` (TEXT)
- `file_size` (INTEGER)
- `skills` (TEXT[])
- `projects` (JSONB)
- `education` (TEXT)
- `experience` (TEXT[])
- `raw_text` (TEXT)
- `analyzed_at` (TIMESTAMP)
- `created_at` (TIMESTAMP)

#### `interview_sessions`
- `id` (UUID, PK)
- `user_id` (UUID, FK)
- `mode` (TEXT) - 'placement' or 'viva'
- `role` (TEXT) - For placement mode
- `year` (TEXT) - For viva mode
- `subject` (TEXT) - For viva mode
- `difficulty` (TEXT) - For viva mode
- `messages` (JSONB) - Conversation history
- `status` (TEXT) - 'in_progress', 'completed', 'abandoned'
- `question_count` (INTEGER)
- `duration_seconds` (INTEGER)
- `technical_score` (INTEGER)
- `communication_score` (INTEGER)
- `project_defense_score` (INTEGER)
- `overall_score` (INTEGER)
- `strengths` (TEXT)
- `improvements` (TEXT)
- `action_plan` (TEXT[])
- `started_at` (TIMESTAMP)
- `completed_at` (TIMESTAMP)

### Row Level Security (RLS)

All tables have RLS enabled with policies ensuring users can only access their own data:
- SELECT: `auth.uid() = user_id` (or `id` for profiles)
- INSERT: `auth.uid() = user_id`
- UPDATE: `auth.uid() = user_id`
- DELETE: `auth.uid() = user_id`

## API Routes

### AI Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/ai/generate` | POST | Generate AI interview responses |
| `/api/ai/analyze-resume` | POST | Extract skills/projects from resume |
| `/api/ai/evaluate` | POST | Score and evaluate interview session |

### Session Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/sessions` | GET | List user's interview sessions |
| `/api/sessions` | POST | Create new interview session |
| `/api/sessions/[id]` | GET | Get single session details |
| `/api/sessions/[id]` | PATCH | Update session (messages, scores) |

## Environment Variables

```env
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Supabase Dev Redirect (Optional - for email confirmation)
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000/dashboard
```

## User Flow

1. **Sign Up/Login** → Supabase Auth (Email or Google)
2. **Upload Resume** → Supabase Storage → Claude Analysis
3. **Select Mode** → Placement (Role) or Viva (Subject + Difficulty)
4. **Interview Session** → Voice input (en-IN) → Claude AI → Voice response
5. **End Interview** → Claude Evaluation → Scores saved to database
6. **Review History** → Track progress over time with real data

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Connect Supabase integration in v0
4. Run the SQL scripts in `/scripts` folder to create tables
5. Run development server: `npm run dev`
6. Open [http://localhost:3000](http://localhost:3000)

## Security

- All database operations use Row Level Security (RLS)
- Authentication handled by Supabase Auth
- Server-side session validation on protected routes
- Middleware refreshes auth tokens automatically

## License

MIT
