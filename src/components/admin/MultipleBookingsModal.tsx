import { useEffect, useMemo, useState } from "react";
import { X, Plus, Trash2, CheckCircle, AlertCircle } from "lucide-react";

/** =========================
 * Types (match your new dynamic setup)
 * ========================= */
type BookingStatus = "pending" | "approved" | "rejected";
type EventType = "workshop" | "bootcamp" | "meeting" | "external" | "other";
type Notifications = "all-staff" | "selected-staff" | "none";

type RoomApi = {
  id: number;
  room_name: string;
  room_type: "lecture_hall" | "lab" | "seminar_room";
  capacity: number;
  department?: string | null;
};

type StaffApi = { id: number; name: string; email: string };

type BookingPayload = {
  event_name: string;
  event_type: EventType;
  room_id: number;
  booking_date: string; // YYYY-MM-DD
  start_time: string; // HH:mm
  end_time: string; // HH:mm
  organiser_name: string;
  organiser_email?: string;
  notifications: Notifications;
  description?: string;
  capacity_needed?: number;
  notes?: string;
  email_message?: string;
  equipment?: string[];
  staff_ids?: number[];
};

/** UI booking (editing case) */
interface RoomBookingUI {
  id: string;
  eventName: string;
  eventType: EventType;
  room: string; // room_name
  date: Date;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  organiser: string;
  organiserEmail?: string;
  department: string;
  status: BookingStatus;
  notifications: Notifications;
  selectedStaff?: string[];
  description?: string;
  capacityNeeded?: number;
  equipment?: string[];
  notes?: string;
  emailMessage?: string;
  staff?: StaffApi[];
  roomObj?: RoomApi | null;
}

interface BookingSession {
  id: string;
  room_id: number | "";
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  selectedSlot: string | null;
  notes: string;
  availabilityView: "slots" | "schedule";
}

interface MultipleBookingsModalProps {
  rooms: RoomApi[];
  booking: RoomBookingUI | null;
  errorMessage?: string;
  onClose: () => void;

  /** IMPORTANT:
   * parent will call API and return true/false.
   * - single mode: called once
   * - multiple mode: called N times (one per session)
   */
  onSave: (payload: BookingPayload) => Promise<boolean> | boolean;
}

const timeSlots = [
  { id: "morning-1", label: "Morning (8:00 - 10:00)", start: "08:00", end: "10:00", period: "morning" },
  { id: "morning-2", label: "Morning (10:00 - 12:00)", start: "10:00", end: "12:00", period: "morning" },
  { id: "midday-1", label: "Midday (12:00 - 14:00)", start: "12:00", end: "14:00", period: "midday" },
  { id: "afternoon-1", label: "Afternoon (14:00 - 16:00)", start: "14:00", end: "16:00", period: "afternoon" },
  { id: "afternoon-2", label: "Afternoon (16:00 - 18:00)", start: "16:00", end: "18:00", period: "afternoon" },
  { id: "evening-1", label: "Evening (18:00 - 20:00)", start: "18:00", end: "20:00", period: "evening" },
];

const equipmentOptions = ["Projector", "Audio", "Whiteboard", "Computers", "Video Conference", "Microphones"];

