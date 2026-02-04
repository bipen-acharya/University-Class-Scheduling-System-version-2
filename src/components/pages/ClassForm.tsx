import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { mockTeachers } from "../../lib/mockData";

interface ClassFormProps {
  mode: "add" | "edit";
  class?: any;
  onNavigate: (page: string) => void;
}

export function ClassForm({ mode, class: classData, onNavigate }: ClassFormProps) {
  const [formData, setFormData] = useState({
    subjectCode: classData?.subjectCode || "",
    subjectName: classData?.subjectName || "",
    teacherId: classData?.teacherId || "",
    room: classData?.room || "",
    classType: classData?.classType || "",
    day: classData?.day || "",
    startTime: classData?.startTime || "",
    endTime: classData?.endTime || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    onNavigate("classes");
  };

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const classTypes = ["Lecture", "Tutorial", "Workshop"];
  
  const timeOptions = [];
  for (let hour = 8; hour <= 20; hour++) {
    timeOptions.push(`${hour.toString().padStart(2, "0")}:00`);
    if (hour < 20) timeOptions.push(`${hour.toString().padStart(2, "0")}:30`);
  }

  return (
    <div className="p-8 bg-[#F5F7FA] min-h-screen">
      <div className="max-w-3xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => onNavigate("classes")}
          className="mb-6 text-gray-600 hover:text-[#002A4A]"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Classes
        </Button>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <h1 className="text-gray-900 mb-6">
            {mode === "add" ? "Add New Class" : "Edit Class"}
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Subject Code */}
            <div>
              <Label htmlFor="subjectCode">Subject Code *</Label>
              <Input
                id="subjectCode"
                type="text"
                value={formData.subjectCode}
                onChange={(e) => setFormData({ ...formData, subjectCode: e.target.value })}
                placeholder="e.g., CS101"
                required
                className="mt-2"
              />
            </div>

            {/* Subject Name */}
            <div>
              <Label htmlFor="subjectName">Subject Name *</Label>
              <Input
                id="subjectName"
                type="text"
                value={formData.subjectName}
                onChange={(e) => setFormData({ ...formData, subjectName: e.target.value })}
                placeholder="e.g., Introduction to Programming"
                required
                className="mt-2"
              />
            </div>

            {/* Teacher Dropdown */}
            <div>
              <Label htmlFor="teacher">Teacher *</Label>
              <Select
                value={formData.teacherId}
                onValueChange={(value) => setFormData({ ...formData, teacherId: value })}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select a teacher" />
                </SelectTrigger>
                <SelectContent>
                  {mockTeachers.map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id}>
                      {teacher.name} - {teacher.department}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Class Type */}
            <div>
              <Label htmlFor="classType">Class Type *</Label>
              <Select
                value={formData.classType}
                onValueChange={(value) => setFormData({ ...formData, classType: value })}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select class type" />
                </SelectTrigger>
                <SelectContent>
                  {classTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Room */}
            <div>
              <Label htmlFor="room">Room *</Label>
              <Input
                id="room"
                type="text"
                value={formData.room}
                onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                placeholder="e.g., A101"
                required
                className="mt-2"
              />
            </div>

            {/* Day of Week */}
            <div>
              <Label htmlFor="day">Day of Week *</Label>
              <Select
                value={formData.day}
                onValueChange={(value) => setFormData({ ...formData, day: value })}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select day" />
                </SelectTrigger>
                <SelectContent>
                  {days.map((day) => (
                    <SelectItem key={day} value={day}>
                      {day}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Time Selectors */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startTime">Start Time *</Label>
                <Select
                  value={formData.startTime}
                  onValueChange={(value) => setFormData({ ...formData, startTime: value })}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Start time" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeOptions.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="endTime">End Time *</Label>
                <Select
                  value={formData.endTime}
                  onValueChange={(value) => setFormData({ ...formData, endTime: value })}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="End time" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeOptions.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                className="bg-[#0AA6A6] hover:bg-[#0B9696] text-white flex-1"
              >
                {mode === "add" ? "Add Class" : "Save Changes"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => onNavigate("classes")}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
