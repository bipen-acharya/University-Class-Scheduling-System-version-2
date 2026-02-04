import { Link, useLocation, Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';
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
  Building2
} from 'lucide-react';

interface AdminLayoutProps {
  isAdminMode: boolean;
  onExitAdmin: () => void;
}

export default function AdminLayout({ isAdminMode, onExitAdmin }: AdminLayoutProps) {
  const location = useLocation();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    if (!isAdminMode && location.pathname.startsWith('/admin')) {
      window.location.href = '/';
    }
  }, [isAdminMode, location.pathname]);

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
    { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/academic-calendar', label: 'Academic Calendar', icon: CalendarDays },
    { path: '/admin/programs', label: 'Programs', icon: GraduationCap },
    { path: '/admin/teachers', label: 'Teachers', icon: Users },
    { path: '/admin/users', label: 'Users', icon: UserCog },
    { path: '/admin/subjects-rooms', label: 'Subjects & Rooms', icon: BookOpen },
    { path: '/admin/room-bookings', label: 'Room Bookings', icon: Building2 },
    { path: '/admin/timetable', label: 'Daily Timetable', icon: Calendar },
    { path: '/admin/gap-finder', label: 'Class Gap Finder', icon: Clock },
    { path: '/admin/conflicts', label: 'Conflict Checker', icon: AlertTriangle },
    { path: '/admin/reports', label: 'Reports', icon: BarChart3 },
    { path: '/admin/settings', label: 'Settings', icon: Settings },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    onExitAdmin();
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (!isAdminMode) return null;

  return (
    <div className="min-h-screen bg-soft">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Desktop & Tablet */}
      <aside className={`fixed left-0 top-0 h-full bg-white border-r border-light shadow-card z-50 transition-all duration-300 ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 ${
        isSidebarCollapsed ? 'lg:w-20' : 'lg:w-64'
      } w-64 md:w-20 md:translate-x-0`}>
        {/* Logo Section */}
        <div className="p-4 lg:p-6 border-b border-light">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-blue rounded-xl flex items-center justify-center flex-shrink-0">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div className={`${isSidebarCollapsed ? 'lg:hidden' : 'lg:block'} md:hidden block`}>
              <h1 className="text-lg text-dark">UniScheduling</h1>
              <p className="text-xs text-body">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
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
                      ? 'bg-primary-blue text-white shadow-card'
                      : 'text-body hover:bg-soft hover:text-primary-blue'
                  }`}
                  title={link.label}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className={`text-sm ${isSidebarCollapsed ? 'lg:hidden' : 'lg:block'} md:hidden block whitespace-nowrap`}>{link.label}</span>
                  
                  {/* Tooltip for collapsed state on tablet */}
                  <span className={`hidden md:block lg:hidden absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none ${
                    isSidebarCollapsed ? 'lg:block' : 'lg:hidden'
                  }`}>
                    {link.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Logout Button at Bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-2 lg:p-4 border-t border-light">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 lg:px-4 py-3 text-body hover:text-red-600 hover:bg-red-50 rounded-xl transition-all group relative"
            title="Exit Admin"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span className={`text-sm ${isSidebarCollapsed ? 'lg:hidden' : 'lg:block'} md:hidden block`}>Exit Admin</span>
            
            {/* Tooltip for collapsed state on tablet */}
            <span className={`hidden md:block lg:hidden absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none ${
              isSidebarCollapsed ? 'lg:block' : 'lg:hidden'
            }`}>
              Exit Admin
            </span>
          </button>
        </div>

        {/* Close button for mobile */}
        <button
          onClick={() => setIsMobileMenuOpen(false)}
          className="lg:hidden absolute top-4 right-4 p-2 text-body hover:bg-soft rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </aside>

      {/* Main Content Area */}
      <div className="lg:ml-64 md:ml-20 ml-0 transition-all duration-300">
        {/* Top Bar */}
        <header className="bg-white border-b border-light shadow-card sticky top-0 z-40">
          <div className="px-4 sm:px-6 lg:px-8 py-3 lg:py-4">
            {/* Mobile: Two-line layout */}
            <div className="flex flex-col gap-3 lg:hidden">
              {/* Line 1: Menu + Logo + Page Title */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsMobileMenuOpen(true)}
                    className="md:hidden p-2 text-body hover:bg-soft rounded-lg transition-colors"
                  >
                    <Menu className="w-6 h-6" />
                  </button>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary-blue rounded-lg flex items-center justify-center md:hidden">
                      <GraduationCap className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-lg sm:text-xl text-dark">
                      {navLinks.find(link => isActive(link.path))?.label || 'Dashboard'}
                    </h2>
                  </div>
                </div>
                
                {/* User Avatar */}
                <div className="w-9 h-9 bg-primary-blue rounded-full flex items-center justify-center text-white text-sm">
                  AD
                </div>
              </div>

              {/* Line 2: Date, Time, Campus */}
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-body">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-primary-blue flex-shrink-0" />
                    <span className="hidden sm:inline">{formatDate(currentTime)}</span>
                    <span className="sm:hidden">{currentTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-primary-blue flex-shrink-0" />
                    <span>{formatTime(currentTime)}</span>
                  </div>
                </div>

                {/* Campus Selector */}
                <select className="px-2 sm:px-3 py-1.5 sm:py-2 border border-light rounded-lg text-xs sm:text-sm text-body focus:outline-none focus:ring-2 focus:ring-primary-blue bg-white flex-1 sm:flex-initial max-w-[200px]">
                  <option>T1 2025</option>
                  <option>T2 2025</option>
                  <option>T3 2025</option>
                </select>
              </div>
            </div>

            {/* Desktop: Single-line layout */}
            <div className="hidden lg:flex items-center justify-between">
              <div>
                <h2 className="text-2xl text-dark">
                  {navLinks.find(link => isActive(link.path))?.label || 'Dashboard'}
                </h2>
              </div>

              <div className="flex items-center gap-6">
                {/* Current Date & Time */}
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

                {/* Campus / Trimester Selector */}
                <select className="px-4 py-2 border border-light rounded-lg text-sm text-body focus:outline-none focus:ring-2 focus:ring-primary-blue bg-white">
                  <option>Main Campus - Trimester 1 2025</option>
                  <option>Main Campus - Trimester 2 2025</option>
                  <option>Main Campus - Trimester 3 2025</option>
                </select>

                {/* User Avatar */}
                <div className="w-10 h-10 bg-primary-blue rounded-full flex items-center justify-center text-white">
                  AD
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}