import { useEffect, useState, useCallback, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import { Plus, Trash2, ExternalLink, Star } from 'lucide-react'
import clsx from 'clsx'
import { getDaysInMonth } from 'date-fns'
import { RS_ICON_MAP } from '../../components/SocialIcons'

const CONTENT_TYPES = ['Visuel', 'Carrousel', 'Vidéo', 'Story', 'Article', 'Newsletter']
const RS_OPTIONS = [
  { value: 'Instagram', label: 'IG', color: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' },
  { value: 'Instagram Story', label: 'IG', suffix: 'Story', color: 'bg-gradient-to-r from-yellow-400 to-pink-500 text-white' },
  { value: 'Instagram Test', label: 'IG', suffix: 'Test', color: 'bg-gradient-to-r from-purple-400 to-indigo-500 text-white' },
  { value: 'TikTok', label: 'TK', color: 'bg-black text-white' },
  { value: 'Facebook', label: 'FB', color: 'bg-blue-600 text-white' },
  { value: 'YouTube', label: 'YT', color: 'bg-red-600 text-white' },
  { value: 'LinkedIn', label: 'IN', color: 'bg-blue-700 text-white' },
  { value: 'X', label: '𝕏', color: 'bg-gray-900 text-white' },
  { value: 'Strava', label: 'ST', color: 'bg-orange-500 text-white' },
]
const STATUT_EDITO_OPTIONS = [
  { value: 'Fait', color: 'bg-green-100 text-green-800' },
  { value: 'A MàJ', color: 'bg-amber-100 text-amber-800' },
  { value: 'En attente', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'A faire', color: 'bg-red-100 text-red-800' },
  { value: 'Pas besoin', color: 'bg-gray-100 text-gray-500' }
]
const STATUT_RS_OPTIONS = [
  { value: 'Publié', color: 'bg-green-600 text-white' },
  { value: 'Programmé', color: 'bg-blue-600 text-white' },
  { value: 'Prêt à être publié', color: 'bg-emerald-100 text-emerald-800' },
  { value: 'En préparation', color: 'bg-amber-100 text-amber-800' },
  { value: 'En attente de validation', color: 'bg-orange-100 text-orange-800' },
  { value: 'Elements manquants', color: 'bg-red-100 text-red-800' },
  { value: 'Si résultat', color: 'bg-purple-100 text-purple-800' }
]
const MONTHS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']

const CATEGORY_COLORS = {
  'Clubs WLC': 'bg-green-100 text-green-800',
  'Pédagogique': 'bg-blue-100 text-blue-800',
  'Meme': 'bg-yellow-100 text-yellow-800',
  'Sport': 'bg-orange-100 text-orange-800',
  'Partenaires': 'bg-purple-100 text-purple-800',
  'Pratique': 'bg-cyan-100 text-cyan-800',
}

function Stars({ value, onChange }) {
  return (
    <div className="flex gap-0.5 justify-center">
      {[1, 2, 3].map(i => (
        <button key={i} type="button" onClick={() => onChange(value === i ? 0 : i)}
          className={`p-0 ${i <= (value || 0) ? 'text-amber-400' : 'text-gray-300'}`}>
          <Star size={11} fill={i <= (value || 0) ? 'currentColor' : 'none'} />
        </button>
      ))}
    </div>
  )
}

function pct(a, b) {
  if (!a || !b) return '—'
  return (a / b * 100).toFixed(2) + '%'
}

function RsBadge({ platform, size = 14 }) {
  const opt = RS_OPTIONS.find(r => r.value === platform)
  const Icon = RS_ICON_MAP[platform]
  if (!Icon) return <span className="text-[10px] text-gray-400">—</span>
  return (
    <div className="inline-flex items-center gap-1">
      <div className={clsx('inline-flex items-center justify-center w-7 h-7 rounded-lg', opt?.color || 'bg-gray-200')}>
        <Icon size={size} className="text-white" />
      </div>
      {opt?.suffix && <span className="text-[8px] font-bold text-gray-500 uppercase">{opt.suffix}</span>}
    </div>
  )
}

function StatutBadge({ value, options, customColor }) {
  if (!value) return <span className="text-gray-300 text-[10px]">—</span>
  const opt = options.find(o => o.value === value)
  if (customColor) {
    return (
      <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap text-white" style={{ background: customColor }}>
        {value}
      </span>
    )
  }
  return (
    <span className={clsx('text-[9px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap', opt?.color || 'bg-gray-100 text-gray-600')}>
      {value}
    </span>
  )
}

function TeamBadge({ name, customColor, fallbackClass }) {
  if (!name) return null
  if (customColor) {
    return <div className="text-[10px] font-semibold text-white rounded-full px-2 py-0.5 text-center mb-0.5" style={{ background: customColor }}>{name}</div>
  }
  return <div className={clsx('text-[10px] font-semibold rounded-full px-2 py-0.5 text-center mb-0.5', fallbackClass)}>{name}</div>
}

function CategoryBadge({ value, customColor }) {
  if (!value) return null
  if (customColor) {
    return <span className="text-[10px] font-semibold px-2 py-1 rounded-full text-white" style={{ background: customColor }}>{value}</span>
  }
  const fallback = CATEGORY_COLORS[value] || 'bg-gray-100 text-gray-700'
  return <span className={clsx('text-[10px] font-semibold px-2 py-1 rounded-full', fallback)}>{value}</span>
}

export default function PostsTab({ client }) {
  const now = new Date()
  const [view, setView] = useState('publication')
  const [month, setMonth] = useState(now.getMonth())
  const [year, setYear] = useState(now.getFullYear())
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const saveTimers = useRef({})

  const categories = client.options_categories || []
  const avecOptions = client.options_avec || []
  const team = client.options_team || []
  const colorMap = client.options_colors || {}

  const daysInMonth = getDaysInMonth(new Date(year, month))
  const dayOptions = Array.from({ length: daysInMonth }, (_, i) => {
    const d = new Date(year, month, i + 1)
    const label = d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' })
    const value = `${year}-${String(month + 1).padStart(2, '0')}-${String(i + 1).padStart(2, '0')}`
    return { label, value }
  })

  useEffect(() => { loadPosts() }, [client.id, month, year])

  const loadPosts = async () => {
    setLoading(true)
    const start = `${year}-${String(month + 1).padStart(2, '0')}-01T00:00:00`
    const endMonth = month === 11 ? 0 : month + 1
    const endYear = month === 11 ? year + 1 : year
    const end = `${endYear}-${String(endMonth + 1).padStart(2, '0')}-01T00:00:00`
    const { data } = await supabase
      .from('portal_posts').select('*').eq('client_id', client.id)
      .gte('scheduled_at', start).lt('scheduled_at', end)
      .order('scheduled_at', { ascending: true })
    setPosts(data || [])
    setLoading(false)
  }

  const updatePost = useCallback((postId, field, value) => {
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, [field]: value } : p))
    clearTimeout(saveTimers.current[postId + field])
    saveTimers.current[postId + field] = setTimeout(async () => {
      await supabase.from('portal_posts').update({ [field]: value }).eq('id', postId)
    }, 800)
  }, [])

  const addRow = async () => {
    const defaultDate = `${year}-${String(month + 1).padStart(2, '0')}-01T12:00:00+01:00`
    const { data } = await supabase.from('portal_posts')
      .insert({ client_id: client.id, platform: 'Instagram', status: 'brouillon', scheduled_at: defaultDate })
      .select().single()
    if (data) setPosts(prev => [...prev, data])
  }

  const deleteRow = async (id) => {
    await supabase.from('portal_posts').delete().eq('id', id)
    setPosts(prev => prev.filter(p => p.id !== id))
  }

  const getDateValue = (p) => p.scheduled_at?.slice(0, 10) || ''
  const getDateLabel = (p) => {
    if (!p.scheduled_at) return '—'
    const d = new Date(p.scheduled_at)
    return d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })
  }

  const setDate = (post, dateStr) => {
    const hour = post.heure_publi || '12:00'
    updatePost(post.id, 'scheduled_at', `${dateStr}T${hour}:00+01:00`)
  }

  const clientColor = client.color || '#cc0000'

  // Shared cell styles
  const th = "text-[10px] font-bold uppercase tracking-wide px-3 py-2.5 border-b-2 border-white/20 whitespace-nowrap text-left"
  const td = "px-2 py-2 border-b border-gray-100 text-[11px] align-top"
  const input = "w-full px-2 py-1 bg-transparent text-[11px] focus:outline-none focus:bg-white focus:shadow-sm rounded border border-transparent hover:border-gray-200 focus:border-blue-300 transition-colors"
  const sel = "w-full px-1.5 py-1 bg-transparent text-[11px] focus:outline-none focus:bg-white rounded border border-transparent hover:border-gray-200 focus:border-blue-300 transition-colors"

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex items-center gap-3 bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3 flex-wrap">
        <div className="flex bg-gray-100 rounded-xl p-0.5">
          {['publication', 'stats'].map(v => (
            <button key={v} onClick={() => setView(v)}
              className={clsx('px-4 py-1.5 rounded-lg text-xs font-semibold transition-all',
                view === v ? 'text-white shadow-sm' : 'text-gray-500 hover:text-gray-700')}
              style={view === v ? { background: clientColor } : {}}>
              {v === 'publication' ? 'Publications' : 'Stats'}
            </button>
          ))}
        </div>
        <select value={month} onChange={e => setMonth(+e.target.value)}
          className="px-3 py-1.5 bg-gray-100 rounded-xl text-sm font-semibold focus:outline-none">
          {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
        </select>
        <select value={year} onChange={e => setYear(+e.target.value)}
          className="px-3 py-1.5 bg-gray-100 rounded-xl text-sm font-semibold focus:outline-none">
          {[2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <span className="text-xs text-gray-400">{posts.length} pub{posts.length > 1 ? 's' : ''}</span>
        <div className="flex-1" />
        {view === 'publication' && (
          <button onClick={addRow}
            className="flex items-center gap-1.5 px-4 py-1.5 text-white text-xs font-semibold rounded-xl hover:opacity-90 transition-opacity"
            style={{ background: clientColor }}>
            <Plus size={14} /> Ajouter
          </button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Title banner */}
        <div className="text-center py-2 text-white font-bold text-sm tracking-wider uppercase" style={{ background: clientColor }}>
          {view === 'publication' ? 'Publications' : 'Stats par publication'}
        </div>

        <div className="overflow-x-auto bg-white">
          <table className="w-max min-w-full border-collapse">
            <thead>
              <tr style={{ background: clientColor }}>
                <th className={th + ' text-white/90'} style={{ minWidth: 100 }}>Date</th>
                <th className={th + ' text-white/90'} style={{ minWidth: 140 }}>Sujet</th>
                {view === 'publication' ? (
                  <>
                    <th className={th + ' text-white/90'} style={{ minWidth: 200 }}>Wording</th>
                    <th className={th + ' text-white/90'} style={{ minWidth: 100 }}>Catégorie</th>
                    <th className={th + ' text-white/90'} style={{ minWidth: 80 }}>Avec</th>
                    <th className={th + ' text-white/90'} style={{ minWidth: 90 }}>Type</th>
                    <th className={th + ' text-white/90 text-center'} style={{ minWidth: 55 }}>RS</th>
                    <th className={th + ' text-white/90 text-center'} style={{ minWidth: 40 }}>Sp.</th>
                    <th className={th + ' text-white/90'} style={{ minWidth: 80 }}>Qui éd.</th>
                    <th className={th + ' text-white/90'} style={{ minWidth: 75 }}>St. édito</th>
                    <th className={th + ' text-white/90 text-center'} style={{ minWidth: 50 }}>Tps</th>
                    <th className={th + ' text-white/90'} style={{ minWidth: 80 }}>Qui gr.</th>
                    <th className={th + ' text-white/90'} style={{ minWidth: 75 }}>St. graph</th>
                    <th className={th + ' text-white/90 text-center'} style={{ minWidth: 50 }}>Tps</th>
                    <th className={th + ' text-white/90'} style={{ minWidth: 80 }}>Qui pub.</th>
                    <th className={th + ' text-white/90'} style={{ minWidth: 100 }}>Statut RS</th>
                    <th className={th + ' text-white/90'} style={{ minWidth: 60 }}>Heure</th>
                    <th className={th + ' text-white/90 text-center'} style={{ minWidth: 45 }}>Lien</th>
                    <th className={th + ' text-white/90'} style={{ minWidth: 30 }}></th>
                  </>
                ) : (
                  <>
                    <th className={th + ' text-white/90 text-center'} style={{ minWidth: 55 }}>RS</th>
                    <th className={th + ' text-white/90 text-right'} style={{ minWidth: 75 }}>Impr.</th>
                    <th className={th + ' text-white/90 text-right'} style={{ minWidth: 75 }}>Impr. $</th>
                    <th className={th + ' text-white/90 text-right'} style={{ minWidth: 75 }}>Couvert.</th>
                    <th className={th + ' text-white/90 text-right'} style={{ minWidth: 65 }}>Interact.</th>
                    <th className={th + ' text-white/90 text-right'} style={{ minWidth: 65 }}>Tx eng.</th>
                    <th className={th + ' text-white/90 text-right'} style={{ minWidth: 55 }}>Coms</th>
                    <th className={th + ' text-white/90 text-right'} style={{ minWidth: 55 }}>Follows</th>
                    <th className={th + ' text-white/90 text-right'} style={{ minWidth: 55 }}>Partage</th>
                    <th className={th + ' text-white/90 text-right'} style={{ minWidth: 65 }}>Tx part.</th>
                    <th className={th + ' text-white/90 text-right'} style={{ minWidth: 60 }}>Dur. vid</th>
                    <th className={th + ' text-white/90 text-right'} style={{ minWidth: 60 }}>Dur. moy</th>
                    <th className={th + ' text-white/90 text-right'} style={{ minWidth: 60 }}>Tx vis.</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={20} className="text-center py-16 text-gray-400 text-sm">Chargement...</td></tr>
              ) : posts.length === 0 ? (
                <tr><td colSpan={20} className="text-center py-16 text-gray-400 text-sm">Aucun post ce mois</td></tr>
              ) : posts.map((p, idx) => (
                <tr key={p.id} className={clsx('group transition-colors', idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/60', 'hover:bg-blue-50/40')}>
                  {/* Date */}
                  <td className={td + ' font-medium text-gray-700'}>
                    <select value={getDateValue(p)} onChange={e => setDate(p, e.target.value)} className={sel + ' font-medium'}>
                      <option value="">—</option>
                      {dayOptions.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                    </select>
                  </td>
                  {/* Sujet */}
                  <td className={td + ' font-semibold text-gray-800'}>
                    <input value={p.sujet || ''} onChange={e => updatePost(p.id, 'sujet', e.target.value)} className={input + ' font-semibold'} />
                  </td>

                  {view === 'publication' ? (
                    <>
                      <td className={td}><textarea value={p.wording || p.caption || ''} onChange={e => updatePost(p.id, 'wording', e.target.value)}
                        className={input + ' resize-none text-gray-600'} rows={2} /></td>
                      <td className={td}>
                        <CategoryBadge value={p.categorie} customColor={colorMap.col_categorie?.[p.categorie]} />
                        <select value={p.categorie || ''} onChange={e => updatePost(p.id, 'categorie', e.target.value)}
                          className={sel + ' mt-0.5'} style={{ opacity: p.categorie ? 0.4 : 1 }}>
                          <option value="">—</option>
                          {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </td>
                      <td className={td}><select value={p.avec || ''} onChange={e => updatePost(p.id, 'avec', e.target.value)} className={sel}>
                        <option value="">—</option>{avecOptions.map(a => <option key={a} value={a}>{a}</option>)}</select></td>
                      <td className={td}><select value={p.content_type || ''} onChange={e => updatePost(p.id, 'content_type', e.target.value)} className={sel}>
                        <option value="">—</option>{CONTENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select></td>
                      <td className={td + ' text-center align-middle'}>
                        <div className="relative group/rs inline-block">
                          <RsBadge platform={p.platform} size={14} />
                          <select value={p.platform || ''} onChange={e => updatePost(p.id, 'platform', e.target.value)}
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full">
                            <option value="">—</option>
                            {RS_OPTIONS.map(r => <option key={r.value} value={r.value}>{r.suffix ? `${r.label} ${r.suffix}` : r.label}</option>)}
                          </select>
                        </div>
                      </td>
                      <td className={td + ' text-center align-middle'}>
                        <input type="checkbox" checked={p.sponso || false} onChange={e => updatePost(p.id, 'sponso', e.target.checked)}
                          className="w-4 h-4 accent-orange-500 rounded" />
                        {p.sponso && <div className="text-[8px] font-bold text-orange-600 mt-0.5">Sponso</div>}
                      </td>
                      <td className={td}>
                        <TeamBadge name={p.qui_edito} customColor={colorMap.col_team?.[p.qui_edito]} fallbackClass="text-blue-700 bg-blue-100" />
                        <select value={p.qui_edito || ''} onChange={e => updatePost(p.id, 'qui_edito', e.target.value)}
                          className={sel} style={{ opacity: p.qui_edito ? 0.3 : 1 }}>
                          <option value="">—</option>{team.map(t => <option key={t} value={t}>{t}</option>)}</select>
                      </td>
                      <td className={td + ' text-center'}><StatutBadge value={p.statut_edito} options={STATUT_EDITO_OPTIONS} customColor={colorMap.col_statut_edito?.[p.statut_edito]} />
                        <select value={p.statut_edito || ''} onChange={e => updatePost(p.id, 'statut_edito', e.target.value)}
                          className={sel + ' mt-0.5'} style={{ opacity: 0.3 }}>
                          <option value="">—</option>{STATUT_EDITO_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.value}</option>)}</select></td>
                      <td className={td}><Stars value={p.temps_edito} onChange={v => updatePost(p.id, 'temps_edito', v)} /></td>
                      <td className={td}>
                        <TeamBadge name={p.qui_graph} customColor={colorMap.col_team?.[p.qui_graph]} fallbackClass="text-green-700 bg-green-100" />
                        <select value={p.qui_graph || ''} onChange={e => updatePost(p.id, 'qui_graph', e.target.value)}
                          className={sel} style={{ opacity: p.qui_graph ? 0.3 : 1 }}>
                          <option value="">—</option>{team.map(t => <option key={t} value={t}>{t}</option>)}</select>
                      </td>
                      <td className={td + ' text-center'}><StatutBadge value={p.statut_graph} options={STATUT_EDITO_OPTIONS} customColor={colorMap.col_statut_edito?.[p.statut_graph]} />
                        <select value={p.statut_graph || ''} onChange={e => updatePost(p.id, 'statut_graph', e.target.value)}
                          className={sel + ' mt-0.5'} style={{ opacity: 0.3 }}>
                          <option value="">—</option>{STATUT_EDITO_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.value}</option>)}</select></td>
                      <td className={td}><Stars value={p.temps_graph} onChange={v => updatePost(p.id, 'temps_graph', v)} /></td>
                      <td className={td}>
                        <TeamBadge name={p.qui_publi} customColor={colorMap.col_team?.[p.qui_publi]} fallbackClass="text-purple-700 bg-purple-100" />
                        <select value={p.qui_publi || ''} onChange={e => updatePost(p.id, 'qui_publi', e.target.value)}
                          className={sel} style={{ opacity: p.qui_publi ? 0.3 : 1 }}>
                          <option value="">—</option>{team.map(t => <option key={t} value={t}>{t}</option>)}</select>
                      </td>
                      <td className={td + ' text-center'}><StatutBadge value={p.statut_rs} options={STATUT_RS_OPTIONS} customColor={colorMap.col_statut_rs?.[p.statut_rs]} />
                        <select value={p.statut_rs || ''} onChange={e => updatePost(p.id, 'statut_rs', e.target.value)}
                          className={sel + ' mt-0.5'} style={{ opacity: 0.3 }}>
                          <option value="">—</option>{STATUT_RS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.value}</option>)}</select></td>
                      <td className={td + ' text-center text-gray-600'}><input type="time" value={p.heure_publi || ''} onChange={e => updatePost(p.id, 'heure_publi', e.target.value)} className={input + ' text-center'} /></td>
                      <td className={td + ' text-center'}>
                        {(p.lien_publi || p.visual_url) ? (
                          <a href={p.lien_publi || p.visual_url} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors">
                            <ExternalLink size={13} />
                          </a>
                        ) : <span className="text-gray-300">—</span>}
                      </td>
                      <td className={td + ' text-center'}>
                        <button onClick={() => deleteRow(p.id)} className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition-all p-1 rounded hover:bg-red-50">
                          <Trash2 size={12} />
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className={td + ' text-center'}><RsBadge platform={p.platform} size={14} /></td>
                      <td className={td + ' text-right font-medium text-gray-700'}><input type="number" value={p.impressions ?? ''} onChange={e => updatePost(p.id, 'impressions', +e.target.value || null)} className={input + ' text-right'} /></td>
                      <td className={clsx(td, 'text-right', !p.sponso && 'bg-gray-100')}>{p.sponso ? <input type="number" value={p.impressions_payees ?? ''} onChange={e => updatePost(p.id, 'impressions_payees', +e.target.value || null)} className={input + ' text-right'} /> : null}</td>
                      <td className={td + ' text-right font-medium text-gray-700'}><input type="number" value={p.couverture ?? ''} onChange={e => updatePost(p.id, 'couverture', +e.target.value || null)} className={input + ' text-right'} /></td>
                      <td className={td + ' text-right'}><input type="number" value={p.interactions ?? ''} onChange={e => updatePost(p.id, 'interactions', +e.target.value || null)} className={input + ' text-right'} /></td>
                      <td className={td + ' text-right text-[10px] font-semibold text-emerald-600 bg-emerald-50/50'}>{pct(p.interactions, p.couverture)}</td>
                      <td className={td + ' text-right'}><input type="number" value={p.coms ?? ''} onChange={e => updatePost(p.id, 'coms', +e.target.value || null)} className={input + ' text-right'} /></td>
                      <td className={td + ' text-right'}><input type="number" value={p.follows ?? ''} onChange={e => updatePost(p.id, 'follows', +e.target.value || null)} className={input + ' text-right'} /></td>
                      <td className={td + ' text-right'}><input type="number" value={p.partage ?? ''} onChange={e => updatePost(p.id, 'partage', +e.target.value || null)} className={input + ' text-right'} /></td>
                      <td className={td + ' text-right text-[10px] font-semibold text-blue-600 bg-blue-50/50'}>{pct(p.partage, p.couverture)}</td>
                      <td className={clsx(td, 'text-right', p.content_type !== 'Vidéo' && 'bg-gray-100')}>{p.content_type === 'Vidéo' ? <input type="number" value={p.duree_video ?? ''} onChange={e => updatePost(p.id, 'duree_video', +e.target.value || null)} className={input + ' text-right'} step="0.1" /> : null}</td>
                      <td className={clsx(td, 'text-right', p.content_type !== 'Vidéo' && 'bg-gray-100')}>{p.content_type === 'Vidéo' ? <input type="number" value={p.duree_moyenne ?? ''} onChange={e => updatePost(p.id, 'duree_moyenne', +e.target.value || null)} className={input + ' text-right'} step="0.1" /> : null}</td>
                      <td className={clsx(td, 'text-right text-[10px] font-semibold', p.content_type === 'Vidéo' ? 'text-purple-600 bg-purple-50/50' : 'bg-gray-100')}>{p.content_type === 'Vidéo' ? pct(p.duree_moyenne, p.duree_video) : null}</td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
