'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const links = [
    { label: 'Overview', href: '/', icon: '📊' },
    { label: 'Pending Payments', href: '/payments/pending', icon: '💰' },
    { label: 'Returns DB', href: '/returns', icon: '📦' },
    { label: 'Push Broadcast', href: '/push', icon: '📣' },
  ]

  const handleLogout = async () => {
    await fetch('/api/auth', { method: 'DELETE' })
    window.location.href = '/login'
  }

  return (
    <div className="flex h-screen bg-[#F8F6F1]">
      <aside className="w-64 bg-[#C84B2F] text-white flex flex-col justify-between hidden md:block">
        <div>
          <div className="p-6 border-b border-[#A83D25]">
            <h1 className="text-2xl font-bold tracking-wide">MedExpiry</h1>
            <p className="text-[#FEE2E2] text-xs uppercase mt-1">Admin Panel</p>
          </div>
          
          <nav className="mt-6 flex flex-col gap-2 px-4">
            {links.map((link) => {
              const active = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href))
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${
                    active ? 'bg-[#A83D25] font-semibold' : 'hover:bg-[#E8694F] hover:bg-opacity-50 text-white text-opacity-80'
                  }`}
                >
                  <span className="text-xl">{link.icon}</span>
                  {link.label}
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="p-6 border-t border-[#A83D25]">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-[#FEE2E2] border-opacity-30 rounded-md hover:bg-[#A83D25] transition"
          >
            <span>🚪</span> Logout
          </button>
        </div>
      </aside>
      
      <main className="flex-1 overflow-y-auto w-full bg-[#f4f3f0]">
        <div className="p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
