'use client'
import { useState, useEffect } from 'react';
import api from '../lib/api';
import { useSearchParams } from 'next/navigation';
import { Calendar, Trash2, Plus, Users, Clock, CheckCircle2 } from 'lucide-react'; // Install lucide-react

export default function Dashboard() {
    const [user, setUser] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [groupData, setGroupData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false); // FOR THE LOGIN-STYLE POPUP
    const searchParams = useSearchParams();
    const activeGroupId = searchParams.get('group');
    const [newTask, setNewTask] = useState({ title: '', description: '', deadline: '' });

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const taskUrl = activeGroupId ? `tasks/?group=${activeGroupId}` : `tasks/`;
                const [userRes, taskRes] = await Promise.all([
                    api.get('me/'),
                    api.get(taskUrl)
                ]);

                if (activeGroupId) {
                    const groupRes = await api.get(`groups/${activeGroupId}/`);
                    setGroupData(groupRes.data);
                } else {
                    setGroupData(null);
                }

                setUser(userRes.data);
                setTasks(taskRes.data.results || taskRes.data);
            } catch (err) {
                console.error("Dashboard Load Error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [activeGroupId]);

const handleAddTask = async (e) => {
    e.preventDefault();

    // 🚨 DATA CLEANING (The "Senior Engineer" approach)
    let finalDeadline = null;

    if (newTask.deadline && newTask.deadline.trim() !== "") {
        try {
            // Convert "2026-03-25T14:30" -> "2026-03-25T14:30:00.000Z"
            finalDeadline = new Date(newTask.deadline).toISOString();
        } catch (err) {
            console.error("Invalid Date Object:", err);
            return alert("Invalid date selected.");
        }
    }

    const payload = {
        title: newTask.title,
        description: newTask.description,
        deadline: finalDeadline, // This will be ISO string OR null
        group: activeGroupId ? parseInt(activeGroupId) : null,
    };

    try {
        const res = await api.post('tasks/', payload);
        setTasks([res.data, ...tasks]);
        setNewTask({ title: '', description: '', deadline: '' });
        setIsModalOpen(false);
    } catch (err) {
        console.error("STILL REJECTED:", err.response?.data);
        alert("Server says: " + JSON.stringify(err.response?.data));
    }
};
    const handleDeleteTask = async (taskId) => {
        if (!confirm("Confirm permanent deletion?")) return;
        try {
            await api.delete(`tasks/${taskId}/`);
            setTasks(prev => prev.filter(t => t.id !== taskId));
        } catch (err) {
            alert(err.response?.data?.error || "Unauthorized delete attempt.");
        }
    };

    if (loading) return (
        <div className="flex h-screen items-center justify-center bg-slate-50">
            <div className="animate-pulse flex flex-col items-center">
                <div className="h-12 w-12 rounded-full border-4 border-t-indigo-600 border-slate-200 animate-spin" />
                <p className="mt-4 text-slate-500 font-medium">Syncing Workspace...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                
                {/* 🎨 HEADER / FACEPILE SECTION */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-bold rounded-full uppercase tracking-wider">
                                {activeGroupId ? "Team Workspace" : "Personal"}
                            </span>
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                            {activeGroupId ? groupData?.name : "My Inbox"}
                        </h1>
                    </div>

                    <div className="flex items-center gap-6">
                        {activeGroupId && groupData?.members && (
                            <div className="flex -space-x-3 items-center">
                                {groupData.members.slice(0, 5).map((m) => (
                                    <div key={m.id} className="relative group">
                                        <img 
                                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${m.username}`}
                                            className="h-10 w-10 rounded-full border-2 border-white bg-slate-200 hover:z-10 transition-transform hover:scale-110 cursor-help"
                                            alt={m.username}
                                        />
                                        <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                            {m.username}
                                        </span>
                                    </div>
                                ))}
                                {groupData.members.length > 5 && (
                                    <div className="h-10 w-10 rounded-full border-2 border-white bg-slate-900 text-white flex items-center justify-center text-xs font-bold">
                                        +{groupData.members.length - 5}
                                    </div>
                                )}
                            </div>
                        )}
                        <button 
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all active:scale-95"
                        >
                            <Plus size={18} /> New Task
                        </button>
                    </div>
                </header>

                {/* 📝 THE LOGIN-STYLE MODAL (Conditional Rendering) */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                        <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
                            <h2 className="text-2xl font-bold mb-2">Create Task</h2>
                            <p className="text-slate-500 text-sm mb-6">Details will be visible to {activeGroupId ? "the team" : "only you"}.</p>
                            
                            <form onSubmit={handleAddTask} className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase ml-1">Task Title</label>
                                    <input 
                                        required
                                        className="w-full p-4 mt-1 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none" 
                                        placeholder="E.g. Fix API Auth Bug"
                                        value={newTask.title}
                                        onChange={e => setNewTask({...newTask, title: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase ml-1">Deadline</label>
                                    <input 
                                        type="datetime-local" 
                                        className="w-full p-4 mt-1 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none" 
                                        value={newTask.deadline}
                                        onChange={e => setNewTask({...newTask, deadline: e.target.value})}
                                    />
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <button 
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 py-4 font-bold text-slate-500 hover:bg-slate-50 rounded-2xl transition"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit"
                                        className="flex-1 py-4 font-bold bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition"
                                    >
                                        Save Task
                                    </button>
                                    {/* ASSIGNEE SELECTOR */}
{activeGroupId && (
    <div>
        <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Assign To</label>
        <select 
            className="w-full p-4 mt-1 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none appearance-none"
            value={newTask.assigned_to || ""}
            onChange={e => setNewTask({...newTask, assigned_to: e.target.value})}
        >
            <option value="">Unassigned (Me)</option>
            {groupData?.members?.map(member => (
                <option key={member.id} value={member.id}>
                    {member.username}
                </option>
            ))}
        </select>
    </div>
)}
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* 📋 TASK LIST GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tasks.length > 0 ? tasks.map(task => (
                        <div key={task.id} className="group bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all duration-300 relative overflow-hidden">
                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-2 rounded-xl ${task.completed ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                    {task.completed ? <CheckCircle2 size={20} /> : <Clock size={20} />}
                                </div>
                                <button 
                                    onClick={() => handleDeleteTask(task.id)}
                                    className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                            
                            <h4 className="font-bold text-slate-800 text-lg mb-1 leading-tight">{task.title}</h4>
                            <p className="text-slate-400 text-sm mb-6 line-clamp-2">{task.description || "No additional context."}</p>
                            
                            <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                <div className="flex items-center gap-1.5 text-slate-400">
                                    <Calendar size={14} />
                                    <span className="text-[11px] font-bold">
                                        {task.deadline ? new Date(task.deadline).toLocaleDateString() : "No Date"}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold text-slate-400">{task.creator_name}</span>
                                    <img 
                                        src={`https://api.dicebear.com/7.x/initials/svg?seed=${task.creator_name}`} 
                                        className="h-6 w-6 rounded-full bg-slate-100"
                                    />
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="col-span-full py-20 flex flex-col items-center justify-center bg-white rounded-3xl border-2 border-dashed border-slate-200">
                            <div className="bg-slate-50 p-4 rounded-full mb-4">
                                <Plus className="text-slate-300" size={32} />
                            </div>
                            <p className="text-slate-400 font-medium">No tasks found in this workspace.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}