'use client'
import { useState } from 'react';
import { Users, UserPlus,UserCheck } from 'lucide-react';
import FriendSearch from './FriendSearch';
import FriendRequests from './FriendRequests';
import FriendList from './FriendList';
// import GenericModal from '../custom/components/GenericModal'; // A simple wrapper

export default function SocialActions() {
    const [activeView, setActiveView] = useState(null); // 'list' or 'search'


    return (
        <div className="flex gap-3">
            {/* BUTTON 1: SEE FRIEND REQUESTS */}
            <button 
                onClick={() => setActiveView('request-list')}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm group"
            >
                <UserCheck size={18} className="text-indigo-600 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium text-slate-700">Requests</span>
                {/* Optional: Add notification bubble here */}
            </button>

            {/*BUTTON 2: SEE FRIENDS */}
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm group"
            onClick={()=> setActiveView('friends-list')}>
                <Users size={18} className="group-hover:scale-110 transition-transform"/>
                <span className="text-sm font-medium">Friends</span>

            </button>
            {/* BUTTON 3: ADD NEW FRIENDS */}
            <button 
                onClick={() => setActiveView('search')}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 group"
            >
                <UserPlus size={18} className="group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium">Find People</span>
            </button>

            {/* THE DYNAMIC MODAL */}
            {/* THE DYNAMIC MODAL */}
{activeView && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
        {/* Changed max-h-60 to max-h-[80vh] for a better viewing experience */}
        <div className="bg-white max-h-[80vh] w-full max-w-md rounded-2xl shadow-2xl p-6 relative flex flex-col">
            <button 
                onClick={() => setActiveView(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 z-20"
            >
                ✕
            </button>

            {/* Content Container with internal scrolling */}
            <div className="overflow-hidden flex flex-col h-full">
                {activeView === 'request-list' ? (
                    <>
                        <h2 className="text-xl font-bold mb-4">Friend Requests</h2>
                        <div className="overflow-y-auto"><FriendRequests /></div>
                    </>
                ) : activeView === 'search' ? (
                    <>
                        <h2 className="text-xl font-bold mb-4">Search Users</h2>
                        <div className="overflow-y-auto"><FriendSearch /></div>
                    </>
                ) : (
                    <>
                        <h2 className="text-xl font-bold mb-4">Your Friends</h2>
                        <div className="overflow-y-auto flex-1">
                            <FriendList />
                        </div>
                    </>
                )}
            </div>
        </div>
    </div>
)}
        </div>
    );
}