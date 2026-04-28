import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

type Params = { params: Promise<{ userId: string }> }

export async function POST(request: NextRequest, { params }: Params) {
  const { userId } = await params
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (user.id === userId) return NextResponse.json({ error: 'Cannot follow yourself' }, { status: 400 })

  const { error } = await supabase
    .from('follows')
    .insert({ follower_id: user.id, following_id: userId })

  if (error) {
    if (error.code === '23505') return NextResponse.json({ error: 'Already following' }, { status: 409 })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ message: 'Followed successfully' }, { status: 201 })
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const { userId } = await params
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { error } = await supabase
    .from('follows')
    .delete()
    .eq('follower_id', user.id)
    .eq('following_id', userId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ message: 'Unfollowed successfully' })
}
