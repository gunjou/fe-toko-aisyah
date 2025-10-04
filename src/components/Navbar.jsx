import React, { useEffect, useState } from "react";
import { LogOut } from "lucide-react";
import api from "../utils/api";
import { useNavigate } from "react-router-dom";

const Navbar = ({ isSidebarOpen }) => {
  const navigate = useNavigate();
  // Ambil username dan role dari localStorage
  const [user, setUser] = useState({
    nama: localStorage.getItem("nama") || "User",
    role: localStorage.getItem("role") || "",
  });

  const handleLogout = async () => {
    try {
      await api.post(
        "/auth/logout",
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );
      localStorage.clear();
      window.location.replace("/login");
    } catch (err) {
      console.error("Logout failed:", err);
      alert("Logout failed. Please try again.");
    }
  };

  return (
    <div className="h-16 w-full bg-white shadow-lg border-b flex items-center justify-between px-4">
      {/* Sembunyikan teks jika sidebar terbuka */}

      <h2
        className={`flex items-center gap-2 bg-[#feae17] text-white px-3 py-1 rounded-[10px] font-semibold ${
          isSidebarOpen ? "invisible" : ""
        }`}
      >
        TOKO AISYAH
      </h2>

      <div className="flex items-center gap-4">
        {/* <img
          src="https://i.pravatar.cc/40"
          alt="avatar"
          className="w-8 h-8 rounded-full"
        /> */}
        <div className="w-8 h-8 rounded-full bg-[#feae17] flex items-center justify-center text-white font-bold">
          {user.nama.charAt(0).toUpperCase()}
        </div>

        <div className="flex flex-col">
          <span className="text-sm text-gray-600 capitalize">{user.nama}</span>
          <span className="text-xs text-gray-400 -mt-1 capitalize">
            {user.role}
          </span>
        </div>
        <button
          className="flex items-center gap-1 text-bold text-[#feae17] hover:text-red-600 transition"
          onClick={() => {
            const confirmLogout = window.confirm("Anda yakin ingin logout?");
            if (confirmLogout) {
              console.log("User confirmed logout");
              handleLogout(); // Call handleLogout when confirmed
            }
          }}
        >
          <LogOut size={18} />
        </button>
      </div>
    </div>
  );
};

export default Navbar;
