'use client'
import { useState, useEffect } from 'react'
import api from '../../lib/api'
import { X, Check } from 'lucide-react'

// ✅ FIX 1: Added curly braces for destructuring
export default function CreateGroupModal({ isOpen, onClose, onGroupCreated }) {
  const [name, setName] = useState('')
  const [friends, setFriends] = useState([])
  const [selectedFriends, setSelectedFriends] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      // 🚨 NOTE: This will fail until your Django /friends/ endpoint is ready
      // api.get('/friends/')
      //   .then(res => setFriends(res.data.results || res.data))
      //   .catch(err => console.error("Friends fetch failed:", err))
    setFriends([
      { id: 1, username: "dev_bob" },
      { id: 2, username: "alice_coder" },
      { id: 3, username: "tech_guru" }
    ]);
    }
    
  }, [isOpen])

  const toggleFriend = (id) => {
    setSelectedFriends(prev => 
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await api.post('/groups/', { 
        name, 
        member_ids: selectedFriends 
      })
      
      // ✅ FIX 3: Ensure this function exists before calling
      if (onGroupCreated) onGroupCreated(res.data)
      
      onClose()
    } catch (err) {
      alert("Creation failed. Check console.")
      console.error(err.response?.data)
    } finally {
      setLoading(false)
    }
  }

  // ✅ FIX 1 (Continued): Now 'isOpen' is a boolean, not an object
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-md p-4">
      <div className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">New Workspace</h2>
          {/* ✅ FIX 2: Correctly calling the function */}
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase">Workspace Name</label>
            <input 
              required
              className="w-full p-4 mt-1 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g., Engineering Team"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-400 uppercase">Invite Friends</label>
            <div className="grid grid-cols-2 gap-2 mt-2 max-h-48 overflow-y-auto p-1">
              {friends.length > 0 ? friends.map(friend => (
                <div 
                  key={friend.id}
                  onClick={() => toggleFriend(friend.id)}
                  className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                    selectedFriends.includes(friend.id) ? 'border-indigo-600 bg-indigo-50' : 'border-slate-100 hover:border-slate-200'
                  }`}
                >
                  <span className="text-sm font-medium">{friend.username}</span>
                  {selectedFriends.includes(friend.id) && <Check size={16} className="text-indigo-600" />}
                </div>
              )) : (
                <p className="col-span-2 text-sm text-slate-400 text-center py-4">No friends found yet.</p>
              )}
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg active:scale-[0.98] transition-transform"
          >
            {loading ? "Building..." : "Launch Workspace"}
          </button>
        </form>
      </div>
    </div>
  )
}