'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { SOC2_CONTROLS } from '@/lib/frameworks/soc2'
import { HIPAA_CONTROLS } from '@/lib/frameworks/hipaa'
import { ISO27001_CONTROLS } from '@/lib/frameworks/iso27001'
import type { ControlTemplate } from '@/lib/frameworks/soc2'

// ── Schemas ───────────────────────────────────────────────────────────────────

const projectSchema = z.object({
  name:         z.string().min(1, 'Name is required'),
  framework:    z.enum(['SOC2_T1', 'SOC2_T2', 'HIPAA', 'ISO27001']),
  engagementId: z.string().uuid('Invalid engagement'),
  status:       z.enum(['not_started', 'in_progress', 'review', 'completed']).default('not_started'),
  startDate:    z.string().optional(),
  targetDate:   z.string().optional(),
})

type ActionResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string }

// ── Helpers ───────────────────────────────────────────────────────────────────

function getFrameworkControls(framework: string): ControlTemplate[] {
  switch (framework) {
    case 'SOC2_T1':
    case 'SOC2_T2':
      return SOC2_CONTROLS
    case 'HIPAA':
      return HIPAA_CONTROLS
    case 'ISO27001':
      return ISO27001_CONTROLS
    default:
      return []
  }
}

async function requireUser() {
  const supabase = await getSupabaseServerClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) throw new Error('Unauthorized')
  return { supabase, userId: user.id }
}

// ── Actions ───────────────────────────────────────────────────────────────────

export async function createProject(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const parsed = projectSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' }
  }

  const { supabase } = await requireUser()
  const { framework, engagementId, name, status, startDate, targetDate } = parsed.data

  // Create the project
  const { data: project, error: projectError } = await supabase
    .from('certification_projects')
    .insert({
      engagement_id: engagementId,
      name,
      framework,
      status,
      start_date:  startDate  || null,
      target_date: targetDate || null,
    })
    .select('id')
    .single()

  if (projectError) return { success: false, error: projectError.message }

  // Auto-seed controls from the framework library
  const templates = getFrameworkControls(framework)
  if (templates.length > 0) {
    const controlRows = templates.map((t) => ({
      project_id:  project.id,
      control_ref: t.ref,
      title:       t.title,
      description: t.description,
      category:    t.category,
      status:      'not_started' as const,
    }))

    const { error: controlsError } = await supabase
      .from('controls')
      .insert(controlRows)

    if (controlsError) {
      // Roll back the project if controls fail
      await supabase.from('certification_projects').delete().eq('id', project.id)
      return { success: false, error: `Controls seed failed: ${controlsError.message}` }
    }
  }

  revalidatePath('/projects')
  return { success: true, data: { id: project.id } }
}

export async function updateProject(
  id: string,
  input: unknown,
): Promise<ActionResult<undefined>> {
  const schema = projectSchema.omit({ engagementId: true, framework: true })
  const parsed = schema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' }
  }

  const { supabase } = await requireUser()

  const { error } = await supabase
    .from('certification_projects')
    .update({
      name:        parsed.data.name,
      status:      parsed.data.status,
      start_date:  parsed.data.startDate  || null,
      target_date: parsed.data.targetDate || null,
      updated_at:  new Date().toISOString(),
    })
    .eq('id', id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/projects')
  revalidatePath(`/projects/${id}`)
  return { success: true, data: undefined }
}

export async function getProjects() {
  const supabase = await getSupabaseServerClient()
  const { data, error } = await supabase
    .from('certification_projects')
    .select('*, engagements(name, type, clients(name))')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

export async function getProject(id: string) {
  const supabase = await getSupabaseServerClient()
  const { data, error } = await supabase
    .from('certification_projects')
    .select('*, engagements(name, type, clients(id, name))')
    .eq('id', id)
    .single()

  if (error) return null
  return data
}

export async function deleteProject(id: string): Promise<ActionResult<undefined>> {
  const { supabase } = await requireUser()
  const { error } = await supabase.from('certification_projects').delete().eq('id', id)
  if (error) return { success: false, error: error.message }
  revalidatePath('/projects')
  redirect('/projects')
}
