import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import { mockClasses } from "../../lib/mockData";

interface ClassListProps {
  onNavigate: (page: string, data?: any) => void;
}

export function ClassList({ onNavigate }: ClassListProps) {
  const [classes] = useState(mockClasses);

  const getClassTypeColor = (type: string) => {
    switch (type) {
      case "Lecture": return "bg-blue-100 text-blue-700";
      case "Tutorial": return "bg-purple-100 text-purple-700";
      case "Workshop": return "bg-green-100 text-green-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="p-8 bg-[#F5F7FA] min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-gray-900">Class Management</h1>
            <p className="text-gray-600 mt-1">Manage all scheduled classes and sessions</p>
          </div>
          <Button 
            className="bg-[#0AA6A6] hover:bg-[#0B9696] text-white"
            onClick={() => onNavigate("class-form", { mode: "add" })}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Class
          </Button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-gray-700">Subject Code</th>
                  <th className="px-6 py-4 text-left text-gray-700">Subject Name</th>
                  <th className="px-6 py-4 text-left text-gray-700">Teacher</th>
                  <th className="px-6 py-4 text-left text-gray-700">Room</th>
                  <th className="px-6 py-4 text-left text-gray-700">Class Type</th>
                  <th className="px-6 py-4 text-left text-gray-700">Day</th>
                  <th className="px-6 py-4 text-left text-gray-700">Time</th>
                  <th className="px-6 py-4 text-left text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {classes.map((cls) => (
                  <tr key={cls.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-gray-900">{cls.subjectCode}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{cls.subjectName}</td>
                    <td className="px-6 py-4 text-gray-600">{cls.teacherName}</td>
                    <td className="px-6 py-4 text-gray-600">{cls.room}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${getClassTypeColor(cls.classType)}`}>
                        {cls.classType}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{cls.day}</td>
                    <td className="px-6 py-4 text-gray-600">
                      {cls.startTime} - {cls.endTime}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onNavigate("class-form", { mode: "edit", class: cls })}
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
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
