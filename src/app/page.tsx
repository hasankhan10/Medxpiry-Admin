import React from 'react'
import AdminLayout from '../components/AdminLayout'
import { supabase } from '../lib/supabase'
import DashboardStats from '../components/DashboardStats'

export const revalidate = 0 // always fresh

export default async function DashboardOverview() {
  // Fetch Stats
  const [{ count: totalShops }, { count: activeShops }, { count: trialShops }, { count: pendingPayments }] = await Promise.all([
    supabase.from('shops').select('*', { count: 'exact', head: true }),
    supabase.from('shops').select('*', { count: 'exact', head: true }).eq('subscription_status', 'active'),
    supabase.from('shops').select('*', { count: 'exact', head: true }).eq('subscription_status', 'trial'),
    supabase.from('payment_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending')
  ])

  // Fetch Revenue (Approved this month)
  const today = new Date()
  const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString()
  
  const { data: approvedThisMonth } = await supabase
    .from('payment_requests')
    .select('amount')
    .eq('status', 'approved')
    .gte('submitted_at', firstOfMonth)

  const revenue = approvedThisMonth?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0

  // Fetch Activity Feed
  const { data: recentActions } = await supabase
    .from('admin_actions')
    .select('*')
    .order('performed_at', { ascending: false })
    .limit(10)

  const stats = [
    { label: 'Total Shops', value: totalShops || 0, color: 'text-blue-500', icon: '🏪' },
    { label: 'Active', value: activeShops || 0, color: 'text-emerald-500', icon: '💎' },
    { label: 'On Trial', value: trialShops || 0, color: 'text-amber-500', icon: '⏳' },
    { label: 'Pending Payouts', value: pendingPayments || 0, color: 'text-orange-500', icon: '💰' },
    { label: 'Est. Revenue', value: `₹${revenue}`, color: 'text-indigo-600', icon: '📈' },
  ]

  return (
    <AdminLayout>
      <div className="flex flex-col gap-2 mb-10">
        <h1 className="text-4xl font-black text-[#0F1117] tracking-tight">System Overview</h1>
        <p className="text-gray-500 font-medium">Monitoring your health-tech ecosystem in real-time.</p>
      </div>

      <DashboardStats stats={stats} />

      <div className="bg-white rounded-3xl shadow-xl shadow-[#00000005] border border-gray-50 p-8 md:p-10">
        <h2 className="text-2xl font-black text-[#0F1117] mb-8 flex items-center gap-3">
          <span className="w-10 h-10 bg-gray-50 flex items-center justify-center rounded-xl">⚡</span>
          Recent Operations
        </h2>
        
        {recentActions && recentActions.length > 0 ? (
          <div className="space-y-4">
            {recentActions.map((action) => (
              <div key={action.id} className="flex gap-4 p-4 rounded-lg bg-gray-50 items-start hover:bg-gray-100 transition-colors cursor-default">
                <div className="bg-white rounded-full w-10 h-10 flex items-center justify-center shadow-sm flex-shrink-0 text-xl">
                  {action.action_type === 'extend_subscription' ? '📅' :
                   action.action_type === 'approve_payment' ? '✨' :
                   action.action_type === 'reject_payment' ? '❌' :
                   action.action_type === 'manual_push' ? '📣' : '⚙️'}
                </div>
                <div>
                  <p className="font-bold text-gray-900 capitalize">{action.action_type.replace('_', ' ')}</p>
                  <p className="text-sm text-gray-600 mt-0.5">{action.note}</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-2 bg-white px-2 py-0.5 rounded-full inline-block border border-gray-100">
                    {new Date(action.performed_at).toLocaleString('en-IN', {
                      dateStyle: 'medium', timeStyle: 'short'
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-gray-500">
            No admin actions logged recently.
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
