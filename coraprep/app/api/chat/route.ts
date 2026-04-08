import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

const SYSTEM_PROMPT = `You are Cora AI, a friendly neuroscience tutor. Be helpful and encouraging. If you are unsure, say so.`

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

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      {
        error: 'GEMINI_API_KEY not configured',
        hint: 'Add GEMINI_API_KEY in your environment variables (Vercel Project → Settings → Environment Variables).',
      },
      { status: 500 },
    )
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(apiKey)}`

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: `${SYSTEM_PROMPT}\n\nUser question: ${message}` }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 300,
        },
      }),
    })

    const data: any = await res.json().catch(() => null)
    if (!res.ok) {
      return NextResponse.json(
        {
          error: 'Gemini request failed',
          details: data ? JSON.stringify(data) : `HTTP ${res.status}`,
        },
        { status: 502 },
      )
    }

    const text =
      data?.candidates?.[0]?.content?.parts?.map((p: any) => p?.text).filter(Boolean).join('') ||
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      ''

    return NextResponse.json({ text: text || 'No answer from model.' })
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Chat failed', details: String(err?.message || err) },
      { status: 502 },
    )
  }
}
