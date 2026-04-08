import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { supabase, getCurrentProfile } from './lib/supabase'
import { useStore } from './lib/store'

import Layout from './components/Layout'
import LoadingScreen from './components/LoadingScreen'
import LoginPage from './pages/LoginPage'
import Dashboard from './pages/Dashboard'
import PostsPage from './pages/PostsPage'
import ClientsPage from './pages/ClientsPage'
import ClientDetailPage from './pages/clients/ClientDetailPage'
import AccessPage from './pages/AccessPage'
import TrashPage from './pages/TrashPage'

function AdminOnly({ children }) {
  const { isAdmin } = useStore()
  if (!isAdmin()) return <Navigate to="/" replace />
  return children
}

function SuperAdminOnly({ children }) {
  const { isSuperAdmin } = useStore()
  if (!isSuperAdmin()) return <Navigate to="/" replace />
  return children
}

function App() {
  const { user, setUser, clearUser } = useStore()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadProfile = async (session) => {
      if (session?.user) {
        try {
          const profile = await getCurrentProfile()
          if (profile) {
            setUser(profile)
          } else {
            setUser({
              id: session.user.id,
              email: session.user.email,
              full_name: session.user.user_metadata?.full_name || session.user.email,
              portal_role: 'client'
            })
          }
        } catch (error) {
          console.error('Erreur chargement profil:', error)
          clearUser()
        }
      } else {
        clearUser()
      }
      setLoading(false)
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      loadProfile(session)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        loadProfile(session)
      } else if (event === 'SIGNED_OUT') {
        clearUser()
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [setUser, clearUser])

  if (loading) {
    return <LoadingScreen />
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/connexion" element={!user ? <LoginPage /> : <Navigate to="/" />} />
        <Route path="/login" element={<Navigate to="/connexion" replace />} />
        <Route
          path="/*"
          element={
            user ? (
              <Layout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/posts" element={<PostsPage />} />
                  <Route path="/clients" element={<AdminOnly><ClientsPage /></AdminOnly>} />
                  <Route path="/clients/:idOrSlug" element={<ClientDetailPage />} />
                  <Route path="/acces" element={<SuperAdminOnly><AccessPage /></SuperAdminOnly>} />
                  <Route path="/supprimes" element={<SuperAdminOnly><TrashPage /></SuperAdminOnly>} />
                </Routes>
              </Layout>
            ) : (
              <Navigate to="/connexion" />
            )
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
