"use client"
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import ScreenContainer from '../../components/ScreenContainer'
import { useApp } from '../../context/AppContext'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const { user } = useApp()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const [devLink, setDevLink] = useState<string | null>(null)

  useEffect(() => {
    if (user?.email) router.push('/')
  }, [user, router])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setDevLink(null)
    setLoading(true)

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json().catch(() => null)

      setDone(true)
      if (data?.devResetUrl) setDevLink(String(data.devResetUrl))
      if (!res.ok) {
        setError(data?.error || `Request failed (${res.status})`)
      }
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
          <h1 className="text-2xl font-extrabold text-slate-900">Reset your password</h1>
          <p className="mt-2 text-slate-600">
            Enter your email and we&apos;ll send a reset link if an account exists.
          </p>

          {error ? (
            <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-rose-800">
              {error}
            </div>
          ) : null}

          {done ? (
            <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-800">
              If an account exists for that email, a password reset link was sent.
              {devLink ? (
                <div className="mt-3 text-sm">
                  <div className="font-semibold">Dev link:</div>
                  <a className="underline break-all" href={devLink}>
                    {devLink}
                  </a>
                </div>
              ) : null}
            </div>
          ) : (
            <form onSubmit={submit} className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-2 rounded-lg hover:shadow-lg transition disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send reset link'}
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
