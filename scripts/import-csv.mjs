import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const supabase = createClient(
  'https://zymnlsgtvyjawatcpoma.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp5bW5sc2d0dnlqYXdhdGNwb21hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDgxODMzOCwiZXhwIjoyMDkwMzk0MzM4fQ.placeholder'
)

// On va d'abord enlever la contrainte platform, créer le client, puis importer
// Mais on a besoin du service_role key pour bypasser RLS.
// Utilisons plutôt l'anon key et faisons les insertions directes via SQL.

console.log('Ce script nécessite la service_role key de Supabase.')
console.log('Alternative: on va parser le CSV et générer du SQL INSERT.')

// --- Parse CSV ---
const csvPath = process.argv[2]
if (!csvPath) { console.error('Usage: node import-csv.mjs <path-to-csv>'); process.exit(1) }

const raw = readFileSync(csvPath, 'utf-8')

// Simple CSV parser qui gère les champs entre guillemets avec retours à la ligne
function parseCSV(text) {
  const rows = []
  let current = []
  let field = ''
  let inQuotes = false

  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (inQuotes) {
      if (ch === '"' && text[i + 1] === '"') { field += '"'; i++ }
      else if (ch === '"') { inQuotes = false }
      else { field += ch }
    } else {
      if (ch === '"') { inQuotes = true }
      else if (ch === ',') { current.push(field.trim()); field = '' }
      else if (ch === '\n') { current.push(field.trim()); rows.push(current); current = []; field = '' }
      else if (ch !== '\r') { field += ch }
    }
  }
  if (field || current.length) { current.push(field.trim()); rows.push(current) }
  return rows
}

const rows = parseCSV(raw)
const headers = rows[1] // Row 1 is the header
console.log('Headers:', headers.slice(0, 20))
console.log(`Total rows: ${rows.length - 2}`)

// Map column indices
const colIdx = (name) => headers.findIndex(h => h.toLowerCase().includes(name.toLowerCase()))
const iDate = colIdx('date')
const iSujet = colIdx('sujet')
const iWording = colIdx('wording')
const iCategorie = colIdx('catégorie') !== -1 ? colIdx('catégorie') : colIdx('categorie')
const iType = colIdx('type de contenu')
const iRS = colIdx('RS')
const iStatutRS = colIdx('statut rs') !== -1 ? colIdx('statut rs') : headers.findIndex(h => h === 'Statut RS')
const iHeure = colIdx('heure')
const iLien = colIdx('lien de la publication')
const iImpressions = headers.findIndex(h => h === 'Impressions')
const iCouverture = colIdx('couverture')
const iInteractions = colIdx('interactions')
const iComs = colIdx('coms')
const iFollows = colIdx('follows')
const iPartage = colIdx('partage')

console.log(`Indices - Date:${iDate} Sujet:${iSujet} RS:${iRS} StatutRS:${iStatutRS} Lien:${iLien}`)

// Parse date like "jeu. 1 janv." → 2026-01-01
const MONTHS = { 'janv': '01', 'fév': '02', 'mars': '03', 'avr': '04', 'mai': '05', 'juin': '06',
  'juil': '07', 'août': '08', 'sept': '09', 'oct': '10', 'nov': '11', 'déc': '12' }

function parseDate(dateStr, year = 2026) {
  if (!dateStr) return null
  const match = dateStr.match(/(\d+)\s+(\w+)/)
  if (!match) return null
  const day = match[1].padStart(2, '0')
  const monthKey = Object.keys(MONTHS).find(k => match[2].startsWith(k))
  if (!monthKey) return null
  return `${year}-${MONTHS[monthKey]}-${day}`
}

// Map platform
function mapPlatform(rs) {
  if (!rs) return null
  const lower = rs.toLowerCase().trim()
  if (lower.includes('instagram') || lower === 'story insta') return 'Instagram'
  if (lower === 'facebook') return 'Facebook'
  if (lower === 'tiktok') return 'TikTok'
  if (lower === 'youtube') return 'YouTube'
  if (lower === 'strava') return 'Strava'
  if (lower === 'x') return 'X'
  return rs
}

