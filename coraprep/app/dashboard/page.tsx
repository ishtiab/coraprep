"use client"
import Link from 'next/link'
import { useApp } from '../../context/AppContext'
import ScreenContainer from '../../components/ScreenContainer'
import CardButton from '../../components/CardButton'
import ProgressCard from '../../components/ProgressCard'
import StatsCard from '../../components/StatsCard'

export default function Dashboard(){
  const { user, stats } = useApp()

  return (
    <ScreenContainer>
      <div className="flex justify-between items-center">
        <h1 className="text-3xl main-heading">Cora Prep</h1>
        <div className="text-sm font-semibold text-blue-700">{user?.name ?? 'Guest'}</div>
      </div>

      <div className="card space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-blue-800">Today&apos;s Training</h2>
            <p className="text-gray-600">Keep your streak alive!</p>
          </div>
          <div className="text-sm text-blue-700 font-semibold">🔥 {stats.streak}</div>
        </div>

        <ProgressCard title="Flashcards" progress={stats.flashcardsReviewed} total={100} />

        <div className="space-y-3">
          <Link href="/learn"><CardButton title="Start Flashcards" icon="🧠" /></Link>
          <Link href="/exams"><CardButton title="Take Practice Exam" icon="📄" /></Link>
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-blue-800">Performance</h3>
        <StatsCard accuracy={stats.accuracy} avgTime={stats.avgTime} mastery={stats.mastery} />
      </div>
    </ScreenContainer>
  )
}
