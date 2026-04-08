import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { Calendar, FileText, BarChart3, FolderOpen, Pencil, ExternalLink, Trash2, Settings } from 'lucide-react'
import { InstagramIcon, TikTokIcon, LinkedInIcon, YouTubeIcon, TwitterIcon, FacebookIcon } from '../../components/SocialIcons'
import clsx from 'clsx'
import { useStore } from '../../lib/store'
import AgendaTab from './AgendaTab'
import PostsTab from './PostsTab'
import StatsTab from './StatsTab'
import AssetsTab from './AssetsTab'
import ClientModal from './ClientModal'
import OptionsTab from './OptionsTab'

const TABS = [
  { id: 'agenda', label: 'Agenda', icon: Calendar },
  { id: 'posts', label: 'Posts', icon: FileText },
  { id: 'stats', label: 'Stats', icon: BarChart3 },
  { id: 'assets', label: 'Assets & Drive', icon: FolderOpen },
  { id: 'options', label: 'Options', icon: Settings }
]

const STATUS_BADGE = {
  actif: 'bg-green-100 text-green-700',
  en_attente: 'bg-amber-100 text-amber-700',
  inactif: 'bg-gray-100 text-gray-500'
}
const STATUS_LABEL = { actif: 'Actif', en_attente: 'En attente', inactif: 'Inactif' }

const RS_CONFIG = [
  { key: 'rs_instagram', icon: InstagramIcon },
  { key: 'rs_tiktok', icon: TikTokIcon },
  { key: 'rs_linkedin', icon: LinkedInIcon },
  { key: 'rs_youtube', icon: YouTubeIcon },
  { key: 'rs_x', icon: TwitterIcon },
  { key: 'rs_facebook', icon: FacebookIcon }
]

export default function ClientDetailPage() {
  const { idOrSlug } = useParams()
  const navigate = useNavigate()
  const { perm } = useStore()
  const [client, setClient] = useState(null)
  const [activeTab, setActiveTab] = useState('agenda')
  const [loading, setLoading] = useState(true)
  const [showEdit, setShowEdit] = useState(false)

  useEffect(() => { loadClient() }, [idOrSlug])

  const loadClient = async () => {
    setLoading(true)
    // Essai par ID d'abord (UUID), puis par slug
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug)
    let data
    if (isUUID) {
      const res = await supabase.from('portal_clients').select('*').eq('id', idOrSlug).single()
      data = res.data
    }
    if (!data) {
      const res = await supabase.from('portal_clients').select('*').eq('slug', idOrSlug).single()
      data = res.data
    }
    setClient(data)
    setLoading(false)
  }

  const handleDelete = async () => {
    if (!confirm(`Supprimer "${client.name}" ? Le client sera déplacé dans la corbeille.`)) return
    await supabase.from('portal_clients').update({ deleted_at: new Date().toISOString() }).eq('id', client.id)
    navigate('/clients')
  }

  if (loading) return <div className="text-center py-12 text-gray-400 text-sm animate-pulse-soft">Chargement...</div>
  if (!client) return <div className="text-center py-12 text-gray-400 text-sm">Client introuvable</div>

  const activeRS = RS_CONFIG.filter(rs => client[rs.key])

  const rsLink = (val) => {
    if (val.startsWith('http')) return val
    if (val.startsWith('@')) return null
    return null
  }

  const TabContent = () => {
    switch (activeTab) {
      case 'agenda': return <AgendaTab client={client} />
      case 'posts': return <PostsTab client={client} />
      case 'stats': return <StatsTab client={client} />
      case 'assets': return <AssetsTab client={client} />
      case 'options': return <OptionsTab client={client} onClientUpdate={loadClient} />
      default: return null
    }
  }

  return (
    <div className="space-y-5">
      {/* Header client */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="h-2" style={{ background: client.color || '#cc0000' }} />
        <div className="p-5">
          <div className="flex items-start gap-4">
            {client.logo_url ? (
              <img src={client.logo_url} alt={client.name} className="w-14 h-14 rounded-xl object-cover" />
            ) : (
              <div className="w-14 h-14 rounded-xl flex items-center justify-center text-white text-xl font-bold" style={{ background: client.color || '#cc0000' }}>
                {client.name?.charAt(0)}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-gray-900">{client.name}</h1>
                {client.status && (
                  <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${STATUS_BADGE[client.status]}`}>
                    {STATUS_LABEL[client.status] || client.status}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1">
                {client.type && <span className="text-sm text-gray-500">{client.type}</span>}
              </div>
              {client.bio && <p className="text-sm text-gray-500 mt-2">{client.bio}</p>}

              {/* Réseaux sociaux */}
              {activeRS.length > 0 && (
                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  {activeRS.map(rs => {
                    const link = rsLink(client[rs.key])
                    const Icon = rs.icon
                    const content = (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 rounded-lg text-xs text-gray-600 hover:bg-gray-200 transition-colors">
                        <Icon size={13} className="text-gray-500 shrink-0" />
                        <span>{client[rs.key]}</span>
                        {link && <ExternalLink size={10} className="text-gray-400" />}
                      </div>
                    )
                    return link ? (
                      <a key={rs.key} href={link} target="_blank" rel="noopener noreferrer">{content}</a>
                    ) : (
                      <div key={rs.key}>{content}</div>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {perm('canEditClient') && (
                <button onClick={() => setShowEdit(true)}
                  className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-[#cc0000] transition-colors" title="Modifier">
                  <Pencil size={18} />
                </button>
              )}
              {perm('canDeleteClient') && (
                <button onClick={handleDelete}
                  className="p-2 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-600 transition-colors" title="Supprimer">
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-t border-gray-100 px-5">
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={clsx(
                'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors',
                activeTab === tab.id
                  ? 'border-[#cc0000] text-[#cc0000]'
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              )}>
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <TabContent />

      {showEdit && (
        <ClientModal client={client} onClose={() => setShowEdit(false)} onSaved={loadClient} />
      )}
    </div>
  )
}
