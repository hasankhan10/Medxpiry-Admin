'use client'

import React, { useState, useEffect } from 'react'
import AdminLayout from '@/components/AdminLayout'
import { sendPushNotification, fetchReachableShops } from '@/app/actions'
import LoadingButton from '@/components/LoadingButton'

export default function ManualPushPage() {
  const [shops, setShops] = useState<{id: string, shop_name: string, owner_phone: string}[]>([])
  const [targetShop, setTargetShop] = useState('all')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [confirmAll, setConfirmAll] = useState(false)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('')

  useEffect(() => {
    const loadShops = async () => {
      try {
        const data = await fetchReachableShops()
        if (data) setShops(data)
      } catch (err: any) {
        console.error('Failed to load reachable shops securely:', err.message)
      }
    }
    loadShops()
  }, [])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (targetShop === 'all' && !confirmAll) {
      alert("Please check the 'I confirm' box to broadcast to ALL shops.")
      return
    }

    setLoading(true)
    setStatus('')
    try {
      await sendPushNotification(targetShop, title, body)
      setStatus(`✅ Success: Message broadcast to ${targetShop === 'all' ? shops.length : '1'} shop(s).`)
      setTitle('')
      setBody('')
      setConfirmAll(false)
    } catch (err: any) {
      setStatus(`❌ Dispatch Failed: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex flex-col gap-2 mb-10">
          <h1 className="text-4xl font-black text-[#0F1117] tracking-tight">Push Campaigns</h1>
          <p className="text-gray-500 font-medium">Draft and broadcast notifications to individual or group devices.</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* FORM */}
          <div className="lg:col-span-7 bg-white p-8 md:p-10 rounded-3xl shadow-xl shadow-[#00000005] border border-gray-50">
            <h2 className="text-2xl font-black text-[#0F1117] mb-8">Campaign Settings</h2>
            <form onSubmit={handleSend} className="space-y-8">
              
              <div>
                <label className="block text-[10px] font-black tracking-widest text-gray-400 uppercase mb-3">Target Audience</label>
                <select 
                  className="w-full border border-gray-200 rounded-2xl px-5 py-4 bg-gray-50 focus:ring-2 focus:ring-[#C84B2F]/20 focus:outline-none focus:border-[#C84B2F] text-black font-bold transition-all appearance-none"
                  value={targetShop}
                  onChange={(e) => setTargetShop(e.target.value)}
                >
                  <option value="all">📢 ALL REACHABLE SHOPS ({shops.length} devices)</option>
                  <optgroup label="Direct Message (DM)">
                    {shops.map(shop => (
                      <option key={shop.id} value={shop.id}>{shop.shop_name} ({shop.owner_phone})</option>
                    ))}
                  </optgroup>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black tracking-widest text-gray-400 uppercase mb-3">Alert Title <span className="text-gray-400 font-normal">({title.length}/50)</span></label>
                <input 
                  type="text"
                  maxLength={50}
                  className="w-full border border-gray-200 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-[#C84B2F]/20 focus:outline-none focus:border-[#C84B2F] text-black font-bold transition-all"
                  placeholder="e.g. Server Maintenance"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-black tracking-widest text-gray-400 uppercase mb-3">Alert Message <span className="text-gray-400 font-normal">({body.length}/120)</span></label>
                <textarea 
                  maxLength={120}
                  className="w-full border border-gray-200 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-[#C84B2F]/20 focus:outline-none focus:border-[#C84B2F] min-h-[120px] text-black font-semibold transition-all"
                  placeholder="e.g. MedExpiry will be offline for 15 minutes at midnight."
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  required
                />
              </div>
              
              {targetShop === 'all' && (
                <div className="bg-amber-50 p-5 rounded-2xl flex items-center gap-4 border border-amber-100">
                  <input 
                    type="checkbox" 
                    id="confirm" 
                    className="w-6 h-6 rounded-lg accent-[#C84B2F]"
                    checked={confirmAll}
                    onChange={(e) => setConfirmAll(e.target.checked)}
                  />
                  <label htmlFor="confirm" className="text-amber-800 font-bold text-sm leading-tight">
                    I confirm that I want to broadcast this message to ALL {shops.length} registered shops now.
                  </label>
                </div>
              )}

              <div className="pt-2">
                <LoadingButton 
                  type="submit" 
                  isLoading={loading}
                  loadingText="Broadcasting..."
                  className="w-full py-5 text-md"
                >
                  Dispatch Campaign Now 🚀
                </LoadingButton>
              </div>
              
              {status && (
                <div className={`p-4 rounded-xl text-center font-bold text-sm ${status.includes('❌') ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'}`}>
                  {status}
                </div>
              )}
            </form>
          </div>

          {/* PREVIEW */}
          <div className="lg:col-span-5 sticky top-10">
            <h2 className="text-[10px] font-black tracking-widest text-gray-400 uppercase mb-6">Device Preview</h2>
            <div className="bg-gray-100 p-8 rounded-[3rem] border-8 border-gray-900 shadow-2xl max-w-sm mx-auto h-[640px] flex items-start pt-16 relative overflow-hidden ring-1 ring-gray-200">
               {/* Phone Notch */}
               <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-gray-900 rounded-b-3xl z-10"></div>
               
               {/* Wallpaper Fake */}
               <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-blue-100 opacity-60"></div>

               {/* iOS style Push Card */}
               <div className="relative w-full bg-white/60 backdrop-blur-xl p-5 rounded-[2rem] shadow-2xl flex gap-4 border border-white/40 ring-1 ring-black/5 animate-in zoom-in-95 duration-500">
                 <div className="bg-[#C84B2F] w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-[#C84B2F]/20">
                    <span className="text-white text-md font-black leading-none tracking-tighter">ME</span>
                 </div>
                 <div className="flex-1 pt-1 opacity-90 overflow-hidden text-ellipsis">
                   <div className="flex justify-between items-center mb-1">
                     <h4 className="font-black text-xs text-gray-400 leading-tight tracking-[0.1em] uppercase">MedExpiry</h4>
                     <span className="text-[10px] font-bold text-gray-400">now</span>
                   </div>
                   <h5 className="font-black text-gray-900 text-sm leading-tight mb-1 truncate">{title || 'Message Title'}</h5>
                   <p className="text-sm text-gray-600 leading-snug font-medium line-clamp-3">{body || 'The preview of your message body will appear right here as you draft your campaign.'}</p>
                 </div>
               </div>
            </div>
          </div>

        </div>
      </div>
    </AdminLayout>
  )
}
