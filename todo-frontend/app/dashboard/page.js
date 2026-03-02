'use client'
import { useState, useEffect } from 'react';
import api from '../lib/api';

export default function Dashboard() {
    const [user, setUser] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // FIXED: Singular name and object initialization
    const [newTask, setNewTask] = useState({ title: '', description: '' });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [userRes, taskRes] = await Promise.all([
                    api.get('me/'),
                    api.get('tasks/')
                ]);
                console.log("First Task Creator ID:", taskRes.data.results[0]?.creator);
                console.log("Current Logged-in User ID:", userRes.data.id);
                setUser(userRes.data);
                setTasks(taskRes.data.results || taskRes.data);
            } catch (err) {
                console.error("Dashboard Load Error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleDeleteTask = async (taskId) => {
    // 1. Confirm with the user (safety first)
    if (!window.confirm("Are you sure you want to delete this task?")) return;

    try {
        // 2. Send the DELETE request to Django
        await api.delete(`tasks/${taskId}/`);

        // 3. Update the UI (Filter out the deleted task)
        // This is "State Filtering" - essential for any dev to master
        setTasks(tasks.filter(task => task.id !== taskId));
        
    } catch (err) {
        console.error("Delete failed:", err.response?.data || err.message);
        alert("Could not delete task.");
    }
};
    
    const handleToggleTask= async (task)=>{
        console.log(task)
        try{
            const res = await api.patch(`tasks/${task.id}/`, {
            completed: !task.completed
        });
            console.log(res)
        // Update local state by mapping through the array
        // If the ID matches, replace it with the server's new version
        setTasks(tasks.map(t => t.id === task.id ? res.data : t));
        }catch(e){
            console.log("Error while updating",e)
            alert("failed to toggle state")
        }
    }

    const handleAddTask = async (e) => {
        e.preventDefault();
        if (!newTask.title) {
            return alert("Title is required");
        }
        try {
            // Sends the object to Django
            const res = await api.post('tasks/', newTask);
            console.log("TASK CREATED FROM SERVER:", res.data);
            
            // UI Update: Add the new task to the top of the list
            setTasks([res.data, ...tasks]); 
            
            // Clear the form
            setNewTask({ title: '', description: '' });
        } catch (err) {
            console.error("Failed to add task:", err.response?.data || err.message);
            alert("Error adding task. Check console.");
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-500"></div>
                <span className="ml-3 font-semibold">Initializing...</span>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <header className="mb-8 border-b pb-4 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">
                        Welcome, {user?.username?.toUpperCase() || 'User'}
                    </h1>
                    <p className="text-gray-500">Here’s what’s on your plate today.</p>
                </div>
            </header>

            {/* CREATE TASK SECTION */}
            <section className="mb-10 bg-blue-50 p-6 rounded-xl border border-blue-100 shadow-sm">
                <h3 className="text-lg font-bold mb-4 text-blue-800">Create New Task</h3>
                <form onSubmit={handleAddTask} className="flex flex-col gap-3">
                    <input 
                        type="text" 
                        placeholder="What needs to be done?"
                        className="p-3 rounded border focus:ring-2 focus:ring-blue-500 outline-none text-black"
                        value={newTask.title}
                        onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                    />
                    <textarea 
                        placeholder="Add a description (optional)"
                        className="p-3 rounded border focus:ring-2 focus:ring-blue-500 outline-none text-black"
                        value={newTask.description}
                        onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                    />
                    <button 
                        type="submit" 
                        className="bg-blue-600 text-white font-bold py-3 rounded hover:bg-blue-700 transition"
                    >
                        Add Task +
                    </button>
                </form>
            </section>

            {/* TASK LIST SECTION */}
            <section>
                <h2 className="text-xl font-semibold mb-4 text-gray-700">Your Tasks</h2>
                <div className="grid gap-4">
                    {tasks?.length > 0 ? (
                        tasks.map((task) => (
                            <div key={task.id} className="p-4 border rounded-lg shadow-sm hover:shadow-md transition bg-white text-black">
                                <h3 className="font-bold text-lg">{task.title}</h3>
                                <p className="text-gray-600 text-sm">{task.description || "No description provided."}</p>
                                <div className="mt-3 flex items-center justify-between">
                                    <span className={`px-2 py-1 text-xs rounded ${task.completed ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                        {task.completed ? "Completed" : "In Progress"}
                                    </span>
                                    <button 
        onClick={() => handleToggleTask(task)}
        className={`px-3 py-1 text-xs font-bold rounded-full transition-all ${
            task.completed 
            ? 'bg-green-500 text-white hover:bg-green-600' 
            : 'bg-yellow-400 text-white hover:bg-yellow-500'
        }`}
    >
        {task.completed ? "✓ Done" : "○ Working"}
    </button>
{String(task.creator) === String(user?.username) && (
    
        <button 
            onClick={() => handleDeleteTask(task.id)}
            className="text-red-500 hover:text-red-700 text-sm font-semibold p-1 transition"
        >
            Delete 🗑️
        </button>
    )}
    {String(task.creator)!==String(user?.username) &&(
        <div className='text-sm text-gray-400'> assigned by : {task.creator}</div>
    )}
                                    <span className="text-xs text-gray-400">ID: #{task.id}</span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center p-10 border-2 border-dashed rounded-lg">
                            <p className="text-gray-500">No tasks found. Time to relax?</p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}