import React, { useState } from 'react'
import Layout from '../components/Layout'
import { useActivityLogger } from '../hooks/useActivityLogger'
import { getCropRecommendation } from '../services/api'

const CROP_PRESETS = {
  Rice: { N: 80, P: 40, K: 40, temperature: 28, humidity: 80, ph: 6.5, rainfall: 1200 },
  Wheat: { N: 120, P: 60, K: 40, temperature: 20, humidity: 55, ph: 7.0, rainfall: 600 },
  Cotton: { N: 100, P: 50, K: 50, temperature: 30, humidity: 50, ph: 7.5, rainfall: 700 },
  Maize: { N: 90, P: 45, K: 45, temperature: 25, humidity: 65, ph: 6.8, rainfall: 900 },
  Banana: { N: 110, P: 60, K: 200, temperature: 27, humidity: 75, ph: 6.5, rainfall: 1500 },
  Groundnut: { N: 25, P: 50, K: 50, temperature: 28, humidity: 60, ph: 6.5, rainfall: 600 },
}

const REGION_PRESETS = {
  Punjab: { N: 120, P: 60, K: 40, temperature: 22, humidity: 55, ph: 7.5, rainfall: 650 },
  Haryana: { N: 110, P: 55, K: 40, temperature: 24, humidity: 50, ph: 7.8, rainfall: 600 },
  Maharashtra: { N: 80, P: 40, K: 40, temperature: 28, humidity: 65, ph: 7.0, rainfall: 900 },
  Bihar: { N: 85, P: 45, K: 35, temperature: 26, humidity: 70, ph: 7.2, rainfall: 1000 },
}

const CROP_EMOJIS = { rice: '🍚', wheat: '🌾', cotton: '🌱', maize: '🌽', sugarcane: '🎋', soybean: '🫘', banana: '🍌', groundnut: '🥜', tomato: '🍅', onion: '🧅', potato: '🥔', default: '🌿' }

function getCropEmoji(name) {
  const lower = (name || '').toLowerCase()
  for (const [k, v] of Object.entries(CROP_EMOJIS)) {
    if (lower.includes(k)) return v
  }
  return CROP_EMOJIS.default
}

