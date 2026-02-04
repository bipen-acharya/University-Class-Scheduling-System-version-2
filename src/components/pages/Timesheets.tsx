import { useState } from "react";
import { CheckCircle, XCircle, Clock, Eye } from "lucide-react";
import { Button } from "../ui/button";
import { mockTeachers, mockClasses } from "../../lib/mockData";

interface TimesheetsProps {
  onNavigate: (page: string, data?: any) => void;
}

export function Timesheets({ onNavigate }: TimesheetsProps) {
  const [timesheets] = useState(
    mockTeachers.map(teacher => {
      const classes = mockClasses.filter(c => c.teacherId === teacher.id);
      const scheduledHours = classes.reduce((acc, cls) => {
        const start = parseInt(cls.startTime.split(":")[0]);
        const end = parseInt(cls.endTime.split(":")[0]);
        return acc + (end - start);
      }, 0);
      
      return {
        teacherId: teacher.id,
        teacherName: teacher.name,
        department: teacher.department,
        scheduledHours,
        deliveredHours: scheduledHours - Math.floor(Math.random() * 3), // Mock delivered hours
        status: Math.random() > 0.3 ? "Approved" : Math.random() > 0.5 ? "Pending" : "Rejected",
      };
    })
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved": return "bg-green-100 text-green-700";
      case "Pending": return "bg-yellow-100 text-yellow-700";
      case "Rejected": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Approved": return CheckCircle;
      case "Rejected": return XCircle;
      default: return Clock;
    }
  };

  return (
    <div className="p-8 bg-[#F5F7FA] min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-gray-900">Timesheet Verification</h1>
          <p className="text-gray-600 mt-1">Review and approve teacher timesheets</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Teachers</p>
                <p className="text-gray-900 mt-2">{timesheets.length}</p>
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
                <p className="text-gray-600 text-sm">Approved</p>
                <p className="text-gray-900 mt-2">
                  {timesheets.filter(t => t.status === "Approved").length}
                </p>
                <p className="text-gray-500 text-sm mt-1">Timesheets</p>
              </div>
              <div className="w-12 h-12 bg-green-50 text-green-600 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-600 text-sm">Pending Review</p>
                <p className="text-gray-900 mt-2">
                  {timesheets.filter(t => t.status === "Pending").length}
                </p>
                <p className="text-gray-500 text-sm mt-1">Needs action</p>
              </div>
              <div className="w-12 h-12 bg-yellow-50 text-yellow-600 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Timesheet Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-gray-700">Teacher</th>
                  <th className="px-6 py-4 text-left text-gray-700">Department</th>
                  <th className="px-6 py-4 text-left text-gray-700">Scheduled Hours</th>
                  <th className="px-6 py-4 text-left text-gray-700">Delivered Hours</th>
                  <th className="px-6 py-4 text-left text-gray-700">Variance</th>
                  <th className="px-6 py-4 text-left text-gray-700">Status</th>
                  <th className="px-6 py-4 text-left text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {timesheets.map((timesheet) => {
                  const StatusIcon = getStatusIcon(timesheet.status);
                  const variance = timesheet.scheduledHours - timesheet.deliveredHours;
                  
                  return (
                    <tr key={timesheet.teacherId} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-[#002A4A] rounded-full flex items-center justify-center text-white text-sm">
                            {timesheet.teacherName.split(" ").map(n => n[0]).join("")}
                          </div>
                          <span className="text-gray-900">{timesheet.teacherName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{timesheet.department}</td>
                      <td className="px-6 py-4 text-gray-600">{timesheet.scheduledHours}h</td>
                      <td className="px-6 py-4 text-gray-600">{timesheet.deliveredHours}h</td>
                      <td className="px-6 py-4">
                        <span className={`text-sm ${
                          variance === 0 ? "text-gray-600" :
                          variance > 0 ? "text-red-600" : "text-green-600"
                        }`}>
                          {variance === 0 ? "On track" : 
                           variance > 0 ? `-${variance}h` : `+${Math.abs(variance)}h`}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${getStatusColor(timesheet.status)}`}>
                          <StatusIcon className="w-4 h-4" />
                          {timesheet.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onNavigate("timesheet-detail", { timesheet })}
                          className="text-[#0AA6A6] hover:text-[#0B9696]"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
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
