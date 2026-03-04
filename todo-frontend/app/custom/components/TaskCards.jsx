// components/TaskCard.js
export default function TaskCard({ task, currentUser, onToggle, onDelete }) {
    // Logic: Who can do what?
    const isCreator = currentUser?.id === task.creator_id;
    const isAssignee = currentUser?.id === task.assigned_to;
    const canToggle = isCreator || isAssignee;

    return (
        <div className={`p-4 rounded-xl border transition-all ${
            task.completed ? 'bg-slate-50 opacity-60' : 'bg-white shadow-sm'
        }`}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <input 
                        type="checkbox" 
                        disabled={!canToggle} // 🚨 UI Guard
                        checked={task.completed} 
                        onChange={() => onToggle(task.id)}
                        className="w-5 h-5 cursor-pointer"
                    />
                    <h3 className={task.completed ? 'line-through' : ''}>{task.title}</h3>
                </div>

                {/* Only the creator sees the delete button */}
                {isCreator && (
                    <button onClick={() => onDelete(task.id)} className="text-red-500 hover:bg-red-50 p-1 rounded">
                        Delete
                    </button>
                )}
            </div>
            <div className="mt-2 text-xs text-slate-400">
                Assigned to: {task.assigned_to_username || 'Unassigned'}
            </div>
        </div>
    );
}