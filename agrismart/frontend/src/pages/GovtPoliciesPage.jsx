import React, { useState } from 'react'
import Layout from '../components/Layout'
import { getSchemeDetail } from '../services/api'
import LoadingSkeleton from '../components/LoadingSkeleton'

const FILTERS = ['All Schemes', 'Credit and Finance', 'Crop Insurance', 'Food Security', 'Income Support', 'Infrastructure', 'Market Access', 'Organic Farming', 'Pension', 'Soil Health', 'Solar Energy']

const SCHEMES = [
  { icon: '💰', name: 'PM-KISAN', category: 'Income Support', desc: 'Direct income support of ₹6,000/year to small and marginal farmers in 3 equal installments.', ministry: 'Ministry of Agriculture & Farmers Welfare', border: '#22c55e' },
  { icon: '🛡️', name: 'PMFBY (Pradhan Mantri Fasal Bima Yojana)', category: 'Crop Insurance', desc: 'Comprehensive crop insurance scheme against yield losses due to natural calamities, pests and diseases.', ministry: 'Ministry of Agriculture & Farmers Welfare', border: '#3b82f6' },
  { icon: '☀️', name: 'PM-KUSUM', category: 'Solar Energy', desc: 'Solar pumps and grid-connected solar power plants for farmers to reduce diesel dependence.', ministry: 'Ministry of New and Renewable Energy', border: '#eab308' },
  { icon: '🏪', name: 'e-NAM (National Agriculture Market)', category: 'Market Access', desc: 'Online trading platform for agricultural commodities to ensure better price discovery and market access.', ministry: 'Ministry of Agriculture & Farmers Welfare', border: '#8b5cf6' },
  { icon: '🌱', name: 'Soil Health Card Scheme', category: 'Soil Health', desc: 'Provides soil health cards to farmers with crop-wise nutrient recommendations to reduce input costs.', ministry: 'Ministry of Agriculture & Farmers Welfare', border: '#92400e' },
  { icon: '💳', name: 'Kisan Credit Card (KCC)', category: 'Credit and Finance', desc: 'Short-term credit needs for crop cultivation, maintenance and allied activities at concessional rates.', ministry: 'Ministry of Finance / NABARD', border: '#6366f1' },
  { icon: '🌾', name: 'RKVY (Rashtriya Krishi Vikas Yojana)', category: 'Infrastructure', desc: 'Infrastructure development for agriculture including storage, processing units and farm mechanization.', ministry: 'Ministry of Agriculture & Farmers Welfare', border: '#f97316' },
  { icon: '💧', name: 'PMKSY (Pradhan Mantri Krishi Sinchayee Yojana)', category: 'Infrastructure', desc: '"More crop per drop" — micro-irrigation and watershed development for water use efficiency.', ministry: 'Ministry of Jal Shakti', border: '#06b6d4' },
  { icon: '🌿', name: 'Paramparagat Krishi Vikas Yojana (PKVY)', category: 'Organic Farming', desc: 'Promotes organic farming through cluster approach with ₹50,000/ha support over 3 years.', ministry: 'Ministry of Agriculture & Farmers Welfare', border: '#16a34a' },
  { icon: '👴', name: 'PM Kisan Maan Dhan Yojana', category: 'Pension', desc: 'Pension scheme for small and marginal farmers providing ₹3,000/month after age 60.', ministry: 'Ministry of Agriculture & Farmers Welfare', border: '#64748b' },
]

export default function GovtPoliciesPage() {
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState('All Schemes')
  const [expanded, setExpanded] = useState(null)
  const [schemeContent, setSchemeContent] = useState({})
  const [loadingScheme, setLoadingScheme] = useState(null)

  const filtered = SCHEMES.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.desc.toLowerCase().includes(search.toLowerCase())
    const matchFilter = activeFilter === 'All Schemes' || s.category === activeFilter
    return matchSearch && matchFilter
  })

  async function toggleExpand(scheme) {
    if (expanded === scheme.name) return setExpanded(null)
    setExpanded(scheme.name)
    if (!schemeContent[scheme.name]) {
      setLoadingScheme(scheme.name)
      try {
        const res = await getSchemeDetail(scheme.name)
        setSchemeContent(prev => ({ ...prev, [scheme.name]: res.data.content }))
      } catch {
        setSchemeContent(prev => ({ ...prev, [scheme.name]: 'Failed to load details. Please check your API key.' }))
      } finally {
        setLoadingScheme(null)
      }
    }
  }

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">🏛 Government Policies and Schemes</h1>
        <p className="text-gray-500 text-sm mt-1">Agricultural welfare schemes for Indian farmers · Updated 2025-26</p>
      </div>

      <div className="relative mb-4">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search schemes..."
          className="w-full max-w-md pl-9 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-white" />
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {FILTERS.map(f => (
          <button key={f} onClick={() => setActiveFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${activeFilter === f ? 'bg-green-700 text-white' : 'bg-white border border-gray-300 text-gray-600 hover:border-green-400'}`}>
            {f}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(scheme => (
          <div key={scheme.name} className="bg-white rounded-2xl shadow-sm overflow-hidden" style={{ borderLeft: `4px solid ${scheme.border}` }}>
            <div className="p-5">
              <div className="flex items-start gap-3 mb-2">
                <span className="text-2xl">{scheme.icon}</span>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800 text-sm leading-snug">{scheme.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">{scheme.category}</span>
                    <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-semibold">Active</span>
                  </div>
                </div>
              </div>
              <p className="text-gray-600 text-xs leading-relaxed mb-2">{scheme.desc}</p>
              <p className="text-gray-400 text-xs mb-3">{scheme.ministry}</p>

              <button
                onClick={() => toggleExpand(scheme)}
                className="text-green-600 text-xs font-semibold hover:underline flex items-center gap-1"
              >
                {expanded === scheme.name ? '▲ Hide details' : '▼ Click for details'}
              </button>

              {expanded === scheme.name && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  {loadingScheme === scheme.name ? (
                    <LoadingSkeleton lines={6} />
                  ) : (
                    <div className="text-xs text-gray-700 whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto">
                      {schemeContent[scheme.name]}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </Layout>
  )
}
