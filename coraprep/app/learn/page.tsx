"use client"
import { useCallback, useEffect, useMemo, useState } from 'react'
import ScreenContainer from '../../components/ScreenContainer'
import { useApp } from '../../context/AppContext'
import { ProtectedRoute } from '../../components/ProtectedRoute'

type Rating = 'hard' | 'medium' | 'easy' | null

function TreeItem({
  item,
  depth = 0,
  onMark,
  getRating,
  isSaved,
  toggleSaved,
}: {
  item: any
  depth: number
  onMark: (id: string, rating: Rating) => void
  getRating: (id: string) => Rating
  isSaved: (id: string) => boolean
  toggleSaved: (id: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [showAnswer, setShowAnswer] = useState(false)

  if (item.question) {
    // question
    const rating = getRating(item.id)
    const saved = isSaved(item.id)
    const bgColor = rating === 'hard' ? 'bg-red-50 border-red-200' : rating === 'medium' ? 'bg-amber-50 border-amber-200' : rating === 'easy' ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-blue-100'
    return (
      <div className={`rounded-xl p-4 shadow-sm border transition-all ${bgColor} relative`} style={{ marginLeft: depth * 20 }}>
        <button
          type="button"
          aria-label={saved ? 'Unsave flashcard' : 'Save flashcard'}
          onClick={(e) => {
            e.stopPropagation()
            toggleSaved(item.id)
          }}
          className={`absolute top-3 right-3 rounded-full border px-3 py-1 text-xs font-bold transition ${saved ? 'border-blue-200 bg-blue-50 text-blue-800' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}
        >
          {saved ? 'Saved' : 'Save'}
        </button>
        <button onClick={() => setShowAnswer(!showAnswer)} className="w-full text-left flex items-center gap-2 font-semibold text-blue-800 hover:text-blue-600">
          <span className="text-lg">{showAnswer ? '▼' : '▶'}</span>
          <span className="flex-1">{item.question}</span>
        </button>
        {showAnswer && (
          <div className="mt-4 space-y-3">
            <div className="rounded-lg bg-slate-100 p-3 text-slate-800 leading-relaxed border-l-4 border-blue-300">
              {typeof item.answer === 'string' ? item.answer : Array.isArray(item.answer) ? item.answer.join(', ') : JSON.stringify(item.answer)}
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button onClick={() => { onMark(item.id, 'hard') }} className="px-4 py-2 rounded-lg bg-red-200 text-red-800 font-medium text-sm hover:bg-red-300 transition">Hard</button>
              <button onClick={() => { onMark(item.id, 'medium') }} className="px-4 py-2 rounded-lg bg-amber-200 text-amber-800 font-medium text-sm hover:bg-amber-300 transition">Medium</button>
              <button onClick={() => { onMark(item.id, 'easy') }} className="px-4 py-2 rounded-lg bg-emerald-200 text-emerald-800 font-medium text-sm hover:bg-emerald-300 transition">Easy</button>
            </div>
            {item.children && item.children.length > 0 && (
              <div className="mt-4 pt-4 border-t border-blue-200">
                {item.children.map((child: any) => (
                  <TreeItem
                    key={child.id}
                    item={child}
                    depth={depth + 1}
                    onMark={onMark}
                    getRating={getRating}
                    isSaved={isSaved}
                    toggleSaved={toggleSaved}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    )
  } else {
    // category (non-question toggle)
    return (
      <div className="rounded-xl overflow-hidden border border-slate-200 shadow-sm transition-all" style={{ marginLeft: depth * 20 }}>
        <button onClick={() => setOpen(!open)} className="w-full flex items-center gap-2 px-4 py-3 bg-slate-50 hover:bg-slate-100 text-slate-800 font-semibold transition">
          <span className="text-lg">{open ? '◇' : '◆'}</span>
          <span className="flex-1 text-left">{item.title}</span>
        </button>
        {open && item.children && (
          <div className="p-3 space-y-3 bg-white">
            {item.children.map((child: any) => (
              <TreeItem
                key={child.id}
                item={child}
                depth={depth + 1}
                onMark={onMark}
                getRating={getRating}
                isSaved={isSaved}
                toggleSaved={toggleSaved}
              />
            ))}
          </div>
        )}
      </div>
    )
  }
}

export default function Learn(){
  const {
    user,
    content,
    addFlashcardResult,
    addPractice,
    getUnitCompletion,
    isFlashcardSaved,
    toggleFlashcardSaved,
  } = useApp()
  const unitKeys = useMemo(() => {
    const keys = Object.keys(content?.units || {})
    const num = (s: string) => {
      const m = s.match(/\d+/)
      return m ? Number(m[0]) : Number.POSITIVE_INFINITY
    }
    return keys.sort((a, b) => {
      const na = num(a)
      const nb = num(b)
      if (na !== nb) return na - nb
      return a.localeCompare(b)
    })
  }, [content])
  const [unit, setUnit] = useState(unitKeys[0] || '')
  const [savedOnly, setSavedOnly] = useState(false)
  const [ratings, setRatings] = useState<Record<string, Rating>>({})

  const ratingsKeyFor = useCallback((unitKey: string) => {
    const baseKey = `cora_ratings_${unitKey}`
    if (user?.email && user.name !== 'Learner') {
      const safe = user.email.replace(/[^a-zA-Z0-9_@.-]/g, '_')
      return `${baseKey}_${safe}`
    }
    return baseKey
  }, [user?.email, user?.name])

  // Ensure we have an initial unit when content loads
  useEffect(() => {
    if (!unit && unitKeys[0]) setUnit(unitKeys[0])
  }, [unit, unitKeys])

  // Load ratings for selected unit (per-user), with legacy fallback
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!unit) return
    const key = ratingsKeyFor(unit)
    const fallbackKey = `cora_ratings_${unit}`
    const raw = localStorage.getItem(key) ?? localStorage.getItem(fallbackKey) ?? '{}'
    try {
      setRatings(JSON.parse(raw))
    } catch {
      setRatings({})
    }
  }, [unit, ratingsKeyFor, user?.email, user?.name])

  const currentUnit = useMemo(() => content?.units[unit]?.[0], [unit, content])

  const mark = (id: string, rating: Rating) => {
    setRatings((previous) => {
      const next = { ...previous, [id]: rating }

      if (typeof window !== 'undefined') {
        const ratingsKey = ratingsKeyFor(unit)
        localStorage.setItem(ratingsKey, JSON.stringify(next))
      }

      return next
    })

    if (rating) {
      addFlashcardResult(rating)
      addPractice(5)
    }
  }

  const treeData = useMemo(() => {
    const children = currentUnit?.children || []
    if (!savedOnly) return children

    function filterNode(node: any): any | null {
      if (node?.question) {
        return isFlashcardSaved?.(node.id) ? node : null
      }
      if (node?.children && Array.isArray(node.children)) {
        const filteredChildren = node.children.map(filterNode).filter(Boolean)
        if (filteredChildren.length > 0) {
          return { ...node, children: filteredChildren }
        }
      }
      return null
    }

    return children.map(filterNode).filter(Boolean)
  }, [currentUnit, savedOnly, isFlashcardSaved])

  return (
    <ProtectedRoute>
      <ScreenContainer>
        <div className="space-y-4 mb-8">
          <h1 className="text-4xl font-bold text-blue-700">Learn</h1>
          <p className="text-gray-600 leading-relaxed max-w-2xl">
            Master brain anatomy and neuroscience through interactive flashcards. Select a unit on the left, then click on any question to reveal its answer. Use the diamond icons (◆/◇) to expand categories and explore related topics. Rate each answer as &quot;Hard&quot; if you need more practice, &quot;Medium&quot; if it was somewhat challenging, or &quot;Easy&quot; if you mastered it. Your progress is automatically tracked.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
          <aside className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Units</h2>
            {unitKeys.map((unitKey) => {
              const completion = getUnitCompletion(unitKey);
              const unitData = content.units[unitKey]?.[0];
              const isSelected = unit === unitKey;

              return (
                <button
                  key={unitKey}
                  onClick={() => setUnit(unitKey)}
                  className={`w-full text-left p-4 rounded-lg border transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`font-medium ${isSelected ? 'text-blue-800' : 'text-slate-800'}`}>
                      {unitData?.title || unitKey}
                    </span>
                    <span className={`text-sm font-semibold px-2 py-1 rounded ${
                      completion >= 80 ? 'bg-green-100 text-green-800' :
                      completion >= 50 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {completion}%
                    </span>
                  </div>
                </button>
              );
            })}
          </aside>

          <section className="space-y-4">
            <div className="flex items-center justify-end">
              <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={savedOnly}
                  onChange={(e) => setSavedOnly(e.target.checked)}
                />
                Saved only
              </label>
            </div>

            {treeData.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-white p-6 text-slate-600">
                No saved flashcards in this unit.
              </div>
            ) : (
              treeData.map((child: any) => (
                <TreeItem
                  key={child.id}
                  item={child}
                  depth={0}
                  onMark={mark}
                  getRating={(id) => ratings[id] ?? null}
                  isSaved={(id) => !!isFlashcardSaved?.(id)}
                  toggleSaved={(id) => toggleFlashcardSaved?.(id)}
                />
              ))
            )}
          </section>
        </div>
      </ScreenContainer>
    </ProtectedRoute>
  )
}
