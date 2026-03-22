import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Calendar,
  Clock,
  BarChart3,
  Settings,
  LogOut,
  X,
  GraduationCap,
  UserCog,
  CalendarDays,
  Building2,
  Layers,
} from "lucide-react";
import { Toaster } from "sonner";
import api from "../../api/axios";

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

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

  const formatTime = (date: Date) =>
    date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

  const formatDate = (date: Date) =>
    date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  return (
    <div className="min-h-screen bg-soft">
      {/* Global toast — one place for the whole app */}
      <Toaster
        position="top-right"
        richColors
        closeButton
        toastOptions={{
          duration: 3500,
          classNames: {
            toast: "rounded-xl shadow-lg border text-sm font-medium",
            success: "bg-green-50 border-green-200 text-green-800",
            error: "bg-red-50 border-red-200 text-red-800",
            warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
            info: "bg-blue-50 border-blue-200 text-blue-800",
          },
        }}
      />

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full bg-white border-r border-light shadow-card z-50 transition-all duration-300 ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 ${isSidebarCollapsed ? "lg:w-20" : "lg:w-64"} w-64 md:w-20 md:translate-x-0`}
      >
        {/* Logo */}
        <div className="p-4 lg:p-6 border-b border-light">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
              <img
                src="/favicon.png"
                alt="UniScheduling Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <div
              className={`${isSidebarCollapsed ? "lg:hidden" : "lg:block"} md:hidden block`}
            >
              <h1 className="text-lg text-dark font-semibold">UniScheduling</h1>
              <p className="text-xs text-body">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Nav links */}
        <nav
          className="p-2 lg:p-4 overflow-y-auto"
          style={{ height: "calc(100% - 130px)" }}
        >
          <div className="space-y-0.5">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  title={link.label}
                  className={`flex items-center gap-3 px-3 lg:px-4 py-2.5 rounded-xl transition-all duration-150 group relative select-none
                    ${
                      active
                        ? "bg-primary-blue text-white shadow-sm"
                        : "text-body hover:bg-soft hover:text-dark active:bg-primary-blue/10 active:scale-[0.98]"
                    }`}
                >
                  <Icon
                    className={`w-5 h-5 flex-shrink-0 transition-transform duration-150 ${!active ? "group-hover:scale-110" : ""}`}
                  />
                  <span
                    className={`text-sm font-medium ${isSidebarCollapsed ? "lg:hidden" : "lg:block"} md:hidden block whitespace-nowrap`}
                  >
                    {link.label}
                  </span>
                  {/* Active indicator dot for collapsed mode */}
                  {active && (
                    <span
                      className={`absolute right-2 w-1.5 h-1.5 rounded-full bg-white/70 ${isSidebarCollapsed ? "lg:block" : "lg:hidden"} hidden`}
                    />
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-2 lg:p-4 border-t border-light bg-white">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 lg:px-4 py-2.5 text-body hover:text-red-600 hover:bg-red-50 active:bg-red-100 active:scale-[0.98] rounded-xl transition-all duration-150 group select-none"
          >
            <LogOut className="w-5 h-5 flex-shrink-0 transition-transform duration-150 group-hover:translate-x-0.5" />
            <span
              className={`text-sm font-medium ${isSidebarCollapsed ? "lg:hidden" : "lg:block"} md:hidden block`}
            >
              Exit Admin
            </span>
          </button>
        </div>

        {/* Mobile close */}
        <button
          onClick={() => setIsMobileMenuOpen(false)}
          className="lg:hidden absolute top-4 right-4 p-2 text-body hover:bg-soft rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </aside>

      {/* Main content */}
      <div className="lg:ml-64 md:ml-20 ml-0 transition-all duration-300">
        <header className="bg-white border-b border-light shadow-card sticky top-0 z-40">
          <div className="px-4 sm:px-6 lg:px-8 py-3 lg:py-4">
            <div className="hidden lg:flex items-center justify-between">
              <h2 className="text-xl font-semibold text-dark">
                {navLinks.find((link) => isActive(link.path))?.label ||
                  "Dashboard"}
              </h2>

              <div className="flex items-center gap-6">
                <div className="flex items-center gap-4 text-sm text-body">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-primary-blue" />
                    <span>{formatDate(currentTime)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-primary-blue" />
                    <span>{formatTime(currentTime)}</span>
                  </div>
                </div>

                <div className="w-9 h-9 bg-primary-blue rounded-full flex items-center justify-center text-white text-sm font-semibold select-none">
                  AD
                </div>
              </div>
            </div>

            {/* Mobile header */}
            <div className="lg:hidden flex items-center justify-between">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2 text-body hover:bg-soft rounded-lg transition-colors active:bg-soft/80"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
              <span className="text-dark font-semibold text-sm">
                {navLinks.find((link) => isActive(link.path))?.label ||
                  "Dashboard"}
              </span>
              <div className="w-8 h-8 bg-primary-blue rounded-full flex items-center justify-center text-white text-xs font-semibold">
                AD
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
