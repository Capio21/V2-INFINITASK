"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Sidebar from "../Components/Sidebar";
import { ToastContainer, toast } from "react-toastify"; // Import toast and ToastContainer
import "react-toastify/dist/ReactToastify.css"; // Import CSS for toast notifications
import authUser  from "../utils/authUser";
import { motion } from "framer-motion";

const TodoPage = () => {
  const router = useRouter();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 1;

  // Initialize the alarm sound
  const alarmSound = new Audio("/alarm-sound.mp3");

  const playAlarm = () => {
    alarmSound.currentTime = 0;
    alarmSound.play().catch(error => {
      console.error("Error playing alarm sound:", error);
    });
  };

  useEffect(() => {
    const authenticateUser  = async () => {
      try {
        const authToken = sessionStorage.getItem("authToken");
        if (!authToken) {
          toast.error("Auth token not found"); // Show error toast
          setLoading(false);
          return;
        }

        const response = await axios.post("https://infinitech-api5.site/api/getUserId", { authToken });
        setUserId(response.data.id);
        fetchTasks(response.data.id);
      } catch (error) {
        console.error("Failed to authenticate user:", error);
        toast.error("Failed to authenticate user"); // Show error toast
        setLoading(false);
      }
    };

    authenticateUser ();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (userId) {
        fetchTasks(userId);
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval); // Cleanup on unmount
  }, [userId]);

  const fetchTasks = async (userId) => {
    try {
      const response = await axios.get(`https://infinitech-api5.site/api/tasks/${userId}`);
      const now = new Date();

      const updatedTasks = response.data.map((task) => {
        const deadline = new Date(task.deadline);
        if (task.status !== "complete" && now > deadline) {
          updateTaskStatus(task.id, "overdue");
          return { ...task, status: "overdue" };
        }
        return task;
      });

      setTasks(updatedTasks);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
      toast.error("Failed to fetch tasks"); // Show error toast
      setLoading(false);
    }
  };

  const updateTaskStatus = async (taskId, status) => {
    try {
      await axios.patch(`https://infinitech-api5.site/api/tasks/${taskId}/updateStatus`, { status });
    } catch (error) {
      console.error(`Failed to update task ${taskId} to ${status}:`, error);
      toast.error(`Failed to update task ${taskId}`); // Show error toast
    }
  };

  const markAsDone = async () => {
    if (!selectedTask) return;

    try {
      await axios.patch(`https://infinitech-api5.site/api/tasks/${selectedTask.id}/markAsDone`, {
        status: "complete",
      });

      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === selectedTask.id ? { ...task, status: "complete" } : task
        )
      );
      setShowModal(false);
      toast.success(`Task "${selectedTask.title}" marked as done!`); // Show success toast
    } catch (error) {
      console.error("Failed to mark task as done:", error);
      toast.error("Failed to mark task as done"); // Show error toast
    }
  };

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "complete").length;
  const overdueTasks = tasks.filter((t) => t.status === "overdue").length;
  const pendingTasks = totalTasks - completedTasks - overdueTasks;

  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const totalPages = Math.ceil(totalTasks / itemsPerPage);
  const currentTask = tasks[(currentPage - 1) * itemsPerPage];

  // State to manage the expanded/collapsed state of the description
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const checkAlarms = setInterval(() => {
      const now = new Date();
      for (const task of tasks) {
        const taskTime = new Date(task.deadline);
        if (task.status === 'pending') {
          if (taskTime < now) {
            updateTaskStatus(task.id, "overdue");
          } else {
            if (
              taskTime.getFullYear() === now.getFullYear() &&
              taskTime.getMonth() === now.getMonth() &&
              taskTime.getDate() === now.getDate() &&
              taskTime.getHours() === now.getHours() &&
              taskTime.getMinutes() - 1 === now.getMinutes()
            ) {
              playAlarm(); // Trigger alarm at exact time
            }
          }
        }
      }
    }, 500);

    return () => clearInterval(checkAlarms);
  }, [tasks]);

    return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white font-sans">
      <ToastContainer position="top-right" autoClose={3000} />
  
      <Sidebar />
  
      {/* Sidebar Spacer (if needed for layout symmetry) */}
      <div className="hidden md:block w-64"></div>
  
      <main className="flex-1 px-6 py-8 overflow-y-auto">
        {/* Header */}
        <header className="flex items-center justify-center mb-10">
          <div className="w-full text-center">
            <h1 className="text-4xl h-auto font-extrabold bg-gradient-to-r from-blue-500 to-cyan-300 bg-clip-text text-transparent drop-shadow-md">
              Admin Task Dashboard
            </h1>
            <p className="text-sm text-gray-400 mt-2">Manage your daily tasks and track progress</p>
          </div>
        </header>
  
        {/* Progress Bar */}
        <section className="w-full max-w-3xl mx-auto mb-10">
          <div className="relative h-6 bg-blue-100 rounded-full overflow-hidden shadow-inner">
            <motion.div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-400 to-blue-600"
              initial={{ width: "0%" }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
            />
            <span className="absolute inset-0 flex justify-center items-center font-semibold text-blue-900">
              {Math.round(progress)}%
            </span>
          </div>
        </section>
  
        {/* Summary Cards */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
          {[
            { label: 'Completed', value: completedTasks, color: 'bg-green-600' },
            { label: 'Pending', value: pendingTasks, color: 'bg-yellow-600' },
            { label: 'Overdue', value: overdueTasks, color: 'bg-red-600' },
            { label: 'Total Tasks', value: totalTasks, color: 'bg-gray-600' }
          ].map((item, idx) => (
            <div key={idx} className={`${item.color} p-4 rounded-xl shadow-lg text-center`}>
              <h2 className="text-lg font-semibold">{item.label}</h2>
              <p className="text-3xl font-bold">{item.value}</p>
            </div>
          ))}
        </section>
        {loading ? (
  <p className="text-cyan-400 animate-pulse">Loading tasks...</p>
) : error ? (
  <p className="text-red-500">{error}</p>
) : currentTask && (
  <section className="max-w-auto mx-auto bg-[#1a1a2e] text-cyan-100 p-6 rounded-2xl shadow-lg border border-cyan-700">

    {/* Pagination - Top Right */}
    <div className="flex justify-end items-center gap-3 mb-4 text-cyan-400 text-sm font-mono">
      <button
        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
        disabled={currentPage === 1}
        className="bg-cyan-800 px-3 py-1 rounded disabled:opacity-30 hover:bg-cyan-700 transition"
      >
        &#9664;
      </button>
      <span>Page {currentPage} of {totalPages}</span>
      <button
        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
        disabled={currentPage === totalPages}
        className="bg-cyan-800 px-3 py-1 rounded disabled:opacity-30 hover:bg-cyan-700 transition"
      >
        &#9654;
      </button>
    </div>

    {/* Tags and Status */}
    <div className="flex justify-between items-start">
      {currentTask.tags && (
        <div className={`px-4 py-1 text-sm font-bold rounded-full tracking-wide border border-white/20
          ${
            currentTask.tags.includes("Hard") ? "bg-red-600 text-white" :
            currentTask.tags.includes("Medium") ? "bg-yellow-500 text-black" :
            "bg-green-500 text-black"
          }
        `}>
          {Array.isArray(currentTask.tags) ? currentTask.tags.join(", ") : currentTask.tags}
        </div>
      )}
      <span className={`px-4 py-1 rounded-full text-sm font-extrabold tracking-widest
        ${
          currentTask.status === "complete" ? "bg-green-300 text-green-900" :
          currentTask.status === "overdue" ? "bg-red-300 text-red-900" :
          "bg-yellow-200 text-yellow-800"
        }
      `}>
        {currentTask.status.toUpperCase()}
      </span>
    </div>

    {/* Title */}
    <h3 className="mt-4 text-2xl font-black text-cyan-300">
      {currentTask.title}
    </h3>

    {/* Status GIF */}
    <img
      src={
        currentTask.status === "complete"
          ? "/gifs/success.gif"
          : currentTask.status === "overdue"
          ? "/gifs/overdue.gif"
          : "/gifs/pending.gif"
      }
      alt={currentTask.status}
      className="h-40 mx-auto mt-4 rounded-lg shadow-inner "
    />

    {/* Description */}
    <div className={`mt-6 overflow-y-auto border border-cyan-700 bg-[#0f0f1f] p-4 rounded-lg text-center ${isExpanded ? 'h-64' : 'h-40'}`}>
      {isExpanded
        ? currentTask.description
        : currentTask.description.length > 100
        ? currentTask.description.substring(0, 500) + '...'
        : currentTask.description}
    </div>

    {currentTask.description.length > 100 && (
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="text-cyan-400 mt-2 hover:underline hover:text-cyan-300 block text-center w-full"
      >
        {isExpanded ? "Show Less" : "Show More"}
      </button>
    )}

    {/* Deadline */}
    <p className={`mt-4 font-bold text-md ${
      currentTask.status === "overdue" ? "text-red-400" : "text-cyan-300"
    }`}>
      <strong>Deadline:</strong> {(() => {
        const date = new Date(currentTask.deadline);
        const formattedDate = date.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase().replace(/, /g, '-').replace(/ /g, '-');
        const formattedTime = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
        return `${formattedDate}-${formattedTime}`;
      })()}
    </p>

    {/* Mark as Done */}
    {currentTask.status !== "complete" && currentTask.status !== "overdue" && (
      <button
        onClick={() => {
          setSelectedTask(currentTask);
          setShowModal(true);
        }}
        className="mt-4 w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-black font-bold rounded-lg shadow-md transition-all duration-200"
      >
        Mark as Done
      </button>
    )}
  </section>
)}


  
        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white text-gray-900 p-6 rounded-xl w-96 text-center shadow-2xl">
              <h2 className="text-xl font-bold mb-4">Confirm Action</h2>
              <p>Are you sure you want to mark <strong>{selectedTask?.title}</strong> as done?</p>
              <div className="mt-6 flex justify-center space-x-4">
                <button
                  onClick={markAsDone}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-500"
                >
                  Yes
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-500"
                >
                  No
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default authUser (TodoPage);
