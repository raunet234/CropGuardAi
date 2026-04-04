import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import { useAuth } from '../contexts/AuthContext'
import { getHistory, getWeather } from '../services/api'

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'GOOD MORNING'
  if (h < 17) return 'GOOD AFTERNOON'
  return 'GOOD EVENING'
}

function getSeason() {
  const m = new Date().getMonth() + 1
  if (m >= 6 && m <= 10) return 'Kharif Season'
  if (m >= 11 || m <= 2) return 'Rabi Season'
  return 'Zaid Season'
}

function formatDate() {
  return new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })
}

const featureCards = [
  { icon: '🌱', title: 'Crop Recommendation', sub: 'AI-powered for your soil', to: '/crop-recommend', color: '#e8f5e9' },
  { icon: '🔬', title: 'Disease Detection', sub: 'Upload leaf for diagnosis', to: '/disease-detection', color: '#fce4ec' },
  { icon: '💬', title: 'AI Assistant', sub: '13 Indian languages', to: '/assistant', color: '#e3f2fd' },
  { icon: '📊', title: 'Market Prices', sub: 'Live mandi near you', to: '/market-prices', color: '#fff3e0' },
]

export default function DashboardPage() {
  const { currentUser, userProfile } = useAuth()
  const [history, setHistory] = useState([])
  const [weather, setWeather] = useState(null)
  const [weatherLoading, setWeatherLoading] = useState(false)
  const firstName = userProfile?.fullName?.split(' ')[0] || 'Farmer'

  useEffect(() => {
    if (currentUser) {
      getHistory(currentUser.uid).then(r => setHistory(r.data.history || [])).catch(() => {})
    }
  }, [currentUser])

  useEffect(() => {
    const city = userProfile?.city || userProfile?.district || userProfile?.state
    if (city) {
      setWeatherLoading(true)
      getWeather(city)
        .then(r => setWeather(r.data))
        .catch(() => setWeather(null))
        .finally(() => setWeatherLoading(false))
    }
  }, [userProfile])

  const chatCount = history.filter(h => h.type === 'chat').length
  const cropCount = history.filter(h => h.type === 'crop').length
  const diseaseCount = history.filter(h => h.type === 'disease').length
  const marketCount = history.filter(h => h.type === 'market').length
  const weatherCount = history.filter(h => h.type === 'weather').length

  return (
    <Layout>
      {/* Welcome Banner */}
      <div className="rounded-2xl p-6 mb-6 text-white" style={{ background: 'linear-gradient(135deg, #2D6A2D 0%, #4CAF50 100%)' }}>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-green-200 text-sm font-semibold uppercase tracking-wide mb-1">
              {getGreeting()} 🌾
            </p>
            <h1 className="text-2xl font-bold mb-1">{firstName}, your farm is ready.</h1>
            <p className="text-green-200 text-sm">{formatDate()}</p>
            <div className="flex gap-2 mt-3 flex-wrap">
              <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-xs font-medium">📍 {userProfile?.city || 'Your Location'}</span>
              <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-xs font-medium">🌾 {getSeason()}</span>
              <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-xs font-medium">{userProfile?.role || 'Farmer'}</span>
            </div>
          </div>
          <div className="flex gap-6 text-center">
            {[
              { label: 'QUERIES', val: chatCount },
              { label: 'SCANS', val: diseaseCount },
              { label: 'MARKETS', val: marketCount },
            ].map(s => (
              <div key={s.label}>
                <p className="text-2xl font-bold">{s.val}</p>
                <p className="text-green-200 text-xs">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-6">
        <div className="flex-1">
          {/* Feature Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {featureCards.map(card => (
              <div key={card.title} className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-3xl mb-3">{card.icon}</div>
                <h3 className="font-semibold text-gray-800 text-sm mb-1">{card.title}</h3>
                <p className="text-gray-500 text-xs mb-3">{card.sub}</p>
                <Link to={card.to} className="text-green-600 text-xs font-semibold hover:underline">Open →</Link>
              </div>
            ))}
          </div>

          {/* Activity Summary */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-800">📋 Activity Summary</h2>
              <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full">● Live</span>
            </div>
            <p className="text-gray-500 text-xs mb-4">All features combined</p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Chat Queries', val: chatCount, icon: '💬' },
                { label: 'Crop AI', val: cropCount, icon: '🌾' },
                { label: 'Disease Scans', val: diseaseCount, icon: '🔬' },
                { label: 'Weather', val: weatherCount, icon: '🌤' },
                { label: 'Market Views', val: marketCount, icon: '📊' },
                { label: 'Total', val: history.length, icon: '📋' },
              ].map(s => (
                <div key={s.label} className="bg-gray-50 rounded-xl p-3 text-center">
                  <div className="text-xl mb-1">{s.icon}</div>
                  <p className="text-xl font-bold text-gray-800">{s.val}</p>
                  <p className="text-gray-500 text-xs">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Weather Widget */}
        <div className="w-64 flex-shrink-0">
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-3">🌤 Weather</h3>
            {weatherLoading ? (
              <div className="text-center py-4 text-gray-500 text-sm">Loading...</div>
            ) : weather ? (
              <div className="text-center">
                <p className="text-4xl font-bold text-gray-800">{weather.temp}°C</p>
                <p className="text-gray-600 text-sm mt-1 capitalize">{weather.description}</p>
                <p className="text-gray-500 text-xs mt-1">{weather.city}</p>
                <div className="mt-3 space-y-1.5 text-xs text-gray-600">
                  <div className="flex justify-between"><span>Humidity</span><span className="font-medium">{weather.humidity}%</span></div>
                  <div className="flex justify-between"><span>Wind</span><span className="font-medium">{weather.windSpeed} m/s</span></div>
                  <div className="flex justify-between"><span>Feels like</span><span className="font-medium">{weather.feelsLike}°C</span></div>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <div className="text-4xl mb-2">⛅</div>
                <p className="text-gray-600 text-sm font-medium">Weather unavailable</p>
                <Link to="/weather" className="mt-3 inline-block px-4 py-2 bg-green-600 text-white text-xs rounded-xl hover:bg-green-700">
                  Check Weather →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}
