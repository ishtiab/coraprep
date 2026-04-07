"use client"
import { useMemo, useState } from 'react'
import ScreenContainer from '../../components/ScreenContainer'
import VocabDetailModal from '../../components/VocabDetailModal'
import { useApp } from '../../context/AppContext'

export default function Vocab(){
  const { content, isVocabSaved, toggleVocabSaved } = useApp()
  const vocab = useMemo(() => content?.vocab || [], [content])
  const [query,setQuery] = useState('')
  const [statusFilter,setStatusFilter] = useState<'all'|'unmarked'|'review'|'mastered'>('all')
  const [categoryFilter,setCategoryFilter] = useState<string>('all')
  const [savedOnly, setSavedOnly] = useState(false)
  const [selectedVocabId, setSelectedVocabId] = useState<string | null>(null)

  const categories = useMemo<string[]>(() => {
    const set = new Set<string>()
    for (const v of vocab) {
      if (v?.category) set.add(String(v.category))
    }
    return ['all', ...Array.from(set).sort()]
  }, [vocab])

  const items = vocab
    .filter((v:any) => String(v?.term || '').toLowerCase().includes(query.toLowerCase()))
    .filter((v:any) => {
      if (statusFilter === 'all') return true
      const status = (v?.level || 'unmarked')
      return status === statusFilter
    })
    .filter((v:any) => categoryFilter === 'all' || String(v?.category || '') === categoryFilter)
    .filter((v:any) => !savedOnly || !!isVocabSaved?.(v?.id))

  const grouped = useMemo(() => {
    const sorted = [...items].sort((a: any, b: any) => String(a?.term || '').localeCompare(String(b?.term || ''), undefined, { sensitivity: 'base' }))
    const groups: { letter: string; items: any[] }[] = []
    const map = new Map<string, any[]>()

    for (const item of sorted) {
      const firstChar = String(item?.term || '').trim().charAt(0).toUpperCase()
      const letter = /^[A-Z]$/.test(firstChar) ? firstChar : '#'
      const arr = map.get(letter) || []
      arr.push(item)
      map.set(letter, arr)
    }

    const letters = Array.from(map.keys()).sort((a, b) => {
      if (a === '#') return -1
      if (b === '#') return 1
      return a.localeCompare(b)
    })

    for (const letter of letters) {
      groups.push({ letter, items: map.get(letter) || [] })
    }

    return groups
  }, [items])

  const alphaRail = useMemo(() => {
    const present = new Set(grouped.map((g) => g.letter))
    const letters = ['#', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')]
    return { letters, present }
  }, [grouped])

  function scrollToLetter(letter: string) {
    const el = document.getElementById(`vocab-letter-${letter}`)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function clearFilters() {
    setQuery('')
    setStatusFilter('all')
    setCategoryFilter('all')
    setSavedOnly(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <ScreenContainer>
      <div className="mx-auto w-full max-w-[980px] space-y-6">
        <div className="card">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="space-y-2">
              <h1 className="text-4xl font-black text-primary tracking-tight">Vocabulary</h1>
              <p className="text-sm text-slate-600">Search and mark terms for review or mastery.</p>
            </div>

            <button
              type="button"
              onClick={clearFilters}
              className="self-start md:self-auto rounded-[14px] border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Clear filters
            </button>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-12">
            <div className="md:col-span-6">
              <label className="text-xs font-semibold text-slate-600">Search</label>
              <input
                placeholder="Search terms..."
                value={query}
                onChange={e=>setQuery(e.target.value)}
                className="mt-2 w-full rounded-[16px] border border-blue-200 bg-[#F8FBFF] px-4 py-3 text-base"
              />
            </div>

            <div className="md:col-span-4">
              <label className="text-xs font-semibold text-slate-600">Category</label>
              <select
                value={categoryFilter}
                onChange={(e)=>setCategoryFilter(e.target.value)}
                className="mt-2 w-full rounded-[16px] border border-blue-200 bg-[#F8FBFF] px-3 py-3 text-sm"
              >
                {categories.map((cat:string)=> {
                  const label = cat === 'all' ? 'All categories' : String(cat).replace(/_/g, ' ')
                  return <option key={cat} value={cat}>{label}</option>
                })}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-slate-600">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="mt-2 w-full rounded-[16px] border border-blue-200 bg-[#F8FBFF] px-3 py-3 text-sm"
              >
                <option value="all">All statuses</option>
                <option value="review">Needs review</option>
                <option value="mastered">Mastered</option>
                <option value="unmarked">Unmarked</option>
              </select>
            </div>

            <div className="md:col-span-12">
              <label className="mt-1 inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={savedOnly}
                  onChange={(e) => setSavedOnly(e.target.checked)}
                />
                Saved only
              </label>
            </div>
          </div>
        </div>

        <div className="relative md:pr-10">
          <div className="space-y-6">
            {grouped.length === 0 ? (
              <div className="card text-center text-slate-500 py-10">No terms match your filters.</div>
            ) : (
              grouped.map((group) => (
                <section key={group.letter} className="space-y-3">
                  <div id={`vocab-letter-${group.letter}`} className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-white border border-slate-200 flex items-center justify-center font-extrabold text-slate-700">
                      {group.letter}
                    </div>
                    <div className="h-px flex-1 bg-slate-200" />
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {group.items.map((item: any) => {
                      const status = item?.level || 'unmarked'
                      const cardStatusClass = status === 'review' ? 'vocab-card--review' : status === 'mastered' ? 'vocab-card--mastered' : ''
                      const termColor = status === 'review' ? 'text-rose-800' : status === 'mastered' ? 'text-emerald-800' : 'text-blue-800'
                      const badge = status === 'review' ? 'Needs review' : status === 'mastered' ? 'Mastered' : null
                      const badgeClass = status === 'review' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                      const categoryLabel = String(item.category || '').replace(/_/g, ' ')

                      const saved = !!isVocabSaved?.(item.id)

                      return (
                        <div
                          key={item.id}
                          role="button"
                          tabIndex={0}
                          onClick={() => setSelectedVocabId(item.id)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') setSelectedVocabId(item.id)
                          }}
                          className={`vocab-card hover-lift ${cardStatusClass} w-full text-left relative pr-12 cursor-pointer`}
                        >
                          <button
                            type="button"
                            aria-label={saved ? 'Unsave term' : 'Save term'}
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleVocabSaved?.(item.id)
                            }}
                            className={`absolute top-3 right-3 rounded-full border px-3 py-1 text-xs font-bold transition ${saved ? 'border-blue-200 bg-blue-50 text-blue-800' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}
                          >
                            {saved ? 'Saved' : 'Save'}
                          </button>
                          <div className="min-w-0">
                            <h3 className={`text-base font-extrabold ${termColor} truncate`}>{item.term}</h3>
                            <p className="text-slate-600 text-sm line-clamp-2">{item.short || item.definition || ''}</p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {badge ? (
                              <span className={`text-xs px-2 py-1 rounded font-semibold ${badgeClass}`}>{badge}</span>
                            ) : null}
                            {categoryLabel ? (
                              <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-600">{categoryLabel}</span>
                            ) : null}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </section>
              ))
            )}
          </div>

          <aside className="hidden md:flex flex-col items-center gap-1 absolute right-0 top-0">
            <div className="sticky top-28 rounded-full border border-slate-200 bg-white/80 backdrop-blur px-2 py-2 shadow-sm">
              <div className="flex flex-col items-center gap-1">
                {alphaRail.letters.map((letter) => {
                  const enabled = alphaRail.present.has(letter)
                  return (
                    <button
                      key={letter}
                      type="button"
                      onClick={() => enabled && scrollToLetter(letter)}
                      className={`w-6 h-6 rounded text-[11px] font-bold transition ${enabled ? 'text-slate-700 hover:bg-slate-100' : 'text-slate-300 cursor-default'}`}
                      aria-disabled={!enabled}
                    >
                      {letter}
                    </button>
                  )
                })}
              </div>
            </div>
          </aside>
        </div>

        <VocabDetailModal vocabId={selectedVocabId} onClose={() => setSelectedVocabId(null)} />
      </div>
    </ScreenContainer>
  )
}
