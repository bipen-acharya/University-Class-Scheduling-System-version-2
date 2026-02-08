import { useEffect, useMemo, useState } from "react";
import { Save, Building, Calendar, Bell, User, Shield } from "lucide-react";
import api from "../../api/axios"; 

type WorkingDays = "mon_fri" | "mon_sat" | "mon_sun";

type CampusSetting = {
  id?: number;
  university_name: string | null;
  timezone: string;
  day_start_time: string; // "08:00"
  day_end_time: string;   // "20:00"
  slot_duration_minutes: number;
  slot_gap_minutes: number;
  working_days: WorkingDays;
  conflict_alerts: boolean;
  timesheet_reminders: boolean;
  class_updates: boolean;
  created_at?: string;
  updated_at?: string;
};

const DEFAULTS: CampusSetting = {
  university_name: null,
  timezone: "Australia/Sydney",
  day_start_time: "08:00",
  day_end_time: "20:00",
  slot_duration_minutes: 60,
  slot_gap_minutes: 0,
  working_days: "mon_fri",
  conflict_alerts: true,
  timesheet_reminders: true,
  class_updates: false,
};

function coerceApiData(data: any): any {
  // If backend sends: data: "{...}"
  if (typeof data === "string") {
    try {
      return JSON.parse(data);
    } catch {
      return data;
    }
  }
  return data;
}

