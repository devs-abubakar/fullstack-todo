'use client'
import React, { useState } from 'react'
import api from '@/app/lib/api' 
import { Check } from 'lucide-react'
import { useFriendRequest } from '@/hooks/useData'
import { LoaderOne } from '@/components/ui/loader'
import { Spinner } from '@/components/ui/spinner'

const FriendRequests = () => {
    // 1. Let SWR handle the fetching. 'requests' is your data.
    const { requests, isLoading, isError, mutateRequests } = useFriendRequest()
    const [acceptingId,setacceptingId]= useState(null)
    const handleAccept = async (id) => {
        setacceptingId(id)
        try {
            await api.post(`friendships/${id}/accept/`)
            // 2. Tell SWR the data changed; it will re-fetch automatically
            mutateRequests() 
        } catch (err) {
            alert("Failed to accept")
        }finally{
            setacceptingId(null)
        }
    }

    // 3. Handle loading and error states cleanly
    if (isLoading) return <p className="text-sm text-slate-400 text-center py-4">Loading requests...</p>
    if (isError) return <p className="text-sm text-red-400 text-center py-4">Failed to load requests.</p>
    const req = requests.data || []
    return (
        <div className="space-y-3">
            {/* 4. Use 'requests' directly. Always check length safely. */}
            {req && req.length > 0 ? (
                req.map((req) => (
                    <div key={req.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="flex flex-col">
                            <span className="font-bold text-slate-800 text-sm">
                                {req.friend_info?.username || "Unknown User"}
                            </span>
                            <span className='font-semibold text-slate-700 text-sm'>{req.friend_info?.email}</span>
                            <span className="text-xs text-slate-500">Sent you a request</span>
                        </div>
                        
                        <div className="flex gap-2">

                            {acceptingId === req?.id ?<Spinner/>:<button 
                                onClick={() => handleAccept(req.id)}
                                className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition shadow-sm active:scale-95"
                            >
                                <Check size={16} />
                            </button>}
                        </div>
                    </div>
                ))
            ) : (
                <p className="text-sm text-slate-500 text-center py-4">No pending requests.</p>
            )}
        </div>
    )
}

export default FriendRequests