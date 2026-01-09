import { createClient } from "@/lib/supabase/client"

const supabaseUrl = "https://teloxapuhtggblhcddic.supabase.co"
const supabaseAnonKey = "sb_publishable_Wn2ThlIhxAmYFx9psH2yOA_S816pFza"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const BUCKET_ID = "resumes"
