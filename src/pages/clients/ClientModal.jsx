import { useState, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import { X, Upload } from 'lucide-react'

const STATUSES = [
  { value: 'actif', label: 'Actif' },
  { value: 'en_attente', label: 'En attente' },
  { value: 'inactif', label: 'Inactif' }
]

const slugify = (str) =>
  str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

export default function ClientModal({ client, onClose, onSaved }) {
  const isEdit = !!client
  const fileRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [logoPreview, setLogoPreview] = useState(client?.logo_url || null)
  const [logoFile, setLogoFile] = useState(null)
  const [form, setForm] = useState({
    name: client?.name || '',
    type: client?.type || '',
    status: client?.status || 'actif',
    bio: client?.bio || '',
    color: client?.color || '#cc0000',
    rs_instagram: client?.rs_instagram || '',
    rs_tiktok: client?.rs_tiktok || '',
    rs_linkedin: client?.rs_linkedin || '',
    rs_youtube: client?.rs_youtube || '',
    rs_x: client?.rs_x || '',
    rs_facebook: client?.rs_facebook || ''
  })

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setLogoFile(file)
    setLogoPreview(URL.createObjectURL(file))
  }

  const uploadLogo = async () => {
    if (!logoFile) return client?.logo_url || null
    setUploading(true)
    const ext = logoFile.name.split('.').pop()
    const path = `${slugify(form.name)}-${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('portal-logos').upload(path, logoFile, { upsert: true })
    setUploading(false)
    if (error) {
      console.error('Upload error:', error)
      return client?.logo_url || null
    }
    const { data: { publicUrl } } = supabase.storage.from('portal-logos').getPublicUrl(path)
    return publicUrl
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    setSaving(true)

    const logo_url = await uploadLogo()
    const payload = { ...form, logo_url }

    if (isEdit) {
      // Ne pas écraser le slug en édition pour éviter de casser les URLs
      await supabase.from('portal_clients').update(payload).eq('id', client.id)
    } else {
      payload.slug = slugify(form.name)
      await supabase.from('portal_clients').insert(payload)
    }

    setSaving(false)
    onSaved()
    onClose()
  }

  const Field = ({ label, children }) => (
    <div>
      <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5">{label}</label>
      {children}
    </div>
  )

  const inputCls = "w-full px-3 py-2 bg-brioche-beige border-none rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#cc0000]"

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">{isEdit ? 'Modifier le client' : 'Nouveau client'}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Logo */}
          <Field label="Logo">
            <div className="flex items-center gap-4">
              <div
                onClick={() => fileRef.current?.click()}
                className="w-16 h-16 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-[#cc0000] transition-colors overflow-hidden"
              >
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <Upload size={20} className="text-gray-400" />
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
              <span className="text-xs text-gray-400">Cliquez pour uploader</span>
            </div>
          </Field>

          {/* Nom */}
          <Field label="Nom du client *">
            <input type="text" value={form.name} onChange={e => set('name', e.target.value)}
              placeholder="Ex: Skoda We Love Cycling" required className={inputCls} />
          </Field>

          {/* Type + Statut */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Type">
              <input type="text" value={form.type} onChange={e => set('type', e.target.value)}
                placeholder="Ex: Marque, Média..." className={inputCls} />
            </Field>
            <Field label="Statut">
              <select value={form.status} onChange={e => set('status', e.target.value)} className={inputCls}>
                {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </Field>
          </div>

          {/* Couleur */}
          <Field label="Couleur">
            <div className="flex items-center gap-2">
              <input type="color" value={form.color} onChange={e => set('color', e.target.value)}
                className="w-8 h-8 rounded-lg border-none cursor-pointer" />
              <input type="text" value={form.color} onChange={e => set('color', e.target.value)}
                className={inputCls + ' flex-1'} />
            </div>
          </Field>

          {/* Bio */}
          <Field label="Bio">
            <textarea value={form.bio} onChange={e => set('bio', e.target.value)}
              placeholder="Description du client..." rows={3} className={inputCls + ' resize-none'} />
          </Field>

          {/* Réseaux sociaux */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-2">Réseaux sociaux</label>
            <div className="space-y-2">
              {[
                { key: 'rs_instagram', label: 'IG', placeholder: '@handle ou lien Instagram' },
                { key: 'rs_tiktok', label: 'TK', placeholder: '@handle ou lien TikTok' },
                { key: 'rs_linkedin', label: 'IN', placeholder: 'Lien LinkedIn' },
                { key: 'rs_youtube', label: 'YT', placeholder: 'Lien YouTube' },
                { key: 'rs_x', label: '𝕏', placeholder: '@handle ou lien X' },
                { key: 'rs_facebook', label: 'FB', placeholder: 'Lien Facebook' }
              ].map(rs => (
                <div key={rs.key} className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-gray-500">{rs.label}</span>
                  </div>
                  <input type="text" value={form[rs.key]} onChange={e => set(rs.key, e.target.value)}
                    placeholder={rs.placeholder} className={inputCls + ' flex-1'} />
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-3 pt-3">
            <button type="button" onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
              Annuler
            </button>
            <button type="submit" disabled={saving || uploading}
              className="px-5 py-2 bg-[#cc0000] text-white text-sm font-semibold rounded-xl hover:bg-[#aa0000] transition-colors disabled:opacity-60">
              {saving ? 'Enregistrement...' : isEdit ? 'Modifier' : 'Créer le client'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
