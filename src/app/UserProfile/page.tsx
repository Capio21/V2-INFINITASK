"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { FaSignOutAlt, FaEdit, FaSave } from "react-icons/fa";
import Sidebar from "../Components/Sidebar";
import authUser  from "../utils/authUser";

const TodoPage = () => {
  const router = useRouter();
  const [user, setUser ] = useState(null);
  const [editing, setEditing] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const authToken = sessionStorage.getItem("authToken");

    if (!authToken) {
      router.push("/login");
      return;
    }

    axios
      .get("https://infinitech-api5.site/api/user", {
        headers: { Authorization: `Bearer ${authToken}` },
      })
      .then((response) => {
        setUser (response.data.user);
        setUsername(response.data.user.username);
        setEmail(response.data.user.email);
        setImagePreview(`https://infinitech-api5.site/${response.data.user.profile_image}`); // Set default image preview
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching user:", error);
        router.push("/login");
      });
  }, [router]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setProfileImage(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const handleSave = async () => {
    try {
      const authToken = sessionStorage.getItem("authToken");
      if (!authToken) {
        console.error("No token found.");
        return;
      }

      const formData = new FormData();
      formData.append("username", username);
      formData.append("email", email);
      if (profileImage) {
        formData.append("profile_image", profileImage);
      }

      const response = await axios.post(
        "https://infinitech-api5.site/api/update-profile",
        formData,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setUser (response.data.user);
      setEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-900 text-gray-900">
      <Sidebar />
      <div className="sticky top-0 h-screen w-64 bg-blue-100 shadow-lg hidden md:block"></div>
      <div className={`flex-1 flex items-center justify-center p-4 md:p-6 transition-transform duration-300 ${editing ? 'translate-x-[-300px]' : ''}`}>
        <div className="card w-full max-w-4xl h-auto bg-white rounded-xl shadow-2xl p-6 flex flex-col md:flex-row border-4 border-blue-600 relative">
        '  <div className="img-container w-full md:w-2/4 h-auto p-4 bg-blue-100 rounded-xl overflow-hidden flex items-center justify-center border-4 border-blue-300 mt-8">
            {user?.profile_image ? (
              <img
                className="w-62 h-52 object-cover rounded-xl"
                src={`https://infinitech-api5.site/${user.profile_image}`}
                alt="Profile"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                No Image
              </div>
            )}
          </div>'

          <div className="info-container w-full md:w-2/3 flex flex-col items-center justify-center text-center pl-0 md:pl-6 mt-4 md:mt-0">
            <div className="logo-container mb-4">
              <img
                src="/infini.png" // Replace with your logo path
                alt="Logo"
                className="place-items-right w-full h-24 object-contain"
              />
            </div>
            <label className="text-blue-600 text-2xl font-bold mb-2 uppercase">User  Profile</label>

            <span className="mt-4 text-gray-800 text-2xl md:text-3xl font-bold">{user?.username}</span>
            <p className="job text-lg text-gray-600 mt-1">{user?.email}</p>
            <br />
            <div className="flex justify-center items-center w-full">
              <button
                onClick={() => {
                  setEditing((prev) => !prev); // Toggle editing state
                  if (!editing) {
                    setUsername(user?.username);
                    setEmail(user?.email);
                    setImagePreview(`https://infinitech-api5.site/${user.profile_image}`); // Set default image preview when editing starts
                  }
                }}
                className="w-[120px] h-[40px] rounded-full border border-white/40 bg-blue-600 flex items-center justify-center cursor-pointer transition-all duration-300 overflow-hidden relative group"
              >
                <span className="w-[110px] h-[30px] bg-gradient-to-b from-blue-400 to-blue-600 rounded-full flex items-center justify-center transition-all duration-300 group-hover:w-[100px]">
                  <FaEdit className="text-white text-lg mr-2 transition-all duration-300" />
                  <span className="text-white text-sm transition-all duration-300">
                    {editing ? "Close" : "Edit"}
                  </span>
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

   {/* Sliding Edit Form */}
<div
  className={`fixed top-0 right-0 h-full w-full sm:w-[30rem] bg-gradient-to-br from-gray-900 via-gray-900 to-gray-900 p-8 transition-transform transform ${
    editing ? "translate-x-0" : "translate-x-full"
  } shadow-2xl z-50 flex flex-col items-center border-l-4 border-blue-400 rounded-l-3xl`}
>
  <h2 className="text-2xl font-bold text-blue-900 mb-6 text-center">
    Edit Profile
  </h2>

  {/* Image Preview */}
  {imagePreview && (
    <div className="mb-6">
      <img
        src={imagePreview}
        alt="Preview"
        className="w-28 h-28 object-cover rounded-full border-4 border-blue-500 shadow-md"
      />
    </div>
  )}

  {/* Username */}
  <div className="flex flex-col mb-5 w-full">
    <label className="text-blue-800 font-semibold mb-1" htmlFor="username">
      Employee Name:
    </label>
    <input
      id="username"
      type="text"
      value={username}
      onChange={(e) => setUsername(e.target.value)}
      className="p-3 rounded-lg bg-white text-blue-900 border border-blue-300 shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-400"
      placeholder="Enter employee name"
    />
  </div>

  {/* Email */}
  <div className="flex flex-col mb-5 w-full">
    <label className="text-blue-800 font-semibold mb-1" htmlFor="email">
      Personal Email:
    </label>
    <input
      id="email"
      type="email"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      className="p-3 rounded-lg bg-white text-blue-900 border border-blue-300 shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-400"
      placeholder="Enter email"
    />
  </div>

  {/* Image Upload */}
  <div className="flex flex-col mb-6 w-full">
    <label className="text-blue-800 font-semibold mb-1" htmlFor="profileImage">
      Profile Image:
    </label>
    <input
      id="profileImage"
      type="file"
      onChange={handleImageChange}
      className="p-3 rounded-lg bg-white text-blue-900 border border-blue-300 shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-400"
    />
  </div>

  {/* Action Buttons */}
  <div className="flex justify-between gap-4 w-full mt-4">
    <button
      onClick={handleSave}
      className="flex items-center justify-center bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-5 rounded-lg shadow-lg transition"
    >
      <FaSave className="mr-2" /> Save
    </button>
    <button
      onClick={() => setEditing(false)}
      className="bg-red-500 hover:bg-red-400 text-white font-bold py-2 px-5 rounded-lg shadow-lg transition"
    >
      Cancel
    </button>
  </div>
</div>
    </div>
  );
};

export default authUser (TodoPage);
