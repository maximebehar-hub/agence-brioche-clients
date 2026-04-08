import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { useStore } from '../../lib/store'
import clsx from 'clsx'
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, format, isSameMonth, isSameDay, addMonths, subMonths, isToday
} from 'date-fns'
import { fr } from 'date-fns/locale'

const EVENT_COLORS = {
  tournage: 'bg-red-100 text-red-700 border-red-200',
  brief: 'bg-blue-100 text-blue-700 border-blue-200',
  publication: 'bg-green-100 text-green-700 border-green-200',
  autre: 'bg-gray-100 text-gray-600 border-gray-200'
}

export default function AgendaTab({ client }) {
  const { perm } = useStore()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState([])
  const [posts, setPosts] = useState([])

  useEffect(() => {
    loadData()
  }, [client.id, currentDate])

  const loadData = async () => {
    const start = startOfMonth(currentDate)
    const end = endOfMonth(currentDate)

    const [eventsRes, postsRes] = await Promise.all([
      supabase.from('events')
        .select('*')
        .eq('client_id', client.id)
        .gte('start_at', start.toISOString())
        .lte('start_at', end.toISOString()),
      supabase.from('posts')
        .select('id, caption, platform, status, scheduled_at')
        .eq('client_id', client.id)
        .gte('scheduled_at', start.toISOString())
        .lte('scheduled_at', end.toISOString())
    ])

    setEvents(eventsRes.data || [])
    setPosts(postsRes.data || [])
  }

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
  const days = eachDayOfInterval({ start: calStart, end: calEnd })

  const getEventsForDay = (day) => {
    const dayEvents = events.filter(e => isSameDay(new Date(e.start_at), day))
    const dayPosts = posts.filter(p => p.scheduled_at && isSameDay(new Date(p.scheduled_at), day))
      .map(p => ({ ...p, type: 'publication', title: `${p.platform}: ${p.caption?.slice(0, 30) || 'Post'}` }))
    return [...dayEvents, ...dayPosts]
  }

  return (
    <div className="space-y-4">
      {/* Header mois */}
      <div className="flex items-center justify-between bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
        <button onClick={() => setCurrentDate(subMonths(currentDate, 1))}
          className="p-2 rounded-lg hover:bg-brioche-beige transition-colors">
          <ChevronLeft size={20} />
        </button>
        <h2 className="text-lg font-bold text-gray-900 capitalize">
          {format(currentDate, 'MMMM yyyy', { locale: fr })}
        </h2>
        <button onClick={() => setCurrentDate(addMonths(currentDate, 1))}
          className="p-2 rounded-lg hover:bg-brioche-beige transition-colors">
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Calendrier */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Jours de la semaine */}
        <div className="grid grid-cols-7 border-b border-gray-100">
          {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(d => (
            <div key={d} className="text-center text-[11px] font-semibold uppercase tracking-wider text-gray-400 py-3">
              {d}
            </div>
          ))}
        </div>

        {/* Grille */}
        <div className="grid grid-cols-7">
          {days.map((day, i) => {
            const dayEvents = getEventsForDay(day)
            const inMonth = isSameMonth(day, currentDate)
            const today = isToday(day)

            return (
              <div key={i} className={clsx(
                'min-h-[90px] p-1.5 border-b border-r border-gray-50',
                !inMonth && 'bg-gray-50/50'
              )}>
                <div className={clsx(
                  'text-xs font-medium mb-1 w-6 h-6 flex items-center justify-center rounded-full',
                  today ? 'bg-brioche-violet text-white' : inMonth ? 'text-gray-700' : 'text-gray-300'
                )}>
                  {format(day, 'd')}
                </div>
                <div className="space-y-0.5">
                  {dayEvents.slice(0, 3).map((ev, j) => (
                    <div key={j} className={clsx(
                      'text-[10px] font-medium px-1.5 py-0.5 rounded border truncate',
                      EVENT_COLORS[ev.type] || EVENT_COLORS.autre
                    )}>
                      {ev.title}
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-[10px] text-gray-400 px-1.5">+{dayEvents.length - 3}</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
