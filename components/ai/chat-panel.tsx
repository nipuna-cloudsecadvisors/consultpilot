'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import type { ChatMessage } from '@/lib/ai/assistant'

interface ChatPanelProps {
  projectId?: string
  initialMessages?: ChatMessage[]
}

export function ChatPanel({ projectId, initialMessages = [] }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend() {
    const text = input.trim()
    if (!text || isStreaming) return

    const userMsg: ChatMessage = { role: 'user', content: text }
    const next = [...messages, userMsg]
    setMessages(next)
    setInput('')
    setIsStreaming(true)

    // Placeholder for streaming response
    const assistantMsg: ChatMessage = { role: 'assistant', content: '' }
    setMessages([...next, assistantMsg])

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next, projectId }),
      })

      if (!res.ok) {
        const err = await res.json()
        setMessages((prev) => {
          const copy = [...prev]
          copy[copy.length - 1] = { role: 'assistant', content: `Error: ${err.error}` }
          return copy
        })
        return
      }

      const reader = res.body?.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const text = decoder.decode(value, { stream: true })
          const lines = text.split('\n')

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6)
              if (data === '[DONE]') break

              try {
                const parsed = JSON.parse(data) as { content: string }
                accumulated += parsed.content
                setMessages((prev) => {
                  const copy = [...prev]
                  copy[copy.length - 1] = { role: 'assistant', content: accumulated }
                  return copy
                })
              } catch {
                // Skip malformed lines
              }
            }
          }
        }
      }
    } catch {
      setMessages((prev) => {
        const copy = [...prev]
        copy[copy.length - 1] = { role: 'assistant', content: 'Network error. Please try again.' }
        return copy
      })
    } finally {
      setIsStreaming(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 p-4 min-h-0">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <Bot className="h-10 w-10 text-muted-foreground/50 mb-3" />
            <p className="font-medium text-sm">ConsultPilot AI</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-xs">
              Ask about controls, findings, evidence guidance, or generate report sections.
              {projectId ? ' I have your project context loaded.' : ''}
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={cn(
              'flex gap-3',
              msg.role === 'user' ? 'flex-row-reverse' : 'flex-row',
            )}
          >
            <div
              className={cn(
                'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs',
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground',
              )}
            >
              {msg.role === 'user' ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
            </div>
            <div
              className={cn(
                'rounded-lg px-3 py-2 text-sm max-w-[80%] whitespace-pre-wrap',
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-foreground',
              )}
            >
              {msg.content}
              {isStreaming && i === messages.length - 1 && msg.role === 'assistant' && msg.content === '' && (
                <span className="animate-pulse">▋</span>
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border p-3">
        <div className="flex gap-2 items-end">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a compliance question… (Enter to send)"
            rows={2}
            className="flex-1 resize-none text-sm"
            disabled={isStreaming}
          />
          <Button
            size="icon-sm"
            onClick={handleSend}
            disabled={!input.trim() || isStreaming}
            aria-label="Send"
          >
            {isStreaming ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
