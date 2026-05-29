import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { streamChatCompletion, buildProjectContext } from '@/lib/ai/assistant'
import type { ChatMessage } from '@/lib/ai/assistant'

export async function POST(request: NextRequest) {
  // Auth gate
  const supabase = await getSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { messages, projectId } = body as {
    messages: ChatMessage[]
    projectId?: string
  }

  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: 'messages is required' }, { status: 400 })
  }

  // Build context from project if provided
  let context: string | undefined
  if (projectId) {
    const [{ data: project }, { data: controls }, { data: findings }] = await Promise.all([
      supabase
        .from('certification_projects')
        .select('name, framework, status')
        .eq('id', projectId)
        .single(),
      supabase
        .from('controls')
        .select('control_ref, title, status, category')
        .eq('project_id', projectId),
      supabase
        .from('findings')
        .select('title, severity, status')
        .eq('project_id', projectId),
    ])

    if (project) {
      context = buildProjectContext({
        name:      project.name,
        framework: project.framework,
        status:    project.status,
        controls:  (controls ?? []).map((c) => ({
          controlRef: c.control_ref,
          title:      c.title,
          status:     c.status,
          category:   c.category ?? '',
        })),
        findings: (findings ?? []).map((f) => ({
          title:    f.title,
          severity: f.severity,
          status:   f.status,
        })),
      })
    }
  }

  let stream: ReadableStream<Uint8Array>
  try {
    stream = await streamChatCompletion(messages, context)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'AI error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }

  return new Response(stream, {
    headers: {
      'Content-Type':  'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection':    'keep-alive',
    },
  })
}
