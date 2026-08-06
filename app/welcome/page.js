'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '../../lib/supabase'
import ProfileForm from '../ProfileForm'

export default function WelcomePage() {
  const router = useRouter()
  const [initialData, setInitialData] = useState(null)
  const [found, setFound] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const res = await fetch(`/api/auth/check-member?email=${encodeURIComponent(user.email)}`)
      const data = await res.json()

      setFound(!!data.found)
      setInitialData({
        name: data.name ?? '',
        jobTitle: data.jobTitle ?? '',
        company: data.company ?? '',
        location: data.location ?? '',
        linkedin: data.linkedin ?? '',
        bio: data.description ?? '',
        avatarUrl: '',
        email: user.email,
        hideEmail: false,
      })
      setLoading(false)
    }
    init()
  }, [router])

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#F4F1EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ fontSize: 13, color: '#A8A49C' }}>Loading…</span>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#F4F1EB' }}>
      <nav style={{ display: 'flex', alignItems: 'center', padding: '32px 56px' }}>
        <span style={{ fontFamily: '"DM Serif Display", Georgia, serif', fontSize: 18, color: '#1A1815', letterSpacing: '-0.01em' }}>
          O1 Collective
        </span>
      </nav>

      <ProfileForm
        initialData={initialData}
        headerLabel="You're in"
        headerTitle={initialData.name ? `Welcome, ${initialData.name.split(' ')[0]}.` : 'Welcome.'}
        headerSubtitle={found
          ? "We've pre-filled what we have from our records. Confirm or update anything below."
          : 'Tell us a bit about yourself so other members can find you.'}
        submitLabel="Go to member directory →"
        redirectTo="/directory"
      />
    </div>
  )
}
