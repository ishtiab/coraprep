import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import fs from 'fs'
import path from 'path'

// In production, use a real database.
// On Vercel, the code directory is read-only, so we use /tmp (ephemeral).
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

function saveUsers(users: any[]) {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2))
  } catch (err) {
    console.error('Error saving users:', err)
  }
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export async function POST(request: NextRequest) {
  try {
    const { name, email, dateOfBirth, password } = await request.json()

    // Validation
    if (!name || !email || !dateOfBirth || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
    }

    const users = loadUsers()

    // Check if user already exists
    if (users.some((u: any) => u.email === email)) {
      return NextResponse.json({ error: 'User already exists' }, { status: 409 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const user = {
      id: Date.now().toString(),
      name,
      email,
      dateOfBirth,
      password: hashedPassword,
      provider: 'email',
      createdAt: new Date().toISOString(),
    }

    users.push(user)
    saveUsers(users)

    // Create JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    // Return user data without password
    const { password: _, ...userWithoutPassword } = user
    return NextResponse.json({
      user: userWithoutPassword,
      token,
    })
  } catch (err) {
    console.error('Signup error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
