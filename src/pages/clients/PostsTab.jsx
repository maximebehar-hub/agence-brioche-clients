import { useEffect, useState, useCallback, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import { Plus, Trash2, ExternalLink, Star } from 'lucide-react'
import clsx from 'clsx'
import { getDaysInMonth } from 'date-fns'
import { RS_ICON_MAP } from '../../components/SocialIcons'

const CONTENT_TYPES = ['Visuel', 'Carrousel', 'Vidéo', 'Story', 'Article', 'Newsletter']
const RS_OPTIONS = [
  { value: 'Instagram', label: 'IG' },
  { value: 'TikTok', label: 'TK' },
  { value: 'Facebook', label: 'FB' },
  { value: 'YouTube', label: 'YT' },
  { value: 'LinkedIn', label: 'IN' },
  { value: 'X', label: '𝕏' },
  { value: 'Strava', label: 'ST' },
  { value: 'Story Insta', label: 'SI' }
]
const STATUT_EDITO = ['Fait', 'A MàJ', 'En attente', 'A faire', 'Pas besoin']
const STATUT_RS = ['Publié', 'Programmé', 'Prêt à être publié', 'En préparation', 'En attente de validation', 'Elements manquants', 'Si résultat']
const MONTHS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']

const thCls = "sticky top-0 bg-gray-50 text-[9px] font-semibold uppercase tracking-wider text-gray-400 px-2 py-2 border-b border-r border-gray-200 whitespace-nowrap z-10"
const tdCls = "px-1 py-1 border-b border-r border-gray-100 text-[11px]"
const inputCls = "w-full px-1.5 py-1 bg-transparent text-[11px] focus:outline-none focus:bg-blue-50 rounded"
const selectCls = "w-full px-1 py-1 bg-transparent text-[11px] focus:outline-none focus:bg-blue-50 rounded appearance-none"

function Stars({ value, onChange }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3].map(i => (
        <button key={i} type="button" onClick={() => onChange(value === i ? 0 : i)}
          className={`p-0 ${i <= (value || 0) ? 'text-amber-400' : 'text-gray-300'}`}>
          <Star size={10} fill={i <= (value || 0) ? 'currentColor' : 'none'} />
        </button>
      ))}
    </div>
  )
}

