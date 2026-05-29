'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getSupabaseServerClient } from '@/lib/supabase/server'

// ── Schemas ───────────────────────────────────────────────────────────────────

const clientSchema = z.object({
  name:         z.string().min(1, 'Name is required'),
  industry:     z.string().optional(),
  website:      z.string().url('Must be a valid URL').optional().or(z.literal('')),
  contactName:  z.string().optional(),
  contactEmail: z.string().email('Must be a valid email').optional().or(z.literal('')),
  contactPhone: z.string().optional(),
  status:       z.enum(['active', 'prospect', 'inactive']).default('prospect'),
  notes:        z.string().optional(),
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

export async function createClient(input: unknown): Promise<ActionResult<{ id: string }>> {
  const parsed = clientSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' }
  }

  const { supabase } = await requireTenant()

  const { data, error } = await supabase
    .from('clients')
    .insert({
      name:          parsed.data.name,
      industry:      parsed.data.industry || null,
      website:       parsed.data.website   || null,
      contact_name:  parsed.data.contactName  || null,
      contact_email: parsed.data.contactEmail || null,
      contact_phone: parsed.data.contactPhone || null,
      status:        parsed.data.status,
      notes:         parsed.data.notes || null,
    })
    .select('id')
    .single()

  if (error) return { success: false, error: error.message }

  revalidatePath('/clients')
  return { success: true, data: { id: data.id } }
}

export async function updateClient(
  id: string,
  input: unknown,
): Promise<ActionResult<undefined>> {
  const parsed = clientSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' }
  }

  const { supabase } = await requireTenant()

  const { error } = await supabase
    .from('clients')
    .update({
      name:          parsed.data.name,
      industry:      parsed.data.industry || null,
      website:       parsed.data.website   || null,
      contact_name:  parsed.data.contactName  || null,
      contact_email: parsed.data.contactEmail || null,
      contact_phone: parsed.data.contactPhone || null,
      status:        parsed.data.status,
      notes:         parsed.data.notes || null,
      updated_at:    new Date().toISOString(),
    })
    .eq('id', id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/clients')
  revalidatePath(`/clients/${id}`)
  return { success: true, data: undefined }
}

export async function deleteClient(id: string): Promise<ActionResult<undefined>> {
  const { supabase } = await requireTenant()

  const { error } = await supabase.from('clients').delete().eq('id', id)
  if (error) return { success: false, error: error.message }

  revalidatePath('/clients')
  redirect('/clients')
}

export async function getClients() {
  const supabase = await getSupabaseServerClient()
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

export async function getClient(id: string) {
  const supabase = await getSupabaseServerClient()
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return null
  return data
}
