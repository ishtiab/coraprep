import React from 'react'

export default function GradientButton({ children, onClick }: { children: React.ReactNode, onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full rounded-btn text-white font-semibold py-3 shadow-md transition transform hover:-translate-y-0.5"
      style={{
        backgroundImage: 'linear-gradient(90deg, #1E63B5 0%, #6FAFE7 100%)',
      }}
      type="button"
    >
      {children}
    </button>
  )
}
