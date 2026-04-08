import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import fs from 'fs'
import path from 'path'

export const runtime = 'nodejs'

const USERS_FILE = process.env.VERCEL
  ? path.join('/tmp', 'users.json')
  : path.join(process.cwd(), 'users.json')

function loadUsers() {
  try {
    if (fs.existsSync(USERS_FILE)) {
      const data = fs.readFileSync(USERS_FILE, 'utf-8')
      return JSON.parse(data)
    }
  } catch (err) {
    console.error('Error loading users:', err)
  }
  return []
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

function getBaseUrl(request: NextRequest) {
  const explicit = process.env.NEXT_PUBLIC_APP_URL
  if (explicit) return explicit.replace(/\/$/, '')

  const proto = request.headers.get('x-forwarded-proto') || 'http'
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || 'localhost:3000'
  return `${proto}://${host}`
}

async function sendResetEmail(opts: { to: string; resetUrl: string }) {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.RESEND_FROM || 'Cora Prep <onboarding@resend.dev>'

  if (!apiKey) {
    return { ok: false as const, error: 'RESEND_API_KEY not configured' }
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: opts.to,
      subject: 'Reset your Cora Prep password',
      html: `
        <div style="font-family: ui-sans-serif, system-ui;">
          <h2>Reset your password</h2>
          <p>Click the link below to set a new password. This link expires in 30 minutes.</p>
          <p><a href="${opts.resetUrl}">${opts.resetUrl}</a></p>
          <p>If you didn\'t request this, you can ignore this email.</p>
        </div>
      `,
    }),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    return { ok: false as const, error: `Resend error (${res.status}): ${text}` }
  }

  return { ok: true as const }
}

export async function POST(request: NextRequest) {
  let email = ''
  try {
    const body = await request.json()
    email = String(body?.email || '').trim().toLowerCase()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  if (!email) {
    return NextResponse.json({ error: 'Email required' }, { status: 400 })
  }

  // Do NOT reveal whether the user exists.
  const users = loadUsers()
  const user = users.find((u: any) => String(u?.email || '').toLowerCase() === email)

  if (user) {
    const token = jwt.sign({ email, type: 'password_reset' }, JWT_SECRET, { expiresIn: '30m' })
    const resetUrl = `${getBaseUrl(request)}/reset-password?token=${encodeURIComponent(token)}`

    const sent = await sendResetEmail({ to: email, resetUrl })

    // In local dev, allow testing even without email configuration.
    if (!sent.ok && process.env.NODE_ENV !== 'production') {
      return NextResponse.json({
        ok: true,
        message: 'If an account exists for that email, a reset link was sent.',
        devResetUrl: resetUrl,
      })
    }
  }

  return NextResponse.json({ ok: true, message: 'If an account exists for that email, a reset link was sent.' })
}
