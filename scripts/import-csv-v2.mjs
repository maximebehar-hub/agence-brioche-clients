import { readFileSync, writeFileSync } from 'fs'

const csvPath = process.argv[2]
if (!csvPath) { console.error('Usage: node import-csv-v2.mjs <path-to-csv>'); process.exit(1) }

const raw = readFileSync(csvPath, 'utf-8')

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
const headers = rows[1]

const col = (name) => headers.findIndex(h => h && h.toLowerCase().includes(name.toLowerCase()))
const iDate = 0, iSujet = 1, iWording = 2, iCategorie = 3, iAvec = 4, iContentType = 5, iRS = 6, iSponso = 7
const iQuiEdito = 8, iStatutEdito = 9, iTempsEdito = 10, iQuiGraph = 11, iStatutGraph = 12, iTempsGraph = 13
const iQuiPubli = 14, iStatutRS = 15, iMoment = 16, iHeure = 17, iLien = 18
const iImpr = col('Impressions'), iImprPayees = headers.findIndex(h => h === 'Impressions payées')
const iCouv = col('Couverture'), iInter = col('Interactions')
const iComs = col('Coms'), iFollows = col('Follows'), iPartage = col('Partage')
const iDureeVideo = col('Durée vidéo'), iDureeMoy = col('Durée moyenne')

const MONTHS_FR = { 'janv': '01', 'fév': '02', 'mars': '03', 'avr': '04', 'mai': '05', 'juin': '06',
  'juil': '07', 'août': '08', 'sept': '09', 'oct': '10', 'nov': '11', 'déc': '12' }

function parseDate(s) {
  if (!s) return null
  const m = s.match(/(\d+)\s+(\w+)/)
  if (!m) return null
  const day = m[1].padStart(2, '0')
  const mk = Object.keys(MONTHS_FR).find(k => m[2].startsWith(k))
  return mk ? `2026-${MONTHS_FR[mk]}-${day}` : null
}

function mapPlatform(rs) {
  if (!rs) return null
  const l = rs.toLowerCase().trim()
  if (l.includes('instagram') && !l.includes('story')) return 'Instagram'
  if (l === 'story insta' || l === 'story') return 'Story Insta'
  if (l === 'facebook') return 'Facebook'
  if (l === 'tiktok') return 'TikTok'
  if (l === 'youtube') return 'YouTube'
  if (l === 'strava') return 'Strava'
  if (l === 'x') return 'X'
  return rs
}

function esc(s) { return (s || '').replace(/'/g, "''") }
function num(s) { return parseInt((s || '0').replace(/\s/g, '').replace(',', '.')) || 0 }
function numF(s) {
  if (!s) return null
  const v = parseFloat(s.replace(/\s/g, '').replace(',', '.').replace('s', ''))
  return isNaN(v) ? null : v
}
function stars(s) {
  if (!s) return 'NULL'
  const count = (s.match(/★/g) || []).length
  return count > 0 ? count : 'NULL'
}

const lines = []
lines.push(`-- Supprimer ancien import si nécessaire`)
lines.push(`DELETE FROM portal_posts WHERE client_id = (SELECT id FROM portal_clients WHERE slug = 'skoda-wlc');`)
lines.push(``)

let count = 0
for (let i = 2; i < rows.length; i++) {
  const r = rows[i]
  if (!r || r.length < 10) continue
  const date = parseDate(r[iDate])
  if (!date) continue
  const platform = mapPlatform(r[iRS])
  if (!platform) continue

  const heure = r[iHeure]?.trim() || '12h'
  const h = parseInt(heure) || 12
  const heureStr = `${String(h).padStart(2, '0')}:00`
  const scheduledAt = `${date}T${heureStr}:00+01:00`
  const sponso = r[iSponso]?.toLowerCase().includes('sponso') ? 'true' : 'false'

  const cols = `client_id, platform, status, scheduled_at, sujet, wording, categorie, avec, content_type, sponso, qui_edito, statut_edito, temps_edito, qui_graph, statut_graph, temps_graph, qui_publi, statut_rs, heure_publi, lien_publi, impressions, impressions_payees, couverture, interactions, coms, follows, partage, duree_video, duree_moyenne`

  const vals = [
    `(SELECT id FROM portal_clients WHERE slug = 'skoda-wlc')`,
    `'${esc(platform)}'`,
    `'publie'`,
    `'${scheduledAt}'`,
    `'${esc(r[iSujet])}'`,
    `'${esc(r[iWording])}'`,
    `'${esc(r[iCategorie])}'`,
    `'${esc(r[iAvec])}'`,
    `'${esc(r[iContentType])}'`,
    sponso,
    `'${esc(r[iQuiEdito])}'`,
    `'${esc(r[iStatutEdito])}'`,
    stars(r[iTempsEdito]),
    `'${esc(r[iQuiGraph])}'`,
    `'${esc(r[iStatutGraph])}'`,
    stars(r[iTempsGraph]),
    `'${esc(r[iQuiPubli])}'`,
    `'${esc(r[iStatutRS])}'`,
    `'${heureStr}'`,
    `'${esc(r[iLien])}'`,
    num(r[iImpr]) || 'NULL',
    num(r[iImprPayees]) || 'NULL',
    num(r[iCouv]) || 'NULL',
    num(r[iInter]) || 'NULL',
    num(r[iComs]) || 'NULL',
    num(r[iFollows]) || 'NULL',
    num(r[iPartage]) || 'NULL',
    numF(r[iDureeVideo]) ?? 'NULL',
    numF(r[iDureeMoy]) ?? 'NULL'
  ].join(', ')

  lines.push(`INSERT INTO portal_posts (${cols}) VALUES (${vals});`)
  count++
}

console.log(`${count} posts parsés avec toutes les colonnes`)
const outPath = csvPath.replace('.csv', '_import_v2.sql')
writeFileSync(outPath, lines.join('\n'), 'utf-8')
console.log(`SQL: ${outPath}`)
