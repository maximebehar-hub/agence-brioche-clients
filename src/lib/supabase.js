import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://zymnlsgtvyjawatcpoma.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp5bW5sc2d0dnlqYXdhdGNwb21hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4MTgzMzgsImV4cCI6MjA5MDM5NDMzOH0.j8DUcuQ3Opxj_JeUsiL-zylK13GKdqmTgIbkKbJwSUg'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const signInWithEmail = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export const getCurrentProfile = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) {
    console.error('Erreur récupération profil:', error.message)
    return null
  }

  return profile
}
