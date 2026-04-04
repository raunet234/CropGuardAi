import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: '⊞' },
  { to: '/assistant', label: 'AI Assistant', icon: '💬' },
  { to: '/crop-recommend', label: 'Crop Recommend', icon: '🌾' },
  { to: '/disease-detection', label: 'Disease Detection', icon: '🔬' },
  { to: '/expert-guidelines', label: 'Expert Guidelines', icon: '📋' },
  { to: '/weather', label: 'Weather', icon: '🌤' },
  { to: '/market-prices', label: 'Market Prices', icon: '📊' },
  { to: '/govt-policies', label: 'Govt Policies', icon: '🏛' },
  { to: '/community', label: 'Community', icon: '👥' },
]

const accountItems = [
  { to: '/history', label: 'History', icon: '🕐' },
  { to: '/profile', label: 'My Profile', icon: '👤' },
]

export default function Sidebar({ collapsed, setCollapsed }) {
  const { currentUser, userProfile, logout } = useAuth()
  const navigate = useNavigate()

  const initials = userProfile?.fullName
    ? userProfile.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : currentUser?.email?.[0]?.toUpperCase() || 'U'

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  return (
    <div
      className="flex flex-col h-full overflow-hidden transition-all duration-200"
      style={{ background: '#1a3d1a', width: collapsed ? 60 : 220 }}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-3 py-4 border-b border-green-800">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <span className="text-xl">🌱</span>
            <span className="text-white font-bold text-base">AgriSmart</span>
          </div>
        )}
        {collapsed && <span className="text-xl mx-auto">🌱</span>}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-green-300 hover:text-white p-1 rounded ml-auto"
        >
          {collapsed ? '→' : '←'}
        </button>
      </div>

      {/* Main Nav */}
      <div className="flex-1 overflow-y-auto py-2 px-2">
        {!collapsed && <p className="text-green-500 text-xs font-semibold px-2 py-2 uppercase tracking-wider">Main Menu</p>}
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg mb-0.5 text-sm font-medium transition-colors cursor-pointer no-underline ${
                isActive
                  ? 'bg-green-700 text-white'
                  : 'text-green-200 hover:bg-green-800 hover:text-white'
              }`
            }
            title={collapsed ? item.label : ''}
          >
            <span className="text-base flex-shrink-0">{item.icon}</span>
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}

        {!collapsed && <p className="text-green-500 text-xs font-semibold px-2 pt-4 pb-2 uppercase tracking-wider">Account</p>}
        {collapsed && <div className="my-2 border-t border-green-800" />}
        {accountItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg mb-0.5 text-sm font-medium transition-colors cursor-pointer no-underline ${
                isActive
                  ? 'bg-green-700 text-white'
                  : 'text-green-200 hover:bg-green-800 hover:text-white'
              }`
            }
            title={collapsed ? item.label : ''}
          >
            <span className="text-base flex-shrink-0">{item.icon}</span>
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </div>

      {/* User + Sign Out */}
      <div className="border-t border-green-800 p-3">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {initials}
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <p className="text-white text-xs font-semibold truncate">{userProfile?.fullName || 'User'}</p>
              <p className="text-green-400 text-xs truncate">{userProfile?.role || 'Farmer'}</p>
            </div>
          )}
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-green-300 hover:text-white text-xs w-full px-2 py-1.5 rounded hover:bg-green-800 transition-colors"
          title={collapsed ? 'Sign Out' : ''}
        >
          <span>↪</span>
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </div>
  )
}
