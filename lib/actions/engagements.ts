'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getSupabaseServerClient } from '@/lib/supabase/server'

// ── Schemas ───────────────────────────────────────────────────────────────────

const engagementSchema = z.object({
  name:       z.string().min(1, 'Name is required'),
  type:       z.enum(['SOC2_T1', 'SOC2_T2', 'HIPAA', 'ISO27001', 'OTHER']),
  status:     z.enum(['planning', 'in_progress', 'review', 'completed', 'on_hold']).default('planning'),
  startDate:  z.string().optional(),
  targetDate: z.string().optional(),
  notes:      z.string().optional(),
})

type ActionResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string }

// ── Helpers ───────────────────────────────────────────────────────────────────

async function requireTenant() {
  const supabase = await getSupabaseServerClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) throw new Error('Unauthorized')
  return { supabase, userId: user.id }
}

// ── Actions ───────────────────────────────────────────────────────────────────

export async function createEngagement(
  clientId: string,
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const parsed = engagementSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' }
  }

  const { supabase } = await requireTenant()

  const { data, error } = await supabase
    .from('engagements')
    .insert({
      client_id:   clientId,
      name:        parsed.data.name,
      type:        parsed.data.type,
      status:      parsed.data.status,
      start_date:  parsed.data.startDate  || null,
      target_date: parsed.data.targetDate || null,
      notes:       parsed.data.notes      || null,
    })
    .select('id')
    .single()

  if (error) return { success: false, error: error.message }

  revalidatePath(`/clients/${clientId}`)
  return { success: true, data: { id: data.id } }
}

export async function updateEngagement(
  id: string,
  clientId: string,
  input: unknown,
): Promise<ActionResult<undefined>> {
  const parsed = engagementSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' }
  }

  const { supabase } = await requireTenant()

  const { error } = await supabase
    .from('engagements')
    .update({
      name:        parsed.data.name,
      type:        parsed.data.type,
      status:      parsed.data.status,
      start_date:  parsed.data.startDate  || null,
      target_date: parsed.data.targetDate || null,
      notes:       parsed.data.notes      || null,
      updated_at:  new Date().toISOString(),
    })
    .eq('id', id)

  if (error) return { success: false, error: error.message }

  revalidatePath(`/clients/${clientId}`)
  revalidatePath(`/clients/${clientId}/engagements/${id}`)
  return { success: true, data: undefined }
}

export async function deleteEngagement(
  id: string,
  clientId: string,
): Promise<ActionResult<undefined>> {
  const { supabase } = await requireTenant()

  const { error } = await supabase.from('engagements').delete().eq('id', id)
  if (error) return { success: false, error: error.message }

  revalidatePath(`/clients/${clientId}`)
  redirect(`/clients/${clientId}`)
}

export async function getEngagements(clientId: string) {
  const supabase = await getSupabaseServerClient()
  const { data, error } = await supabase
    .from('engagements')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

export async function getEngagement(id: string) {
  const supabase = await getSupabaseServerClient()
  const { data, error } = await supabase
    .from('engagements')
    .select('*, clients(name)')
    .eq('id', id)
    .single()

  if (error) return null
  return data
}
