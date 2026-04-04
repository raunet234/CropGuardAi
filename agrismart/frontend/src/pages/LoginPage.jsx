import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, loginWithGoogle } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message.replace('Firebase: ', '').replace(/\(auth.*\)/, ''))
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogle() {
    setError('')
    setLoading(true)
    try {
      await loginWithGoogle()
      navigate('/dashboard')
    } catch (err) {
      setError(err.message.replace('Firebase: ', '').replace(/\(auth.*\)/, ''))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex" style={{ background: '#F0F7F0' }}>
      {/* Left image */}
      <div
        className="hidden lg:flex flex-1 items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #1a3d1a 0%, #2D6A2D 50%, #4CAF50 100%)' }}
      >
        <div className="text-center text-white px-12">
          <div className="text-8xl mb-6">🌾</div>
          <h2 className="text-3xl font-bold mb-3">AgriSmart</h2>
          <p className="text-green-200 text-lg">AI-powered smart farming for Indian farmers</p>
          <div className="mt-8 space-y-3 text-sm text-green-200">
            <p>✓ Crop recommendations powered by AI</p>
            <p>✓ Plant disease detection</p>
            <p>✓ Live market prices</p>
            <p>✓ 13 Indian languages</p>
          </div>
        </div>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 text-center mb-1">Welcome Back</h2>
            <p className="text-gray-500 text-sm text-center mb-6">Sign in to your AgriSmart account</p>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2 mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                />
                <p className="text-right mt-1">
                  <a href="#" className="text-green-600 text-xs hover:underline">Forgot Password?</a>
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-green-700 text-white font-semibold rounded-xl hover:bg-green-800 transition-colors disabled:opacity-50 text-sm"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>

              <button
                type="button"
                disabled={loading}
                className="w-full py-2.5 bg-green-900 text-white font-semibold rounded-xl hover:bg-green-950 transition-colors disabled:opacity-50 text-sm"
              >
                Admin Login
              </button>
            </form>

            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400 font-medium">OR</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            <button
              onClick={handleGoogle}
              disabled={loading}
              className="w-full py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span className="text-base">G</span>
              Continue with Google
            </button>

            <p className="text-center text-sm text-gray-500 mt-4">
              Don't have an account?{' '}
              <Link to="/signup" className="text-green-600 font-semibold hover:underline">Sign Up</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
