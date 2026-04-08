import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'
import { TrendingUp, Eye, Heart, Users } from 'lucide-react'

const CHART_COLORS = ['#5622d9', '#ffc814', '#7b4de6', '#4119a8', '#ffd647']

export default function StatsTab({ client }) {
  const [stats, setStats] = useState([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('mensuel')

  useEffect(() => { loadStats() }, [client.id])

  const loadStats = async () => {
    const { data } = await supabase
      .from('portal_stats')
      .select('*')
      .eq('client_id', client.id)
      .order('date', { ascending: true })
    setStats(data || [])
    setLoading(false)
  }

  // Agrégation par mois
  const monthlyData = stats.reduce((acc, s) => {
    const month = s.date?.slice(0, 7)
    if (!month) return acc
    const existing = acc.find(a => a.month === month)
    if (existing) {
      existing.impressions += s.impressions || 0
      existing.reach += s.reach || 0
      existing.engagement += s.engagement || 0
      existing.followers += s.followers || 0
    } else {
      acc.push({
        month,
        label: new Date(s.date).toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' }),
        impressions: s.impressions || 0,
        reach: s.reach || 0,
        engagement: s.engagement || 0,
        followers: s.followers || 0
      })
    }
    return acc
  }, [])

  // Agrégation par plateforme
  const platformData = stats.reduce((acc, s) => {
    const existing = acc.find(a => a.platform === s.platform)
    if (existing) {
      existing.impressions += s.impressions || 0
      existing.engagement += s.engagement || 0
    } else {
      acc.push({ platform: s.platform, impressions: s.impressions || 0, engagement: s.engagement || 0 })
    }
    return acc
  }, [])

  // Totaux
  const totals = stats.reduce((acc, s) => ({
    impressions: acc.impressions + (s.impressions || 0),
    reach: acc.reach + (s.reach || 0),
    engagement: acc.engagement + (s.engagement || 0),
    followers: acc.followers + (s.followers || 0)
  }), { impressions: 0, reach: 0, engagement: 0, followers: 0 })

  const formatNumber = (n) => {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K'
    return n.toString()
  }

  const StatCard = ({ icon: Icon, label, value, color }) => (
    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <Icon size={16} className={color} />
        <span className="text-xs font-medium text-gray-500">{label}</span>
      </div>
      <div className="text-2xl font-bold text-gray-900">{formatNumber(value)}</div>
    </div>
  )

  if (loading) {
    return <div className="text-center py-12 text-gray-400 text-sm">Chargement des statistiques...</div>
  }

  if (stats.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-12 border border-gray-100 shadow-sm text-center">
        <TrendingUp size={48} className="mx-auto text-gray-300 mb-4" />
        <p className="text-gray-400 text-sm">Aucune donnée statistique disponible</p>
        <p className="text-gray-300 text-xs mt-1">Les données seront importées via CSV</p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Eye} label="Impressions" value={totals.impressions} color="text-brioche-violet" />
        <StatCard icon={Users} label="Reach" value={totals.reach} color="text-blue-500" />
        <StatCard icon={Heart} label="Engagement" value={totals.engagement} color="text-red-500" />
        <StatCard icon={TrendingUp} label="Followers" value={totals.followers} color="text-green-500" />
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Impressions mensuelles */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-4">Impressions mensuelles</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={formatNumber} />
              <Tooltip formatter={(v) => formatNumber(v)} />
              <Bar dataKey="impressions" fill="#5622d9" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Engagement mensuel */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-4">Engagement mensuel</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={formatNumber} />
              <Tooltip formatter={(v) => formatNumber(v)} />
              <Line type="monotone" dataKey="engagement" stroke="#ffc814" strokeWidth={2} dot={{ fill: '#ffc814' }} />
              <Line type="monotone" dataKey="reach" stroke="#5622d9" strokeWidth={2} dot={{ fill: '#5622d9' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Répartition par plateforme */}
        {platformData.length > 0 && (
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm lg:col-span-2">
            <h3 className="font-bold text-gray-900 mb-4">Répartition par plateforme</h3>
            <div className="flex items-center justify-center gap-8">
              <ResponsiveContainer width={200} height={200}>
                <PieChart>
                  <Pie data={platformData} dataKey="impressions" nameKey="platform" cx="50%" cy="50%" outerRadius={80}>
                    {platformData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => formatNumber(v)} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {platformData.map((p, i) => (
                  <div key={p.platform} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                    <span className="text-sm text-gray-600">{p.platform}</span>
                    <span className="text-sm font-semibold text-gray-900">{formatNumber(p.impressions)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
