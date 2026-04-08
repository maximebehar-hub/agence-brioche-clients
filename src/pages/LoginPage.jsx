import { useState } from 'react'
import { signInWithEmail } from '../lib/supabase'
import { LogIn, Eye, EyeOff, AlertCircle } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signInWithEmail(email.trim(), password)
    } catch (err) {
      console.error('Login error:', err)
      setError(
        err.message === 'Invalid login credentials'
          ? 'Identifiants incorrects'
          : err.message || 'Erreur de connexion'
      )
    } finally { setLoading(false) }
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
              <p className="text-gray-500">Portail Client — Accès restreint</p>
            </div>

            {error && (
              <div className="flex items-start gap-2 bg-red-50 text-red-600 text-sm p-3 rounded-xl mb-5">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />{error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5">Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@exemple.com"
                  required autoComplete="email"
                  className="w-full px-4 py-2.5 bg-brioche-beige border-none rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brioche-violet" />
              </div>
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5">Mot de passe</label>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••" required autoComplete="current-password"
                    className="w-full px-4 py-2.5 pr-11 bg-brioche-beige border-none rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brioche-violet" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brioche-violet">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-brioche-violet text-white font-semibold py-3 rounded-xl hover:bg-brioche-violet-dark transition-colors disabled:opacity-60">
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><LogIn size={18} /> Se connecter</>}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-brioche-beige-dark">
              <p className="text-center text-xs text-gray-400">
                Mot de passe oublié ? Contactez votre chargé de projet Brioche.
              </p>
            </div>
          </div>

          <p className="mt-8 text-center text-sm text-gray-400">&copy; 2026 Agence Brioche. Tous droits réservés.</p>
        </div>
      </div>
    </div>
  )
}
