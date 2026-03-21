import React from 'react'
import AdminLayout from '@/components/AdminLayout'
import { supabase } from '@/lib/supabase'
import ReturnsClient from './ReturnsClient'

export const revalidate = 0

export default async function ReturnsPage() {
  const { data: returns, error } = await supabase
    .from('return_sessions')
    .select(`
      *,
      shops:shop_id ( shop_name, owner_name, city, owner_phone )
    `)
    .order('generated_at', { ascending: false, nullsFirst: false })

  if (error) {
    console.error('[DATABASE_ERROR] ReturnsPage:', error.message || error)
  }

  // Also fetch all items linked to sessions but maybe doing it on demand is better if the dataset gets huge.
  // For simplicity and speed in the admin panel, we'll fetch them on the client modal open via a server action or direct supabase client call if RLS allows.
  // Actually, since we're using Service Role in Next.js Server, let's just make a server action to fetch items.

  return (
    <AdminLayout>
      <ReturnsClient initialReturns={returns || []} />
    </AdminLayout>
  )
}
