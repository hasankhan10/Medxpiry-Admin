'use client'

import React from 'react'
import { motion } from 'framer-motion'

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#F8F6F1]">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: [1, 1.05, 1], opacity: 1 }}
        transition={{ 
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="flex flex-col items-center gap-6"
      >
        <div className="w-24 h-24 bg-[#C84B2F] rounded-2xl shadow-2xl flex items-center justify-center text-white text-5xl font-bold">
          M
        </div>
        <div className="flex flex-col items-center gap-1">
          <h2 className="text-2xl font-bold text-[#0F1117] tracking-tight">MedExpiry</h2>
          <p className="text-sm font-medium text-gray-400 uppercase tracking-widest">Admin Panel</p>
        </div>
      </motion.div>
      
      <div className="absolute bottom-12 w-64 h-1 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear"
          }}
          className="w-full h-full bg-[#C84B2F]"
        />
      </div>
    </div>
  )
}
