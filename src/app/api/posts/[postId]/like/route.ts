import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

type Params = { params: Promise<{ postId: string }> }

export async function POST(_request: NextRequest, { params }: Params) {
  const { postId } = await params
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { error } = await supabase
    .from('likes')
    .insert({ user_id: user.id, post_id: postId })

  if (error) {
    if (error.code === '23505') return NextResponse.json({ error: 'Already liked' }, { status: 409 })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  await supabase.rpc('increment_like_count', { post_id: postId })

  return NextResponse.json({ message: 'Post liked' }, { status: 201 })
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const { postId } = await params
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('likes')
    .delete()
    .eq('user_id', user.id)
    .eq('post_id', postId)
    .select('id')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (data && data.length > 0) {
    await supabase.rpc('decrement_like_count', { post_id: postId })
  }

  return NextResponse.json({ message: 'Post unliked' })
}
