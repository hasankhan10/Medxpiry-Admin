'use client'

import React, { useState, useEffect } from 'react'
import AdminLayout from '@/components/AdminLayout'
import { sendPushNotification } from '@/app/actions'
import { supabase } from '@/lib/supabase'

export default function ManualPushPage() {
  const [shops, setShops] = useState<{id: string, shop_name: string, owner_phone: string}[]>([])
  
  const [targetShop, setTargetShop] = useState('all')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [confirmAll, setConfirmAll] = useState(false)
  
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('')

  useEffect(() => {
    // Fetch active shops for the dropdown
    supabase.from('shops').select('id, shop_name, owner_phone').eq('subscription_status', 'active')
      .then(({ data }) => { if (data) setShops(data) })
  }, [])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (targetShop === 'all' && !confirmAll) {
      alert("Please confirm that you want to broadcast to ALL shops.")
      return
    }

    setLoading(true)
    setStatus('Sending...')
    try {
      await sendPushNotification(targetShop, title, body)
      setStatus('Successfully sent!')
      setTitle('')
      setBody('')
      setConfirmAll(false)
    } catch (err: any) {
      setStatus(`Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Push Notifications</h1>
        <p className="text-gray-500 mb-8">Send manual push campaigns to devices</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* FORM */}
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold mb-6">Compose Message</h2>
            <form onSubmit={handleSend} className="space-y-6">
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Target Audience</label>
                <select 
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-gray-50 focus:outline-none focus:border-[#C84B2F]"
                  value={targetShop}
                  onChange={(e) => setTargetShop(e.target.value)}
                >
                  <option value="all">📢 ALL ACTIVE SHOPS ({shops.length})</option>
                  <optgroup label="Individual Shops">
                    {shops.map(shop => (
                      <option key={shop.id} value={shop.id}>{shop.shop_name} ({shop.owner_phone})</option>
                    ))}
                  </optgroup>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Title <span className="text-gray-400 font-normal">({title.length}/50)</span></label>
                <input 
                  type="text"
                  maxLength={50}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-[#C84B2F]"
                  placeholder="e.g. Server Maintenance"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Body <span className="text-gray-400 font-normal">({body.length}/120)</span></label>
                <textarea 
                  maxLength={120}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-[#C84B2F] min-h-[100px]"
                  placeholder="e.g. MedExpiry will be offline for 15 minutes at midnight."
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  required
                />
              </div>
              
              {targetShop === 'all' && (
                <div className="bg-orange-50 p-4 rounded-lg flex items-center gap-3 border border-orange-200">
                  <input 
                    type="checkbox" 
                    id="confirm" 
                    className="w-5 h-5 accent-[#C84B2F]"
                    checked={confirmAll}
                    onChange={(e) => setConfirmAll(e.target.checked)}
                  />
                  <label htmlFor="confirm" className="text-orange-800 font-bold text-sm">
                    I confirm I want to broadast this message to ALL {shops.length} active registered shops immediately.
                  </label>
                </div>
              )}

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-[#C84B2F] hover:bg-[#A83D25] text-white font-bold py-4 rounded-lg shadow-sm transition disabled:opacity-50"
              >
                {loading ? 'Transmitting via Expo...' : 'Fire Push Notification 🚀'}
              </button>
              
              {status && <p className="text-center font-bold text-sm text-[#C84B2F]">{status}</p>}
            </form>
          </div>

          {/* PREVIEW */}
          <div>
            <h2 className="text-xl font-bold mb-6 text-gray-400">Device Preview</h2>
            <div className="bg-gray-100 p-8 rounded-3xl border-8 border-gray-800 shadow-xl max-w-sm mx-auto h-[600px] flex items-start pt-16 relative overflow-hidden">
               {/* Phone Notch */}
               <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-800 rounded-b-xl z-10"></div>
               
               {/* Wallpaper Fake */}
               <div className="absolute inset-0 bg-blue-50 opacity-50"></div>

               {/* iOS style Push Card */}
               <div className="relative w-full bg-slate-50/80 backdrop-blur-md p-4 rounded-2xl shadow-xl flex gap-3 border border-white/40">
                 <div className="bg-[#C84B2F] w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-bold leading-none tracking-tighter">ME</span>
                 </div>
                 <div className="flex-1 pt-1 opacity-90 overflow-hidden text-ellipsis">
                   <div className="flex justify-between items-center mb-1">
                     <h4 className="font-semibold text-sm text-gray-900 leading-tight tracking-tight">MedExpiry</h4>
                     <span className="text-xs text-gray-500">now</span>
                   </div>
                   <h5 className="font-bold text-gray-900 text-sm leading-tight mb-1 truncate">{title || 'Message Title'}</h5>
                   <p className="text-sm text-gray-600 leading-snug">{body || 'The preview of your message body will appear right here as you type.'}</p>
                 </div>
               </div>
            </div>
          </div>

        </div>
      </div>
    </AdminLayout>
  )
}
