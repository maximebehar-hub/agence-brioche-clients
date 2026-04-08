import { useState } from 'react'
import { signInWithGoogle } from '../lib/supabase'
import { AlertCircle } from 'lucide-react'

export default function LoginPage() {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleGoogleLogin = async () => {
    setError('')
    setLoading(true)
    try {
      await signInWithGoogle()
    } catch (err) {
      console.error('Login error:', err)
      setError(err.message || 'Erreur de connexion')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-brioche-beige flex">
      <div className="hidden lg:flex lg:w-1/2 bg-brioche-violet items-center justify-center p-12">
        <div className="max-w-md text-center">
          <div className="mb-8">
            <span className="text-5xl font-black italic text-brioche-yellow tracking-tight">BRIOCHE</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">Portail Client</h1>
          <p className="text-brioche-yellow/80 text-lg">Votre espace dédié pour suivre vos publications et performances</p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8 text-center">
            <span className="text-3xl font-black italic text-brioche-violet tracking-tight">BRIOCHE</span>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 border border-brioche-beige-dark">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Connexion</h2>
              <p className="text-gray-500">Portail Client — Réservé aux équipes Brioche</p>
            </div>

            {error && (
              <div className="flex items-start gap-2 bg-red-50 text-red-600 text-sm p-3 rounded-xl mb-5">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />{error}
              </div>
            )}

            <button onClick={handleGoogleLogin} disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 text-gray-700 font-semibold py-3 rounded-xl hover:border-brioche-violet hover:bg-brioche-beige/50 transition-all disabled:opacity-60">
              {loading ? (
                <div className="w-5 h-5 border-2 border-brioche-violet/30 border-t-brioche-violet rounded-full animate-spin" />
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Se connecter avec Google
                </>
              )}
            </button>

            <div className="mt-6 pt-5 border-t border-brioche-beige-dark">
              <p className="text-center text-xs text-gray-400">
                Accès réservé aux adresses @agencebrioche.fr
              </p>
            </div>
          </div>

          <p className="mt-8 text-center text-sm text-gray-400">&copy; 2026 Agence Brioche. Tous droits réservés.</p>
        </div>
      </div>
    </div>
  )
}
