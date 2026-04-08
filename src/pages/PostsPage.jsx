import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useStore } from '../lib/store'
import { FileText, Filter, Search } from 'lucide-react'
import clsx from 'clsx'

const PLATFORMS = ['Tous', 'Instagram', 'TikTok', 'LinkedIn', 'Facebook', 'YouTube', 'X']
const STATUSES = ['Tous', 'valide', 'en_attente', 'brouillon', 'publie']
const STATUS_LABELS = { valide: 'Validé', en_attente: 'En attente', brouillon: 'Brouillon', publie: 'Publié' }
const STATUS_COLORS = {
  valide: 'bg-green-100 text-green-700',
  en_attente: 'bg-amber-100 text-amber-700',
  brouillon: 'bg-gray-100 text-gray-600',
  publie: 'bg-blue-100 text-blue-700'
}

export default function PostsPage() {
  const { isAdmin } = useStore()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [platformFilter, setPlatformFilter] = useState('Tous')
  const [statusFilter, setStatusFilter] = useState('Tous')

  useEffect(() => { loadPosts() }, [])

  const loadPosts = async () => {
    const { data } = await supabase
      .from('portal_posts')
      .select('*, portal_clients(name, color, slug)')
      .order('scheduled_at', { ascending: false })
    setPosts(data || [])
    setLoading(false)
  }

  const filtered = posts.filter(p => {
    if (platformFilter !== 'Tous' && p.platform !== platformFilter) return false
    if (statusFilter !== 'Tous' && p.status !== statusFilter) return false
    if (search && !p.caption?.toLowerCase().includes(search.toLowerCase()) && !p.portal_clients?.name?.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const formatDate = (d) => {
    if (!d) return '—'
    return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Posts</h1>
          <p className="text-gray-500 text-sm mt-1">{filtered.length} publication{filtered.length > 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brioche-violet" />
        </div>
        <select value={platformFilter} onChange={e => setPlatformFilter(e.target.value)}
          className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brioche-violet">
          {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brioche-violet">
          {STATUSES.map(s => <option key={s} value={s}>{s === 'Tous' ? 'Tous les statuts' : STATUS_LABELS[s]}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400 px-5 py-3">Client</th>
                <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400 px-5 py-3">Caption</th>
                <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400 px-5 py-3">Plateforme</th>
                <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400 px-5 py-3">Date</th>
                <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400 px-5 py-3">Statut</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="text-center py-12 text-gray-400 text-sm">Chargement...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-12 text-gray-400 text-sm">Aucun post trouvé</td></tr>
              ) : filtered.map(post => (
                <tr key={post.id} className="border-b border-gray-50 hover:bg-brioche-beige/50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: post.portal_clients?.color || '#5622d9' }} />
                      <span className="text-sm font-medium text-gray-700">{post.portal_clients?.name || '—'}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-sm text-gray-600 truncate block max-w-[300px]">{post.caption || '—'}</span>
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-sm text-gray-600">{post.platform}</span>
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-sm text-gray-500">{formatDate(post.scheduled_at)}</span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${STATUS_COLORS[post.status] || 'bg-gray-100 text-gray-600'}`}>
                      {STATUS_LABELS[post.status] || post.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
