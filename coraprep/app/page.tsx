"use client"
import Link from 'next/link'
import ScreenContainer from '../components/ScreenContainer'
import { useApp } from '../context/AppContext'
import MascotCora from '../components/MascotCora'

const overviewItems = [
  { title: 'Practice', subtitle: 'Quick-start flashcards', href: '/learn', icon: '🧠' },
  { title: 'Vocab', subtitle: 'Browse the glossary', href: '/vocab', icon: '📚' },
  { title: 'Practice Exams', subtitle: 'Full-length tests', href: '/exams', icon: '📝' },
  { title: 'Brain Facts Book', subtitle: 'Digital reader', href: 'https://www.brainfacts.org/-/media/Brainfacts2/BrainFacts-Book/Brain-Facts-PDF-with-links.pdf', icon: '📖', external: true },
]

function LandingPage() {
  return (
    <ScreenContainer>
      <div className="mx-auto w-full max-w-[1050px] space-y-12">
        <section className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-8 items-start">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-4 py-2 text-sm font-semibold text-blue-800 shadow-sm">
              Brain Bee Coach • Study smarter
            </div>
            <h1 className="text-5xl sm:text-6xl font-black tracking-tight text-slate-900">
              Cora Prep
              <span className="block text-primary">Train for Brain Bee faster.</span>
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl">
              Flashcards, vocabulary, practice exams, and streak-based motivation — all in one place.
              Save the cards you care about and come back anytime.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/signup" className="btn text-center px-6 py-3">Create an account</Link>
              <Link href="/login" className="rounded-[16px] border border-slate-200 bg-white px-6 py-3 text-center font-semibold text-slate-800 hover:bg-slate-50">
                Log in
              </Link>
              <a href="#features" className="rounded-[16px] border border-blue-200 bg-[#F8FBFF] px-6 py-3 text-center font-semibold text-blue-800 hover:bg-blue-50">
                See features
              </a>
            </div>
          </div>

          <div className="rounded-3xl border border-blue-100 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <MascotCora size={80} variant="mascot" />
              <div>
                <div className="text-xl font-black text-slate-900">Welcome!</div>
                <div className="text-sm text-slate-600">Start free — your progress saves to your account.</div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-3">
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <div className="text-sm font-bold text-slate-900">What you get</div>
                <ul className="mt-2 space-y-1 text-sm text-slate-700">
                  <li>• Flashcards with color-coded difficulty</li>
                  <li>• Vocabulary with mastery/review tracking</li>
                  <li>• Streaks + XP to stay consistent</li>
                  <li>• Save/bookmark cards for later</li>
                </ul>
              </div>

              <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
                <div className="text-sm font-bold text-blue-900">Already have an account?</div>
                <p className="mt-1 text-sm text-blue-900/80">
                  Log in to pick up exactly where you left off.
                </p>
                <div className="mt-3">
                  <Link href="/login" className="inline-flex items-center justify-center rounded-[14px] bg-primary text-white px-4 py-2 font-semibold hover:opacity-95">
                    Log in
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="space-y-4">
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <h2 className="text-3xl font-black text-slate-900">Features</h2>
              <p className="text-slate-600 mt-1">Built to help you learn faster and stay consistent.</p>
            </div>
            <Link href="/signup" className="rounded-[14px] border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50">
              Get started
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-3xl border border-blue-100 bg-white p-5 shadow-sm">
              <div className="text-2xl">🧠</div>
              <div className="mt-2 text-lg font-extrabold text-slate-900">Flashcards</div>
              <p className="mt-1 text-slate-600">Rate cards Hard/Medium/Easy and watch your progress grow.</p>
            </div>
            <div className="rounded-3xl border border-blue-100 bg-white p-5 shadow-sm">
              <div className="text-2xl">📚</div>
              <div className="mt-2 text-lg font-extrabold text-slate-900">Vocabulary</div>
              <p className="mt-1 text-slate-600">Mark terms as Mastered or Needs review, and filter instantly.</p>
            </div>
            <div className="rounded-3xl border border-blue-100 bg-white p-5 shadow-sm">
              <div className="text-2xl">🔥</div>
              <div className="mt-2 text-lg font-extrabold text-slate-900">Streaks & XP</div>
              <p className="mt-1 text-slate-600">Daily momentum that keeps you studying even on busy days.</p>
            </div>
            <div className="rounded-3xl border border-blue-100 bg-white p-5 shadow-sm">
              <div className="text-2xl">💾</div>
              <div className="mt-2 text-lg font-extrabold text-slate-900">Saved cards</div>
              <p className="mt-1 text-slate-600">Save important vocab/flashcards and study only what you bookmarked.</p>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h3 className="text-2xl font-black text-slate-900">Ready to start?</h3>
              <p className="text-slate-600 mt-1">Create an account to save streaks, XP, and saved cards.</p>
            </div>
            <div className="flex gap-3">
              <Link href="/signup" className="btn px-6 py-3">Sign up</Link>
              <Link href="/login" className="rounded-[16px] border border-slate-200 bg-white px-6 py-3 font-semibold text-slate-800 hover:bg-slate-50">Log in</Link>
            </div>
          </div>
        </section>
      </div>
    </ScreenContainer>
  )
}

