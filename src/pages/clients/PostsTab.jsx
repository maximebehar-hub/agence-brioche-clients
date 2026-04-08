import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Search } from 'lucide-react'

const STATUS_LABELS = { valide: 'Validé', en_attente: 'En attente', brouillon: 'Brouillon', publie: 'Publié' }
const STATUS_COLORS = {
  valide: 'bg-green-100 text-green-700',
  en_attente: 'bg-amber-100 text-amber-700',
  brouillon: 'bg-gray-100 text-gray-600',
  publie: 'bg-blue-100 text-blue-700'
}

export default function PostsTab({ client }) {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [platformFilter, setPlatformFilter] = useState('Tous')

  useEffect(() => { loadPosts() }, [client.id])

  const loadPosts = async () => {
    const { data } = await supabase
      .from('portal_posts')
      .select('*')
      .eq('client_id', client.id)
      .order('scheduled_at', { ascending: false })
    setPosts(data || [])
    setLoading(false)
  }

  const platforms = ['Tous', ...new Set(posts.map(p => p.platform).filter(Boolean))]

  const filtered = posts.filter(p => {
    if (platformFilter !== 'Tous' && p.platform !== platformFilter) return false
    if (search && !p.caption?.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const formatDate = (d) => {
    if (!d) return '—'
    return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un post..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brioche-violet" />
        </div>
        <select value={platformFilter} onChange={e => setPlatformFilter(e.target.value)}
          className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brioche-violet">
          {platforms.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400 px-5 py-3">Plateforme</th>
              <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400 px-5 py-3">Caption</th>
              <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400 px-5 py-3">Date</th>
              <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400 px-5 py-3">Statut</th>
              <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400 px-5 py-3">Visuel</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="text-center py-12 text-gray-400 text-sm">Chargement...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-12 text-gray-400 text-sm">Aucun post</td></tr>
            ) : filtered.map(post => (
              <tr key={post.id} className="border-b border-gray-50 hover:bg-brioche-beige/50 transition-colors">
                <td className="px-5 py-3">
                  <span className="text-sm font-medium text-gray-700">{post.platform}</span>
                </td>
                <td className="px-5 py-3">
                  <span className="text-sm text-gray-600 truncate block max-w-[250px]">{post.caption || '—'}</span>
                </td>
                <td className="px-5 py-3">
                  <span className="text-sm text-gray-500">{formatDate(post.scheduled_at)}</span>
                </td>
                <td className="px-5 py-3">
                  <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${STATUS_COLORS[post.status] || 'bg-gray-100 text-gray-600'}`}>
                    {STATUS_LABELS[post.status] || post.status}
                  </span>
                </td>
                <td className="px-5 py-3">
                  {post.visual_url ? (
                    <img src={post.visual_url} alt="" className="w-10 h-10 rounded-lg object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-300 text-xs">—</div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
