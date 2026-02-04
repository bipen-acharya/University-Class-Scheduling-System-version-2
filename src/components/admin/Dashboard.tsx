import { Users, BookOpen, DoorOpen, Calendar, Clock, TrendingUp, UserCheck, CalendarDays, AlertCircle, Building2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { mockUsers } from '../../data/mockData';

export default function Dashboard() {
  // Mock data
  const totalUsers = mockUsers.length;
  const activeUsers = mockUsers.filter(u => u.status === 'Active').length;
  
  // Current academic period info
  const currentPeriod = {
    name: 'Trimester 1 - Teaching Weeks 1-6',
    type: 'Teaching Period',
    trimester: 'Trimester 1',
    startDate: new Date(2025, 0, 20),
    endDate: new Date(2025, 2, 2),
    daysRemaining: 28,
  };

  const upcomingKeyDates = [
    {
      id: 1,
      name: 'Census Date',
      date: new Date(2025, 1, 7),
      type: 'census',
      daysUntil: 14,
    },
    {
      id: 2,
      name: 'Mid-Trimester Break',
      date: new Date(2025, 2, 3),
      type: 'break',
      daysUntil: 38,
    },
    {
      id: 3,
      name: 'Examination Period Begins',
      date: new Date(2025, 3, 14),
      type: 'exam',
      daysUntil: 80,
    },
  ];

  // Room booking data
  const todayRoomBookings = [
    {
      id: 1,
      eventName: 'Web Development Bootcamp',
      room: 'Room 2.1',
      time: '09:00 - 17:00',
      organiser: 'Dr. Sarah Johnson',
      status: 'approved' as const,
    },
    {
      id: 2,
      eventName: 'Faculty Meeting',
      room: 'Room 1.2',
      time: '14:00 - 16:00',
      organiser: 'Prof. Michael Chen',
      status: 'approved' as const,
    },
  ];
  
  const stats = [
    {
      label: 'Total Teachers',
      value: '48',
      icon: Users,
      color: 'bg-blue-50',
      iconColor: 'text-primary-blue'
    },
    {
      label: 'Total Subjects',
      value: '124',
      icon: BookOpen,
      color: 'bg-green-50',
      iconColor: 'text-success'
    },
    {
      label: 'Total Rooms',
      value: '32',
      icon: DoorOpen,
      color: 'bg-purple-50',
      iconColor: 'text-purple-600'
    },
    {
      label: "Today's Classes",
      value: '67',
      icon: Calendar,
      color: 'bg-orange-50',
      iconColor: 'text-orange-600'
    },
    {
      label: 'Total Users',
      value: totalUsers.toString(),
      icon: Users,
      color: 'bg-cyan-50',
      iconColor: 'text-cyan-600'
    },
    {
      label: 'Active Users',
      value: activeUsers.toString(),
      icon: UserCheck,
      color: 'bg-teal-50',
      iconColor: 'text-teal-600'
    }
  ];

  const runningClasses = [
    {
      id: 1,
      subject: 'Data Structures & Algorithms',
      code: 'CS301',
      teacher: 'Dr. Sarah Johnson',
      room: 'Room 2.1',
      time: '10:00 AM - 12:00 PM',
      capacity: '24/30'
    },
    {
      id: 2,
      subject: 'Machine Learning Fundamentals',
      code: 'AI401',
      teacher: 'Prof. Michael Chen',
      room: 'Room 11.1',
      time: '10:00 AM - 1:00 PM',
      capacity: '18/25'
    },
    {
      id: 3,
      subject: 'Web Development',
      code: 'WEB201',
      teacher: 'Dr. Emily Brown',
      room: 'Room 1.1',
      time: '9:00 AM - 11:00 AM',
      capacity: '30/35'
    }
  ];

  const upcomingClasses = [
    {
      id: 1,
      subject: 'Database Management',
      code: 'DB301',
      teacher: 'Dr. James Wilson',
      room: 'Room 2.2',
      time: '11:00 AM - 1:00 PM',
      startsIn: '15 mins'
    },
    {
      id: 2,
      subject: 'Cloud Computing',
      code: 'CC401',
      teacher: 'Prof. Lisa Anderson',
      room: 'Room 1.2',
      time: '11:30 AM - 1:30 PM',
      startsIn: '45 mins'
    },
    {
      id: 3,
      subject: 'Cybersecurity Basics',
      code: 'SEC201',
      teacher: 'Dr. Robert Taylor',
      room: 'Room 3.1',
      time: '12:00 PM - 2:00 PM',
      startsIn: '1 hr 15 mins'
    }
  ];

  const weeklyData = [
    { day: 'Mon', classes: 68 },
    { day: 'Tue', classes: 72 },
    { day: 'Wed', classes: 65 },
    { day: 'Thu', classes: 70 },
    { day: 'Fri', classes: 58 },
    { day: 'Sat', classes: 42 },
    { day: 'Sun', classes: 25 }
  ];

  return (
    <div className="space-y-6">
      {/* Academic Period Banner */}
      <div className="bg-primary-blue rounded-2xl shadow-card-lg p-6 border border-primary-blue text-white">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white/10 rounded-xl">
              <CalendarDays className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-semibold">Current Academic Period</h3>
                <span className="px-3 py-1 bg-white/20 rounded-lg text-xs font-medium">
                  {currentPeriod.trimester}
                </span>
              </div>
              <p className="text-white/90 text-sm mb-2">{currentPeriod.name}</p>
              <p className="text-white/80 text-xs">
                {currentPeriod.startDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} - {currentPeriod.endDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-white">{currentPeriod.daysRemaining}</p>
              <p className="text-xs text-white/80">Days Remaining</p>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-card-lg p-6 border border-light hover-lift transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-body mb-1">{stat.label}</p>
                  <p className="text-3xl text-dark font-bold">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-xl`}>
                  <Icon className={`w-6 h-6 ${stat.iconColor}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Upcoming Key Dates & Classes Running Now */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Key Dates */}
        <div className="bg-white rounded-2xl shadow-card-lg p-6 border border-light">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-orange-50 rounded-lg">
              <AlertCircle className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h3 className="text-lg text-dark font-semibold">Upcoming Key Dates</h3>
              <p className="text-sm text-body">Important academic milestones</p>
            </div>
          </div>

          <div className="space-y-3">
            {upcomingKeyDates.map((keyDate) => (
              <div
                key={keyDate.id}
                className="p-4 bg-soft rounded-xl border border-light hover:border-orange-200 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-dark font-medium text-sm">{keyDate.name}</h4>
                  <span className="px-2 py-1 bg-orange-100 text-orange-600 rounded-lg text-xs font-medium">
                    In {keyDate.daysUntil} days
                  </span>
                </div>
                <p className="text-xs text-body">
                  {keyDate.date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Classes Running Now */}
        <div className="bg-white rounded-2xl shadow-card-lg p-6 border border-light">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-50 rounded-lg">
              <Clock className="w-5 h-5 text-success" />
            </div>
            <div>
              <h3 className="text-lg text-dark font-semibold">Classes Running Now</h3>
              <p className="text-sm text-body">{runningClasses.length} active classes</p>
            </div>
          </div>

          <div className="space-y-4">
            {runningClasses.map((cls) => (
              <div
                key={cls.id}
                className="p-4 bg-green-50 rounded-xl border border-green-200"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm text-success font-semibold">{cls.code}</span>
                      <span className="px-2 py-0.5 bg-success text-white rounded-full text-xs">
                        Live
                      </span>
                    </div>
                    <h4 className="text-dark font-medium mb-1">{cls.subject}</h4>
                    <p className="text-sm text-body">{cls.teacher}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-body mt-3 pt-3 border-t border-green-200">
                  <span className="flex items-center gap-1">
                    <DoorOpen className="w-3 h-3" />
                    {cls.room}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {cls.time}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {cls.capacity}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Upcoming Next Hour & Weekly Classes Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Next Hour */}
        <div className="bg-white rounded-2xl shadow-card-lg p-6 border border-light">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Calendar className="w-5 h-5 text-primary-blue" />
            </div>
            <div>
              <h3 className="text-lg text-dark font-semibold">Upcoming Next Hour</h3>
              <p className="text-sm text-body">{upcomingClasses.length} classes starting soon</p>
            </div>
          </div>

          <div className="space-y-4">
            {upcomingClasses.map((cls) => (
              <div
                key={cls.id}
                className="p-4 bg-soft rounded-xl border border-light hover:border-primary-blue transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm text-primary-blue font-semibold">{cls.code}</span>
                      <span className="px-2 py-0.5 bg-orange-100 text-orange-600 rounded-full text-xs">
                        Starts in {cls.startsIn}
                      </span>
                    </div>
                    <h4 className="text-dark font-medium mb-1">{cls.subject}</h4>
                    <p className="text-sm text-body">{cls.teacher}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-body mt-3 pt-3 border-t border-light">
                  <span className="flex items-center gap-1">
                    <DoorOpen className="w-3 h-3" />
                    {cls.room}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {cls.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Classes Chart */}
        <div className="bg-white rounded-2xl shadow-card-lg p-6 border border-light">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-50 rounded-lg">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg text-dark font-semibold">Weekly Classes Overview</h3>
              <p className="text-sm text-body">Classes scheduled per day this week</p>
            </div>
          </div>

          <div style={{ width: '100%', height: 320, minHeight: 320 }}>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis 
                  dataKey="day" 
                  stroke="#374151"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="#374151"
                  style={{ fontSize: '12px' }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Bar 
                  dataKey="classes" 
                  fill="#2563EB" 
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Today's Room Bookings */}
      <div className="bg-white rounded-2xl shadow-card-lg p-6 border border-light">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-indigo-50 rounded-lg">
            <Building2 className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-lg text-dark font-semibold">Today's Room Bookings</h3>
            <p className="text-sm text-body">{todayRoomBookings.length} rooms booked for events</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {todayRoomBookings.map((booking) => (
            <div
              key={booking.id}
              className="p-4 bg-indigo-50 rounded-xl border border-indigo-200"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="text-dark font-medium mb-1">{booking.eventName}</h4>
                  <p className="text-sm text-body">{booking.organiser}</p>
                </div>
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-medium">
                  Approved
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-body pt-3 border-t border-indigo-200">
                <span className="flex items-center gap-1">
                  <Building2 className="w-3 h-3" />
                  {booking.room}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {booking.time}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}