import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Plus, Users } from 'lucide-react'
import { useStore } from '../lib/store'

export default function ClientsPage() {
  const { perm } = useStore()
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadClients() }, [])

  const loadClients = async () => {
    const { data } = await supabase
      .from('portal_clients')
      .select('*, portal_posts(id)')
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
          <button className="flex items-center gap-2 px-4 py-2 bg-brioche-violet text-white text-sm font-semibold rounded-xl hover:bg-brioche-violet-dark transition-colors">
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
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients.map(cl => (
            <Link key={cl.id} to={`/clients/${cl.slug || cl.id}`}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md hover:border-brioche-violet/30 transition-all group">
              <div className="h-2" style={{ background: cl.color || '#5622d9' }} />
              <div className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  {cl.logo_url ? (
                    <img src={cl.logo_url} alt={cl.name} className="w-10 h-10 rounded-lg object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-bold" style={{ background: cl.color || '#5622d9' }}>
                      {cl.name?.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-gray-900 group-hover:text-brioche-violet transition-colors">{cl.name}</h3>
                    <p className="text-xs text-gray-400">{cl.portal_posts?.length || 0} posts</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
