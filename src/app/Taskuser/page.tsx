"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Sidebar from "../Components/Sidebar";
import authUser from "../utils/authUser";
import Confirmation from "./Confirmation"; // Import the modal component
import Archive from "./Archive"; // Import the archive modal component

import { ToastContainer, toast } from "react-toastify"; // Import toast and ToastContainer
import "react-toastify/dist/ReactToastify.css"; // Import CSS for toast notifications

import { ChevronLeft, ChevronRight } from "lucide-react";

interface Activity {
  id: number;
  title: string;
  description?: string[];
  date_started: string;
  due_date: string;
  tags?: string;
  status: "pending" | "complete" | "overdue";
  archive: boolean;
  dependencyId?: number;
  collaborators?: number[]; // New field for collaborators
  collaborator_name?: string;
}

const API_BASE_URL = "https://infinitech-api5.site/api";

const ProgressBar = ({ percentage }: { percentage: number }) => {
  return (
    <div className="w-full bg-blue-300 rounded-full shadow-inner p-1">
      <div
        className="bg-blue-600 text-xs font-bold text-white text-center p-1 leading-none rounded-full transition-all duration-300 shadow-md"
        style={{
          width: `${percentage}%`,
        }}
      >
        {percentage.toFixed(0)}%
      </div>
    </div>
  );
};