/** helpers */
function toDateInputValue(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function isValidTimeRange(start: string, end: string) {
  if (!start || !end) return false;
  return start < end;
}

export default function MultipleBookingsModal({ rooms, booking, errorMessage, onClose, onSave }: MultipleBookingsModalProps) {
  const [bookingMode, setBookingMode] = useState<"single" | "multiple">(booking ? "single" : "single");
  const [showSummary, setShowSummary] = useState(false);
  const [localError, setLocalError] = useState("");

  const [saving, setSaving] = useState(false);

  // Staff list (if you want to make it dynamic later, pass staffOptions prop)
  const staffOptions: StaffApi[] = useMemo(() => booking?.staff ?? [], [booking?.staff]);

  // Map UI booking -> room_id for edit
  const bookingRoomId = useMemo(() => {
    if (!booking) return "";
    // try from roomObj first
    if (booking.roomObj?.id) return booking.roomObj.id;
    // else match by room_name
    const match = rooms.find((r) => r.room_name === booking.room);
    return match?.id ?? "";
  }, [booking, rooms]);

  const [formData, setFormData] = useState(() => ({
    eventName: booking?.eventName || "",
    description: booking?.description || "",
    eventType: (booking?.eventType || "meeting") as EventType,
    department: booking?.department || "",
    organiser: booking?.organiser || "Current User",
    organiserEmail: booking?.organiserEmail || "",

    room_id: bookingRoomId,
    date: booking?.date ? toDateInputValue(new Date(booking.date)) : "",
    startTime: booking?.startTime || "",
    endTime: booking?.endTime || "",

    capacityNeeded: booking?.capacityNeeded || 0,
    equipment: booking?.equipment || [],

    notifyStaff: booking ? booking.notifications !== "none" : true,
    notifications: (booking?.notifications || "all-staff") as Notifications,
    staff_ids: (booking?.staff ?? []).map((s) => s.id),

    emailMessage: booking?.emailMessage || "",
    separateEmails: false,
  }));

  // keep room_id updated once rooms load
  useEffect(() => {
    if (booking && bookingRoomId && formData.room_id !== bookingRoomId) {
      setFormData((p) => ({ ...p, room_id: bookingRoomId }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingRoomId]);

  const [sessions, setSessions] = useState<BookingSession[]>([
    {
      id: "1",
      room_id: "",
      date: "",
      startTime: "",
      endTime: "",
      selectedSlot: null,
      notes: "",
      availabilityView: "slots",
    },
  ]);

  const [conflictingSessions, setConflictingSessions] = useState<string[]>([]);

  /** Conflict check: same room + same date + overlapping time */
  const checkConflicts = () => {
    const conflicts: string[] = [];
    for (let i = 0; i < sessions.length; i++) {
      for (let j = i + 1; j < sessions.length; j++) {
        const a = sessions[i];
        const b = sessions[j];

        if (!a.date || !b.date || !a.startTime || !a.endTime || !b.startTime || !b.endTime) continue;
        if (!a.room_id || !b.room_id) continue;

        if (a.date === b.date && a.room_id === b.room_id) {
          // overlap if startA < endB && endA > startB
          if (a.startTime < b.endTime && a.endTime > b.startTime) {
            conflicts.push(a.id, b.id);
          }
        }
      }
    }
    const uniq = [...new Set(conflicts)];
    setConflictingSessions(uniq);
    return uniq.length === 0;
  };

  const addSession = () => {
    setSessions((prev) => [
      ...prev,
      { id: Date.now().toString(), room_id: "", date: "", startTime: "", endTime: "", selectedSlot: null, notes: "", availabilityView: "slots" },
    ]);
  };

  const removeSession = (sessionId: string) => {
    setSessions((prev) => (prev.length > 1 ? prev.filter((s) => s.id !== sessionId) : prev));
    setConflictingSessions((prev) => prev.filter((id) => id !== sessionId));
  };

  const updateSession = (sessionId: string, updates: Partial<BookingSession>) => {
    setSessions((prev) => prev.map((s) => (s.id === sessionId ? { ...s, ...updates } : s)));
    setTimeout(() => checkConflicts(), 50);
  };

  const selectTimeSlot = (sessionId: string, slot: (typeof timeSlots)[number]) => {
    updateSession(sessionId, { selectedSlot: slot.id, startTime: slot.start, endTime: slot.end });
  };

  /** NOTE: your real availability should come from API later.
   * For now: always available.
   */
  const isSlotAvailable = () => true;

  const toggleEquipment = (item: string) => {
    setFormData((prev) => ({
      ...prev,
      equipment: prev.equipment.includes(item) ? prev.equipment.filter((e) => e !== item) : [...prev.equipment, item],
    }));
  };

  const validateSingle = () => {
    if (!formData.eventName.trim()) return "Event name is required.";
    if (!formData.department.trim()) return "Department is required.";
    if (!formData.room_id) return "Room is required.";
    if (!formData.date) return "Booking date is required.";
    if (!formData.startTime || !formData.endTime) return "Start and end time are required.";
    if (!isValidTimeRange(formData.startTime, formData.endTime)) return "End time must be after start time.";
    return "";
  };

  const validateSessions = () => {
    for (const s of sessions) {
      if (!s.room_id) return "All sessions must have a room.";
      if (!s.date) return "All sessions must have a date.";
      if (!s.startTime || !s.endTime) return "All sessions must have start and end time.";
      if (!isValidTimeRange(s.startTime, s.endTime)) return "A session has an invalid time range.";
    }
    if (!checkConflicts()) return "Some sessions overlap in the same room/date.";
    return "";
  };

  const buildPayload = (args: { room_id: number; booking_date: string; start_time: string; end_time: string; notes?: string }) => {
    const notifications: Notifications = formData.notifyStaff ? formData.notifications : "none";

    return {
      event_name: formData.eventName,
      event_type: formData.eventType,
      room_id: args.room_id,
      booking_date: args.booking_date,
      start_time: args.start_time,
      end_time: args.end_time,
      organiser_name: formData.organiser,
      organiser_email: formData.organiserEmail || undefined,
      notifications,
      description: formData.description || undefined,
      capacity_needed: formData.capacityNeeded || undefined,
      // notes: args.notes || formData.notes || undefined,
      email_message: formData.emailMessage || undefined,
      equipment: formData.equipment,
      staff_ids: notifications === "selected-staff" ? formData.staff_ids : formData.staff_ids, // keep same for now
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");

    if (bookingMode === "multiple") {
      const err = validateSessions();
      if (err) {
        setLocalError(err);
        return;
      }
      setShowSummary(true);
      return;
    }

    const err = validateSingle();
    if (err) {
      setLocalError(err);
      return;
    }

    setSaving(true);
    try {
      const payload = buildPayload({
        room_id: Number(formData.room_id),
        booking_date: formData.date,
        start_time: formData.startTime,
        end_time: formData.endTime,
      });

      const ok = await onSave(payload);
      if (!ok) return; // parent will show errorMessage; we keep modal open
    } finally {
      setSaving(false);
    }
  };

  const confirmMultipleBookings = async () => {
    setLocalError("");
    const err = validateSessions();
    if (err) {
      setLocalError(err);
      setShowSummary(false);
      return;
    }

    setSaving(true);
    try {
      // submit each session one by one
      for (const s of sessions) {
        const payload = buildPayload({
          room_id: Number(s.room_id),
          booking_date: s.date,
          start_time: s.startTime,
          end_time: s.endTime,
          notes: s.notes || undefined,
        });

        const ok = await onSave(payload);
        if (!ok) {
          // stop on first failure (overlap etc.)
          setShowSummary(false);
          return;
        }
      }
      // if all ok, modal will be closed by parent on success if you want.
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const getTotalHours = () => {
    return sessions.reduce((total, s) => {
      if (s.startTime && s.endTime) {
        const start = new Date(`2000-01-01 ${s.startTime}`);
        const end = new Date(`2000-01-01 ${s.endTime}`);
        const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        return total + (isFinite(hours) ? hours : 0);
      }
      return total;
    }, 0);
  };

  const getUniqueRooms = () => {
    return [...new Set(sessions.map((s) => s.room_id).filter(Boolean))];
  };

  const getDateRange = () => {
    const dates = sessions.map((s) => s.date).filter(Boolean).sort();
    if (dates.length === 0) return "N/A";
    if (dates.length === 1) return new Date(dates[0]).toLocaleDateString();
    return `${new Date(dates[0]).toLocaleDateString()} - ${new Date(dates[dates.length - 1]).toLocaleDateString()}`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-card-xl max-w-4xl w-full my-8 max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-light flex items-center justify-between flex-shrink-0">
          <h3 className="text-lg font-semibold text-dark">{booking ? "Edit Booking" : "New Room Booking"}</h3>
          <button onClick={onClose} className="p-2 hover:bg-soft rounded-lg transition-colors">
            <X className="w-5 h-5 text-body" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Backend error */}
            {(errorMessage || localError) && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-red-900 mb-1">Cannot save booking</h4>
                    <p className="text-sm text-red-800">{errorMessage || localError}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Booking mode (only for new) */}
            {!booking && (
              <div className="p-4 bg-soft rounded-xl border border-light">
                <label className="text-sm font-semibold text-dark mb-3 block">Booking Mode</label>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="bookingMode"
                      checked={bookingMode === "single"}
                      onChange={() => setBookingMode("single")}
                      className="w-4 h-4 text-primary-blue border-light focus:ring-2 focus:ring-primary-blue"
                    />
                    <span className="text-sm text-dark">Single Booking</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="bookingMode"
                      checked={bookingMode === "multiple"}
                      onChange={() => setBookingMode("multiple")}
                      className="w-4 h-4 text-primary-blue border-light focus:ring-2 focus:ring-primary-blue"
                    />
                    <span className="text-sm text-dark">Multiple Bookings</span>
                  </label>
                </div>
              </div>
            )}

            {/* Event details */}
            <EventDetailsSection formData={formData} setFormData={setFormData} />

            {/* Single or Multiple */}
            {bookingMode === "single" ? (
              <SingleBookingForm formData={formData} setFormData={setFormData} rooms={rooms} toggleEquipment={toggleEquipment} />
            ) : (
              <MultipleBookingsSessions
                rooms={rooms}
                sessions={sessions}
                updateSession={updateSession}
                removeSession={removeSession}
                addSession={addSession}
                selectTimeSlot={selectTimeSlot}
                isSlotAvailable={isSlotAvailable}
                conflictingSessions={conflictingSessions}
                formData={formData}
                toggleEquipment={toggleEquipment}
              />
            )}

            {/* Notifications */}
            <NotificationSettings formData={formData} setFormData={setFormData} bookingMode={bookingMode} staffOptions={staffOptions} />

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-light">
              <button type="button" onClick={onClose} className="px-5 py-2.5 text-body hover:bg-soft rounded-xl transition-colors">
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving || (bookingMode === "multiple" && conflictingSessions.length > 0)}
                className={`px-5 py-2.5 bg-primary-blue text-white rounded-xl hover:bg-blue-600 transition-colors ${
                  saving || (bookingMode === "multiple" && conflictingSessions.length > 0) ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {saving
                  ? "Saving..."
                  : bookingMode === "multiple"
                  ? `Submit Booking Request (${sessions.length} session${sessions.length > 1 ? "s" : ""})`
                  : booking
                  ? "Update Booking"
                  : "Submit Booking Request"}
              </button>
            </div>
          </form>
        </div>

        {/* Summary */}
        {showSummary && (
          <div className="absolute inset-0 bg-white rounded-2xl p-6 overflow-y-auto">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-dark mb-2">Booking Summary</h3>
              <p className="text-sm text-body">Review your booking details before submitting</p>
            </div>

            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-3 gap-4 p-4 bg-soft rounded-xl">
                <div>
                  <p className="text-xs text-body mb-1">Total Sessions</p>
                  <p className="text-2xl font-bold text-dark">{sessions.length}</p>
                </div>
                <div>
                  <p className="text-xs text-body mb-1">Total Hours</p>
                  <p className="text-2xl font-bold text-dark">{getTotalHours().toFixed(1)}</p>
                </div>
                <div>
                  <p className="text-xs text-body mb-1">Rooms Used</p>
                  <p className="text-2xl font-bold text-dark">{getUniqueRooms().length}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-dark mb-2">Event Name</p>
                <p className="text-sm text-body">{formData.eventName}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-dark mb-2">Date Range</p>
                <p className="text-sm text-body">{getDateRange()}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-dark mb-3">Sessions</p>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {sessions.map((s, idx) => {
                    const roomName = rooms.find((r) => r.id === s.room_id)?.room_name ?? "—";
                    return (
                      <div key={s.id} className="p-3 bg-soft rounded-lg border border-light">
                        <p className="text-sm font-medium text-dark">Session {idx + 1}</p>
                        <p className="text-xs text-body">
                          {roomName} • {s.date ? new Date(s.date).toLocaleDateString() : "—"} • {s.startTime} - {s.endTime}
                        </p>
                        {s.notes && <p className="text-xs text-body mt-1">Note: {s.notes}</p>}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-light">
              <button type="button" onClick={() => setShowSummary(false)} className="px-5 py-2.5 text-body hover:bg-soft rounded-xl transition-colors">
                Back to Edit
              </button>
              <button
                type="button"
                onClick={confirmMultipleBookings}
                disabled={saving}
                className={`px-5 py-2.5 bg-primary-blue text-white rounded-xl hover:bg-blue-600 transition-colors ${saving ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {saving ? "Saving..." : "Confirm & Submit"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/** =========================
 * Sub-components
 * ========================= */
function EventDetailsSection({ formData, setFormData }: any) {
  return (
    <div>
      <h4 className="text-sm font-semibold text-dark mb-4">Event Details</h4>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-dark mb-2 block">
            Event Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.eventName}
            onChange={(e) => setFormData({ ...formData, eventName: e.target.value })}
            placeholder="e.g., Web Development Bootcamp"
            className="w-full px-4 py-2.5 border border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-dark mb-2 block">Event Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe the event..."
            rows={3}
            className="w-full px-4 py-2.5 border border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-dark mb-2 block">
              Event Type <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={formData.eventType}
              onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
              className="w-full px-4 py-2.5 border border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue"
            >
              <option value="meeting">Meeting</option>
              <option value="workshop">Workshop</option>
              <option value="bootcamp">Bootcamp</option>
              <option value="external">External Event</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-dark mb-2 block">
              Organising Department <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              placeholder="e.g., Computer Science"
              className="w-full px-4 py-2.5 border border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-dark mb-2 block">Organiser Name</label>
            <input
              type="text"
              value={formData.organiser}
              onChange={(e) => setFormData({ ...formData, organiser: e.target.value })}
              className="w-full px-4 py-2.5 border border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue bg-soft"
              readOnly
            />
          </div>

          <div>
            <label className="text-sm font-medium text-dark mb-2 block">Organiser Email</label>
            <input
              type="email"
              value={formData.organiserEmail}
              onChange={(e) => setFormData({ ...formData, organiserEmail: e.target.value })}
              placeholder="e.g., sarah.johnson@university.edu"
              className="w-full px-4 py-2.5 border border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function SingleBookingForm({ formData, setFormData, rooms, toggleEquipment }: any) {
  const showAvailability = Boolean(formData.room_id && formData.date);

  const selectTimeSlotSingle = (slot: (typeof timeSlots)[number]) => {
    setFormData({ ...formData, startTime: slot.start, endTime: slot.end });
  };

  const roomObj = rooms.find((r: RoomApi) => r.id === Number(formData.room_id));

  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-semibold text-dark mb-4">Room & Schedule</h4>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-dark mb-2 block">
                Room <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.room_id}
                onChange={(e) => setFormData({ ...formData, room_id: e.target.value ? Number(e.target.value) : "" })}
                className="w-full px-4 py-2.5 border border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue"
              >
                <option value="">Select a room</option>
                {rooms.map((r: RoomApi) => (
                  <option key={r.id} value={r.id}>
                    {r.room_name} (Capacity: {r.capacity})
                  </option>
                ))}
              </select>

              {roomObj && formData.capacityNeeded > roomObj.capacity && (
                <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Capacity needed is greater than room capacity ({roomObj.capacity})
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-dark mb-2 block">Capacity Needed</label>
              <input
                type="number"
                value={formData.capacityNeeded}
                onChange={(e) => setFormData({ ...formData, capacityNeeded: Number(e.target.value) })}
                placeholder="Number of attendees"
                className="w-full px-4 py-2.5 border border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-dark mb-2 block">
              Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-4 py-2.5 border border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue"
            />
          </div>

          {/* Slots (static for now) */}
          {showAvailability && (
            <div>
              <label className="text-sm font-medium text-dark mb-3 block">Available Time Options</label>
              <div className="grid grid-cols-2 gap-3">
                {timeSlots.map((slot) => {
                  const isSelected = formData.startTime === slot.start && formData.endTime === slot.end;
                  return (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() => selectTimeSlotSingle(slot)}
                      className={`p-3 rounded-xl border-2 transition-all text-left ${
                        isSelected ? "border-primary-blue bg-blue-50" : "border-light hover:border-primary-blue bg-white"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-xs font-medium ${isSelected ? "text-primary-blue" : "text-dark"}`}>
                          {slot.start} - {slot.end}
                        </span>
                        {isSelected && <CheckCircle className="w-3 h-3 text-primary-blue" />}
                      </div>
                      <p className="text-xs text-body capitalize">{slot.period}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-dark mb-2 block">
                Start Time <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                required
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full px-4 py-2.5 border border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-dark mb-2 block">
                End Time <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                required
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full px-4 py-2.5 border border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-dark mb-3 block">Equipment Needed</label>
            <div className="grid grid-cols-3 gap-3">
              {equipmentOptions.map((item) => (
                <label key={item} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.equipment.includes(item)}
                    onChange={() => toggleEquipment(item)}
                    className="w-4 h-4 text-primary-blue border-light rounded focus:ring-2 focus:ring-primary-blue"
                  />
                  <span className="text-sm text-dark">{item}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MultipleBookingsSessions({
  rooms,
  sessions,
  updateSession,
  removeSession,
  addSession,
  selectTimeSlot,
  isSlotAvailable,
  conflictingSessions,
  formData,
  toggleEquipment,
}: any) {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-semibold text-dark">Booking Sessions</h4>
          <span className="text-xs text-body">
            {sessions.length} session{sessions.length > 1 ? "s" : ""}
          </span>
        </div>

        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
          {sessions.map((session: BookingSession, index: number) => (
            <SessionCard
              key={session.id}
              rooms={rooms}
              session={session}
              index={index}
              updateSession={updateSession}
              removeSession={removeSession}
              selectTimeSlot={selectTimeSlot}
              isSlotAvailable={isSlotAvailable}
              isConflicting={conflictingSessions.includes(session.id)}
              canRemove={sessions.length > 1}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={addSession}
          className="mt-4 w-full px-4 py-3 border-2 border-dashed border-light rounded-xl text-primary-blue hover:border-primary-blue hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Another Session
        </button>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-dark mb-3">Equipment Needed (All Sessions)</h4>
        <div className="grid grid-cols-3 gap-3">
          {equipmentOptions.map((item) => (
            <label key={item} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.equipment.includes(item)}
                onChange={() => toggleEquipment(item)}
                className="w-4 h-4 text-primary-blue border-light rounded focus:ring-2 focus:ring-primary-blue"
              />
              <span className="text-sm text-dark">{item}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

function SessionCard({
  rooms,
  session,
  index,
  updateSession,
  removeSession,
  selectTimeSlot,
  isSlotAvailable,
  isConflicting,
  canRemove,
}: any) {
  const showAvailability = Boolean(session.room_id && session.date);

  return (
    <div className={`p-4 rounded-xl border-2 ${isConflicting ? "border-red-300 bg-red-50" : "border-light bg-white"}`}>
      <div className="flex items-center justify-between mb-4">
        <h5 className="text-sm font-semibold text-dark">Session {index + 1}</h5>

        {canRemove && (
          <button
            type="button"
            onClick={() => removeSession(session.id)}
            className="p-1.5 hover:bg-red-50 rounded-lg transition-colors text-red-600"
            title="Remove Session"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {isConflicting && (
        <div className="mb-3 p-2 bg-red-100 border border-red-200 rounded-lg">
          <p className="text-xs text-red-700 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            This session conflicts with another session (same room + date + time overlap).
          </p>
        </div>
      )}

      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-dark mb-1.5 block">
              Room <span className="text-red-500">*</span>
            </label>
            <select
              value={session.room_id}
              onChange={(e) => updateSession(session.id, { room_id: e.target.value ? Number(e.target.value) : "" })}
              className="w-full px-3 py-2 border border-light rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue"
            >
              <option value="">Select room</option>
              {rooms.map((r: RoomApi) => (
                <option key={r.id} value={r.id}>
                  {r.room_name} (cap: {r.capacity})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-dark mb-1.5 block">
              Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={session.date}
              onChange={(e) => updateSession(session.id, { date: e.target.value })}
              className="w-full px-3 py-2 border border-light rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue"
            />
          </div>
        </div>

        {showAvailability && (
          <div>
            <label className="text-xs font-medium text-dark mb-2 block">Available Time Options</label>
            <div className="grid grid-cols-2 gap-2">
              {timeSlots.map((slot) => {
                const available = isSlotAvailable(slot, session.date);
                const isSelected = session.selectedSlot === slot.id;

                return (
                  <button
                    key={slot.id}
                    type="button"
                    disabled={!available}
                    onClick={() => selectTimeSlot(session.id, slot)}
                    className={`p-2 rounded-lg border text-left transition-all ${
                      isSelected
                        ? "border-primary-blue bg-blue-50"
                        : available
                        ? "border-light hover:border-primary-blue bg-white"
                        : "border-light bg-gray-50 cursor-not-allowed opacity-50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <span className={`text-xs font-medium ${isSelected ? "text-primary-blue" : available ? "text-dark" : "text-body"}`}>
                        {slot.start} - {slot.end}
                      </span>
                      {available && isSelected && <CheckCircle className="w-3 h-3 text-primary-blue" />}
                    </div>
                    <p className="text-xs text-body capitalize">{slot.period}</p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-dark mb-1.5 block">
              Start Time <span className="text-red-500">*</span>
            </label>
            <input
              type="time"
              value={session.startTime}
              onChange={(e) => updateSession(session.id, { startTime: e.target.value })}
              className="w-full px-3 py-2 border border-light rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-dark mb-1.5 block">
              End Time <span className="text-red-500">*</span>
            </label>
            <input
              type="time"
              value={session.endTime}
              onChange={(e) => updateSession(session.id, { endTime: e.target.value })}
              className="w-full px-3 py-2 border border-light rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-dark mb-1.5 block">Notes (Optional)</label>
          <input
            type="text"
            value={session.notes}
            onChange={(e) => updateSession(session.id, { notes: e.target.value })}
            placeholder="Add any notes for this session..."
            className="w-full px-3 py-2 border border-light rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue"
          />
        </div>
      </div>
    </div>
  );
}

function NotificationSettings({ formData, setFormData, bookingMode, staffOptions }: any) {
  return (
    <div>
      <h4 className="text-sm font-semibold text-dark mb-4">
        Notification Settings
        {bookingMode === "multiple" && <span className="text-xs font-normal text-body ml-2">(Applies to all sessions)</span>}
      </h4>

      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="notifyStaff"
            checked={formData.notifyStaff}
            onChange={(e) =>
              setFormData({
                ...formData,
                notifyStaff: e.target.checked,
                notifications: e.target.checked ? "all-staff" : "none",
              })
            }
            className="w-5 h-5 text-primary-blue border-light rounded focus:ring-2 focus:ring-primary-blue"
          />
          <label htmlFor="notifyStaff" className="text-sm font-medium text-dark cursor-pointer">
            Send notification emails to staff
          </label>
        </div>

        {formData.notifyStaff && (
          <>
            <div>
              <label className="text-sm font-medium text-dark mb-2 block">Notification Type</label>
              <select
                value={formData.notifications}
                onChange={(e) => setFormData({ ...formData, notifications: e.target.value })}
                className="w-full px-4 py-2.5 border border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue"
              >
                <option value="all-staff">All Staff</option>
                <option value="selected-staff">Selected Staff Only</option>
              </select>
            </div>

            {formData.notifications === "selected-staff" && (
              <div>
                <label className="text-sm font-medium text-dark mb-2 block">Select Staff Members</label>

                <div className="p-4 border border-light rounded-xl bg-soft">
                  {staffOptions.length === 0 ? (
                    <p className="text-xs text-body">No staff list provided yet. Pass staffOptions from parent to make it dynamic.</p>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      {staffOptions.map((u: StaffApi) => {
                        const checked = formData.staff_ids.includes(u.id);
                        return (
                          <label key={u.id} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() =>
                                setFormData((prev: any) => ({
                                  ...prev,
                                  staff_ids: checked ? prev.staff_ids.filter((id: number) => id !== u.id) : [...prev.staff_ids, u.id],
                                }))
                              }
                              className="w-4 h-4 text-primary-blue border-light rounded focus:ring-2 focus:ring-primary-blue"
                            />
                            <span className="text-sm text-dark">{u.name}</span>
                            <span className="text-xs text-body truncate">({u.email})</span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {bookingMode === "multiple" && (
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="separateEmails"
                  checked={formData.separateEmails}
                  onChange={(e) => setFormData({ ...formData, separateEmails: e.target.checked })}
                  className="w-4 h-4 text-primary-blue border-light rounded focus:ring-2 focus:ring-primary-blue"
                />
                <label htmlFor="separateEmails" className="text-sm text-dark cursor-pointer">
                  Send separate email per session
                </label>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-dark mb-2 block">Custom Email Message (Optional)</label>
              <textarea
                value={formData.emailMessage}
                onChange={(e) => setFormData({ ...formData, emailMessage: e.target.value })}
                placeholder="Add a custom message to the notification email..."
                rows={3}
                className="w-full px-4 py-2.5 border border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue resize-none"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
