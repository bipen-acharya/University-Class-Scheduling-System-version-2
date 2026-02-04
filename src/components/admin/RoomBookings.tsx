import { useState } from 'react';
import { 
  Calendar, 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Eye, 
  Edit2, 
  X, 
  CheckCircle, 
  XCircle, 
  Clock,
  Building2,
  Users,
  Mail,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  AlertCircle,
  Trash2
} from 'lucide-react';
import MultipleBookingsModal from './MultipleBookingsModal';

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

const eventTypeColors = {
  workshop: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  bootcamp: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  meeting: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  external: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  other: { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' },
};

const statusColors = {
  pending: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
  approved: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  rejected: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
};

const mockBookings: RoomBooking[] = [
  {
    id: '1',
    eventName: 'Web Development Bootcamp - Session 1',
    eventType: 'bootcamp',
    room: 'Room 2.1',
    date: new Date(2025, 0, 28),
    startTime: '09:00',
    endTime: '17:00',
    organiser: 'Dr. Sarah Johnson',
    department: 'Computer Science',
    status: 'approved',
    notifications: 'all-staff',
    description: 'Intensive web development training for students',
    capacityNeeded: 30,
    equipment: ['Projector', 'Audio', 'Computers'],
  },
  {
    id: '2',
    eventName: 'Faculty Meeting - Q1 Planning',
    eventType: 'meeting',
    room: 'Room 1.2',
    date: new Date(2025, 0, 29),
    startTime: '14:00',
    endTime: '16:00',
    organiser: 'Prof. Michael Chen',
    department: 'Administration',
    status: 'approved',
    notifications: 'selected-staff',
    selectedStaff: ['Dr. Sarah Johnson', 'Prof. Emily Brown', 'Dr. James Wilson'],
    description: 'Quarterly planning and budget review',
    capacityNeeded: 15,
    equipment: ['Projector', 'Whiteboard'],
  },
  {
    id: '3',
    eventName: 'Industry Workshop - AI in Healthcare',
    eventType: 'workshop',
    room: 'Room 11.1',
    date: new Date(2025, 0, 30),
    startTime: '10:00',
    endTime: '13:00',
    organiser: 'Dr. Emily Brown',
    department: 'Health Sciences',
    status: 'pending',
    notifications: 'all-staff',
    description: 'Guest speaker from local hospital on AI applications',
    capacityNeeded: 50,
    equipment: ['Projector', 'Audio'],
  },
  {
    id: '4',
    eventName: 'External Client Presentation',
    eventType: 'external',
    room: 'Room 3.1',
    date: new Date(2025, 1, 2),
    startTime: '11:00',
    endTime: '12:30',
    organiser: 'Dr. James Wilson',
    department: 'Business School',
    status: 'pending',
    notifications: 'none',
    description: 'Project showcase for external stakeholders',
    capacityNeeded: 20,
    equipment: ['Projector', 'Audio', 'Whiteboard'],
  },
  {
    id: '5',
    eventName: 'Student Council Meeting',
    eventType: 'meeting',
    room: 'Room 2.2',
    date: new Date(2025, 1, 5),
    startTime: '15:00',
    endTime: '17:00',
    organiser: 'Prof. Lisa Anderson',
    department: 'Student Services',
    status: 'approved',
    notifications: 'selected-staff',
    selectedStaff: ['Student Representatives'],
    description: 'Monthly student council session',
    capacityNeeded: 25,
    equipment: ['Projector'],
  },
  {
    id: '6',
    eventName: 'Research Seminar - Climate Change',
    eventType: 'workshop',
    room: 'Room 1.1',
    date: new Date(2025, 1, 8),
    startTime: '13:00',
    endTime: '15:00',
    organiser: 'Dr. Robert Taylor',
    department: 'Environmental Science',
    status: 'rejected',
    notifications: 'all-staff',
    description: 'Presentation of recent research findings',
    capacityNeeded: 40,
    equipment: ['Projector', 'Audio'],
    notes: 'Room unavailable - please select alternative venue',
  },
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

export default function RoomBookings() {
  const [bookings, setBookings] = useState<RoomBooking[]>(mockBookings);
  const [viewMode, setViewMode] = useState<'table' | 'calendar'>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRoom, setFilterRoom] = useState('all');
  const [filterEventType, setFilterEventType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<RoomBooking | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<RoomBooking | null>(null);

  // Filter bookings
  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.eventName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.room.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.organiser.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRoom = filterRoom === 'all' || booking.room === filterRoom;
    const matchesEventType = filterEventType === 'all' || booking.eventType === filterEventType;
    const matchesStatus = filterStatus === 'all' || booking.status === filterStatus;

    return matchesSearch && matchesRoom && matchesEventType && matchesStatus;
  });

  // Statistics
  const todayBookings = bookings.filter(b => {
    const today = new Date();
    return b.date.toDateString() === today.toDateString() && b.status === 'approved';
  }).length;

  const upcomingBookings = bookings.filter(b => {
    const today = new Date();
    return b.date > today && b.status === 'approved';
  }).length;

  const pendingRequests = bookings.filter(b => b.status === 'pending').length;

  const handleNewBooking = () => {
    setEditingBooking(null);
    setIsBookingModalOpen(true);
  };

  const handleEditBooking = (booking: RoomBooking) => {
    setEditingBooking(booking);
    setIsBookingModalOpen(true);
    setIsDetailModalOpen(false);
  };

  const handleViewBooking = (booking: RoomBooking) => {
    setSelectedBooking(booking);
    setIsDetailModalOpen(true);
  };

  const handleApproveBooking = (bookingId: string) => {
    setBookings(bookings.map(b => 
      b.id === bookingId ? { ...b, status: 'approved' as const } : b
    ));
    setIsDetailModalOpen(false);
  };

  const handleRejectBooking = (bookingId: string) => {
    setBookings(bookings.map(b => 
      b.id === bookingId ? { ...b, status: 'rejected' as const } : b
    ));
    setIsDetailModalOpen(false);
  };

  const handleCancelBooking = (bookingId: string) => {
    setBookings(bookings.filter(b => b.id !== bookingId));
    setIsDetailModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-card-lg p-6 border border-light">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-2xl text-dark font-semibold mb-1">Room Bookings & Events</h2>
            <p className="text-sm text-body">Manage non-classroom bookings and special events</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 p-1 bg-soft rounded-xl">
              <button
                onClick={() => setViewMode('table')}
                className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                  viewMode === 'table' 
                    ? 'bg-white text-primary-blue shadow-card' 
                    : 'text-body hover:text-dark'
                }`}
              >
                Table View
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                  viewMode === 'calendar' 
                    ? 'bg-white text-primary-blue shadow-card' 
                    : 'text-body hover:text-dark'
                }`}
              >
                Calendar View
              </button>
            </div>

            {/* New Booking Button */}
            <button
              onClick={handleNewBooking}
              className="px-4 py-2.5 bg-primary-blue text-white rounded-xl hover:bg-blue-600 transition-colors flex items-center gap-2 text-sm"
            >
              <Plus className="w-4 h-4" />
              New Booking
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-card-lg p-6 border border-light">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-body mb-1">Today's Bookings</p>
              <p className="text-3xl text-dark font-bold">{todayBookings}</p>
            </div>
            <div className="bg-blue-50 p-3 rounded-xl">
              <Calendar className="w-6 h-6 text-primary-blue" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-card-lg p-6 border border-light">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-body mb-1">Upcoming Events</p>
              <p className="text-3xl text-dark font-bold">{upcomingBookings}</p>
            </div>
            <div className="bg-green-50 p-3 rounded-xl">
              <CalendarDays className="w-6 h-6 text-success" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-card-lg p-6 border border-light">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-body mb-1">Pending Requests</p>
              <p className="text-3xl text-dark font-bold">{pendingRequests}</p>
            </div>
            <div className="bg-orange-50 p-3 rounded-xl">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl shadow-card-lg p-6 border border-light">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="w-5 h-5 text-body absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by event name, room, or organiser..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue"
              />
            </div>
          </div>

          {/* Room Filter */}
          <div>
            <select
              value={filterRoom}
              onChange={(e) => setFilterRoom(e.target.value)}
              className="w-full px-4 py-2.5 border border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue bg-white"
            >
              <option value="all">All Rooms</option>
              {rooms.map(room => (
                <option key={room.id} value={room.name}>{room.name}</option>
              ))}
            </select>
          </div>

          {/* Event Type Filter */}
          <div>
            <select
              value={filterEventType}
              onChange={(e) => setFilterEventType(e.target.value)}
              className="w-full px-4 py-2.5 border border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue bg-white"
            >
              <option value="all">All Event Types</option>
              <option value="workshop">Workshop</option>
              <option value="bootcamp">Bootcamp</option>
              <option value="meeting">Meeting</option>
              <option value="external">External Event</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2.5 border border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue bg-white"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content - Table or Calendar View */}
      {viewMode === 'table' ? (
        <BookingsTable 
          bookings={filteredBookings}
          onView={handleViewBooking}
          onEdit={handleEditBooking}
          onCancel={handleCancelBooking}
        />
      ) : (
        <CalendarView bookings={filteredBookings} onViewBooking={handleViewBooking} />
      )}

      {/* New/Edit Booking Modal */}
      {isBookingModalOpen && (
        <MultipleBookingsModal
          booking={editingBooking}
          onClose={() => setIsBookingModalOpen(false)}
          onSave={(booking) => {
            if (editingBooking) {
              setBookings(bookings.map(b => b.id === booking.id ? booking : b));
            } else {
              setBookings([...bookings, { ...booking, id: Date.now().toString() }]);
            }
            setIsBookingModalOpen(false);
          }}
        />
      )}

      {/* Booking Detail Modal */}
      {isDetailModalOpen && selectedBooking && (
        <BookingDetailModal
          booking={selectedBooking}
          onClose={() => setIsDetailModalOpen(false)}
          onEdit={handleEditBooking}
          onApprove={handleApproveBooking}
          onReject={handleRejectBooking}
          onCancel={handleCancelBooking}
        />
      )}
    </div>
  );
}

