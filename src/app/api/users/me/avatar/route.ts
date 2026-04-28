import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { validateImageFile, uploadImage } from '@/lib/upload'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await request.formData()
  const file = formData.get('avatar') as File | null
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

  const validationError = validateImageFile(file)
  if (validationError) return NextResponse.json({ error: validationError }, { status: 400 })

  try {
    const avatarUrl = await uploadImage(file, 'avatars', user.id)

    const { data: profile, error } = await supabase
      .from('profiles')
      .update({ avatar_url: avatarUrl, updated_at: new Date().toISOString() })
      .eq('id', user.id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ avatar_url: avatarUrl, profile })
  } catch {
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
