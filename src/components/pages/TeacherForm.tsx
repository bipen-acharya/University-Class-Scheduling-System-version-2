import { useState } from "react";
import { ArrowLeft, Upload } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Switch } from "../ui/switch";
import { Textarea } from "../ui/textarea";

interface TeacherFormProps {
  mode: "add" | "edit";
  teacher?: any;
  onNavigate: (page: string) => void;
}

export function TeacherForm({ mode, teacher, onNavigate }: TeacherFormProps) {
  const [formData, setFormData] = useState({
    name: teacher?.name || "",
    email: teacher?.email || "",
    universityEmail: teacher?.universityEmail || "",
    personalEmail: teacher?.personalEmail || "",
    phone: teacher?.phone || "",
    department: teacher?.department || "",
    employeeId: teacher?.employeeId || "",
    status: teacher?.status || "active",
    areaOfExpertise: teacher?.areaOfExpertise || [],
    industryField: teacher?.industryField || "",
    researchInterests: teacher?.researchInterests || "",
    workingInIndustry: teacher?.workingInIndustry || false,
  });

  const [newExpertise, setNewExpertise] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    onNavigate("teachers");
  };

  const addExpertise = () => {
    if (newExpertise.trim() && !formData.areaOfExpertise.includes(newExpertise.trim())) {
      setFormData({
        ...formData,
        areaOfExpertise: [...formData.areaOfExpertise, newExpertise.trim()],
      });
      setNewExpertise("");
    }
  };

  const removeExpertise = (exp: string) => {
    setFormData({
      ...formData,
      areaOfExpertise: formData.areaOfExpertise.filter((e: string) => e !== exp),
    });
  };

  return (
    <div className="p-8 bg-[#F5F7FA] min-h-screen">
      <div className="max-w-3xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => onNavigate("teachers")}
          className="mb-6 text-gray-600 hover:text-[#002A4A]"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Teachers
        </Button>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <h1 className="text-gray-900 mb-6">
            {mode === "add" ? "Add New Teacher" : "Edit Teacher"}
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Photo Upload */}
            <div>
              <Label>Teacher Photo (Optional)</Label>
              <div className="mt-2 flex items-center gap-4">
                <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Upload className="w-8 h-8 text-gray-400" />
                </div>
                <Button type="button" variant="outline" className="border-[#002A4A] text-[#002A4A]">
                  Upload Photo
                </Button>
              </div>
            </div>

            {/* Status Toggle */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="status-toggle">Active This Trimester</Label>
                  <p className="text-sm text-gray-500 mt-1">
                    Is this teacher currently teaching this trimester?
                  </p>
                </div>
                <Switch
                  id="status-toggle"
                  checked={formData.status === "active"}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, status: checked ? "active" : "inactive" })
                  }
                />
              </div>
            </div>

            {/* Full Name */}
            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter teacher's full name"
                required
                className="mt-2"
              />
            </div>

            {/* Email Addresses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="universityEmail">University Email *</Label>
                <Input
                  id="universityEmail"
                  type="email"
                  value={formData.universityEmail}
                  onChange={(e) => setFormData({ ...formData, universityEmail: e.target.value })}
                  placeholder="teacher@university.edu"
                  required
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="personalEmail">Personal Email</Label>
                <Input
                  id="personalEmail"
                  type="email"
                  value={formData.personalEmail}
                  onChange={(e) => setFormData({ ...formData, personalEmail: e.target.value })}
                  placeholder="personal@email.com"
                  className="mt-2"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 234 567 8900"
                required
                className="mt-2"
              />
            </div>

            {/* Department */}
            <div>
              <Label htmlFor="department">Department *</Label>
              <Input
                id="department"
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                placeholder="e.g., Computer Science"
                required
                className="mt-2"
              />
            </div>

            {/* Employee ID */}
            <div>
              <Label htmlFor="employeeId">Employee ID *</Label>
              <Input
                id="employeeId"
                type="text"
                value={formData.employeeId}
                onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                placeholder="e.g., EMP001"
                required
                className="mt-2"
              />
            </div>

            {/* Industry Field */}
            <div>
              <Label htmlFor="industryField">Industry Field *</Label>
              <Select
                value={formData.industryField}
                onValueChange={(value) => setFormData({ ...formData, industryField: value })}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select industry field" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="IT Industry">IT Industry</SelectItem>
                  <SelectItem value="Healthcare">Healthcare</SelectItem>
                  <SelectItem value="Finance">Finance</SelectItem>
                  <SelectItem value="Education">Education</SelectItem>
                  <SelectItem value="Engineering">Engineering</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Working in Industry Toggle */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <Label htmlFor="industry-toggle">Currently Working in Industry</Label>
                <p className="text-sm text-gray-500 mt-1">
                  Is this teacher actively working in the industry?
                </p>
              </div>
              <Switch
                id="industry-toggle"
                checked={formData.workingInIndustry}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, workingInIndustry: checked })
                }
              />
            </div>

            {/* Area of Expertise */}
            <div>
              <Label>Area of Expertise *</Label>
              <div className="mt-2 flex gap-2">
                <Input
                  type="text"
                  value={newExpertise}
                  onChange={(e) => setNewExpertise(e.target.value)}
                  placeholder="e.g., Cyber Security, AI, Networking"
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addExpertise())}
                />
                <Button type="button" onClick={addExpertise} variant="outline">
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {formData.areaOfExpertise.map((exp: string, idx: number) => (
                  <span
                    key={idx}
                    className="px-3 py-2 bg-blue-50 text-blue-700 rounded-lg border border-blue-200 flex items-center gap-2"
                  >
                    {exp}
                    <button
                      type="button"
                      onClick={() => removeExpertise(exp)}
                      className="text-blue-700 hover:text-blue-900"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Research Interests */}
            <div>
              <Label htmlFor="researchInterests">Research Interests</Label>
              <Textarea
                id="researchInterests"
                value={formData.researchInterests}
                onChange={(e) => setFormData({ ...formData, researchInterests: e.target.value })}
                placeholder="Describe areas of research interest..."
                className="mt-2"
                rows={4}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                className="bg-[#0AA6A6] hover:bg-[#0B9696] text-white flex-1"
              >
                {mode === "add" ? "Add Teacher" : "Save Changes"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => onNavigate("teachers")}
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