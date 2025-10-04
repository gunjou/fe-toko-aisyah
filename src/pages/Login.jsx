import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const togglePassword = () => setShowPassword((prev) => !prev);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { username, password });
      const data = res.data;
      if (data && data.access_token) {
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("username", username);
        localStorage.setItem("nama", data.nama || username);
        localStorage.setItem("role", data.role || "-");
        localStorage.setItem("id_lokasi", data.id_lokasi || "-");
        localStorage.setItem("id_kasir", data.id_kasir || "-");
        // Simpan info user (id_kasir, id_lokasi, dll) jika ada
        if (data.user) {
          localStorage.setItem("user", JSON.stringify(data.user));
        }
        // console.log("res.data dari login:", res.data);

        // Redirect sesuai role
        if (data.role === "admin") {
          navigate("/stock", { replace: true });
        } else {
          navigate("/kasir", { replace: true }); // kasir langsung ke halaman kasir
        }
      } else {
        setErrorMsg(data.message || "Login gagal");
      }
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message || "Terjadi kesalahan, silakan coba lagi."
      );
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-b from-[#f2ece0] to-[#344c36] relative">
      {/* Wave image at the bottom */}
      <img
        src="images/wave.png"
        alt=""
        className="fixed bottom-0 left-0 w-full pointer-events-none select-none z-0"
      />
      {/* Left side - Login Form */}
      <div className="md:w-1/2 w-full flex items-center justify-center p-8 z-10">
        <div className="w-full max-w-md bg-white p-8 rounded-[20px] shadow-lg">
          <h2 className="text-2xl font-bold text-left text-gray-800">Login</h2>
          <div className="mb-6 text-sm">
            <span>Login untuk menggunakan aplikasi</span>
          </div>

          <form onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                type="text"
                placeholder="masukkan username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mt-2 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="masukkan password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={togglePassword}
                  className="absolute right-2 top-2.5 text-gray-500 hover:text-gray-700"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {errorMsg && <div className="text-red-600 text-sm">{errorMsg}</div>}

            {/* <div className="flex items-center justify-between text-sm">
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                Ingat saya
              </label>
              <a href="#" className="text-blue-500 hover:underline">
                Lupa password?
              </a>
            </div> */}
            <button
              type="submit"
              className="w-full px-4 py-2 mt-8 text-white rounded-lg bg-[#feae17] rounded-[15px] hover:bg-yellow-400 transition"
              disabled={loading}
            >
              {loading ? "Memproses..." : "Login"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            © 2025,{" "}
            <a
              href="https://www.instagram.com/outlookofficial_/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-500"
            >
              Outlook Project
            </a>
          </p>
        </div>
      </div>

      {/* Right side - Image */}
      <div className="md:w-1/2 w-full flex items-center justify-center z-10">
        <div className="text-center">
          {/* <h1 className="text-3xl font-bold text-white">TOKO YANI</h1> */}
          <img
            src="images/icon.png"
            alt="Login Illustration"
            className="w-80 h-auto mt-4 mb-4"
          />
        </div>
      </div>
    </div>
  );
}

export default Login;
