import { createClient } from '@supabase/supabase-js'

type SupabaseEnvKey = 'VITE_SUPABASE_URL' | 'VITE_SUPABASE_ANON_KEY'

function requiredEnv(name: SupabaseEnvKey): string {
  const value = import.meta.env[name]

  if (!value) {
    throw new Error(
      `Missing Supabase configuration: ${name}. Add it to .env using .env.example as a template.`,
    )
  }

  return value
}

const supabaseUrl = requiredEnv('VITE_SUPABASE_URL')
const supabaseAnonKey = requiredEnv('VITE_SUPABASE_ANON_KEY')

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
