import { Save, Building, Calendar, Clock, Bell, User, Shield } from 'lucide-react';

export default function Settings() {
  return (
    <div className="space-y-6">
      {/* Campus Settings */}
      <div className="bg-white rounded-2xl shadow-card-lg p-6 border border-light">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Building className="w-5 h-5 text-primary-blue" />
          </div>
          <div>
            <h3 className="text-lg text-dark font-semibold">Campus Settings</h3>
            <p className="text-sm text-body">Configure your institution details</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm text-dark mb-2 font-medium">Campus Name</label>
            <input
              type="text"
              defaultValue="Main Campus"
              className="w-full px-4 py-3 border border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent bg-white"
            />
          </div>

          <div>
            <label className="block text-sm text-dark mb-2 font-medium">Institution Name</label>
            <input
              type="text"
              defaultValue="University of Technology"
              className="w-full px-4 py-3 border border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent bg-white"
            />
          </div>

          <div>
            <label className="block text-sm text-dark mb-2 font-medium">Current Trimester</label>
            <select className="w-full px-4 py-3 border border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent bg-white text-body">
              <option>Trimester 1 2025</option>
              <option>Trimester 2 2025</option>
              <option>Trimester 3 2025</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-dark mb-2 font-medium">Academic Year</label>
            <input
              type="text"
              defaultValue="2024-2025"
              className="w-full px-4 py-3 border border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent bg-white"
            />
          </div>
        </div>
      </div>

      {/* Schedule Settings */}
      <div className="bg-white rounded-2xl shadow-card-lg p-6 border border-light">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-green-50 rounded-lg">
            <Calendar className="w-5 h-5 text-success" />
          </div>
          <div>
            <h3 className="text-lg text-dark font-semibold">Schedule Settings</h3>
            <p className="text-sm text-body">Configure class timing and schedule</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm text-dark mb-2 font-medium">Start Time</label>
            <input
              type="time"
              defaultValue="08:00"
              className="w-full px-4 py-3 border border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent bg-white"
            />
          </div>

          <div>
            <label className="block text-sm text-dark mb-2 font-medium">End Time</label>
            <input
              type="time"
              defaultValue="20:00"
              className="w-full px-4 py-3 border border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent bg-white"
            />
          </div>

          <div>
            <label className="block text-sm text-dark mb-2 font-medium">Time Slot Duration</label>
            <select className="w-full px-4 py-3 border border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent bg-white text-body">
              <option>30 minutes</option>
              <option>60 minutes</option>
              <option>90 minutes</option>
              <option>120 minutes</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-dark mb-2 font-medium">Working Days</label>
            <select className="w-full px-4 py-3 border border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent bg-white text-body">
              <option>Monday to Sunday</option>
              <option>Monday to Saturday</option>
              <option>Monday to Friday</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-white rounded-2xl shadow-card-lg p-6 border border-light">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-purple-50 rounded-lg">
            <Bell className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg text-dark font-semibold">Notification Settings</h3>
            <p className="text-sm text-body">Manage notification preferences</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-soft rounded-xl">
            <div>
              <p className="text-sm text-dark font-medium">Conflict Alerts</p>
              <p className="text-xs text-body">Get notified when scheduling conflicts occur</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-blue"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-soft rounded-xl">
            <div>
              <p className="text-sm text-dark font-medium">Class Reminders</p>
              <p className="text-xs text-body">Send reminders before classes start</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-blue"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-soft rounded-xl">
            <div>
              <p className="text-sm text-dark font-medium">Weekly Reports</p>
              <p className="text-xs text-body">Receive weekly summary reports via email</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-blue"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Admin User Settings */}
      <div className="bg-white rounded-2xl shadow-card-lg p-6 border border-light">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-orange-50 rounded-lg">
            <User className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <h3 className="text-lg text-dark font-semibold">Admin Profile</h3>
            <p className="text-sm text-body">Your account information</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm text-dark mb-2 font-medium">Full Name</label>
            <input
              type="text"
              defaultValue="Admin User"
              className="w-full px-4 py-3 border border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent bg-white"
            />
          </div>

          <div>
            <label className="block text-sm text-dark mb-2 font-medium">Email Address</label>
            <input
              type="email"
              defaultValue="admin@university.edu"
              className="w-full px-4 py-3 border border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent bg-white"
            />
          </div>

          <div>
            <label className="block text-sm text-dark mb-2 font-medium">Role</label>
            <input
              type="text"
              defaultValue="System Administrator"
              disabled
              className="w-full px-4 py-3 border border-light rounded-xl bg-gray-50 text-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm text-dark mb-2 font-medium">Last Login</label>
            <input
              type="text"
              defaultValue="Today, 09:30 AM"
              disabled
              className="w-full px-4 py-3 border border-light rounded-xl bg-gray-50 text-gray-500"
            />
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div className="bg-white rounded-2xl shadow-card-lg p-6 border border-light">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-red-50 rounded-lg">
            <Shield className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg text-dark font-semibold">Security Settings</h3>
            <p className="text-sm text-body">Manage password and security options</p>
          </div>
        </div>

        <div className="space-y-4">
          <button className="w-full md:w-auto px-6 py-3 bg-soft text-dark rounded-xl hover:bg-gray-200 transition-colors">
            Change Password
          </button>
          <button className="w-full md:w-auto px-6 py-3 bg-soft text-dark rounded-xl hover:bg-gray-200 transition-colors ml-0 md:ml-4">
            Enable Two-Factor Authentication
          </button>
        </div>
      </div>

      {/* User Access Settings */}
      <div className="bg-white rounded-2xl shadow-card-lg p-6 border border-light">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-indigo-50 rounded-lg">
            <Shield className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-lg text-dark font-semibold">User Access Settings</h3>
            <p className="text-sm text-body">Configure default user permissions and access controls</p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm text-dark mb-2 font-medium">Default Role for New Users</label>
            <select className="w-full md:w-1/2 px-4 py-3 border border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent bg-white text-body">
              <option value="Observer">Observer (Read-only)</option>
              <option value="Admin">Admin (Full access)</option>
            </select>
            <p className="text-xs text-body mt-2">New users will be assigned this role by default when created</p>
          </div>

          <div className="flex items-center justify-between p-4 bg-soft rounded-xl">
            <div>
              <p className="text-sm text-dark font-medium">Allow Observers to Export Data</p>
              <p className="text-xs text-body">Enable users with Observer role to export timetables and reports</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-blue"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-soft rounded-xl">
            <div>
              <p className="text-sm text-dark font-medium">Require Email Verification</p>
              <p className="text-xs text-body">New users must verify their email address before accessing the system</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-blue"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-soft rounded-xl">
            <div>
              <p className="text-sm text-dark font-medium">Session Timeout</p>
              <p className="text-xs text-body">Automatically log out inactive users after a period of time</p>
            </div>
            <select className="px-4 py-2 border border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue bg-white text-body">
              <option>30 minutes</option>
              <option>1 hour</option>
              <option>2 hours</option>
              <option>Never</option>
            </select>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button className="flex items-center gap-2 px-8 py-3 bg-primary-blue text-white rounded-xl hover:opacity-90 transition-all shadow-card-lg hover-lift">
          <Save className="w-5 h-5" />
          Save All Settings
        </button>
      </div>
    </div>
  );
}