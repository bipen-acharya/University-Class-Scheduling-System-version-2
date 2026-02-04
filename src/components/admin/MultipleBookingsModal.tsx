import { useState } from 'react';
import { X, Plus, Trash2, CheckCircle, AlertCircle, Clock, Building2 } from 'lucide-react';

interface RoomBooking {
  id: string;
  eventName: string;
  eventType: 'workshop' | 'bootcamp' | 'meeting' | 'external' | 'other';
  room: string;
  date: Date;
  startTime: string;
  endTime: string;
  organiser: string;
  department: string;
  status: 'pending' | 'approved' | 'rejected';
  notifications: 'all-staff' | 'selected-staff' | 'none';
  selectedStaff?: string[];
  description?: string;
  capacityNeeded?: number;
  equipment?: string[];
  notes?: string;
  emailMessage?: string;
}

interface BookingSession {
  id: string;
  room: string;
  date: string;
  startTime: string;
  endTime: string;
  selectedSlot: string | null;
  notes: string;
  availabilityView: 'slots' | 'schedule';
}

interface MultipleBookingsModalProps {
  booking: RoomBooking | null;
  onClose: () => void;
  onSave: (booking: RoomBooking) => void;
}

const timeSlots = [
  { id: 'morning-1', label: 'Morning (8:00 - 10:00)', start: '08:00', end: '10:00', period: 'morning' },
  { id: 'morning-2', label: 'Morning (10:00 - 12:00)', start: '10:00', end: '12:00', period: 'morning' },
  { id: 'midday-1', label: 'Midday (12:00 - 14:00)', start: '12:00', end: '14:00', period: 'midday' },
  { id: 'afternoon-1', label: 'Afternoon (14:00 - 16:00)', start: '14:00', end: '16:00', period: 'afternoon' },
  { id: 'afternoon-2', label: 'Afternoon (16:00 - 18:00)', start: '16:00', end: '18:00', period: 'afternoon' },
  { id: 'evening-1', label: 'Evening (18:00 - 20:00)', start: '18:00', end: '20:00', period: 'evening' },
];

const equipmentOptions = ['Projector', 'Audio', 'Whiteboard', 'Computers', 'Video Conference', 'Microphones'];

const rooms = [
  { id: 'r1', name: 'Room 1.1', capacity: 35 },
  { id: 'r2', name: 'Room 1.2', capacity: 25 },
  { id: 'r3', name: 'Room 2.1', capacity: 30 },
  { id: 'r4', name: 'Room 2.2', capacity: 28 },
  { id: 'r5', name: 'Room 3.1', capacity: 40 },
  { id: 'r6', name: 'Room 11.1', capacity: 50 },
  { id: 'r7', name: 'Lecture Hall A', capacity: 100 },
  { id: 'r8', name: 'Lecture Hall B', capacity: 80 },
];

