import { createClient } from '@supabase/supabase-js'

// สั่งให้ดึงค่าจาก Environment Variables (ทั้งในเครื่องและบน Vercel)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)