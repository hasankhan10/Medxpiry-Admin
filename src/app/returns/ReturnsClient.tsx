'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { getReturnItems } from '@/app/actions'

type ReturnSession = {
  id: string
  shop_id: string
  status: string
  total_items: number
  generated_at: string
  distributor_name?: string
  notes?: string
  shops: { shop_name: string, owner_name: string, city: string, owner_phone: string }
}

export default function ReturnsClient({ initialReturns }: { initialReturns: ReturnSession[] }) {
  const [selectedSession, setSelectedSession] = useState<ReturnSession | null>(null)
  const [items, setItems] = useState<any[]>([])
  const [loadingItems, setLoadingItems] = useState(false)

  const handleView = async (session: ReturnSession) => {
    setSelectedSession(session)
    setLoadingItems(true)
    try {
      const data = await getReturnItems(session.id)
      setItems(data || [])
    } catch (err) {
      console.error(err)
      alert("Failed to fetch session items")
      setSelectedSession(null)
    } finally {
      setLoadingItems(false)
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Returns Database</h1>
      <p className="text-gray-500 mb-8">System-wide log of all generated return sessions and drafts.</p>

      {/* SESSIONS TABLE */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs font-bold font-mono">
            <tr>
              <th className="px-6 py-4">Shop Name</th>
              <th className="px-6 py-4">Generated Date</th>
              <th className="px-6 py-4 text-center">Items</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {initialReturns.map((session) => (
              <tr key={session.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <Link href={`/shops/${session.shop_id}`} className="hover:underline">
                    <div className="font-bold text-[#C84B2F]">{session.shops?.shop_name || 'Unknown'}</div>
                  </Link>
                  <div className="text-xs text-gray-500 mt-1">{session.shops?.city} • {session.shops?.owner_phone}</div>
                </td>
                <td className="px-6 py-4 text-gray-600 font-mono text-sm">
                  {new Date(session.generated_at).toLocaleString('en-IN', {
                    dateStyle: 'medium', timeStyle: 'short'
                  })}
                </td>
                <td className="px-6 py-4 text-center font-bold text-gray-800">
                  {session.total_items}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wide
                    ${session.status === 'sent' ? 'bg-green-100 text-green-700' :
                      session.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                      'bg-orange-100 text-orange-700'}`}
                  >
                    {session.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => handleView(session)}
                    className="text-[#C84B2F] hover:text-[#A83D25] font-bold text-sm bg-red-50 hover:bg-red-100 px-4 py-2 rounded transition-colors"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
            {initialReturns.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  No return sessions generated yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ITEMS MODAL */}
      {selectedSession && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
            
            <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-gray-50">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                  Return Detail: {selectedSession.shops?.shop_name}
                </h2>
                <p className="text-gray-500 text-sm font-mono">
                  {new Date(selectedSession.generated_at).toLocaleString('en-IN')}
                </p>
                {(selectedSession.distributor_name || selectedSession.notes) && (
                  <div className="mt-4 p-4 bg-white border border-gray-200 rounded-lg">
                    {selectedSession.distributor_name && (
                      <p className="text-sm"><strong>Distributor:</strong> {selectedSession.distributor_name}</p>
                    )}
                    {selectedSession.notes && (
                      <p className="text-sm mt-1"><strong>Notes:</strong> {selectedSession.notes}</p>
                    )}
                  </div>
                )}
              </div>
              <button 
                onClick={() => setSelectedSession(null)}
                className="w-10 h-10 flex items-center justify-center bg-gray-200 hover:bg-red-500 hover:text-white rounded-full transition-colors font-bold"
              >
                ✕
              </button>
            </div>
            
            <div className="flex-1 overflow-auto p-0">
              {loadingItems ? (
                <div className="flex justify-center items-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C84B2F]"></div>
                </div>
              ) : (
                <table className="w-full text-left">
                  <thead className="bg-[#C84B2F] text-white sticky top-0 uppercase text-xs font-bold tracking-wider z-10">
                    <tr>
                      <th className="px-6 py-4">Medicine Name</th>
                      <th className="px-6 py-4">Batch</th>
                      <th className="px-6 py-4">Expiry</th>
                      <th className="px-6 py-4 text-right">Return Qty</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {items.map((item, index) => (
                      <tr key={index} className="hover:bg-orange-50 transition-colors">
                        <td className="px-6 py-4 font-bold text-gray-900">{item.medicines?.name}</td>
                        <td className="px-6 py-4 text-gray-600 font-mono text-sm">{item.medicines?.batch_number}</td>
                        <td className="px-6 py-4 text-gray-600">
                          {new Date(item.medicines?.expiry_date).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-[#C84B2F] text-lg">
                          {item.return_qty} <span className="text-sm font-normal text-gray-500">{item.medicines?.unit}</span>
                        </td>
                      </tr>
                    ))}
                    {items.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-gray-500 font-style-italic">
                          No items tracked in this session.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50 text-right">
              <button 
                onClick={() => setSelectedSession(null)}
                className="bg-gray-800 text-white px-6 py-2 rounded font-bold hover:bg-gray-700 transition"
              >
                Close Logs
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
