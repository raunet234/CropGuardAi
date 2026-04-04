import React, { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { useAuth } from '../contexts/AuthContext'
import { getHistory, deleteHistory } from '../services/api'

const TYPE_CONFIG = {
  chat: { label: 'Chat', color: 'bg-blue-100 text-blue-700', icon: '💬' },
  crop: { label: 'Crop AI', color: 'bg-green-100 text-green-700', icon: '🌾' },
  disease: { label: 'Disease', color: 'bg-red-100 text-red-700', icon: '🔬' },
  weather: { label: 'Weather', color: 'bg-sky-100 text-sky-700', icon: '🌤' },
  market: { label: 'Market', color: 'bg-yellow-100 text-yellow-700', icon: '📊' },
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

export default function HistoryPage() {
  const { currentUser } = useAuth()
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('All')
  const [clearing, setClearing] = useState(false)

  useEffect(() => {
    if (currentUser) loadHistory()
  }, [currentUser])

  async function loadHistory() {
    setLoading(true)
    try {
      const res = await getHistory(currentUser.uid)
      setHistory(res.data.history || [])
    } catch { } finally {
      setLoading(false)
    }
  }

  async function handleClearAll() {
    if (!window.confirm('Clear all activity history? This cannot be undone.')) return
    setClearing(true)
    try {
      await deleteHistory(currentUser.uid)
      setHistory([])
    } catch { } finally {
      setClearing(false)
    }
  }

  const filtered = history.filter(h => activeFilter === 'All' || h.type === activeFilter.toLowerCase())

  const chatCount = history.filter(h => h.type === 'chat').length
  const cropCount = history.filter(h => h.type === 'crop').length
  const diseaseCount = history.filter(h => h.type === 'disease').length
  const otherCount = history.filter(h => !['chat', 'crop'].includes(h.type)).length

  const FILTERS = ['All', 'Chat', 'Crops', 'Disease', 'Weather', 'Market']
  const filterMap = { All: 'All', Chat: 'chat', Crops: 'crop', Disease: 'disease', Weather: 'weather', Market: 'market' }

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">🕐 Activity History</h1>
        <button
          onClick={handleClearAll}
          disabled={clearing || history.length === 0}
          className="px-4 py-2 border border-red-300 text-red-600 rounded-xl text-sm font-medium hover:bg-red-50 disabled:opacity-50"
        >
          {clearing ? 'Clearing...' : '🗑 Clear All'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total', val: history.length, color: 'bg-gray-50' },
          { label: 'Chat Queries', val: chatCount, color: 'bg-blue-50' },
          { label: 'Crop Topics', val: cropCount, color: 'bg-green-50' },
          { label: 'Other Activities', val: otherCount, color: 'bg-yellow-50' },
        ].map(s => (
          <div key={s.label} className={`${s.color} rounded-2xl p-4 text-center`}>
            <p className="text-2xl font-bold text-gray-800">{s.val}</p>
            <p className="text-gray-500 text-xs mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {FILTERS.map(f => (
          <button key={f} onClick={() => setActiveFilter(filterMap[f])}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${activeFilter === filterMap[f] ? 'bg-green-700 text-white' : 'bg-white border border-gray-300 text-gray-600 hover:border-green-400'}`}>
            {f}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading history...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl shadow-sm">
          <div className="text-4xl mb-2">📋</div>
          <p className="text-gray-500">No history found for this filter.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {filtered.map((item, i) => {
            const cfg = TYPE_CONFIG[item.type] || { label: item.type, color: 'bg-gray-100 text-gray-700', icon: '📋' }
            return (
              <div key={item.id || i} className="flex items-center gap-4 px-5 py-4 border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <span className="text-2xl">{cfg.icon}</span>
                <div className="flex-1">
                  <p className="font-medium text-gray-800 text-sm">{item.title || 'Activity'}</p>
                  {item.cropName && <p className="text-gray-500 text-xs mt-0.5">Crop: {item.cropName}</p>}
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.color}`}>{cfg.label}</span>
                <span className="text-gray-400 text-xs">{timeAgo(item.createdAt)}</span>
              </div>
            )
          })}
        </div>
      )}
    </Layout>
  )
}
