"use client"
import React, { useEffect, useMemo, useState } from 'react'
import MascotCora from './MascotCora'

type Message = { id: number; role: 'user' | 'assistant' | 'system'; text: string }

export default function CoraChatbot(){
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)

  const storageKey = useMemo(()=> 'cora_ai_chat_history', [])

  useEffect(()=>{
    const saved = localStorage.getItem(storageKey)
    if(saved){
      try { setMessages(JSON.parse(saved)) } catch (e) { setMessages([]) }
    } else {
      setMessages([
        { id: 1, role: 'system', text: 'Cora AI is temporarily disabled. You can still use all study features.' }
      ])
    }
  },[storageKey])

  useEffect(()=>{
    if(messages.length > 0){
      localStorage.setItem(storageKey, JSON.stringify(messages))
    }
  },[messages, storageKey])

  const toggle = () => setIsOpen(v => !v)

  async function send(){
    if(!input.trim()) return
    const userMessage: Message = { id: Date.now(), role: 'user', text: input.trim() }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage.text }),
      })

      let data: any = null
      try {
        data = await response.json()
      } catch {
        data = null
      }

      if (!response.ok) {
        const main = data?.error || `Request failed (${response.status})`
        const extra = data?.details ? `\n\nDetails: ${data.details}` : ''
        const hint = data?.hint ? `\n\nFix: ${data.hint}` : ''
        setMessages(prev => [...prev, { id: Date.now() + 1, role: 'assistant', text: `${main}${extra}${hint}` }])
        return
      }

      const aiText = data?.text || 'Sorry, Cora AI could not generate a response right now.'
      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'assistant', text: aiText }])

    } catch (err) {
      setMessages(prev => [...prev, { id: Date.now() + 2, role: 'assistant', text: 'Connection issue. Please check your network.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="cora-chatbot-container">
      <button aria-label="Open Cora Chatbot" className="cora-chatbot-button" onClick={toggle}>
        <MascotCora size={50} />
        <span className="cora-chatbot-badge">Cora AI</span>
      </button>

      {isOpen && (
        <div className="cora-chatbot-panel shadow-xl">
          <div className="cora-chatbot-header">
            <strong>Cora AI Tutor</strong>
            <button onClick={toggle} className="text-sm">✕</button>
          </div>
          <div className="cora-chatbot-body">
            {messages.map((m)=> (
              <div key={m.id} className={`cora-chatbot-message ${m.role}`}>
                <span>{m.text}</span>
              </div>
            ))}
          </div>
          <div className="cora-chatbot-footer">
            <input
              value={input}
              onChange={(e)=>setInput(e.target.value)}
              onKeyDown={(e)=>{ if(e.key==='Enter') send() }}
              placeholder="Ask Cora about neuroscience..."
              aria-label="Type your question"
            />
            <button onClick={send} disabled={loading || !input.trim()}>{loading ? 'Thinking...' : 'Send'}</button>
          </div>
          <p className="cora-chatbot-note">Cora AI is temporarily disabled.</p>
        </div>
      )}
    </div>
  )
}
