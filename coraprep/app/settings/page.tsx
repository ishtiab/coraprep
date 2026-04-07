"use client"
import { useApp } from '../../context/AppContext'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import ScreenContainer from '../../components/ScreenContainer'
import GradientButton from '../../components/GradientButton'

export default function Settings(){
  const router = useRouter()
  const { user, logout, settings, updateSettings } = useApp()
  const [dailyGoal, setDailyGoal] = useState(settings.dailyGoal)
  const [spacedRepetition, setSpacedRepetition] = useState(settings.spacedRepetition)
  const [darkMode, setDarkMode] = useState(false)
  const [accent, setAccent] = useState('#1E63B5')
  const [reminderTime, setReminderTime] = useState('19:00')

  return (
    <ScreenContainer>
      <div className="card space-y-6">
        <h1 className="text-4xl font-black text-primary">Settings</h1>

        <section className="rounded-2xl border p-5 bg-white">
          <h2 className="text-xl font-bold text-blue-700">Account</h2>
          <p className="text-gray-600 mt-2">Signed in as <strong>{user?.name ?? 'Guest'}</strong></p>
          <input className="mt-3 w-full rounded-xl border p-3" placeholder="Email (update)" type="email" />
          <input className="mt-3 w-full rounded-xl border p-3" placeholder="New password" type="password" />
          <div className="mt-3 flex gap-2">
            <button className="btn" onClick={() => { logout(); router.push('/') }}>Log Out</button>
            <GradientButton onClick={()=>alert('Account settings saved')}>Save</GradientButton>
          </div>
        </section>

        <section className="rounded-2xl border p-5 bg-white">
          <h2 className="text-xl font-bold text-blue-700">Study Preferences</h2>
          <label className="flex justify-between mt-3"><span>Daily Goal: {dailyGoal} min</span><span></span></label>
          <input type="range" min={10} max={180} value={dailyGoal} onChange={e=>setDailyGoal(Number(e.target.value))} className="w-full mt-2" />
          <label className="flex items-center gap-3 mt-3"><input type="checkbox" checked={spacedRepetition} onChange={e=>setSpacedRepetition(e.target.checked)} /> Spaced Repetition</label>
        </section>

        <section className="rounded-2xl border p-5 bg-white">
          <h2 className="text-xl font-bold text-blue-700">Appearance</h2>
          <label className="flex items-center gap-3 mt-3"><input type="checkbox" checked={darkMode} onChange={e=>setDarkMode(e.target.checked)} /> Dark Mode</label>
          <div className="mt-3 flex gap-2 items-center">
            <span>Accent Color:</span>
            <input type="color" value={accent} onChange={e=>setAccent(e.target.value)} />
          </div>
        </section>

        <section className="rounded-2xl border p-5 bg-white">
          <h2 className="text-xl font-bold text-blue-700">Notifications</h2>
          <div className="mt-3 flex items-center gap-3">
            <span>Daily Reminder:</span>
            <input type="time" value={reminderTime} onChange={e=>setReminderTime(e.target.value)} className="rounded-xl border p-2" />
          </div>
        </section>

        <GradientButton onClick={()=>updateSettings({ dailyGoal, spacedRepetition })}>Save All Preferences</GradientButton>
      </div>
    </ScreenContainer>
  )
}
