import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Calendar, Building, Activity } from "lucide-react";
import api from "../../api/axios";

export default function AuthPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value,
    });
  };

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const response = await api.post("/login", {
        email: loginData.email,
        password: loginData.password,
      });

      if (response.data.status === 1) {
        const user = response.data.data;

        localStorage.setItem("token", user.token);
        localStorage.setItem("user_name", user.name);
        localStorage.setItem("roles", JSON.stringify(user.roles));

        navigate("/admin");
      } else {
        setErrorMsg(response.data.message || "Login failed");
      }
    } catch (error: any) {
      setErrorMsg(
        error?.response?.data?.message || "Invalid email or password"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
        {/* Left Panel - Branding */}
        <div className="hidden lg:block">
          <div className="bg-gradient-to-br from-[#2563EB] to-[#3B82F6] rounded-3xl p-10 text-white shadow-xl">
            <h1 className="text-4xl mb-4">Welcome to UniScheduling</h1>
            <p className="text-lg text-gray-100 mb-8">
              Secure admin access for managing rooms, teachers, and daily class
              schedules.
            </p>

            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="font-medium">Day-wise timetable control</div>
                  <div className="text-sm text-gray-200">
                    Build and manage schedules with ease
                  </div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Building className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="font-medium">Room and level scheduling</div>
                  <div className="text-sm text-gray-200">
                    Multi-room management system
                  </div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="font-medium">
                    Live class status & conflict checks
                  </div>
                  <div className="text-sm text-gray-200">
                    Real-time validation and tracking
                  </div>
                </div>
              </li>
            </ul>

            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                <div className="w-2 h-2 bg-red-400 rounded-full"></div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-white/20 rounded w-3/4"></div>
                <div className="h-3 bg-white/20 rounded w-full"></div>
                <div className="h-3 bg-white/20 rounded w-5/6"></div>
                <div className="grid grid-cols-3 gap-2 mt-3">
                  <div className="h-12 bg-white/20 rounded"></div>
                  <div className="h-12 bg-white/20 rounded"></div>
                  <div className="h-12 bg-white/20 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Login Card */}
        <div className="w-full max-w-md mx-auto lg:mx-0">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
            <h2 className="text-2xl text-[#0F172A] mb-6">Admin Login</h2>

            <form onSubmit={handleLoginSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="login-email"
                  className="block text-sm text-[#0F172A] mb-2"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="login-email"
                  name="email"
                  required
                  value={loginData.email}
                  onChange={handleLoginChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all"
                  placeholder="admin@university.edu"
                />
              </div>

              <div>
                <label
                  htmlFor="login-password"
                  className="block text-sm text-[#0F172A] mb-2"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="login-password"
                    name="password"
                    required
                    value={loginData.password}
                    onChange={handleLoginChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all pr-12"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-[#2563EB] border-gray-300 rounded focus:ring-[#2563EB]"
                  />
                  <span className="text-sm text-[#0F172A]">Remember me</span>
                </label>
                <Link
                  to="/forgot-password"
                  className="text-sm text-[#2563EB] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              {errorMsg && (
                <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-[#2563EB] to-[#3B82F6] text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/50 transition-all disabled:opacity-70"
              >
                {loading ? "Logging in..." : "Login to Dashboard"}
              </button>

              <p className="text-xs text-gray-500 text-center">
                Access is restricted to approved admin users only.
              </p>
            </form>
          </div>

          {/* Mobile Branding */}
          <div className="lg:hidden mt-6 text-center">
            <Link to="/" className="text-sm text-gray-600 hover:text-[#2563EB]">
              ← Back to UniScheduling
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}