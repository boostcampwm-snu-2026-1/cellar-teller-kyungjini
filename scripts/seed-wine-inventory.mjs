import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createClient } from '@supabase/supabase-js'

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..')

loadDotenv(resolve(rootDir, '.env'))

const supabaseUrl = requiredEnv('VITE_SUPABASE_URL')
const supabaseAnonKey = requiredEnv('VITE_SUPABASE_ANON_KEY')
const seedPath = resolve(rootDir, 'supabase/seed-wines.json')
const wines = JSON.parse(readFileSync(seedPath, 'utf8'))

const supabase = createClient(supabaseUrl, supabaseAnonKey)

const { data, error } = await supabase
  .from('wines')
  .upsert(wines, { onConflict: 'id' })
  .select('id')

if (error) {
  throw new Error(`Failed to seed wines: ${error.message}`)
}

console.log(`Seeded ${data?.length ?? wines.length} wine records.`)

function loadDotenv(path) {
  let envText

  try {
    envText = readFileSync(path, 'utf8')
  } catch {
    return
  }

  for (const line of envText.split(/\r?\n/)) {
    const match = /^\s*([A-Za-z_][A-Za-z0-9_]*)=(.*)\s*$/.exec(line)

    if (!match || process.env[match[1]]) {
      continue
    }

    process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, '')
  }
}

function requiredEnv(name) {
  const value = process.env[name]

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }

  return value
}
