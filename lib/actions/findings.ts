'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getSupabaseServerClient } from '@/lib/supabase/server'

const findingSchema = z.object({
  title:       z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  severity:    z.enum(['critical', 'high', 'medium', 'low', 'info']).default('medium'),
  status:      z.enum(['open', 'in_progress', 'resolved', 'accepted']).default('open'),
  remediation: z.string().optional(),
  dueDate:     z.string().optional(),
  controlId:   z.string().uuid().optional(),
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

export async function createFinding(
  projectId: string,
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const parsed = findingSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' }
  }

  const { supabase } = await requireUser()

  const { data, error } = await supabase
    .from('findings')
    .insert({
      project_id:  projectId,
      control_id:  parsed.data.controlId   || null,
      title:       parsed.data.title,
      description: parsed.data.description || null,
      severity:    parsed.data.severity,
      status:      parsed.data.status,
      remediation: parsed.data.remediation || null,
      due_date:    parsed.data.dueDate      || null,
    })
    .select('id')
    .single()

  if (error) return { success: false, error: error.message }

  revalidatePath(`/projects/${projectId}`)
  return { success: true, data: { id: data.id } }
}

export async function updateFinding(
  id: string,
  projectId: string,
  input: unknown,
): Promise<ActionResult<undefined>> {
  const parsed = findingSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' }
  }

  const { supabase } = await requireUser()

  const { error } = await supabase
    .from('findings')
    .update({
      title:       parsed.data.title,
      description: parsed.data.description || null,
      severity:    parsed.data.severity,
      status:      parsed.data.status,
      remediation: parsed.data.remediation || null,
      due_date:    parsed.data.dueDate      || null,
      updated_at:  new Date().toISOString(),
    })
    .eq('id', id)

  if (error) return { success: false, error: error.message }

  revalidatePath(`/projects/${projectId}`)
  return { success: true, data: undefined }
}

export async function deleteFinding(
  id: string,
  projectId: string,
): Promise<ActionResult<undefined>> {
  const { supabase } = await requireUser()
  const { error } = await supabase.from('findings').delete().eq('id', id)
  if (error) return { success: false, error: error.message }
  revalidatePath(`/projects/${projectId}`)
  redirect(`/projects/${projectId}`)
}

export async function getFindings(projectId: string) {
  const supabase = await getSupabaseServerClient()
  const { data, error } = await supabase
    .from('findings')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data ?? []
}