function LoggedInHome() {
  const { user, stats } = useApp()
  const consistency = stats?.consistency ?? [0,0,0,0,0,0,0]
  const maxConsistency = Math.max(...consistency, 1)
  const todayIndex = (new Date().getDay() + 6) % 7

  const mastery = stats?.mastery || 0
  const circumference = 2 * Math.PI * 36
  const progressStroke = circumference * (1 - mastery / 100)

  return (
    <ScreenContainer>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-6">
        <section className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <MascotCora size={70} variant="mascot" />
              <div>
                <h1 className="text-5xl font-black text-primary">Hi {user?.name ?? 'Learner'}!</h1>
                <p className="text-gray-600 mt-1">Welcome back to your brain training hub.</p>
              </div>
            </div>

            <div className="rounded-full border border-blue-100 bg-white px-4 py-2 shadow-sm text-sm font-semibold flex gap-4">
              <span>🔥 Streak: {stats?.streak || 0}</span>
              <span>⭐ XP: {stats?.xp || 0}</span>
            </div>
          </div>

          <section className="rounded-2xl border border-blue-100 bg-white p-4 shadow-sm">
            <label htmlFor="chat" className="text-sm text-slate-500">Cora AI Chat</label>
            <div className="mt-2 flex gap-2">
              <input id="chat" placeholder="Ask Cora about the Occipital Lobe..." className="flex-1 rounded-xl border border-[#C7DBFF] p-3 focus:outline-none focus:ring-2 focus:ring-blue-300" />
              <button className="btn px-4">Ask</button>
            </div>
          </section>

          <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {overviewItems.map((item: any) => (
              item.external ? (
                <a key={item.title} href={item.href} target="_blank" rel="noreferrer" className="rounded-2xl border border-blue-100 bg-white p-4 shadow-sm hover:shadow-md transition">
                  <div className="text-2xl">{item.icon}</div>
                  <h3 className="text-xl font-bold mt-2">{item.title}</h3>
                  <p className="text-gray-600 mt-1">{item.subtitle}</p>
                </a>
              ) : (
                <Link key={item.title} href={item.href} className="rounded-2xl border border-blue-100 bg-white p-4 shadow-sm hover:shadow-md transition">
                  <div className="text-2xl">{item.icon}</div>
                  <h3 className="text-xl font-bold mt-2">{item.title}</h3>
                  <p className="text-gray-600 mt-1">{item.subtitle}</p>
                </Link>
              )
            ))}
          </section>
        </section>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-blue-100 bg-white p-4 shadow-sm">
            <h2 className="font-bold text-primary">Mastery</h2>
            <div className="mt-4 flex items-center gap-4">
              <div className="relative w-20 h-20">
                <svg viewBox="0 0 100 100" className="w-20 h-20">
                  <circle cx="50" cy="50" r="36" stroke="#e0f2fe" strokeWidth="10" fill="none" />
                  <circle
                    cx="50"
                    cy="50"
                    r="36"
                    stroke="#0284c7"
                    strokeWidth="10"
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={progressStroke}
                    transform="rotate(-90 50 50)"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-xl font-bold text-blue-700">{mastery}%</div>
              </div>
              <p className="text-slate-500">Based on {stats?.flashcardsAttempted ?? 0} cards reviewed.</p>
            </div>
          </div>

          <div className="rounded-2xl border border-blue-100 bg-white p-4 shadow-sm">
            <h2 className="font-bold text-primary">Consistency (7 days)</h2>
            <div className="mt-4 flex items-end gap-2 h-32">
              <div className="flex flex-col items-end justify-between text-xs text-slate-500 h-full">
                <span>60m</span>
                <span>40m</span>
                <span>20m</span>
                <span>0m</span>
              </div>
              <div className="flex-1 grid grid-cols-7 gap-2 items-end h-full">
                {consistency.map((value: number, i: number) => {
                  const height = (value / maxConsistency) * 100
                  const isToday = i === todayIndex
                  return (
                    <div key={i} className="text-center">
                      <div className={`mx-auto w-7 rounded-t ${isToday ? 'bg-gradient-to-t from-blue-600 to-cyan-400' : 'bg-slate-300'}`} style={{ height: `${height}%` }} />
                      <span className="text-[10px] mt-1 block">{['Mo','Tu','We','Th','Fr','Sa','Su'][i]}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Leaderboard removed for now */}
        </aside>
      </div>
    </ScreenContainer>
  )
}

export default function Home(){
  const { user } = useApp()
  const isAuthenticated = !!(user && user.email)

  if (!isAuthenticated) return <LandingPage />
  return <LoggedInHome />
}
