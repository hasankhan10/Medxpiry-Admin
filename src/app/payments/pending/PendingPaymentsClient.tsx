'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { approvePayment, rejectPayment } from '@/app/actions'

type RequestItem = {
  id: string
  shop_id: string
  amount: number
  upi_ref_number: string
  screenshot_url: string
  submitted_at: string
  shops: { shop_name: string, owner_name: string, owner_phone: string, city: string }
}

export default function PendingPaymentsClient({ initialRequests }: { initialRequests: RequestItem[] }) {
  const [requests, setRequests] = useState<RequestItem[]>(initialRequests)
  
  const [modalImage, setModalImage] = useState<string | null>(null)
  const [approveModal, setApproveModal] = useState<RequestItem | null>(null)
  const [rejectModal, setRejectModal] = useState<RequestItem | null>(null)

  const [months, setMonths] = useState(1)
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{msg: string, type: 'success' | 'error'} | null>(null)

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleApprove = async () => {
    if (!approveModal) return
    setLoading(true)
    try {
      await approvePayment(approveModal.id, approveModal.shop_id, months)
      setRequests(prev => prev.filter(r => r.id !== approveModal.id))
      showToast('Approved. Active subscription extended.', 'success')
      setApproveModal(null)
      setMonths(1)
    } catch (err: any) {
      showToast(err.message || 'Error approving', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleReject = async () => {
    if (!rejectModal) return
    if (!reason.trim()) {
      showToast('Reason is required', 'error')
      return
    }
    setLoading(true)
    try {
      await rejectPayment(rejectModal.id, rejectModal.shop_id, reason.trim())
      setRequests(prev => prev.filter(r => r.id !== rejectModal.id))
      showToast('Rejected. Owner notified.', 'success')
      setRejectModal(null)
      setReason('')
    } catch (err: any) {
      showToast(err.message || 'Error rejecting', 'error')
    } finally {
      setLoading(false)
    }
  }

  const getTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    if (hours < 1) return 'Just now'
    if (hours < 24) return `${hours}h ago`
    return `${Math.floor(hours / 24)}d ago`
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Pending Approvals</h1>
      <p className="text-gray-500 mb-8">Review and verify UPI payments submitted by shop owners.</p>
      
      {toast && (
        <div className={`fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 animate-bounce ${toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'} text-white font-bold`}>
          {toast.msg}
        </div>
      )}

      {requests.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-xl shadow-sm border border-gray-100 text-gray-400">
          <span className="text-4xl block mb-4">🎉</span>
          <h2 className="text-xl font-bold text-gray-600">All caught up!</h2>
          <p>No pending payment requests at the moment.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {requests.map(req => (
            <div key={req.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col md:flex-row">
              {/* Image Thumbnail */}
              <div 
                className="w-full md:w-64 h-48 md:h-auto bg-gray-100 cursor-pointer overflow-hidden relative group"
                onClick={() => setModalImage(req.screenshot_url)}
              >
                <img src={req.screenshot_url} alt="Proof" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 flex items-center justify-center transition-all">
                  <span className="text-white opacity-0 group-hover:opacity-100 font-bold bg-black bg-opacity-50 px-3 py-1 rounded">🔍 Zoom</span>
                </div>
              </div>

              {/* Data payload */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                 <div>
                   <div className="flex justify-between items-start mb-2">
                     <Link href={`/shops/${req.shop_id}`} className="hover:underline">
                       <h3 className="text-xl font-bold text-[#C84B2F]">{req.shops?.shop_name || 'Unknown Shop'}</h3>
                     </Link>
                     <span className="text-sm font-semibold bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                       {getTimeAgo(req.submitted_at)}
                     </span>
                   </div>
                   
                   <p className="text-gray-600 text-sm mb-4">
                     {req.shops?.owner_name} • {req.shops?.owner_phone} • {req.shops?.city}
                   </p>

                   <div className="bg-orange-50 p-4 rounded-lg flex items-center justify-between mb-6">
                     <div>
                       <p className="text-xs text-orange-800 uppercase font-semibold">Amount Claimed</p>
                       <p className="text-2xl font-bold text-orange-600">₹{req.amount}</p>
                     </div>
                     <div className="text-right">
                       <p className="text-xs text-orange-800 uppercase font-semibold">UTR / Reference No.</p>
                       <p className="text-lg font-mono text-gray-800">{req.upi_ref_number || 'Not provided'}</p>
                     </div>
                   </div>
                 </div>

                 {/* Actions */}
                 <div className="flex gap-4">
                   <button 
                     className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg shadow-sm transition"
                     onClick={() => setApproveModal(req)}
                   >
                     Approve Setup
                   </button>
                   <button 
                     className="flex-1 bg-white hover:bg-red-50 text-red-600 border border-red-200 font-bold py-3 rounded-lg transition"
                     onClick={() => setRejectModal(req)}
                   >
                     Reject Proof
                   </button>
                 </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FULL IMAGE MODAL */}
      {modalImage && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <button className="absolute top-6 right-6 text-white text-4xl" onClick={() => setModalImage(null)}>✕</button>
          <img src={modalImage} className="max-w-full max-h-full object-contain" alt="Full Screen Proof" />
          <a href={modalImage} target="_blank" download className="absolute bottom-6 bg-white text-black font-bold px-6 py-3 rounded-lg">
            Download for Records
          </a>
        </div>
      )}

      {/* APPROVE MODAL */}
      {approveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Approve Payment</h2>
            <p className="text-gray-600 mb-6">Verify ₹{approveModal.amount} from {approveModal.shops.shop_name}?</p>
            
            <label className="block text-sm font-bold text-gray-700 mb-2">Months to Credit:</label>
            <select 
              className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-8 bg-gray-50 focus:outline-none focus:border-green-500"
              value={months}
              onChange={(e) => setMonths(Number(e.target.value))}
            >
              <option value={1}>1 Month</option>
              <option value={2}>2 Months</option>
              <option value={3}>3 Months</option>
              <option value={6}>6 Months</option>
              <option value={12}>12 Months (1 Year)</option>
            </select>

            <div className="flex gap-4">
              <button 
                className="flex-1 border border-gray-300 text-gray-600 font-bold py-3 rounded-lg"
                onClick={() => setApproveModal(null)}
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                className="flex-1 bg-green-600 text-white font-bold py-3 rounded-lg"
                onClick={handleApprove}
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Confirm Approval'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECT MODAL */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Reject Request</h2>
            <p className="text-gray-600 mb-6 font-semibold">{rejectModal.shops.shop_name}</p>
            
            <label className="block text-sm font-bold text-gray-700 mb-2">Reason for rejection (Required):</label>
            
            {/* Quick Chips */}
            <div className="flex flex-wrap gap-2 mb-3">
              {['Screenshot unclear', 'Wrong amount', 'Duplicate submission', 'UTR not matched'].map(chip => (
                <button 
                  key={chip}
                  onClick={() => setReason(chip)}
                  className="bg-red-50 text-red-700 border border-red-200 text-xs px-3 py-1 rounded-full font-semibold hover:bg-red-100"
                >
                  {chip}
                </button>
              ))}
            </div>

            <textarea 
              className="w-full border border-red-300 focus:outline-none focus:border-red-500 rounded-lg px-4 py-3 mb-8 bg-red-50 min-h-[100px]"
              placeholder="Explain why this proof is invalid..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
            />

            <div className="flex gap-4">
              <button 
                className="flex-1 border border-gray-300 text-gray-600 font-bold py-3 rounded-lg"
                onClick={() => { setRejectModal(null); setReason(''); }}
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                className="flex-1 bg-red-600 text-white font-bold py-3 rounded-lg disabled:opacity-50"
                onClick={handleReject}
                disabled={loading || !reason.trim()}
              >
                {loading ? 'Processing...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
