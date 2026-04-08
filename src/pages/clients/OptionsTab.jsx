import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Plus, X, Pencil, Check } from 'lucide-react'
import clsx from 'clsx'

const PRESET_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308',
  '#84cc16', '#22c55e', '#10b981', '#14b8a6',
  '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6',
  '#a855f7', '#ec4899', '#6b7280', '#1f2937',
]

function ColorDot({ value, onChange }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative shrink-0">
      <button onClick={() => setOpen(!open)}
        className="w-5 h-5 rounded-full border-2 border-gray-200 hover:border-gray-400 transition-colors cursor-pointer"
        style={{ background: value || '#d1d5db' }} />
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-7 left-1/2 -translate-x-1/2 z-50 bg-white rounded-xl shadow-xl border border-gray-200 p-2 grid grid-cols-4 gap-1.5 w-max">
            <button onClick={() => { onChange(''); setOpen(false) }}
              className="w-7 h-7 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:border-gray-400">
              <X size={10} />
            </button>
            {PRESET_COLORS.map(c => (
              <button key={c} onClick={() => { onChange(c); setOpen(false) }}
                className={clsx('w-7 h-7 rounded-full border-2 transition-all hover:scale-110',
                  value === c ? 'border-gray-800 scale-110 ring-2 ring-gray-200' : 'border-white')}
                style={{ background: c }} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function OptionSection({ title, description, items, colorMap, onUpdate, clientId, colKey, allColors }) {
  const [input, setInput] = useState('')
  const [editIdx, setEditIdx] = useState(null)
  const [editVal, setEditVal] = useState('')

  const saveList = async (newItems) => {
    onUpdate(newItems)
  }

  const saveColor = async (val, color) => {
    const updatedCol = { ...colorMap }
    if (color) updatedCol[val] = color
    else delete updatedCol[val]
    const updatedAll = { ...allColors, [colKey]: updatedCol }
    await supabase.from('portal_clients').update({ options_colors: updatedAll }).eq('id', clientId)
  }

  const handleAdd = () => {
    const val = input.trim()
    if (!val || items.includes(val)) return
    saveList([...items, val])
    setInput('')
  }

  const handleRename = (oldVal, newVal) => {
    if (!newVal.trim() || (newVal !== oldVal && items.includes(newVal))) return
    const newItems = items.map(i => i === oldVal ? newVal.trim() : i)
    // Also rename in colorMap
    if (colorMap[oldVal]) {
      const updatedCol = { ...colorMap }
      updatedCol[newVal.trim()] = updatedCol[oldVal]
      delete updatedCol[oldVal]
      const updatedAll = { ...allColors, [colKey]: updatedCol }
      supabase.from('portal_clients').update({ options_colors: updatedAll }).eq('id', clientId)
    }
    saveList(newItems)
    setEditIdx(null)
  }

  const handleRemove = (val) => {
    saveList(items.filter(i => i !== val))
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="mb-4">
        <h3 className="font-bold text-gray-900">{title}</h3>
        {description && <p className="text-xs text-gray-400 mt-0.5">{description}</p>}
      </div>

      <div className="space-y-1 mb-3">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2.5 py-1.5 px-2 rounded-lg hover:bg-gray-50 group">
            <ColorDot value={colorMap[item] || ''} onChange={c => saveColor(item, c)} />

            {editIdx === idx ? (
              <div className="flex items-center gap-1.5 flex-1">
                <input value={editVal} onChange={e => setEditVal(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleRename(item, editVal); if (e.key === 'Escape') setEditIdx(null) }}
                  className="flex-1 px-2 py-0.5 bg-blue-50 rounded-lg text-sm border border-blue-200 focus:outline-none" autoFocus />
                <button onClick={() => handleRename(item, editVal)} className="text-green-600 hover:text-green-700"><Check size={14} /></button>
                <button onClick={() => setEditIdx(null)} className="text-gray-400 hover:text-gray-600"><X size={14} /></button>
              </div>
            ) : (
              <>
                {colorMap[item] ? (
                  <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full text-white" style={{ background: colorMap[item] }}>{item}</span>
                ) : (
                  <span className="text-sm text-gray-700">{item}</span>
                )}
                <div className="flex-1" />
                <button onClick={() => { setEditIdx(idx); setEditVal(item) }}
                  className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600 transition-opacity"><Pencil size={12} /></button>
                <button onClick={() => handleRemove(item)}
                  className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity"><X size={12} /></button>
              </>
            )}
          </div>
        ))}
        {items.length === 0 && <p className="text-sm text-gray-400 px-2">Aucun element</p>}
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

export default function OptionsTab({ client, onClientUpdate }) {
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
      <div>
        <h2 className="text-lg font-bold text-gray-900">Options du client</h2>
        <p className="text-sm text-gray-500 mt-1">Configurez les listes et couleurs des menus déroulants</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <OptionSection title="Catégories" items={categories} colKey="col_categorie"
          colorMap={colors.col_categorie || {}} clientId={client.id} allColors={colors}
          onUpdate={val => save('options_categories', val)} />

        <OptionSection title="Avec" description="Collaborateurs, partenaires" items={avec} colKey="col_avec"
          colorMap={colors.col_avec || {}} clientId={client.id} allColors={colors}
          onUpdate={val => save('options_avec', val)} />

        <OptionSection title="Équipe" description="Prénoms pour édito / graph / publi" items={team} colKey="col_team"
          colorMap={colors.col_team || {}} clientId={client.id} allColors={colors}
          onUpdate={val => save('options_team', val)} />

        <OptionSection title="Types de contenu" items={CONTENT_TYPE_VALS} colKey="col_content_type"
          colorMap={colors.col_content_type || {}} clientId={client.id} allColors={colors}
          onUpdate={() => {}} />

        <OptionSection title="Réseaux sociaux" items={PLATFORM_VALS} colKey="col_platform"
          colorMap={colors.col_platform || {}} clientId={client.id} allColors={colors}
          onUpdate={() => {}} />

        <OptionSection title="Statuts édito / graph" items={STATUT_EDITO_VALS} colKey="col_statut_edito"
          colorMap={colors.col_statut_edito || {}} clientId={client.id} allColors={colors}
          onUpdate={() => {}} />

        <OptionSection title="Statuts RS" items={STATUT_RS_VALS} colKey="col_statut_rs"
          colorMap={colors.col_statut_rs || {}} clientId={client.id} allColors={colors}
          onUpdate={() => {}} />
      </div>
    </div>
  )
}
