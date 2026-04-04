import React, { useState } from 'react'
import Layout from '../components/Layout'
import { useActivityLogger } from '../hooks/useActivityLogger'
import { getWeather } from '../services/api'
import { chatWithAI } from '../services/api'
import LoadingSkeleton from '../components/LoadingSkeleton'

const CITIES = ['Delhi', 'Ludhiana', 'Chandigarh', 'Jaipur', 'Lucknow', 'Mumbai', 'Bengaluru', 'Hyderabad', 'Patna', 'Pune']

function getActivityScore(w) {
  if (!w) return 0
  let score = 100
  if (w.humidity > 80) score -= 20
  if (w.windSpeed > 10) score -= 15
  if (w.temp > 40) score -= 25
  if (w.temp < 5) score -= 25
  if (w.rain > 10) score -= 20
  return Math.max(0, Math.min(100, score))
}

function getActivityLabel(score) {
  if (score >= 70) return { label: 'Good', color: '#22c55e' }
  if (score >= 40) return { label: 'Moderate', color: '#f97316' }
  return { label: 'Poor', color: '#ef4444' }
}

const WEATHER_ICONS = {
  Clear: '☀️', Clouds: '☁️', Rain: '🌧️', Drizzle: '🌦️', Thunderstorm: '⛈️', Snow: '❄️', Mist: '🌫️', Fog: '🌫️', Haze: '🌫️'
}

