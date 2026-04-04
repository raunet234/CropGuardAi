import React from 'react'

export default function PriceBar({ min, max, modal }) {
  const minVal = parseFloat(min) || 0
  const maxVal = parseFloat(max) || 0
  const modalVal = parseFloat(modal) || 0

  if (maxVal === 0) return null

  const modalPct = ((modalVal - minVal) / (maxVal - minVal || 1)) * 100

  return (
    <div className="flex items-center gap-2 w-full">
      <span className="text-xs text-gray-500 w-12 text-right">₹{minVal}</span>
      <div className="flex-1 relative h-2 bg-gray-100 rounded-full">
        <div
          className="absolute h-2 bg-gradient-to-r from-green-400 to-green-600 rounded-full"
          style={{ width: '100%' }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-2 border-green-600 rounded-full shadow"
          style={{ left: `calc(${Math.max(0, Math.min(100, modalPct))}% - 6px)` }}
        />
      </div>
      <span className="text-xs text-gray-500 w-12">₹{maxVal}</span>
    </div>
  )
}