const ActivityPage = () => {
  const [userId, setUserId] = useState("");
  const [activities, setActivities] = useState<Activity[]>([]);
  const [formData, setFormData] = useState<Partial<Activity>>({
    title: "",
    description: [""], // Initialize as an array
    date_started: "",
    due_date: "",
    tags: "",
    status: "pending",
    archive: false,
    dependencyId: undefined,
    collaborators: [], // Initialize collaborators
  });
  const [open, setOpen] = useState(false);
  const statuses = ["Pending", "Complete", "Overdue", "Archived"];
  const [isOpen, setIsOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [selectedStatus, setSelectedStatus] = useState("pending");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 1;
  const router = useRouter();
  const [dependencies, setDependencies] = useState<Activity[]>([]);
  const [users, setUsers] = useState<{ id: number; username: string }[]>([]); // New state for users
  const [activityData, setActivityData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const alarmSound = new Audio("/alarm-sound.mp3");

  const playAlarm = () => {
    alarmSound.currentTime = 0;

    alarmSound.play().catch((error) => {
      console.error("Error playing alarm sound:", error);
    });
  };

  const fetchActivities = async () => {
    try {
      const authToken = sessionStorage.getItem("authToken");
      if (!authToken) {
        console.error("No authToken found in sessionStorage.");
        return;
      }
      const response = await axios.get(
        `${API_BASE_URL}/activities/${authToken}`
      );
      setActivities(response.data);
      setDependencies(response.data);
    } catch (error) {
      console.error("Error fetching activities:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/users`); // Adjust the endpoint as necessary
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 430); // iPhone 14 width is 430px
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const checkAlarms = setInterval(async () => {
      const now = new Date();
      for (const activity of activities) {
        const activityTime = new Date(activity.due_date);
        if (activity.status === "pending") {
          if (activityTime < now) {
            await handleOverdue(activity.id);
          } else {
            if (
              activityTime.getFullYear() === now.getFullYear() &&
              activityTime.getMonth() === now.getMonth() &&
              activityTime.getDate() === now.getDate() &&
              activityTime.getHours() === now.getHours() &&
              activityTime.getMinutes() - 1 === now.getMinutes()
            ) {
              playAlarm(); // Trigger alarm at exact time
            }
          }
        }
      }
    }, 500);

    return () => clearInterval(checkAlarms);
  }, [activities]);

  useEffect(() => {
    fetchActivities();
    fetchUsers(); // Fetch users when the component mounts

    const userIdSetter = async () => {
      const authToken = sessionStorage.getItem("authToken");
      const userResponse = await axios.get(`${API_BASE_URL}/user/${authToken}`);
      setUserId(userResponse.data.id);
    };
    userIdSetter();
  }, []);

  const handleDescriptionChange = (index: number, value: string) => {
    const updatedDescriptions = [...(formData.description || [])];
    updatedDescriptions[index] = value;
    setFormData({ ...formData, description: updatedDescriptions });
  };

  const addDescriptionField = () => {
    setFormData({
      ...formData,
      description: [...(formData.description || []), ""],
    });
  };

  const removeDescriptionField = (index: number) => {
    const updatedDescriptions = [...(formData.description || [])];
    updatedDescriptions.splice(index, 1);
    setFormData({ ...formData, description: updatedDescriptions });
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.title) {
      toast.error("Title is required.");
      return;
    }

    if (!formData.description) {
      toast.error("Description is required.");
      return;
    }

    if (!formData.date_started) {
      toast.error("Start date is required.");
      return;
    }

    if (!formData.due_date) {
      toast.error("Due date is required.");
      return;
    }

    // Check if tags are required and validate
    if (!formData.tags) {
      toast.error("At least one tag is required.");
      return;
    }

    // Convert dates to Date objects for comparison
    const dateStarted = new Date(formData.date_started);
    const dueDate = new Date(formData.due_date);

    if (dueDate <= dateStarted) {
      toast.error("Due date must be after the start date.");
      return;
    }

    try {
      const authToken = sessionStorage.getItem("authToken");
      if (!authToken) {
        console.error("No authToken found in sessionStorage.");
        return;
      }

      const userResponse = await axios.get(`${API_BASE_URL}/user/${authToken}`);
      setUserId(userResponse.data.id);

      if (!userId) {
        console.error("User  ID not found.");
        return;
      }

      // Include all relevant fields in the newFormData
      const newFormData = {
        ...formData,
        user_id: userId,
        collaborators: formData.collaborators || [],
      };

      if (editId) {
        await axios.put(`${API_BASE_URL}/activities/${editId}`, newFormData);
        toast.success("Activity updated successfully!");
      } else {
        await axios.post(`${API_BASE_URL}/activities`, newFormData);
        toast.success("Activity created successfully!");
      }

      resetForm();
      fetchActivities();
    } catch (error: any) {
      console.error(
        "Error submitting form:",
        error.response?.data || error.message
      );
      toast.error(
        "An error occurred while submitting the form. Please try again."
      );
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: [""],
      date_started: "",
      due_date: "",
      tags: "",
      status: "pending",
      archive: false,
      dependencyId: undefined,
      collaborators: [],
    });
    setEditId(null);
    setIsOpen(false);
  };

  const handleEdit = (activity: Activity) => {
    // Check if the description is a string and parse it
    let splitDescriptions: string[];
    if (typeof activity.description === "string") {
      try {
        // Parse the string to an array
        splitDescriptions = JSON.parse(activity.description);
      } catch (error) {
        console.error("Error parsing description:", error);
        splitDescriptions = []; // Fallback to an empty array if parsing fails
      }
    } else {
      // If it's already an array, use it directly
      splitDescriptions = Array.isArray(activity.description)
        ? activity.description
        : [activity.description || ""];
    }

    // Log the split descriptions
    console.log("Split Descriptions:", splitDescriptions);

    setFormData({
      title: activity.title,
      description: splitDescriptions, // Ensure this is an array
      date_started: activity.date_started,
      due_date: activity.due_date,
      tags: activity.tags || "",
      status: activity.status,
      archive: activity.archive,
      dependencyId: activity.dependencyId,
      collaborators: activity.collaborators || [], // Set collaborators for editing
    });
    setEditId(activity.id);
    setIsOpen(true);
  };

  const handleDeleteClick = (id: number) => {
    setSelectedId(id);
    setIsModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedId !== null) {
      try {
        await axios.delete(`${API_BASE_URL}/activities/${selectedId}`);
        toast.success("Activity deleted successfully!");
        fetchActivities();
      } catch (error) {
        console.error("Error deleting activity:", error);
        toast.error("Error deleting activity.");
      }
      setIsModalOpen(false);
    }
  };

  const handleMarkAsDone = async (id: number) => {
    try {
      await axios.put(`${API_BASE_URL}/activities/${id}/done`);
      toast.success("Activity marked as done!"); // Use toast for success message
      fetchActivities();
    } catch (error) {
      console.error("Error marking activity as done:", error);
      toast.error("Error marking activity as done."); // Use toast for error message
    }
  };

  const handleArchiveClick = (id: number) => {
    setSelectedId(id);
    setIsArchiveModalOpen(true);
  };

  const handleArchiveConfirm = async () => {
    if (selectedId !== null) {
      try {
        await axios.put(`${API_BASE_URL}/activities/${selectedId}/archive`);
        toast.success("Activity archived successfully!");
        fetchActivities();
      } catch (error) {
        console.error("Error archiving activity:", error);
        toast.error("Error archiving activity.");
      }
      setIsArchiveModalOpen(false);
    }
  };

  const handleRestore = async (id: number) => {
    try {
      await axios.put(`${API_BASE_URL}/activities/${id}/restore`);
      toast.success("Activity restored successfully!"); // Use toast for success message
      fetchActivities();
    } catch (error) {
      console.error("Error restoring activity:", error);
      toast.error("Error restoring activity."); // Use toast for error message
    }
  };

  const handleOverdue = async (id: number) => {
    try {
      console.log(`Updating activity ${id} to overdue status.`);
      const response = await axios.put(
        `${API_BASE_URL}/activities/${id}/overdue`
      );
      console.log("Response from server:", response.data);
      fetchActivities();
    } catch (error) {
      console.error("Error updating activity to overdue:", error);
      if (axios.isAxiosError(error)) {
        console.error("Axios error:", error.response?.data);
      }
    }
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const totalPages = Math.ceil(
    (selectedStatus !== "archived"
      ? activities.filter(
          (activity) => activity.status === selectedStatus && !activity.archive
        ).length
      : activities.filter((activity) => activity.archive).length) / itemsPerPage
  );
  const currentActivities = (
    selectedStatus !== "archived"
      ? activities.filter(
          (activity) => activity.status === selectedStatus && !activity.archive
        )
      : activities.filter((activity) => activity.archive)
  ).slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const completedActivities = activities.filter(
    (activity) => activity.status === "complete"
  ).length;
  const totalActivities = activities.length;
  const completionPercentage =
    totalActivities > 0 ? (completedActivities / totalActivities) * 100 : 0;
  const [isMobile, setIsMobile] = useState(false);
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="relative flex min-h-screen bg-gray-900 text-gray-900">
      <ToastContainer position="top-right" autoClose={3000} />
      <Sidebar />
      <div className="sticky top-0 h-screen w-64 bg-blue-100 shadow-lg hidden md:block"></div>
      <div className="flex-1 p-4 md:p-6 lg:p-8">
        <br />
        <br />
        <br />

        <div className="flex items-center justify-center mb-6">
          <div className="flex-grow border-t border-blue-300"></div>
          <span className="mx-10 text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-300">
            PERSONAL TASK
          </span>
          <div className="flex-grow border-t border-blue-300"></div>
        </div>
        <ProgressBar percentage={completionPercentage} />
        <div className="mt-4">
        <div className="w-full flex flex-col md:flex-row md:justify-between items-center mb-6 px-4 gap-4">
          

  {/* Button Section */}
  <div className="w-full md:w-auto flex flex-col md:flex-row items-center justify-center gap-4">
    
    {/* STATUS Button with Dropdown */}
    <div className="relative w-full md:w-auto">
      <button
        onClick={() => setOpen(!open)}
        className="w-full md:w-auto px-6 py-2 text-lg font-bold text-white bg-blue-600 border border-blue-300 rounded-lg shadow-md transition hover:bg-blue-500 hover:border-blue-200 active:bg-blue-400"
      >
        STATUS
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className={`absolute z-50 bg-blue-100 p-4 rounded-lg shadow-lg border border-blue-300 transition-all duration-300
            ${isMobile ? "w-full left-1/2 transform -translate-x-1/2 mt-2 top-full" : "w-[500px] left-full ml-3 top-0"}`}
        >
          <div className={`grid ${isMobile ? "grid-cols-1" : "grid-cols-4"} gap-3`}>
            {statuses.map((status) => (
            <button
  key={status}
  className={`flex items-center justify-center w-full px-3 py-2 rounded-md transition
    ${selectedStatus === status.toLowerCase()
      ? "bg-blue-400 text-white"
      : "bg-blue-200 text-blue-800 hover:bg-blue-300"}
  `}
  onClick={() => {
    setSelectedStatus(status.toLowerCase());
    setOpen(false);
  }}
>
  <span className="text-xl">
    {status === "Pending"
      ? "⏳"
      : status === "Complete"
      ? "✅"
      : status === "Overdue"
      ? "❌"
      : status === "Archived"
      ? "📦"
      : "❓"}
  </span>
  {!isMobile && <span className="ml-2 text-sm font-medium">{status}</span>}
</button>

            ))}
          </div>
        </div>
      )}
    </div>

    {/* CREATE/CANCEL Button */}
    <button
      onClick={() => setIsOpen((prev) => !prev)}
      className="w-full md:w-auto px-6 py-2 text-lg font-bold text-white bg-blue-600 border border-blue-300 rounded-lg shadow-md transition hover:bg-blue-500 hover:border-blue-200 active:bg-blue-400"
    >
      {isOpen ? "CANCEL" : "CREATE"}
    </button>
  </div>

  {/* Progress Bar Section */}
  <div className="w-full md:w-auto mt-4 md:mt-0">

  </div>
