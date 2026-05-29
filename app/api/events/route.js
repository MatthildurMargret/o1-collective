import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  const today = new Date().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('events')
    .select('*')
    .gte('event_date', today)
    .or('hidden.eq.false,hidden.is.null')
    .order('event_date', { ascending: true })

  if (error) {
    console.error('Events query error:', error.message)
    return NextResponse.json([], { status: 500 })
  }

  return NextResponse.json(data)
}
