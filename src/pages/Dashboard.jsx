import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useStore } from '../lib/store'
import { Users, FileText, Calendar, TrendingUp } from 'lucide-react'

export default function Dashboard() {
  const { user, isAdmin } = useStore()
  const [stats, setStats] = useState({ clients: 0, posts: 0, postsEnAttente: 0, events: 0 })
  const [recentPosts, setRecentPosts] = useState([])
  const [clientsList, setClientsList] = useState([])

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    const [clientsRes, postsRes, eventsRes] = await Promise.all([
      supabase.from('clients').select('id, name, slug, color, logo_url'),
      supabase.from('posts').select('id, client_id, platform, status, caption, scheduled_at, clients(name, color)').order('scheduled_at', { ascending: false }).limit(10),
      supabase.from('events').select('id').gte('start_at', new Date().toISOString())
    ])

    const clients = clientsRes.data || []
    const posts = postsRes.data || []
    const events = eventsRes.data || []

    setStats({
      clients: clients.length,
      posts: posts.length,
      postsEnAttente: posts.filter(p => p.status === 'en_attente').length,
      events: events.length
    })
    setRecentPosts(posts.slice(0, 5))
    setClientsList(clients)
  }

  const StatCard = ({ icon: Icon, label, value, color }) => (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon size={20} className="text-white" />
        </div>
        <span className="text-sm font-medium text-gray-500">{label}</span>
      </div>
      <div className="text-3xl font-bold text-gray-900">{value}</div>
    </div>
  )

  const STATUS_LABELS = { valide: 'Validé', en_attente: 'En attente', brouillon: 'Brouillon', publie: 'Publié' }
  const STATUS_COLORS = {
    valide: 'bg-green-100 text-green-700',
    en_attente: 'bg-amber-100 text-amber-700',
    brouillon: 'bg-gray-100 text-gray-600',
    publie: 'bg-blue-100 text-blue-700'
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Bonjour, {user?.full_name?.split(' ')[0]} !</h1>
        <p className="text-gray-500 text-sm mt-1">Vue d'ensemble de votre activité</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Clients" value={stats.clients} color="bg-brioche-violet" />
        <StatCard icon={FileText} label="Posts" value={stats.posts} color="bg-blue-500" />
        <StatCard icon={Calendar} label="En attente" value={stats.postsEnAttente} color="bg-amber-500" />
        <StatCard icon={TrendingUp} label="Événements" value={stats.events} color="bg-green-500" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Clients */}
        {isAdmin() && (
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900">Clients</h2>
              <Link to="/clients" className="text-xs text-brioche-violet font-semibold hover:underline">Voir tout</Link>
            </div>
            <div className="space-y-2">
              {clientsList.map(cl => (
                <Link key={cl.id} to={`/clients/${cl.slug || cl.id}`}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-brioche-beige transition-colors">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold" style={{ background: cl.color || '#5622d9' }}>
                    {cl.name?.charAt(0)}
                  </div>
                  <span className="text-sm font-medium text-gray-700">{cl.name}</span>
                </Link>
              ))}
              {clientsList.length === 0 && <p className="text-sm text-gray-400 text-center py-4">Aucun client</p>}
            </div>
          </div>
        )}

        {/* Posts récents */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900">Posts récents</h2>
            <Link to="/posts" className="text-xs text-brioche-violet font-semibold hover:underline">Voir tout</Link>
          </div>
          <div className="space-y-2">
            {recentPosts.map(post => (
              <div key={post.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-brioche-beige transition-colors">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ background: post.clients?.color || '#5622d9' }} />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-gray-700 truncate">{post.caption || 'Sans titre'}</div>
                  <div className="text-xs text-gray-400">{post.platform} — {post.clients?.name}</div>
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[post.status] || 'bg-gray-100 text-gray-600'}`}>
                  {STATUS_LABELS[post.status] || post.status}
                </span>
              </div>
            ))}
            {recentPosts.length === 0 && <p className="text-sm text-gray-400 text-center py-4">Aucun post</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