export default function WeatherPage() {
  const { logActivity } = useActivityLogger()
  const [city, setCity] = useState('')
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('overview')
  const [advisory, setAdvisory] = useState('')
  const [advisoryLoading, setAdvisoryLoading] = useState(false)

  async function fetchWeather(c) {
    if (!c) return
    setLoading(true)
    setError('')
    setWeather(null)
    setAdvisory('')
    try {
      const res = await getWeather(c)
      setWeather(res.data)
      logActivity('weather', `Weather: ${c}`, '', res.data)
    } catch (err) {
      setError(err.response?.data?.error || 'City not found or API error')
    } finally {
      setLoading(false)
    }
  }

  async function fetchAdvisory() {
    if (!weather) return
    setAdvisoryLoading(true)
    try {
      const prompt = `Current weather in ${weather.city}: Temperature ${weather.temp}°C, Humidity ${weather.humidity}%, Wind ${weather.windSpeed} m/s, Condition: ${weather.description}, Rain: ${weather.rain}mm. Provide farming advisory for today including: field activity suitability, irrigation advice, spray advice, crop protection tips. Keep it concise and practical for Indian farmers.`
      const res = await chatWithAI([{ role: 'user', content: prompt }])
      setAdvisory(res.data.response)
    } catch {
      setAdvisory('Failed to generate advisory. Please check your API key.')
    } finally {
      setAdvisoryLoading(false)
    }
  }

  function handleTabChange(tab) {
    setActiveTab(tab)
    if (tab === 'advisory' && weather && !advisory) fetchAdvisory()
  }

  const activityScore = getActivityScore(weather)
  const { label: activityLabel, color: activityColor } = getActivityLabel(activityScore)

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">🌤 Farmer Weather Advisory</h1>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl shadow-sm p-5 mb-5">
        <div className="flex gap-3 mb-3">
          <input
            value={city}
            onChange={e => setCity(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && fetchWeather(city)}
            placeholder="Enter city name..."
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
          />
          <button
            onClick={() => fetchWeather(city)}
            disabled={loading || !city}
            className="px-5 py-2.5 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 disabled:opacity-50 text-sm"
          >
            {loading ? '⏳' : 'Get Weather'}
          </button>
          <button
            onClick={() => {
              if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(async pos => {
                  const { latitude, longitude } = pos.coords
                  const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`)
                  const data = await res.json()
                  const cityName = data.address?.city || data.address?.town || data.address?.county || 'Delhi'
                  setCity(cityName)
                  fetchWeather(cityName)
                })
              }
            }}
            className="px-4 py-2.5 border border-gray-300 rounded-xl text-sm hover:bg-gray-50"
          >
            📍 My Location
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {CITIES.map(c => (
            <button key={c} onClick={() => { setCity(c); fetchWeather(c) }}
              className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium hover:bg-green-100 hover:text-green-700 transition-colors">
              {c}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-4">{error}</div>}

      {loading && (
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <LoadingSkeleton lines={5} height="h-5" />
        </div>
      )}

      {weather && !loading && (
        <div className="flex gap-5">
          {/* Main weather card */}
          <div className="flex-1">
            <div className="rounded-2xl p-6 mb-4 text-white" style={{ background: 'linear-gradient(135deg, #1a3d1a 0%, #2D6A2D 100%)' }}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-green-300 text-sm">{weather.city}, {weather.country}</p>
                  <div className="flex items-end gap-3 mt-1">
                    <span className="text-6xl font-bold">{weather.temp}°C</span>
                    <span className="text-5xl">{WEATHER_ICONS[weather.main] || '🌡️'}</span>
                  </div>
                  <p className="text-green-200 mt-1 capitalize">{weather.description}</p>
                  <p className="text-green-300 text-sm mt-0.5">Feels like {weather.feelsLike}°C · H:{weather.tempMax}° L:{weather.tempMin}°</p>
                </div>
              </div>
              <div className="grid grid-cols-5 gap-4 mt-5 pt-4 border-t border-green-700">
                {[
                  { label: 'Humidity', val: `${weather.humidity}%` },
                  { label: 'Wind', val: `${weather.windSpeed} m/s` },
                  { label: 'Pressure', val: `${weather.pressure} hPa` },
                  { label: 'Clouds', val: `${weather.clouds}%` },
                  { label: 'Rain', val: `${weather.rain} mm` },
                ].map(s => (
                  <div key={s.label} className="text-center">
                    <p className="text-xl font-bold">{s.val}</p>
                    <p className="text-green-300 text-xs mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="flex border-b border-gray-100">
                {[
                  { id: 'overview', label: 'Overview' },
                  { id: 'advisory', label: 'Advisory' },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`px-6 py-3 text-sm font-medium transition-colors ${activeTab === tab.id ? 'border-b-2 border-green-600 text-green-600' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="p-5">
                {activeTab === 'overview' && (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><span className="text-gray-500">Visibility</span><span className="ml-2 font-medium">{(weather.visibility / 1000).toFixed(1)} km</span></div>
                    <div><span className="text-gray-500">Wind Direction</span><span className="ml-2 font-medium">{weather.windDeg}°</span></div>
                    <div><span className="text-gray-500">Min Temp</span><span className="ml-2 font-medium">{weather.tempMin}°C</span></div>
                    <div><span className="text-gray-500">Max Temp</span><span className="ml-2 font-medium">{weather.tempMax}°C</span></div>
                  </div>
                )}

                {activeTab === 'advisory' && (
                  advisoryLoading ? <LoadingSkeleton lines={6} /> : (
                    <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{advisory || 'Loading advisory...'}</div>
                  )
                )}
              </div>
            </div>
          </div>

          {/* Activity Score */}
          <div className="w-56 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-sm p-5 mb-4">
              <h3 className="font-semibold text-gray-800 text-sm mb-4">Field Activity</h3>
              <div className="flex justify-center mb-3">
                <div className="relative w-24 h-24">
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="10" />
                    <circle cx="50" cy="50" r="40" fill="none" stroke={activityColor} strokeWidth="10"
                      strokeDasharray={`${(activityScore / 100) * 251} 251`} strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl font-bold" style={{ color: activityColor }}>{activityScore}</span>
                    <span className="text-xs text-gray-500">/100</span>
                  </div>
                </div>
              </div>
              <p className="text-center font-semibold text-sm mb-4" style={{ color: activityColor }}>{activityLabel} for Field Work</p>

              <div className="space-y-3 text-xs">
                <div className="p-2.5 bg-blue-50 rounded-xl">
                  <p className="font-semibold text-blue-700 mb-1">💧 Irrigation</p>
                  <p className="text-blue-600">{weather.humidity > 70 ? 'No irrigation needed today' : weather.humidity > 50 ? 'Light irrigation recommended' : 'Irrigation recommended'}</p>
                </div>
                <div className="p-2.5 bg-yellow-50 rounded-xl">
                  <p className="font-semibold text-yellow-700 mb-1">🌿 Spraying</p>
                  <p className="text-yellow-600">{weather.windSpeed > 8 ? 'Avoid spraying — high winds' : weather.humidity < 40 ? 'Good conditions for spraying' : 'Moderate spraying conditions'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
