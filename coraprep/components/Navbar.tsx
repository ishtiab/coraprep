"use client"
import Link from 'next/link'
import Image from 'next/image'
import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useApp } from '../context/AppContext'

function BellIcon(){
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" aria-hidden>
      <path
        d="M12 22a2.5 2.5 0 0 0 2.45-2H9.55A2.5 2.5 0 0 0 12 22Z"
        fill="currentColor"
      />
      <path
        d="M18 16v-5a6 6 0 1 0-12 0v5l-2 2v1h16v-1l-2-2Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function Navbar(){
  const router = useRouter()
  const { stats, user, logout, notifications, markAllNotificationsRead, markNotificationRead } = useApp()
  const [menuOpen,setMenuOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)

  const isAuthenticated = !!(user && user.email)

  const unreadCount = useMemo(
    () => (notifications || []).filter((n: any) => !n.read).length,
    [notifications]
  )

  return (
    <header className="w-full bg-white border-b shadow-sm fixed top-0 left-0 right-0 z-50">
      <div className="max-w-full mx-auto flex items-center justify-between px-6 py-3">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/logo.png" alt="Cora Prep Logo" width={44} height={44} className="rounded-full" />
          <div>
            <div className="text-xl font-black text-primary">Cora Prep</div>
            <div className="text-xs text-slate-500">Brain Bee Coach</div>
          </div>
        </Link>

        <nav className="hidden sm:flex items-center gap-5 text-sm font-semibold">
          {isAuthenticated ? (
            <>
              <Link href="/learn" className="text-blue-700 hover:text-primary">Practice</Link>
              <Link href="/vocab" className="text-blue-700 hover:text-primary">Vocab</Link>
              <Link href="/exams" className="text-blue-700 hover:text-primary">Exams</Link>
              <a href="https://www.brainfacts.org/-/media/Brainfacts2/BrainFacts-Book/Brain-Facts-Book-2018-high-res.pdf" target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:text-primary">Brain Facts Book</a>

              <div className="flex items-center gap-2 bg-[#FFF5EB] text-[#D97706] px-3 py-1 rounded-full font-semibold">
                🔥 {stats?.streak || 0} | ⭐ XP {stats?.xp || 0}
              </div>

              <div className="relative">
                <button
                  onClick={() => setNotifOpen(v => !v)}
                  aria-label="Notifications"
                  className="relative flex items-center justify-center border border-slate-200 rounded-full w-10 h-10 bg-white hover:shadow-sm text-slate-700"
                >
                  <BellIcon />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>
                {notifOpen && (
                  <div className="absolute right-0 mt-2 w-80 rounded-2xl border bg-white shadow-lg text-sm overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b bg-slate-50">
                      <span className="font-bold text-slate-800">Notifications</span>
                      <button
                        className="text-xs font-semibold text-blue-700 hover:text-primary"
                        onClick={() => markAllNotificationsRead?.()}
                      >
                        Mark all read
                      </button>
                    </div>
                    <div className="max-h-80 overflow-auto">
                      {(notifications || []).length === 0 ? (
                        <div className="px-4 py-6 text-slate-500">No notifications yet.</div>
                      ) : (
                        (notifications || []).map((n: any) => (
                          <button
                            key={n.id}
                            onClick={() => markNotificationRead?.(n.id)}
                            className="w-full text-left px-4 py-3 border-b hover:bg-slate-50"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="font-semibold text-slate-800">{n.title}</div>
                              {!n.read && <span className="w-2 h-2 rounded-full bg-blue-600" />}
                            </div>
                            <div className="text-slate-600 mt-1 whitespace-pre-line">{n.message}</div>
                            <div className="text-[11px] text-slate-400 mt-1">{new Date(n.createdAt).toLocaleString()}</div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="relative">
                <button onClick={() => setMenuOpen(!menuOpen)} className="flex items-center gap-2 border border-slate-200 rounded-full px-3 py-1 bg-white hover:shadow-sm">
                  <span className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center">{user?.name?.[0] ?? 'U'}</span>
                  {user?.name ?? 'Guest'}
                </button>
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-36 rounded-lg border bg-white shadow-lg text-sm">
                    <Link href="/settings" className="block px-4 py-2 hover:bg-slate-100">Account</Link>
                    <button
                      onClick={() => {
                        logout()
                        setMenuOpen(false)
                        setNotifOpen(false)
                        router.push('/')
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-slate-100"
                    >
                      Log Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link href="/login" className="text-blue-700 hover:text-primary">Log in</Link>
              <Link href="/signup" className="btn">Sign up</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
