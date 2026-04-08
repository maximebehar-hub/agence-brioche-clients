import { readFileSync } from 'fs'

const SUPABASE_URL = 'https://zymnlsgtvyjawatcpoma.supabase.co'
// We need the service_role key to bypass RLS. Let's try with the REST SQL endpoint.
// Alternative: split into small batches and use the Supabase management API

const sqlPath = process.argv[2]
if (!sqlPath) { console.error('Usage: node run-sql.mjs <path-to-sql>'); process.exit(1) }

const sql = readFileSync(sqlPath, 'utf-8')

// Split into individual statements
const statements = sql.split(/;\s*\n/).filter(s => s.trim() && !s.trim().startsWith('--'))

console.log(`${statements.length} statements to execute`)

// Try using the Supabase Management API (requires access token from dashboard)
// Or we use the pg connection string directly

// Actually, let's use supabase-js with the anon key but wrap in a function
// that runs as postgres role via rpc

const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp5bW5sc2d0dnlqYXdhdGNwb21hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4MTgzMzgsImV4cCI6MjA5MDM5NDMzOH0.j8DUcuQ3Opxj_JeUsiL-zylK13GKdqmTgIbkKbJwSUg'

// Use the Supabase SQL API (only available for service role, not anon)
// Let's just output individual curl commands instead

console.log('\n=== Copy-paste these batches into Supabase SQL Editor ===\n')

// Split into batches of ~20 statements
const batchSize = 30
for (let i = 0; i < statements.length; i += batchSize) {
  const batch = statements.slice(i, i + batchSize)
  console.log(`\n--- Batch ${Math.floor(i/batchSize) + 1} (${batch.length} statements) ---`)
  console.log(batch.join(';\n') + ';')
}
