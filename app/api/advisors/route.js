import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  const { data, error } = await supabase
    .from('advisors')
    .select('*')
    .or('hidden.eq.false,hidden.is.null')
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Advisors query error:', error.message)
    return NextResponse.json([])
  }

  return NextResponse.json(data)
}
