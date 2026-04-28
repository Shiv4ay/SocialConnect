import { createClient } from '@/lib/supabase/server'

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png']
const MAX_SIZE_BYTES = 2 * 1024 * 1024 // 2MB

export function validateImageFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) return 'Only JPEG and PNG images are allowed'
  if (file.size > MAX_SIZE_BYTES) return 'Image must be smaller than 2MB'
  return null
}

export async function uploadImage(
  file: File,
  bucket: 'posts' | 'avatars',
  userId: string
): Promise<string> {
  const supabase = await createClient()
  const ext = file.type === 'image/png' ? 'png' : 'jpg'
  const path = `${userId}/${Date.now()}.${ext}`

  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    contentType: file.type,
    upsert: false,
  })

  if (error) throw new Error(`Upload failed: ${error.message}`)

  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}