export default function CropRecommendPage() {
  const { logActivity } = useActivityLogger()
  const [params, setParams] = useState({ N: 90, P: 45, K: 45, temperature: 25, humidity: 65, ph: 7.0, rainfall: 800 })
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function applyPreset(preset) {
    setParams(p => ({ ...p, ...preset }))
  }

  function handleSlider(key, value) {
    setParams(p => ({ ...p, [key]: parseFloat(value) }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await getCropRecommendation(params)
      setResults(res.data.crops)
      logActivity('crop', 'Crop Recommendation', '', params)
    } catch (err) {
      setError('Failed to get recommendation. Please check your API key.')
    } finally {
      setLoading(false)
    }
  }

  const sliders = [
    { key: 'N', label: 'Nitrogen (N)', unit: 'kg/ha', min: 0, max: 200, step: 1 },
    { key: 'P', label: 'Phosphorus (P)', unit: 'kg/ha', min: 0, max: 200, step: 1 },
    { key: 'K', label: 'Potassium (K)', unit: 'kg/ha', min: 0, max: 200, step: 1 },
    { key: 'temperature', label: 'Temperature', unit: '°C', min: 0, max: 50, step: 0.5 },
    { key: 'humidity', label: 'Humidity', unit: '%', min: 0, max: 100, step: 1 },
    { key: 'ph', label: 'pH Level', unit: '', min: 0, max: 14, step: 0.1 },
    { key: 'rainfall', label: 'Rainfall', unit: 'mm', min: 0, max: 3000, step: 10 },
  ]

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">🌾 Crop Recommendation</h1>
        <p className="text-gray-500 text-sm mt-1">Enter your soil &amp; climate parameters to get AI-powered crop suggestions for your field.</p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-2.5 mb-5 flex items-center gap-2 text-sm text-blue-700">
        <span>📍</span> Detecting your location to auto-fill parameters...
      </div>

      <div className="flex gap-6">
        {/* Left Panel */}
        <div className="w-80 flex-shrink-0">
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <h2 className="font-bold text-gray-800 mb-1">🌱 Soil &amp; Climate Parameters</h2>
            <p className="text-gray-500 text-xs mb-4">Enter values or pick a quick preset</p>

            <div className="mb-4">
              <p className="text-xs font-semibold text-gray-600 mb-2">Crop Presets</p>
              <div className="flex flex-wrap gap-1.5">
                {Object.keys(CROP_PRESETS).map(c => (
                  <button key={c} onClick={() => applyPreset(CROP_PRESETS[c])}
                    className="px-2.5 py-1 bg-green-50 border border-green-200 text-green-700 rounded-lg text-xs font-medium hover:bg-green-100 transition-colors">
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-5">
              <p className="text-xs font-semibold text-gray-600 mb-2">Region Presets</p>
              <div className="flex flex-wrap gap-1.5">
                {Object.keys(REGION_PRESETS).map(r => (
                  <button key={r} onClick={() => applyPreset(REGION_PRESETS[r])}
                    className="px-2.5 py-1 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors">
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              {sliders.map(s => (
                <div key={s.key}>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-medium text-gray-700">{s.label}</label>
                    <span className="text-xs text-green-600 font-semibold">{params[s.key]} {s.unit}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min={s.min} max={s.max} step={s.step}
                      value={params[s.key]}
                      onChange={e => handleSlider(s.key, e.target.value)}
                      className="flex-1 h-1.5 accent-green-600"
                    />
                    <input
                      type="number"
                      min={s.min} max={s.max} step={s.step}
                      value={params[s.key]}
                      onChange={e => handleSlider(s.key, e.target.value)}
                      className="w-16 text-xs border border-gray-200 rounded-lg px-2 py-1 text-right focus:outline-none focus:ring-1 focus:ring-green-400"
                    />
                  </div>
                </div>
              ))}

              {error && <p className="text-red-500 text-xs">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-green-700 text-white font-semibold rounded-xl hover:bg-green-800 disabled:opacity-50 transition-colors text-sm mt-2"
              >
                {loading ? '⏳ Analyzing...' : '🌾 Get Recommendation'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Panel */}
        <div className="flex-1">
          <div className="bg-white rounded-2xl shadow-sm p-6 min-h-96">
            <h2 className="font-bold text-gray-800 mb-1">Smart Crop Advisor</h2>
            {!results && !loading ? (
              <div className="flex flex-col items-center justify-center h-72 text-center">
                <div className="text-6xl mb-4">🌱</div>
                <p className="text-gray-600 font-medium mb-1">Fill in your soil &amp; climate parameters</p>
                <p className="text-gray-400 text-sm">and click <strong>"Get Recommendation"</strong> to get the best crop predictions for your field.</p>
              </div>
            ) : loading ? (
              <div className="flex flex-col items-center justify-center h-72">
                <div className="text-5xl mb-4 animate-bounce">🌾</div>
                <p className="text-gray-600">Analyzing your parameters with AI...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {results.map((crop, i) => (
                  <div key={i} className="border border-gray-100 rounded-2xl p-5 hover:border-green-200 transition-colors">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-3xl">{getCropEmoji(crop.cropName)}</span>
                      <div>
                        <h3 className="font-bold text-gray-800 text-lg">{crop.cropName}</h3>
                        <span className="text-xs text-gray-500">{crop.bestSeason} · Expected: {crop.expectedYield}</span>
                      </div>
                      <div className="ml-auto text-right">
                        <div className="text-2xl font-bold text-green-600">{crop.suitabilityScore}%</div>
                        <div className="text-xs text-gray-500">Suitability</div>
                      </div>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2 mb-3">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: `${crop.suitabilityScore}%` }} />
                    </div>
                    <div className="mb-3">
                      <p className="text-xs font-semibold text-gray-600 mb-1">Why this crop?</p>
                      <ul className="space-y-0.5">
                        {(crop.reasons || []).map((r, j) => (
                          <li key={j} className="text-xs text-gray-600 flex gap-1"><span className="text-green-500">✓</span>{r}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-600 mb-1">Cultivation Tips</p>
                      <ul className="space-y-0.5">
                        {(crop.cultivationTips || []).map((t, j) => (
                          <li key={j} className="text-xs text-gray-500 flex gap-1"><span>•</span>{t}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}
