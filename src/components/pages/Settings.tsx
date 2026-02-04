import { Save } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

export function Settings() {
  return (
    <div className="p-8 bg-[#F5F7FA] min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Manage system preferences and configuration</p>
        </div>

        <div className="space-y-6">
          {/* General Settings */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-gray-900 mb-4">General Settings</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="universityName">University Name</Label>
                <Input
                  id="universityName"
                  defaultValue="Example University"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="academicYear">Academic Year</Label>
                <Input
                  id="academicYear"
                  defaultValue="2025-2026"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="semester">Current Semester</Label>
                <Input
                  id="semester"
                  defaultValue="Fall 2025"
                  className="mt-2"
                />
              </div>
            </div>
          </div>

          {/* Timetable Settings */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-gray-900 mb-4">Timetable Settings</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input
                    id="startTime"
                    type="time"
                    defaultValue="08:00"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="endTime">End Time</Label>
                  <Input
                    id="endTime"
                    type="time"
                    defaultValue="20:00"
                    className="mt-2"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="slotDuration">Default Slot Duration (hours)</Label>
                <Input
                  id="slotDuration"
                  type="number"
                  defaultValue="1"
                  min="0.5"
                  step="0.5"
                  className="mt-2"
                />
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-gray-900 mb-4">Notifications</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-900">Conflict Alerts</p>
                  <p className="text-gray-600 text-sm">Get notified when conflicts are detected</p>
                </div>
                <input type="checkbox" defaultChecked className="w-5 h-5" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-900">Timesheet Reminders</p>
                  <p className="text-gray-600 text-sm">Remind teachers to submit timesheets</p>
                </div>
                <input type="checkbox" defaultChecked className="w-5 h-5" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-900">Class Updates</p>
                  <p className="text-gray-600 text-sm">Notify on class changes or cancellations</p>
                </div>
                <input type="checkbox" className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button className="bg-[#0AA6A6] hover:bg-[#0B9696] text-white">
              <Save className="w-4 h-4 mr-2" />
              Save Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
