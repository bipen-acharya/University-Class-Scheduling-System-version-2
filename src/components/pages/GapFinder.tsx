import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { mockTeachers, mockClasses } from "../../lib/mockData";
import { Clock, TrendingUp, Calendar, Filter } from "lucide-react";
import React from "react";
import { Button } from "../ui/button";

interface GapFinderProps {
  teacherId?: string;
}

export function GapFinder({ teacherId: initialTeacherId }: GapFinderProps) {
  const [selectedTeacherId, setSelectedTeacherId] = useState(initialTeacherId || mockTeachers[0].id);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [expertiseFilter, setExpertiseFilter] = useState<string>("all");
  const [industryFilter, setIndustryFilter] = useState<string>("all");
  
  // Get unique values for filters
  const departments = [...new Set(mockTeachers.map(t => t.department))];
  const expertiseAreas = Array.from(new Set(mockTeachers.flatMap(t => t.areaOfExpertise)));
  const industries = [...new Set(mockTeachers.map(t => t.industryField))];

  // Filter teachers
  const filteredTeachers = mockTeachers.filter(teacher => {
    if (statusFilter !== "all" && teacher.status !== statusFilter) return false;
    if (departmentFilter !== "all" && teacher.department !== departmentFilter) return false;
    if (expertiseFilter !== "all" && !teacher.areaOfExpertise.includes(expertiseFilter)) return false;
    if (industryFilter !== "all" && teacher.industryField !== industryFilter) return false;
    return true;
  });

  const selectedTeacher = mockTeachers.find(t => t.id === selectedTeacherId);
  const teacherClasses = mockClasses.filter(c => c.teacherId === selectedTeacherId);

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const timeSlots = [];
  for (let hour = 8; hour <= 19; hour++) {
    timeSlots.push(`${hour.toString().padStart(2, "0")}:00`);
  }

  const getClassAtSlot = (day: string, time: string) => {
    return teacherClasses.find(cls => {
      if (cls.day !== day) return false;
      const classStartHour = parseInt(cls.startTime.split(":")[0]);
      const classEndHour = parseInt(cls.endTime.split(":")[0]);
      const slotHour = parseInt(time.split(":")[0]);
      return slotHour >= classStartHour && slotHour < classEndHour;
    });
  };

  // Calculate statistics
  const totalTeachingHours = teacherClasses.reduce((acc, cls) => {
    const start = parseInt(cls.startTime.split(":")[0]);
    const end = parseInt(cls.endTime.split(":")[0]);
    return acc + (end - start);
  }, 0);

  const totalWorkHours = 12 * 5; // 8:00 to 20:00, 5 days
  const totalFreeHours = totalWorkHours - totalTeachingHours;

  // Find gaps
  const gaps: { day: string; startTime: string; endTime: string; duration: number }[] = [];
  days.forEach(day => {
    let gapStart: string | null = null;
    timeSlots.forEach((time, index) => {
      const cls = getClassAtSlot(day, time);
      if (!cls && !gapStart) {
        gapStart = time;
      } else if (cls && gapStart) {
        gaps.push({
          day,
          startTime: gapStart,
          endTime: time,
          duration: index - timeSlots.indexOf(gapStart),
        });
        gapStart = null;
      }
    });
    if (gapStart) {
      gaps.push({
        day,
        startTime: gapStart,
        endTime: "20:00",
        duration: timeSlots.length - timeSlots.indexOf(gapStart),
      });
    }
  });

  const biggestGap = gaps.reduce((max, gap) => gap.duration > max.duration ? gap : max, gaps[0] || { duration: 0 });

  return (
    <div className="p-8 bg-[#F5F7FA] min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-gray-900">Gap Finder</h1>
          <p className="text-gray-600 mt-1">Identify free time slots for teachers</p>
        </div>

        {/* Teacher Selection */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-[#002A4A]" />
            <h2 className="text-gray-900">Teacher Selection & Filters</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="text-sm text-gray-700 mb-2 block">Select Teacher</label>
              <Select value={selectedTeacherId} onValueChange={setSelectedTeacherId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {filteredTeachers.map(teacher => (
                    <SelectItem key={teacher.id} value={teacher.id}>
                      {teacher.name} - {teacher.department}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm text-gray-600 mb-2 block">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm text-gray-600 mb-2 block">Department</label>
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map(dept => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm text-gray-600 mb-2 block">Expertise Area</label>
              <Select value={expertiseFilter} onValueChange={setExpertiseFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Expertise" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Expertise</SelectItem>
                  {expertiseAreas.map(area => (
                    <SelectItem key={area} value={area}>{area}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm text-gray-600 mb-2 block">Industry Field</label>
              <Select value={industryFilter} onValueChange={setIndustryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Industries" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Industries</SelectItem>
                  {industries.map(ind => (
                    <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {(statusFilter !== "all" || departmentFilter !== "all" || expertiseFilter !== "all" || industryFilter !== "all") && (
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => {
                setStatusFilter("all");
                setDepartmentFilter("all");
                setExpertiseFilter("all");
                setIndustryFilter("all");
              }}
            >
              Clear Filters
            </Button>
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Teaching Hours</p>
                <p className="text-gray-900 mt-2">{totalTeachingHours} hours</p>
                <p className="text-gray-500 text-sm mt-1">This week</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Free Hours</p>
                <p className="text-gray-900 mt-2">{totalFreeHours} hours</p>
                <p className="text-gray-500 text-sm mt-1">Available time</p>
              </div>
              <div className="w-12 h-12 bg-teal-50 text-[#0AA6A6] rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-600 text-sm">Number of Gaps</p>
                <p className="text-gray-900 mt-2">{gaps.length} gaps</p>
                <p className="text-gray-500 text-sm mt-1">Free slots found</p>
              </div>
              <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-600 text-sm">Biggest Gap</p>
                <p className="text-gray-900 mt-2">
                  {biggestGap ? `${biggestGap.duration}h` : "N/A"}
                </p>
                <p className="text-gray-500 text-sm mt-1">
                  {biggestGap ? `${biggestGap.day}` : "No gaps"}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-50 text-yellow-600 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Timetable Visualization */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-gray-900 mb-4">
            Weekly Timetable - {selectedTeacher?.name}
          </h2>
          
          <div className="overflow-x-auto">
            <div className="min-w-[900px]">
              <div className="grid grid-cols-6 gap-2">
                {/* Header */}
                <div className="p-3 bg-[#002A4A] rounded-lg text-white text-center text-sm">
                  Time
                </div>
                {days.map(day => (
                  <div key={day} className="p-3 bg-[#002A4A] rounded-lg text-white text-center text-sm">
                    {day}
                  </div>
                ))}

                {/* Time Slots */}
                {timeSlots.map(time => (
                  <React.Fragment key={time}>
                    <div className="p-3 bg-gray-50 rounded text-xs text-gray-600 text-center flex items-center justify-center">
                      {time}
                    </div>
                    {days.map(day => {
                      const cls = getClassAtSlot(day, time);
                      if (!cls) {
                        return (
                          <div
                            key={`${day}-${time}`}
                            className="p-3 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300"
                          >
                            <div className="text-xs text-gray-500 text-center">Free</div>
                          </div>
                        );
                      }

                      // Only render the block at the start time
                      if (cls.startTime !== time) {
                        return null;
                      }

                      const duration = parseInt(cls.endTime.split(":")[0]) - parseInt(cls.startTime.split(":")[0]);

                      return (
                        <div
                          key={`${day}-${time}`}
                          className="p-3 rounded-lg"
                          style={{
                            backgroundColor: cls.color,
                            gridRow: `span ${duration}`,
                          }}
                        >
                          <div className="text-white">
                            <div className="text-sm">{cls.subjectCode}</div>
                            <div className="text-xs opacity-90 mt-1">{cls.room}</div>
                            <div className="text-xs opacity-75">
                              {cls.startTime}-{cls.endTime}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-gray-900 mb-3">Suggested Time Slots for Extra Classes</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {gaps.slice(0, 6).map((gap, index) => (
                <div key={index} className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-green-800">{gap.day}</span>
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
                      {gap.duration}h available
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {gap.startTime} - {gap.endTime}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}