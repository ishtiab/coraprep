import React from 'react'

export default function StatsCard({ accuracy=0, avgTime=0, mastery=0 }: { accuracy?: number, avgTime?: number, mastery?: number }){
  return (
    <div className="mt-2 space-y-2">
      <div>Accuracy: <strong>{accuracy}%</strong></div>
      <div>Avg time: <strong>{avgTime}s</strong></div>
      <div>Mastery: <strong>{mastery}%</strong></div>
    </div>
  )
}