export default function Settings() {
  const [form, setForm] = useState<CampusSetting>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  const workingDaysLabel = useMemo(() => {
    switch (form.working_days) {
      case "mon_sun":
        return "Monday to Sunday";
      case "mon_sat":
        return "Monday to Saturday";
      default:
        return "Monday to Friday";
    }
  }, [form.working_days]);

  async function loadSettings() {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/settings");
      const payload = coerceApiData(res.data?.data);
      setForm({
        ...DEFAULTS,
        ...payload,
        // ensure these stay correct types
        slot_duration_minutes: Number(payload?.slot_duration_minutes ?? DEFAULTS.slot_duration_minutes),
        slot_gap_minutes: Number(payload?.slot_gap_minutes ?? DEFAULTS.slot_gap_minutes),
        conflict_alerts: Boolean(payload?.conflict_alerts ?? DEFAULTS.conflict_alerts),
        timesheet_reminders: Boolean(payload?.timesheet_reminders ?? DEFAULTS.timesheet_reminders),
        class_updates: Boolean(payload?.class_updates ?? DEFAULTS.class_updates),
        working_days: (payload?.working_days ?? DEFAULTS.working_days) as WorkingDays,
      });
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Failed to load settings.");
    } finally {
      setLoading(false);
    }
  }

  async function saveSettings() {
    setSaving(true);
    setError(null);
    setSavedMsg(null);

    try {
      // Your backend expects these fields (based on controller + request):
      const payload = {
        university_name: form.university_name,
        timezone: form.timezone,
        day_start_time: form.day_start_time,
        day_end_time: form.day_end_time,
        slot_duration_minutes: form.slot_duration_minutes,
        slot_gap_minutes: form.slot_gap_minutes,
        working_days: form.working_days,
        conflict_alerts: form.conflict_alerts,
        timesheet_reminders: form.timesheet_reminders,
        class_updates: form.class_updates,
      };

      const res = await api.post("/settings", payload);
      const data = coerceApiData(res.data?.data);

      // Update form with what backend saved (single source of truth)
      setForm((prev) => ({ ...prev, ...data }));
      setSavedMsg("Settings saved successfully.");
      setTimeout(() => setSavedMsg(null), 2000);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    loadSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-card-lg p-6 border border-light">
        <div className="text-body">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top alerts */}
      {error && (
        <div className="p-4 rounded-xl border border-red-200 bg-red-50 text-red-700">
          {error}
        </div>
      )}
      {savedMsg && (
        <div className="p-4 rounded-xl border border-green-200 bg-green-50 text-green-700">
          {savedMsg}
        </div>
      )}

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
            <label className="block text-sm text-dark mb-2 font-medium">Institution Name</label>
            <input
              type="text"
              value={form.university_name ?? ""}
              onChange={(e) => setForm((p) => ({ ...p, university_name: e.target.value || null }))}
              className="w-full px-4 py-3 border border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent bg-white"
              placeholder="e.g., University of Technology"
            />
          </div>

          <div>
            <label className="block text-sm text-dark mb-2 font-medium">Timezone</label>
            <input
              type="text"
              value={form.timezone}
              onChange={(e) => setForm((p) => ({ ...p, timezone: e.target.value }))}
              className="w-full px-4 py-3 border border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent bg-white"
              placeholder="Australia/Sydney"
            />
            <p className="text-xs text-body mt-2">Use IANA format (e.g., Australia/Sydney)</p>
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
              value={form.day_start_time}
              onChange={(e) => setForm((p) => ({ ...p, day_start_time: e.target.value }))}
              className="w-full px-4 py-3 border border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent bg-white"
            />
          </div>

          <div>
            <label className="block text-sm text-dark mb-2 font-medium">End Time</label>
            <input
              type="time"
              value={form.day_end_time}
              onChange={(e) => setForm((p) => ({ ...p, day_end_time: e.target.value }))}
              className="w-full px-4 py-3 border border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent bg-white"
            />
          </div>

          <div>
            <label className="block text-sm text-dark mb-2 font-medium">Time Slot Duration</label>
            <select
              value={form.slot_duration_minutes}
              onChange={(e) =>
                setForm((p) => ({ ...p, slot_duration_minutes: Number(e.target.value) }))
              }
              className="w-full px-4 py-3 border border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent bg-white text-body"
            >
              <option value={30}>30 minutes</option>
              <option value={60}>60 minutes</option>
              <option value={90}>90 minutes</option>
              <option value={120}>120 minutes</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-dark mb-2 font-medium">Slot Gap (minutes)</label>
            <input
              type="number"
              min={0}
              value={form.slot_gap_minutes}
              onChange={(e) => setForm((p) => ({ ...p, slot_gap_minutes: Number(e.target.value) }))}
              className="w-full px-4 py-3 border border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent bg-white"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm text-dark mb-2 font-medium">Working Days</label>
            <select
              value={form.working_days}
              onChange={(e) => setForm((p) => ({ ...p, working_days: e.target.value as WorkingDays }))}
              className="w-full md:w-1/2 px-4 py-3 border border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent bg-white text-body"
            >
              <option value="mon_sun">Monday to Sunday</option>
              <option value="mon_sat">Monday to Saturday</option>
              <option value="mon_fri">Monday to Friday</option>
            </select>
            <p className="text-xs text-body mt-2">Currently selected: {workingDaysLabel}</p>
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
          {/* Conflict Alerts */}
          <div className="flex items-center justify-between p-4 bg-soft rounded-xl">
            <div>
              <p className="text-sm text-dark font-medium">Conflict Alerts</p>
              <p className="text-xs text-body">Get notified when scheduling conflicts occur</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={form.conflict_alerts}
                onChange={(e) => setForm((p) => ({ ...p, conflict_alerts: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-blue"></div>
            </label>
          </div>

          {/* Timesheet Reminders */}
          <div className="flex items-center justify-between p-4 bg-soft rounded-xl">
            <div>
              <p className="text-sm text-dark font-medium">Timesheet Reminders</p>
              <p className="text-xs text-body">Send reminders for timesheet actions</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={form.timesheet_reminders}
                onChange={(e) => setForm((p) => ({ ...p, timesheet_reminders: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-blue"></div>
            </label>
          </div>

          {/* Class Updates */}
          <div className="flex items-center justify-between p-4 bg-soft rounded-xl">
            <div>
              <p className="text-sm text-dark font-medium">Class Updates</p>
              <p className="text-xs text-body">Notify users when classes are updated</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={form.class_updates}
                onChange={(e) => setForm((p) => ({ ...p, class_updates: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-blue"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Admin Profile (UI-only for now) */}
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
              className="w-full px-4 py-3 border border-light rounded-xl bg-gray-50 text-gray-500"
              disabled
            />
          </div>

          <div>
            <label className="block text-sm text-dark mb-2 font-medium">Email Address</label>
            <input
              type="email"
              defaultValue="admin@university.edu"
              className="w-full px-4 py-3 border border-light rounded-xl bg-gray-50 text-gray-500"
              disabled
            />
          </div>
        </div>
      </div>

      {/* Security Settings (UI-only for now) */}
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

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={saveSettings}
          disabled={saving}
          className="flex items-center gap-2 px-8 py-3 bg-primary-blue text-white rounded-xl hover:opacity-90 transition-all shadow-card-lg hover-lift disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <Save className="w-5 h-5" />
          {saving ? "Saving..." : "Save All Settings"}
        </button>
      </div>
    </div>
  );
}
