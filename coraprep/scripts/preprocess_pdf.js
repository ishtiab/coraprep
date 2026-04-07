import fs from 'fs'
import path from 'path'
import { createRequire } from 'module'
import OpenAI from 'openai'

const require = createRequire(import.meta.url)
const pdf = require('pdf-parse')

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const PDF_URL = 'https://www.brainfacts.org/-/media/Brainfacts2/BrainFacts-Book/Brain-Facts-Book-2018-high-res.pdf'
const OUTPUT_PATH = path.join(process.cwd(), 'data', 'brainfacts_rag.json')

async function downloadPDF(url, dest) {
  const response = await fetch(url)
  const buffer = await response.arrayBuffer()
  fs.writeFileSync(dest, Buffer.from(buffer))
}

async function extractText(pdfPath) {
  const dataBuffer = fs.readFileSync(pdfPath)
  const data = await pdf(dataBuffer)
  return data.text
}

function chunkText(text, chunkSize = 1000) {
  const chunks = []
  for (let i = 0; i < text.length; i += chunkSize) {
    chunks.push(text.slice(i, i + chunkSize))
  }
  return chunks
}

async function embedText(texts) {
  const embeddings = []
  for (const text of texts) {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
    })
    embeddings.push(response.data[0].embedding)
  }
  return embeddings
}

function l2Norm(vec) {
  let sum = 0
  for (let i = 0; i < vec.length; i++) sum += vec[i] * vec[i]
  return Math.sqrt(sum)
}

async function main() {
  const pdfPath = path.join(process.cwd(), 'brainfacts.pdf')
  console.log('Downloading PDF...')
  await downloadPDF(PDF_URL, pdfPath)

  console.log('Extracting text...')
  const text = await extractText(pdfPath)

  console.log('Chunking text...')
  const chunks = chunkText(text)

  console.log('Embedding chunks...')
  const embeddings = await embedText(chunks)

  console.log('Writing local RAG store...')
  const store = {
    source: 'Brain Facts Book (2018)',
    createdAt: new Date().toISOString(),
    model: 'text-embedding-3-small',
    chunkSize: 1000,
    chunks: chunks.map((chunk, i) => {
      const embedding = embeddings[i]
      return {
        id: `chunk_${i}`,
        text: chunk,
        embedding,
        norm: l2Norm(embedding),
      }
    }),
  }

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true })
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(store))

  console.log('Done!')
}

main().catch(console.error)



