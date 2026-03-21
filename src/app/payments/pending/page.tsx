import React from 'react'
import AdminLayout from '@/components/AdminLayout'
import { supabase } from '@/lib/supabase'
import PendingPaymentsClient from '@/app/payments/pending/PendingPaymentsClient'

export const revalidate = 0

export default async function PendingPaymentsPage() {
  const { data: requests, error } = await supabase
    .from('payment_requests')
    .select(`
      *,
      shops:shop_id ( shop_name, owner_name, owner_phone, city )
    `)
    .eq('status', 'pending')
    .order('submitted_at', { ascending: true })

  if (error) {
    console.error('[DATABASE_ERROR] PendingPayments:', error.message || error)
  }

  return (
    <AdminLayout>
       <PendingPaymentsClient initialRequests={requests || []} />
    </AdminLayout>
  )
}
