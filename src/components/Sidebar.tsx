import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  Calendar, 
  Search, 
  AlertTriangle, 
  Clock, 
  Settings 
} from "lucide-react";

interface SidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
}

export function Sidebar({ activePage, onNavigate }: SidebarProps) {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "teachers", label: "Teachers", icon: Users },
    { id: "classes", label: "Classes", icon: BookOpen },
    { id: "timetable", label: "Timetable", icon: Calendar },
    { id: "gap-finder", label: "Gap Finder", icon: Search },
    { id: "conflict-checker", label: "Conflict Checker", icon: AlertTriangle },
    { id: "timesheets", label: "Timesheets", icon: Clock },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="w-64 bg-[#002A4A] min-h-screen flex flex-col hidden md:flex">
      <div className="p-6 border-b border-white/10">
        <h1 className="text-white tracking-tight">UTS3</h1>
        <p className="text-white/60 text-sm mt-1">University Scheduling</p>
      </div>
      
      <nav className="flex-1 p-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-all ${
                isActive
                  ? "bg-[#0AA6A6] text-white"
                  : "text-white/70 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-white/10">
        <div className="bg-white/5 rounded-lg p-4">
          <p className="text-white/60 text-sm">Logged in as</p>
          <p className="text-white">Admin User</p>
        </div>
      </div>
    </div>
  );
}