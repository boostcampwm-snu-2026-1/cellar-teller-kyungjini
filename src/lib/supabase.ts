import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { isStaticDemo } from '../config/appMode'

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

let client: SupabaseClient | null = null

export function getSupabase(): SupabaseClient {
  if (isStaticDemo) {
    throw new Error('Supabase is not available in static demo mode.')
  }

  if (!client) {
    client = createClient(requiredEnv('VITE_SUPABASE_URL'), requiredEnv('VITE_SUPABASE_ANON_KEY'))
  }

  return client
}
