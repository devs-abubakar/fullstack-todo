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
// {
//     "username": "user2",
//     "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc3MjQ3OTA0MywiaWF0IjoxNzcyMzkyNjQzLCJqdGkiOiIwNmRmMjMxNzVjZjk0ZTQxOWFmMTRkYzliM2E4OTg3NiIsInVzZXJfaWQiOiI0In0.xW7GB3W-F26TyUTnl-3qVYWxW1kMTeABA60c3zeVO5c",
//     "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzcyMzk2MjQzLCJpYXQiOjE3NzIzOTI2NDMsImp0aSI6ImEyNTljOWI3ZGMzYzRlZTM5Yjc1MTY1Mzk1MDFlMjdiIiwidXNlcl9pZCI6IjQifQ.XA3OOX5bWDxJewAZILvBYG1AMeeOhLNCdbSwyNu7-uM"
// }

