import { useState, useEffect } from "react";
import { Plus, Filter, Save, RotateCcw, Clock } from "lucide-react";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { mockClasses, mockTeachers } from "../../lib/mockData";
import React from "react";

interface TimetableProps {
  onNavigate: (page: string, data?: any) => void;
}

export function Timetable({ onNavigate }: TimetableProps) {
  const [selectedTeacher, setSelectedTeacher] = useState<string>("all");
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [selectedRoom, setSelectedRoom] = useState<string>("all");
  const [selectedDay, setSelectedDay] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedExpertise, setSelectedExpertise] = useState<string>("all");
  const [selectedIndustry, setSelectedIndustry] = useState<string>("all");
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute
    return () => clearInterval(timer);
  }, []);

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const timeSlots = [];
  for (let hour = 8; hour <= 19; hour++) {
    timeSlots.push(`${hour.toString().padStart(2, "0")}:00`);
  }

  // Get current day
  const currentDayName = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][currentTime.getDay()];
  const isToday = (day: string) => day === currentDayName;
  const isWeekend = (day: string) => day === "Saturday" || day === "Sunday";

  // Check if a class is currently running
  const isClassRunning = (cls: any) => {
    const now = currentTime;
    const currentDay = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][now.getDay()];
    if (cls.day !== currentDay) return false;

    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeInMinutes = currentHour * 60 + currentMinute;

    const [startHour, startMinute] = cls.startTime.split(":").map(Number);
    const [endHour, endMinute] = cls.endTime.split(":").map(Number);
    const startTimeInMinutes = startHour * 60 + startMinute;
    const endTimeInMinutes = endHour * 60 + endMinute;

    return currentTimeInMinutes >= startTimeInMinutes && currentTimeInMinutes < endTimeInMinutes;
  };

  // Filter classes based on selections
  const filteredClasses = mockClasses.filter(cls => {
    if (selectedTeacher !== "all" && cls.teacherId !== selectedTeacher) return false;
    if (selectedSubject !== "all" && cls.subjectCode !== selectedSubject) return false;
    if (selectedRoom !== "all" && cls.room !== selectedRoom) return false;
    if (selectedDay !== "all" && cls.day !== selectedDay) return false;
    
    // Advanced teacher filters
    if (selectedStatus !== "all" || selectedExpertise !== "all" || selectedIndustry !== "all") {
      const teacher = mockTeachers.find(t => t.id === cls.teacherId);
      if (!teacher) return false;
      if (selectedStatus !== "all" && teacher.status !== selectedStatus) return false;
      if (selectedExpertise !== "all" && !teacher.areaOfExpertise.includes(selectedExpertise)) return false;
      if (selectedIndustry !== "all" && teacher.industryField !== selectedIndustry) return false;
    }
    
    return true;
  });

  const getClassAtSlot = (day: string, time: string) => {
    return filteredClasses.find(cls => {
      if (cls.day !== day) return false;
      const classHour = parseInt(cls.startTime.split(":")[0]);
      const slotHour = parseInt(time.split(":")[0]);
      return classHour === slotHour;
    });
  };

  const getClassDuration = (cls: any) => {
    const start = parseInt(cls.startTime.split(":")[0]);
    const end = parseInt(cls.endTime.split(":")[0]);
    return end - start;
  };

  const uniqueSubjects = [...new Set(mockClasses.map(c => c.subjectCode))];
  const uniqueRooms = [...new Set(mockClasses.map(c => c.room))];
  const expertiseAreas = Array.from(new Set(mockTeachers.flatMap(t => t.areaOfExpertise)));
  const industries = [...new Set(mockTeachers.map(t => t.industryField))];

  // Format current time for display
  const formatCurrentTime = () => {
    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, "0")} ${ampm}`;
  };

  return (
    <div className="p-8 bg-[#F5F7FA] min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-gray-900">Weekly Timetable Builder</h1>
            <p className="text-gray-600 mt-1">Manage and visualize weekly class schedule</p>
          </div>
          <div className="flex gap-3">
            {/* Current Time Badge */}
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-200 shadow-sm">
              <Clock className="w-4 h-4 text-[#0AA6A6]" />
              <span className="text-sm text-gray-700">Current Time: {formatCurrentTime()}</span>
            </div>
            <Button 
              variant="outline"
              className="border-gray-300"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset Timetable
            </Button>
            <Button 
              className="bg-[#0AA6A6] hover:bg-[#0B9696] text-white"
              onClick={() => onNavigate("class-form", { mode: "add" })}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Class
            </Button>
            <Button className="bg-[#002A4A] hover:bg-[#003A5A] text-white">
              <Save className="w-4 h-4 mr-2" />
              Save Timetable
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Panel */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-fit">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-5 h-5 text-[#002A4A]" />
              <h2 className="text-gray-900">Filters</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-600 mb-2 block">Teacher</label>
                <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Teachers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Teachers</SelectItem>
                    {mockTeachers.map(teacher => (
                      <SelectItem key={teacher.id} value={teacher.id}>
                        {teacher.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-gray-600 mb-2 block">Subject</label>
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Subjects" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Subjects</SelectItem>
                    {uniqueSubjects.map(subject => (
                      <SelectItem key={subject} value={subject}>
                        {subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-gray-600 mb-2 block">Room</label>
                <Select value={selectedRoom} onValueChange={setSelectedRoom}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Rooms" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Rooms</SelectItem>
                    {uniqueRooms.map(room => (
                      <SelectItem key={room} value={room}>
                        {room}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-gray-600 mb-2 block">Day</label>
                <Select value={selectedDay} onValueChange={setSelectedDay}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Days" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Days</SelectItem>
                    {days.map(day => (
                      <SelectItem key={day} value={day}>
                        {day}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-gray-600 mb-2 block">Status</label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
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
                <label className="text-sm text-gray-600 mb-2 block">Expertise Area</label>
                <Select value={selectedExpertise} onValueChange={setSelectedExpertise}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Expertise Areas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Expertise Areas</SelectItem>
                    {expertiseAreas.map(area => (
                      <SelectItem key={area} value={area}>
                        {area}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-gray-600 mb-2 block">Industry Field</label>
                <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Industry Fields" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Industry Fields</SelectItem>
                    {industries.map(industry => (
                      <SelectItem key={industry} value={industry}>
                        {industry}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setSelectedTeacher("all");
                  setSelectedSubject("all");
                  setSelectedRoom("all");
                  setSelectedDay("all");
                  setSelectedStatus("all");
                  setSelectedExpertise("all");
                  setSelectedIndustry("all");
                }}
              >
                Clear Filters
              </Button>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-sm text-gray-700 mb-3">Legend</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: "#3B82F6" }}></div>
                  <span className="text-gray-600">Lecture</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: "#EC4899" }}></div>
                  <span className="text-gray-600">Tutorial</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: "#F59E0B" }}></div>
                  <span className="text-gray-600">Workshop</span>
                </div>
              </div>
            </div>
          </div>

          {/* Timetable Grid */}
          <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="overflow-x-auto">
              <div className="min-w-[1100px]">
                <div className="grid grid-cols-8 gap-2">
                  {/* Header */}
                  <div className="p-3 bg-[#002A4A] rounded-lg text-white text-center">
                    Time
                  </div>
                  {days.map(day => (
                    <div 
                      key={day} 
                      className={`p-3 rounded-lg text-white text-center relative ${
                        isToday(day) 
                          ? "bg-[#0AA6A6]" 
                          : isWeekend(day)
                          ? "bg-gray-400"
                          : "bg-[#002A4A]"
                      }`}
                    >
                      {day}
                      {isToday(day) && (
                        <span className="absolute -top-2 -right-2 px-2 py-0.5 bg-green-500 text-white text-xs rounded-full">
                          Today
                        </span>
                      )}
                    </div>
                  ))}

                  {/* Time Slots */}
                  {timeSlots.map(time => (
                    <React.Fragment key={time}>
                      <div className="p-3 bg-gray-50 rounded text-sm text-gray-600 text-center">
                        {time}
                      </div>
                      {days.map(day => {
                        const cls = getClassAtSlot(day, time);
                        const isTodayColumn = isToday(day);
                        const isWeekendDay = isWeekend(day);
                        
                        if (!cls) {
                          return (
                            <div
                              key={`${day}-${time}`}
                              className={`p-3 border-2 border-dashed rounded-lg hover:border-[#0AA6A6] hover:bg-gray-50 transition-colors cursor-pointer ${
                                isTodayColumn 
                                  ? "bg-[#0AA6A6]/5 border-[#0AA6A6]/20" 
                                  : isWeekendDay
                                  ? "bg-gray-100/50 border-gray-300"
                                  : "border-gray-200"
                              }`}
                            />
                          );
                        }

                        const duration = getClassDuration(cls);
                        const rowSpan = duration;
                        const isRunning = isClassRunning(cls);

                        return (
                          <div
                            key={`${day}-${time}`}
                            className={`p-3 rounded-lg cursor-pointer transition-all relative ${
                              isRunning 
                                ? "ring-4 ring-yellow-400 ring-offset-2 animate-pulse shadow-lg brightness-110" 
                                : "hover:opacity-80"
                            } ${
                              isWeekendDay ? "border-2 border-dashed border-gray-400 opacity-90" : ""
                            }`}
                            style={{
                              backgroundColor: cls.color,
                              gridRow: `span ${rowSpan}`,
                            }}
                            onClick={() => setSelectedClass(cls)}
                          >
                            {isRunning && (
                              <div className="absolute -top-2 -right-2 px-2 py-1 bg-yellow-400 text-yellow-900 text-xs rounded-full shadow-md animate-bounce">
                                Now Running
                              </div>
                            )}
                            <div className="text-white">
                              <div className="text-sm">{cls.subjectCode}</div>
                              <div className="text-xs opacity-90 mt-1">{cls.teacherName}</div>
                              <div className="text-xs opacity-75">{cls.room}</div>
                              <div className="text-xs opacity-75 mt-1">
                                {cls.startTime} - {cls.endTime}
                              </div>
                              <div className="text-xs opacity-75 bg-white/20 rounded px-1 mt-1 inline-block">
                                {cls.classType}
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

            <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
              <span>Total Classes: {filteredClasses.length}</span>
              <span>Click on a class block to view details</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}