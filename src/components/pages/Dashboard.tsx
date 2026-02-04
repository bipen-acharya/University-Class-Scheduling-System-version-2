import { Users, BookOpen, Calendar, Clock, Search, AlertTriangle, Plus, CalendarPlus, Sparkles, Play } from "lucide-react";
import { KPICard } from "../KPICard";
import { Button } from "../ui/button";
import { mockClasses, mockTeachers } from "../../lib/mockData";
import { useState, useEffect } from "react";

export function Dashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute
    return () => clearInterval(timer);
  }, []);

  // Get classes currently running
  const getRunningClasses = () => {
    const now = currentTime;
    const currentDay = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][now.getDay()];
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeInMinutes = currentHour * 60 + currentMinute;

    return mockClasses.filter(cls => {
      if (cls.day !== currentDay) return false;
      const [startHour, startMinute] = cls.startTime.split(":").map(Number);
      const [endHour, endMinute] = cls.endTime.split(":").map(Number);
      const startTimeInMinutes = startHour * 60 + startMinute;
      const endTimeInMinutes = endHour * 60 + endMinute;
      return currentTimeInMinutes >= startTimeInMinutes && currentTimeInMinutes < endTimeInMinutes;
    });
  };

  // Calculate time remaining
  const getTimeRemaining = (endTime: string) => {
    const now = currentTime;
    const [endHour, endMinute] = endTime.split(":").map(Number);
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const endMinutes = endHour * 60 + endMinute;
    const remaining = endMinutes - currentMinutes;
    
    if (remaining <= 0) return "Ending soon";
    
    const hours = Math.floor(remaining / 60);
    const minutes = remaining % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m remaining`;
    }
    return `${minutes}m remaining`;
  };

  const runningClasses = getRunningClasses();

  const weeklyData = [
    { day: "Monday", classes: 12 },
    { day: "Tuesday", classes: 15 },
    { day: "Wednesday", classes: 10 },
    { day: "Thursday", classes: 14 },
    { day: "Friday", classes: 8 },
  ];

  const maxClasses = Math.max(...weeklyData.map(d => d.classes));

  return (
    <div className="p-8 bg-[#F5F7FA] min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Classes Running Right Now Widget */}
        {runningClasses.length > 0 && (
          <div className="bg-green-50 rounded-xl p-6 shadow-sm border border-green-200 mb-6 animate-in fade-in duration-500">
            <div className="flex items-center gap-2 mb-4">
              <Play className="w-6 h-6 text-green-600 animate-pulse" />
              <h2 className="text-gray-900">Classes Running Right Now</h2>
              <span className="ml-auto text-sm text-gray-600">
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {runningClasses.map((cls) => {
                const teacher = mockTeachers.find(t => t.id === cls.teacherId);
                return (
                  <div 
                    key={cls.id} 
                    className="bg-white rounded-lg p-4 border-l-4 shadow-sm hover:shadow-md transition-shadow"
                    style={{ borderLeftColor: cls.color }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-gray-900">{cls.subjectCode}</h3>
                          <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
                            Live
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{cls.subjectName}</p>
                      </div>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Users className="w-3.5 h-3.5" />
                        <span>{teacher?.name || cls.teacherName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>{cls.room}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-orange-600" />
                        <span className="text-orange-600">{getTimeRemaining(cls.endTime)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <KPICard
            title="Total Teachers"
            value="24"
            icon={Users}
            color="blue"
            trend="+2 this month"
          />
          <KPICard
            title="Total Subjects"
            value="18"
            icon={BookOpen}
            color="teal"
            trend="Active this semester"
          />
          <KPICard
            title="Classes This Week"
            value="59"
            icon={Calendar}
            color="purple"
            trend="Across 5 days"
          />
          <KPICard
            title="Today's Classes"
            value="12"
            icon={Clock}
            color="yellow"
            trend="8 completed, 4 pending"
          />
          <KPICard
            title="Gaps Detected"
            value="8"
            icon={Search}
            color="teal"
            trend="Potential free slots"
          />
          <KPICard
            title="Conflicts Detected"
            value="2"
            icon={AlertTriangle}
            color="red"
            trend="Needs attention"
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
          <h2 className="text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button className="bg-[#002A4A] hover:bg-[#003A5A] text-white h-auto py-4 flex flex-col items-center gap-2">
              <Plus className="w-5 h-5" />
              <span>Add Teacher</span>
            </Button>
            <Button className="bg-[#0AA6A6] hover:bg-[#0B9696] text-white h-auto py-4 flex flex-col items-center gap-2">
              <CalendarPlus className="w-5 h-5" />
              <span>Add Class</span>
            </Button>
            <Button className="bg-[#002A4A] hover:bg-[#003A5A] text-white h-auto py-4 flex flex-col items-center gap-2">
              <Sparkles className="w-5 h-5" />
              <span>Build Timetable</span>
            </Button>
            <Button className="bg-[#0AA6A6] hover:bg-[#0B9696] text-white h-auto py-4 flex flex-col items-center gap-2">
              <Search className="w-5 h-5" />
              <span>Gap Finder</span>
            </Button>
          </div>
        </div>

        {/* Weekly Snapshot */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-gray-900 mb-6">Weekly Class Overview</h2>
          <div className="space-y-4">
            {weeklyData.map((day) => (
              <div key={day.day} className="flex items-center gap-4">
                <div className="w-28 text-gray-700">{day.day}</div>
                <div className="flex-1 bg-gray-100 rounded-full h-8 overflow-hidden">
                  <div
                    className="bg-[#0AA6A6] h-full rounded-full flex items-center justify-end px-4 transition-all"
                    style={{ width: `${(day.classes / maxClasses) * 100}%` }}
                  >
                    <span className="text-white text-sm">{day.classes}</span>
                  </div>
                </div>
                <div className="w-24 text-right text-gray-600 text-sm">
                  {day.classes} classes
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Weekly Classes</p>
                <p className="text-gray-900 mt-1">59 classes scheduled</p>
              </div>
              <Button variant="outline" className="border-[#002A4A] text-[#002A4A] hover:bg-[#002A4A] hover:text-white">
                View Full Timetable
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}