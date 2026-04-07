import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET() {
  try {
    const filePath = path.resolve(process.cwd(), 'app', 'content-files', 'Vocabulary.json')
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'Vocabulary.json not found' }, { status: 404 })
    }

    const raw = fs.readFileSync(filePath, 'utf8')
    const data = JSON.parse(raw)
    return NextResponse.json(data)
  } catch (error) {
    console.error('API Error (vocab):', error)
    return NextResponse.json({ error: 'Failed to load vocabulary' }, { status: 500 })
  }
}
