import React, { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import PriceBar from '../components/PriceBar'
import { useActivityLogger } from '../hooks/useActivityLogger'
import { getMarket } from '../services/api'

const STATES = ['Punjab', 'Haryana', 'Uttar Pradesh', 'Maharashtra', 'Madhya Pradesh', 'Rajasthan', 'Bihar', 'Gujarat', 'Karnataka', 'Andhra Pradesh']
const STATE_PILLS = ['Punjab', 'Haryana', 'Maharashtra', 'UP', 'MP']

const CROP_EMOJIS = { wheat: '🌾', rice: '🍚', cotton: '🌱', maize: '🌽', soybean: '🫘', onion: '🧅', tomato: '🍅', potato: '🥔', sugarcane: '🎋', default: '🌿' }
function getCropEmoji(name) {
  const lower = (name || '').toLowerCase()
  for (const [k, v] of Object.entries(CROP_EMOJIS)) if (lower.includes(k)) return v
  return CROP_EMOJIS.default
}

const MSP_RATES = { wheat: 2275, rice: 2183, maize: 2090, soybean: 4600, cotton: 6620, sugarcane: 315, default: 2000 }
function getMSP(name) {
  const lower = (name || '').toLowerCase()
  for (const [k, v] of Object.entries(MSP_RATES)) if (lower.includes(k)) return v
  return MSP_RATES.default
}

export default function MarketPricesPage() {
  const { logActivity } = useActivityLogger()
  const [records, setRecords] = useState([])
  const [state, setState] = useState('Punjab')
  const [crop, setCrop] = useState('')
  const [loading, setLoading] = useState(false)
  const [source, setSource] = useState('')
  const [selected, setSelected] = useState(null)
  const [lastFetched, setLastFetched] = useState(null)

  async function fetchData(s = state, c = crop) {
    setLoading(true)
    setSelected(null)
    try {
      const res = await getMarket(s, c)
      setRecords(res.data.records || [])
      setSource(res.data.source)
      setLastFetched(new Date().toLocaleDateString('en-IN'))
      logActivity('market', `Market: ${s} ${c}`, c, {})
    } catch {
      setRecords([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  return (
    <Layout>
      <div className="flex items-center gap-3 mb-5">
        <h1 className="text-2xl font-bold text-gray-800">Market Prices</h1>
        <span className="flex items-center gap-1.5 bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> LIVE
        </span>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-5 mb-5">
        {/* State pills */}
        <div className="flex flex-wrap gap-2 mb-4">
          {STATE_PILLS.map(s => (
            <button key={s} onClick={() => { setState(s === 'UP' ? 'Uttar Pradesh' : s === 'MP' ? 'Madhya Pradesh' : s); fetchData(s === 'UP' ? 'Uttar Pradesh' : s === 'MP' ? 'Madhya Pradesh' : s, crop) }}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${state === (s === 'UP' ? 'Uttar Pradesh' : s === 'MP' ? 'Madhya Pradesh' : s) ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-green-50'}`}>
              {s}
            </button>
          ))}
        </div>

        <div className="flex gap-3 flex-wrap">
          <input
            value={crop}
            onChange={e => setCrop(e.target.value)}
            placeholder="Search crop..."
            className="flex-1 min-w-40 px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
          />
          <select value={state} onChange={e => setState(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-white">
            {STATES.map(s => <option key={s}>{s}</option>)}
          </select>
          <button onClick={() => fetchData(state, crop)} disabled={loading}
            className="px-5 py-2.5 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 disabled:opacity-50 text-sm">
            {loading ? '⏳' : '🔄 Refresh'}
          </button>
          <button onClick={() => { setCrop(''); setState('Punjab'); fetchData('Punjab', '') }}
            className="px-5 py-2.5 border border-gray-300 rounded-xl text-sm hover:bg-gray-50">
            Reset
          </button>
        </div>

        {lastFetched && (
          <p className="text-xs text-gray-500 mt-3">
            🌐 Source: {source === 'live' ? 'Live — Agmarknet / data.gov.in' : 'Mock Data (API unavailable)'} · {lastFetched}
          </p>
        )}
      </div>

      {records.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-2.5 mb-4 text-sm text-blue-700">
          Showing <strong>{records.length}</strong> mandi records from <strong>{state}</strong> · Prices in ₹ per quintal
        </div>
      )}

      <div className="flex gap-5">
        <div className="flex-1">
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-6"><div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />)}</div></div>
            ) : records.length === 0 ? (
              <div className="p-8 text-center"><div className="text-4xl mb-2">📊</div><p className="text-gray-500">No records found. Try a different state or crop.</p></div>
            ) : (
              records.map((r, i) => (
                <div
                  key={i}
                  onClick={() => setSelected(r)}
                  className={`flex items-center gap-4 px-5 py-4 hover:bg-green-50 cursor-pointer transition-colors border-b border-gray-50 ${selected === r ? 'bg-green-50' : ''}`}
                >
                  <span className="text-2xl">{getCropEmoji(r.commodity)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm">{r.commodity}</p>
                    <p className="text-gray-500 text-xs">{r.market}</p>
                  </div>
                  <div className="w-32">
                    <PriceBar min={r.minPrice} max={r.maxPrice} modal={r.modalPrice} />
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-800">₹{r.modalPrice}</p>
                    <p className="text-gray-400 text-xs">/quintal</p>
                  </div>
                  <span className="text-green-500 text-xs">→</span>
                </div>
              ))
            )}
          </div>
        </div>

        {selected && (
          <div className="w-72 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <h2 className="font-bold text-gray-800 mb-1 flex items-center gap-2">
                <span className="text-2xl">{getCropEmoji(selected.commodity)}</span>
                {selected.commodity}
              </h2>
              <p className="text-gray-500 text-xs mb-4">{selected.market}, {selected.state}</p>

              <div className="space-y-3">
                {[
                  { label: 'MSP (Govt Price)', val: `₹${getMSP(selected.commodity)}`, color: 'text-blue-600' },
                  { label: 'Modal Price (Live)', val: `₹${selected.modalPrice}`, color: 'text-green-600 font-bold text-lg' },
                  { label: 'Min Price', val: `₹${selected.minPrice}`, color: 'text-gray-700' },
                  { label: 'Max Price', val: `₹${selected.maxPrice}`, color: 'text-gray-700' },
                ].map(item => (
                  <div key={item.label} className="flex justify-between items-center py-2 border-b border-gray-50">
                    <span className="text-sm text-gray-500">{item.label}</span>
                    <span className={`text-sm ${item.color}`}>{item.val}</span>
                  </div>
                ))}
              </div>

              <div className="mt-4">
                <p className="text-xs font-semibold text-gray-600 mb-2">Price Range</p>
                <PriceBar min={selected.minPrice} max={selected.maxPrice} modal={selected.modalPrice} />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>Min</span><span>Modal</span><span>Max</span>
                </div>
              </div>

              {(() => {
                const msp = getMSP(selected.commodity)
                const modal = parseFloat(selected.modalPrice)
                const diff = modal - msp
                const pct = ((diff / msp) * 100).toFixed(1)
                return (
                  <div className={`mt-4 p-3 rounded-xl text-sm ${diff >= 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {diff >= 0 ? '📈' : '📉'} {Math.abs(pct)}% {diff >= 0 ? 'above' : 'below'} MSP
                  </div>
                )
              })()}
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
