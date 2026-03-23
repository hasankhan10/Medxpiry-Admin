'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface Stat {
  label: string
  value: string | number
  color: string
  icon: string
}

export default function DashboardStats({ stats }: { stats: Stat[] }) {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } as any }
  }

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12"
    >
      {stats.map((stat, i) => (
        <motion.div 
          key={i} 
          variants={item}
          whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }}
          className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col transition-shadow duration-300"
        >
          <span className="text-3xl mb-3">{stat.icon}</span>
          <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.1em]">{stat.label}</p>
          <h3 className={`text-4xl font-black mt-1 ${stat.color}`}>{stat.value}</h3>
        </motion.div>
      ))}
    </motion.div>
  )
}
