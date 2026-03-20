'use client'
import { useState } from 'react';
import { Users, UserPlus, UserCheck, X } from 'lucide-react';
import FriendSearch from './FriendSearch';
import FriendRequests from './FriendRequests';
import FriendList from './FriendList';

export default function SocialActions() {
    const [activeView, setActiveView] = useState(null);

    const closePortal = () => setActiveView(null);

    return (
        /* 1. Button Container: Wrapped in 'flex-wrap' so buttons don't overflow on small screens */
        <div className="flex flex-wrap gap-2 sm:gap-3">
            
            {/* BUTTON 1: REQUESTS */}
            <button 
                onClick={() => setActiveView('request-list')}
                className="flex flex-1 sm:flex-none items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm group"
            >
                <UserCheck size={18} className="text-indigo-600 group-hover:scale-110 transition-transform" />
                <span className="text-xs sm:text-sm font-medium text-slate-700">Requests</span>
            </button>

            {/* BUTTON 2: FRIENDS */}
            <button 
                onClick={() => setActiveView('friends-list')}
                className="flex flex-1 sm:flex-none items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm group"
            >
                <Users size={18} className="group-hover:scale-110 transition-transform"/>
                <span className="text-xs sm:text-sm font-medium text-slate-700">Friends</span>
            </button>

            {/* BUTTON 3: FIND PEOPLE - 'w-full sm:w-auto' to highlight it on mobile */}
            <button 
                onClick={() => setActiveView('search')}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 group"
            >
                <UserPlus size={18} className="group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium">Find People</span>
            </button>

            {/* THE DYNAMIC MODAL / BOTTOM SHEET */}
            {activeView && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-0 sm:p-4">
                    {/* Logic: 
                        - 'rounded-t-3xl sm:rounded-2xl': Rounded top only on mobile (Drawer style)
                        - 'h-[85vh] sm:h-auto': Tall drawer on mobile
                    */}
                    <div className="bg-white h-[85vh] sm:h-auto sm:max-h-[80vh] w-full max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl p-6 relative flex flex-col animate-in slide-in-from-bottom duration-300">
                        
                        {/* Mobile Handle: A small bar to indicate it can be swiped/closed (Visual only) */}
                        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6 sm:hidden" />

                        <button 
                            onClick={closePortal}
                            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 bg-slate-50 sm:bg-transparent rounded-full z-20"
                        >
                            <X size={20} />
                        </button>

                        <div className="overflow-hidden flex flex-col h-full">
                            {activeView === 'request-list' ? (
                                <>
                                    <h2 className="text-xl font-bold mb-4 text-slate-800">Friend Requests</h2>
                                    <div className="overflow-y-auto flex-1"><FriendRequests /></div>
                                </>
                            ) : activeView === 'search' ? (
                                <>
                                    <h2 className="text-xl font-bold mb-4 text-slate-800">Search Users</h2>
                                    <div className="overflow-y-auto flex-1"><FriendSearch /></div>
                                </>
                            ) : (
                                <>
                                    <h2 className="text-xl font-bold mb-4 text-slate-800">Your Friends</h2>
                                    <div className="overflow-y-auto flex-1"><FriendList /></div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}