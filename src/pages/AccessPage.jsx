import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { ShieldCheck, Save } from 'lucide-react'

const PORTAL_ROLES = [
  { value: '', label: 'Aucun accès portail' },
  { value: 'admin', label: 'Admin' },
  { value: 'direction', label: 'Direction' },
  { value: 'client', label: 'Client' }
]

const ROLE_BADGE = {
  admin: 'bg-red-100 text-red-700',
  direction: 'bg-violet-100 text-violet-700',
  client: 'bg-blue-100 text-blue-700'
}

export default function AccessPage() {
  const [users, setUsers] = useState([])
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(null)

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    const [usersRes, clientsRes] = await Promise.all([
      supabase.from('users').select('id, email, full_name, portal_role, portal_client_id').order('full_name'),
      supabase.from('portal_clients').select('id, name, slug').is('deleted_at', null).order('name')
    ])
    setUsers(usersRes.data || [])
    setClients(clientsRes.data || [])
    setLoading(false)
  }

  const updateUser = async (userId, field, value) => {
    setSaving(userId)
    await supabase.from('users').update({ [field]: value || null }).eq('id', userId)
    setSaving(null)
    loadData()
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Accès</h1>
        <p className="text-gray-500 text-sm mt-1">Gérer les rôles et accès au portail client</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400 px-5 py-3">Utilisateur</th>
              <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400 px-5 py-3">Email</th>
              <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400 px-5 py-3">Rôle portail</th>
              <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400 px-5 py-3">Client lié</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="text-center py-12 text-gray-400 text-sm">Chargement...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={4} className="text-center py-12 text-gray-400 text-sm">Aucun utilisateur</td></tr>
            ) : users.map(u => (
              <tr key={u.id} className="border-b border-gray-50 hover:bg-brioche-beige/50 transition-colors">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-[#cc0000] flex items-center justify-center text-white text-[10px] font-bold">
                      {u.full_name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?'}
                    </div>
                    <span className="text-sm font-medium text-gray-700">{u.full_name || '—'}</span>
                  </div>
                </td>
                <td className="px-5 py-3">
                  <span className="text-sm text-gray-500">{u.email}</span>
                </td>
                <td className="px-5 py-3">
                  <select
                    value={u.portal_role || ''}
                    onChange={e => updateUser(u.id, 'portal_role', e.target.value)}
                    className={`text-xs font-semibold px-2 py-1 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#cc0000] ${
                      u.portal_role ? ROLE_BADGE[u.portal_role] || 'bg-gray-100' : 'bg-gray-50 text-gray-400'
                    }`}
                  >
                    {PORTAL_ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                </td>
                <td className="px-5 py-3">
                  {u.portal_role === 'client' ? (
                    <select
                      value={u.portal_client_id || ''}
                      onChange={e => updateUser(u.id, 'portal_client_id', e.target.value)}
                      className="text-xs px-2 py-1 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#cc0000]"
                    >
                      <option value="">Aucun client</option>
                      {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  ) : (
                    <span className="text-xs text-gray-300">—</span>
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
