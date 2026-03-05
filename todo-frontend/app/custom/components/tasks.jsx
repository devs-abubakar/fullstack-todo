'use client'
import React, { useState, useEffect } from 'react'

const Tasks = () => {
    const [tasks, setTasks] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        // Step 1: Define the async function inside useEffect
        const fetchTasks = async () => {
            const token = localStorage.getItem("access");
            
            if (!token) {
                setError("No authorization token found.");
                setLoading(false);
                return;
            }

            try {
                const response = await fetch("http://localhost:8000/api/tasks/", {
                    method: "GET",
                    headers: {
  "Authorization": `Bearer ${localStorage.getItem("access")}`, // Notice the space!
  "Content-Type": "application/json",
},
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                setTasks(data.results);
            } catch (e) {
                setError(e.message);
                console.error("Fetch failed:", e);
            } finally {
                setLoading(false);
            }
        };

        fetchTasks();
    }, []); // Empty dependency array means this runs ONCE on mount

    if (loading) return <div>Fetching your digital life...</div>;
    if (error) return <div style={{ color: 'red' }}>Error: {error}</div>;

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold">Your Tasks</h1>
            <ul className="mt-4 space-y-2">
                {tasks.map((task) => (
                    <li key={task.id} className="border p-2 rounded shadow-sm">
                        <h3 className="font-semibold">{task.title}</h3>
                        <p className="text-gray-600">{task.description}</p>
                    </li>
                ))}
            </ul>
        </div>
    )
}

export default Tasks

