import { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import { toast } from "sonner";
import {
  Calendar, Plus, Search, Eye, Edit2, X,
  CheckCircle, XCircle, Clock, Building2, Users,
  ChevronLeft, ChevronRight, CalendarDays, AlertCircle,
  Loader2, Trash2,
} from "lucide-react";

/** ========================= Types ========================= */
type BookingStatus = "pending" | "approved" | "rejected";
type EventType     = "workshop" | "bootcamp" | "meeting" | "external" | "other";
type Notifications = "all-staff" | "selected-staff" | "none";

type RoomApi = {
  id: number; room_name: string;
  room_type: "lecture_hall" | "lab" | "seminar_room";
  capacity: number; department?: string | null;
};

type StaffApi = { id: number; name: string; email: string };

type RommBookingApi = {
  id: number; event_name: string; event_type: EventType;
  room_id: number; room?: RoomApi | null;
  booking_date: string; start_time: string; end_time: string;
  organiser_name: string; organiser_email?: string | null;
  status: BookingStatus; notifications: Notifications;
  description?: string | null; capacity_needed?: number | null;
  notes?: string | null; email_message?: string | null;
  equipment?: string[]; staff?: StaffApi[];
  created_by?: number | null; approved_by?: number | null;
  created_at?: string; updated_at?: string;
};

type ApiListResponse<T>   = { status: number; message: string; data: T[] };
type ApiSingleResponse<T> = { status: number; message: string; data: T };

interface RoomBooking {
  id: string; eventName: string; eventType: EventType;
  room: string; date: Date; startTime: string; endTime: string;
  organiser: string; department: string; status: BookingStatus;
  notifications: Notifications; selectedStaff?: string[];
  description?: string; capacityNeeded?: number;
  equipment?: string[]; notes?: string; emailMessage?: string;
  roomObj?: RoomApi | null; staff?: StaffApi[]; organiserEmail?: string;
}

type BookingFormData = {
  event_name: string; event_type: EventType; room_id: string;
  booking_date: string; start_time: string; end_time: string;
  organiser_name: string; organiser_email: string;
  notifications: Notifications; description: string;
  capacity_needed: string; notes: string; email_message: string;
  equipment: string[];
  equipment_input: string;
};

const EMPTY_FORM: BookingFormData = {
  event_name: "", event_type: "meeting", room_id: "",
  booking_date: "", start_time: "09:00", end_time: "11:00",
  organiser_name: "", organiser_email: "",
  notifications: "none", description: "",
  capacity_needed: "", notes: "", email_message: "",
  equipment: [], equipment_input: "",
};

const eventTypeColors: Record<EventType, { bg: string; text: string; border: string }> = {
  workshop: { bg: "bg-blue-50",   text: "text-blue-700",   border: "border-blue-200" },
  bootcamp: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
  meeting:  { bg: "bg-green-50",  text: "text-green-700",  border: "border-green-200" },
  external: { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200" },
  other:    { bg: "bg-gray-50",   text: "text-gray-700",   border: "border-gray-200" },
};

const statusColors: Record<BookingStatus, { bg: string; text: string; border: string }> = {
  pending:  { bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-200" },
  approved: { bg: "bg-green-50",  text: "text-green-700",  border: "border-green-200" },
  rejected: { bg: "bg-red-50",    text: "text-red-700",    border: "border-red-200" },
};

/** ========================= Helpers ========================= */
function dateFromApi(value: string): Date { return new Date(value); }

function timeFromApi(value: string): string {
  if (!value) return "";
  if (value.includes("T")) {
    const d = new Date(value);
    return `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
  }
  return value.slice(0, 5);
}

function mapApiToUi(b: RommBookingApi): RoomBooking {
  return {
    id: String(b.id), eventName: b.event_name, eventType: b.event_type,
    room: b.room?.room_name ?? `Room #${b.room_id}`,
    date: dateFromApi(b.booking_date),
    startTime: timeFromApi(b.start_time), endTime: timeFromApi(b.end_time),
    organiser: b.organiser_name, organiserEmail: b.organiser_email ?? undefined,
    department: b.room?.department ?? "—", status: b.status,
    notifications: b.notifications, description: b.description ?? undefined,
    capacityNeeded: b.capacity_needed ?? undefined,
    equipment: b.equipment ?? [], notes: b.notes ?? undefined,
    emailMessage: b.email_message ?? undefined, roomObj: b.room ?? null,
    staff: b.staff ?? [], selectedStaff: (b.staff ?? []).map((u) => u.name),
  };
}

function parseApiError(err: any): string {
  const msg = err?.response?.data?.message;
  const errors = err?.response?.data?.errors;
  if (errors && typeof errors === "object") {
    const firstKey = Object.keys(errors)[0];
    return errors[firstKey]?.[0] || msg || "Request failed.";
  }
  return msg || err?.message || "Request failed.";
}

const PAGE_SIZE = 10;

/** ========================= Skeleton Row ========================= */
function SkeletonRow() {
  return (
    <tr className="border-t border-light">
      <td className="px-5 py-4">
        <div className="h-3.5 w-32 rounded bg-gray-200 animate-pulse mb-1" />
        <div className="h-3 w-20 rounded bg-gray-200 animate-pulse" />
      </td>
      <td className="px-5 py-4"><div className="h-6 w-20 rounded-lg bg-gray-200 animate-pulse" /></td>
      <td className="px-5 py-4"><div className="h-4 w-24 rounded bg-gray-200 animate-pulse" /></td>
      <td className="px-5 py-4"><div className="h-4 w-24 rounded bg-gray-200 animate-pulse" /></td>
      <td className="px-5 py-4"><div className="h-4 w-24 rounded bg-gray-200 animate-pulse" /></td>
      <td className="px-5 py-4"><div className="h-4 w-24 rounded bg-gray-200 animate-pulse" /></td>
      <td className="px-5 py-4"><div className="h-6 w-20 rounded-lg bg-gray-200 animate-pulse" /></td>
      <td className="px-5 py-4"><div className="h-4 w-16 rounded bg-gray-200 animate-pulse" /></td>
      <td className="px-5 py-4">
        <div className="flex gap-1.5">
          <div className="w-7 h-7 rounded-lg bg-gray-200 animate-pulse" />
          <div className="w-7 h-7 rounded-lg bg-gray-200 animate-pulse" />
          <div className="w-7 h-7 rounded-lg bg-gray-200 animate-pulse" />
        </div>
      </td>
    </tr>
  );
}

/** ========================= Pagination Bar ========================= */
function PaginationBar({ currentPage, totalPages, totalItems, onPageChange }: {
  currentPage: number; totalPages: number;
  totalItems: number; onPageChange: (page: number) => void;
}) {
  const safePage = Math.min(currentPage, totalPages);
  const fromItem = totalItems === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const toItem   = Math.min(safePage * PAGE_SIZE, totalItems);

  const pageNumbers = useMemo(() => {
    const range: number[] = [];
    for (let i = Math.max(1, safePage - 2); i <= Math.min(totalPages, safePage + 2); i++) range.push(i);
    return range;
  }, [safePage, totalPages]);

  if (totalItems === 0) return null;

  return (
    <div className="border-t border-light px-6 py-3 flex items-center justify-between flex-wrap gap-3">
      <p className="text-sm text-body">
        Showing <span className="font-medium text-dark">{fromItem}–{toItem}</span> of{" "}
        <span className="font-medium text-dark">{totalItems}</span> bookings
      </p>
      <div className="flex items-center gap-1">
        <button onClick={() => onPageChange(Math.max(1, safePage - 1))} disabled={safePage === 1}
          className="p-1.5 rounded-lg border border-light text-body hover:bg-soft disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer">
          <ChevronLeft className="w-4 h-4" />
        </button>
        {pageNumbers[0] > 1 && (<>
          <button onClick={() => onPageChange(1)} className="w-8 h-8 rounded-lg border border-light text-sm text-body hover:bg-soft cursor-pointer">1</button>
          {pageNumbers[0] > 2 && <span className="px-1 text-body text-sm">…</span>}
        </>)}
        {pageNumbers.map((page) => (
          <button key={page} onClick={() => onPageChange(page)}
            className={`w-8 h-8 rounded-lg border text-sm transition-colors cursor-pointer ${
              page === safePage ? "bg-primary-blue text-white border-primary-blue font-medium" : "border-light text-body hover:bg-soft"
            }`}>
            {page}
          </button>
        ))}
        {pageNumbers[pageNumbers.length - 1] < totalPages && (<>
          {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && <span className="px-1 text-body text-sm">…</span>}
          <button onClick={() => onPageChange(totalPages)} className="w-8 h-8 rounded-lg border border-light text-sm text-body hover:bg-soft cursor-pointer">{totalPages}</button>
        </>)}
        <button onClick={() => onPageChange(Math.min(totalPages, safePage + 1))} disabled={safePage === totalPages}
          className="p-1.5 rounded-lg border border-light text-body hover:bg-soft disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

/** ========================= Main Component ========================= */
export default function RoomBookings() {
  const token = useMemo(() => localStorage.getItem("token"), []);

  const [bookings,        setBookings]        = useState<RoomBooking[]>([]);
  const [rooms,           setRooms]           = useState<RoomApi[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [loadingRooms,    setLoadingRooms]    = useState(true);

  const [viewMode,        setViewMode]        = useState<"table" | "calendar">("table");
  const [searchQuery,     setSearchQuery]     = useState("");
  const [filterRoom,      setFilterRoom]      = useState("all");
  const [filterEventType, setFilterEventType] = useState("all");
  const [filterStatus,    setFilterStatus]    = useState("all");

  const [isFormModalOpen,   setIsFormModalOpen]   = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteOpen,      setIsDeleteOpen]      = useState(false);
  const [deleteTarget,      setDeleteTarget]      = useState<string | null>(null);

  const [editingBooking,  setEditingBooking]  = useState<RoomBooking | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<RoomBooking | null>(null);
  const [formData,        setFormData]        = useState<BookingFormData>(EMPTY_FORM);
  const [modalError,      setModalError]      = useState("");
  const [saving,          setSaving]          = useState(false);
  const [deleting,        setDeleting]        = useState(false);
  const [currentPage,     setCurrentPage]     = useState(1);

  useEffect(() => { setCurrentPage(1); }, [searchQuery, filterRoom, filterEventType, filterStatus]);

  /** ── Fetchers ── */
  const fetchRooms = async () => {
    try {
      setLoadingRooms(true);
      const res = await api.get<ApiListResponse<RoomApi>>("/rooms", { headers: { Authorization: `Bearer ${token}` } });
      if (res.data.status === 1) setRooms(res.data.data || []);
      else toast.error(res.data.message || "Failed to load rooms.");
    } catch (err: any) { toast.error(parseApiError(err)); }
    finally { setLoadingRooms(false); }
  };

  const fetchBookings = async () => {
    try {
      setLoadingBookings(true);
      const res = await api.get<ApiListResponse<RommBookingApi>>("/room-bookings", { headers: { Authorization: `Bearer ${token}` } });
      if (res.data.status === 1) setBookings((res.data.data || []).map(mapApiToUi));
      else toast.error(res.data.message || "Failed to load bookings.");
    } catch (err: any) { toast.error(parseApiError(err)); }
    finally { setLoadingBookings(false); }
  };

  useEffect(() => { fetchRooms(); fetchBookings(); /* eslint-disable-next-line */ }, []);

  /** ── Filtered + paginated ── */
  const filteredBookings = useMemo(() =>
    bookings.filter((b) => {
      const matchesSearch =
        b.eventName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.room.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.organiser.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch &&
        (filterRoom      === "all" || b.room      === filterRoom) &&
        (filterEventType === "all" || b.eventType === filterEventType) &&
        (filterStatus    === "all" || b.status    === filterStatus);
    }),
    [bookings, searchQuery, filterRoom, filterEventType, filterStatus]);

  const totalItems = filteredBookings.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const safePage   = Math.min(currentPage, totalPages);

  useEffect(() => { if (currentPage > totalPages) setCurrentPage(totalPages); }, [totalPages, currentPage]);

  const paginatedBookings = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filteredBookings.slice(start, start + PAGE_SIZE);
  }, [filteredBookings, safePage]);

  /** ── Stats ── */
  const todayBookings    = useMemo(() => bookings.filter((b) => b.date.toDateString() === new Date().toDateString() && b.status === "approved").length, [bookings]);
  const upcomingBookings = useMemo(() => bookings.filter((b) => b.date > new Date() && b.status === "approved").length, [bookings]);
  const pendingRequests  = useMemo(() => bookings.filter((b) => b.status === "pending").length, [bookings]);

  /** ── Open form ── */
  const openNewForm = () => {
    setModalError("");
    setEditingBooking(null);
    setFormData(EMPTY_FORM);
    setIsFormModalOpen(true);
  };

  const openEditForm = (b: RoomBooking) => {
    setModalError("");
    setEditingBooking(b);
    setFormData({
      event_name: b.eventName, event_type: b.eventType,
      room_id: b.roomObj ? String(b.roomObj.id) : "",
      booking_date: b.date.toISOString().slice(0, 10),
      start_time: b.startTime, end_time: b.endTime,
      organiser_name: b.organiser, organiser_email: b.organiserEmail || "",
      notifications: b.notifications, description: b.description || "",
      capacity_needed: b.capacityNeeded ? String(b.capacityNeeded) : "",
      notes: b.notes || "", email_message: b.emailMessage || "",
      equipment: b.equipment || [], equipment_input: "",
    });
    setIsFormModalOpen(true);
    setIsDetailModalOpen(false);
  };

  /** ── Save ── */
  const handleSave = async () => {
    setModalError("");
    if (!formData.event_name.trim()) { setModalError("Event name is required."); return; }
    if (!formData.room_id)           { setModalError("Please select a room."); return; }
    if (!formData.booking_date)      { setModalError("Please select a date."); return; }
    if (!formData.organiser_name.trim()) { setModalError("Organiser name is required."); return; }
    if (formData.end_time <= formData.start_time) { setModalError("End time must be after start time."); return; }

    const payload = {
      event_name: formData.event_name.trim(),
      event_type: formData.event_type,
      room_id: Number(formData.room_id),
      booking_date: formData.booking_date,
      start_time: formData.start_time,
      end_time: formData.end_time,
      organiser_name: formData.organiser_name.trim(),
      ...(formData.organiser_email && { organiser_email: formData.organiser_email }),
      notifications: formData.notifications,
      ...(formData.description && { description: formData.description }),
      ...(formData.capacity_needed && { capacity_needed: Number(formData.capacity_needed) }),
      ...(formData.notes && { notes: formData.notes }),
      ...(formData.email_message && { email_message: formData.email_message }),
      ...(formData.equipment.length > 0 && { equipment: formData.equipment }),
    };

    setSaving(true);
    try {
      const res = await api.request<ApiSingleResponse<RommBookingApi>>({
        url: editingBooking ? `/room-bookings/${editingBooking.id}` : `/room-bookings`,
        method: editingBooking ? "put" : "post",
        data: payload,
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.status === 1) {
        const saved = mapApiToUi(res.data.data);
        setBookings((prev) =>
          editingBooking ? prev.map((b) => (b.id === editingBooking.id ? saved : b)) : [saved, ...prev]
        );
        if (!editingBooking) setCurrentPage(1);
        setIsFormModalOpen(false);
        toast.success(editingBooking ? "Booking updated." : "Booking created.");
      } else {
        setModalError(res.data.message || "Failed to save booking.");
      }
    } catch (err: any) {
      setModalError(parseApiError(err));
    } finally { setSaving(false); }
  };

  /** ── Approve / Reject ── */
  const approveBooking = async (id: string) => {
    try {
      const res = await api.post<ApiSingleResponse<RommBookingApi>>(`/room-bookings/${id}/approve`, {}, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data.status === 1) {
        setBookings((prev) => prev.map((b) => (b.id === id ? mapApiToUi(res.data.data) : b)));
        setIsDetailModalOpen(false);
        toast.success("Booking approved.");
      } else { toast.error(res.data.message || "Failed to approve."); }
    } catch (err: any) { toast.error(parseApiError(err)); }
  };

  const rejectBooking = async (id: string) => {
    try {
      const res = await api.post<ApiSingleResponse<RommBookingApi>>(`/room-bookings/${id}/reject`, {}, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data.status === 1) {
        setBookings((prev) => prev.map((b) => (b.id === id ? mapApiToUi(res.data.data) : b)));
        setIsDetailModalOpen(false);
        toast.success("Booking rejected.");
      } else { toast.error(res.data.message || "Failed to reject."); }
    } catch (err: any) { toast.error(parseApiError(err)); }
  };

  /** ── Delete ── */
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await api.delete<{ status: number; message: string }>(`/room-bookings/${deleteTarget}`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data.status === 1) {
        setBookings((prev) => {
          const updated = prev.filter((b) => b.id !== deleteTarget);
          const newLast = Math.max(1, Math.ceil(updated.length / PAGE_SIZE));
          if (safePage > newLast) setCurrentPage(newLast);
          return updated;
        });
        setIsDetailModalOpen(false);
        setIsDeleteOpen(false);
        setDeleteTarget(null);
        toast.success("Booking deleted.");
      } else { toast.error(res.data.message || "Failed to delete."); }
    } catch (err: any) { toast.error(parseApiError(err)); }
    finally { setDeleting(false); }
  };

  const hasFilters = searchQuery || filterRoom !== "all" || filterEventType !== "all" || filterStatus !== "all";

  /** ── Form fields (function, not component — prevents focus loss) ── */
  const renderFormFields = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="md:col-span-2">
        <label className="text-sm text-body block mb-1.5">Event Name *</label>
        <input type="text" value={formData.event_name}
          onChange={(e) => setFormData((p) => ({ ...p, event_name: e.target.value }))}
          placeholder="e.g. Department Workshop"
          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue text-sm" />
      </div>

      <div>
        <label className="text-sm text-body block mb-1.5">Event Type *</label>
        <select value={formData.event_type} onChange={(e) => setFormData((p) => ({ ...p, event_type: e.target.value as EventType }))}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue text-sm cursor-pointer">
          <option value="meeting">Meeting</option>
          <option value="workshop">Workshop</option>
          <option value="bootcamp">Bootcamp</option>
          <option value="external">External Event</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div>
        <label className="text-sm text-body block mb-1.5">Room *</label>
        <select value={formData.room_id} onChange={(e) => setFormData((p) => ({ ...p, room_id: e.target.value }))}
          disabled={loadingRooms}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue text-sm cursor-pointer disabled:opacity-50">
          <option value="">{loadingRooms ? "Loading…" : "Select Room"}</option>
          {rooms.map((r) => <option key={r.id} value={String(r.id)}>{r.room_name} (Cap: {r.capacity})</option>)}
        </select>
      </div>

      <div>
        <label className="text-sm text-body block mb-1.5">Date *</label>
        <input type="date" value={formData.booking_date}
          onChange={(e) => setFormData((p) => ({ ...p, booking_date: e.target.value }))}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue text-sm" />
      </div>

      <div>
        <label className="text-sm text-body block mb-1.5">Notifications</label>
        <select value={formData.notifications} onChange={(e) => setFormData((p) => ({ ...p, notifications: e.target.value as Notifications }))}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue text-sm cursor-pointer">
          <option value="none">None</option>
          <option value="all-staff">All Staff</option>
          <option value="selected-staff">Selected Staff</option>
        </select>
      </div>

      <div>
        <label className="text-sm text-body block mb-1.5">Start Time *</label>
        <input type="time" value={formData.start_time}
          onChange={(e) => setFormData((p) => ({ ...p, start_time: e.target.value }))}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue text-sm" />
      </div>

      <div>
        <label className="text-sm text-body block mb-1.5">End Time *</label>
        <input type="time" value={formData.end_time}
          onChange={(e) => setFormData((p) => ({ ...p, end_time: e.target.value }))}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue text-sm" />
      </div>

      <div>
        <label className="text-sm text-body block mb-1.5">Organiser Name *</label>
        <input type="text" value={formData.organiser_name}
          onChange={(e) => setFormData((p) => ({ ...p, organiser_name: e.target.value }))}
          placeholder="Full name"
          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue text-sm" />
      </div>

      <div>
        <label className="text-sm text-body block mb-1.5">Organiser Email</label>
        <input type="email" value={formData.organiser_email}
          onChange={(e) => setFormData((p) => ({ ...p, organiser_email: e.target.value }))}
          placeholder="email@example.com"
          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue text-sm" />
      </div>

      <div>
        <label className="text-sm text-body block mb-1.5">Capacity Needed</label>
        <input type="number" min={0} value={formData.capacity_needed}
          onChange={(e) => setFormData((p) => ({ ...p, capacity_needed: e.target.value }))}
          placeholder="0"
          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue text-sm" />
      </div>

      <div className="md:col-span-2">
        <label className="text-sm text-body block mb-1.5">Description</label>
        <textarea value={formData.description}
          onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
          rows={2} placeholder="Brief description of the event…"
          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue text-sm resize-none" />
      </div>

      <div className="md:col-span-2">
        <label className="text-sm text-body block mb-1.5">Equipment Needed</label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={formData.equipment_input}
            onChange={(e) => setFormData((p) => ({ ...p, equipment_input: e.target.value }))}
            onKeyDown={(e) => {
              if ((e.key === "Enter" || e.key === ",") && formData.equipment_input.trim()) {
                e.preventDefault();
                const tag = formData.equipment_input.trim();
                if (!formData.equipment.includes(tag)) {
                  setFormData((p) => ({ ...p, equipment: [...p.equipment, tag], equipment_input: "" }));
                } else {
                  setFormData((p) => ({ ...p, equipment_input: "" }));
                }
              }
            }}
            placeholder="Type item and press Enter or comma…"
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue text-sm"
          />
          <button
            type="button"
            onClick={() => {
              const tag = formData.equipment_input.trim();
              if (tag && !formData.equipment.includes(tag)) {
                setFormData((p) => ({ ...p, equipment: [...p.equipment, tag], equipment_input: "" }));
              }
            }}
            className="px-4 py-2.5 bg-soft border border-gray-300 rounded-xl text-sm text-body hover:bg-gray-200 transition-colors cursor-pointer">
            Add
          </button>
        </div>
        {formData.equipment.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {formData.equipment.map((item, idx) => (
              <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-primary-blue text-xs rounded-full border border-blue-200">
                {item}
                <button
                  type="button"
                  onClick={() => setFormData((p) => ({ ...p, equipment: p.equipment.filter((_, i) => i !== idx) }))}
                  className="hover:text-red-500 transition-colors cursor-pointer leading-none">
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="md:col-span-2">
        <label className="text-sm text-body block mb-1.5">Admin Notes</label>
        <textarea value={formData.notes}
          onChange={(e) => setFormData((p) => ({ ...p, notes: e.target.value }))}
          rows={2} placeholder="Internal notes…"
          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue text-sm resize-none" />
      </div>
    </div>
  );

  /** ========================= Render ========================= */
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-primary-blue mb-1">Room Bookings & Events</h1>
          <p className="text-body text-sm">Manage non-classroom bookings and special events</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1 p-1 bg-white border border-light rounded-xl shadow-card">
            <button onClick={() => setViewMode("table")}
              className={`px-4 py-2 rounded-lg text-sm transition-all cursor-pointer select-none ${viewMode === "table" ? "bg-primary-blue text-white shadow-sm" : "text-body hover:bg-soft"}`}>
              Table
            </button>
            <button onClick={() => setViewMode("calendar")}
              className={`px-4 py-2 rounded-lg text-sm transition-all cursor-pointer select-none ${viewMode === "calendar" ? "bg-primary-blue text-white shadow-sm" : "text-body hover:bg-soft"}`}>
              Calendar
            </button>
          </div>
          <button onClick={openNewForm}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary-blue text-white rounded-xl hover:opacity-90 active:scale-[0.97] active:opacity-80 transition-all duration-150 shadow-md select-none cursor-pointer text-sm">
            <Plus className="w-4 h-4" />New Booking
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Today's Bookings", value: todayBookings,    icon: <Calendar className="w-5 h-5 text-primary-blue" />, iconBg: "bg-blue-50" },
          { label: "Upcoming Events",  value: upcomingBookings, icon: <CalendarDays className="w-5 h-5 text-green-600" />, iconBg: "bg-green-50" },
          { label: "Pending Requests", value: pendingRequests,  icon: <Clock className="w-5 h-5 text-orange-600" />, iconBg: "bg-orange-50" },
        ].map(({ label, value, icon, iconBg }) => (
          <div key={label} className="bg-white rounded-lg shadow-card p-5 border border-light flex items-center justify-between">
            <div>
              <p className="text-sm text-body mb-1">{label}</p>
              {loadingBookings
                ? <div className="h-9 w-10 rounded bg-gray-200 animate-pulse mt-1" />
                : <p className="text-3xl text-dark font-bold">{value}</p>}
            </div>
            <div className={`${iconBg} p-3 rounded-xl`}>{icon}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 border border-light shadow-card">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input type="text" placeholder="Search by event, room, or organiser…"
              value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent text-sm" />
          </div>
          <div className="flex gap-2 flex-wrap sm:flex-nowrap">
            <select value={filterRoom} onChange={(e) => setFilterRoom(e.target.value)} disabled={loadingRooms}
              className="flex-1 min-w-[120px] px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue bg-white text-body text-sm disabled:opacity-50 cursor-pointer">
              <option value="all">{loadingRooms ? "Loading…" : "All Rooms"}</option>
              {rooms.map((r) => <option key={r.id} value={r.room_name}>{r.room_name}</option>)}
            </select>
            <select value={filterEventType} onChange={(e) => setFilterEventType(e.target.value)}
              className="flex-1 min-w-[120px] px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue bg-white text-body text-sm cursor-pointer">
              <option value="all">All Types</option>
              <option value="workshop">Workshop</option>
              <option value="bootcamp">Bootcamp</option>
              <option value="meeting">Meeting</option>
              <option value="external">External</option>
              <option value="other">Other</option>
            </select>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
              className="flex-1 min-w-[110px] px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue bg-white text-body text-sm cursor-pointer">
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            {hasFilters && (
              <button onClick={() => { setSearchQuery(""); setFilterRoom("all"); setFilterEventType("all"); setFilterStatus("all"); }}
                className="px-3 py-2.5 border border-gray-300 rounded-xl hover:bg-soft text-body text-sm flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap">
                <X className="w-3.5 h-3.5" />Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table / Calendar */}
      {viewMode === "table" ? (
        <div className="bg-white rounded-xl shadow-card border border-light overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-soft">
                <tr>
                  {["Event Name","Type","Room","Date","Time","Organiser","Status","Notifications","Actions"].map((h) => (
                    <th key={h} className="px-5 py-4 text-left text-sm text-body font-medium whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loadingBookings ? (
                  Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                ) : paginatedBookings.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center text-body">
                      <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      No bookings found
                    </td>
                  </tr>
                ) : (
                  paginatedBookings.map((booking, index) => (
                    <tr key={booking.id}
                      className={`border-t border-light hover:bg-soft transition-colors ${index % 2 === 0 ? "bg-white" : "bg-[#FAFAFA]"}`}>
                      <td className="px-5 py-4">
                        <p className="text-sm font-medium text-dark">{booking.eventName}</p>
                        {booking.department !== "—" && <p className="text-xs text-body">{booking.department}</p>}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${eventTypeColors[booking.eventType].bg} ${eventTypeColors[booking.eventType].text} ${eventTypeColors[booking.eventType].border}`}>
                          {booking.eventType.charAt(0).toUpperCase() + booking.eventType.slice(1)}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-dark whitespace-nowrap">{booking.room}</td>
                      <td className="px-5 py-4 text-sm text-dark whitespace-nowrap">
                        {booking.date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </td>
                      <td className="px-5 py-4 text-sm text-body whitespace-nowrap">{booking.startTime} – {booking.endTime}</td>
                      <td className="px-5 py-4 text-sm text-dark whitespace-nowrap">{booking.organiser}</td>
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${statusColors[booking.status].bg} ${statusColors[booking.status].text} ${statusColors[booking.status].border}`}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xs text-body whitespace-nowrap">
                        {booking.notifications === "all-staff" ? "All Staff" : booking.notifications === "selected-staff" ? "Selected" : "None"}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => { setSelectedBooking(booking); setIsDetailModalOpen(true); }} title="View"
                            className="p-1.5 text-primary-blue hover:bg-blue-50 active:scale-95 rounded-lg transition-all duration-100 cursor-pointer">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button onClick={() => openEditForm(booking)} title="Edit"
                            className="p-1.5 text-sky-blue hover:bg-blue-50 active:scale-95 rounded-lg transition-all duration-100 cursor-pointer">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => { setDeleteTarget(booking.id); setIsDeleteOpen(true); }} title="Delete"
                            className="p-1.5 text-red-500 hover:bg-red-50 active:scale-95 rounded-lg transition-all duration-100 cursor-pointer">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <PaginationBar currentPage={safePage} totalPages={totalPages} totalItems={totalItems} onPageChange={setCurrentPage} />
        </div>
      ) : (
        <CalendarView bookings={filteredBookings} onViewBooking={(b) => { setSelectedBooking(b); setIsDetailModalOpen(true); }} />
      )}

      {/* ── Add / Edit Modal ── */}
      {isFormModalOpen && (
        <>
          <div className="fixed inset-0 bg-white/40 backdrop-blur-sm z-50" onClick={() => !saving && setIsFormModalOpen(false)} />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col">
              <div className="border-b border-light px-6 py-4 flex items-center justify-between">
                <h2 className="text-primary-blue">{editingBooking ? "Edit Booking" : "New Booking"}</h2>
                <button onClick={() => setIsFormModalOpen(false)} disabled={saving}
                  className="p-2 hover:bg-soft rounded-lg transition-colors cursor-pointer">
                  <X className="w-5 h-5 text-body" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto flex-1">
                {modalError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{modalError}</div>
                )}
                {renderFormFields()}
              </div>
              <div className="px-6 py-4 border-t border-light flex gap-3">
                <button onClick={handleSave} disabled={saving}
                  className="flex-1 py-3 bg-primary-blue text-white rounded-xl hover:opacity-90 active:opacity-80 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-150 font-medium cursor-pointer">
                  {saving
                    ? <span className="inline-flex items-center gap-2 justify-center"><Loader2 className="w-4 h-4 animate-spin" />{editingBooking ? "Saving…" : "Creating…"}</span>
                    : editingBooking ? "Save Changes" : "Create Booking"}
                </button>
                <button onClick={() => setIsFormModalOpen(false)} disabled={saving}
                  className="flex-1 py-3 bg-gray-100 text-body rounded-xl hover:bg-gray-200 active:scale-[0.98] transition-all duration-150 font-medium cursor-pointer">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── Detail Modal ── */}
      {isDetailModalOpen && selectedBooking && (
        <BookingDetailModal
          booking={selectedBooking}
          onClose={() => setIsDetailModalOpen(false)}
          onEdit={openEditForm}
          onApprove={approveBooking}
          onReject={rejectBooking}
          onDelete={(id) => { setDeleteTarget(id); setIsDetailModalOpen(false); setIsDeleteOpen(true); }}
        />
      )}

      {/* ── Delete Confirm Modal ── */}
      {isDeleteOpen && (
        <>
          <div className="fixed inset-0 bg-white/40 backdrop-blur-sm z-50" onClick={() => !deleting && setIsDeleteOpen(false)} />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
              <div className="p-6">
                <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-6 h-6 text-red-500" />
                </div>
                <h3 className="text-dark font-semibold text-center mb-2">Delete Booking</h3>
                <p className="text-body text-sm text-center mb-6">
                  Are you sure you want to delete this booking? This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button onClick={confirmDelete} disabled={deleting}
                    className="flex-1 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-150 font-medium cursor-pointer">
                    {deleting ? <span className="inline-flex items-center gap-2 justify-center"><Loader2 className="w-4 h-4 animate-spin" />Deleting…</span> : "Delete"}
                  </button>
                  <button onClick={() => setIsDeleteOpen(false)} disabled={deleting}
                    className="flex-1 py-3 bg-gray-100 text-body rounded-xl hover:bg-gray-200 active:scale-[0.98] transition-all duration-150 font-medium cursor-pointer">
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/** ========================= Calendar View ========================= */
function CalendarView({ bookings, onViewBooking }: { bookings: RoomBooking[]; onViewBooking: (b: RoomBooking) => void }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const bookingsByDate = bookings.reduce((acc, b) => {
    const key = b.date.toDateString();
    if (!acc[key]) acc[key] = [];
    acc[key].push(b);
    return acc;
  }, {} as Record<string, RoomBooking[]>);

  return (
    <div className="bg-white rounded-xl shadow-card p-6 border border-light">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => { const d = new Date(currentDate); d.setMonth(d.getMonth() - 1); setCurrentDate(d); }}
          className="p-2 hover:bg-soft rounded-lg transition-colors cursor-pointer">
          <ChevronLeft className="w-5 h-5 text-body" />
        </button>
        <h3 className="text-dark font-semibold">
          {currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </h3>
        <button onClick={() => { const d = new Date(currentDate); d.setMonth(d.getMonth() + 1); setCurrentDate(d); }}
          className="p-2 hover:bg-soft rounded-lg transition-colors cursor-pointer">
          <ChevronRight className="w-5 h-5 text-body" />
        </button>
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
                  <div key={booking.id} onClick={() => onViewBooking(booking)}
                    className={`p-3 rounded-lg border cursor-pointer hover:shadow-card transition-all ${eventTypeColors[booking.eventType].bg} ${eventTypeColors[booking.eventType].border}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-dark mb-1">{booking.eventName}</p>
                        <div className="flex items-center gap-3 text-xs text-body flex-wrap">
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{booking.startTime} – {booking.endTime}</span>
                          <span className="flex items-center gap-1"><Building2 className="w-3 h-3" />{booking.room}</span>
                          <span className="flex items-center gap-1"><Users className="w-3 h-3" />{booking.organiser}</span>
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
        {Object.keys(bookingsByDate).length === 0 && (
          <div className="text-center py-12">
            <CalendarDays className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-body">No bookings to display</p>
          </div>
        )}
      </div>
    </div>
  );
}

/** ========================= Detail Modal ========================= */
function BookingDetailModal({ booking, onClose, onEdit, onApprove, onReject, onDelete }: {
  booking: RoomBooking; onClose: () => void;
  onEdit: (b: RoomBooking) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="fixed inset-0 bg-white/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-light flex items-center justify-between sticky top-0 bg-white z-10">
          <h2 className="text-primary-blue">Booking Details</h2>
          <button onClick={onClose} className="p-2 hover:bg-soft rounded-lg transition-colors cursor-pointer">
            <X className="w-5 h-5 text-body" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`px-3 py-1 rounded-lg text-sm font-medium border ${statusColors[booking.status].bg} ${statusColors[booking.status].text} ${statusColors[booking.status].border}`}>
              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
            </span>
            <span className={`px-3 py-1 rounded-lg text-sm font-medium border ${eventTypeColors[booking.eventType].bg} ${eventTypeColors[booking.eventType].text} ${eventTypeColors[booking.eventType].border}`}>
              {booking.eventType.charAt(0).toUpperCase() + booking.eventType.slice(1)}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-soft rounded-lg border border-light md:col-span-2">
              <label className="text-xs text-body mb-1 block">Event Name</label>
              <p className="text-dark font-medium">{booking.eventName}</p>
              {booking.description && <p className="text-sm text-body mt-1">{booking.description}</p>}
            </div>
            <div className="p-4 bg-soft rounded-lg border border-light">
              <label className="text-xs text-body mb-1 block">Organiser</label>
              <p className="text-dark text-sm">{booking.organiser}</p>
              {booking.organiserEmail && <p className="text-xs text-body">{booking.organiserEmail}</p>}
            </div>
            <div className="p-4 bg-soft rounded-lg border border-light">
              <label className="text-xs text-body mb-1 block">Department</label>
              <p className="text-dark text-sm">{booking.department}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Room",            value: booking.room },
              { label: "Capacity Needed", value: String(booking.capacityNeeded ?? "N/A") },
              { label: "Date",            value: booking.date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) },
              { label: "Time",            value: `${booking.startTime} – ${booking.endTime}` },
            ].map(({ label, value }) => (
              <div key={label} className="p-4 bg-soft rounded-lg border border-light">
                <label className="text-xs text-body mb-1 block">{label}</label>
                <p className="text-dark text-sm">{value}</p>
              </div>
            ))}
          </div>

          {booking.equipment?.length ? (
            <div>
              <label className="text-sm text-body mb-2 block">Equipment Needed</label>
              <div className="flex flex-wrap gap-2">
                {booking.equipment.map((item, idx) => (
                  <span key={idx} className="px-3 py-1 bg-soft text-dark text-xs rounded-lg border border-light">{item}</span>
                ))}
              </div>
            </div>
          ) : null}

          <div className="p-4 bg-soft rounded-lg border border-light">
            <label className="text-xs text-body mb-1 block">Notifications</label>
            <p className="text-dark text-sm font-medium">
              {booking.notifications === "all-staff" ? "All Staff" : booking.notifications === "selected-staff" ? "Selected Staff" : "None"}
            </p>
            {booking.selectedStaff?.length ? (
              <div className="flex flex-wrap gap-2 mt-2">
                {booking.selectedStaff.map((staff, idx) => (
                  <span key={idx} className="px-2.5 py-1 bg-blue-50 text-primary-blue text-xs rounded-lg border border-blue-200">{staff}</span>
                ))}
              </div>
            ) : null}
          </div>

          {booking.notes && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-yellow-900 mb-1">Admin Notes</p>
                  <p className="text-sm text-yellow-800">{booking.notes}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-light flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            {booking.status === "pending" && (<>
              <button onClick={() => onApprove(booking.id)}
                className="px-4 py-2.5 bg-green-500 text-white rounded-xl hover:bg-green-600 active:scale-[0.98] transition-all duration-150 flex items-center gap-2 text-sm font-medium cursor-pointer">
                <CheckCircle className="w-4 h-4" />Approve
              </button>
              <button onClick={() => onReject(booking.id)}
                className="px-4 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 active:scale-[0.98] transition-all duration-150 flex items-center gap-2 text-sm font-medium cursor-pointer">
                <XCircle className="w-4 h-4" />Reject
              </button>
            </>)}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => onEdit(booking)}
              className="px-4 py-2.5 text-primary-blue hover:bg-blue-50 active:scale-[0.98] rounded-xl transition-all duration-150 flex items-center gap-2 text-sm cursor-pointer">
              <Edit2 className="w-4 h-4" />Edit
            </button>
            <button onClick={() => onDelete(booking.id)}
              className="px-4 py-2.5 text-red-500 hover:bg-red-50 active:scale-[0.98] rounded-xl transition-all duration-150 text-sm cursor-pointer">
              Cancel Booking
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}