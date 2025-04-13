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
    <div className="flex min-h-screen bg-gray-900 text-gray-900">
      <ToastContainer position="top-right" autoClose={3000} /> {/* ToastContainer for notifications */}

      <Sidebar />
      <div className="sticky top-0 h-screen w-64 bg-blue-100 shadow-lg hidden md:block">
      </div>

      <div className="flex-1 p-4 md:p-9 flex flex-col items-center">
        <br />
        <br />
        <div className="flex items-center justify-center mb-6">
          <div className="flex-grow border-t border-blue-300"></div>
          <span className="mx-10 text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-300">
            ADMIN TASK
          </span>
          <div className="flex-grow border-t border-blue-300"></div>
        </div>
        {/* Dashboard Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8 w-full">
          <div className="bg-blue-600 p-4 rounded-lg shadow-lg text-white text-center">
            <h2 className="text-lg font-bold">Completed</h2>
            <p className="text-2xl">{completedTasks}</p>
          </div>
          <div className="bg-yellow-600 p-4 rounded-lg shadow-lg text-white text-center">
            <h2 className="text-lg font-bold">Pending</h2>
            <p className="text-2xl">{pendingTasks}</p>
          </div>
          <div className="bg-red-600 p-4 rounded-lg shadow-lg text-white text-center">
            <h2 className="text-lg font-bold">Overdue</h2>
            <p className="text-2xl">{overdueTasks}</p>
          </div>
          <div className="bg-gray-600 p-4 rounded-lg shadow-lg text-white text-center">
            <h2 className="text-lg font-bold">Total Tasks</h2>
            <p className="text-2xl">{totalTasks}</p>
          </div>
        </div>

        <div className="relative w-full h-6 bg-blue-200 rounded-lg shadow-lg overflow-hidden">
          {/* 3D Background Layer */}
          <div className="absolute inset-0 bg-blue-300 rounded-lg shadow-inner" />

          {/* Animated Progress */}
          <motion.div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-lg shadow-md"
            initial={{ width: "0%" }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
          />

          {/* Text Display */}
          <span className="absolute inset-0 flex justify-center items-center text-white font-bold drop-shadow-lg">
            {Math.round(progress)}%
          </span>
        </div>
        <br />

        {loading ? (
          <p>Loading tasks...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          currentTask && (
            <div className="relative min-w-full border-2 border-blue-300 bg-blue-100 p-4 shadow-lg transition-all rounded-lg flex flex-col items-center text-gray-900 text-center w-full md:w-3/4 lg:w-1/2">
              {currentTask.tags && (
                <div
                  className={`absolute top-2 left-2 text-white text-xs font-bold px-2 py-1 rounded-lg shadow-lg ${
                    currentTask.tags.includes("Hard")
                      ? "bg-red-500"
                      : currentTask.tags.includes("Medium")
                      ? "bg-orange-500"
                      : "bg-green-500"
                  }`}
                >
                  {Array.isArray(currentTask.tags) ? currentTask.tags.join(", ") : currentTask.tags}
                </div>
              )}
              <br />

              <div className="absolute top-2 right-2">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-bold ${
                    currentTask.status === "complete"
                      ? "bg-green-200 text-green-800"
                      : currentTask.status === "overdue"
                      ? "bg-red-200 text-red-800"
                      : "bg-yellow-200 text-yellow-800"
                  }`}
                >
                  {currentTask.status.toUpperCase()}
                </span>
              </div>
              <br />

              <h3 className="bg-blue-600 text-white text-lg font-bold p-2 rounded-md w-full">
                {currentTask.title}
              </h3>
              <img
                src={
                  currentTask.status === "complete"
                    ? "/gifs/success.gif"
                    : currentTask.status === "overdue"
                    ? "/gifs/overdue.gif"
                    : "/gifs/pending.gif"
                }
                alt={currentTask.status}
                className="w-30 h-30 mt-3"
              />

              {/* Scrollable Description with See More functionality */}
              <div className={`overflow-y-auto ${isExpanded ? 'h-64' : 'h-40'} w-full border  p-4`}>
                {isExpanded 
                  ? currentTask.description 
                  : currentTask.description.length > 100 
                    ? currentTask.description.substring(0, 100) + '...' 
                    : currentTask.description}
              </div>
              {currentTask.description.length > 100 && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="mt-2 text-blue-400 hover:underline"
                >
                  {isExpanded ? 'Show Less' : 'Show More'}
                </button>
              )}

              <br />
              <p
                className={`font-bold ${
                  currentTask.status === "overdue" ? "text-red-500" : "text-gray-700"
                }`}
              >
                <strong>Deadline:</strong> {(() => {
                  const date = new Date(currentTask.deadline);
                  const options = { day: 'numeric', month: 'long', year: 'numeric' };
                  
                  // Format the date
                  const formattedDate = date.toLocaleDateString('en-US', options)
                    .toUpperCase()
                    .replace(/, /g, '-')
                    .replace(/ /g, '-');

                  // Format the time
                  const formattedTime = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });

                  // Combine date and time
                  return `${formattedDate}-${formattedTime}`;
                })()}
              </p>

              {currentTask.status !== "complete" && currentTask.status !== "overdue" && (
                <button
                  onClick={() => {
                    setSelectedTask(currentTask);
                    setShowModal(true);
                  }}
                  className="w-full py-2 border-2 border-blue-300 shadow-md font-bold transition-all cursor-pointer mt-2 bg-blue-600 hover:bg-blue-500"
                >
                  Mark as Done
                </button>
              )}
              <div className="flex justify-between w-full mt-4">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="bg-gray-600 text-white px-4 py-2 rounded disabled:opacity-50"
                >
                  &#9664;
                </button>
                <span className="text-gray-900">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="bg-gray-600 text-white px-4 py-2 rounded disabled:opacity-50"
                >
                  &#9654;
                </button>
              </div>
            </div>
          )
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-blue-900 p-6 rounded-lg shadow-lg text-gray-300 w-96 text-center">
            <h2 className="text-lg font-bold mb-4">Confirm Action</h2>
            <p>Are you sure you want to mark "{selectedTask?.title}" as done?</p>
            <div className="mt-4 flex justify-center space-x-4">
              <button
                onClick={markAsDone}
                className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-500"
              >
                Yes
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="bg-red-600 text-white px-4 py-2 rounded shadow hover:bg-red-500"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default authUser (TodoPage);