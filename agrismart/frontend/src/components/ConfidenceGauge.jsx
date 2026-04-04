import React from 'react'

export default function ConfidenceGauge({ value = 0 }) {
  const radius = 54
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (value / 100) * circumference

  const color = value >= 70 ? '#ef4444' : value >= 40 ? '#f97316' : '#22c55e'

  return (
    <div className="flex flex-col items-center">
      <svg width="130" height="130" viewBox="0 0 130 130">
        <circle cx="65" cy="65" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="10" />
        <circle
          cx="65"
          cy="65"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 65 65)"
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
        <text x="65" y="60" textAnchor="middle" fontSize="22" fontWeight="700" fill="#1f2937">
          {value}%
        </text>
        <text x="65" y="80" textAnchor="middle" fontSize="11" fill="#6b7280">
          Confidence
        </text>
      </svg>
      <span
        className="text-xs font-semibold px-3 py-1 rounded-full mt-1"
        style={{ background: color + '20', color }}
      >
        {value >= 70 ? 'High Risk' : value >= 40 ? 'Moderate' : 'Low Risk'}
      </span>
    </div>
  )
}
