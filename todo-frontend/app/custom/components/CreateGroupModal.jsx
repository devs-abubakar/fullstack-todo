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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-md p-4">
      <div className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800">New Workspace</h2>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Workspace Name</label>
            <input 
              required
              className="w-full p-4 mt-1 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all border border-transparent focus:bg-white text-black"
              placeholder="e.g., Engineering Team"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Invite Friends</label>
            <div className="grid grid-cols-2 gap-2 mt-2 max-h-48 overflow-y-auto p-1 custom-scrollbar">
              {friendsList.length > 0 ? friendsList.map(friend => (
                <div 
                  key={friend?.id}
                  onClick={() => toggleFriend(friend?.id)}
                  className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                    selectedFriends.includes(friend?.id) 
                      ? 'border-indigo-600 bg-indigo-50 shadow-sm' 
                      : 'border-slate-100 hover:border-slate-200 bg-white'
                  }`}
                >
                  <span className="text-sm font-medium text-slate-700 truncate mr-2">
                    {friend?.username || "Unknown"}
                  </span>
                  {selectedFriends.includes(friend?.id) && <Check size={16} className="text-indigo-600 shrink-0" />}
                </div>
              )) : (
                <p className="col-span-2 text-sm text-slate-400 text-center py-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  No friends available to invite.
                </p>
              )}
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none flex justify-center items-center gap-2"
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