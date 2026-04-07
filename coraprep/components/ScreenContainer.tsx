import React from 'react'

export default function ScreenContainer({ children }: { children: React.ReactNode }) {
  return (
    <main className="screen-container min-h-screen pb-24">
      <div className="space-y-6">{children}</div>
    </main>
  )
}
