'use client'
import { useState, useRef, useEffect } from 'react'
import { Sparkles, Send, X, Bot, User, Loader2, Lightbulb } from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

const SUGGESTED_PROMPTS = [
  'How can I improve student attendance?',
  'Tips to reduce pending fee collections',
  'Best way to plan the exam timetable',
  'How to increase parent engagement via notices',
]

async function askAssistant(message: string, history: Message[]): Promise<string> {
  const res = await fetch('/api/ai-assistant', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      history: history.map(h => ({ role: h.role, content: h.content })),
    }),
  })
  if (!res.ok) {
    throw new Error('Assistant request failed')
  }
  const data = await res.json()
  return data.reply as string
}

export default function AIAssistant() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, loading])

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  const send = async (text?: string) => {
    const content = (text ?? input).trim()
    if (!content || loading) return

    const userMsg: Message = { id: crypto.randomUUID(), role: 'user', content }
    const nextMessages = [...messages, userMsg]
    setMessages(nextMessages)
    setInput('')
    setError(null)
    setLoading(true)

    try {
      const reply = await askAssistant(content, nextMessages)
      setMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'assistant', content: reply }])
    } catch (err) {
      setError('Could not reach the assistant. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <>
      {/* Launcher button */}
      {!open && (
        <button
          className="ai-launcher"
          onClick={() => setOpen(true)}
          aria-label="Open AI Assistant"
        >
          <Sparkles size={20} />
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div className="ai-panel" role="dialog" aria-label="AI Assistant">
          <div className="ai-panel-header">
            <div className="ai-panel-title">
              <span className="ai-avatar">
                <Bot size={16} />
              </span>
              <div>
                <h4>AI Assistant</h4>
                <span className="ai-status">
                  <span className="ai-status-dot" /> Online · Ready to help
                </span>
              </div>
            </div>
            <button className="ai-close-btn" onClick={() => setOpen(false)} aria-label="Close">
              <X size={18} />
            </button>
          </div>

          <div className="ai-panel-body" ref={scrollRef}>
            {messages.length === 0 && (
              <div className="ai-empty-state">
                <div className="ai-empty-icon">
                  <Lightbulb size={22} />
                </div>
                <p>Ask me anything about running your school — attendance, fees, exams, staffing, or admissions.</p>
                <div className="ai-suggestions">
                  {SUGGESTED_PROMPTS.map((p) => (
                    <button key={p} className="ai-suggestion-chip" onClick={() => send(p)}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m) => (
              <div key={m.id} className={`ai-message ai-message-${m.role}`}>
                <span className="ai-message-avatar">
                  {m.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                </span>
                <div className="ai-message-bubble">{m.content}</div>
              </div>
            ))}

            {loading && (
              <div className="ai-message ai-message-assistant">
                <span className="ai-message-avatar">
                  <Bot size={14} />
                </span>
                <div className="ai-message-bubble ai-typing">
                  <Loader2 size={14} className="ai-spin" />
                  Thinking…
                </div>
              </div>
            )}

            {error && <div className="ai-error">{error}</div>}
          </div>

          <div className="ai-panel-footer">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask for advice…"
              rows={1}
              className="ai-input"
            />
            <button
              className="ai-send-btn"
              onClick={() => send()}
              disabled={loading || !input.trim()}
              aria-label="Send"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  )
}