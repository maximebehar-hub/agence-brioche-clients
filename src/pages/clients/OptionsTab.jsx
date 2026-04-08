import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Plus, X, List, Palette } from 'lucide-react'
import clsx from 'clsx'

const PRESET_COLORS = [
  { value: '#ef4444', label: 'Rouge' },
  { value: '#f97316', label: 'Orange' },
  { value: '#f59e0b', label: 'Ambre' },
  { value: '#eab308', label: 'Jaune' },
  { value: '#84cc16', label: 'Lime' },
  { value: '#22c55e', label: 'Vert' },
  { value: '#10b981', label: 'Emeraude' },
  { value: '#14b8a6', label: 'Teal' },
  { value: '#06b6d4', label: 'Cyan' },
  { value: '#3b82f6', label: 'Bleu' },
  { value: '#6366f1', label: 'Indigo' },
  { value: '#8b5cf6', label: 'Violet' },
  { value: '#a855f7', label: 'Pourpre' },
  { value: '#ec4899', label: 'Rose' },
  { value: '#6b7280', label: 'Gris' },
  { value: '#1f2937', label: 'Charbon' },
]

const PAGES = [
  { id: 'listes', label: 'Listes', icon: List },
  { id: 'couleurs', label: 'Couleurs', icon: Palette },
]

// Colonnes configurables pour les couleurs
const COLOR_COLUMNS = [
  { key: 'col_categorie', label: 'Catégories' },
  { key: 'col_content_type', label: 'Types de contenu' },
  { key: 'col_platform', label: 'Réseaux sociaux' },
  { key: 'col_statut_edito', label: 'Statuts édito' },
  { key: 'col_statut_graph', label: 'Statuts graph' },
  { key: 'col_statut_rs', label: 'Statuts RS' },
  { key: 'col_team', label: 'Membres équipe' },
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

function ColorMapEditor({ label, columnKey, values, colorMap, onSave }) {
  // colorMap = { "Fait": "#22c55e", "A faire": "#ef4444", ... }
  const setColor = (val, color) => {
    onSave({ ...colorMap, [val]: color })
  }
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <h3 className="font-bold text-gray-900 mb-3">{label}</h3>
      {values.length === 0 ? (
        <p className="text-sm text-gray-400">Ajoutez des valeurs dans l'onglet Listes d'abord</p>
      ) : (
        <div className="space-y-2">
          {values.map(val => (
            <div key={val} className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-md border border-gray-200 shrink-0"
                style={{ background: colorMap[val] || '#e5e7eb' }} />
              <span className="text-sm font-medium text-gray-700 min-w-[120px]">{val}</span>
              <select value={colorMap[val] || ''} onChange={e => setColor(val, e.target.value)}
                className="text-xs px-2 py-1.5 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#cc0000]">
                <option value="">Par defaut</option>
                {PRESET_COLORS.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
              {colorMap[val] && (
                <span className="text-[10px] font-semibold px-2 py-1 rounded-full text-white" style={{ background: colorMap[val] }}>
                  Apercu
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

  const saveColors = async (colKey, map) => {
    const updated = { ...colors, [colKey]: map }
    save('options_colors', updated)
  }

  // Valeurs disponibles par colonne pour les couleurs
  const STATUT_EDITO_VALS = ['Fait', 'A MaJ', 'En attente', 'A faire', 'Pas besoin']
  const STATUT_RS_VALS = ['Publie', 'Programme', 'Pret a etre publie', 'En preparation', 'En attente de validation', 'Elements manquants', 'Si resultat']
  const CONTENT_TYPE_VALS = ['Visuel', 'Carrousel', 'Video', 'Story', 'Article', 'Newsletter']
  const PLATFORM_VALS = ['Instagram', 'Instagram Story', 'Instagram Test', 'TikTok', 'Facebook', 'YouTube', 'LinkedIn', 'X', 'Strava']

  return (
    <div className="space-y-5">
      {/* Page tabs */}
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
          <TagList label="Categories" items={categories}
            onAdd={val => save('options_categories', [...categories, val])}
            onRemove={val => save('options_categories', categories.filter(c => c !== val))} />
          <TagList label="Avec (collaborateurs, partenaires)" items={avec}
            onAdd={val => save('options_avec', [...avec, val])}
            onRemove={val => save('options_avec', avec.filter(c => c !== val))} />
          <TagList label="Equipe (prenoms pour edito/graph/publi)" items={team}
            onAdd={val => save('options_team', [...team, val])}
            onRemove={val => save('options_team', team.filter(c => c !== val))} />
        </>
      )}

      {page === 'couleurs' && (
        <>
          <ColorMapEditor label="Categories" columnKey="col_categorie" values={categories}
            colorMap={colors.col_categorie || {}} onSave={map => saveColors('col_categorie', map)} />
          <ColorMapEditor label="Types de contenu" columnKey="col_content_type" values={CONTENT_TYPE_VALS}
            colorMap={colors.col_content_type || {}} onSave={map => saveColors('col_content_type', map)} />
          <ColorMapEditor label="Reseaux sociaux" columnKey="col_platform" values={PLATFORM_VALS}
            colorMap={colors.col_platform || {}} onSave={map => saveColors('col_platform', map)} />
          <ColorMapEditor label="Statuts edito / graph" columnKey="col_statut_edito" values={STATUT_EDITO_VALS}
            colorMap={colors.col_statut_edito || {}} onSave={map => saveColors('col_statut_edito', map)} />
          <ColorMapEditor label="Statuts RS" columnKey="col_statut_rs" values={STATUT_RS_VALS}
            colorMap={colors.col_statut_rs || {}} onSave={map => saveColors('col_statut_rs', map)} />
          <ColorMapEditor label="Membres equipe" columnKey="col_team" values={team}
            colorMap={colors.col_team || {}} onSave={map => saveColors('col_team', map)} />
        </>
      )}
    </div>
  )
}
