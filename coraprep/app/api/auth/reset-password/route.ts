import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import fs from 'fs'
import path from 'path'

export const runtime = 'nodejs'

const USERS_FILE = path.join(process.cwd(), 'users.json')

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

function saveUsers(users: any[]) {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2))
  } catch (err) {
    console.error('Error saving users:', err)
  }
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export async function POST(request: NextRequest) {
  let token = ''
  let password = ''

  try {
    const body = await request.json()
    token = String(body?.token || '').trim()
    password = String(body?.password || '')
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  if (!token) {
    return NextResponse.json({ error: 'Missing token' }, { status: 400 })
  }

  if (!password || password.length < 6) {
    return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
  }

  let payload: any
  try {
    payload = jwt.verify(token, JWT_SECRET)
  } catch {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 })
  }

  if (payload?.type !== 'password_reset' || !payload?.email) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 400 })
  }

  const email = String(payload.email).toLowerCase()

  const users = loadUsers()
  const idx = users.findIndex((u: any) => String(u?.email || '').toLowerCase() === email)
  if (idx === -1) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const hashedPassword = await bcrypt.hash(password, 10)
  users[idx] = { ...users[idx], password: hashedPassword }
  saveUsers(users)

  return NextResponse.json({ ok: true })
}
