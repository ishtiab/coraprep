"use client"
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import ScreenContainer from '../../components/ScreenContainer'
import { useApp } from '../../context/AppContext'

export default function ResetPasswordPage() {
  const router = useRouter()
  const params = useSearchParams()
  const { user } = useApp()

  const token = params.get('token') || ''

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (user?.email) router.push('/')
  }, [user, router])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!token) {
      setError('Missing reset token. Please use the link from your email.')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      const data = await res.json().catch(() => null)

      if (!res.ok) {
        setError(data?.error || `Request failed (${res.status})`)
        return
      }

      setDone(true)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScreenContainer>
      <div className="max-w-lg mx-auto">
        <div className="card">
          <h1 className="text-2xl font-extrabold text-slate-900">Choose a new password</h1>
          <p className="mt-2 text-slate-600">Set a new password for your account.</p>

          {error ? (
            <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-rose-800">
              {error}
            </div>
          ) : null}

          {done ? (
            <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-800">
              Password updated. You can now log in.
              <div className="mt-3">
                <Link className="font-semibold text-blue-600 hover:text-blue-700" href="/login">
                  Go to login
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={submit} className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">New password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <p className="text-xs text-slate-500 mt-1">At least 6 characters</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Confirm password</label>
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-2 rounded-lg hover:shadow-lg transition disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Update password'}
              </button>
            </form>
          )}

          <div className="mt-6 text-sm text-slate-600">
            <Link className="font-semibold text-blue-600 hover:text-blue-700" href="/login">
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </ScreenContainer>
  )
}
