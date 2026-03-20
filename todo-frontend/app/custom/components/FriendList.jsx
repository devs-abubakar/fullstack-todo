import React from 'react'
import { useFriends } from '@/hooks/useData'
import { LoaderOne } from '@/components/ui/loader'
import { UserAvatar } from './Avatar'

const FriendList = () => {
  const { friends, isLoading } = useFriends()

  if (isLoading) return <LoaderOne />

  return (
    // 'flex-1' allows this to fill the modal space, 'overflow-hidden' clips the corners
    <div className='flex flex-col w-full h-full border border-slate-100 rounded-xl overflow-hidden'>
      {/* Scrollable Area */}
      <div className="overflow-y-auto space-y-2 p-1 custom-scrollbar">
        {friends.length > 0 ? (
          friends.map((friendship) => (
            <div 
              key={friendship.id} 
              className="flex items-center gap-3 p-2 bg-white rounded-lg hover:bg-slate-50 transition-all group"
            >
              <div className='shrink-0'>
                <UserAvatar name={friendship.friend_info?.username} />
              </div>

              <div className='flex-1 min-w-0'>
                <p className='font-bold text-sm text-slate-900 truncate'>
                  {friendship.friend_info?.username || "Unknown User"}
                </p>
                <p className='text-xs text-slate-500 truncate italic'>
                  {friendship.friend_info?.email}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-400 text-xs text-center py-10">No friends found.</p>
        )}
        
      </div>
    </div>
  )
}

export default FriendList