import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { registerSchema, fieldErrors } from '@/lib/validations'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = registerSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: fieldErrors(parsed.error) },
        { status: 400 }
      )
    }

    const { email, username, password, first_name, last_name } = parsed.data
    const supabase = await createClient()

    // Check username uniqueness
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username)
      .single()

    if (existing) {
      return NextResponse.json({ error: 'Username already taken' }, { status: 409 })
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username, first_name, last_name },
      },
    })

    if (error) {
      return NextResponse.json({ error: 'Registration failed. Please check your details.' }, { status: 400 })
    }

    if (!data.user) {
      return NextResponse.json(
        { message: 'Account created. Please check your email to confirm your account.' },
        { status: 201 }
      )
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single()

    return NextResponse.json(
      { message: 'Account created successfully', user: profile, session: data.session },
      { status: 201 }
    )
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
