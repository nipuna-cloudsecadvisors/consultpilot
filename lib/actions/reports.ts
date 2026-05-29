'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { generateChatCompletion, buildProjectContext } from '@/lib/ai/assistant'

const reportSchema = z.object({
  title:     z.string().min(1, 'Title is required'),
  projectId: z.string().uuid('Invalid project'),
  framework: z.string().min(1),
})

type ActionResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string }

async function requireUser() {
  const supabase = await getSupabaseServerClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) throw new Error('Unauthorized')
  return { supabase, userId: user.id }
}

export async function getReports() {
  const supabase = await getSupabaseServerClient()
  const { data, error } = await supabase
    .from('reports')
    .select('*, certification_projects(name)')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

export async function getReport(id: string) {
  const supabase = await getSupabaseServerClient()
  const { data, error } = await supabase
    .from('reports')
    .select('*, certification_projects(name, framework)')
    .eq('id', id)
    .single()

  if (error) return null
  return data
}

export async function saveReport(
  id: string,
  content: string,
): Promise<ActionResult<undefined>> {
  const { supabase } = await requireUser()
  const { error } = await supabase
    .from('reports')
    .update({ content: { markdown: content }, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) return { success: false, error: error.message }
  revalidatePath(`/reports/${id}`)
  return { success: true, data: undefined }
}

export async function finaliseReport(id: string): Promise<ActionResult<undefined>> {
  const { supabase } = await requireUser()
  const { error } = await supabase
    .from('reports')
    .update({ status: 'final', updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) return { success: false, error: error.message }
  revalidatePath('/reports')
  revalidatePath(`/reports/${id}`)
  return { success: true, data: undefined }
}

export async function deleteReport(id: string): Promise<ActionResult<undefined>> {
  const { supabase } = await requireUser()
  const { error } = await supabase.from('reports').delete().eq('id', id)
  if (error) return { success: false, error: error.message }
  revalidatePath('/reports')
  redirect('/reports')
}

/**
 * AI-generated report: fetch project context → call OpenAI → store in DB.
 */
export async function generateReport(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const parsed = reportSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' }
  }

  const { supabase } = await requireUser()
  const { title, projectId, framework } = parsed.data

  // Fetch project data for context
  const { data: project } = await supabase
    .from('certification_projects')
    .select('name, framework, status')
    .eq('id', projectId)
    .single()

  if (!project) return { success: false, error: 'Project not found' }

  const { data: controls } = await supabase
    .from('controls')
    .select('control_ref, title, status, category')
    .eq('project_id', projectId)

  const { data: findings } = await supabase
    .from('findings')
    .select('title, severity, status')
    .eq('project_id', projectId)

  const context = buildProjectContext({
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

  let markdown: string
  try {
    markdown = await generateChatCompletion(
      [
        {
          role: 'user',
          content: `Generate a professional ${framework} compliance report titled "${title}".
Include: executive summary, scope, methodology, control assessment results (with pass/fail counts per category),
findings summary (grouped by severity), and recommendations. Use markdown with clear headings.`,
        },
      ],
      context,
    )
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'AI generation failed'
    return { success: false, error: msg }
  }

  const { data: report, error: dbError } = await supabase
    .from('reports')
    .insert({
      project_id:   projectId,
      title,
      framework,
      status:       'draft',
      content:      { markdown },
      generated_by: 'ai',
    })
    .select('id')
    .single()

  if (dbError) return { success: false, error: dbError.message }

  revalidatePath('/reports')
  return { success: true, data: { id: report.id } }
}

export async function saveAiMessage(
  projectId: string,
  role: 'user' | 'assistant',
  content: string,
): Promise<void> {
  const supabase = await getSupabaseServerClient()
  await supabase.from('ai_messages').insert({ project_id: projectId, role, content })
}

export async function getAiMessages(projectId: string) {
  const supabase = await getSupabaseServerClient()
  const { data } = await supabase
    .from('ai_messages')
    .select('role, content, created_at')
    .eq('project_id', projectId)
    .order('created_at', { ascending: true })
    .limit(50)

  return data ?? []
}
