import { ArrowLeft, Mail, Phone, Building, IdCard, Calendar, Plus, Search, Briefcase, GraduationCap, Globe, BookOpen } from "lucide-react";
import { Button } from "../ui/button";
import { mockClasses } from "../../lib/mockData";
import { Badge } from "../ui/badge";
import React from "react";

interface TeacherProfileProps {
  teacher: any;
  onNavigate: (page: string, data?: any) => void;
}

export function TeacherProfile({ teacher, onNavigate }: TeacherProfileProps) {
  const teacherClasses = mockClasses.filter(c => c.teacherId === teacher.id);
  
  const timeSlots = [
    "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", 
    "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"
  ];
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  return (
    <div className="p-8 bg-[#F5F7FA] min-h-screen">
      <div className="max-w-7xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => onNavigate("teachers")}
          className="mb-6 text-gray-600 hover:text-[#002A4A]"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Teachers
        </Button>

        {/* Teacher Info Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-6">
          <div className="flex items-start gap-6">
            <div className="w-24 h-24 bg-[#002A4A] rounded-lg flex items-center justify-center text-white text-2xl">
              {teacher.name.split(" ").map((n: string) => n[0]).join("")}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-gray-900">{teacher.name}</h1>
                <Badge 
                  className={teacher.status === "active" 
                    ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-50" 
                    : "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-100"
                  }
                  variant="outline"
                >
                  {teacher.status === "active" ? "Currently Teaching" : "Not Teaching This Trimester"}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-4 text-gray-600">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>{teacher.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>{teacher.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4" />
                  <span>{teacher.department}</span>
                </div>
                <div className="flex items-center gap-2">
                  <IdCard className="w-4 h-4" />
                  <span>{teacher.employeeId}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => onNavigate("teacher-form", { mode: "edit", teacher })}
                className="bg-[#002A4A] hover:bg-[#003A5A] text-white"
              >
                Edit Teacher
              </Button>
              <Button
                variant="outline"
                className="border-[#0AA6A6] text-[#0AA6A6] hover:bg-[#0AA6A6] hover:text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Class
              </Button>
            </div>
          </div>
        </div>

        {/* Personal & Professional Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Contact Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Mail className="w-5 h-5 text-[#002A4A]" />
              <h2 className="text-gray-900">Contact Information</h2>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-500">University Email</label>
                <p className="text-gray-900">{teacher.universityEmail}</p>
              </div>
              {teacher.personalEmail && (
                <div>
                  <label className="text-sm text-gray-500">Personal Email</label>
                  <p className="text-gray-900">{teacher.personalEmail}</p>
                </div>
              )}
              <div>
                <label className="text-sm text-gray-500">Phone</label>
                <p className="text-gray-900">{teacher.phone}</p>
              </div>
            </div>
          </div>

          {/* Professional Details */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Briefcase className="w-5 h-5 text-[#002A4A]" />
              <h2 className="text-gray-900">Professional Details</h2>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-500">Industry Field</label>
                <p className="text-gray-900">{teacher.industryField}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Working in Industry</label>
                <p className="text-gray-900">
                  {teacher.workingInIndustry ? "Yes" : "No"}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Department</label>
                <p className="text-gray-900">{teacher.department}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Expertise & Research */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Area of Expertise */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <GraduationCap className="w-5 h-5 text-[#002A4A]" />
              <h2 className="text-gray-900">Area of Expertise</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {teacher.areaOfExpertise.map((exp: string, idx: number) => (
                <span key={idx} className="px-3 py-2 bg-blue-50 text-blue-700 rounded-lg border border-blue-200">
                  {exp}
                </span>
              ))}
            </div>
          </div>

          {/* Research Interests */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-5 h-5 text-[#002A4A]" />
              <h2 className="text-gray-900">Research Interests</h2>
            </div>
            <p className="text-gray-600">
              {teacher.researchInterests || "No research interests listed"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upcoming Classes */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Upcoming Classes
            </h2>
            <div className="space-y-3">
              {teacherClasses.slice(0, 5).map((cls) => (
                <div key={cls.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-gray-900 text-sm">{cls.subjectCode}</span>
                    <span className="text-xs px-2 py-1 bg-white rounded text-gray-600">
                      {cls.classType}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm">{cls.subjectName}</p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                    <span>{cls.day}</span>
                    <span>•</span>
                    <span>{cls.startTime}-{cls.endTime}</span>
                    <span>•</span>
                    <span>{cls.room}</span>
                  </div>
                </div>
              ))}
            </div>
            <Button
              variant="outline"
              className="w-full mt-4"
              onClick={() => onNavigate("gap-finder", { teacherId: teacher.id })}
            >
              <Search className="w-4 h-4 mr-2" />
              View Gaps
            </Button>
          </div>

          {/* Weekly Timetable */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-gray-900 mb-4">Weekly Timetable</h2>
            <div className="overflow-x-auto">
              <div className="min-w-[600px]">
                <div className="grid grid-cols-6 gap-2">
                  <div className="text-xs text-gray-600 p-2"></div>
                  {days.map(day => (
                    <div key={day} className="text-xs text-gray-700 p-2 text-center">
                      {day.slice(0, 3)}
                    </div>
                  ))}
                  
                  {timeSlots.map(time => (
                    <React.Fragment key={time}>
                      <div className="text-xs text-gray-600 p-2">
                        {time}
                      </div>
                      {days.map(day => {
                        const cls = teacherClasses.find(
                          c => c.day === day && c.startTime === time
                        );
                        return (
                          <div
                            key={`${day}-${time}`}
                            className={`p-2 rounded text-xs ${
                              cls
                                ? "bg-[#0AA6A6] text-white"
                                : "bg-gray-50 border border-gray-200"
                            }`}
                          >
                            {cls ? (
                              <div>
                                <div>{cls.subjectCode}</div>
                                <div className="text-[10px] opacity-80">{cls.room}</div>
                              </div>
                            ) : null}
                          </div>
                        );
                      })}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}