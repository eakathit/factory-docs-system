import { createClient  } from "@supabase/supabase-js";

const supabaseUrl = 'https://jetvxdskkqrsqbenkkpc.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpldHZ4ZHNra3Fyc3FiZW5ra3BjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA2MDU0MDAsImV4cCI6MjA4NjE4MTQwMH0.rYkpMorz0ujssHReHpMI21dgyLvDRQYgRacqbn7thtk'

export const  supabase = createClient(supabaseUrl, supabaseAnonKey)