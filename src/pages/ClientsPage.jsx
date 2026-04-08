import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Plus, Users } from 'lucide-react'
import { useStore } from '../lib/store'
import ClientModal from './clients/ClientModal'

const STATUS_BADGE = {
  actif: 'bg-green-100 text-green-700',
  en_attente: 'bg-amber-100 text-amber-700',
  inactif: 'bg-gray-100 text-gray-500'
}
const STATUS_LABEL = { actif: 'Actif', en_attente: 'En attente', inactif: 'Inactif' }

export default function ClientsPage() {
  const { perm } = useStore()
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => { loadClients() }, [])

  const loadClients = async () => {
    const { data } = await supabase
      .from('portal_clients')
      .select('*, portal_posts(id)')
      .is('deleted_at', null)
      .order('name')
    setClients(data || [])
    setLoading(false)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
          <p className="text-gray-500 text-sm mt-1">{clients.length} client{clients.length > 1 ? 's' : ''}</p>
        </div>
        {perm('canAddClient') && (
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#cc0000] text-white text-sm font-semibold rounded-xl hover:bg-[#aa0000] transition-colors">
            <Plus size={16} /> Ajouter
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400 text-sm">Chargement...</div>
      ) : clients.length === 0 ? (
        <div className="text-center py-12">
          <Users size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-400 text-sm">Aucun client pour le moment</p>
          {perm('canAddClient') && (
            <button onClick={() => setShowModal(true)}
              className="mt-4 px-4 py-2 bg-[#cc0000] text-white text-sm font-semibold rounded-xl hover:bg-[#aa0000] transition-colors">
              Créer un premier client
            </button>
          )}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients.map(cl => (
            <Link key={cl.id} to={`/clients/${cl.slug || cl.id}`}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md hover:border-[#cc0000]/30 transition-all group">
              <div className="h-2" style={{ background: cl.color || '#cc0000' }} />
              <div className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  {cl.logo_url ? (
                    <img src={cl.logo_url} alt={cl.name} className="w-10 h-10 rounded-lg object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-bold" style={{ background: cl.color || '#cc0000' }}>
                      {cl.name?.charAt(0)}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-gray-900 group-hover:text-[#cc0000] transition-colors truncate">{cl.name}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      {cl.type && <span className="text-xs text-gray-400">{cl.type}</span>}
                      {cl.type && cl.status && <span className="text-gray-300">·</span>}
                      {cl.status && (
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_BADGE[cl.status] || 'bg-gray-100 text-gray-500'}`}>
                          {STATUS_LABEL[cl.status] || cl.status}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {cl.bio && <p className="text-xs text-gray-400 line-clamp-2">{cl.bio}</p>}
              </div>
            </Link>
          ))}
        </div>
      )}

      {showModal && (
        <ClientModal onClose={() => setShowModal(false)} onSaved={loadClients} />
      )}
    </div>
  )
}
