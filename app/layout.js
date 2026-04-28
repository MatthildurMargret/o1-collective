import './globals.css'

export const metadata = {
  title: 'O1 Collective',
  description: 'A private community of founders, investors, and operators',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  )
}
