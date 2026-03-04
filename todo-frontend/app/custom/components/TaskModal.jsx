// components/TaskModal.js
import { Plus, X } from 'lucide-react';

export default function TaskModal({ 
    isOpen, 
    onClose, 
    onAdd, 
    newTask, 
    setNewTask, 
    activeGroupId, 
    groupData 
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200 relative">
                
                {/* Close Button for better UX */}
                <button 
                    onClick={onClose}
                    className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition"
                >
                    <X size={20} />
                </button>

                <h2 className="text-2xl font-bold mb-2 text-slate-900">Create Task</h2>
                <p className="text-slate-500 text-sm mb-6">
                    Details will be visible to {activeGroupId ? "the team" : "only you"}.
                </p>
                
                <form onSubmit={onAdd} className="space-y-5">
                    {/* TASK TITLE */}
                    <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-wider">
                            Task Title
                        </label>
                        <input 
                            required
                            className="w-full p-4 mt-1 bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl transition-all outline-none text-slate-700 placeholder:text-slate-300" 
                            placeholder="E.g. Fix API Auth Bug"
                            value={newTask.title}
                            onChange={e => setNewTask({...newTask, title: e.target.value})}
                        />
                    </div>

                    {/* DEADLINE */}
                    <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-wider">
                            Deadline
                        </label>
                        <input 
                            type="datetime-local" 
                            className="w-full p-4 mt-1 bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl transition-all outline-none text-slate-700" 
                            value={newTask.deadline}
                            onChange={e => setNewTask({...newTask, deadline: e.target.value})}
                        />
                    </div>

                    {/* ASSIGNEE SELECTOR - Only shows if in a group */}
                    {activeGroupId && (
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-wider">
                                Assign To
                            </label>
                            <div className="relative">
                                <select 
                                    className="w-full p-4 mt-1 bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl outline-none appearance-none text-slate-700"
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
                                {/* Custom Chevron for the select box */}
                                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="19 9l-7 7-7-7"></path></svg>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ACTIONS */}
                    <div className="flex gap-3 pt-2">
                        <button 
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-4 font-bold text-slate-500 hover:bg-slate-50 rounded-2xl transition"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            className="flex-1 py-4 font-bold bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition active:scale-95 flex items-center justify-center gap-2"
                        >
                            <Plus size={18} /> Save Task
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}