// Bookings Table Component
interface BookingsTableProps {
  bookings: RoomBooking[];
  onView: (booking: RoomBooking) => void;
  onEdit: (booking: RoomBooking) => void;
  onCancel: (bookingId: string) => void;
}

function BookingsTable({ bookings, onView, onEdit, onCancel }: BookingsTableProps) {
  return (
    <div className="bg-white rounded-2xl shadow-card-lg border border-light overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-soft border-b border-light">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-dark uppercase tracking-wider">
                Event Name
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-dark uppercase tracking-wider">
                Event Type
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-dark uppercase tracking-wider">
                Room
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-dark uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-dark uppercase tracking-wider">
                Time
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-dark uppercase tracking-wider">
                Organiser
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-dark uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-dark uppercase tracking-wider">
                Notifications
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-dark uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-light">
            {bookings.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-6 py-12 text-center text-body">
                  No bookings found
                </td>
              </tr>
            ) : (
              bookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-soft transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-dark">{booking.eventName}</p>
                    <p className="text-xs text-body">{booking.department}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-lg text-xs font-medium border ${eventTypeColors[booking.eventType].bg} ${eventTypeColors[booking.eventType].text} ${eventTypeColors[booking.eventType].border}`}>
                      {booking.eventType.charAt(0).toUpperCase() + booking.eventType.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-dark">{booking.room}</td>
                  <td className="px-6 py-4 text-sm text-dark">
                    {booking.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-4 text-sm text-dark">
                    {booking.startTime} - {booking.endTime}
                  </td>
                  <td className="px-6 py-4 text-sm text-dark">{booking.organiser}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-lg text-xs font-medium border ${statusColors[booking.status].bg} ${statusColors[booking.status].text} ${statusColors[booking.status].border}`}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs text-body">
                      {booking.notifications === 'all-staff' && 'All Staff'}
                      {booking.notifications === 'selected-staff' && 'Selected Staff'}
                      {booking.notifications === 'none' && 'None'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onView(booking)}
                        className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4 text-primary-blue" />
                      </button>
                      <button
                        onClick={() => onEdit(booking)}
                        className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit Booking"
                      >
                        <Edit2 className="w-4 h-4 text-primary-blue" />
                      </button>
                      <button
                        onClick={() => onCancel(booking.id)}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                        title="Cancel Booking"
                      >
                        <X className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Calendar View Component
interface CalendarViewProps {
  bookings: RoomBooking[];
  onViewBooking: (booking: RoomBooking) => void;
}

function CalendarView({ bookings, onViewBooking }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarView, setCalendarView] = useState<'day' | 'week' | 'month'>('week');

  // Group bookings by date
  const bookingsByDate = bookings.reduce((acc, booking) => {
    const dateKey = booking.date.toDateString();
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(booking);
    return acc;
  }, {} as Record<string, RoomBooking[]>);

  return (
    <div className="bg-white rounded-2xl shadow-card-lg p-6 border border-light">
      {/* Calendar Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              const newDate = new Date(currentDate);
              newDate.setMonth(currentDate.getMonth() - 1);
              setCurrentDate(newDate);
            }}
            className="p-2 hover:bg-soft rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-body" />
          </button>
          <h3 className="text-lg font-semibold text-dark">
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h3>
          <button
            onClick={() => {
              const newDate = new Date(currentDate);
              newDate.setMonth(currentDate.getMonth() + 1);
              setCurrentDate(newDate);
            }}
            className="p-2 hover:bg-soft rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-body" />
          </button>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 p-1 bg-soft rounded-xl">
          {(['day', 'week', 'month'] as const).map((view) => (
            <button
              key={view}
              onClick={() => setCalendarView(view)}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                calendarView === view
                  ? 'bg-white text-primary-blue shadow-card'
                  : 'text-body hover:text-dark'
              }`}
            >
              {view.charAt(0).toUpperCase() + view.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Calendar Grid - Simplified Week View */}
      <div className="space-y-4">
        {Object.entries(bookingsByDate)
          .sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime())
          .slice(0, 7)
          .map(([dateKey, dayBookings]) => (
            <div key={dateKey} className="border border-light rounded-xl p-4">
              <h4 className="text-sm font-semibold text-dark mb-3">
                {new Date(dateKey).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </h4>
              <div className="space-y-2">
                {dayBookings.map((booking) => (
                  <div
                    key={booking.id}
                    onClick={() => onViewBooking(booking)}
                    className={`p-3 rounded-lg border cursor-pointer hover:shadow-card transition-all ${eventTypeColors[booking.eventType].bg} ${eventTypeColors[booking.eventType].border}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-dark mb-1">{booking.eventName}</p>
                        <div className="flex items-center gap-3 text-xs text-body">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {booking.startTime} - {booking.endTime}
                          </span>
                          <span className="flex items-center gap-1">
                            <Building2 className="w-3 h-3" />
                            {booking.room}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {booking.organiser}
                          </span>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[booking.status].bg} ${statusColors[booking.status].text}`}>
                        {booking.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

// Booking Detail Modal Component
interface BookingDetailModalProps {
  booking: RoomBooking;
  onClose: () => void;
  onEdit: (booking: RoomBooking) => void;
  onApprove: (bookingId: string) => void;
  onReject: (bookingId: string) => void;
  onCancel: (bookingId: string) => void;
}

function BookingDetailModal({ booking, onClose, onEdit, onApprove, onReject, onCancel }: BookingDetailModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-card-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-light flex items-center justify-between sticky top-0 bg-white">
          <h3 className="text-lg font-semibold text-dark">Booking Details</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-soft rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-body" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status Badge */}
          <div className="flex items-center gap-3">
            <span className={`px-4 py-2 rounded-xl text-sm font-medium border ${statusColors[booking.status].bg} ${statusColors[booking.status].text} ${statusColors[booking.status].border}`}>
              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
            </span>
            <span className={`px-4 py-2 rounded-xl text-sm font-medium border ${eventTypeColors[booking.eventType].bg} ${eventTypeColors[booking.eventType].text} ${eventTypeColors[booking.eventType].border}`}>
              {booking.eventType.charAt(0).toUpperCase() + booking.eventType.slice(1)}
            </span>
          </div>

          {/* Event Details */}
          <div>
            <h4 className="text-sm font-semibold text-dark mb-3">Event Details</h4>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-body">Event Name</label>
                <p className="text-sm text-dark mt-1">{booking.eventName}</p>
              </div>
              {booking.description && (
                <div>
                  <label className="text-xs font-medium text-body">Description</label>
                  <p className="text-sm text-dark mt-1">{booking.description}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-body">Department</label>
                  <p className="text-sm text-dark mt-1">{booking.department}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-body">Organiser</label>
                  <p className="text-sm text-dark mt-1">{booking.organiser}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Room & Schedule */}
          <div>
            <h4 className="text-sm font-semibold text-dark mb-3">Room & Schedule</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-body">Room</label>
                <p className="text-sm text-dark mt-1">{booking.room}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-body">Capacity Needed</label>
                <p className="text-sm text-dark mt-1">{booking.capacityNeeded || 'N/A'}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-body">Date</label>
                <p className="text-sm text-dark mt-1">
                  {booking.date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-body">Time</label>
                <p className="text-sm text-dark mt-1">{booking.startTime} - {booking.endTime}</p>
              </div>
            </div>
          </div>

          {/* Equipment */}
          {booking.equipment && booking.equipment.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-dark mb-3">Equipment Needed</h4>
              <div className="flex flex-wrap gap-2">
                {booking.equipment.map((item, idx) => (
                  <span key={idx} className="px-3 py-1 bg-soft text-dark text-xs rounded-lg border border-light">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Notifications */}
          <div>
            <h4 className="text-sm font-semibold text-dark mb-3">Notifications</h4>
            <div className="space-y-2">
              <p className="text-sm text-dark">
                Type: <span className="font-medium">
                  {booking.notifications === 'all-staff' && 'All Staff'}
                  {booking.notifications === 'selected-staff' && 'Selected Staff'}
                  {booking.notifications === 'none' && 'None'}
                </span>
              </p>
              {booking.selectedStaff && booking.selectedStaff.length > 0 && (
                <div>
                  <label className="text-xs font-medium text-body">Selected Staff</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {booking.selectedStaff.map((staff, idx) => (
                      <span key={idx} className="px-3 py-1 bg-blue-50 text-primary-blue text-xs rounded-lg border border-blue-200">
                        {staff}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Admin Notes */}
          {booking.notes && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-yellow-900 mb-1">Admin Notes</h4>
                  <p className="text-sm text-yellow-800">{booking.notes}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-light flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {booking.status === 'pending' && (
              <>
                <button
                  onClick={() => onApprove(booking.id)}
                  className="px-4 py-2 bg-success text-white rounded-xl hover:bg-green-600 transition-colors flex items-center gap-2 text-sm"
                >
                  <CheckCircle className="w-4 h-4" />
                  Approve
                </button>
                <button
                  onClick={() => onReject(booking.id)}
                  className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors flex items-center gap-2 text-sm"
                >
                  <XCircle className="w-4 h-4" />
                  Reject
                </button>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(booking)}
              className="px-4 py-2 text-primary-blue hover:bg-blue-50 rounded-xl transition-colors flex items-center gap-2 text-sm"
            >
              <Edit2 className="w-4 h-4" />
              Edit
            </button>
            <button
              onClick={() => onCancel(booking.id)}
              className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors text-sm"
            >
              Cancel Booking
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}