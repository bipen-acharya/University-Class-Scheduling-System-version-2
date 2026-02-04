import { Link } from 'react-router-dom';
import { 
  Users, 
  BookOpen, 
  Building, 
  Calendar,
  UserCheck,
  AlertTriangle,
  Clock,
  Plus,
  TrendingUp
} from 'lucide-react';
import { mockTeachers, mockSubjects, mockRooms, mockClasses, isClassRunning } from '../../data/mockData';

export default function AdminDashboard() {
  const activeTeachers = mockTeachers.filter(t => t.activeThisTrimester).length;
  const todayClasses = mockClasses.filter(c => {
    const today = new Date();
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return c.day === dayNames[today.getDay()];
  });
  
  const runningClasses = mockClasses.filter(isClassRunning);

  const stats = [
    {
      icon: Users,
      label: 'Total Teachers',
      value: mockTeachers.length,
      color: 'from-blue-500 to-blue-600',
      link: '/admin/teachers'
    },
    {
      icon: UserCheck,
      label: 'Active Teachers',
      value: activeTeachers,
      color: 'from-green-500 to-green-600',
      link: '/admin/teachers'
    },
    {
      icon: BookOpen,
      label: 'Total Subjects',
      value: mockSubjects.length,
      color: 'from-purple-500 to-purple-600',
      link: '/admin/subjects-rooms'
    },
    {
      icon: Building,
      label: 'Total Rooms',
      value: mockRooms.length,
      color: 'from-orange-500 to-orange-600',
      link: '/admin/subjects-rooms'
    },
    {
      icon: Calendar,
      label: "Today's Classes",
      value: todayClasses.length,
      color: 'from-teal-500 to-teal-600',
      link: '/admin/timetable'
    },
    {
      icon: Clock,
      label: 'Running Now',
      value: runningClasses.length,
      color: 'from-red-500 to-red-600',
      link: '/admin/timetable'
    }
  ];

  const quickActions = [
    {
      icon: Plus,
      label: 'Add Teacher',
      link: '/admin/teachers',
      color: 'bg-[#002A4A]'
    },
    {
      icon: Plus,
      label: 'Add Subject',
      link: '/admin/subjects-rooms',
      color: 'bg-[#0AA6A6]'
    },
    {
      icon: Calendar,
      label: 'Build Timetable',
      link: '/admin/timetable',
      color: 'bg-gradient-to-r from-[#002A4A] to-[#0AA6A6]'
    },
    {
      icon: AlertTriangle,
      label: 'Check Conflicts',
      link: '/admin/conflicts',
      color: 'bg-red-500'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl text-[#002A4A] mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome to your university scheduling system</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Link
              key={index}
              to={stat.link}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow border border-gray-100 group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-500 text-sm mb-2">{stat.label}</p>
                  <p className="text-4xl text-[#002A4A]">{stat.value}</p>
                </div>
                <div className={`w-14 h-14 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h2 className="text-xl text-[#002A4A] mb-6 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Link
                key={index}
                to={action.link}
                className={`${action.color} text-white rounded-lg p-4 hover:opacity-90 transition-opacity flex items-center gap-3`}
              >
                <Icon className="w-5 h-5" />
                <span>{action.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Classes Running Now */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h2 className="text-xl text-[#002A4A] mb-6 flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Classes Running Right Now
        </h2>
        
        {runningClasses.length === 0 ? (
          <div className="text-center py-12 bg-[#F5F7FA] rounded-lg">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">No classes are currently in session</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {runningClasses.map((classSession) => {
              const subject = mockSubjects.find(s => s.id === classSession.subjectId);
              const teacher = mockTeachers.find(t => t.id === classSession.teacherId);
              const room = mockRooms.find(r => r.id === classSession.roomId);
              
              return (
                <div
                  key={classSession.id}
                  className="bg-gradient-to-br from-[#0AA6A6] to-[#002A4A] text-white rounded-xl p-5 animate-pulse border-2 border-[#0AA6A6]"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-3 py-1 bg-white text-[#0AA6A6] text-xs rounded-full">
                      Now Running
                    </span>
                    <span className="text-sm opacity-90">
                      {classSession.startTime} - {classSession.endTime}
                    </span>
                  </div>
                  <h3 className="text-lg mb-1">{subject?.code}</h3>
                  <p className="text-sm opacity-90 mb-2">{subject?.name}</p>
                  <div className="flex items-center justify-between text-sm opacity-90">
                    <span>{teacher?.name}</span>
                    <span>{room?.name}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Today's Schedule Preview */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl text-[#002A4A] flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Today's Schedule
          </h2>
          <Link
            to="/admin/timetable"
            className="text-[#0AA6A6] hover:text-[#002A4A] transition-colors text-sm"
          >
            View Full Timetable →
          </Link>
        </div>

        {todayClasses.length === 0 ? (
          <div className="text-center py-12 bg-[#F5F7FA] rounded-lg">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">No classes scheduled for today</p>
          </div>
        ) : (
          <div className="space-y-3">
            {todayClasses.sort((a, b) => a.startTime.localeCompare(b.startTime)).map((classSession) => {
              const subject = mockSubjects.find(s => s.id === classSession.subjectId);
              const teacher = mockTeachers.find(t => t.id === classSession.teacherId);
              const room = mockRooms.find(r => r.id === classSession.roomId);
              const isRunning = isClassRunning(classSession);
              
              return (
                <div
                  key={classSession.id}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    isRunning
                      ? 'bg-[#0AA6A6] border-[#0AA6A6] text-white'
                      : 'bg-[#F5F7FA] border-gray-200 text-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`px-3 py-1 rounded text-sm ${
                        isRunning ? 'bg-white text-[#0AA6A6]' : 'bg-white text-gray-700'
                      }`}>
                        {classSession.startTime} - {classSession.endTime}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span>{subject?.code}</span>
                          {isRunning && (
                            <span className="px-2 py-0.5 bg-white text-[#0AA6A6] text-xs rounded">Now</span>
                          )}
                        </div>
                        <div className={`text-sm ${isRunning ? 'opacity-90' : 'text-gray-500'}`}>
                          {subject?.name}
                        </div>
                      </div>
                    </div>
                    <div className={`text-right text-sm ${isRunning ? 'opacity-90' : 'text-gray-600'}`}>
                      <div>{teacher?.name}</div>
                      <div>{room?.name}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
