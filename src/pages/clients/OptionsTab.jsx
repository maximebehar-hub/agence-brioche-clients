import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Plus, X, List, Palette } from 'lucide-react'
import clsx from 'clsx'

const PRESET_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308',
  '#84cc16', '#22c55e', '#10b981', '#14b8a6',
  '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6',
  '#a855f7', '#ec4899', '#6b7280', '#1f2937',
]

const PAGES = [
  { id: 'listes', label: 'Listes', icon: List },
  { id: 'couleurs', label: 'Couleurs', icon: Palette },
]

function TagList({ label, items, onAdd, onRemove }) {
  const [input, setInput] = useState('')
  const handleAdd = () => {
    const val = input.trim()
    if (!val || items.includes(val)) return
    onAdd(val)
    setInput('')
  }
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <h3 className="font-bold text-gray-900 mb-3">{label}</h3>
      <div className="flex flex-wrap gap-2 mb-3">
        {items.map(item => (
          <span key={item} className="flex items-center gap-1.5 px-3 py-1.5 bg-brioche-beige rounded-lg text-sm text-gray-700">
            {item}
            <button onClick={() => onRemove(item)} className="text-gray-400 hover:text-red-500"><X size={12} /></button>
          </span>
        ))}
        {items.length === 0 && <span className="text-sm text-gray-400">Aucun element</span>}
      </div>
      <div className="flex gap-2">
        <input type="text" value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAdd())}
          placeholder="Ajouter..." className="flex-1 px-3 py-2 bg-brioche-beige border-none rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#cc0000]" />
        <button onClick={handleAdd} className="px-3 py-2 bg-[#cc0000] text-white rounded-xl hover:bg-[#aa0000] transition-colors">
          <Plus size={16} />
        </button>
      </div>
    </div>
  )
}

function ColorPicker({ value, onChange }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)}
        className="w-6 h-6 rounded-md border-2 border-gray-200 hover:border-gray-400 transition-colors cursor-pointer"
        style={{ background: value || '#e5e7eb' }} />
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-8 left-0 z-50 bg-white rounded-xl shadow-xl border border-gray-200 p-2 grid grid-cols-4 gap-1.5">
            <button onClick={() => { onChange(''); setOpen(false) }}
              className="w-7 h-7 rounded-md border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-xs hover:border-gray-400">
              <X size={10} />
            </button>
            {PRESET_COLORS.map(c => (
              <button key={c} onClick={() => { onChange(c); setOpen(false) }}
                className={clsx('w-7 h-7 rounded-md border-2 transition-transform hover:scale-110',
                  value === c ? 'border-gray-800 scale-110' : 'border-transparent')}
                style={{ background: c }} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function ColorMapEditor({ label, values, colorMap, clientId, colKey, allColors }) {
  const saveColor = async (val, color) => {
    const updatedCol = { ...colorMap, [val]: color }
    if (!color) delete updatedCol[val]
    const updatedAll = { ...allColors, [colKey]: updatedCol }
    await supabase.from('portal_clients').update({ options_colors: updatedAll }).eq('id', clientId)
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <h3 className="font-bold text-gray-900 mb-3">{label}</h3>
      {values.length === 0 ? (
        <p className="text-sm text-gray-400">Ajoutez des valeurs dans l'onglet Listes d'abord</p>
      ) : (
        <div className="space-y-2.5">
          {values.map(val => (
            <div key={val} className="flex items-center gap-3">
              <ColorPicker value={colorMap[val] || ''} onChange={c => saveColor(val, c)} />
              <span className="text-sm font-medium text-gray-700">{val}</span>
              {colorMap[val] && (
                <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full text-white" style={{ background: colorMap[val] }}>
                  {val}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function OptionsTab({ client, onClientUpdate }) {
  const [page, setPage] = useState('listes')
  const categories = client.options_categories || []
  const avec = client.options_avec || []
  const team = client.options_team || []
  const colors = client.options_colors || {}

  const save = async (field, value) => {
    await supabase.from('portal_clients').update({ [field]: value }).eq('id', client.id)
    onClientUpdate?.()
  }

  const STATUT_EDITO_VALS = ['Fait', 'A MàJ', 'En attente', 'A faire', 'Pas besoin']
  const STATUT_RS_VALS = ['Publié', 'Programmé', 'Prêt à être publié', 'En préparation', 'En attente de validation', 'Elements manquants', 'Si résultat']
  const CONTENT_TYPE_VALS = ['Visuel', 'Carrousel', 'Vidéo', 'Story', 'Article', 'Newsletter']
  const PLATFORM_VALS = ['Instagram', 'Instagram Story', 'Instagram Test', 'TikTok', 'Facebook', 'YouTube', 'LinkedIn', 'X', 'Strava']

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3">
        {PAGES.map(p => (
          <button key={p.id} onClick={() => setPage(p.id)}
            className={clsx('flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors',
              page === p.id ? 'bg-[#cc0000] text-white' : 'text-gray-500 hover:bg-gray-100')}>
            <p.icon size={16} /> {p.label}
          </button>
        ))}
      </div>

      {page === 'listes' && (
        <>
          <TagList label="Catégories" items={categories}
            onAdd={val => save('options_categories', [...categories, val])}
            onRemove={val => save('options_categories', categories.filter(c => c !== val))} />
          <TagList label="Avec (collaborateurs, partenaires)" items={avec}
            onAdd={val => save('options_avec', [...avec, val])}
            onRemove={val => save('options_avec', avec.filter(c => c !== val))} />
          <TagList label="Équipe (prénoms pour édito/graph/publi)" items={team}
            onAdd={val => save('options_team', [...team, val])}
            onRemove={val => save('options_team', team.filter(c => c !== val))} />
        </>
      )}

      {page === 'couleurs' && (
        <>
          <ColorMapEditor label="Catégories" values={categories} colKey="col_categorie"
            colorMap={colors.col_categorie || {}} clientId={client.id} allColors={colors} />
          <ColorMapEditor label="Types de contenu" values={CONTENT_TYPE_VALS} colKey="col_content_type"
            colorMap={colors.col_content_type || {}} clientId={client.id} allColors={colors} />
          <ColorMapEditor label="Réseaux sociaux" values={PLATFORM_VALS} colKey="col_platform"
            colorMap={colors.col_platform || {}} clientId={client.id} allColors={colors} />
          <ColorMapEditor label="Statuts édito / graph" values={STATUT_EDITO_VALS} colKey="col_statut_edito"
            colorMap={colors.col_statut_edito || {}} clientId={client.id} allColors={colors} />
          <ColorMapEditor label="Statuts RS" values={STATUT_RS_VALS} colKey="col_statut_rs"
            colorMap={colors.col_statut_rs || {}} clientId={client.id} allColors={colors} />
          <ColorMapEditor label="Membres équipe" values={team} colKey="col_team"
            colorMap={colors.col_team || {}} clientId={client.id} allColors={colors} />
        </>
      )}
    </div>
  )
}
