import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, DoorOpen, Award } from 'lucide-react';

export default function Reports() {
  // Most Used Rooms
  const roomUsageData = [
    { room: 'Room 2.1', classes: 42, utilization: 85 },
    { room: 'Room 1.1', classes: 38, utilization: 78 },
    { room: 'Room 11.1', classes: 35, utilization: 72 },
    { room: 'Room 2.2', classes: 32, utilization: 65 },
    { room: 'Room 1.2', classes: 28, utilization: 58 },
    { room: 'Room 3.1', classes: 25, utilization: 52 }
  ];

  // Top Teaching Load
  const teachingLoadData = [
    { teacher: 'Dr. Sarah Johnson', hours: 18, classes: 6 },
    { teacher: 'Prof. Michael Chen', hours: 16, classes: 5 },
    { teacher: 'Dr. Emily Brown', hours: 15, classes: 5 },
    { teacher: 'Dr. James Wilson', hours: 14, classes: 5 },
    { teacher: 'Prof. Lisa Anderson', hours: 12, classes: 4 },
    { teacher: 'Dr. Robert Taylor', hours: 11, classes: 4 }
  ];

  // Average Classes per Day
  const dailyAverageData = [
    { day: 'Monday', avgClasses: 68 },
    { day: 'Tuesday', avgClasses: 72 },
    { day: 'Wednesday', avgClasses: 65 },
    { day: 'Thursday', avgClasses: 70 },
    { day: 'Friday', avgClasses: 58 },
    { day: 'Saturday', avgClasses: 42 },
    { day: 'Sunday', avgClasses: 25 }
  ];

  // Department Distribution
  const departmentData = [
    { name: 'Computer Science', value: 45, color: '#2563EB' },
    { name: 'Engineering', value: 30, color: '#10B981' },
    { name: 'Business', value: 15, color: '#F59E0B' },
    { name: 'Arts', value: 10, color: '#8B5CF6' }
  ];

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-card-lg p-6 border border-light">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-blue-50 rounded-lg">
              <TrendingUp className="w-5 h-5 text-primary-blue" />
            </div>
            <span className="text-3xl text-dark font-bold">400</span>
          </div>
          <p className="text-sm text-body">Total Weekly Classes</p>
        </div>

        <div className="bg-white rounded-2xl shadow-card-lg p-6 border border-light">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-green-50 rounded-lg">
              <Users className="w-5 h-5 text-success" />
            </div>
            <span className="text-3xl text-dark font-bold">14.2</span>
          </div>
          <p className="text-sm text-body">Avg Hours per Teacher</p>
        </div>

        <div className="bg-white rounded-2xl shadow-card-lg p-6 border border-light">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-purple-50 rounded-lg">
              <DoorOpen className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-3xl text-dark font-bold">68%</span>
          </div>
          <p className="text-sm text-body">Avg Room Utilization</p>
        </div>

        <div className="bg-white rounded-2xl shadow-card-lg p-6 border border-light">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-orange-50 rounded-lg">
              <Award className="w-5 h-5 text-orange-600" />
            </div>
            <span className="text-3xl text-dark font-bold">57</span>
          </div>
          <p className="text-sm text-body">Avg Daily Classes</p>
        </div>
      </div>

      {/* Most Used Rooms & Top Teaching Load */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Used Rooms */}
        <div className="bg-white rounded-2xl shadow-card-lg p-6 border border-light">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-50 rounded-lg">
              <DoorOpen className="w-5 h-5 text-primary-blue" />
            </div>
            <div>
              <h3 className="text-lg text-dark font-semibold">Most Used Rooms</h3>
              <p className="text-sm text-body">Room utilization this week</p>
            </div>
          </div>

          <div className="space-y-4">
            {roomUsageData.map((room, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-dark font-medium">{room.room}</p>
                    <p className="text-xs text-body">{room.classes} classes scheduled</p>
                  </div>
                  <span className="text-sm text-primary-blue font-semibold">{room.utilization}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-primary-blue rounded-full h-2 transition-all"
                    style={{ width: `${room.utilization}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Teaching Load */}
        <div className="bg-white rounded-2xl shadow-card-lg p-6 border border-light">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-50 rounded-lg">
              <Users className="w-5 h-5 text-success" />
            </div>
            <div>
              <h3 className="text-lg text-dark font-semibold">Top Teaching Load</h3>
              <p className="text-sm text-body">Most active teachers this week</p>
            </div>
          </div>

          <div className="space-y-4">
            {teachingLoadData.map((teacher, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-soft rounded-xl border border-light">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-blue rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-sm text-dark font-medium">{teacher.teacher}</p>
                    <p className="text-xs text-body">{teacher.classes} classes</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg text-primary-blue font-bold">{teacher.hours}h</p>
                  <p className="text-xs text-body">teaching</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Average Classes per Day Chart */}
      <div className="bg-white rounded-2xl shadow-card-lg p-6 border border-light">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-purple-50 rounded-lg">
            <TrendingUp className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg text-dark font-semibold">Average Classes per Day</h3>
            <p className="text-sm text-body">Weekly distribution of classes</p>
          </div>
        </div>

        <div style={{ width: '100%', height: 320, minHeight: 320 }}>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={dailyAverageData}>
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
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Bar 
                dataKey="avgClasses" 
                fill="#2563EB" 
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Department Distribution */}
      <div className="bg-white rounded-2xl shadow-card-lg p-6 border border-light">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-orange-50 rounded-lg">
            <Award className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <h3 className="text-lg text-dark font-semibold">Classes by Department</h3>
            <p className="text-sm text-body">Distribution of classes across departments</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
          <div style={{ width: '100%', height: 320, minHeight: 320 }}>
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={departmentData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {departmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-3">
            {departmentData.map((dept, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-soft rounded-xl">
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: dept.color }}
                  ></div>
                  <span className="text-sm text-dark font-medium">{dept.name}</span>
                </div>
                <span className="text-sm text-body font-semibold">{dept.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}