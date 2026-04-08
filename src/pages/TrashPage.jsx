import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Trash2, RotateCcw } from 'lucide-react'

export default function TrashPage() {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadTrash() }, [])

  const loadTrash = async () => {
    const { data } = await supabase
      .from('portal_clients')
      .select('*')
      .not('deleted_at', 'is', null)
      .order('deleted_at', { ascending: false })
    setClients(data || [])
    setLoading(false)
  }

  const restoreClient = async (id) => {
    if (!confirm('Restaurer ce client ?')) return
    await supabase.from('portal_clients').update({ deleted_at: null }).eq('id', id)
    loadTrash()
  }

  const permanentDelete = async (id, name) => {
    if (!confirm(`Supprimer définitivement "${name}" ? Cette action est irréversible.`)) return
    await supabase.from('portal_clients').delete().eq('id', id)
    loadTrash()
  }

  const formatDate = (d) => {
    if (!d) return '—'
    return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Supprimés</h1>
        <p className="text-gray-500 text-sm mt-1">Clients supprimés — restaurer ou supprimer définitivement</p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400 text-sm">Chargement...</div>
      ) : clients.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <Trash2 size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-400 text-sm">Aucun client supprimé</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400 px-5 py-3">Client</th>
                <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400 px-5 py-3">Type</th>
                <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400 px-5 py-3">Supprimé le</th>
                <th className="text-right text-[11px] font-semibold uppercase tracking-wider text-gray-400 px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {clients.map(cl => (
                <tr key={cl.id} className="border-b border-gray-50 hover:bg-brioche-beige/50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      {cl.logo_url ? (
                        <img src={cl.logo_url} alt={cl.name} className="w-8 h-8 rounded-lg object-cover opacity-50" />
                      ) : (
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold opacity-50" style={{ background: cl.color || '#cc0000' }}>
                          {cl.name?.charAt(0)}
                        </div>
                      )}
                      <span className="text-sm font-medium text-gray-500 line-through">{cl.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-sm text-gray-400">{cl.type || '—'}</span>
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-sm text-gray-400">{formatDate(cl.deleted_at)}</span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => restoreClient(cl.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-green-700 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                        <RotateCcw size={12} /> Restaurer
                      </button>
                      <button onClick={() => permanentDelete(cl.id, cl.name)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                        <Trash2 size={12} /> Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
