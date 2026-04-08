import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Plus, X, Save } from 'lucide-react'

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
        {items.length === 0 && <span className="text-sm text-gray-400">Aucun élément</span>}
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

  const save = async (field, value) => {
    await supabase.from('portal_clients').update({ [field]: value }).eq('id', client.id)
    onClientUpdate?.()
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Options du client</h2>
        <p className="text-sm text-gray-500 mt-1">Configurez les listes utilisées dans l'onglet Posts</p>
      </div>

      <TagList label="Catégories" items={categories}
        onAdd={val => save('options_categories', [...categories, val])}
        onRemove={val => save('options_categories', categories.filter(c => c !== val))}
      />

      <TagList label="Avec (collaborateurs, partenaires)" items={avec}
        onAdd={val => save('options_avec', [...avec, val])}
        onRemove={val => save('options_avec', avec.filter(c => c !== val))}
      />

      <TagList label="Équipe (prénoms pour édito/graph/publi)" items={team}
        onAdd={val => save('options_team', [...team, val])}
        onRemove={val => save('options_team', team.filter(c => c !== val))}
      />
    </div>
  )
}
