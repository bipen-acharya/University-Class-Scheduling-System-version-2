import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Calendar,
  Clock,
  AlertTriangle,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  GraduationCap,
  UserCog,
  CalendarDays,
  Building2,
  Layers,
} from "lucide-react";
import api from "../../api/axios";

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Redirect to home if someone manually hits /admin without auth (placeholder)
  useEffect(() => {
    if (!location.pathname.startsWith("/admin")) return;
  }, [location.pathname]);

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { path: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { path: "/admin/trimesters", label: "Trimesters", icon: Layers },
    {
      path: "/admin/academic-calendar",
      label: "Academic Calendar",
      icon: CalendarDays,
    },
    { path: "/admin/programs", label: "Programs", icon: GraduationCap },
    { path: "/admin/teachers", label: "Teachers", icon: Users },
    { path: "/admin/users", label: "Users", icon: UserCog },
    {
      path: "/admin/subjects-rooms",
      label: "Subjects & Rooms",
      icon: BookOpen,
    },
    { path: "/admin/room-bookings", label: "Room Bookings", icon: Building2 },
    { path: "/admin/timetable", label: "Daily Timetable", icon: Calendar },
    { path: "/admin/gap-finder", label: "Class Gap Finder", icon: Clock },
    // {
    //   path: "/admin/conflicts",
    //   label: "Conflict Checker",
    //   icon: AlertTriangle,
    // },
    { path: "/admin/reports", label: "Reports", icon: BarChart3 },
    { path: "/admin/settings", label: "Settings", icon: Settings },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    try {
      await api.post("/logout");
    } catch (error) {
      console.error("Logout API failed:", error);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user_name");
      localStorage.removeItem("roles");
      navigate("/login", { replace: true });
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-soft">
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-full bg-white border-r border-light shadow-card z-50 transition-all duration-300 ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 ${
          isSidebarCollapsed ? "lg:w-20" : "lg:w-64"
        } w-64 md:w-20 md:translate-x-0`}
      >
        <div className="p-4 lg:p-6 border-b border-light">
          <div className="flex items-center gap-3">
            {/* Logo - Full Circular */}
            <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
              <img
                src="/favicon.png"
                alt="UniScheduling Logo"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Text */}
            <div
              className={`${isSidebarCollapsed ? "lg:hidden" : "lg:block"} md:hidden block`}
            >
              <h1 className="text-lg text-dark font-semibold">UniScheduling</h1>
              <p className="text-xs text-body">Admin Panel</p>
            </div>
          </div>
        </div>

        <nav className="p-2 lg:p-4">
          <div className="space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-3 px-3 lg:px-4 py-3 rounded-xl transition-all group relative ${
                    isActive(link.path)
                      ? "bg-primary-blue text-white shadow-card"
                      : "text-body hover:bg-soft hover:text-primary-blue"
                  }`}
                  title={link.label}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span
                    className={`text-sm ${isSidebarCollapsed ? "lg:hidden" : "lg:block"} md:hidden block whitespace-nowrap`}
                  >
                    {link.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-2 lg:p-4 border-t border-light">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 lg:px-4 py-3 text-body hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span
              className={`text-sm ${isSidebarCollapsed ? "lg:hidden" : "lg:block"} md:hidden block`}
            >
              Exit Admin
            </span>
          </button>
        </div>

        <button
          onClick={() => setIsMobileMenuOpen(false)}
          className="lg:hidden absolute top-4 right-4 p-2 text-body hover:bg-soft rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </aside>

      <div className="lg:ml-64 md:ml-20 ml-0 transition-all duration-300">
        <header className="bg-white border-b border-light shadow-card sticky top-0 z-40">
          <div className="px-4 sm:px-6 lg:px-8 py-3 lg:py-4">
            <div className="hidden lg:flex items-center justify-between">
              <h2 className="text-2xl text-dark">
                {navLinks.find((link) => isActive(link.path))?.label ||
                  "Dashboard"}
              </h2>

              <div className="flex items-center gap-6">
                <div className="flex items-center gap-4 text-sm text-body">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary-blue" />
                    <span>{formatDate(currentTime)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary-blue" />
                    <span>{formatTime(currentTime)}</span>
                  </div>
                </div>

                <div className="w-10 h-10 bg-primary-blue rounded-full flex items-center justify-center text-white">
                  AD
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
