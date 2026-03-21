import React from 'react'
import AdminLayout from '@/components/AdminLayout'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { suspendShop, reactivateShop, setTrialPeriod } from '../actions'

export const revalidate = 0

export default async function ShopsPage() {
  const { data: shops, error } = await supabase
    .from('shops')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return (
      <AdminLayout>
        <div className="bg-red-50 text-red-600 p-4 rounded-md">Error loading shops: {error.message}</div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Shop Management</h1>
        <div className="bg-white px-4 py-2 rounded-lg shadow-sm border text-sm font-semibold text-gray-500">
           Total: {shops?.length || 0} Pharmacies
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Shop Name</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Owner / Phone</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {shops?.map((shop) => (
              <tr key={shop.id} className="hover:bg-gray-50 transition-colors group">
                <td className="px-6 py-4">
                  <Link href={`/shops/${shop.id}`} className="font-bold text-gray-900 hover:text-[#C84B2F] transition-colors">
                    {shop.shop_name}
                  </Link>
                  <p className="text-xs text-gray-400 mt-1">{shop.city || 'No City'}</p>
                </td>
                <td className="px-6 py-4">
                  <p className="font-semibold text-gray-800">{shop.owner_name}</p>
                  <p className="text-sm text-gray-500">+91 {shop.owner_phone}</p>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${stateColors[shop.subscription_status]}`}>
                      {shop.subscription_status?.toUpperCase()}
                    </span>
                    {shop.subscription_status === 'trial' && (
                       <p className="text-[10px] text-gray-400 font-medium">Trial ends: {new Date(shop.trial_ends_at).toLocaleDateString()}</p>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                   <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {shop.subscription_status === 'suspended' ? (
                        <form action={async () => { 'use server'; await reactivateShop(shop.id) }}>
                          <button className="text-xs bg-green-50 text-green-600 px-3 py-1.5 rounded font-bold hover:bg-green-600 hover:text-white transition">Activate</button>
                        </form>
                      ) : (
                        <form action={async () => { 'use server'; await suspendShop(shop.id) }}>
                          <button className="text-xs bg-red-50 text-red-600 px-3 py-1.5 rounded font-bold hover:bg-red-600 hover:text-white transition">Suspend</button>
                        </form>
                      )}
                      
                      <form action={async () => { 'use server'; await setTrialPeriod(shop.id, 7) }}>
                         <button className="text-xs bg-yellow-50 text-yellow-700 px-3 py-1.5 rounded font-bold hover:bg-yellow-600 hover:text-white transition">+7 Trial</button>
                      </form>
                      
                      <Link href={`/shops/${shop.id}`} className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded font-bold hover:bg-gray-800 hover:text-white transition">Details</Link>
                   </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  )
}

const stateColors: Record<string, string> = {
  active: 'bg-green-50 text-green-700 border-green-200',
  trial: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  suspended: 'bg-red-50 text-red-700 border-red-200',
  expired: 'bg-gray-50 text-gray-700 border-gray-200'
}
