'use server'

import { cookies } from 'next/headers'

export async function approvePayment(paymentRequestId: string, shopId: string, monthsToCredit: number) {
  const backendUrl = process.env.BACKEND_URL
  const backendKey = process.env.BACKEND_ADMIN_KEY

  const res = await fetch(`${backendUrl}/admin/approve-payment`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': backendKey!
    },
    body: JSON.stringify({ paymentRequestId, shopId, monthsToCredit })
  })

  if (!res.ok) {
    const errorData = await res.json()
    throw new Error(errorData.error || 'Failed to approve payment')
  }

  return await res.json()
}

export async function rejectPayment(paymentRequestId: string, shopId: string, reason: string) {
  const backendUrl = process.env.BACKEND_URL
  const backendKey = process.env.BACKEND_ADMIN_KEY

  const res = await fetch(`${backendUrl}/admin/reject-payment`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': backendKey!
    },
    body: JSON.stringify({ paymentRequestId, shopId, reason })
  })

  if (!res.ok) {
    const errorData = await res.json()
    throw new Error(errorData.error || 'Failed to reject payment')
  }

  return await res.json()
}

import { supabase } from '@/lib/supabase'

export async function getReturnItems(sessionId: string) {
  const { data, error } = await supabase
    .from('return_items')
    .select(`
      id, remaining_qty, return_qty,
      medicines:medicine_id ( name, batch_number, expiry_date, unit )
    `)
    .eq('session_id', sessionId)
    .order('id', { ascending: true })
    
  if (error) throw new Error(error.message)
  return data
}

export async function extendSubscription(shopId: string, days: number) {
  const res = await fetch(`${process.env.BACKEND_URL}/admin/extend-subscription`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.BACKEND_ADMIN_KEY! },
    body: JSON.stringify({ shopId, days })
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Failed to extend subscription')
  }
}

export async function sendPushNotification(shopId: string | 'all', title: string, body: string) {
  if (shopId === 'all') {
    // If "all" is specified, fetch all tokens from Supabase and chunk them manually here
    // But since backend doesn't have a broadcast-all endpoint specifically, we can loop
    // But broadcast is rare, so we can do it effectively server side
    const { data: shops } = await supabase.from('shops').select('id, expo_push_token').neq('expo_push_token', null)
    if (!shops) return
    
    // To keep it simple, we loop backend requests (a scalable backend would have a dedicated block)
    for (const shop of shops) {
       await fetch(`${process.env.BACKEND_URL}/admin/send-push`, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.BACKEND_ADMIN_KEY! },
         body: JSON.stringify({ shopId: shop.id, title, body })
       })
    }
  } else {
    const res = await fetch(`${process.env.BACKEND_URL}/admin/send-push`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.BACKEND_ADMIN_KEY! },
      body: JSON.stringify({ shopId, title, body })
    })
    if (!res.ok) throw new Error('Failed to send push')
  }
}

export async function suspendShop(shopId: string) {
  const { error } = await supabase.from('shops').update({ subscription_status: 'suspended' }).eq('id', shopId)
  if (error) throw new Error(error.message)
}

export async function reactivateShop(shopId: string) {
  const { error } = await supabase.from('shops').update({ subscription_status: 'active' }).eq('id', shopId)
  if (error) throw new Error(error.message)
}

