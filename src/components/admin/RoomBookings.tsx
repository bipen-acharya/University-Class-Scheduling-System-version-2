import { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import {
  Calendar,
  Plus,
  Search,
  Eye,
  Edit2,
  X,
  CheckCircle,
  XCircle,
  Clock,
  Building2,
  Users,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  AlertCircle,
} from "lucide-react";
import MultipleBookingsModal from "./MultipleBookingsModal";

/** =========================
 * API types (matches your backend response)
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

type RommBookingApi = {
  id: number;
  event_name: string;
  event_type: EventType;
  room_id: number;
  room?: RoomApi | null;

  booking_date: string; // e.g. "2026-02-15T00:00:00.000000Z"
  start_time: string; // e.g. "2026-02-11T09:00:00.000000Z" OR "09:00:00" OR "09:00"
  end_time: string;

  organiser_name: string;
  organiser_email?: string | null;

  status: BookingStatus;
  notifications: Notifications;

  description?: string | null;
  capacity_needed?: number | null;
  notes?: string | null;
  email_message?: string | null;

  equipment?: string[];
  staff?: StaffApi[];

  created_by?: number | null;
  approved_by?: number | null;

  created_at?: string;
  updated_at?: string;
};

type ApiListResponse<T> = { status: number; message: string; data: T[] };
type ApiSingleResponse<T> = { status: number; message: string; data: T };

/** =========================
 * UI type (keeps your component design)
 * ========================= */
interface RoomBooking {
  id: string;
  eventName: string;
  eventType: EventType;
  room: string;
  date: Date;
  startTime: string;
  endTime: string;
  organiser: string;

  // keep department in UI (derive from room.department if you want)
  department: string;

  status: BookingStatus;
  notifications: Notifications;

  selectedStaff?: string[];
  description?: string;
  capacityNeeded?: number;
  equipment?: string[];
  notes?: string;
  emailMessage?: string;

  // extra for dynamic detail
  roomObj?: RoomApi | null;
  staff?: StaffApi[];
  organiserEmail?: string;
}

const eventTypeColors: Record<
  EventType,
  { bg: string; text: string; border: string }
> = {
  workshop: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  bootcamp: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
  meeting: { bg: "bg-green-50", text: "text-green-700", border: "border-green-200" },
  external: { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200" },
  other: { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200" },
};

const statusColors: Record<
  BookingStatus,
  { bg: string; text: string; border: string }
> = {
  pending: { bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-200" },
  approved: { bg: "bg-green-50", text: "text-green-700", border: "border-green-200" },
  rejected: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
};

/** =========================
 * Helpers
 * ========================= */
function dateFromApi(value: string): Date {
  // "2026-02-15" OR "2026-02-15T00:00:00.000000Z"
  return new Date(value);
}

function timeFromApi(value: string): string {
  if (!value) return "";
  // ISO datetime
  if (value.includes("T")) {
    const d = new Date(value);
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    return `${hh}:${mm}`;
  }
  // "09:00:00" -> "09:00"
  return value.slice(0, 5);
}

function mapApiToUi(b: RommBookingApi): RoomBooking {
  const roomName = b.room?.room_name ?? `Room #${b.room_id}`;
  const dept = b.room?.department ?? "—";

  return {
    id: String(b.id),
    eventName: b.event_name,
    eventType: b.event_type,
    room: roomName,
    date: dateFromApi(b.booking_date),
    startTime: timeFromApi(b.start_time),
    endTime: timeFromApi(b.end_time),
    organiser: b.organiser_name,
    organiserEmail: b.organiser_email ?? undefined,
    department: dept,
    status: b.status,
    notifications: b.notifications,
    description: b.description ?? undefined,
    capacityNeeded: b.capacity_needed ?? undefined,
    equipment: b.equipment ?? [],
    notes: b.notes ?? undefined,
    emailMessage: b.email_message ?? undefined,
    roomObj: b.room ?? null,
    staff: b.staff ?? [],
    selectedStaff: (b.staff ?? []).map((u) => u.name),
  };
}

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

/** Parse backend errors like:
 * { status: 0, message: "..." }
 * or Laravel 422 { message, errors: { field: [..] } }
 */
function parseApiError(err: any): string {
  const msg = err?.response?.data?.message;
  const errors = err?.response?.data?.errors;
  if (errors && typeof errors === "object") {
    const firstKey = Object.keys(errors)[0];
    const firstMsg = errors[firstKey]?.[0];
    return firstMsg || msg || "Request failed.";
  }
  return msg || err?.message || "Request failed.";
}

/** =========================
 * Component
 * ========================= */
export default function RoomBookings() {
  const token = useMemo(() => localStorage.getItem("token"), []);

  // ✅ dynamic states
  const [bookings, setBookings] = useState<RoomBooking[]>([]);
  const [rooms, setRooms] = useState<RoomApi[]>([]);

  // UI states
  const [viewMode, setViewMode] = useState<"table" | "calendar">("table");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRoom, setFilterRoom] = useState("all");
  const [filterEventType, setFilterEventType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<RoomBooking | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<RoomBooking | null>(null);

  const [loadingBookings, setLoadingBookings] = useState(false);
  const [loadingRooms, setLoadingRooms] = useState(false);

  // page message
  const [pageError, setPageError] = useState("");
  const [pageSuccess, setPageSuccess] = useState("");

  // modal message (to show overlap error etc)
  const [modalError, setModalError] = useState("");

  /** =========================
   * Fetch Rooms + Bookings
   * ========================= */
  const fetchRooms = async () => {
    setLoadingRooms(true);
    setPageError("");
    try {
      // change endpoint if yours differs
      const res = await api.get<ApiListResponse<RoomApi>>("/rooms", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.status === 1) setRooms(res.data.data || []);
      else setPageError(res.data.message || "Failed to load rooms.");
    } catch (err: any) {
      setPageError(parseApiError(err));
    } finally {
      setLoadingRooms(false);
    }
  };

  const fetchBookings = async () => {
    setLoadingBookings(true);
    setPageError("");
    try {
      const res = await api.get<ApiListResponse<RommBookingApi>>("/room-bookings", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.status === 1) setBookings((res.data.data || []).map(mapApiToUi));
      else setPageError(res.data.message || "Failed to load bookings.");
    } catch (err: any) {
      setPageError(parseApiError(err));
    } finally {
      setLoadingBookings(false);
    }
  };

  useEffect(() => {
    fetchRooms();
    fetchBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** =========================
   * Filter bookings
   * ========================= */
  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.eventName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.room.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.organiser.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRoom = filterRoom === "all" || booking.room === filterRoom;
    const matchesEventType = filterEventType === "all" || booking.eventType === filterEventType;
    const matchesStatus = filterStatus === "all" || booking.status === filterStatus;

    return matchesSearch && matchesRoom && matchesEventType && matchesStatus;
  });

  /** =========================
   * Statistics
   * ========================= */
  const todayBookings = bookings.filter((b) => {
    const today = new Date();
    return b.date.toDateString() === today.toDateString() && b.status === "approved";
  }).length;

  const upcomingBookings = bookings.filter((b) => {
    const today = new Date();
    return b.date > today && b.status === "approved";
  }).length;

  const pendingRequests = bookings.filter((b) => b.status === "pending").length;

  /** =========================
   * Handlers
   * ========================= */
  const handleNewBooking = () => {
    setModalError("");
    setEditingBooking(null);
    setIsBookingModalOpen(true);
  };

  const handleEditBooking = (booking: RoomBooking) => {
    setModalError("");
    setEditingBooking(booking);
    setIsBookingModalOpen(true);
    setIsDetailModalOpen(false);
  };

  const handleViewBooking = (booking: RoomBooking) => {
    setSelectedBooking(booking);
    setIsDetailModalOpen(true);
  };

  /** =========================
   * Approve / Reject / Delete
   * (If you don't have these endpoints, tell me your route names)
   * ========================= */
  const approveBooking = async (id: string) => {
    try {
      const res = await api.post<ApiSingleResponse<RommBookingApi>>(
        `/room-bookings/${id}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (res.data.status === 1) {
        const updated = mapApiToUi(res.data.data);
        setBookings((prev) => prev.map((b) => (b.id === id ? updated : b)));
        setIsDetailModalOpen(false);
        setPageSuccess("Booking approved.");
      } else {
        setPageError(res.data.message || "Failed to approve booking.");
      }
    } catch (err: any) {
      setPageError(parseApiError(err));
    }
  };

  const rejectBooking = async (id: string) => {
    try {
      const res = await api.post<ApiSingleResponse<RommBookingApi>>(
        `/room-bookings/${id}/reject`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (res.data.status === 1) {
        const updated = mapApiToUi(res.data.data);
        setBookings((prev) => prev.map((b) => (b.id === id ? updated : b)));
        setIsDetailModalOpen(false);
        setPageSuccess("Booking rejected.");
      } else {
        setPageError(res.data.message || "Failed to reject booking.");
      }
    } catch (err: any) {
      setPageError(parseApiError(err));
    }
  };

  const deleteBooking = async (id: string) => {
    try {
      const res = await api.delete<{ status: number; message: string }>(
        `/room-bookings/${id}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (res.data.status === 1) {
        setBookings((prev) => prev.filter((b) => b.id !== id));
        setIsDetailModalOpen(false);
        setPageSuccess("Booking deleted.");
      } else {
        setPageError(res.data.message || "Failed to delete booking.");
      }
    } catch (err: any) {
      setPageError(parseApiError(err));
    }
  };

  /** =========================
   * Create / Update (called from modal)
   * ========================= */
  const saveBooking = async (payload: BookingPayload) => {
    setModalError("");
    setPageSuccess("");
    setPageError("");

    try {
      const url = editingBooking ? `/room-bookings/${editingBooking.id}` : `/room-bookings`;
      const method = editingBooking ? "put" : "post";

      const res = await api.request<ApiSingleResponse<RommBookingApi>>({
        url,
        method,
        data: payload,
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.status === 1) {
        const saved = mapApiToUi(res.data.data);

        setBookings((prev) => {
          if (editingBooking) return prev.map((b) => (b.id === editingBooking.id ? saved : b));
          return [saved, ...prev];
        });

        setIsBookingModalOpen(false);
        setEditingBooking(null);
        setPageSuccess(editingBooking ? "Booking updated." : "Booking created.");
        return true;
      }

      // backend custom status 0
      setModalError(res.data.message || "Failed to save booking.");
      return false;
    } catch (err: any) {
      // 422 overlap error, validation error etc.
      setModalError(parseApiError(err));
      return false;
    }
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
            <div className="flex items-center gap-1 p-1 bg-soft rounded-xl">
              <button
                onClick={() => setViewMode("table")}
                className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                  viewMode === "table" ? "bg-white text-primary-blue shadow-card" : "text-body hover:text-dark"
                }`}
              >
                Table View
              </button>
              <button
                onClick={() => setViewMode("calendar")}
                className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                  viewMode === "calendar" ? "bg-white text-primary-blue shadow-card" : "text-body hover:text-dark"
                }`}
              >
                Calendar View
              </button>
            </div>

            <button
              onClick={handleNewBooking}
              className="px-4 py-2.5 bg-primary-blue text-white rounded-xl hover:bg-blue-600 transition-colors flex items-center gap-2 text-sm"
            >
              <Plus className="w-4 h-4" />
              New Booking
            </button>
          </div>
        </div>

        {(pageError || pageSuccess) && (
          <div
            className={`mt-4 rounded-xl p-4 text-sm border ${
              pageError ? "bg-red-50 border-red-200 text-red-700" : "bg-green-50 border-green-200 text-green-700"
            }`}
          >
            {pageError || pageSuccess}
          </div>
        )}
      </div>

      {/* Stats */}
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

      {/* Filters */}
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

          {/* Room */}
          <div>
            <select
              value={filterRoom}
              onChange={(e) => setFilterRoom(e.target.value)}
              disabled={loadingRooms}
              className="w-full px-4 py-2.5 border border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue bg-white disabled:opacity-50"
            >
              <option value="all">{loadingRooms ? "Loading..." : "All Rooms"}</option>
              {rooms.map((r) => (
                <option key={r.id} value={r.room_name}>
                  {r.room_name} (cap: {r.capacity})
                </option>
              ))}
            </select>
          </div>

          {/* Event Type */}
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

          {/* Status */}
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

        {loadingBookings && <div className="mt-4 text-sm text-body">Loading bookings...</div>}
      </div>

      {/* Content */}
      {viewMode === "table" ? (
        <BookingsTable bookings={filteredBookings} onView={handleViewBooking} onEdit={handleEditBooking} onCancel={deleteBooking} />
      ) : (
        <CalendarView bookings={filteredBookings} onViewBooking={handleViewBooking} />
      )}

      {/* Modal */}
      {isBookingModalOpen && (
        <MultipleBookingsModal
          // ✅ make your modal accept these:
          rooms={rooms}
          booking={editingBooking}
          errorMessage={modalError}
          onClose={() => setIsBookingModalOpen(false)}
          onSave={async (payload: BookingPayload) => {
            const ok = await saveBooking(payload);
            // if ok==true modal auto closes above
            return ok;
          }}
        />
      )}

      {/* Detail */}
      {isDetailModalOpen && selectedBooking && (
        <BookingDetailModal
          booking={selectedBooking}
          onClose={() => setIsDetailModalOpen(false)}
          onEdit={handleEditBooking}
          onApprove={approveBooking}
          onReject={rejectBooking}
          onCancel={deleteBooking}
        />
      )}
    </div>
  );
}

/** =========================
 * Table
 * ========================= */
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
              <th className="px-6 py-4 text-left text-xs font-semibold text-dark uppercase tracking-wider">Event Name</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-dark uppercase tracking-wider">Event Type</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-dark uppercase tracking-wider">Room</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-dark uppercase tracking-wider">Date</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-dark uppercase tracking-wider">Time</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-dark uppercase tracking-wider">Organiser</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-dark uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-dark uppercase tracking-wider">Notifications</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-dark uppercase tracking-wider">Actions</th>
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
                    <span
                      className={`px-3 py-1 rounded-lg text-xs font-medium border ${eventTypeColors[booking.eventType].bg} ${eventTypeColors[booking.eventType].text} ${eventTypeColors[booking.eventType].border}`}
                    >
                      {booking.eventType.charAt(0).toUpperCase() + booking.eventType.slice(1)}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-sm text-dark">{booking.room}</td>

                  <td className="px-6 py-4 text-sm text-dark">
                    {booking.date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </td>

                  <td className="px-6 py-4 text-sm text-dark">
                    {booking.startTime} - {booking.endTime}
                  </td>

                  <td className="px-6 py-4 text-sm text-dark">{booking.organiser}</td>

                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-lg text-xs font-medium border ${statusColors[booking.status].bg} ${statusColors[booking.status].text} ${statusColors[booking.status].border}`}
                    >
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <span className="text-xs text-body">
                      {booking.notifications === "all-staff" && "All Staff"}
                      {booking.notifications === "selected-staff" && "Selected Staff"}
                      {booking.notifications === "none" && "None"}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => onView(booking)} className="p-2 hover:bg-blue-50 rounded-lg transition-colors" title="View Details">
                        <Eye className="w-4 h-4 text-primary-blue" />
                      </button>
                      <button onClick={() => onEdit(booking)} className="p-2 hover:bg-blue-50 rounded-lg transition-colors" title="Edit Booking">
                        <Edit2 className="w-4 h-4 text-primary-blue" />
                      </button>
                      <button onClick={() => onCancel(booking.id)} className="p-2 hover:bg-red-50 rounded-lg transition-colors" title="Cancel Booking">
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

/** =========================
 * Calendar View (your same UI, simplified list)
 * ========================= */
interface CalendarViewProps {
  bookings: RoomBooking[];
  onViewBooking: (booking: RoomBooking) => void;
}

function CalendarView({ bookings, onViewBooking }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const bookingsByDate = bookings.reduce((acc, booking) => {
    const dateKey = booking.date.toDateString();
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(booking);
    return acc;
  }, {} as Record<string, RoomBooking[]>);

  return (
    <div className="bg-white rounded-2xl shadow-card-lg p-6 border border-light">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              const d = new Date(currentDate);
              d.setMonth(d.getMonth() - 1);
              setCurrentDate(d);
            }}
            className="p-2 hover:bg-soft rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-body" />
          </button>

          <h3 className="text-lg font-semibold text-dark">
            {currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </h3>

          <button
            onClick={() => {
              const d = new Date(currentDate);
              d.setMonth(d.getMonth() + 1);
              setCurrentDate(d);
            }}
            className="p-2 hover:bg-soft rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-body" />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {Object.entries(bookingsByDate)
          .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
          .slice(0, 7)
          .map(([dateKey, dayBookings]) => (
            <div key={dateKey} className="border border-light rounded-xl p-4">
              <h4 className="text-sm font-semibold text-dark mb-3">
                {new Date(dateKey).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
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

/** =========================
 * Detail Modal
 * (updated to show room info + staff names from API)
 * ========================= */
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
          <button onClick={onClose} className="p-2 hover:bg-soft rounded-lg transition-colors">
            <X className="w-5 h-5 text-body" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-center gap-3">
            <span className={`px-4 py-2 rounded-xl text-sm font-medium border ${statusColors[booking.status].bg} ${statusColors[booking.status].text} ${statusColors[booking.status].border}`}>
              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
            </span>
            <span className={`px-4 py-2 rounded-xl text-sm font-medium border ${eventTypeColors[booking.eventType].bg} ${eventTypeColors[booking.eventType].text} ${eventTypeColors[booking.eventType].border}`}>
              {booking.eventType.charAt(0).toUpperCase() + booking.eventType.slice(1)}
            </span>
          </div>

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

          <div>
            <h4 className="text-sm font-semibold text-dark mb-3">Room & Schedule</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-body">Room</label>
                <p className="text-sm text-dark mt-1">{booking.room}</p>
              </div>

              <div>
                <label className="text-xs font-medium text-body">Capacity Needed</label>
                <p className="text-sm text-dark mt-1">{booking.capacityNeeded ?? "N/A"}</p>
              </div>

              <div>
                <label className="text-xs font-medium text-body">Date</label>
                <p className="text-sm text-dark mt-1">
                  {booking.date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                </p>
              </div>

              <div>
                <label className="text-xs font-medium text-body">Time</label>
                <p className="text-sm text-dark mt-1">{booking.startTime} - {booking.endTime}</p>
              </div>
            </div>
          </div>

          {booking.equipment?.length ? (
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
          ) : null}

          <div>
            <h4 className="text-sm font-semibold text-dark mb-3">Notifications</h4>
            <div className="space-y-2">
              <p className="text-sm text-dark">
                Type:{" "}
                <span className="font-medium">
                  {booking.notifications === "all-staff" && "All Staff"}
                  {booking.notifications === "selected-staff" && "Selected Staff"}
                  {booking.notifications === "none" && "None"}
                </span>
              </p>

              {booking.selectedStaff?.length ? (
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
              ) : null}
            </div>
          </div>

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

        <div className="p-6 border-t border-light flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {booking.status === "pending" && (
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
