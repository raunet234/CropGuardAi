import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function TopBar() {
  const { currentUser, userProfile } = useAuth()
  const navigate = useNavigate()

  const initials = userProfile?.fullName
    ? userProfile.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : currentUser?.email?.[0]?.toUpperCase() || 'U'

  return (
    <div className="flex items-center gap-4 px-6 py-3 bg-white border-b border-gray-100 shadow-sm">
      <div className="flex-1">
        <div className="relative max-w-md">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
          <input
            type="text"
            placeholder="Search features..."
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-transparent"
          />
        </div>
      </div>

      <button className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors">
        <span className="text-xl">🔔</span>
        <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-bold">3</span>
      </button>

      <button
        onClick={() => navigate('/profile')}
        className="w-9 h-9 rounded-full bg-green-600 flex items-center justify-center text-white text-sm font-bold hover:bg-green-700 transition-colors"
      >
        {initials}
      </button>
    </div>
  )
}
