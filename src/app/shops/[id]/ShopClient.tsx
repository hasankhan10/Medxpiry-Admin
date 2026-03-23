'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { extendSubscription, setTrialPeriod, suspendShop, reactivateShop, sendPushNotification } from '@/app/actions'
import LoadingButton from '@/components/LoadingButton'

type ShopProps = {
  shop: any
  stats: any
  payments: any[]
  alerts: any[]
  returns: any[]
}

export default function ShopClient({ shop, stats, payments, alerts, returns }: ShopProps) {
  const router = useRouter()
  const [loadingAction, setLoadingAction] = useState<string | null>(null)
  const [pushTitle, setPushTitle] = useState('')
  const [pushBody, setPushBody] = useState('')
  const [trialDays, setTrialDays] = useState('14')
  const [imgModal, setImgModal] = useState<string | null>(null)

  const handleAction = async (actionKey: string, actionFn: () => Promise<void>, successMsg: string) => {
    if (!confirm('Are you sure you want to perform this action?')) return
    
    setLoadingAction(actionKey)
    try {
      await actionFn()
      alert(successMsg)
      router.refresh()
    } catch (err: any) {
      alert(`Error: ${err.message}`)
    } finally {
      setLoadingAction(null)
    }
  }

  const handleSendPush = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoadingAction('push')
    try {
      await sendPushNotification(shop.id, pushTitle, pushBody)
      alert('Push notification sent to shop device.')
      setPushTitle('')
      setPushBody('')
      router.refresh()
    } catch (err: any) {
      alert(`Failed to send push: ${err.message}`)
    } finally {
      setLoadingAction(null)
    }
  }

  const dt = (d: string) => new Date(d).toLocaleDateString('en-IN', { dateStyle: 'medium' })

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* HEADER / INFO GRID */}
      <div className="bg-white p-8 rounded-3xl shadow-xl shadow-[#00000005] border border-gray-50 flex flex-col md:flex-row gap-8 justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">{shop.shop_name}</h1>
            <span className={`uppercase font-black text-[10px] tracking-widest px-3 py-1 rounded-full border 
              ${shop.subscription_status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'}
            `}>
              {shop.subscription_status}
            </span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-12 gap-y-6 text-sm mt-10">
             <div><p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mb-1">Owner Name</p><p className="font-bold text-gray-800 text-lg">{shop.owner_name}</p></div>
             <div><p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mb-1">Contact Phone</p><p className="font-bold text-gray-800 text-lg">{shop.owner_phone}</p></div>
             <div><p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mb-1">City / Region</p><p className="font-bold text-gray-800 text-lg">{shop.city}</p></div>
             <div><p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mb-1">System Joined</p><p className="font-bold text-gray-800">{dt(shop.created_at)}</p></div>
             <div><p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mb-1">Status Expiry</p><p className="font-bold text-[#C84B2F]">{dt(shop.subscription_ends_at || shop.trial_ends_at)}</p></div>
          </div>
        </div>

        {/* QUICK ACTIONS */}
        <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100 min-w-[340px] shadow-inner">
          <h3 className="font-black text-gray-900 mb-6 uppercase text-[10px] tracking-[0.2em] opacity-50">Quick Command Center</h3>
          <div className="flex flex-col gap-3">
             <LoadingButton 
                isLoading={loadingAction === 'extend'} 
                onClick={() => handleAction('extend', () => extendSubscription(shop.id, 30), 'Extended 30 days')}
             >
               Extend 30 Days (Bonus)
             </LoadingButton>

             {shop.subscription_status === 'suspended' ? (
               <LoadingButton 
                  variant="success"
                  isLoading={loadingAction === 'status'} 
                  onClick={() => handleAction('status', () => reactivateShop(shop.id), 'Shop active')}
               >
                 Reactivate Shop Account
               </LoadingButton>
             ) : (
               <LoadingButton 
                  variant="danger"
                  isLoading={loadingAction === 'status'} 
                  onClick={() => handleAction('status', () => suspendShop(shop.id), 'Shop suspended')}
               >
                 Suspend Shop Access
               </LoadingButton>
             )}
          </div>
          
          <div className="my-8 h-[1px] bg-gray-200" />
          
          <div className="flex flex-col gap-3">
             <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Special Grant (Days)</h4>
             <div className="flex gap-2">
               <input 
                 type="number" 
                 value={trialDays} 
                 onChange={e => setTrialDays(e.target.value)} 
                 className="w-20 text-md font-bold text-center bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#C84B2F]/20 focus:outline-none transition-all text-black"
               />
               <LoadingButton 
                 variant="ghost"
                 className="flex-1"
                 isLoading={loadingAction === 'trial'} 
                 onClick={() => handleAction('trial', () => setTrialPeriod(shop.id, parseInt(trialDays)), `Trial set to ${trialDays} days`)}
               >
                 Set Period
               </LoadingButton>
             </div>
          </div>
          
          <div className="my-8 h-[1px] bg-gray-200" />

          <form onSubmit={handleSendPush} className="flex flex-col gap-3">
             <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Direct Push Notification</h4>
             <input type="text" placeholder="Title (Max 50 characters)" value={pushTitle} onChange={e=>setPushTitle(e.target.value)} required maxLength={50} className="w-full text-sm font-semibold p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#C84B2F]/20 focus:outline-none transition-all text-black" />
             <input type="text" placeholder="Message content..." value={pushBody} onChange={e=>setPushBody(e.target.value)} required maxLength={120} className="w-full text-sm font-semibold p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#C84B2F]/20 focus:outline-none transition-all text-black" />
             <LoadingButton 
                variant="secondary"
                isLoading={loadingAction === 'push'} 
                type="submit" 
                className="mt-2"
             >
               Send Immediate Alert
             </LoadingButton>
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
