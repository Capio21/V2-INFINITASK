"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Head from "next/head";
import TaskForm from "./form";
import Archive from "./Archive";
import Adminbar from "../Components/adminsidebar";
import authUser from "../utils/authUser";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const API_BASE_URL = "https://infinitech-api5.site/api";

interface Task {
  id: number;
  user_id: number;
  title: string;
  description: string;
  status: string;
  deadline: string;
  time_started: string;
  time_ended: string;
  time_spent: string;
  progress: string;
  created_at: string;
  updated_at: string;
  archived?: boolean;
  visibility?: string;
  tags: string;

}

const Dashboard = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [archivedTasks, setArchivedTasks] = useState<Task[]>([]);
  const [showTableModal, setShowTableModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 8;
  const totalPages = Math.ceil(tasks.length / itemsPerPage);
  const currentTasks = tasks.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);
  const [activeTab, setActiveTab] = useState<'active' | 'archived'>('active');
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [actionToConfirm, setActionToConfirm] = useState<() => void>(() => () => { });
  const [confirmMessage, setConfirmMessage] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const router = useRouter();

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/notArchive`);
        setTasks(response.data);
      } catch (error) {
        console.error("Error fetching tasks:", error);
        toast.error("Error fetching tasks.");
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("authToken");
    sessionStorage.removeItem("userRole");
    router.push("/login");
  };

  const editTask = (task: Task) => {
    setEditingTask(task);
    setShowTableModal(true);
  };

  const archiveTask = async (taskId: number) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/tasks/${taskId}/archive`);
      if (response.status === 200) {
        toast.success("Task archived successfully!");
        setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
        setArchivedTasks((prevArchived) => [...prevArchived, response.data]);
      }
    } catch (error) {
      console.error("Error archiving task:", error);
      toast.error("Failed to archive task.");
    }
  };

  const deleteTask = async (taskId: number) => {
    try {
      await axios.delete(`${API_BASE_URL}/tasks/${taskId}`);
      setTasks(tasks.filter((task) => task.id !== taskId));
      toast.success("Task deleted successfully!");
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error("Failed to delete task.");
    }
  };

  const confirmDeleteTask = (taskId: number) => {
    setConfirmMessage("Are you sure you want to delete this task?");
    setActionToConfirm(() => () => deleteTask(taskId));
    setConfirmModalOpen(true);
  };

  const confirmArchiveTask = (taskId: number) => {
    setConfirmMessage("Are you sure you want to archive this task?");
    setActionToConfirm(() => () => archiveTask(taskId));
    setConfirmModalOpen(true);
  };

  const toggleVisibility = async (taskId: number) => {
    try {
      setLoading(true);
      await axios.put(`${API_BASE_URL}/tasks/${taskId}/toggle-visibility`);
      const updatedTasks = await axios.get(`${API_BASE_URL}/notArchive`);
      setTasks(updatedTasks.data);
      toast.success("Task visibility updated!");
    } catch (error) {
      console.error("Error updating visibility:", error);
      toast.error("Failed to update visibility.");
    } finally {
      setLoading(false);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      <Head>
        <title>Users List | Infi-Admin</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="flex min-h-screen bg-white text-gray-800">
        <ToastContainer position="top-right" autoClose={3000} />
        <Adminbar />
        <div className="sticky top-0 h-screen w-64 bg-blue-100 shadow-lg hidden md:block"></div>

        <main className="flex-1 p-4 md:p-6 lg:p-10">
          <div className="bg-white rounded-lg shadow-xl p-4 md:p-6 lg:p-10 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <br />
              <br />
              <h1 className="text-xl md:text-4xl font-bold text-blue-800 text-center">
                TASK MANAGER <span className="text-blue-800 font-bold">| Admin</span>
              </h1>


              <button
                onClick={() => setShowTableModal(true)}
                className="mt-4 md:mt-0 px-4 py-2 text-base font-semibold text-white bg-blue-600 border border-blue-700 rounded-md shadow-sm hover:bg-blue-700 transition duration-300"
              >
                + Add Task
              </button>
            </div>

            {/* Tab Navigation */}
            {/* Mobile Dropdown */}
            <div className="block md:hidden mb-4">
              <select
                value={activeTab}
                onChange={(e) => setActiveTab(e.target.value)}
                className="w-full px-4 py-2 rounded bg-blue-200 text-gray-800"
              >
                <option value="active">Active Tasks</option>
                <option value="archived">Archived Tasks</option>
              </select>
            </div>

            {/* Desktop Buttons */}
            <div className="hidden md:flex flex-row space-x-4 mb-4">
              <button
                onClick={() => setActiveTab('active')}
                className={`flex-1 px-4 py-2 rounded ${activeTab === 'active' ? 'bg-blue-600 text-white' : 'bg-blue-200 text-gray-800'}`}
              >
                Active Tasks
              </button>
              <button
                onClick={() => setActiveTab('archived')}
                className={`flex-1 px-4 py-2 rounded ${activeTab === 'archived' ? 'bg-blue-600 text-white' : 'bg-blue-200 text-gray-800'}`}
              >
                Archived Tasks
              </button>
            </div>


            {/* Task Display */}
            {activeTab === 'active' ? (
          <>
          {/* Table for Desktop */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full text-sm text-left text-gray-800 bg-white border border-blue-300 rounded-lg shadow-md">
              <thead className="bg-blue-600 text-white">
                <tr>
                  <th className="px-2 py-3 text-center">Task Name</th>
                  <th className="px-2 py-3 text-center">Task Details</th>
                  <th className="px-2 py-3 text-center">Assigned To</th>
                  <th className="px-2 py-3 text-center">Target Time</th>
                  <th className="px-2 py-3 text-center">Time Ended</th>
                  <th className="px-2 py-3 text-center">Due Date</th>
                  <th className="px-2 py-3 text-center">Status</th>
                  <th className="px-2 py-3 text-center">Tags</th>
                  <th className="px-2 py-3 text-center">Visibility</th>
                  <th className="px-2 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentTasks.map((task) => (
                  <tr key={task.id} className="border-t border-blue-300 hover:bg-blue-50">
                    <td className="px-2 py-3 font-bold text-center">{task.title}</td>
                    <td className="px-2 py-3 font-bold text-center">{task.description}</td>
                    <td className="px-2 py-3 font-bold text-center">{task.user?.username}</td>
                    <td className="px-2 py-3 font-bold text-center">{task.deadline}</td>
                    <td className="px-2 py-3 font-bold text-center">{task.time_started}</td>
                    <td className="px-2 py-3 font-bold text-center">{task.time_ended}</td>
                    <td className="px-2 py-3 font-bold text-center">
                      <span className={`px-3 py-1 rounded text-white ${task.status === "done" ? "bg-green-600" :
                        task.status === "pending" ? "bg-yellow-500" :
                          task.status === "overdue" ? "bg-red-600" : "bg-gray-500"
                        }`}>
                        {task.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-2 py-3 font-bold text-center">{task.tags}</td>
                    <td className="px-2 py-3 font-bold text-center">
                      {task.visibility === "visible" ? "🔵 Visible" : "⚫ Invisible"}
                    </td>
                    <td className="px-2 py-3 text-center space-x-1">
                      <button onClick={() => editTask(task)} className="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700">✏️ Edit</button>
                      <button onClick={() => confirmDeleteTask(task.id)} className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700">🗑️ Delete</button>
                      <button onClick={() => confirmArchiveTask(task.id)} className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600">📦 Archive</button>
                      <button onClick={() => toggleVisibility(task.id)} disabled={loading} className={`px-2 py-1 rounded text-white ${task.visibility === "visible" ? "bg-green-600" : "bg-gray-500"}`}>
                        {task.visibility === "visible" ? "Hide" : "Show"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        
          {/* Card Layout for Mobile */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:hidden">
            {currentTasks.map((task) => (
              <div key={task.id} className="bg-white border border-blue-300 rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow duration-300">
                <h2 className="text-lg font-semibold text-center">{task.title}</h2>
                <p className="text-gray-600 text-center">{task.description}</p>
                <div className="mt-2 text-center">
                          <span className={`px-2 py-1 rounded text-white ${task.status === "done" ? "bg-green-600" :
            task.status === "pending" ? "bg-yellow-500" :
              task.status === "overdue" ? "bg-red-600" : "bg-gray-500"
            }`}>
            {task.status.toUpperCase()}
          </span>
        </div>
        <div className="mt-2 text-center">
          <p className="font-bold"><strong>Due Date:</strong> {task.deadline}</p>
          <p className="font-bold"><strong>Visibility:</strong> {task.visibility === "visible" ? "🔵 Visible" : "⚫ Invisible"}</p>
        </div>
        <div className="mt-4 flex justify-between">
          <button onClick={() => editTask(task)} className="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700">✏️ Edit</button>
          <button onClick={() => confirmDeleteTask(task.id)} className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700">🗑️ Delete</button>
          <button onClick={() => confirmArchiveTask(task.id)} className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600">📦 Archive</button>
          <button onClick={() => toggleVisibility(task.id)} disabled={loading} className={`px-2 py-1 rounded text-white ${task.visibility === "visible" ? "bg-green-600" : "bg-gray-500"}`}>
            {task.visibility === "visible" ? "Hide" : "Show"}
          </button>
        </div>
      </div>
    ))}
  </div>
</>
            ) : (
              <div className="pt-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-2">Archived Tasks</h2>
                <div className="max-h-96 overflow-y-auto bg-blue-100 p-4 rounded-lg">
                  <Archive />
                </div>
              </div>
            )}

            {/* Pagination for Active Tasks */}
            {activeTab === 'active' && (
              <div className="flex justify-between items-center mt-6">
                <button onClick={handlePreviousPage} disabled={currentPage === 0} className="py-2 px-4 bg-blue-600 text-white rounded disabled:opacity-50">Previous</button>
                <button onClick={handleNextPage} disabled={currentPage === totalPages - 1} className="py-2 px-4 bg-blue-600 text-white rounded disabled:opacity-50">Next</button>
              </div>
            )}
          </div>
        </main>

        {/* Task Modal */}
        {showTableModal && (
          <div className="fixed inset-y-0 right-0 w-[90%] md:w-[600px] bg-white p-6 shadow-2xl border-l border-blue-500 z-50 overflow-y-auto transition duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">Create Task</h3>
              <button onClick={() => setShowTableModal(false)} className="text-white bg-blue-600 px-4 py-2 rounded hover:bg-blue-700">Close</button>
            </div>

            <div className="space-y-4">
              <TaskForm
                tasks={tasks}
                setTasks={setTasks}
                editingTask={editingTask}
                setEditingTask={setEditingTask}
              />
            </div>
          </div>
        )}

        {/* Confirmation Modal */}
        {confirmModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded shadow-lg">
              <h2 className="text-lg font-bold mb-4">Confirmation</h2>
              <p>{confirmMessage}</p>
              <div className="flex justify-end mt-4">
                <button onClick={() => setConfirmModalOpen(false)} className="mr-2 px-4 py-2 bg-gray-300 rounded">Cancel</button>
                <button onClick={() => {
                  actionToConfirm();
                  setConfirmModalOpen(false);
                }} className="px-4 py-2 bg-blue-600 text-white rounded">Confirm</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default authUser(Dashboard);