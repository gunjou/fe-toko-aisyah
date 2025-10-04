import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { jwtDecode } from "jwt-decode";

import checkAppVersion from "./utils/check_version";

import Kasir from "./pages/Kasir";
import Stock from "./pages/Stock";
import DaftarPelanggan from "./pages/DaftarPelanggan";
import Hutang from "./pages/Hutang";
import Laporan from "./pages/Laporan";
import Login from "./pages/Login";
import Tentang from "./pages/Tentang";

import DashboardLayout from "./layouts/DashboardLayout";
import PublicLayout from "./layouts/PublicLayout";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // Validasi token kadaluarsa saat load pertama
  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const now = Date.now() / 1000;

        if (decoded.exp < now) {
          console.log("Token expired, force logout");
          localStorage.clear();
          window.location.replace("/login");
        }
      } catch (err) {
        console.log("Invalid token, force logout");
        localStorage.clear();
        window.location.replace("/login");
      }
    }
    checkAppVersion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Router>
      <Routes>
        {/* Halaman root "/" diarahkan ke login */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* Login route */}
        <Route
          path="/login"
          element={
            token ? (
              role === "admin" ? (
                <Navigate to="/stock" />
              ) : (
                <Navigate to="/kasir" />
              )
            ) : (
              <PublicLayout>
                <Login />
              </PublicLayout>
            )
          }
        />

        {/* Protected Routes */}
        <Route
          path="/kasir"
          element={
            <ProtectedRoute allowedRoles={["kasir"]}>
              <DashboardLayout>
                <Kasir />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/stock"
          element={
            <ProtectedRoute allowedRoles={["admin", "kasir"]}>
              <DashboardLayout>
                <Stock />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/pelanggan"
          element={
            <ProtectedRoute allowedRoles={["admin", "kasir"]}>
              <DashboardLayout>
                <DaftarPelanggan />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/hutang"
          element={
            <ProtectedRoute allowedRoles={["admin", "kasir"]}>
              <DashboardLayout>
                <Hutang />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/laporan"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <DashboardLayout>
                <Laporan />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/tentang"
          element={
            <ProtectedRoute allowedRoles={["admin", "kasir"]}>
              <DashboardLayout>
                <Tentang />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
