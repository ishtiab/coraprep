import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

type ChatRequestBody = { message?: string }

export async function POST(request: NextRequest){
  let body: ChatRequestBody
  try {
    body = (await request.json()) as ChatRequestBody
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const message = (body?.message || '').trim()
  if (!message) {
    return NextResponse.json({ error: 'Message required' }, { status: 400 })
  }

  return NextResponse.json({
    text: "Cora AI is temporarily disabled right now. The rest of Cora Prep works normally — you can keep studying vocab, flashcards, and exams.",
  })
}
