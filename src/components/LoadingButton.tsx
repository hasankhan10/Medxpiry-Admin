'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean
  loadingText?: string
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'outline' | 'ghost'
}

export default function LoadingButton({ 
  isLoading, 
  loadingText, 
  children, 
  variant = 'primary', 
  className, 
  disabled,
  ...props 
}: LoadingButtonProps) {
  
  const variants = {
    primary: 'bg-[#C84B2F] text-white hover:bg-[#A83D25] shadow-sm',
    secondary: 'bg-gray-800 text-white hover:bg-black shadow-sm',
    danger: 'bg-red-600 text-white hover:bg-red-700 shadow-sm',
    success: 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm',
    outline: 'bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-50',
    ghost: 'bg-gray-100 text-gray-800 hover:bg-gray-200'
  }

  return (
    <button
      disabled={isLoading || disabled}
      className={cn(
        'relative flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-bold transition-all duration-200 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed text-sm',
        variants[variant],
        className
      )}
      {...props}
    >
      <span className={cn('flex items-center gap-2', isLoading && 'opacity-0')}>
        {children}
      </span>

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="w-5 h-5 animate-spin" />
          {loadingText && <span className="ml-2">{loadingText}</span>}
        </div>
      )}
    </button>
  )
}
