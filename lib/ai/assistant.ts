/**
 * Server-only OpenAI integration.
 * Never import this file from client components.
 */

import OpenAI from 'openai'

let _client: OpenAI | null = null

function getClient(): OpenAI {
  if (!_client) {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not set')
    }
    _client = new OpenAI({ apiKey })
  }
  return _client
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

const SYSTEM_PROMPT = `You are ConsultPilot AI, an expert GRC (Governance, Risk & Compliance) assistant
specialising in SOC 2, HIPAA, and ISO 27001 frameworks. You help cybersecurity consultants:

- Interpret control requirements and write evidence guidance
- Draft findings descriptions and remediation steps
- Summarise audit project status from structured data
- Generate professional compliance report sections

Always be concise, accurate, and practical. Use framework-specific terminology correctly.
When generating report sections, use well-structured markdown with headings and bullet points.
Never fabricate specific control statuses — only describe what is provided in the context.`

/**
 * Non-streaming chat completion for report generation.
 */
export async function generateChatCompletion(
  messages: ChatMessage[],
  context?: string,
): Promise<string> {
  const client = getClient()

  const systemWithContext: ChatMessage = context
    ? { role: 'system', content: `${SYSTEM_PROMPT}\n\n<project_context>\n${context}\n</project_context>` }
    : { role: 'system', content: SYSTEM_PROMPT }

  const response = await client.chat.completions.create({
    model:       'gpt-4o-mini',
    messages:    [systemWithContext, ...messages],
    max_tokens:  2048,
    temperature: 0.3,
  })

  return response.choices[0]?.message?.content ?? ''
}

/**
 * Streaming chat — returns a ReadableStream for SSE.
 */
export async function streamChatCompletion(
  messages: ChatMessage[],
  context?: string,
): Promise<ReadableStream<Uint8Array>> {
  const client = getClient()

  const systemWithContext: ChatMessage = context
    ? { role: 'system', content: `${SYSTEM_PROMPT}\n\n<project_context>\n${context}\n</project_context>` }
    : { role: 'system', content: SYSTEM_PROMPT }

  const stream = await client.chat.completions.create({
    model:       'gpt-4o-mini',
    messages:    [systemWithContext, ...messages],
    max_tokens:  2048,
    temperature: 0.3,
    stream:      true,
  })

  const encoder = new TextEncoder()

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta?.content
        if (delta) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: delta })}\n\n`))
        }
      }
      controller.enqueue(encoder.encode('data: [DONE]\n\n'))
      controller.close()
    },
    cancel() {
      stream.controller.abort()
    },
  })
}

/**
 * Build a project context string from structured data for the AI.
 */
export function buildProjectContext(project: {
  name: string
  framework: string
  status: string
  controls: { controlRef: string; title: string; status: string; category: string }[]
  findings: { title: string; severity: string; status: string }[]
}): string {
  const done      = project.controls.filter((c) => c.status === 'done' || c.status === 'na').length
  const total     = project.controls.length
  const pct       = total > 0 ? Math.round((done / total) * 100) : 0

  const byCategory = project.controls.reduce<Record<string, { done: number; total: number }>>(
    (acc, c) => {
      const cat = c.category || 'Uncategorised'
      if (!acc[cat]) acc[cat] = { done: 0, total: 0 }
      acc[cat].total++
      if (c.status === 'done' || c.status === 'na') acc[cat].done++
      return acc
    },
    {},
  )

  const categoryLines = Object.entries(byCategory)
    .map(([cat, s]) => `  - ${cat}: ${s.done}/${s.total} completed`)
    .join('\n')

  const findingLines = project.findings
    .map((f) => `  - [${f.severity.toUpperCase()}] ${f.title} (${f.status})`)
    .join('\n') || '  None'

  return `Project: ${project.name}
Framework: ${project.framework}
Status: ${project.status}
Controls: ${done}/${total} completed (${pct}%)

Progress by category:
${categoryLines}

Findings (${project.findings.length}):
${findingLines}`
}
