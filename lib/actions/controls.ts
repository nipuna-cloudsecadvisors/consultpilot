'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { getSupabaseServerClient } from '@/lib/supabase/server'

const controlUpdateSchema = z.object({
  status:        z.enum(['not_started', 'in_progress', 'in_review', 'done', 'na']).optional(),
  evidenceNotes: z.string().optional(),
  assignedTo:    z.string().optional(),
  dueDate:       z.string().optional(),
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

export async function updateControl(
  id: string,
  projectId: string,
  input: unknown,
): Promise<ActionResult<undefined>> {
  const parsed = controlUpdateSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' }
  }

  const { supabase } = await requireUser()

  const updatePayload: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (parsed.data.status        !== undefined) updatePayload.status         = parsed.data.status
  if (parsed.data.evidenceNotes !== undefined) updatePayload.evidence_notes = parsed.data.evidenceNotes
  if (parsed.data.assignedTo    !== undefined) updatePayload.assigned_to    = parsed.data.assignedTo
  if (parsed.data.dueDate       !== undefined) updatePayload.due_date       = parsed.data.dueDate || null

  const { error } = await supabase.from('controls').update(updatePayload).eq('id', id)
  if (error) return { success: false, error: error.message }

  revalidatePath(`/projects/${projectId}`)
  revalidatePath(`/projects/${projectId}/controls/${id}`)
  return { success: true, data: undefined }
}

export async function getControls(projectId: string) {
  const supabase = await getSupabaseServerClient()
  const { data, error } = await supabase
    .from('controls')
    .select('*')
    .eq('project_id', projectId)
    .order('control_ref', { ascending: true })

  if (error) throw error
  return data ?? []
}

export async function getControl(id: string) {
  const supabase = await getSupabaseServerClient()
  const { data, error } = await supabase
    .from('controls')
    .select('*, evidence(*)')
    .eq('id', id)
    .single()

  if (error) return null
  return data
}
