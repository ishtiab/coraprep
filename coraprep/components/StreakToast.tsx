"use client"

import { useEffect } from 'react'
import { useApp } from '../context/AppContext'

export default function StreakToast(){
  const { streakToast, dismissStreakToast } = useApp()

  useEffect(() => {
    if (!streakToast?.open) return
    const t = setTimeout(() => dismissStreakToast?.(), 3500)
    return () => clearTimeout(t)
  }, [streakToast, dismissStreakToast])

  if (!streakToast?.open) return null

  return (
    <div className="fixed right-5 top-24 z-[9999] w-[360px] rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FFF5EB] text-[#D97706]">
          <span className="text-2xl" aria-hidden>🔥</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-bold text-slate-900">{streakToast.title}</div>
          <div className="mt-0.5 text-sm text-slate-600">{streakToast.message}</div>
          <div className="mt-2 text-3xl font-black tracking-tight text-slate-900">
            {streakToast.streak}
            <span className="ml-2 text-base font-semibold text-slate-600">day streak</span>
          </div>
        </div>
        <button
          onClick={() => dismissStreakToast?.()}
          className="rounded-lg px-2 py-1 text-slate-500 hover:bg-slate-100"
          aria-label="Close"
        >
          ✕
        </button>
      </div>
    </div>
  )
}