</div>

<div className="flex justify-center w-full px-4 sm:px-6 bg-[#0f0f1a] min-h-screen">
  <div className="w-full max-w-auto p-4 sm:p-6 rounded-lg">
    <div className="max-h-[90vh] overflow-y-auto">
      {currentActivities.length > 0 && (
        <div className="relative p-6 sm:p-8 bg-[#1a1a2e] text-cyan-200 rounded-xl shadow-xl flex flex-col w-full border border-cyan-400/20 backdrop-blur-md">
          {/* Status Badge */}
          <span
            className={`absolute top-4 right-4 px-3 py-1 text-xs sm:text-sm font-semibold rounded-full border uppercase glow-shadow 
              ${
                currentActivities[0].status === "pending"
                  ? "bg-yellow-900 text-yellow-300 border-yellow-400"
                  : currentActivities[0].status === "complete"
                  ? "bg-green-900 text-green-300 border-green-400"
                  : "bg-red-900 text-red-300 border-red-400"
              }`}
          >
            📌 {currentActivities[0].status.toUpperCase()}
          </span>

          <br />

          {/* Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 text-sm sm:text-base mb-8">
            <div className="bg-[#2a2a40] p-4 rounded-lg shadow-md border border-cyan-400/20 text-center">
              <p className="text-cyan-300 font-semibold mb-1">📝 Title</p>
              <p className="text-cyan-100">{currentActivities[0].title}</p>
            </div>

            <div className="bg-[#2a2a40] p-4 rounded-lg shadow-md border border-cyan-400/20 text-center">
              <p className="text-cyan-300 font-semibold mb-1">📅 Due</p>
              <p className="text-cyan-100">
                {new Date(currentActivities[0].due_date).toLocaleDateString(
                  "en-US",
                  { month: "long", day: "numeric", year: "numeric" }
                ).toUpperCase()}{" "}
                ⏰{" "}
                {new Date(currentActivities[0].due_date).toLocaleTimeString(
                  "en-US",
                  { hour: "2-digit", minute: "2-digit", hour12: true }
                )}
              </p>
            </div>

            <div className="bg-[#2a2a40] p-4 rounded-lg shadow-md border border-cyan-400/20 text-center">
              <p className="text-cyan-300 font-semibold mb-1">🏷️ Tags</p>
              <p className="text-cyan-100">{currentActivities[0].tags}</p>
            </div>

            <div className="bg-[#2a2a40] p-4 rounded-lg shadow-md border border-cyan-400/20 text-center md:col-span-3">
              <p className="text-cyan-300 font-semibold mb-1">👥 Collaborators</p>
              <p className="text-cyan-100">
                {currentActivities[0].collaborator_name}
              </p>
            </div>
          </div>

          {/* Task Description List */}
          <div className="mt-4">
            <div className="w-full bg-[#1e1e30] shadow-md rounded-lg border border-cyan-400/20">
              <div className="bg-gradient-to-r from-cyan-500 to-fuchsia-600 text-white text-center py-4 text-lg font-semibold rounded-t-lg">
                📋 Task Description List
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-4">
                {currentActivities[0].description
                  .replace(/[\[\]"]/g, "")
                  .replace(/\s+/g, " ")
                  .split(",")
                  .map((item, index) => (
                    <div
                      key={index}
                      className="bg-[#2a2a40] border border-cyan-400/20 rounded-md p-3 text-sm sm:text-base text-cyan-100 shadow-sm hover:bg-[#3b3b5c] transition"
                    >
                      {index + 1}. {item.trim()}
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Buttons Section */}
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            {currentActivities[0].status !== "overdue" && (
              <button
                onClick={() => handleEdit(currentActivities[0])}
                className="px-4 py-2 rounded-md bg-cyan-600 text-white text-sm font-medium hover:bg-cyan-500 transition glow-shadow"
              >
                ✏️ Edit
              </button>
            )}

            {currentActivities[0].status === "pending" &&
              !currentActivities[0].archive && (
                <button
                  onClick={() => handleMarkAsDone(currentActivities[0].id)}
                  className="px-4 py-2 rounded-md bg-green-600 text-white text-sm font-medium hover:bg-green-500 transition glow-shadow"
                >
                  ✅ Done
                </button>
              )}

            {currentActivities[0].archive ? (
              <button
                onClick={() => handleRestore(currentActivities[0].id)}
                className="px-4 py-2 rounded-md bg-yellow-500 text-white text-sm font-medium hover:bg-yellow-400 transition glow-shadow"
              >
                🔄 Restore
              </button>
            ) : (
              <button
                onClick={() => handleArchiveClick(currentActivities[0].id)}
                className="px-4 py-2 rounded-md bg-yellow-500 text-white text-sm font-medium hover:bg-yellow-400 transition glow-shadow"
              >
                📁 Archive
              </button>
            )}

            <button
              onClick={() => handleDeleteClick(currentActivities[0].id)}
              className="px-4 py-2 rounded-md bg-red-600 text-white text-sm font-medium hover:bg-red-500 transition glow-shadow"
            >
              🗑️ Delete
            </button>
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-6 text-xs sm:text-sm text-cyan-300">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="bg-cyan-600 p-2 rounded text-white flex items-center gap-1 hover:bg-cyan-500 disabled:opacity-50 glow-shadow"
            >
              <ChevronLeft size={16} /> Prev
            </button>
            <span className="font-semibold">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="bg-cyan-600 p-2 rounded text-white flex items-center gap-1 hover:bg-cyan-500 disabled:opacity-50 glow-shadow"
            >
              Next <ChevronRight size={16} />
            </button>
          </div>

          {/* Modals */}
          <Confirmation
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onConfirm={handleDeleteConfirm}
            title="Delete Activity"
            message="Are you sure you want to delete this activity? This action cannot be undone."
          />
          <Archive
            isOpen={isArchiveModalOpen}
            onClose={() => setIsArchiveModalOpen(false)}
            onConfirm={handleArchiveConfirm}
            title="Archive Activity"
            message="Are you sure you want to archive this activity? You can restore it later."
          />
        </div>
      )}
    </div>
  </div>
</div>


          {/* Pagination Controls */}
        </div>

        {/* Right Sidebar for Adding/Editing Activity */}
        <div
          className={`fixed inset-y-0 right-0 transform transition-transform duration-300 ${
            isOpen ? "translate-x-0" : "translate-x-full"
          }  bg-blue-100 w-full max-w-md p-6 sm:p-10 shadow-2xl rounded-l-lg z-50 border-4 border-blue-700`}
        >
          <button
            onClick={() => resetForm()}
            className="absolute top-4 right-4 text-gray-900 text-2xl font-bold hover:text-gray-600"
          >
            ×
          </button>

          <h2 className="text-xl sm:text-2xl font-bold mb-6 text-center text-blue-600">
            {editId ? "EDIT" : "ADD"} TASK
          </h2>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4 sm:gap-6 overflow-y-auto max-h-[80vh] pr-2"
          >
            {/* Title */}
            <div className="flex flex-col">
              <label
                className="text-gray-900 text-lg font-bold"
                htmlFor="title"
              >
                Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                placeholder="Add title here"
                value={formData.title}
                onChange={handleChange}
                className="bg-transparent border-b-2 border-blue-300 text-gray-900 text-lg p-2 focus:outline-none focus:border-blue-500 font-bold"
                required
              />
            </div>

            {/* Descriptions Section */}
            <div className="flex flex-col">
              <label className="text-gray-900 text-lg font-bold">
                Descriptions
              </label>

              <div className="grid grid-cols-1 gap-4 max-h-60 overflow-y-auto pr-1">
                {(formData.description || []).map((desc, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder={`Task ${index + 1}`}
                      value={desc}
                      onChange={(e) =>
                        handleDescriptionChange(index, e.target.value)
                      }
                      className="flex-grow bg-transparent border-b-2 border-blue-300 text-gray-900 text-lg p-2 focus:outline-none focus:border-blue-500 font-bold"
                    />
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => removeDescriptionField(index)}
                        className="text-red-500 font-bold"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={addDescriptionField}
                className="mt-3 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold py-2 px-4 rounded shadow-md transition-all w-fit"
              >
                + Add Task
              </button>
            </div>

            {/* Date Started */}
            <div className="flex flex-col">
              <label
                className="text-gray-900 text-lg font-bold"
                htmlFor="date_started"
              >
                Date Started
              </label>
              <input
                type="date"
                id="date_started"
                name="date_started"
                value={formData.date_started}
                onChange={handleChange}
                className="bg-transparent border-b-2 border-blue-300 text-gray-900 text-lg p-2 focus:outline-none focus:border-blue-500 font-bold"
                required
              />
            </div>

            {/* Due Date */}
            <div className="flex flex-col">
              <label
                className="text-gray-900 text-lg font-bold"
                htmlFor="due_date"
              >
                Due Date
              </label>
              <input
                type="datetime-local"
                id="due_date"
                name="due_date"
                value={formData.due_date}
                onChange={handleChange}
                className="bg-transparent border-b-2 border-blue-300 text-gray-900 text-lg p-2 focus:outline-none focus:border-blue-500 font-bold"
                required
              />
            </div>

            {/* Tags */}
            <div className="flex flex-col">
              <label className="text-gray-900 text-lg font-bold" htmlFor="tags">
                Tags
              </label>
              <input
                type="text"
                id="tags"
                name="tags"
                placeholder="Add tags here"
                value={formData.tags}
                onChange={handleChange}
                className="bg-transparent border-b-2 border-blue-300 text-gray-900 text-lg p-2 focus:outline-none focus:border-blue-500 font-bold"
              />
            </div>

            {/* Collaborators */}
            <div className="flex flex-col gap-2">
              <label
                className="text-gray-900 text-lg font-bold"
                htmlFor="collaborators"
              >
                Collaborators
              </label>
              <select
                id="collaborators"
                name="collaborators"
                value={formData.collaborators?.[0] || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    collaborators: [parseInt(e.target.value)],
                  })
                }
                className="bg-blue-100 text-gray-900 text-lg p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
              >
                <option value="" disabled>
                  Select a collaborator
                </option>
                {users
                  .filter((user) => user.id !== Number(userId))
                  .map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.username}
                    </option>
                  ))}
              </select>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="bg-blue-600 text-white text-lg font-bold py-3 rounded-lg shadow-md hover:bg-blue-500 transition-all"
            >
              {editId ? "UPDATE" : "ADD"} TASK
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default authUser(ActivityPage);
