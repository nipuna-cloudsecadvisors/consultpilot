'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { getSupabaseServerClient } from '@/lib/supabase/server'

const BUCKET = 'evidence'
const MAX_FILE_SIZE = 25 * 1024 * 1024 // 25 MB

type ActionResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string }

async function requireUser() {
  const supabase = await getSupabaseServerClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) throw new Error('Unauthorized')
  return { supabase, userId: user.id }
}

export async function uploadEvidence(
  controlId: string,
  projectId: string,
  formData: FormData,
): Promise<ActionResult<{ id: string; fileName: string; url: string }>> {
  const file = formData.get('file')
  const notes = formData.get('notes')?.toString() ?? ''

  if (!(file instanceof File)) {
    return { success: false, error: 'No file provided' }
  }
  if (file.size > MAX_FILE_SIZE) {
    return { success: false, error: 'File too large (max 25 MB)' }
  }

  const { supabase, userId } = await requireUser()

  // Build a storage path: evidence/<controlId>/<timestamp>-<filename>
  const ext = file.name.split('.').pop() ?? 'bin'
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
  const storagePath = `${controlId}/${Date.now()}-${safeName}`

  const arrayBuffer = await file.arrayBuffer()
  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, arrayBuffer, {
      contentType: file.type || 'application/octet-stream',
      upsert: false,
    })

  if (uploadError) return { success: false, error: uploadError.message }

  // Get signed URL (valid 7 days) — stored URLs are regenerated on view
  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(storagePath)

  const { data: record, error: dbError } = await supabase
    .from('evidence')
    .insert({
      control_id:  controlId,
      file_name:   file.name,
      file_path:   storagePath,
      file_size:   file.size,
      uploaded_by: userId,
      notes:       notes || null,
    })
    .select('id')
    .single()

  if (dbError) {
    // Clean up storage if DB insert fails
    await supabase.storage.from(BUCKET).remove([storagePath])
    return { success: false, error: dbError.message }
  }

  revalidatePath(`/projects/${projectId}/controls/${controlId}`)
  return {
    success: true,
    data: { id: record.id, fileName: file.name, url: urlData?.publicUrl ?? '' },
  }
}

export async function deleteEvidence(
  evidenceId: string,
  filePath: string,
  controlId: string,
  projectId: string,
): Promise<ActionResult<undefined>> {
  const { supabase } = await requireUser()

  await supabase.storage.from(BUCKET).remove([filePath])

  const { error } = await supabase.from('evidence').delete().eq('id', evidenceId)
  if (error) return { success: false, error: error.message }

  revalidatePath(`/projects/${projectId}/controls/${controlId}`)
  return { success: true, data: undefined }
}

export async function getSignedEvidenceUrl(filePath: string): Promise<string | null> {
  const supabase = await getSupabaseServerClient()
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(filePath, 3600) // 1-hour signed URL

  if (error || !data) return null
  return data.signedUrl
}
