import React, { useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface ArchivedTask {
  id: number;
  title: string;
  description: string;
  status: string;
  deadline: string;
  archived: number;
}

export default function Archive() {
  const [archivedTasks, setArchivedTasks] = useState<ArchivedTask[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedTask, setSelectedTask] = useState<ArchivedTask | null>(null);
  const tasksPerPage = 2;
  const [showTable, setShowTable] = useState<boolean>(false);

  useEffect(() => {
    fetchArchivedTasks();
  }, []);

  const fetchArchivedTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("https://infinitech-api5.site/api/archived-tasks");
      setArchivedTasks(response.data);
      setShowTable(true);
    } catch (error) {
      setError("Failed to fetch archived tasks.");
      console.error("Error fetching archived tasks:", error);
      toast.error("Failed to fetch archived tasks.", { autoClose: 3000 });
    } finally {
      setLoading(false);
    }
  };

  const restoreTask = async (taskId: number) => {
    try {
      const response = await axios.put(`https://infinitech-api5.site/api/tasks/restore/${taskId}`);
      if (response.status === 200 && response.data.task.archived === 0) {
        setArchivedTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
        toast.success("Task restored successfully!", { autoClose: 3000 });
      }
    } catch (error) {
      console.error("Error restoring task:", error);
      toast.error("Failed to restore task.", { autoClose: 3000 });
    }
  };

  const totalPages = Math.ceil(archivedTasks.length / tasksPerPage);
  const currentTasks = archivedTasks.slice(
    (currentPage - 1) * tasksPerPage,
    currentPage * tasksPerPage
  );

  return (
    <section className="p-4 bg-white text-gray-800 rounded-lg shadow-md max-w-full mx-auto">
      <h3 className="text-lg font-bold bg-gray-100 p-3 rounded border border-gray-300 mb-4 text-center">
        📦 Archived Tasks
      </h3>

      {loading ? (
        <p>Loading archived tasks...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : archivedTasks.length === 0 ? (
        <p>No archived tasks found.</p>
      ) : (
        <div>
          {/* Mobile Card Design */}
          <div className="block md:hidden">
            {currentTasks.map((task) => (
              <div key={task.id} className="border border-gray-300 rounded-lg p-4 mb-4 shadow-md">
                <h4
                  className="font-bold text-lg text-blue-700 cursor-pointer"
                  onClick={() => setSelectedTask(task)}
                >
                  {task.title}
                </h4>
                <p>
                  {task.description.length > 30
                    ? `${task.description.slice(0, 30)}...`
                    : task.description}
                </p>
                <p>Status: {task.status}</p>
                <p>Deadline: {task.deadline}</p>
                <button
                  onClick={() => restoreTask(task.id)}
                  className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-500 text-xs mt-2"
                >
                  🔄 Restore
                </button>
              </div>
            ))}
          </div>

          {/* Table Design for larger screens */}
          <div className="hidden md:block">
            <table className="w-full min-w-[600px] border border-gray-300 text-sm text-left">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 border border-gray-300">ID</th>
                  <th className="p-3 border border-gray-300">Title</th>
                
                  <th className="p-3 border border-gray-300">Status</th>
                  <th className="p-3 border border-gray-300">Deadline</th>
                  <th className="p-3 border border-gray-300 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {currentTasks.map((task) => (
                  <tr key={task.id} className="hover:bg-gray-50">
                    <td className="p-3 border border-gray-300">{task.id}</td>
                    <td
                      className="p-3 border border-gray-300 font-medium text-blue-700 cursor-pointer"
                      onClick={() => setSelectedTask(task)}
                    >
                      {task.title}
                    </td>
                   
                    <td className="p-3 border border-gray-300">{task.status}</td>
                    <td className="p-3 border border-gray-300">{task.deadline}</td>
                    <td className="p-3 border border-gray-300 text-center">
                      <button
                        onClick={() => restoreTask(task.id)}
                        className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-500 text-xs"
                      >
                        🔄 Restore
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-4 flex flex-col md:flex-row justify-center items-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-gray-200 text-sm rounded hover:bg-gray-300 disabled:opacity-50"
              >
                ◀️ Previous
              </button>
              <span className="text-sm font-medium">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-gray-200 text-sm rounded hover:bg-gray-300 disabled:opacity-50"
              >
                Next ▶️
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer />

      {selectedTask && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-2">
    <div className="bg-white rounded-lg p-4 sm:p-6 shadow-lg w-full max-w-md relative max-h-[90vh] overflow-y-auto">
      <button
        onClick={() => setSelectedTask(null)}
        className="absolute top-2 right-3 text-gray-500 hover:text-gray-700 text-2xl font-bold"
      >
        &times;
      </button>
      <h2 className="text-lg sm:text-xl font-bold mb-2 text-center">
        {selectedTask.title}
      </h2>
      <p className="text-sm text-gray-700 whitespace-pre-wrap text-justify">
        {selectedTask.description}
      </p>
    </div>
  </div>
)}

    </section>
  );
}