function pct(a, b) {
  if (!a || !b) return '—'
  return (a / b * 100).toFixed(2) + '%'
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
      .from('portal_posts')
      .select('*')
      .eq('client_id', client.id)
      .gte('scheduled_at', start)
      .lt('scheduled_at', end)
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
      .select()
      .single()
    if (data) setPosts(prev => [...prev, data])
  }

  const deleteRow = async (id) => {
    await supabase.from('portal_posts').delete().eq('id', id)
    setPosts(prev => prev.filter(p => p.id !== id))
  }

  const getDateValue = (post) => {
    if (!post.scheduled_at) return ''
    return post.scheduled_at.slice(0, 10)
  }

  const setDate = (post, dateStr) => {
    const hour = post.heure_publi || '12:00'
    const scheduled_at = `${dateStr}T${hour}:00+01:00`
    updatePost(post.id, 'scheduled_at', scheduled_at)
  }

  const RsIcon = ({ platform, size = 14 }) => {
    const Icon = RS_ICON_MAP[platform]
    if (!Icon) return <span className="text-[10px] text-gray-400">—</span>
    return <Icon size={size} className="text-gray-600" />
  }

  return (
    <div className="space-y-3">
      {/* Header: view switch + month/year + add */}
      <div className="flex items-center gap-3 bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3 flex-wrap">
        {/* View toggle */}
        <div className="flex bg-brioche-beige rounded-xl p-0.5">
          <button onClick={() => setView('publication')}
            className={clsx('px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors',
              view === 'publication' ? 'bg-[#cc0000] text-white shadow-sm' : 'text-gray-500 hover:text-gray-700')}>
            Publications
          </button>
          <button onClick={() => setView('stats')}
            className={clsx('px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors',
              view === 'stats' ? 'bg-[#cc0000] text-white shadow-sm' : 'text-gray-500 hover:text-gray-700')}>
            Stats
          </button>
        </div>

        <select value={month} onChange={e => setMonth(+e.target.value)}
          className="px-3 py-1.5 bg-brioche-beige rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#cc0000]">
          {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
        </select>
        <select value={year} onChange={e => setYear(+e.target.value)}
          className="px-3 py-1.5 bg-brioche-beige rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#cc0000]">
          {[2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <span className="text-xs text-gray-400">{posts.length} pub{posts.length > 1 ? 's' : ''}</span>
        <div className="flex-1" />
        {view === 'publication' && (
          <button onClick={addRow}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#cc0000] text-white text-xs font-semibold rounded-xl hover:bg-[#aa0000] transition-colors">
            <Plus size={14} /> Ajouter
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
        <table className="w-max min-w-full border-collapse">
          <thead>
            <tr>
              {/* Colonnes communes */}
              <th className={thCls} style={{ minWidth: 90 }}>Date</th>
              <th className={thCls} style={{ minWidth: 120 }}>Sujet</th>

              {view === 'publication' ? (
                <>
                  <th className={thCls} style={{ minWidth: 160 }}>Wording</th>
                  <th className={thCls} style={{ minWidth: 90 }}>Catégorie</th>
                  <th className={thCls} style={{ minWidth: 80 }}>Avec</th>
                  <th className={thCls} style={{ minWidth: 80 }}>Type</th>
                  <th className={thCls} style={{ minWidth: 50 }}>RS</th>
                  <th className={thCls} style={{ minWidth: 30 }}>Sp.</th>
                  <th className={thCls} style={{ minWidth: 70 }}>Qui éd.</th>
                  <th className={thCls} style={{ minWidth: 70 }}>St. éd.</th>
                  <th className={thCls} style={{ minWidth: 45 }}>T.éd</th>
                  <th className={thCls} style={{ minWidth: 70 }}>Qui gr.</th>
                  <th className={thCls} style={{ minWidth: 70 }}>St. gr.</th>
                  <th className={thCls} style={{ minWidth: 45 }}>T.gr</th>
                  <th className={thCls} style={{ minWidth: 70 }}>Qui pub.</th>
                  <th className={thCls} style={{ minWidth: 90 }}>Statut RS</th>
                  <th className={thCls} style={{ minWidth: 55 }}>Heure</th>
                  <th className={thCls} style={{ minWidth: 40 }}>Lien</th>
                  <th className={thCls} style={{ minWidth: 30 }}></th>
                </>
              ) : (
                <>
                  <th className={thCls} style={{ minWidth: 50 }}>RS</th>
                  <th className={thCls} style={{ minWidth: 65 }}>Impr.</th>
                  <th className={thCls} style={{ minWidth: 65 }}>Impr. $</th>
                  <th className={thCls} style={{ minWidth: 65 }}>Couv.</th>
                  <th className={thCls} style={{ minWidth: 55 }}>Inter.</th>
                  <th className={thCls} style={{ minWidth: 55 }}>Tx eng.</th>
                  <th className={thCls} style={{ minWidth: 50 }}>Coms</th>
                  <th className={thCls} style={{ minWidth: 50 }}>Foll.</th>
                  <th className={thCls} style={{ minWidth: 50 }}>Part.</th>
                  <th className={thCls} style={{ minWidth: 55 }}>Tx part.</th>
                  <th className={thCls} style={{ minWidth: 55 }}>Dur. vid</th>
                  <th className={thCls} style={{ minWidth: 55 }}>Dur. moy</th>
                  <th className={thCls} style={{ minWidth: 55 }}>Tx vis.</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={20} className="text-center py-12 text-gray-400 text-[11px]">Chargement...</td></tr>
            ) : posts.length === 0 ? (
              <tr><td colSpan={20} className="text-center py-12 text-gray-400 text-[11px]">Aucun post ce mois</td></tr>
            ) : posts.map(p => (
              <tr key={p.id} className="hover:bg-blue-50/30">
                {/* Colonnes communes: Date + Sujet */}
                <td className={tdCls}>
                  <select value={getDateValue(p)} onChange={e => setDate(p, e.target.value)} className={selectCls}>
                    <option value="">—</option>
                    {dayOptions.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                  </select>
                </td>
                <td className={tdCls}>
                  <input value={p.sujet || ''} onChange={e => updatePost(p.id, 'sujet', e.target.value)} className={inputCls} />
                </td>

                {view === 'publication' ? (
                  <>
                    {/* Wording */}
                    <td className={tdCls}>
                      <textarea value={p.wording || p.caption || ''} onChange={e => updatePost(p.id, 'wording', e.target.value)}
                        className={inputCls + ' resize-none'} rows={1} />
                    </td>
                    {/* Catégorie */}
                    <td className={tdCls}>
                      <select value={p.categorie || ''} onChange={e => updatePost(p.id, 'categorie', e.target.value)} className={selectCls}>
                        <option value="">—</option>
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </td>
                    {/* Avec */}
                    <td className={tdCls}>
                      <select value={p.avec || ''} onChange={e => updatePost(p.id, 'avec', e.target.value)} className={selectCls}>
                        <option value="">—</option>
                        {avecOptions.map(a => <option key={a} value={a}>{a}</option>)}
                      </select>
                    </td>
                    {/* Type */}
                    <td className={tdCls}>
                      <select value={p.content_type || ''} onChange={e => updatePost(p.id, 'content_type', e.target.value)} className={selectCls}>
                        <option value="">—</option>
                        {CONTENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </td>
                    {/* RS */}
                    <td className={tdCls}>
                      <div className="flex items-center gap-1">
                        <RsIcon platform={p.platform} size={12} />
                        <select value={p.platform || ''} onChange={e => updatePost(p.id, 'platform', e.target.value)} className={selectCls + ' flex-1'}>
                          <option value="">—</option>
                          {RS_OPTIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                        </select>
                      </div>
                    </td>
                    {/* Sponso */}
                    <td className={tdCls + ' text-center'}>
                      <input type="checkbox" checked={p.sponso || false} onChange={e => updatePost(p.id, 'sponso', e.target.checked)}
                        className="w-3.5 h-3.5 accent-[#cc0000]" />
                    </td>
                    {/* Qui édito */}
                    <td className={tdCls}>
                      <select value={p.qui_edito || ''} onChange={e => updatePost(p.id, 'qui_edito', e.target.value)} className={selectCls}>
                        <option value="">—</option>
                        {team.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </td>
                    {/* Statut édito */}
                    <td className={tdCls}>
                      <select value={p.statut_edito || ''} onChange={e => updatePost(p.id, 'statut_edito', e.target.value)} className={selectCls}>
                        <option value="">—</option>
                        {STATUT_EDITO.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    {/* Temps édito */}
                    <td className={tdCls}><Stars value={p.temps_edito} onChange={v => updatePost(p.id, 'temps_edito', v)} /></td>
                    {/* Qui graph */}
                    <td className={tdCls}>
                      <select value={p.qui_graph || ''} onChange={e => updatePost(p.id, 'qui_graph', e.target.value)} className={selectCls}>
                        <option value="">—</option>
                        {team.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </td>
                    {/* Statut graph */}
                    <td className={tdCls}>
                      <select value={p.statut_graph || ''} onChange={e => updatePost(p.id, 'statut_graph', e.target.value)} className={selectCls}>
                        <option value="">—</option>
                        {STATUT_EDITO.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    {/* Temps graph */}
                    <td className={tdCls}><Stars value={p.temps_graph} onChange={v => updatePost(p.id, 'temps_graph', v)} /></td>
                    {/* Qui publi */}
                    <td className={tdCls}>
                      <select value={p.qui_publi || ''} onChange={e => updatePost(p.id, 'qui_publi', e.target.value)} className={selectCls}>
                        <option value="">—</option>
                        {team.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </td>
                    {/* Statut RS */}
                    <td className={tdCls}>
                      <select value={p.statut_rs || ''} onChange={e => updatePost(p.id, 'statut_rs', e.target.value)} className={selectCls}>
                        <option value="">—</option>
                        {STATUT_RS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    {/* Heure */}
                    <td className={tdCls}>
                      <input type="time" value={p.heure_publi || ''} onChange={e => updatePost(p.id, 'heure_publi', e.target.value)}
                        className={inputCls} />
                    </td>
                    {/* Lien */}
                    <td className={tdCls + ' text-center'}>
                      {(p.lien_publi || p.visual_url) ? (
                        <a href={p.lien_publi || p.visual_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700">
                          <ExternalLink size={12} />
                        </a>
                      ) : '—'}
                    </td>
                    {/* Delete */}
                    <td className={tdCls + ' text-center'}>
                      <button onClick={() => deleteRow(p.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                        <Trash2 size={11} />
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    {/* RS (icon) */}
                    <td className={tdCls + ' text-center'}>
                      <div className="flex items-center justify-center"><RsIcon platform={p.platform} size={14} /></div>
                    </td>
                    {/* Impressions */}
                    <td className={tdCls}>
                      <input type="number" value={p.impressions ?? ''} onChange={e => updatePost(p.id, 'impressions', +e.target.value || null)}
                        className={inputCls + ' text-right'} />
                    </td>
                    {/* Impressions payées */}
                    <td className={tdCls} style={{ opacity: p.sponso ? 1 : 0.3 }}>
                      <input type="number" value={p.impressions_payees ?? ''} onChange={e => updatePost(p.id, 'impressions_payees', +e.target.value || null)}
                        className={inputCls + ' text-right'} disabled={!p.sponso} />
                    </td>
                    {/* Couverture */}
                    <td className={tdCls}>
                      <input type="number" value={p.couverture ?? ''} onChange={e => updatePost(p.id, 'couverture', +e.target.value || null)}
                        className={inputCls + ' text-right'} />
                    </td>
                    {/* Interactions */}
                    <td className={tdCls}>
                      <input type="number" value={p.interactions ?? ''} onChange={e => updatePost(p.id, 'interactions', +e.target.value || null)}
                        className={inputCls + ' text-right'} />
                    </td>
                    {/* Taux engagement */}
                    <td className={tdCls + ' text-right text-[10px] text-gray-500 bg-gray-50/50'}>{pct(p.interactions, p.couverture)}</td>
                    {/* Coms */}
                    <td className={tdCls}>
                      <input type="number" value={p.coms ?? ''} onChange={e => updatePost(p.id, 'coms', +e.target.value || null)}
                        className={inputCls + ' text-right'} />
                    </td>
                    {/* Follows */}
                    <td className={tdCls}>
                      <input type="number" value={p.follows ?? ''} onChange={e => updatePost(p.id, 'follows', +e.target.value || null)}
                        className={inputCls + ' text-right'} />
                    </td>
                    {/* Partage */}
                    <td className={tdCls}>
                      <input type="number" value={p.partage ?? ''} onChange={e => updatePost(p.id, 'partage', +e.target.value || null)}
                        className={inputCls + ' text-right'} />
                    </td>
                    {/* Taux partage */}
                    <td className={tdCls + ' text-right text-[10px] text-gray-500 bg-gray-50/50'}>{pct(p.partage, p.couverture)}</td>
                    {/* Durée vidéo */}
                    <td className={tdCls} style={{ opacity: p.content_type === 'Vidéo' ? 1 : 0.2 }}>
                      <input type="number" value={p.duree_video ?? ''} onChange={e => updatePost(p.id, 'duree_video', +e.target.value || null)}
                        className={inputCls + ' text-right'} disabled={p.content_type !== 'Vidéo'} step="0.1" />
                    </td>
                    {/* Durée moyenne */}
                    <td className={tdCls} style={{ opacity: p.content_type === 'Vidéo' ? 1 : 0.2 }}>
                      <input type="number" value={p.duree_moyenne ?? ''} onChange={e => updatePost(p.id, 'duree_moyenne', +e.target.value || null)}
                        className={inputCls + ' text-right'} disabled={p.content_type !== 'Vidéo'} step="0.1" />
                    </td>
                    {/* Taux visionnage */}
                    <td className={tdCls + ' text-right text-[10px] text-gray-500 bg-gray-50/50'} style={{ opacity: p.content_type === 'Vidéo' ? 1 : 0.2 }}>
                      {p.content_type === 'Vidéo' ? pct(p.duree_moyenne, p.duree_video) : '—'}
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
