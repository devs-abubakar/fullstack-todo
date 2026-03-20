'use client'
import { useState } from 'react'
import api from '../../lib/api'
import { useFriends } from '@/hooks/useData' 
import { X, Check, Loader2 } from 'lucide-react'
import { useSWRConfig } from 'swr' 

export default function CreateGroupModal({ isOpen, onClose }) {
  const [name, setName] = useState('')
  const [selectedFriends, setSelectedFriends] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { mutate } = useSWRConfig()
  const { friends: allFriendships } = useFriends()

  // We extract the friend_info here. 
  // Each item in friendsList is now: { id, username, email }
  const friendsList = allFriendships
    ?.filter(f => f.status === 'accepted')
    ?.map(f => f.friend_info)
    ?.filter(Boolean) || []

  if (!isOpen) return null

  const toggleFriend = (id) => {
    if (!id) return;
    setSelectedFriends(prev => 
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (selectedFriends.length === 0) {
        alert("Invite at least one friend to the workspace!")
        return
    }
    
    setIsSubmitting(true)
    try {
      await api.post('/groups/', { 
        name, 
        member_ids: selectedFriends 
      })
      
      mutate('/groups/') 
      setName('')
      setSelectedFriends([])
      onClose()
    } catch (err) {
      console.error("Creation failed", err.response?.data)
      alert("Failed to create workspace.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    // 1. Mobile-friendly Backdrop: Added 'p-0 sm:p-4' to allow the modal to touch edges on tiny screens
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-md p-0 sm:p-4">
      
      {/* 2. Responsive Container: 
          - 'h-[90vh] sm:h-auto': Tall on mobile, auto on desktop
          - 'rounded-t-[2.5rem] sm:rounded-3xl': "Drawer" style on mobile, "Card" style on desktop
          - 'max-w-lg w-full': Constraints for larger screens
      */}
      <div className="bg-white rounded-t-[2.5rem] sm:rounded-3xl p-6 sm:p-8 w-full max-w-lg shadow-2xl transition-all animate-in slide-in-from-bottom-10 duration-300 overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800">New Workspace</h2>
          <button type="button" onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 transition-colors bg-slate-100 rounded-full">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6 overflow-y-auto pr-1">
          {/* Workspace Name */}
          <div>
            <label className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">Workspace Name</label>
            <input 
              required
              className="w-full p-3 sm:p-4 mt-1 bg-slate-50 rounded-xl sm:rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all border border-transparent focus:bg-white text-base text-black" 
              placeholder="e.g., Engineering Team"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>

          {/* Friends Selection */}
          <div>
            <label className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">Invite Friends</label>
            
            {/* 3. Responsive Grid: 
                - 'grid-cols-1 sm:grid-cols-2': Single column on mobile, double on desktop
            */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 max-h-40 sm:max-h-48 overflow-y-auto p-1 custom-scrollbar">
              {friendsList.length > 0 ? friendsList.map(friend => (
                <div 
                  key={friend?.id}
                  onClick={() => toggleFriend(friend?.id)}
                  className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                    selectedFriends.includes(friend?.id) 
                      ? 'border-indigo-600 bg-indigo-50' 
                      : 'border-slate-100 bg-white'
                  }`}
                >
                  <span className="text-sm font-medium text-slate-700 truncate">
                    {friend?.username || "Unknown"}
                  </span>
                  {selectedFriends.includes(friend?.id) && <Check size={16} className="text-indigo-600 shrink-0" />}
                </div>
              )) : (
                <p className="col-span-full text-sm text-slate-400 text-center py-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  No friends found.
                </p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full py-3 sm:py-4 bg-indigo-600 text-white rounded-xl sm:rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-50 flex justify-center items-center gap-2 text-sm sm:text-base"
          >
            {isSubmitting ? (
              <><Loader2 className="animate-spin" size={20} /> Building...</>
            ) : "Launch Workspace"}
          </button>
        </form>
      </div>
    </div>
  )
}