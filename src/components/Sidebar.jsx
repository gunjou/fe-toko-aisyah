import React from "react";
import {
  Menu,
  X,
  LayoutDashboard,
  Package,
  Users,
  FileText,
  DollarSign,
  LogOut,
  BadgeInfo,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import api from "../utils/api";

const Sidebar = ({ isOpen, setIsOpen }) => {
  const role = localStorage.getItem("role");
  const menuItems = [
    ...(role !== "admin"
      ? [{ name: "Kasir", icon: <LayoutDashboard size={18} />, path: "/kasir" }]
      : []),
    { name: "Stock", icon: <Package size={18} />, path: "/stock" },
    { name: "Hutang", icon: <DollarSign size={18} />, path: "/hutang" },
    ...(role === "admin"
      ? [
          { name: "Pelanggan", icon: <Users size={18} />, path: "/pelanggan" },
          { name: "Laporan", icon: <FileText size={18} />, path: "/laporan" },
        ]
      : []),
    { name: "Tentang", icon: <BadgeInfo size={18} />, path: "/tentang" },
  ];

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
      window.location.href = "/login"; // Full reload untuk reset state
    } catch (err) {
      console.error("Logout failed:", err);
      alert("Logout failed. Please try again.");
    }
  };

  return (
    <div
      className={`h-screen bg-[#FF4778] text-white transition-all duration-300 ${
        isOpen ? "w-64" : "w-16"
      } flex flex-col`}
    >
      {/* Header */}
      <div className="flex flex-col gap-1 p-4">
        <div className="flex items-center justify-between">
          {isOpen && <h1 className="text-lg font-bold">TOKO YANI</h1>}

          <button onClick={() => setIsOpen(!isOpen)} className="text-white">
            {isOpen ? <X size={20} /> : <Menu size={30} />}
          </button>
        </div>
        {isOpen && (
          <label className="text-xs text-gray-300">by Outlook Project</label>
        )}
      </div>

      {/* Menu items */}
      <div className="flex-1 px-2 space-y-2 overflow-y-auto">
        {menuItems.map((item, index) => (
          <NavLink
            key={index}
            to={item.path}
            title={!isOpen ? item.name : ""}
            className={({ isActive }) =>
              [
                "w-full flex items-center gap-3 text-left p-3 rounded-lg transition",
                isActive
                  ? "bg-[#FF87A7] text-white font-bold"
                  : "bg-white text-black hover:bg-[#D8D8D8]",
              ].join(" ")
            }
          >
            {item.icon}
            {isOpen && <span>{item.name}</span>}
          </NavLink>
        ))}
      </div>

      {/* Logout */}
      <div className="p-4 border-t border-white">
        <button
          className="flex text-bold items-center gap-2 w-full text-left text-sm hover:text-black"
          onClick={() => {
            const confirmLogout = window.confirm("Anda yakin ingin logout?");
            if (confirmLogout) {
              console.log("User confirmed logout");
              //localStorage.clear();
              handleLogout(); // Call handleLogout when confirmed
            }
          }}
        >
          <LogOut size={18} />
          {isOpen && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
