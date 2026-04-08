import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { FolderOpen, Download, Image, FileText, Film, Palette } from 'lucide-react'
import clsx from 'clsx'

const CATEGORY_ICONS = {
  logo: Palette,
  charte: FileText,
  photo: Image,
  video: Film,
  livrable: FolderOpen
}

const CATEGORY_LABELS = {
  logo: 'Logos',
  charte: 'Charte graphique',
  photo: 'Photos',
  video: 'Vidéos',
  livrable: 'Livrables'
}

export default function AssetsTab({ client }) {
  const [assets, setAssets] = useState([])
  const [loading, setLoading] = useState(true)
  const [categoryFilter, setCategoryFilter] = useState('Tous')

  useEffect(() => { loadAssets() }, [client.id])

  const loadAssets = async () => {
    const { data } = await supabase
      .from('portal_assets')
      .select('*')
      .eq('client_id', client.id)
      .order('created_at', { ascending: false })
    setAssets(data || [])
    setLoading(false)
  }

  const categories = ['Tous', ...new Set(assets.map(a => a.category).filter(Boolean))]
  const filtered = categoryFilter === 'Tous' ? assets : assets.filter(a => a.category === categoryFilter)

  // Grouper par catégorie
  const grouped = filtered.reduce((acc, asset) => {
    const cat = asset.category || 'autre'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(asset)
    return acc
  }, {})

  if (loading) {
    return <div className="text-center py-12 text-gray-400 text-sm">Chargement...</div>
  }

  if (assets.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-12 border border-gray-100 shadow-sm text-center">
        <FolderOpen size={48} className="mx-auto text-gray-300 mb-4" />
        <p className="text-gray-400 text-sm">Aucun asset disponible</p>
        <p className="text-gray-300 text-xs mt-1">Les ressources seront ajoutées prochainement</p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Filtres */}
      <div className="flex gap-2 flex-wrap">
        {categories.map(cat => (
          <button key={cat} onClick={() => setCategoryFilter(cat)}
            className={clsx(
              'px-3 py-1.5 rounded-full text-xs font-semibold transition-colors',
              categoryFilter === cat
                ? 'bg-brioche-violet text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-brioche-violet'
            )}>
            {cat === 'Tous' ? 'Tous' : CATEGORY_LABELS[cat] || cat}
          </button>
        ))}
      </div>

      {/* Assets groupés */}
      {Object.entries(grouped).map(([cat, items]) => {
        const Icon = CATEGORY_ICONS[cat] || FolderOpen
        return (
          <div key={cat} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Icon size={18} className="text-brioche-violet" />
              <h3 className="font-bold text-gray-900">{CATEGORY_LABELS[cat] || cat}</h3>
              <span className="text-xs text-gray-400 ml-1">({items.length})</span>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {items.map(asset => (
                <a key={asset.id} href={asset.file_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-brioche-violet/30 hover:bg-brioche-beige/50 transition-all group">
                  {asset.file_url?.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i) ? (
                    <img src={asset.file_url} alt={asset.name} className="w-12 h-12 rounded-lg object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-brioche-beige flex items-center justify-center">
                      <FileText size={20} className="text-brioche-violet/50" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-gray-700 truncate group-hover:text-brioche-violet">{asset.name}</div>
                    <div className="text-xs text-gray-400">{asset.type}</div>
                  </div>
                  <Download size={14} className="text-gray-300 group-hover:text-brioche-violet shrink-0" />
                </a>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
