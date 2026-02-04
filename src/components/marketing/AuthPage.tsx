import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, CheckCircle, Calendar, Building, Activity } from 'lucide-react';

export default function AuthPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  const [registerData, setRegisterData] = useState({
    fullName: '',
    email: '',
    universityName: '',
    role: '',
    password: '',
    confirmPassword: ''
  });

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value
    });
  };

  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setRegisterData({
      ...registerData,
      [e.target.name]: e.target.value
    });
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Login:', loginData);
    // Demo login - always redirect to admin panel
    navigate('/admin');
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Register:', registerData);
    // Handle registration logic here
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
        
        {/* Left Panel - Branding */}
        <div className="hidden lg:block">
          <div className="bg-gradient-to-br from-[#2563EB] to-[#3B82F6] rounded-3xl p-10 text-white shadow-xl">
            <h1 className="text-4xl mb-4">
              Welcome to UniScheduling
            </h1>
            <p className="text-lg text-gray-100 mb-8">
              Secure admin access for managing rooms, teachers, and daily class schedules.
            </p>
            
            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="font-medium">Day-wise timetable control</div>
                  <div className="text-sm text-gray-200">Build and manage schedules with ease</div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Building className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="font-medium">Room and level scheduling</div>
                  <div className="text-sm text-gray-200">Multi-room management system</div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="font-medium">Live class status & conflict checks</div>
                  <div className="text-sm text-gray-200">Real-time validation and tracking</div>
                </div>
              </li>
            </ul>

            {/* Mini Dashboard Illustration */}
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

        {/* Right Panel - Auth Card */}
        <div className="w-full max-w-md mx-auto lg:mx-0">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
            
            {/* Tabs */}
            <div className="flex gap-6 mb-6 border-b border-gray-200">
              <button
                onClick={() => setActiveTab('login')}
                className={`pb-3 px-2 text-lg transition-colors relative ${
                  activeTab === 'login'
                    ? 'text-[#2563EB]'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Login
                {activeTab === 'login' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2563EB]"></div>
                )}
              </button>
              <button
                onClick={() => setActiveTab('register')}
                className={`pb-3 px-2 text-lg transition-colors relative ${
                  activeTab === 'register'
                    ? 'text-[#2563EB]'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Register
                {activeTab === 'register' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2563EB]"></div>
                )}
              </button>
            </div>

            {/* Login Form */}
            {activeTab === 'login' && (
              <div>
                <h2 className="text-2xl text-[#0F172A] mb-6">Admin Login</h2>
                
                <form onSubmit={handleLoginSubmit} className="space-y-5">
                  <div>
                    <label htmlFor="login-email" className="block text-sm text-[#0F172A] mb-2">
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
                    <label htmlFor="login-password" className="block text-sm text-[#0F172A] mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
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
                    <Link to="/forgot-password" className="text-sm text-[#2563EB] hover:underline">
                      Forgot password?
                    </Link>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-[#2563EB] to-[#3B82F6] text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/50 transition-all"
                  >
                    Login to Dashboard
                  </button>

                  <p className="text-xs text-gray-500 text-center">
                    Access is restricted to approved admin users only.
                  </p>
                </form>
              </div>
            )}

            {/* Register Form */}
            {activeTab === 'register' && (
              <div>
                <h2 className="text-2xl text-[#0F172A] mb-6">Create Admin Account</h2>
                
                <form onSubmit={handleRegisterSubmit} className="space-y-5">
                  <div>
                    <label htmlFor="fullName" className="block text-sm text-[#0F172A] mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      required
                      value={registerData.fullName}
                      onChange={handleRegisterChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all"
                      placeholder="Dr. Jane Smith"
                    />
                  </div>

                  <div>
                    <label htmlFor="register-email" className="block text-sm text-[#0F172A] mb-2">
                      Institutional Email
                    </label>
                    <input
                      type="email"
                      id="register-email"
                      name="email"
                      required
                      value={registerData.email}
                      onChange={handleRegisterChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all"
                      placeholder="admin@university.edu"
                    />
                  </div>

                  <div>
                    <label htmlFor="universityName" className="block text-sm text-[#0F172A] mb-2">
                      University / Campus Name
                    </label>
                    <input
                      type="text"
                      id="universityName"
                      name="universityName"
                      required
                      value={registerData.universityName}
                      onChange={handleRegisterChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all"
                      placeholder="University of Technology"
                    />
                  </div>

                  <div>
                    <label htmlFor="role" className="block text-sm text-[#0F172A] mb-2">
                      Role
                    </label>
                    <select
                      id="role"
                      name="role"
                      required
                      value={registerData.role}
                      onChange={handleRegisterChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all"
                    >
                      <option value="">Select a role</option>
                      <option value="admin">Admin</option>
                      <option value="scheduler">Scheduler</option>
                      <option value="viewer">Viewer</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="register-password" className="block text-sm text-[#0F172A] mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="register-password"
                        name="password"
                        required
                        value={registerData.password}
                        onChange={handleRegisterChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all pr-12"
                        placeholder="Create a strong password"
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

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm text-[#0F172A] mb-2">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        id="confirmPassword"
                        name="confirmPassword"
                        required
                        value={registerData.confirmPassword}
                        onChange={handleRegisterChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all pr-12"
                        placeholder="Confirm your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-[#2563EB] to-[#3B82F6] text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/50 transition-all"
                  >
                    Request Admin Access
                  </button>

                  <p className="text-xs text-gray-500 text-center">
                    New admin accounts may require approval from your institution.
                  </p>

                  <p className="text-sm text-center text-gray-600">
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => setActiveTab('login')}
                      className="text-[#2563EB] hover:underline"
                    >
                      Login
                    </button>
                  </p>
                </form>
              </div>
            )}
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