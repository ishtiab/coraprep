"use client"
import { useEffect } from 'react'
import { useApp } from '../context/AppContext'
import AnatomyDiagram from './AnatomyDiagram'

interface VocabItem {
  id: string
  term: string
  pronunciation?: string
  short?: string
  definition?: string
  context?: string
  category?: string
  level?: string
  isAnatomy?: boolean
  imagePath?: string
}

export default function VocabDetailModal({ vocabId, onClose }: { vocabId: string | null, onClose: () => void }){
  const { content, setVocabStatus, isVocabSaved, toggleVocabSaved } = useApp()

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [onClose])

  const item: VocabItem | null = vocabId ? (content?.vocab || []).find((v: any) => v.id === vocabId) || null : null
  if (!item) return null

  const level = item.level || 'unmarked'
  const category = item.category || 'General'
  const definition = item.definition || ''
  const context = item.context || ''

  const isReview = level === 'review'
  const isMastered = level === 'mastered'
  const saved = !!isVocabSaved?.(item.id)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-cyan-500 text-white p-6 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold">{item.term}</h1>
            {item.pronunciation ? (
              <p className="text-sm opacity-90 mt-1 italic">/{item.pronunciation}/</p>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label={saved ? 'Unsave term' : 'Save term'}
              onClick={() => toggleVocabSaved?.(item.id)}
              className={`rounded-full border px-3 py-1 text-xs font-bold transition ${saved ? 'border-white/40 bg-white/15 text-white' : 'border-white/30 bg-white/5 text-white hover:bg-white/10'}`}
            >
              {saved ? 'Saved' : 'Save'}
            </button>
            <button onClick={onClose} className="text-2xl font-bold opacity-75 hover:opacity-100">✕</button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className={`rounded-lg p-3 ${isMastered ? 'bg-emerald-50' : isReview ? 'bg-rose-50' : 'bg-slate-50'}`}>
              <p className="text-xs text-slate-600">Status</p>
              <p className={`text-lg font-bold ${isMastered ? 'text-emerald-700' : isReview ? 'text-rose-700' : 'text-slate-700'}`}>
                {isMastered ? 'MASTERED' : isReview ? 'NEEDS REVIEW' : 'UNMARKED'}
              </p>
            </div>
            <div className="bg-purple-50 rounded-lg p-3">
              <p className="text-xs text-slate-600">Category</p>
              <p className="text-lg font-bold text-purple-700">{category}</p>
            </div>
          </div>

          <div className="border-t pt-4">
            <h2 className="text-lg font-bold text-slate-900">Definition</h2>
            <p className="text-slate-700 mt-2 whitespace-pre-line">{definition || 'No definition available yet.'}</p>
          </div>

          {context ? (
            <div className="border-t pt-4">
              <h2 className="text-lg font-bold text-slate-900">Context & Notes</h2>
              <p className="text-slate-700 mt-2 whitespace-pre-line">{context}</p>
            </div>
          ) : null}

          {item.isAnatomy && (
            <div className="border-t pt-4">
              <h2 className="text-lg font-bold text-slate-900">Anatomy diagram</h2>
              <div className="mt-3">
                <AnatomyDiagram term={item.term} category={item.category} imagePath={item.imagePath} />
              </div>
            </div>
          )}

          <div className="border-t pt-4 flex flex-col sm:flex-row gap-2">
            <button
              type="button"
              onClick={() => setVocabStatus(item.id, isReview ? 'unmarked' : 'review')}
              className={`flex-1 py-2 px-3 rounded-lg font-semibold transition ${isReview ? 'bg-rose-600 text-white hover:bg-rose-700' : 'bg-rose-100 text-rose-700 hover:bg-rose-200'}`}
            >
              {isReview ? "Clear 'Needs review'" : "Mark as 'Needs review'"}
            </button>
            <button
              type="button"
              onClick={() => setVocabStatus(item.id, isMastered ? 'unmarked' : 'mastered')}
              className={`flex-1 py-2 px-3 rounded-lg font-semibold transition ${isMastered ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'}`}
            >
              {isMastered ? 'Clear mastered' : 'Mark as mastered'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
