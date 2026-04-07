"use client"
import { useApp } from '../../../context/AppContext'
import AnatomyDiagram from '../../../components/AnatomyDiagram'

export default function VocabDetail({ params }: { params: { id: string } }){
  const { content, setVocabStatus, isVocabSaved, toggleVocabSaved } = useApp()
  const id = params.id
  const item = (content?.vocab || []).find((v:any)=>v.id === id)

  if(!item) return <div className="p-6">Not found</div>

  const status = item.level || 'unmarked'
  const isReview = status === 'review'
  const isMastered = status === 'mastered'
  const saved = !!isVocabSaved?.(item.id)

  return (
    <main className="p-6 min-h-screen">
      <div className={`max-w-2xl mx-auto card ${isReview ? 'ring-2 ring-rose-200' : isMastered ? 'ring-2 ring-emerald-200' : ''}`}>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl font-extrabold text-slate-900">{item.term}</h1>
            <p className="text-slate-600 mt-2 whitespace-pre-line">{item.definition || 'No definition available yet.'}</p>
          </div>
          <div className="shrink-0 flex flex-col items-end gap-2">
            <button
              type="button"
              aria-label={saved ? 'Unsave term' : 'Save term'}
              onClick={() => toggleVocabSaved?.(item.id)}
              className={`rounded-full border px-3 py-1 text-xs font-bold transition ${saved ? 'border-blue-200 bg-blue-50 text-blue-800' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}
            >
              {saved ? 'Saved' : 'Save'}
            </button>
            {isReview ? (
              <span className="text-xs px-2 py-1 rounded font-semibold bg-rose-100 text-rose-700">Needs review</span>
            ) : isMastered ? (
              <span className="text-xs px-2 py-1 rounded font-semibold bg-emerald-100 text-emerald-700">Mastered</span>
            ) : (
              <span className="text-xs px-2 py-1 rounded font-semibold bg-slate-100 text-slate-700">Unmarked</span>
            )}
          </div>
        </div>

        <div className="mt-5 flex flex-col sm:flex-row gap-2">
          <button
            type="button"
            onClick={() => setVocabStatus(item.id, isReview ? 'unmarked' : 'review')}
            className={`flex-1 py-3 px-4 rounded-[16px] font-semibold transition ${isReview ? 'bg-rose-600 text-white hover:bg-rose-700' : 'bg-rose-100 text-rose-700 hover:bg-rose-200'}`}
          >
            {isReview ? "Clear 'Needs review'" : "Mark as 'Needs review'"}
          </button>
          <button
            type="button"
            onClick={() => setVocabStatus(item.id, isMastered ? 'unmarked' : 'mastered')}
            className={`flex-1 py-3 px-4 rounded-[16px] font-semibold transition ${isMastered ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'}`}
          >
            {isMastered ? 'Clear mastered' : 'Mark as mastered'}
          </button>
        </div>

        {item.isAnatomy ? (
          <div className="mt-6 border-t pt-5">
            <h2 className="text-lg font-bold text-slate-900">Anatomy diagram</h2>
            <div className="mt-3">
              <AnatomyDiagram term={item.term} category={item.category} imagePath={item.imagePath} />
            </div>
          </div>
        ) : null}
      </div>
    </main>
  )
}
