import React from 'react'
import { Link } from 'react-router-dom'

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f0f7f0 0%, #e8f5e9 100%)' }}>
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌱</span>
          <span className="text-xl font-bold text-green-800">AgriSmart</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="px-5 py-2 text-green-700 font-semibold rounded-lg border border-green-300 hover:bg-green-50 transition-colors text-sm">
            Login
          </Link>
          <Link to="/signup" className="px-5 py-2 bg-green-700 text-white font-semibold rounded-lg hover:bg-green-800 transition-colors text-sm">
            Sign Up
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="max-w-6xl mx-auto px-8 py-16 flex items-center gap-12">
        <div className="flex-1">
          <h1 className="text-5xl font-bold text-gray-800 leading-tight mb-4">
            Grow Smarter with{' '}
            <span className="text-green-700">AI Farming</span>
          </h1>
          <p className="text-gray-600 text-lg mb-8 leading-relaxed max-w-md">
            Crop recommendations, disease detection, market prices &amp; weather — all in{' '}
            <strong>your language</strong>, powered by AI.
          </p>
          <div className="flex gap-4">
            <Link
              to="/signup"
              className="px-7 py-3 bg-green-800 text-white font-semibold rounded-xl hover:bg-green-900 transition-colors shadow-lg text-base"
            >
              Start for Free
            </Link>
            <Link
              to="/login"
              className="px-7 py-3 border-2 border-green-700 text-green-700 font-semibold rounded-xl hover:bg-green-50 transition-colors text-base"
            >
              Sign In
            </Link>
          </div>

          <div className="flex items-center gap-6 mt-10">
            {['🌾 Crop AI', '🔬 Disease Detection', '📊 Market Prices', '🌤 Weather'].map(f => (
              <span key={f} className="text-sm text-gray-600 font-medium">{f}</span>
            ))}
          </div>
        </div>

        <div className="flex-1 flex justify-center">
          <div
            className="w-96 h-64 rounded-2xl shadow-xl overflow-hidden flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #2d6a2d 0%, #4caf50 50%, #8bc34a 100%)' }}
          >
            <div className="text-center text-white">
              <div className="text-7xl mb-3">🌾</div>
              <p className="text-lg font-semibold opacity-90">Smart Farming Platform</p>
              <p className="text-sm opacity-70 mt-1">For Indian Farmers</p>
            </div>
          </div>
        </div>
      </div>

      {/* Feature strip */}
      <div className="max-w-6xl mx-auto px-8 pb-16">
        <div className="grid grid-cols-4 gap-4">
          {[
            { icon: '🌱', title: 'Crop Recommendation', desc: 'AI-powered soil & climate analysis' },
            { icon: '🔬', title: 'Disease Detection', desc: 'Upload leaf photo for diagnosis' },
            { icon: '📊', title: 'Market Prices', desc: 'Live mandi prices from Agmarknet' },
            { icon: '🏛', title: 'Govt Schemes', desc: 'PM-KISAN, PMFBY and more' },
          ].map(f => (
            <div key={f.title} className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="text-3xl mb-2">{f.icon}</div>
              <h3 className="font-semibold text-gray-800 text-sm">{f.title}</h3>
              <p className="text-gray-500 text-xs mt-1">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
