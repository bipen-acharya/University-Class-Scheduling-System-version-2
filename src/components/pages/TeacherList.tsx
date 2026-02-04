import { useState, useMemo } from "react";
import { Plus, Pencil, Trash2, Eye, Filter } from "lucide-react";
import { Button } from "../ui/button";
import { mockTeachers, mockClasses } from "../../lib/mockData";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Badge } from "../ui/badge";

interface TeacherListProps {
  onNavigate: (page: string, data?: any) => void;
}

export function TeacherList({ onNavigate }: TeacherListProps) {
  const [teachers] = useState(mockTeachers);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [expertiseFilter, setExpertiseFilter] = useState<string>("all");
  const [industryFilter, setIndustryFilter] = useState<string>("all");

  // Get unique values for filters
  const departments = useMemo(() => [...new Set(teachers.map(t => t.department))], [teachers]);
  const expertiseAreas = useMemo(() => {
    const areas = new Set<string>();
    teachers.forEach(t => t.areaOfExpertise.forEach(e => areas.add(e)));
    return Array.from(areas);
  }, [teachers]);
  const industries = useMemo(() => [...new Set(teachers.map(t => t.industryField))], [teachers]);

  // Check if teacher is currently teaching (real-time)
  const isTeachingNow = (teacherId: string) => {
    const now = new Date();
    const currentDay = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][now.getDay()];
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeInMinutes = currentHour * 60 + currentMinute;

    return mockClasses.some(cls => {
      if (cls.teacherId !== teacherId || cls.day !== currentDay) return false;
      const [startHour, startMinute] = cls.startTime.split(":").map(Number);
      const [endHour, endMinute] = cls.endTime.split(":").map(Number);
      const startTimeInMinutes = startHour * 60 + startMinute;
      const endTimeInMinutes = endHour * 60 + endMinute;
      return currentTimeInMinutes >= startTimeInMinutes && currentTimeInMinutes < endTimeInMinutes;
    });
  };

  // Filter teachers
  const filteredTeachers = useMemo(() => {
    return teachers.filter(teacher => {
      if (statusFilter !== "all" && teacher.status !== statusFilter) return false;
      if (departmentFilter !== "all" && teacher.department !== departmentFilter) return false;
      if (expertiseFilter !== "all" && !teacher.areaOfExpertise.includes(expertiseFilter)) return false;
      if (industryFilter !== "all" && teacher.industryField !== industryFilter) return false;
      return true;
    });
  }, [teachers, statusFilter, departmentFilter, expertiseFilter, industryFilter]);

  return (
    <div className="p-8 bg-[#F5F7FA] min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-gray-900">Teacher Management</h1>
            <p className="text-gray-600 mt-1">Manage all teaching staff and their assignments</p>
          </div>
          <Button 
            className="bg-[#0AA6A6] hover:bg-[#0B9696] text-white"
            onClick={() => onNavigate("teacher-form", { mode: "add" })}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Teacher
          </Button>
        </div>

        {/* Advanced Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-[#002A4A]" />
            <h2 className="text-gray-900">Advanced Filters</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
              <label className="text-sm text-gray-600 mb-2 block">Area of Expertise</label>
              <Select value={expertiseFilter} onValueChange={setExpertiseFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Expertise" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Expertise</SelectItem>
                  {expertiseAreas.map(exp => (
                    <SelectItem key={exp} value={exp}>{exp}</SelectItem>
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
              Clear All Filters
            </Button>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-gray-700">Name</th>
                  <th className="px-6 py-4 text-left text-gray-700">Status</th>
                  <th className="px-6 py-4 text-left text-gray-700">Email</th>
                  <th className="px-6 py-4 text-left text-gray-700">Department</th>
                  <th className="px-6 py-4 text-left text-gray-700">Expertise</th>
                  <th className="px-6 py-4 text-left text-gray-700">Classes</th>
                  <th className="px-6 py-4 text-left text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredTeachers.map((teacher) => {
                  const teachingNow = isTeachingNow(teacher.id);
                  return (
                    <tr key={teacher.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="w-10 h-10 bg-[#002A4A] rounded-full flex items-center justify-center text-white">
                              {teacher.name.split(" ").map(n => n[0]).join("")}
                            </div>
                            {teachingNow && (
                              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse" title="Teaching Now" />
                            )}
                          </div>
                          <div>
                            <div className="text-gray-900">{teacher.name}</div>
                            {teachingNow && (
                              <div className="text-xs text-green-600 flex items-center gap-1 mt-1">
                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                                Teaching Now
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge 
                          className={teacher.status === "active" 
                            ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-50" 
                            : "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-100"
                          }
                          variant="outline"
                        >
                          {teacher.status === "active" ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{teacher.email}</td>
                      <td className="px-6 py-4 text-gray-600">{teacher.department}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {teacher.areaOfExpertise.slice(0, 2).map((exp, idx) => (
                            <span key={idx} className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded">
                              {exp}
                            </span>
                          ))}
                          {teacher.areaOfExpertise.length > 2 && (
                            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                              +{teacher.areaOfExpertise.length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-[#0AA6A6]/10 text-[#0AA6A6]">
                          {teacher.classesAssigned} classes
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onNavigate("teacher-profile", { teacher })}
                            className="text-gray-600 hover:text-[#002A4A]"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onNavigate("teacher-form", { mode: "edit", teacher })}
                            className="text-gray-600 hover:text-[#0AA6A6]"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-600 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}