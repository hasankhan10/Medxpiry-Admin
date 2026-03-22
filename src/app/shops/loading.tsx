import React from 'react'
import AdminLayout from '../../components/AdminLayout'

export default function Loading() {
  return (
    <AdminLayout>
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-[#C84B2F] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-500 font-medium">Loading pharmacy details...</p>
      </div>
    </AdminLayout>
  )
}
