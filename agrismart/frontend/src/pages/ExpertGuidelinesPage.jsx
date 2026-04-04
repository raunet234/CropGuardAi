import React, { useState } from 'react'
import Layout from '../components/Layout'
import { getGuideline } from '../services/api'
import LoadingSkeleton from '../components/LoadingSkeleton'

const MODULES = [
  { id: 1, icon: '🦠', title: 'Plant Disease Management Protocols', badge: 'CRITICAL', badgeColor: 'bg-red-100 text-red-700', category: 'Disease Control', filter: 'Disease', topics: 4, tips: 4 },
  { id: 2, icon: '🐛', title: 'Integrated Pest Management (IPM)', badge: 'HIGH', badgeColor: 'bg-orange-100 text-orange-700', category: 'Pest Control', filter: 'IPM', topics: 4, tips: 4 },
  { id: 3, icon: '🌱', title: 'Soil Health and Fertility Management', badge: 'HIGH', badgeColor: 'bg-yellow-100 text-yellow-700', category: 'Soil Management', filter: 'Soil', topics: 4, tips: 4 },
  { id: 4, icon: '💧', title: 'Irrigation and Water Management', badge: 'HIGH', badgeColor: 'bg-blue-100 text-blue-700', category: 'Water Management', filter: 'Water', topics: 3, tips: 4 },
  { id: 5, icon: '📦', title: 'Post-Harvest Handling and Storage', badge: 'MEDIUM', badgeColor: 'bg-purple-100 text-purple-700', category: 'Post-Harvest', filter: 'PostHarvest', topics: 3, tips: 4 },
  { id: 6, icon: '🌿', title: 'Organic Farming and Natural Methods', badge: 'MEDIUM', badgeColor: 'bg-green-100 text-green-700', category: 'Organic Farming', filter: 'Organic', topics: 3, tips: 4 },
  { id: 7, icon: '🌾', title: 'Seed Selection and Variety Advice', badge: 'MEDIUM', badgeColor: 'bg-gray-100 text-gray-700', category: 'Seed Management', filter: 'Seed', topics: 3, tips: 4 },
]

const FILTERS = ['All', 'Disease', 'IPM', 'Soil', 'Water', 'PostHarvest', 'Organic']

export default function ExpertGuidelinesPage() {
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState('All')
  const [selectedModule, setSelectedModule] = useState(null)
  const [content, setContent] = useState('')
  const [loadingContent, setLoadingContent] = useState(false)

  const filtered = MODULES.filter(m => {
    const matchSearch = m.title.toLowerCase().includes(search.toLowerCase())
    const matchFilter = activeFilter === 'All' || m.filter === activeFilter
    return matchSearch && matchFilter
  })

  async function openModule(mod) {
    setSelectedModule(mod)
    setContent('')
    setLoadingContent(true)
    try {
      const res = await getGuideline(mod.title, mod.category)
      setContent(res.data.content)
    } catch {
      setContent('Failed to load content. Please check your Groq API key.')
    } finally {
      setLoadingContent(false)
    }
  }

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Expert Agricultural Guidelines</h1>
        <p className="text-gray-500 text-sm mt-1">Curated knowledge from ICAR, FAO, State Agricultural Universities &amp; PMKSY</p>
      </div>

      <div className="relative mb-4">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search guidelines..."
          className="w-full max-w-md pl-9 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-white"
        />
      </div>

      <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-2.5 mb-4 flex items-center justify-between">
        <span className="text-green-700 font-semibold text-sm">📚 {MODULES.length} Expert Knowledge Modules Available</span>
      </div>

      <div className="flex gap-2 flex-wrap mb-6">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${activeFilter === f ? 'bg-green-700 text-white' : 'bg-white border border-gray-300 text-gray-600 hover:border-green-400'}`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map(mod => (
          <div key={mod.id} className="bg-white rounded-2xl shadow-sm p-5 hover:shadow-md transition-shadow cursor-pointer" onClick={() => openModule(mod)}>
            <div className="text-3xl mb-3">{mod.icon}</div>
            <div className={`inline-block text-xs font-bold px-2 py-0.5 rounded-full mb-2 ${mod.badgeColor}`}>{mod.badge}</div>
            <h3 className="font-semibold text-gray-800 text-sm mb-1 leading-snug">{mod.title}</h3>
            <p className="text-gray-500 text-xs mb-3">{mod.category}</p>
            <p className="text-gray-400 text-xs mb-3">{mod.topics} Topics · {mod.tips} Tips</p>
            <button className="text-green-600 text-xs font-semibold hover:underline">View Guidelines →</button>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          📚 Knowledge Base Sources: <strong>ICAR</strong> · <strong>FAO</strong> · <strong>State Agricultural Universities</strong> · <strong>NHM</strong> · <strong>PMKSY</strong>
        </p>
      </div>

      {/* Modal */}
      {selectedModule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedModule(null)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{selectedModule.icon}</span>
                  <div>
                    <h2 className="font-bold text-gray-800">{selectedModule.title}</h2>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${selectedModule.badgeColor}`}>{selectedModule.badge}</span>
                  </div>
                </div>
                <button onClick={() => setSelectedModule(null)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
              </div>
              {loadingContent ? (
                <LoadingSkeleton lines={8} height="h-4" />
              ) : (
                <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">
                  {content}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
