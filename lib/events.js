import { createClient } from '@supabase/supabase-js'

function adminClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
}

// Public-safe subset of the events table — no location/link/spots, since some
// events are invite-only with location revealed only on approved RSVP.
export async function getUpcomingEvents() {
  const today = new Date().toISOString().split('T')[0]

  const { data, error } = await adminClient()
    .from('events')
    .select('id, title, event_date')
    .gte('event_date', today)
    .or('hidden.eq.false,hidden.is.null')
    .order('event_date', { ascending: true })

  if (error) {
    console.error('Upcoming events query error:', error.message)
    return []
  }

  return data
}
