import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ToastProvider } from './contexts/ToastContext'

import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import DashboardPage from './pages/DashboardPage'
import AssistantPage from './pages/AssistantPage'
import CropRecommendPage from './pages/CropRecommendPage'
import DiseaseDetectionPage from './pages/DiseaseDetectionPage'
import ExpertGuidelinesPage from './pages/ExpertGuidelinesPage'
import WeatherPage from './pages/WeatherPage'
import MarketPricesPage from './pages/MarketPricesPage'
import GovtPoliciesPage from './pages/GovtPoliciesPage'
import CommunityPage from './pages/CommunityPage'
import HistoryPage from './pages/HistoryPage'
import ProfilePage from './pages/ProfilePage'

function PrivateRoute({ children }) {
  const { currentUser, loading } = useAuth()
  if (loading) return <div className="flex items-center justify-center h-screen"><div className="text-green-600 text-lg">Loading...</div></div>
  return currentUser ? children : <Navigate to="/login" replace />
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
      <Route path="/assistant" element={<PrivateRoute><AssistantPage /></PrivateRoute>} />
      <Route path="/crop-recommend" element={<PrivateRoute><CropRecommendPage /></PrivateRoute>} />
      <Route path="/disease-detection" element={<PrivateRoute><DiseaseDetectionPage /></PrivateRoute>} />
      <Route path="/expert-guidelines" element={<PrivateRoute><ExpertGuidelinesPage /></PrivateRoute>} />
      <Route path="/weather" element={<PrivateRoute><WeatherPage /></PrivateRoute>} />
      <Route path="/market-prices" element={<PrivateRoute><MarketPricesPage /></PrivateRoute>} />
      <Route path="/govt-policies" element={<PrivateRoute><GovtPoliciesPage /></PrivateRoute>} />
      <Route path="/community" element={<PrivateRoute><CommunityPage /></PrivateRoute>} />
      <Route path="/history" element={<PrivateRoute><HistoryPage /></PrivateRoute>} />
      <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
