import React from 'react'
import AdminLayout from '@/components/AdminLayout'
import { supabase } from '@/lib/supabase'
import ShopClient from '@/app/shops/[id]/ShopClient'

export const revalidate = 0

export default async function ShopPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params

  // 1. Fetch Shop details
  const { data: shop, error } = await supabase.from('shops').select('*').eq('id', id).single()

  if (!shop || error) {
    return (
      <AdminLayout>
        <div className="p-12 text-center text-red-500">Shop not found.</div>
      </AdminLayout>
    )
  }

  // 2. Fetch Stats
  const targetRanges = new Date()
  targetRanges.setDate(targetRanges.getDate() + 60)
  
  const [
    { count: totalMeds },
    { count: exp60 },
    { count: exp30 },
    { count: exp15 },
    { count: returnCount }
  ] = await Promise.all([
    supabase.from('medicines').select('*', { count: 'exact', head: true }).eq('shop_id', id),
    supabase.from('medicines').select('*', { count: 'exact', head: true }).eq('shop_id', id).lte('expiry_date', new Date(Date.now() + 60*24*60*60*1000).toISOString()),
    supabase.from('medicines').select('*', { count: 'exact', head: true }).eq('shop_id', id).lte('expiry_date', new Date(Date.now() + 30*24*60*60*1000).toISOString()),
    supabase.from('medicines').select('*', { count: 'exact', head: true }).eq('shop_id', id).lte('expiry_date', new Date(Date.now() + 15*24*60*60*1000).toISOString()),
    supabase.from('return_sessions').select('*', { count: 'exact', head: true }).eq('shop_id', id)
  ])

  // 3. Fetch History Tables
  const { data: payments } = await supabase.from('payment_requests').select('*').eq('shop_id', id).order('submitted_at', { ascending: false })
  const { data: alerts } = await supabase.from('alerts').select('*, medicines:medicine_id(name, batch_number)').eq('shop_id', id).order('sent_at', { ascending: false }).limit(20)
  const { data: returns } = await supabase.from('return_sessions').select('*').eq('shop_id', id).order('generated_at', { ascending: false, nullsFirst: false })

  const stats = {
    totalMeds: totalMeds || 0,
    exp60: exp60 || 0,
    exp30: exp30 || 0,
    exp15: exp15 || 0,
    returnCount: returnCount || 0
  }

  return (
    <AdminLayout>
      <ShopClient 
        shop={shop} 
        stats={stats} 
        payments={payments || []} 
        alerts={alerts || []} 
        returns={returns || []} 
      />
    </AdminLayout>
  )
}
