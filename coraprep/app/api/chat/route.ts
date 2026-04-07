import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import fs from 'node:fs/promises'
import path from 'node:path'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const SYSTEM_PROMPT = `You are Cora AI, a friendly neuroscience tutor. Answer based on the provided context from BrainFacts Book. Be helpful and encouraging.`

type ChatRequestBody = { message?: string }

type RagChunk = {
  id: string
  text: string
  embedding: number[]
  norm?: number
}

type RagStore = {
  source?: string
  createdAt?: string
  model?: string
  chunks: RagChunk[]
}

let cachedStore: RagStore | null = null
let cachedChunksWithNorm: Array<RagChunk & { norm: number }> | null = null

function l2Norm(vec: number[]) {
  let sum = 0
  for (let i = 0; i < vec.length; i++) sum += vec[i] * vec[i]
  return Math.sqrt(sum)
}

function dot(a: number[], b: number[]) {
  const len = Math.min(a.length, b.length)
  let sum = 0
  for (let i = 0; i < len; i++) sum += a[i] * b[i]
  return sum
}

async function loadRagChunks(): Promise<Array<RagChunk & { norm: number }>> {
  if (cachedChunksWithNorm) return cachedChunksWithNorm
  if (!cachedStore) {
    const storePath = path.join(process.cwd(), 'data', 'brainfacts_rag.json')
    const raw = await fs.readFile(storePath, 'utf8')
    cachedStore = JSON.parse(raw) as RagStore
  }

  const chunks = Array.isArray(cachedStore.chunks) ? cachedStore.chunks : []
  cachedChunksWithNorm = chunks
    .filter((c): c is RagChunk => Boolean(c && typeof c.text === 'string' && Array.isArray(c.embedding)))
    .map((c) => ({ ...c, norm: typeof c.norm === 'number' ? c.norm : l2Norm(c.embedding) }))

  return cachedChunksWithNorm
}

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

  const OPENAI_API_KEY = process.env.OPENAI_API_KEY || ''
  if (!OPENAI_API_KEY) {
    return NextResponse.json(
      {
        error: 'OPENAI_API_KEY not configured. Add OPENAI_API_KEY to .env.local and restart the server.',
      },
      { status: 500 },
    )
  }

  try {
    // Embed the user message
    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: message,
    })
    const queryEmbedding = embeddingResponse.data[0].embedding

    // Load local RAG store (if present) and retrieve top chunks
    let context = ''
    try {
      const chunks = await loadRagChunks()
      const queryNorm = l2Norm(queryEmbedding)
      if (queryNorm > 0 && chunks.length > 0) {
        const scored = chunks
          .map((c) => ({ c, score: dot(queryEmbedding, c.embedding) / (queryNorm * c.norm || 1) }))
          .sort((a, b) => b.score - a.score)
          .slice(0, 3)
        context = scored.map((s) => s.c.text).join('\n\n')
      }
    } catch {
      // If the store is missing/unreadable, we fall back to no-context answers.
      context = ''
    }

    // Generate response with context
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: `${SYSTEM_PROMPT}${context ? `\n\nContext:\n${context}` : ''}` },
        { role: 'user', content: message },
      ],
      max_tokens: 300,
      temperature: 0.7,
    })

    const answer = completion.choices[0].message.content || 'No answer from model.'

    return NextResponse.json({ text: answer })
  } catch (error) {
    const anyErr = error as any
    const status: number | undefined =
      typeof anyErr?.status === 'number'
        ? anyErr.status
        : typeof anyErr?.response?.status === 'number'
          ? anyErr.response.status
          : undefined

    const details: string =
      typeof anyErr?.error?.message === 'string'
        ? anyErr.error.message
        : typeof anyErr?.message === 'string'
          ? anyErr.message
          : String(error)

    if (status === 401) {
      return NextResponse.json(
        { error: 'Invalid OpenAI API key', details },
        { status: 401 },
      )
    }

    if (status === 429) {
      return NextResponse.json(
        {
          error: 'OpenAI quota exceeded',
          details,
          hint: 'Check OpenAI Billing/Usage for your project, add a payment method or increase limits, then restart the dev server.',
        },
        { status: 429 },
      )
    }

    return NextResponse.json(
      { error: 'Chat failed', details },
      { status: status && status >= 400 ? status : 502 },
    )
  }
}
