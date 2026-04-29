import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { updatePostSchema, fieldErrors } from '@/lib/validations'

type Params = { params: Promise<{ postId: string }> }

export async function GET(_request: NextRequest, { params }: Params) {
  const { postId } = await params
  const supabase = await createClient()

  const { data: post, error } = await supabase
    .from('posts')
    .select('*, author:profiles(*)')
    .eq('id', postId)
    .eq('is_active', true)
    .single()

  if (error || !post) return NextResponse.json({ error: 'Post not found' }, { status: 404 })

  const { data: { user } } = await supabase.auth.getUser()
  let isLiked = false
  if (user) {
    const { data: like } = await supabase
      .from('likes').select('id').eq('user_id', user.id).eq('post_id', postId).single()
    isLiked = !!like
  }

  return NextResponse.json({ ...post, is_liked: isLiked })
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const { postId } = await params
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const parsed = updatePostSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: fieldErrors(parsed.error) },
      { status: 400 }
    )
  }

  const { data: post, error } = await supabase
    .from('posts')
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq('id', postId)
    .eq('author_id', user.id)
    .select('*, author:profiles(*)')
    .single()

  if (error) return NextResponse.json({ error: 'Post not found or not authorized' }, { status: 404 })
  return NextResponse.json(post)
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const { postId } = await params
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Check ownership first (SELECT policy only covers is_active=true rows)
  const { data: existing } = await supabase
    .from('posts')
    .select('id')
    .eq('id', postId)
    .eq('author_id', user.id)
    .eq('is_active', true)
    .single()

  if (!existing) return NextResponse.json({ error: 'Post not found or not authorized' }, { status: 404 })

  // Soft-delete without .select() to avoid the RLS SELECT-after-UPDATE conflict
  const { error } = await supabase
    .from('posts')
    .update({ is_active: false })
    .eq('id', postId)
    .eq('author_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ message: 'Post deleted' })
}

export { PATCH as PUT }
