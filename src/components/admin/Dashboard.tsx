import { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";

import {
  Users,
  BookOpen,
  DoorOpen,
  Calendar,
  Clock,
  TrendingUp,
  CalendarDays,
  AlertCircle,
  Building2,
  UserCheck,
} from "lucide-react";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import {
  ApiTeacher,
  ApiSubject,
  ApiRoom,
  ApiTimeTableSession,
  Day,
} from "../../types/timetable";

import {
  getTeachers,
  getSubjects,
  getRooms,
  getTrimesters,
} from "../../services/catalog";
import { getTimeTableSessions } from "../../services/timetable";

/** =========================
 * Trimester type (matches your API)
 * ========================= */
type ApiTrimester = {
  id: number;
  name: string;
  start_date: string; // YYYY-MM-DD
  end_date: string; // YYYY-MM-DD
  status?: "active" | "inactive";
};

/** =========================
 * Room Booking types (matches your backend)
 * ========================= */
type BookingStatus = "pending" | "approved" | "rejected";
type EventType = "workshop" | "bootcamp" | "meeting" | "external" | "other";

type RoomBookingRoomApi = {
  id: number;
  room_name: string;
  capacity: number;
  department?: string | null;
};

type RoomBookingApi = {
  id: number;
  event_name: string;
  event_type: EventType;
  room_id: number;
  room?: RoomBookingRoomApi | null;

  booking_date: string; // "2026-02-15T00:00:00.000000Z" or "2026-02-15"
  start_time: string; // ISO or "09:00:00" or "09:00"
  end_time: string;

  organiser_name: string;
  status: BookingStatus;
};

type ApiListResponse<T> = { status: number; message: string; data: T[] };

/** =========================
 * Constants
 * ========================= */
const DAYS: Day[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const SHORT_DAY: Record<Day, string> = {
  Monday: "Mon",
  Tuesday: "Tue",
  Wednesday: "Wed",
  Thursday: "Thu",
  Friday: "Fri",
  Saturday: "Sat",
  Sunday: "Sun",
};

/** =========================
 * Helpers (dates/times)
 * ========================= */
const toISODate = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const normalizeISO = (v: any) => (v ? String(v).slice(0, 10) : "");

const inDateRange = (dateISO: string, startISO: string, endISO: string) => {
  if (!dateISO || !startISO || !endISO) return false;
  return dateISO >= startISO && dateISO <= endISO;
};

const dayFromDate = (isoDate: string): Day => {
  const [y, m, d] = isoDate.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  const js = dt.getDay(); // 0 Sun ... 6 Sat
  const map: Day[] = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return map[js];
};

function toMinutes(hhmm: string) {
  if (!hhmm) return 0;
  const parts = String(hhmm).trim().slice(0, 5).split(":");
  const h = Number(parts[0] ?? 0);
  const m = Number(parts[1] ?? 0);
  return h * 60 + m;
}

function isRunningLikeLive(session: ApiTimeTableSession, now = new Date()) {
  const cur = now.getHours() * 60 + now.getMinutes();
  const start = toMinutes(session.start_time);
  const end = toMinutes(session.end_time);
  return cur >= start && cur < end;
}

function minutesUntilStart(session: ApiTimeTableSession, now = new Date()) {
  const cur = now.getHours() * 60 + now.getMinutes();
  const start = toMinutes(session.start_time);
  return start - cur;
}

function formatStartsIn(mins: number) {
  if (mins <= 0) return "Now";
  if (mins < 60) return `${mins} mins`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m === 0 ? `${h} hr` : `${h} hr ${m} mins`;
}

/** Count weekday occurrences inside trimester range (inclusive) */
const countWeekdayOccurrences = (startISO: string, endISO: string, weekday: Day) => {
  const [sy, sm, sd] = startISO.split("-").map(Number);
  const [ey, em, ed] = endISO.split("-").map(Number);

  const start = new Date(sy, sm - 1, sd);
  const end = new Date(ey, em - 1, ed);

  const targetIndex = {
    Sunday: 0,
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
  }[weekday];

  let count = 0;
  const cursor = new Date(start);

  while (cursor.getDay() !== targetIndex) {
    cursor.setDate(cursor.getDate() + 1);
    if (cursor > end) return 0;
  }

  while (cursor <= end) {
    count += 1;
    cursor.setDate(cursor.getDate() + 7);
  }

  return count;
};

/** Room booking time normalization */
const timeFromApi = (value: string) => {
  if (!value) return "";
  if (value.includes("T")) {
    const d = new Date(value);
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  }
  return value.slice(0, 5);
};

export default function Dashboard() {
  const token = useMemo(() => localStorage.getItem("token"), []);

  /** Timetable data */
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [teachers, setTeachers] = useState<ApiTeacher[]>([]);
  const [subjects, setSubjects] = useState<ApiSubject[]>([]);
  const [rooms, setRooms] = useState<ApiRoom[]>([]);
  const [sessions, setSessions] = useState<ApiTimeTableSession[]>([]);

  const [trimesters, setTrimesters] = useState<ApiTrimester[]>([]);
  const [selectedTrimesterId, setSelectedTrimesterId] = useState<string>("");

  /** Room booking data */
  const [roomBookings, setRoomBookings] = useState<RoomBookingApi[]>([]);
  const [loadingRoomBookings, setLoadingRoomBookings] = useState(false);

  /** Example user stats (keep if you have real users API later) */
  const totalUsers = 0;
  const activeUsers = 0;

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setErrorMsg("");
      try {
        const [t, s, r, tt, tr] = await Promise.all([
          getTeachers(),
          getSubjects(),
          getRooms(),
          getTimeTableSessions(),
          getTrimesters(),
        ]);

        setTeachers(t.data || []);
        setSubjects(s.data || []);
        setRooms(r.data || []);
        setSessions(tt.data || []);
        setTrimesters(tr.data || []);

        const active = (tr.data || []).find((x: ApiTrimester) => x.status === "active");
        if (active) setSelectedTrimesterId(String(active.id));
        else if ((tr.data || []).length > 0) setSelectedTrimesterId(String((tr.data || [])[0].id));
      } catch (e: any) {
        console.error(e);
        setErrorMsg(e?.response?.data?.message || "Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  useEffect(() => {
    const fetchRoomBookings = async () => {
      if (!token) return;
      setLoadingRoomBookings(true);
      try {
        const res = await api.get<ApiListResponse<RoomBookingApi>>("/room-bookings", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.status === 1) setRoomBookings(res.data.data || []);
      } catch (e) {
        // keep silent or add a message if you want
      } finally {
        setLoadingRoomBookings(false);
      }
    };

    fetchRoomBookings();
  }, [token]);

  const selectedTrimester = useMemo(() => {
    if (!selectedTrimesterId) return null;
    return trimesters.find((t) => String(t.id) === String(selectedTrimesterId)) || null;
  }, [trimesters, selectedTrimesterId]);

  /** today info */
  const todayISO = useMemo(() => toISODate(new Date()), []);
  const todayDay = useMemo(() => dayFromDate(todayISO), [todayISO]);

  /** date sessions inside trimester range */
  const dateSessionsInTrimester = useMemo(() => {
    if (!selectedTrimester) return [];
    const startISO = selectedTrimester.start_date;
    const endISO = selectedTrimester.end_date;

    return (sessions || []).filter((s) => {
      const d = normalizeISO((s as any).date);
      if (!d) return false;
      return inDateRange(d, startISO, endISO);
    });
  }, [sessions, selectedTrimester]);

  /** routine sessions only if today is inside trimester */
  const routineTodaySessions = useMemo(() => {
    if (!selectedTrimester) return [];
    const startISO = selectedTrimester.start_date;
    const endISO = selectedTrimester.end_date;

    if (!inDateRange(todayISO, startISO, endISO)) return [];

    return (sessions || []).filter((s: any) => !normalizeISO(s.date) && s.day === todayDay);
  }, [sessions, selectedTrimester, todayISO, todayDay]);

  /** today classes (prefer date-specific for today, else routine) */
  const todayClasses = useMemo(() => {
    const dateToday = dateSessionsInTrimester.filter((s: any) => normalizeISO(s.date) === todayISO);
    if (dateToday.length > 0) return dateToday;
    return routineTodaySessions;
  }, [dateSessionsInTrimester, routineTodaySessions, todayISO]);

  /** Running now */
  const runningNow = useMemo(() => {
    const now = new Date();
    return todayClasses.filter((x) => isRunningLikeLive(x, now));
  }, [todayClasses]);

  /** Upcoming next hour */
  const upcomingNextHour = useMemo(() => {
    const now = new Date();
    return todayClasses
      .filter((x) => {
        const mins = minutesUntilStart(x, now);
        return mins > 0 && mins <= 60;
      })
      .sort((a, b) => String(a.start_time).localeCompare(String(b.start_time)))
      .slice(0, 6);
  }, [todayClasses]);

  /** Weekly overview (trimester totals) */
  const weeklyData = useMemo(() => {
    if (!selectedTrimester) {
      return DAYS.map((d) => ({ day: SHORT_DAY[d], classes: 0 }));
    }

    const startISO = selectedTrimester.start_date;
    const endISO = selectedTrimester.end_date;

    const counts: Record<Day, number> = {
      Monday: 0,
      Tuesday: 0,
      Wednesday: 0,
      Thursday: 0,
      Friday: 0,
      Saturday: 0,
      Sunday: 0,
    };

    const routine = (sessions || []).filter((s: any) => !normalizeISO(s.date) && s.day);
    routine.forEach((s: any) => {
      const d: Day = s.day;
      const occ = countWeekdayOccurrences(startISO, endISO, d);
      counts[d] += occ;
    });

    dateSessionsInTrimester.forEach((s: any) => {
      const d = dayFromDate(normalizeISO(s.date));
      counts[d] += 1;
    });

    return DAYS.map((d) => ({ day: SHORT_DAY[d], classes: counts[d] || 0 }));
  }, [sessions, selectedTrimester, dateSessionsInTrimester]);

  /** -------- Room bookings: stats + today's list -------- */
  const roomBookingsTodayApproved = useMemo(() => {
    return (roomBookings || [])
      .filter((b) => b.status === "approved" && normalizeISO(b.booking_date) === todayISO)
      .sort((a, b) => timeFromApi(a.start_time).localeCompare(timeFromApi(b.start_time)))
      .slice(0, 6);
  }, [roomBookings, todayISO]);

  const pendingRoomRequests = useMemo(() => {
    return (roomBookings || []).filter((b) => b.status === "pending").length;
  }, [roomBookings]);

  const upcomingApprovedEvents = useMemo(() => {
    const now = new Date();
    const nowTime = now.getTime();
    const in7days = nowTime + 7 * 24 * 60 * 60 * 1000;

    return (roomBookings || [])
      .filter((b) => b.status === "approved")
      .filter((b) => {
        const dt = new Date(`${normalizeISO(b.booking_date)}T00:00:00`);
        const t = dt.getTime();
        return t >= nowTime && t <= in7days;
      })
      .sort((a, b) => {
        const da = normalizeISO(a.booking_date);
        const db = normalizeISO(b.booking_date);
        if (da !== db) return da.localeCompare(db);
        return timeFromApi(a.start_time).localeCompare(timeFromApi(b.start_time));
      })
      .slice(0, 6);
  }, [roomBookings]);

  /** Summary cards */
  const stats = useMemo(() => {
    const classesInTrimester = weeklyData.reduce((sum, x) => sum + Number(x.classes || 0), 0);

    return [
      {
        label: "Total Teachers",
        value: String(teachers.length),
        icon: Users,
        color: "bg-blue-50",
        iconColor: "text-primary-blue",
      },
      {
        label: "Total Subjects",
        value: String(subjects.length),
        icon: BookOpen,
        color: "bg-green-50",
        iconColor: "text-success",
      },
      {
        label: "Total Rooms",
        value: String(rooms.length),
        icon: DoorOpen,
        color: "bg-purple-50",
        iconColor: "text-purple-600",
      },
      {
        label: "Classes (Trimester)",
        value: String(classesInTrimester),
        icon: Calendar,
        color: "bg-orange-50",
        iconColor: "text-orange-600",
      },
      {
        label: "Upcoming Events (7 days)",
        value: String(upcomingApprovedEvents.length),
        icon: CalendarDays,
        color: "bg-indigo-50",
        iconColor: "text-indigo-600",
      },
      {
        label: "Pending Room Requests",
        value: String(pendingRoomRequests),
        icon: AlertCircle,
        color: "bg-yellow-50",
        iconColor: "text-yellow-700",
      },
      {
        label: "Total Users",
        value: String(totalUsers),
        icon: Users,
        color: "bg-cyan-50",
        iconColor: "text-cyan-600",
      },
      {
        label: "Active Users",
        value: String(activeUsers),
        icon: UserCheck,
        color: "bg-teal-50",
        iconColor: "text-teal-600",
      },
    ];
  }, [
    teachers.length,
    subjects.length,
    rooms.length,
    weeklyData,
    upcomingApprovedEvents.length,
    pendingRoomRequests,
    totalUsers,
    activeUsers,
  ]);

  return (
    <div className="space-y-6">
      {/* Header (NO date/trimester line under heading) */}
      <div className="bg-white rounded-2xl shadow-card-lg p-6 border border-light">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl text-dark font-semibold">Dashboard</h1>
            {errorMsg && <p className="text-sm text-red-600 mt-2">{errorMsg}</p>}
          </div>

          {/* Trimester Picker */}
          <div className="bg-white rounded-xl shadow-card border border-light px-4 py-3">
            <label className="block text-xs text-body mb-1">Select Trimester *</label>
            <select
              value={selectedTrimesterId}
              onChange={(e) => setSelectedTrimesterId(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue text-sm"
            >
              <option value="">{loading ? "Loading..." : "Select Trimester"}</option>
              {trimesters.map((t) => (
                <option key={t.id} value={String(t.id)}>
                  {t.name} ({t.start_date} - {t.end_date})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {!selectedTrimester ? (
        <div className="bg-white rounded-xl shadow-card border border-light p-6 text-body">
          Please select a trimester to view dashboard data.
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-2xl shadow-card-lg p-6 border border-light hover-lift transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-body mb-1">{stat.label}</p>
                      <p className="text-3xl text-dark font-bold">{stat.value}</p>
                    </div>
                    <div className={`${stat.color} p-3 rounded-xl`}>
                      <Icon className={`w-6 h-6 ${stat.iconColor}`} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Running Now & Upcoming Next Hour */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Running Now */}
            <div className="bg-white rounded-2xl shadow-card-lg p-6 border border-light">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-green-50 rounded-lg">
                  <Clock className="w-5 h-5 text-success" />
                </div>
                <div>
                  <h3 className="text-lg text-dark font-semibold">Classes Running Now</h3>
                  <p className="text-sm text-body">
                    {inDateRange(todayISO, selectedTrimester.start_date, selectedTrimester.end_date)
                      ? `${runningNow.length} active classes`
                      : "Today is outside this trimester range"}
                  </p>
                </div>
              </div>

              {!inDateRange(todayISO, selectedTrimester.start_date, selectedTrimester.end_date) ? (
                <div className="text-center py-10 bg-soft rounded-xl border border-light">
                  <p className="text-body">No live classes (today is outside the selected trimester).</p>
                </div>
              ) : runningNow.length === 0 ? (
                <div className="text-center py-10 bg-soft rounded-xl border border-light">
                  <p className="text-body">No classes are running right now.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {runningNow.map((cls) => (
                    <div
                      key={cls.id}
                      className="p-4 bg-green-50 rounded-xl border border-green-200"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm text-success font-semibold">
                              {cls.subject?.subject_code || "SUB"}
                            </span>
                            <span className="px-2 py-0.5 bg-success text-white rounded-full text-xs">
                              Live
                            </span>
                          </div>
                          <h4 className="text-dark font-medium mb-1">
                            {cls.subject?.subject_name || "Subject"}
                          </h4>
                          <p className="text-sm text-body">
                            {cls.teacher?.full_name || "Teacher"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-body mt-3 pt-3 border-t border-green-200">
                        <span className="flex items-center gap-1">
                          <DoorOpen className="w-3 h-3" />
                          {cls.room?.room_name || "Room"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {String(cls.start_time).slice(0, 5)} - {String(cls.end_time).slice(0, 5)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {`${cls.enrolled_students ?? 0}/${cls.room?.capacity ?? "-"}`}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Upcoming Next Hour */}
            <div className="bg-white rounded-2xl shadow-card-lg p-6 border border-light">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-primary-blue" />
                </div>
                <div>
                  <h3 className="text-lg text-dark font-semibold">Upcoming Next Hour</h3>
                  <p className="text-sm text-body">
                    {inDateRange(todayISO, selectedTrimester.start_date, selectedTrimester.end_date)
                      ? `${upcomingNextHour.length} classes starting soon`
                      : "Today is outside this trimester range"}
                  </p>
                </div>
              </div>

              {!inDateRange(todayISO, selectedTrimester.start_date, selectedTrimester.end_date) ? (
                <div className="text-center py-10 bg-soft rounded-xl border border-light">
                  <p className="text-body">No upcoming classes (today is outside the selected trimester).</p>
                </div>
              ) : upcomingNextHour.length === 0 ? (
                <div className="text-center py-10 bg-soft rounded-xl border border-light">
                  <p className="text-body">No classes starting within the next hour.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingNextHour.map((cls) => {
                    const mins = minutesUntilStart(cls, new Date());
                    return (
                      <div
                        key={cls.id}
                        className="p-4 bg-soft rounded-xl border border-light hover:border-primary-blue transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm text-primary-blue font-semibold">
                                {cls.subject?.subject_code || "SUB"}
                              </span>
                              <span className="px-2 py-0.5 bg-orange-100 text-orange-600 rounded-full text-xs">
                                Starts in {formatStartsIn(mins)}
                              </span>
                            </div>
                            <h4 className="text-dark font-medium mb-1">
                              {cls.subject?.subject_name || "Subject"}
                            </h4>
                            <p className="text-sm text-body">
                              {cls.teacher?.full_name || "Teacher"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs text-body mt-3 pt-3 border-t border-light">
                          <span className="flex items-center gap-1">
                            <DoorOpen className="w-3 h-3" />
                            {cls.room?.room_name || "Room"}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {String(cls.start_time).slice(0, 5)} - {String(cls.end_time).slice(0, 5)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Weekly Classes Chart (Trimester totals) */}
          <div className="bg-white rounded-2xl shadow-card-lg p-6 border border-light">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-50 rounded-lg">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg text-dark font-semibold">Weekly Classes Overview</h3>
                <p className="text-sm text-body">Total classes by weekday inside selected trimester</p>
              </div>
            </div>

            <div style={{ width: "100%", height: 320, minHeight: 320 }}>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="day" stroke="#374151" style={{ fontSize: "12px" }} />
                  <YAxis stroke="#374151" style={{ fontSize: "12px" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#FFFFFF",
                      border: "1px solid #E5E7EB",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                  <Bar dataKey="classes" fill="#2563EB" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Room Bookings + Events (Today) */}
          <div className="bg-white rounded-2xl shadow-card-lg p-6 border border-light">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-indigo-50 rounded-lg">
                <Building2 className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-lg text-dark font-semibold">Today's Room Bookings</h3>
                <p className="text-sm text-body">
                  {loadingRoomBookings ? "Loading..." : `${roomBookingsTodayApproved.length} approved bookings`}
                </p>
              </div>
            </div>

            {roomBookingsTodayApproved.length === 0 ? (
              <div className="p-4 bg-soft rounded-xl border border-light text-body text-sm">
                No approved room bookings for today.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {roomBookingsTodayApproved.map((b) => (
                  <div
                    key={b.id}
                    className="p-4 bg-indigo-50 rounded-xl border border-indigo-200"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="text-dark font-medium mb-1">{b.event_name}</h4>
                        <p className="text-sm text-body">{b.organiser_name}</p>
                      </div>
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-medium">
                        Approved
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-body pt-3 border-t border-indigo-200">
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3 h-3" />
                        {b.room?.room_name ?? `Room #${b.room_id}`}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {timeFromApi(b.start_time)} - {timeFromApi(b.end_time)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
