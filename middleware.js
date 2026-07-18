import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function middleware(request) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  if (!user && (pathname.startsWith('/directory') || pathname.startsWith('/welcome') || pathname.startsWith('/events') || pathname.startsWith('/admin') || pathname.startsWith('/profile'))) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (user && pathname === '/login') {
    const url = request.nextUrl.clone()
    url.pathname = '/directory'
    return NextResponse.redirect(url)
  }

  // Being authenticated isn't the same as being an approved member — anyone can create a
  // Supabase auth account. Only members who completed /welcome (which itself re-verifies
  // approval server-side) get a profiles row with onboarding_complete set.
  if (user && (pathname.startsWith('/directory') || pathname.startsWith('/events') || pathname.startsWith('/profile'))) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('onboarding_complete')
      .eq('id', user.id)
      .maybeSingle()

    if (!profile?.onboarding_complete) {
      const url = request.nextUrl.clone()
      url.pathname = '/welcome'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/directory/:path*', '/welcome/:path*', '/events/:path*', '/admin/:path*', '/profile/:path*', '/login'],
}
