import type { ReactNode } from 'react'
import Link from 'next/link'

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className="min-h-screen bg-black text-white relative"
      style={{
        backgroundImage:
          "url('https://assets.nflxext.com/ffe/siteui/vlv3/fc164b4b-f085-44ee-bb7f-ec7df8539eff/d23a1608-7d90-4da1-93c4-7a50e7b7357a/IN-en-20230814-popsignuptwoweeks-perspective_alpha_website_large.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative z-10">
        <header className="px-6 md:px-16 py-6">
          <Link href="/">
            <span className="text-[#E50914] font-black text-2xl md:text-3xl tracking-tight select-none">
              WATCH
            </span>
          </Link>
        </header>
        <main className="flex items-center justify-center px-4 min-h-[calc(100vh-88px)]">
          {children}
        </main>
      </div>
    </div>
  )
}
