import React from 'react'

export default function MascotCora({ size = 80, variant = 'mascot' }: { size?: number, variant?: 'mascot' | 'logo' }){
  const label = variant === 'logo' ? 'Cora Prep' : 'Cora mascot'

  return (
    <div className="flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label={label}>
        <defs>
          <linearGradient id="brainGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
        <circle cx="60" cy="60" r="56" fill="#e0f2fe" stroke="#bfdbfe" strokeWidth="4" />
        <path d="M35 45c0-5 8-15 15-15s15 12 15 20c0 6-2 11-2 15s1 12-5 15-10-6-12-9-10-12-11-21z" fill="url(#brainGradient)" />
        <path d="M70 50c2-8 15-12 18-5s-2 16-6 18-6 1-10-3-3-12-2-10z" fill="url(#brainGradient)" />
        <circle cx="48" cy="63" r="5" fill="#0f172a" />
        <circle cx="72" cy="63" r="5" fill="#0f172a" />
        <path d="M50 77c5 5 15 5 20 0" stroke="#0f172a" strokeWidth="4" strokeLinecap="round" />
      </svg>
    </div>
  )
}
