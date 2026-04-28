import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { validateImageFile, uploadImage } from '@/lib/upload'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await request.formData()
  const file = formData.get('image') as File | null

  if (!file) return NextResponse.json({ error: 'No image provided' }, { status: 400 })

  const validationError = validateImageFile(file)
  if (validationError) return NextResponse.json({ error: validationError }, { status: 400 })

  try {
    const url = await uploadImage(file, 'posts', user.id)
    return NextResponse.json({ url })
  } catch {
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
