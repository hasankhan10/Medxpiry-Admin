import React from 'react'
import AdminLayout from '../components/AdminLayout'
import { supabase } from '../lib/supabase'

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

  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard Overview</h1>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
         {[
           { label: 'Total Shops', value: totalShops || 0, color: 'text-blue-600', icon: '🏪' },
           { label: 'Active', value: activeShops || 0, color: 'text-green-600', icon: '✅' },
           { label: 'On Trial', value: trialShops || 0, color: 'text-yellow-600', icon: '⏳' },
           { label: 'Pending Payments', value: pendingPayments || 0, color: 'text-red-600', icon: '💳' },
           { label: 'Monthly Revenue', value: `₹${revenue}`, color: 'text-[#1E7A4A]', icon: '📈' },
         ].map((stat, i) => (
           <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
              <span className="text-3xl mb-3">{stat.icon}</span>
              <p className="text-sm text-gray-500 font-semibold uppercase">{stat.label}</p>
              <h3 className={`text-4xl font-bold mt-1 ${stat.color}`}>{stat.value}</h3>
           </div>
         ))}
      </div>

      {/* ACTIVITY FEED */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <span>⚡</span> Recent Admin Activity
        </h2>
        
        {recentActions && recentActions.length > 0 ? (
          <div className="space-y-4">
            {recentActions.map((action) => (
              <div key={action.id} className="flex gap-4 p-4 rounded-lg bg-gray-50 items-start">
                <div className="bg-gray-200 rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0 text-xl">
                  {action.action_type === 'extend_subscription' ? '📅' :
                   action.action_type === 'approve_payment' ? '✨' :
                   action.action_type === 'reject_payment' ? '❌' :
                   action.action_type === 'send_push' ? '📣' : '⚙️'}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{action.action_type}</p>
                  <p className="text-sm text-gray-700 mt-1">{action.details}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(action.performed_at).toLocaleString('en-IN', {
                      dateStyle: 'medium', timeStyle: 'short'
                    })} • Target ID: {action.target_id || 'System'}
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
