import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { Calendar, FileText, BarChart3, FolderOpen } from 'lucide-react'
import clsx from 'clsx'
import AgendaTab from './AgendaTab'
import PostsTab from './PostsTab'
import StatsTab from './StatsTab'
import AssetsTab from './AssetsTab'

const TABS = [
  { id: 'agenda', label: 'Agenda', icon: Calendar },
  { id: 'posts', label: 'Posts', icon: FileText },
  { id: 'stats', label: 'Stats', icon: BarChart3 },
  { id: 'assets', label: 'Assets & Drive', icon: FolderOpen }
]

export default function ClientDetailPage() {
  const { idOrSlug } = useParams()
  const [client, setClient] = useState(null)
  const [activeTab, setActiveTab] = useState('agenda')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadClient()
  }, [idOrSlug])

  const loadClient = async () => {
    setLoading(true)
    // Essai par slug d'abord, puis par ID
    let { data } = await supabase.from('portal_clients').select('*').eq('slug', idOrSlug).single()
    if (!data) {
      const res = await supabase.from('portal_clients').select('*').eq('id', idOrSlug).single()
      data = res.data
    }
    setClient(data)
    setLoading(false)
  }

  if (loading) {
    return <div className="text-center py-12 text-gray-400 text-sm animate-pulse-soft">Chargement...</div>
  }

  if (!client) {
    return <div className="text-center py-12 text-gray-400 text-sm">Client introuvable</div>
  }

  const TabContent = () => {
    switch (activeTab) {
      case 'agenda': return <AgendaTab client={client} />
      case 'posts': return <PostsTab client={client} />
      case 'stats': return <StatsTab client={client} />
      case 'assets': return <AssetsTab client={client} />
      default: return null
    }
  }

  return (
    <div className="space-y-5">
      {/* Header client */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="h-2" style={{ background: client.color || '#5622d9' }} />
        <div className="p-5 flex items-center gap-4">
          {client.logo_url ? (
            <img src={client.logo_url} alt={client.name} className="w-14 h-14 rounded-xl object-cover" />
          ) : (
            <div className="w-14 h-14 rounded-xl flex items-center justify-center text-white text-xl font-bold" style={{ background: client.color || '#5622d9' }}>
              {client.name?.charAt(0)}
            </div>
          )}
          <div>
            <h1 className="text-xl font-bold text-gray-900">{client.name}</h1>
            {client.description && <p className="text-sm text-gray-500 mt-0.5">{client.description}</p>}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-t border-gray-100 px-5">
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={clsx(
                'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors',
                activeTab === tab.id
                  ? 'border-brioche-violet text-brioche-violet'
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              )}>
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <TabContent />
    </div>
  )
}