// Parse number with spaces "48 432" → 48432
function parseNum(s) {
  if (!s) return 0
  return parseInt(s.replace(/\s/g, '').replace(',', '.')) || 0
}

// Generate SQL
const sqlLines = []
const statsLines = []

// CLIENT_ID placeholder - will be replaced after getting the actual ID
sqlLines.push(`-- Supprimer contrainte platform`)
sqlLines.push(`ALTER TABLE portal_posts DROP CONSTRAINT IF EXISTS portal_posts_platform_check;`)
sqlLines.push(``)
sqlLines.push(`-- Créer le client Škoda WLC`)
sqlLines.push(`INSERT INTO portal_clients (name, slug, type, status, color, bio, rs_instagram, rs_tiktok, rs_facebook, rs_youtube)`)
sqlLines.push(`VALUES ('Škoda We Love Cycling', 'skoda-wlc', 'Marque', 'actif', '#4da43a', 'Le programme vélo de Škoda France', '@skodawelovecyclingfrance', '@skodawelovecyclingfrance', 'SkodaWeLoveCyclingFrance', '@SkodaWeLoveCyclingFrance')`)
sqlLines.push(`ON CONFLICT (slug) DO NOTHING;`)
sqlLines.push(``)
sqlLines.push(`-- Importer les posts`)

let postCount = 0
for (let i = 2; i < rows.length; i++) {
  const row = rows[i]
  if (!row || row.length < 10) continue

  const dateStr = row[iDate]
  const date = parseDate(dateStr)
  if (!date) continue

  const sujet = row[iSujet]?.replace(/'/g, "''") || ''
  const wording = row[iWording]?.replace(/'/g, "''") || ''
  const platform = mapPlatform(row[iRS])
  if (!platform) continue

  const caption = wording || sujet
  const lien = row[iLien]?.trim() || ''
  const heure = row[iHeure]?.trim() || '12h'
  const hour = parseInt(heure) || 12
  const scheduledAt = `${date}T${String(hour).padStart(2, '0')}:00:00+01:00`

  const status = 'publie' // All are published in this CSV

  sqlLines.push(`INSERT INTO portal_posts (client_id, platform, status, caption, visual_url, scheduled_at)`)
  sqlLines.push(`VALUES ((SELECT id FROM portal_clients WHERE slug = 'skoda-wlc'), '${platform}', '${status}', '${caption.slice(0, 500)}', '${lien.replace(/'/g, "''")}', '${scheduledAt}');`)

  // Stats
  const impressions = parseNum(row[iImpressions])
  const reach = parseNum(row[iCouverture])
  const engagement = parseNum(row[iInteractions])
  const follows = parseNum(row[iFollows])

  if (impressions > 0 || reach > 0) {
    statsLines.push(`INSERT INTO portal_stats (client_id, platform, impressions, reach, engagement, followers, date)`)
    statsLines.push(`VALUES ((SELECT id FROM portal_clients WHERE slug = 'skoda-wlc'), '${platform}', ${impressions}, ${reach}, ${engagement}, ${follows}, '${date}');`)
  }

  postCount++
}

sqlLines.push(``)
sqlLines.push(`-- Importer les stats par publication`)
sqlLines.push(...statsLines)

console.log(`\n${postCount} posts parsés`)
console.log(`${statsLines.length / 2} stats parsées`)

// Write SQL file
import { writeFileSync } from 'fs'
const outputPath = csvPath.replace('.csv', '_import.sql')
writeFileSync(outputPath, sqlLines.join('\n'), 'utf-8')
console.log(`\nSQL généré: ${outputPath}`)
console.log('Copiez-collez le contenu dans Supabase SQL Editor et exécutez.')
