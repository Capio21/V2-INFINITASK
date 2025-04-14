"use client"


import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Head from "next/head";
import Adminbar from "../Components/adminsidebar";
import { FiMoreVertical, FiChevronLeft, FiChevronRight, FiSearch } from "react-icons/fi";
import authUser  from "../utils/authUser";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import jsPDF from 'jspdf';

// Modal for editing user details
const EditModal = ({ isOpen, onClose, onUpdate, username, setUsername, email, setEmail, errors }) => {
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleUpdate = () => {
    setShowConfirmation(true);
  };

  const confirmUpdate = () => {
    onUpdate();
    setShowConfirmation(false);
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-end bg-black bg-opacity-50 transition-opacity duration-300 ${
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div
        className={`fixed top-[64px] right-0 h-[calc(100%-96px)] w-full max-w-[90%] sm:max-w-[400px] bg-white transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        } rounded-l-2xl shadow-2xl border border-blue-500 p-6 sm:p-8 flex flex-col justify-between`}
      >
        <div>
          <h2 className="text-2xl font-bold text-blue-600 mb-6">Edit User</h2>
  
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg bg-gray-100 text-gray-800 border ${
                errors.username ? 'border-red-500' : 'border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-blue-400`}
            />
            {errors.username && <p className="text-sm text-red-500 mt-1">{errors.username}</p>}
          </div>
  
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg bg-gray-100 text-gray-800 border ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-blue-400`}
            />
            {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
          </div>
        </div>
  
        <div className="flex justify-end mt-6 space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleUpdate}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            Update
          </button>
        </div>
      </div>
    </div>
  );
};

// Modal for delete confirmation
const DeleteConfirmationModal = ({ isOpen, onClose, onDelete, username }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Confirm Deletion</h2>
        <p className="text-gray-800 mb-4">Are you sure you want to delete {username}?</p>
        <div className="flex justify-end">
          <button onClick={onClose} className="mr-2 bg-gray-300 p-2 rounded">Cancel</button>
          <button onClick={onDelete} className="bg-red-600 text-white p-2 rounded">Delete</button>
        </div>
      </div>
    </div>
  );
};

// Main component for displaying and managing users
const UsersTable = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser , setSelectedUser ] = useState(null);
  const [editUsername, setEditUsername] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [errors, setErrors] = useState({ username: "", email: "" });
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(null);
  const [userTasks, setUserTasks] = useState({});
  const [currentPage, setCurrentPage] = useState(0);
  const usersPerPage = 1; // Display one user per page
  const [searchId, setSearchId] = useState(""); // State for search input
  const [selectedStatus, setSelectedStatus] = useState(null); // State for selected status

  // Fetch users on component mount
  useEffect(() => {
    const token = sessionStorage.getItem("authToken");
    if (!token) {
      router.push("/login");
    } else {
      fetchUsers();
    }
  }, []);

  // Function to fetch users from the API
  const fetchUsers = async () => {
    try {
      const response = await axios.get("https://infinitech-api5.site/api/users", {
        headers: { Authorization: `Bearer ${sessionStorage.getItem("authToken")}` },
      });
      setUsers(response.data || []);
      fetchUserTasks(response.data);
    } catch (err) {
      setError("Failed to load users. Please try again later.");
      toast.error("Failed to load users. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch tasks for each user
  const fetchUserTasks = async (users) => {
    if (!Array.isArray(users) || users.length === 0) {
      console.error("No users provided to fetch tasks.");
      return;
    }

    const tasksPromises = users.map(async (user) => {
      if (!user.id) {
        console.error("User  ID is missing for user:", user);
        return { userId: user.id, tasks: [] };
      }

      try {
        const response = await axios.get(`https://infinitech-api5.site/api/users/${user.id}/tasks`, {
          headers: { Authorization: `Bearer ${sessionStorage.getItem("authToken")}` },
        });
        return { userId: user.id, tasks: response.data };
      } catch (error) {
        console.error(`Failed to fetch tasks for user ${user.id}:`, error.response ? error.response.data : error.message);
        return { userId: user.id, tasks: [] };
      }
    });

    try {
      const tasksResults = await Promise.all(tasksPromises);
      const tasksMap = {};
      tasksResults.forEach(({ userId, tasks }) => {
        tasksMap[userId] = tasks;
      });
      setUserTasks(tasksMap);
    } catch (error) {
      console.error("Error processing tasks results:", error);
    }
  }

  const filteredUsers = users.filter(user =>
    Object.values(user).some(value =>
      value.toString().toLowerCase().includes(searchId.toLowerCase())
    )
  );

  // Function to handle user editing
  const handleEditUser  = (user) => {
    if (!user) return;
    setSelectedUser (user);
    setEditUsername(user.username || "");
    setEditEmail(user.email || "");
    setShowEditModal(true);
  };

  // Function to update user details
  const handleUpdateUser  = async () => {
    if (!selectedUser ) return;

    try {
      await axios.put(`https://infinitech-api5.site/api/users/${selectedUser.id}`, {
        username: editUsername,
        email: editEmail,
      });

      setShowEditModal(false);
      fetchUsers(); // Refresh user list
      toast.success("User  updated successfully!");
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Failed to update user. Please try again.");
    }
  };

  // Function to delete a user
  const handleDeleteUser  = async (userId) => {
    if (!userId) return;

    try {
      await axios.delete(`https://infinitech-api5.site/api/users/${userId}`);
      fetchUsers(); // Refresh user list after deletion
      toast.success("User  deleted successfully!");
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user. Please try again.");
    }
  };

  // Function to calculate task stats
  const calculateTaskStats = (userId) => {
    const tasks = userTasks[userId] || [];
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.status === "complete").length;
    const pendingTasks = tasks.filter(task => task.status === "pending").length;

    const overdueTasks = tasks.filter(task => {
      const deadline = new Date(task.deadline);
      return task.status !== "complete" && deadline < new Date();
    }).length;

    return { totalTasks, completedTasks, pendingTasks, overdueTasks, tasks };
  };

  // Function to generate PDF report for a specific user
   // Function to generate PDF report for a specific user
  const generateUserReport = (user) => {
    const { totalTasks, completedTasks, pendingTasks, overdueTasks, tasks } = calculateTaskStats(user.id);
    const doc = new jsPDF();
  
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
  
    // Set font
    doc.setFont("courier", "bold");
    doc.setFontSize(14);
  
    // Background (Light Gray)
    doc.setFillColor(240, 240, 240);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
  
    // Header (Blue Background)
    const headerHeight = 60;
    doc.setFillColor(0, 102, 204);
    doc.rect(0, 0, pageWidth, headerHeight, 'F');
  
    // === Center Logo & Text ===
    const logoSize = 30;
    const centerX = pageWidth / 2;
    const centerY = headerHeight / 2;
  
    // Draw white circular mask (circle)
    doc.setFillColor(255, 255, 255);
    doc.circle(centerX, centerY - 5, logoSize / 2 + 2, 'F'); // Slightly larger circle for mask look
  
    // Draw Logo
    doc.addImage('infini.png', 'PNG',
      centerX - logoSize / 2,
      centerY - logoSize / 2 - 5,
      logoSize, logoSize
    );
  
    // Report Name below logo
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(15);
    const headerText = "InfiniTask Report";
    const textWidth = doc.getTextWidth(headerText);
    doc.text(headerText, (pageWidth - textWidth) / 2, centerY + logoSize / 2 + 5);
  
    // Start content below header
    let y = headerHeight + 30;
    const contentX = 30;
  
    // Main User Details
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.text(`Report for: ${user.username}`, contentX, y); y += 10;
    doc.text(`Email: ${user.email}`, contentX, y); y += 10;
    doc.text(`Total Tasks: ${totalTasks}`, contentX, y); y += 10;
    doc.text(`Completed Tasks: ${completedTasks}`, contentX, y); y += 10;
    doc.text(`Pending Tasks: ${pendingTasks}`, contentX, y); y += 10;
    doc.text(`Overdue Tasks: ${overdueTasks}`, contentX, y); y += 15;
  
    // Task Details Section
    doc.setFontSize(14);
    doc.text("Task Details:", contentX, y); y += 10;
    doc.setFontSize(12);
  
    doc.setFont("courier", "bold");
    doc.text("No.", contentX, y);
    doc.text("Task Details", contentX + 20, y);
    y += 7;
    doc.setFont("courier", "normal");
  
    // Loop tasks
    tasks.forEach((task, index) => {
      const taskText = `ID: ${task.id}, Title: ${task.title || "N/A"}, Status: ${task.status}, Due: ${task.deadline}`;
      const wrappedText = doc.splitTextToSize(taskText, 150);
      doc.text((index + 1).toString(), contentX, y);
      doc.text(wrappedText, contentX + 20, y);
      y += wrappedText.length * 6 + 5;
  
      // Add new page if overflow
      if (y > pageHeight - 20) {
        doc.addPage();
        y = 20;
      }
    });
  
    doc.save(`${user.username}_report.pdf`);
  };
  // Pagination functions
  const nextPage = () => {
    if (currentPage < filteredUsers.length - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Function to handle status click
  const handleStatusClick = (status) => {
    setSelectedStatus(status);
  };

  // Function to filter tasks based on selected status
  const filteredTasks = (userId) => {
    const tasks = userTasks[userId] || [];
    if (selectedStatus) {
      return tasks.filter(task => task.status === selectedStatus);
    }
    return tasks;
  };

  return (
    <>
      <Head>
        <title>Users List | Infi-Admin</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="flex min-h-screen bg-blue-50 text-gray-800">
        <ToastContainer position="top-right" autoClose={3000} />
        <Adminbar />
        <div className="sticky top-0 h-screen w-64 bg-blue-100 shadow-lg hidden md:block">
        </div>
      
        <div className="flex flex-1 flex-col min-h-screen p-4 sm:p-6 md:p-9 w-full overflow-auto">
          <div className="flex-1 flex flex-col items-center">
<br />
<br />


            <div className="flex justify-end mb-4 w-full">
              <div className="relative w-full max-w-xs">
                <FiSearch className="absolute left-3 top-2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by User ID"
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                  className="pl-10 pr-4 py-2 rounded border border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                />
              </div>
            </div>
            {loading ? (
              <p className="text-center text-gray-600 text-lg">Loading users...</p>
            ) : error ? (
              <p className="text-center text-red-500 text-lg">{error}</p>
            ) : (
              <>
                <div className="flex justify-end mb-4 w-full">
                  <p className="text-gray-800 font-bold">Total Users: {filteredUsers.length}</p>
                </div>

                {filteredUsers.length > 0 && (
                  <div className="w-full max-w-8xl grid grid-cols-1 gap-4 sm:gap-4">
                 
                    <div
                    
                      className="relative card bg-white border border-blue-200 rounded-lg shadow-lg flex flex-col items-start p-6 sm:p-8 transition-transform transform"
                      key={filteredUsers[currentPage].id}
                    >
                      <div className="absolute top-4 right-4 cursor-pointer" onClick={() => setMenuOpen(menuOpen === filteredUsers[currentPage].id ? null : filteredUsers[currentPage].id)}>
                        <FiMoreVertical size={24} className="text-blue-600" />
                      </div>
                      {filteredUsers.length > 0 && (
  <div className="w-full max-w-8xl grid grid-cols-1 gap-4 sm:gap-4">
    <div className="flex justify-center w-full">
      <h2 className="text-2xl sm:text-4xl font-bold text-blue-800 text-center mb-4 sm:mb-6 drop-shadow-lg">
        <span className="uppercase">USER LIST</span> | <span className="text-blue-800">Admin</span>
      </h2>
    </div>
    {/* Other content goes here */}
  </div>
)}
                      <div className="flex flex-col sm:flex-row justify-center sm:justify-start items-center sm:items-start mb-3 w-full">

                        
                        <div className="img border-4 border-gradient-to-r from-green-400 to-gold rounded-lg shadow-lg overflow-hidden">
                          <img
                            src={filteredUsers[currentPage].profile_image ? `https://infinitech-api5.site/${filteredUsers[currentPage].profile_image}` : "/default-profile.png"}
                            alt="Profile"
                            className="w-32 h-32 object-cover sm:w-40 sm:h-40"
                          />
                        </div>
                        <div className="ml-0 sm:ml-4 flex flex-col mt-4 sm:mt-0">
                          <span className="font-bold text-center text-black text-xl border border-blue-500 rounded-lg p-1 bg-blue-600">
                            {filteredUsers[currentPage].username}
                          </span>
                          <p className="text-gray-800 text-center font-bold text-lg">Employer ID: {filteredUsers[currentPage].id}</p>
                          <p className="text-gray-800 text-center font-bold text-lg">📧 {filteredUsers[currentPage].email}</p>
                        </div>
                      </div>

                      {/* Task Stats */}
                      <div className="w-full mt-4">
                        <div className="flex flex-wrap -mx-2">
                          {/* Total Tasks */}
                          <div className="w-full sm:w-1/2 md:w-1/4 px-2 mb-4" onClick={() => handleStatusClick(null)}>
                            <div className="bg-blue-600 text-white rounded-lg shadow-md p-4 flex flex-col items-center text-center border border-blue-500">
                              <div className="text-3xl mb-2">📋</div>
                              <p className="font-semibold">Total Tasks</p>
                              <p>{calculateTaskStats(filteredUsers[currentPage].id).totalTasks}</p>
                            </div>
                          </div>

                          {/* Completed Tasks */}
                          <div className="w-full sm:w-1/2 md:w-1/4 px-2 mb-4" onClick={() => handleStatusClick("complete")}>
                            <div className="bg-green-600 text-white rounded-lg shadow-md p-4 flex flex-col items-center text-center border border-green-500">
                              <div className="text-3xl mb-2">✅</div>
                              <p className="font-semibold">Completed</p>
                              <p>{calculateTaskStats(filteredUsers[currentPage].id).completedTasks}</p>
                            </div>
                          </div>

                          {/* Pending Tasks */}
                          <div className="w-full sm:w-1/2 md:w-1/4 px-2 mb-4" onClick={() => handleStatusClick("pending")}>
                            <div className="bg-yellow-600 text-white rounded-lg shadow-md p-4 flex flex-col items-center text-center border border-yellow-500">
                              <div className="text-3xl mb-2">⏳</div>
                              <p className="font-semibold">Pending</p>
                              <p>{calculateTaskStats(filteredUsers[currentPage].id).pendingTasks}</p>
                            </div>
                          </div>

                          {/* Overdue Tasks */}
                          <div className="w-full sm:w-1/2 md:w-1/4 px-2 mb-4" onClick={() => handleStatusClick("overdue")}>
                            <div className="bg-red-600 text-white rounded-lg shadow-md p-4 flex flex-col items-center text-center border border-red-500">
                              <div className="text-3xl mb-2">❌</div>
                              <p className="font-semibold">Overdue</p>
                              <p>{calculateTaskStats(filteredUsers[currentPage].id).overdueTasks}</p>
                            </div>
                          </div>
                        </div>

                        {/* Task Table */}
                        <div className="overflow-x-auto mt-4">
                          <table className="min-w-full bg-white border border-blue-200">
                            <thead>
                              <tr>
                                <th className="py-2 px-2 sm:px-4 border-b border-blue-200 text-left text-sm sm:text-base text-gray-800">Task ID</th>
                                <th className="py-2 px-2 sm:px-4 border-b border-blue-200 text-left text-sm sm:text-base text-gray-800">Title</th>
                                <th className="py-2 px-2 sm:px-4 border-b border-blue-200 text-left text-sm sm:text-base text-gray-800">Status</th>
                                <th className="py-2 px-2 sm:px-4 border-b border-blue-200 text-left text-sm sm:text-base text-gray-800">Due Date</th>
                              </tr>
                            </thead>
                            <tbody>
                              {filteredTasks(filteredUsers[currentPage].id).map((task) => (
                                <tr key={task.id} className="hover:bg-blue-100">
                                  <td className="py-2 px-2 sm:px-4 border-b border-blue-200 text-sm sm:text-base text-gray-800">{task.id}</td>
                                  <td className="py-2 px-2 sm:px-4 border-b border-blue-200 text-sm sm:text-base text-gray-800">{task.title}</td>
                                  <td className="py-2 px-2 sm:px-4 border-b border-blue-200 text-sm sm:text-base text-gray-800">{task.status}</td>
                                  <td className="py-2 px-2 sm:px-4 border-b border-blue-200 text-sm sm:text-base text-gray-800">{task.deadline}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        <div className="flex flex-col mt-4">
                          <div className="bg-white p-4 rounded shadow border border-blue-200">
                            <div className="flex space-x-2 mb-2">
                              <button
                                onClick={() => generateUserReport(filteredUsers[currentPage])}
                                className="bg-green-500 text-white px-4 py-2 rounded"
                              >
                                Generate PDF Report
                              </button>
                            </div>
                            <p className="text-green-400 font-semibold"> 📊 Task Completion</p>
                            <p className="text-gray-800">
                              {calculateTaskStats(filteredUsers[currentPage].id).totalTasks > 0
                                ? (
                                  (calculateTaskStats(filteredUsers[currentPage].id).completedTasks /
                                    calculateTaskStats(filteredUsers[currentPage].id).totalTasks) * 100
                                ).toFixed(0)
                                : 0}%
                            </p>
                            <div className="bg-gray-600 rounded-full h-2 mt-4">
                              <div
                                className="bg-green-500 h-2 rounded-full transition-all duration-500"
                                style={{
                                  width: `${calculateTaskStats(filteredUsers[currentPage].id).totalTasks > 0
                                    ? (calculateTaskStats(filteredUsers[currentPage].id).completedTasks /
                                      calculateTaskStats(filteredUsers[currentPage].id).totalTasks) * 100
                                    : 0}%`
                                }}
                              />
                            </div>
                          </div>
                        </div>

                        {menuOpen === filteredUsers[currentPage].id && (
                          <div className="absolute top-10 right-4 bg-white shadow-md rounded-lg overflow-hidden w-32 z-10 border border-blue-200">
                            <button
                              onClick={() => handleEditUser (filteredUsers[currentPage])}
                              className="block w-full px-4 py-2 text-left text-blue-600 hover:bg-blue-100"
                            >
                              📝 Edit
                            </button>
                            <button
                              onClick={() => {
                                setSelectedUser (filteredUsers[currentPage]);
                                setShowDeleteModal(true);
                              }}
                              className="block w-full px-4 py-2 text-red-600 hover:bg-red-100"
                            >
                              ❌ Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  )}

                  {/* Pagination buttons */}
                  <div className="w-full flex flex-col md:flex-row justify-between items-center mt-4 gap-y-4 md:gap-y-0 md:gap-x-4">
                    <button
                      onClick={prevPage}
                      disabled={currentPage === 0}
                      className={`w-full md:w-auto flex justify-center items-center bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500 transition duration-200 ${
                        currentPage === 0 ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <FiChevronLeft className="mr-2" />
                      Prev
                    </button>
                    <button
                      onClick={nextPage}
                      disabled={currentPage >= filteredUsers.length - 1}
                      className={`w-full md:w-auto flex justify-center items-center bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500 transition duration-200 ${
                        currentPage >= filteredUsers.length - 1 ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      Next
                      <FiChevronRight className="ml-2" />
                    </button>
                  </div>

                </>
              )}

          </div>
        </div>
      </div>

        {/* Edit Modal */}
        <EditModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onUpdate={handleUpdateUser }
          username={editUsername}
          setUsername={setEditUsername}
          email={editEmail}
          setEmail={setEditEmail}
          errors={errors}
        />

        {/* Delete Confirmation Modal */}
        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onDelete={() => {
            handleDeleteUser (selectedUser.id);
            setShowDeleteModal(false);
          }}
          username={selectedUser  ? selectedUser .username : ""}
        />

        {/* Toast Container */}
        <ToastContainer />

    </>
  );
}

export default authUser (UsersTable);
