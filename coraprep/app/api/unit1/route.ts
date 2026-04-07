import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET() {
  try {
    const units = {}
    const unitFiles = ['Unit1.json', 'Unit2.json', 'Unit3.json', 'Unit4.json']

    for (const file of unitFiles) {
      try {
        const filePath = path.resolve(process.cwd(), 'app', 'content-files', file)
        console.log('Loading file:', filePath, 'exists:', fs.existsSync(filePath))
        if (fs.existsSync(filePath)) {
          const fileContents = fs.readFileSync(filePath, 'utf8')
          const data = JSON.parse(fileContents)
          Object.assign(units, data)
        }
      } catch (error) {
        console.warn(`Could not load ${file}:`, error)
      }
    }

    console.log('Loaded units:', Object.keys(units))
    return NextResponse.json(units)
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Files not found' }, { status: 404 })
  }
}