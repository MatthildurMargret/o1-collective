'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '../../lib/supabase'
import ProfileForm from '../ProfileForm'

export default function ProfilePage() {
  const router = useRouter()
  const [initialData, setInitialData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const res = await fetch('/api/profile')
      if (!res.ok) {
        setNotFound(true)
        setLoading(false)
        return
      }
      const data = await res.json()
      setInitialData(data)
      setLoading(false)
    }
    init()
  }, [router])

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#F4F1EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ fontSize: 13, color: '#A8A49C' }}>Loading…</span>
    </div>
  )

  if (notFound) return (
    <div style={{ minHeight: '100vh', background: '#F4F1EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ fontSize: 14, color: '#A8A49C' }}>This account is not an approved O1 Collective member.</p>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#F4F1EB' }}>
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '32px 56px' }}>
        <span style={{ fontFamily: '"DM Serif Display", Georgia, serif', fontSize: 18, color: '#1A1815', letterSpacing: '-0.01em' }}>
          O1 Collective
        </span>
        <Link href="/directory" style={{ fontSize: 14, color: '#A8A49C', textDecoration: 'none' }}>
          ← Directory
        </Link>
      </nav>

      <ProfileForm
        initialData={initialData}
        headerLabel="Your profile"
        headerTitle="Edit your profile"
        headerSubtitle="Keep your details up to date so other members can find and recognize you."
        submitLabel="Save changes"
        redirectTo="/directory"
      />
    </div>
  )
}
