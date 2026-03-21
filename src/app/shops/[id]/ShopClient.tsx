'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { extendSubscription, suspendShop, reactivateShop, sendPushNotification } from '@/app/actions'

type ShopProps = {
  shop: any
  stats: any
  payments: any[]
  alerts: any[]
  returns: any[]
}

export default function ShopClient({ shop, stats, payments, alerts, returns }: ShopProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [pushTitle, setPushTitle] = useState('')
  const [pushBody, setPushBody] = useState('')
  const [imgModal, setImgModal] = useState<string | null>(null)

  const handleAction = async (actionFn: () => Promise<void>, successMsg: string) => {
    if (!confirm('Are you sure you want to perform this action?')) return
    
    setLoading(true)
    try {
      await actionFn()
      alert(successMsg)
      router.refresh()
    } catch (err: any) {
      alert(`Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleSendPush = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await sendPushNotification(shop.id, pushTitle, pushBody)
      alert('Push notification sent to shop device.')
      setPushTitle('')
      setPushBody('')
      router.refresh()
    } catch (err: any) {
      alert(`Failed to send push: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const dt = (d: string) => new Date(d).toLocaleDateString('en-IN', { dateStyle: 'medium' })

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      
      {/* HEADER / INFO GRID */}
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-8 justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{shop.shop_name}</h1>
          <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm mt-6">
             <div><span className="text-gray-500 block">Owner Name</span><span className="font-semibold text-gray-800">{shop.owner_name}</span></div>
             <div><span className="text-gray-500 block">Phone</span><span className="font-semibold text-gray-800">{shop.owner_phone}</span></div>
             <div><span className="text-gray-500 block">City</span><span className="font-semibold text-gray-800">{shop.city}</span></div>
             <div><span className="text-gray-500 block">Joined</span><span className="font-semibold text-gray-800">{dt(shop.created_at)}</span></div>
             <div><span className="text-gray-500 block">Status</span>
               <span className={`uppercase font-bold text-xs px-2 py-1 rounded inline-block mt-1
                 ${shop.subscription_status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
               `}>
                 {shop.subscription_status}
               </span>
             </div>
             <div><span className="text-gray-500 block">Sub Ends</span>
               <span className="font-semibold text-gray-800">{dt(shop.subscription_ends_at || shop.trial_ends_at)}</span>
             </div>
          </div>
        </div>

        {/* QUICK ACTIONS */}
        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 min-w-[300px]">
          <h3 className="font-bold text-gray-800 mb-4 uppercase text-xs tracking-wider">Quick Actions</h3>
          <div className="flex flex-col gap-3">
             <button disabled={loading} onClick={() => handleAction(() => extendSubscription(shop.id, 30), 'Extended 30 days')} className="bg-[#C84B2F] text-white px-4 py-2 rounded shadow-sm text-sm font-bold hover:bg-[#A83D25] transition">Extend 30 Days (Bonus)</button>
             {shop.subscription_status === 'suspended' ? (
               <button disabled={loading} onClick={() => handleAction(() => reactivateShop(shop.id), 'Shop active')} className="bg-green-600 text-white px-4 py-2 rounded shadow-sm text-sm font-bold hover:bg-green-700 transition">Reactivate Shop</button>
             ) : (
               <button disabled={loading} onClick={() => handleAction(() => suspendShop(shop.id), 'Shop suspended')} className="bg-red-600 text-white px-4 py-2 rounded shadow-sm text-sm font-bold hover:bg-red-700 transition">Suspend Shop</button>
             )}
          </div>
          <hr className="my-4 border-gray-200" />
          <form onSubmit={handleSendPush} className="flex flex-col gap-2">
             <h4 className="text-xs font-bold text-gray-600 mb-1">Inline Push Message</h4>
             <input type="text" placeholder="Title (Max 50)" value={pushTitle} onChange={e=>setPushTitle(e.target.value)} required maxLength={50} className="w-full text-sm p-2 border border-gray-300 rounded focus:border-[#C84B2F] focus:outline-none" />
             <input type="text" placeholder="Body (Max 120)" value={pushBody} onChange={e=>setPushBody(e.target.value)} required maxLength={120} className="w-full text-sm p-2 border border-gray-300 rounded focus:border-[#C84B2F] focus:outline-none" />
             <button disabled={loading} type="submit" className="w-full mt-1 bg-gray-800 text-white text-xs font-bold py-2 rounded hover:bg-black transition">Broadcast Push Alert</button>
          </form>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 font-semibold uppercase">Total Medicines</p>
          <h3 className="text-3xl font-bold mt-1 text-gray-800">{stats.totalMeds}</h3>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-orange-400">
          <p className="text-sm text-gray-500 font-semibold uppercase">Expiring 60 / 30 / 15</p>
          <h3 className="text-2xl font-bold mt-2 text-gray-800 font-mono tracking-tight">
            {stats.exp60} <span className="text-gray-300 font-light">/</span> {stats.exp30} <span className="text-gray-300 font-light">/</span> <span className="text-red-500">{stats.exp15}</span>
          </h3>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 font-semibold uppercase">Return Sessions</p>
          <h3 className="text-3xl font-bold mt-1 text-gray-800">{stats.returnCount}</h3>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
           <p className="text-sm text-gray-500 font-semibold uppercase">Push Notifications</p>
           <h3 className="text-3xl font-bold mt-1 text-gray-800">{alerts.length}</h3>
        </div>
      </div>

      {/* TABLES TABS / STACKS */}
      
      {/* 1. Payment History */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <h2 className="font-bold text-gray-800">Payment History</h2>
        </div>
        {payments.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No payment receipts found.</div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600 font-bold uppercase text-xs">
              <tr>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Amount</th>
                <th className="px-6 py-3">Ref UTR</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Note</th>
                <th className="px-6 py-3 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {payments.map((p: any) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-mono">{dt(p.submitted_at)}</td>
                  <td className="px-6 py-4 font-bold text-orange-600">₹{p.amount}</td>
                  <td className="px-6 py-4 font-mono text-gray-600">{p.upi_ref_number || '-'}</td>
                  <td className="px-6 py-4 uppercase font-bold text-[10px]">{p.status}</td>
                  <td className="px-6 py-4 text-gray-500 italic">{(p.status === 'approved' && p.months_credited) ? `+${p.months_credited} M` : '-'}</td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => setImgModal(p.screenshot_url)} className="text-blue-500 font-bold hover:underline">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* 2. Alert History */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between">
          <h2 className="font-bold text-gray-800">Alert Notification Log</h2>
          <span className="text-xs text-gray-500">Last 20</span>
        </div>
        {alerts.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No pushes sent yet.</div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600 font-bold uppercase text-xs">
              <tr>
                <th className="px-6 py-3">Sent Time</th>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3">Medicine Context</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {alerts.map((a: any) => (
                <tr key={a.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 font-mono text-gray-600">
                    {new Date(a.sent_at).toLocaleString('en-IN', { dateStyle:'medium', timeStyle:'short' })}
                  </td>
                  <td className="px-6 py-3 font-semibold uppercase text-xs">{a.type}</td>
                  <td className="px-6 py-3 text-gray-600 font-medium">{a.medicines ? `${a.medicines.name} (Batch: ${a.medicines.batch_number})` : '-'}</td>
                  <td className="px-6 py-3 font-bold text-[10px] text-green-600 uppercase">{a.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
      
      {/* 3. Return Sessions */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between">
          <h2 className="font-bold text-gray-800">Return Sessions Created</h2>
          <span className="text-xs text-gray-500">All Time</span>
        </div>
        {returns.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Shop hasn't created a return framework yet.</div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600 font-bold uppercase text-xs">
              <tr>
                <th className="px-6 py-3">Date Generated</th>
                <th className="px-6 py-3">Items Returned</th>
                <th className="px-6 py-3">Distributor</th>
                <th className="px-6 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {returns.map((r: any) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 font-mono border-l-4 border-l-transparent hover:border-l-[#C84B2F]">
                    {new Date(r.generated_at).toLocaleString('en-IN')}
                  </td>
                  <td className="px-6 py-3 font-bold text-gray-800">{r.total_items} items</td>
                  <td className="px-6 py-3 text-gray-600">{r.distributor_name || 'N/A'}</td>
                  <td className="px-6 py-3 text-right">
                    <span className={`uppercase font-bold text-[10px] px-2 py-1 rounded 
                      ${r.status === 'sent' ? 'bg-green-100 text-green-800' : 
                        r.status === 'completed' ? 'bg-blue-100 text-blue-800' : 'bg-gray-200 text-gray-800'}
                    `}>
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* FULL IMAGE MODAL */}
      {imgModal && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <button className="absolute top-6 right-6 text-white text-4xl" onClick={() => setImgModal(null)}>✕</button>
          <img src={imgModal} className="max-w-full max-h-full object-contain" alt="Receipt Proof" />
        </div>
      )}

    </div>
  )
}
