import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { signOut, supabase } from '../lib/supabase'
import { useStore } from '../lib/store'
import {
  Home, FileText, Users, LogOut, Menu, ShieldCheck, Trash2
} from 'lucide-react'
import clsx from 'clsx'

export default function Layout({ children }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, clearUser, isAdmin, isClient, perm } = useStore()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [clients, setClients] = useState([])

  useEffect(() => {
    if (!isAdmin()) return
    supabase
      .from('portal_clients')
      .select('id, name, slug, color')
      .is('deleted_at', null)
      .order('name')
      .then(({ data }) => setClients(data || []))
  }, [])

  const handleLogout = async () => {
    try {
      await signOut()
      clearUser()
      navigate('/connexion')
    } catch (e) {
      console.error('Erreur déconnexion:', e)
    }
  }

  const isActive = (href) => {
    if (href === '/') return location.pathname === '/'
    return location.pathname.startsWith(href)
  }

  const NavItem = ({ href, icon: Icon, label }) => {
    const active = isActive(href)
    return (
      <Link to={href} onClick={() => setSidebarOpen(false)}
        className={clsx(
          'flex items-center gap-3 px-4 py-2 rounded-xl text-[13px] font-medium transition-all duration-150',
          active ? 'bg-white/20 text-white font-semibold shadow-sm' : 'text-white/70 hover:bg-white/10 hover:text-white'
        )}>
        <Icon size={18} className={clsx(active ? 'opacity-100' : 'opacity-60')} />
        {label}
      </Link>
    )
  }

  const initials = user?.full_name
    ? user.full_name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : '?'

  const ROLE_LABELS = { admin: 'Admin', direction: 'Direction', client: 'Client' }
  const roleLabel = ROLE_LABELS[user?.portal_role] || 'Utilisateur'

  return (
    <div className="flex min-h-screen">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={clsx(
        'fixed top-0 left-0 bottom-0 w-[220px] bg-[#cc0000] flex flex-col z-50 transition-transform duration-250',
        'lg:translate-x-0', sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="px-4 py-4 flex items-center justify-center min-h-[64px]">
          <span className="text-2xl font-black italic text-white tracking-tight">BRIOCHE</span>
        </div>

        <nav className="flex-1 px-3 py-1 space-y-0.5 overflow-y-auto">
          <NavItem href="/" icon={Home} label="Accueil" />
          <NavItem href="/posts" icon={FileText} label="Posts" />
          {isAdmin() && <NavItem href="/clients" icon={Users} label="Clients" />}

          {/* Liste des clients dans la sidebar */}
          {isAdmin() && clients.length > 0 && (
            <>
              <div className="pt-4 pb-1 px-4">
                <span className="text-[10px] font-bold tracking-widest uppercase text-white/40">Clients</span>
              </div>
              {clients.map(cl => {
                const active = location.pathname.includes(`/clients/${cl.slug || cl.id}`)
                return (
                  <Link key={cl.id} to={`/clients/${cl.slug || cl.id}`} onClick={() => setSidebarOpen(false)}
                    className={clsx(
                      'flex items-center gap-3 px-4 py-2 rounded-xl text-[13px] font-medium transition-all duration-150',
                      active ? 'bg-white/20 text-white font-semibold shadow-sm' : 'text-white/70 hover:bg-white/10 hover:text-white'
                    )}>
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ background: cl.color || '#5622d9' }} />
                    {cl.name}
                  </Link>
                )
              })}
            </>
          )}

          {/* Admin */}
          {(perm('seeAcces') || perm('seeTrash')) && (
            <>
              <div className="pt-4 pb-1 px-4">
                <span className="text-[10px] font-bold tracking-widest uppercase text-white/40">Admin</span>
              </div>
              {perm('seeAcces') && <NavItem href="/acces" icon={ShieldCheck} label="Accès" />}
              {perm('seeTrash') && <NavItem href="/supprimes" icon={Trash2} label="Supprimés" />}
            </>
          )}
        </nav>

        <div className="px-3 pb-4 pt-2 border-t border-white/20">
          <div className="flex items-center gap-3 px-3 py-2.5 bg-white/15 rounded-xl">
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#cc0000] text-[11px] font-bold shrink-0">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-white truncate">{user?.full_name || user?.email}</div>
              <div className="text-[10px] text-white/50 font-semibold uppercase tracking-wider">{roleLabel}</div>
            </div>
            <button onClick={handleLogout} className="p-1.5 rounded-lg hover:bg-white/20 text-white/40 hover:text-white transition-colors" title="Se déconnecter">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 lg:ml-[220px] min-h-screen flex flex-col">
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 h-[52px] flex items-center px-4 lg:px-7 gap-3">
          <button className="lg:hidden p-1.5 -ml-1 rounded-lg hover:bg-gray-100" onClick={() => setSidebarOpen(true)}>
            <Menu size={22} />
          </button>
          <div className="flex-1" />
          <span className="text-[11px] font-semibold px-3 py-1 rounded-full bg-brioche-violet/10 text-brioche-violet">
            {roleLabel}
          </span>
        </header>
        <main className="flex-1 p-4 lg:p-7 animate-fade-in">{children}</main>
      </div>
    </div>
  )
}
