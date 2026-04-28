import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

type Params = { params: Promise<{ postId: string; commentId: string }> }

export async function DELETE(_request: NextRequest, { params }: Params) {
  const { postId, commentId } = await params
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('comments')
    .delete()
    .eq('id', commentId)
    .eq('user_id', user.id)
    .eq('post_id', postId)
    .select('id')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data || data.length === 0) return NextResponse.json({ error: 'Comment not found or not authorized' }, { status: 404 })

  await supabase.rpc('decrement_comment_count', { post_id: postId })

  return NextResponse.json({ message: 'Comment deleted' })
}