export default function MultipleBookingsModal({ booking, onClose, onSave }: MultipleBookingsModalProps) {
  const [bookingMode, setBookingMode] = useState<'single' | 'multiple'>('single');
  const [showSummary, setShowSummary] = useState(false);
  
  const [formData, setFormData] = useState({
    eventName: booking?.eventName || '',
    description: booking?.description || '',
    eventType: booking?.eventType || 'meeting',
    department: booking?.department || '',
    organiser: booking?.organiser || 'Current User',
    room: booking?.room || '',
    date: booking?.date ? new Date(booking.date).toISOString().split('T')[0] : '',
    startTime: booking?.startTime || '',
    endTime: booking?.endTime || '',
    capacityNeeded: booking?.capacityNeeded || 0,
    equipment: booking?.equipment || [],
    notifyStaff: booking?.notifications !== 'none',
    notifications: booking?.notifications || 'none',
    selectedStaff: booking?.selectedStaff || [],
    emailMessage: booking?.emailMessage || '',
    separateEmails: false,
  });

  const [sessions, setSessions] = useState<BookingSession[]>([
    {
      id: '1',
      room: '',
      date: '',
      startTime: '',
      endTime: '',
      selectedSlot: null,
      notes: '',
      availabilityView: 'slots',
    }
  ]);

  const [showConflictWarning, setShowConflictWarning] = useState(false);
  const [conflictingSessions, setConflictingSessions] = useState<string[]>([]);

  // Check for conflicts across sessions
  const checkConflicts = () => {
    const conflicts: string[] = [];
    for (let i = 0; i < sessions.length; i++) {
      for (let j = i + 1; j < sessions.length; j++) {
        const session1 = sessions[i];
        const session2 = sessions[j];
        
        if (session1.date === session2.date && session1.startTime && session2.startTime) {
          const start1 = new Date(`${session1.date} ${session1.startTime}`);
          const end1 = new Date(`${session1.date} ${session1.endTime}`);
          const start2 = new Date(`${session2.date} ${session2.startTime}`);
          const end2 = new Date(`${session2.date} ${session2.endTime}`);
          
          if ((start1 < end2 && end1 > start2)) {
            conflicts.push(session1.id, session2.id);
          }
        }
      }
    }
    setConflictingSessions([...new Set(conflicts)]);
    return conflicts.length === 0;
  };

  const addSession = () => {
    setSessions([...sessions, {
      id: Date.now().toString(),
      room: '',
      date: '',
      startTime: '',
      endTime: '',
      selectedSlot: null,
      notes: '',
      availabilityView: 'slots',
    }]);
  };

  const removeSession = (sessionId: string) => {
    if (sessions.length > 1) {
      setSessions(sessions.filter(s => s.id !== sessionId));
      setConflictingSessions(conflictingSessions.filter(id => id !== sessionId));
    }
  };

  const updateSession = (sessionId: string, updates: Partial<BookingSession>) => {
    setSessions(sessions.map(s => s.id === sessionId ? { ...s, ...updates } : s));
    // Recheck conflicts when sessions are updated
    setTimeout(() => checkConflicts(), 100);
  };

  const selectTimeSlot = (sessionId: string, slot: typeof timeSlots[0]) => {
    updateSession(sessionId, {
      selectedSlot: slot.id,
      startTime: slot.start,
      endTime: slot.end,
    });
  };

  const isSlotAvailable = (slot: typeof timeSlots[0], sessionDate: string) => {
    // Simulate availability check - randomly mark some as busy
    const random = Math.random();
    return random > 0.3; // 70% availability
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (bookingMode === 'multiple') {
      if (!checkConflicts()) {
        alert('Please resolve conflicting sessions before submitting.');
        return;
      }
      setShowSummary(true);
      return;
    }

    // Single booking submission
    const newBooking: RoomBooking = {
      id: booking?.id || Date.now().toString(),
      eventName: formData.eventName,
      description: formData.description,
      eventType: formData.eventType as RoomBooking['eventType'],
      department: formData.department,
      organiser: formData.organiser,
      room: formData.room,
      date: new Date(formData.date),
      startTime: formData.startTime,
      endTime: formData.endTime,
      capacityNeeded: formData.capacityNeeded,
      equipment: formData.equipment,
      status: booking?.status || 'pending',
      notifications: formData.notifyStaff ? formData.notifications as RoomBooking['notifications'] : 'none',
      selectedStaff: formData.selectedStaff,
      emailMessage: formData.emailMessage,
    };

    onSave(newBooking);
  };

  const confirmMultipleBookings = () => {
    // Create first booking with reference to multiple sessions
    const firstSession = sessions[0];
    const newBooking: RoomBooking = {
      id: Date.now().toString(),
      eventName: formData.eventName,
      description: `${formData.description}\n\n📅 Multiple Sessions (${sessions.length} total)`,
      eventType: formData.eventType as RoomBooking['eventType'],
      department: formData.department,
      organiser: formData.organiser,
      room: firstSession.room,
      date: new Date(firstSession.date),
      startTime: firstSession.startTime,
      endTime: firstSession.endTime,
      capacityNeeded: formData.capacityNeeded,
      equipment: formData.equipment,
      status: 'pending',
      notifications: formData.notifyStaff ? formData.notifications as RoomBooking['notifications'] : 'none',
      selectedStaff: formData.selectedStaff,
      emailMessage: formData.emailMessage,
    };

    onSave(newBooking);
  };

  const toggleEquipment = (item: string) => {
    setFormData(prev => ({
      ...prev,
      equipment: prev.equipment.includes(item)
        ? prev.equipment.filter(e => e !== item)
        : [...prev.equipment, item]
    }));
  };

  const getTotalHours = () => {
    return sessions.reduce((total, session) => {
      if (session.startTime && session.endTime) {
        const start = new Date(`2000-01-01 ${session.startTime}`);
        const end = new Date(`2000-01-01 ${session.endTime}`);
        const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        return total + hours;
      }
      return total;
    }, 0);
  };

  const getUniqueRooms = () => {
    return [...new Set(sessions.map(s => s.room).filter(r => r))];
  };

  const getDateRange = () => {
    const dates = sessions.map(s => s.date).filter(d => d).sort();
    if (dates.length === 0) return 'N/A';
    if (dates.length === 1) return new Date(dates[0]).toLocaleDateString();
    return `${new Date(dates[0]).toLocaleDateString()} - ${new Date(dates[dates.length - 1]).toLocaleDateString()}`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-card-xl max-w-4xl w-full my-8 max-h-[95vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-light flex items-center justify-between flex-shrink-0">
          <h3 className="text-lg font-semibold text-dark">
            {booking ? 'Edit Booking' : 'New Room Booking'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-soft rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-body" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Booking Mode Switch */}
            {!booking && (
              <div className="p-4 bg-soft rounded-xl border border-light">
                <label className="text-sm font-semibold text-dark mb-3 block">Booking Mode</label>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="bookingMode"
                      checked={bookingMode === 'single'}
                      onChange={() => setBookingMode('single')}
                      className="w-4 h-4 text-primary-blue border-light focus:ring-2 focus:ring-primary-blue"
                    />
                    <span className="text-sm text-dark">Single Booking</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="bookingMode"
                      checked={bookingMode === 'multiple'}
                      onChange={() => setBookingMode('multiple')}
                      className="w-4 h-4 text-primary-blue border-light focus:ring-2 focus:ring-primary-blue"
                    />
                    <span className="text-sm text-dark">Multiple Bookings</span>
                  </label>
                </div>
              </div>
            )}

            {/* Event Details Section */}
            <EventDetailsSection formData={formData} setFormData={setFormData} />

            {/* Conditional Rendering: Single or Multiple Booking Sessions */}
            {bookingMode === 'single' ? (
              <SingleBookingForm 
                formData={formData}
                setFormData={setFormData}
                toggleEquipment={toggleEquipment}
                showConflictWarning={showConflictWarning}
                setShowConflictWarning={setShowConflictWarning}
              />
            ) : (
              <MultipleBookingsSessions
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

            {/* Notification Settings */}
            <NotificationSettings 
              formData={formData}
              setFormData={setFormData}
              bookingMode={bookingMode}
            />

            {/* Conflict Warning */}
            {conflictingSessions.length > 0 && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-red-900 mb-1">Session Conflicts Detected</h4>
                    <p className="text-sm text-red-800">
                      Some sessions overlap in time. Please adjust the times before submitting.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-light">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 text-body hover:bg-soft rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={bookingMode === 'multiple' && conflictingSessions.length > 0}
                className={`px-5 py-2.5 bg-primary-blue text-white rounded-xl hover:bg-blue-600 transition-colors ${
                  bookingMode === 'multiple' && conflictingSessions.length > 0 ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {bookingMode === 'multiple' 
                  ? `Submit Booking Request (${sessions.length} session${sessions.length > 1 ? 's' : ''})`
                  : booking ? 'Update Booking' : 'Submit Booking Request'
                }
              </button>
            </div>
          </form>
        </div>

        {/* Booking Summary Modal */}
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
                  {sessions.map((session, index) => (
                    <div key={session.id} className="p-3 bg-soft rounded-lg border border-light">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-dark">Session {index + 1}</p>
                          <p className="text-xs text-body">
                            {session.room} • {new Date(session.date).toLocaleDateString()} • {session.startTime} - {session.endTime}
                          </p>
                          {session.notes && (
                            <p className="text-xs text-body mt-1">Note: {session.notes}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-light">
              <button
                type="button"
                onClick={() => setShowSummary(false)}
                className="px-5 py-2.5 text-body hover:bg-soft rounded-xl transition-colors"
              >
                Back to Edit
              </button>
              <button
                type="button"
                onClick={confirmMultipleBookings}
                className="px-5 py-2.5 bg-primary-blue text-white rounded-xl hover:bg-blue-600 transition-colors"
              >
                Confirm & Submit
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Event Details Section Component
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
          <label className="text-sm font-medium text-dark mb-2 block">
            Event Description
          </label>
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

        <div>
          <label className="text-sm font-medium text-dark mb-2 block">
            Organiser Name
          </label>
          <input
            type="text"
            value={formData.organiser}
            onChange={(e) => setFormData({ ...formData, organiser: e.target.value })}
            className="w-full px-4 py-2.5 border border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue bg-soft"
            readOnly
          />
        </div>
      </div>
    </div>
  );
}

// Single Booking Form Component
function SingleBookingForm({ formData, setFormData, toggleEquipment, showConflictWarning, setShowConflictWarning }: any) {
  const [showAvailability, setShowAvailability] = useState(false);

  const handleRoomDateChange = () => {
    if (formData.room && formData.date) {
      setShowAvailability(true);
    }
  };

  const selectTimeSlot = (slot: typeof timeSlots[0]) => {
    setFormData({
      ...formData,
      startTime: slot.start,
      endTime: slot.end,
    });
  };

  const isSlotAvailable = (slot: typeof timeSlots[0]) => {
    return Math.random() > 0.3;
  };

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
                value={formData.room}
                onChange={(e) => {
                  setFormData({ ...formData, room: e.target.value });
                  handleRoomDateChange();
                  setShowConflictWarning(Math.random() > 0.7);
                }}
                className="w-full px-4 py-2.5 border border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue"
              >
                <option value="">Select a room</option>
                {rooms.map((room) => (
                  <option key={room.id} value={room.name}>
                    {room.name} (Capacity: {room.capacity})
                  </option>
                ))}
              </select>
              {showConflictWarning && formData.room && (
                <p className="text-xs text-orange-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Room may have conflicts - check availability
                </p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-dark mb-2 block">
                Capacity Needed
              </label>
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
              onChange={(e) => {
                setFormData({ ...formData, date: e.target.value });
                handleRoomDateChange();
              }}
              className="w-full px-4 py-2.5 border border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue"
            />
          </div>

          {/* Available Time Slots */}
          {showAvailability && formData.room && formData.date && (
            <div>
              <label className="text-sm font-medium text-dark mb-3 block">
                Available Time Options
              </label>
              <div className="grid grid-cols-2 gap-3">
                {timeSlots.map((slot) => {
                  const available = isSlotAvailable(slot);
                  const isSelected = formData.startTime === slot.start && formData.endTime === slot.end;
                  
                  return (
                    <button
                      key={slot.id}
                      type="button"
                      disabled={!available}
                      onClick={() => selectTimeSlot(slot)}
                      className={`p-3 rounded-xl border-2 transition-all text-left ${
                        isSelected
                          ? 'border-primary-blue bg-blue-50'
                          : available
                          ? 'border-light hover:border-primary-blue bg-white'
                          : 'border-light bg-gray-50 cursor-not-allowed opacity-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-xs font-medium ${
                          isSelected ? 'text-primary-blue' : available ? 'text-dark' : 'text-body'
                        }`}>
                          {slot.start} - {slot.end}
                        </span>
                        {available ? (
                          <span className="text-xs text-success">Available</span>
                        ) : (
                          <span className="text-xs text-body">Busy</span>
                        )}
                      </div>
                      <p className="text-xs text-body capitalize">{slot.period}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Manual Time Entry */}
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
            <label className="text-sm font-medium text-dark mb-3 block">
              Equipment Needed
            </label>
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

// Multiple Bookings Sessions Component
function MultipleBookingsSessions({ 
  sessions, 
  updateSession, 
  removeSession, 
  addSession, 
  selectTimeSlot, 
  isSlotAvailable,
  conflictingSessions,
  formData,
  toggleEquipment
}: any) {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-semibold text-dark">Booking Sessions</h4>
          <span className="text-xs text-body">{sessions.length} session{sessions.length > 1 ? 's' : ''}</span>
        </div>

        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
          {sessions.map((session: BookingSession, index: number) => (
            <SessionCard
              key={session.id}
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

      {/* Equipment - Common for All Sessions */}
      <div>
        <h4 className="text-sm font-semibold text-dark mb-3">
          Equipment Needed (All Sessions)
        </h4>
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

// Session Card Component
function SessionCard({ 
  session, 
  index, 
  updateSession, 
  removeSession, 
  selectTimeSlot, 
  isSlotAvailable,
  isConflicting,
  canRemove
}: any) {
  const [showAvailability, setShowAvailability] = useState(false);

  const handleRoomOrDateChange = () => {
    if (session.room && session.date) {
      setShowAvailability(true);
    }
  };

  return (
    <div className={`p-4 rounded-xl border-2 ${
      isConflicting ? 'border-red-300 bg-red-50' : 'border-light bg-white'
    }`}>
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
            This session conflicts with another session
          </p>
        </div>
      )}

      <div className="space-y-3">
        {/* Room and Date */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-dark mb-1.5 block">
              Room <span className="text-red-500">*</span>
            </label>
            <select
              value={session.room}
              onChange={(e) => {
                updateSession(session.id, { room: e.target.value });
                handleRoomOrDateChange();
              }}
              className="w-full px-3 py-2 border border-light rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue"
            >
              <option value="">Select room</option>
              {rooms.map((room) => (
                <option key={room.id} value={room.name}>
                  {room.name}
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
              onChange={(e) => {
                updateSession(session.id, { date: e.target.value });
                handleRoomOrDateChange();
              }}
              className="w-full px-3 py-2 border border-light rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue"
            />
          </div>
        </div>

        {/* Availability View Toggle */}
        {showAvailability && session.room && session.date && (
          <>
            <div className="flex items-center gap-1 p-1 bg-soft rounded-lg">
              <button
                type="button"
                onClick={() => updateSession(session.id, { availabilityView: 'slots' })}
                className={`flex-1 px-3 py-1.5 rounded text-xs transition-colors ${
                  session.availabilityView === 'slots'
                    ? 'bg-white text-primary-blue shadow-card'
                    : 'text-body hover:text-dark'
                }`}
              >
                Time Slots
              </button>
              <button
                type="button"
                onClick={() => updateSession(session.id, { availabilityView: 'schedule' })}
                className={`flex-1 px-3 py-1.5 rounded text-xs transition-colors ${
                  session.availabilityView === 'schedule'
                    ? 'bg-white text-primary-blue shadow-card'
                    : 'text-body hover:text-dark'
                }`}
              >
                Schedule View
              </button>
            </div>

            {session.availabilityView === 'slots' ? (
              <div>
                <label className="text-xs font-medium text-dark mb-2 block">
                  Available Time Options
                </label>
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
                            ? 'border-primary-blue bg-blue-50'
                            : available
                            ? 'border-light hover:border-primary-blue bg-white'
                            : 'border-light bg-gray-50 cursor-not-allowed opacity-50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-0.5">
                          <span className={`text-xs font-medium ${
                            isSelected ? 'text-primary-blue' : available ? 'text-dark' : 'text-body'
                          }`}>
                            {slot.start} - {slot.end}
                          </span>
                          {available && isSelected && (
                            <CheckCircle className="w-3 h-3 text-primary-blue" />
                          )}
                        </div>
                        <p className="text-xs text-body capitalize">{slot.period}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div>
                <label className="text-xs font-medium text-dark mb-2 block">
                  Schedule View
                </label>
                <div className="p-4 bg-soft rounded-lg border border-light">
                  <div className="space-y-2">
                    <p className="text-xs text-body mb-3">Daily Timeline - {new Date(session.date).toLocaleDateString()}</p>
                    {timeSlots.map((slot) => {
                      const available = isSlotAvailable(slot, session.date);
                      const isSelected = session.selectedSlot === slot.id;
                      
                      return (
                        <button
                          key={slot.id}
                          type="button"
                          disabled={!available}
                          onClick={() => selectTimeSlot(session.id, slot)}
                          className={`w-full p-2 rounded text-left transition-all ${
                            isSelected
                              ? 'bg-primary-blue text-white'
                              : available
                              ? 'bg-white hover:bg-blue-50 border border-light'
                              : 'bg-gray-100 text-body cursor-not-allowed'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium">{slot.start} - {slot.end}</span>
                            <span className="text-xs">
                              {available ? (isSelected ? 'Selected' : 'Available') : 'Busy'}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Manual Time Entry */}
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
              className="w-full px-4 py-2.5 border border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue"
            />
          </div>
        </div>

        {/* Session Notes */}
        <div>
          <label className="text-xs font-medium text-dark mb-1.5 block">
            Notes (Optional)
          </label>
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

// Notification Settings Component
function NotificationSettings({ formData, setFormData, bookingMode }: any) {
  return (
    <div>
      <h4 className="text-sm font-semibold text-dark mb-4">
        Notification Settings
        {bookingMode === 'multiple' && <span className="text-xs font-normal text-body ml-2">(Applies to all sessions)</span>}
      </h4>
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="notifyStaff"
            checked={formData.notifyStaff}
            onChange={(e) => setFormData({ ...formData, notifyStaff: e.target.checked, notifications: e.target.checked ? 'all-staff' : 'none' })}
            className="w-5 h-5 text-primary-blue border-light rounded focus:ring-2 focus:ring-primary-blue"
          />
          <label htmlFor="notifyStaff" className="text-sm font-medium text-dark cursor-pointer">
            Send notification emails to staff
          </label>
        </div>

        {formData.notifyStaff && (
          <>
            <div>
              <label className="text-sm font-medium text-dark mb-2 block">
                Notification Type
              </label>
              <select
                value={formData.notifications}
                onChange={(e) => setFormData({ ...formData, notifications: e.target.value })}
                className="w-full px-4 py-2.5 border border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue"
              >
                <option value="all-staff">All Staff</option>
                <option value="selected-staff">Selected Staff Only</option>
              </select>
            </div>

            {formData.notifications === 'selected-staff' && (
              <div>
                <label className="text-sm font-medium text-dark mb-2 block">
                  Select Staff Members
                </label>
                <div className="p-4 border border-light rounded-xl bg-soft">
                  <p className="text-xs text-body mb-2">Staff selection interface would go here</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-white text-dark text-xs rounded-lg border border-light">
                      Dr. Sarah Johnson
                    </span>
                    <span className="px-3 py-1 bg-white text-dark text-xs rounded-lg border border-light">
                      Prof. Michael Chen
                    </span>
                  </div>
                </div>
              </div>
            )}

            {bookingMode === 'multiple' && (
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
              <label className="text-sm font-medium text-dark mb-2 block">
                Custom Email Message (Optional)
              </label>
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
