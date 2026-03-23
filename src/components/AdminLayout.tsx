'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { motion, AnimatePresence } from 'framer-motion'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const links = [
    { label: 'Overview', href: '/', icon: '📊' },
    { label: 'All Shops', href: '/shops', icon: '🏪' },
    { label: 'Pending Payments', href: '/payments/pending', icon: '💰' },
    { label: 'Returns DB', href: '/returns', icon: '📦' },
    { label: 'Push Broadcast', href: '/push', icon: '📣' },
  ]

  const handleLogout = async () => {
    await fetch('/api/auth', { method: 'DELETE' })
    window.location.href = '/login'
  }

  return (
    <div className="flex h-screen bg-[#F8F6F1] font-sans">
      <aside className="w-64 bg-[#C84B2F] text-white flex flex-col justify-between hidden md:block overflow-hidden">
        <div className="overflow-y-auto">
          <div className="p-8 border-b border-[#A83D25]">
            <h1 className="text-2xl font-bold tracking-tight">MedExpiry</h1>
            <p className="text-[#FEE2E2] text-[10px] uppercase font-bold tracking-widest mt-1 opacity-70">Admin System</p>
          </div>
          
          <nav className="mt-8 flex flex-col gap-1 px-4">
            {links.map((link) => {
              const active = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href))
              return (
                <motion.div
                  key={link.href}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link
                    href={link.href}
                    className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 ${
                      active 
                        ? 'bg-white text-[#C84B2F] font-bold shadow-lg shadow-[#00000020]' 
                        : 'hover:bg-white/10 text-white/80'
                    }`}
                  >
                    <span className="text-xl">{link.icon}</span>
                    <span className="tracking-tight">{link.label}</span>
                  </Link>
                </motion.div>
              )
            })}
          </nav>
        </div>

        <div className="p-6">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white/10 border border-white/20 rounded-xl hover:bg-white/20 transition-all font-semibold"
          >
            <span>🚪</span> Logout
          </button>
        </div>
      </aside>
      
      <main className="flex-1 overflow-y-auto w-full bg-[#faf9f6]">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="p-8 max-w-7xl mx-auto"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}
