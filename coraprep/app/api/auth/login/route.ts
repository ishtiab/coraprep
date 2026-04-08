import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import fs from 'fs'
import path from 'path'

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

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Validation
    if (!email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const users = loadUsers()

    // Find user
    const user = users.find((u: any) => u.email === email)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 })
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
    }

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
    console.error('Login error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
