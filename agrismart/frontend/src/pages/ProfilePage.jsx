import React, { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { useAuth } from '../contexts/AuthContext'
import { updateProfile } from '../services/api'

const LANGUAGES = ['English', 'Hindi', 'Punjabi', 'Tamil', 'Telugu', 'Kannada', 'Malayalam', 'Bengali', 'Marathi', 'Gujarati', 'Odia', 'Urdu', 'Assamese']
const STATES = ['Andhra Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Odisha', 'Punjab', 'Rajasthan', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal']
const SOIL_TYPES = ['Clay', 'Sandy', 'Loamy', 'Black (Regur)', 'Red', 'Alluvial', 'Laterite']
const IRRIGATION_TYPES = ['Canal', 'Drip', 'Sprinkler', 'Flood', 'Rainfed', 'Borewell', 'Pond/Tank']

export default function ProfilePage() {
  const { currentUser, userProfile, refreshProfile } = useAuth()
  const [form, setForm] = useState({
    fullName: '', phone: '', language: 'English',
    state: '', district: '', city: '',
    farmSize: '', farmSizeUnit: 'Acres',
    soilType: '', irrigationType: '', role: 'Farmer',
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (userProfile) setForm(prev => ({ ...prev, ...userProfile }))
  }, [userProfile])

  function handleChange(key, value) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  async function handleSave() {
    if (!currentUser) return
    setSaving(true)
    try {
      await updateProfile(currentUser.uid, { ...form, email: currentUser.email })
      await refreshProfile()
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch { } finally {
      setSaving(false)
    }
  }

  const initials = form.fullName
    ? form.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : currentUser?.email?.[0]?.toUpperCase() || 'U'

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">👤 My Profile</h1>
      </div>

      {saved && (
        <div className="bg-green-50 border border-green-300 text-green-700 rounded-xl px-4 py-3 mb-4 text-sm font-medium">
          ✓ Profile saved successfully!
        </div>
      )}

      <div className="flex gap-5">
        {/* Left card */}
        <div className="w-72 flex-shrink-0">
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex flex-col items-center mb-5">
              <div className="w-20 h-20 rounded-full bg-green-600 flex items-center justify-center text-white text-2xl font-bold mb-3">
                {initials}
              </div>
              <h2 className="font-bold text-gray-800 text-lg">{form.fullName || 'Your Name'}</h2>
              <p className="text-gray-500 text-sm">{currentUser?.email}</p>
              <span className="mt-2 bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">{form.role}</span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Full Name</label>
                <input value={form.fullName} onChange={e => handleChange('fullName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Phone</label>
                <input value={form.phone} onChange={e => handleChange('phone', e.target.value)}
                  placeholder="+91 XXXXX XXXXX"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Language</label>
                <select value={form.language} onChange={e => handleChange('language', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-white">
                  {LANGUAGES.map(l => <option key={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Role</label>
                <select value={form.role} onChange={e => handleChange('role', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-white">
                  {['Farmer', 'Expert', 'Admin'].map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Right card */}
        <div className="flex-1">
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="font-bold text-gray-800 mb-4">🌾 Farm Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">State</label>
                <select value={form.state} onChange={e => handleChange('state', e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-white">
                  <option value="">Select State</option>
                  {STATES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">District</label>
                <input value={form.district} onChange={e => handleChange('district', e.target.value)}
                  placeholder="Your district"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">City / Village</label>
                <input value={form.city} onChange={e => handleChange('city', e.target.value)}
                  placeholder="Your city or village"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Farm Size</label>
                  <input type="number" value={form.farmSize} onChange={e => handleChange('farmSize', e.target.value)}
                    placeholder="e.g. 5"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
                </div>
                <div className="w-28">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Unit</label>
                  <select value={form.farmSizeUnit} onChange={e => handleChange('farmSizeUnit', e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-white">
                    {['Acres', 'Hectares', 'Bigha'].map(u => <option key={u}>{u}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Soil Type</label>
                <select value={form.soilType} onChange={e => handleChange('soilType', e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-white">
                  <option value="">Select Soil Type</option>
                  {SOIL_TYPES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Irrigation Type</label>
                <select value={form.irrigationType} onChange={e => handleChange('irrigationType', e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-white">
                  <option value="">Select Irrigation Type</option>
                  {IRRIGATION_TYPES.map(i => <option key={i}>{i}</option>)}
                </select>
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="mt-6 px-8 py-2.5 bg-green-700 text-white font-semibold rounded-xl hover:bg-green-800 disabled:opacity-50 transition-colors text-sm"
            >
              {saving ? 'Saving...' : '💾 Save Profile'}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  )
}
