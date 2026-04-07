import React from 'react'

export default function VocabularyCard({ title, desc }: { title: string, desc: string }) {
  return (
    <article className="vocab-card">
      <div>
        <h3 className="text-lg font-bold text-blue-800">{title}</h3>
        <p className="text-gray-600 text-sm">{desc}</p>
      </div>
      <span className="w-4 h-4 rounded-full bg-blue-500" aria-hidden="true" />
    </article>
  )
}
