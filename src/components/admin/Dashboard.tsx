import { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import { toast } from "sonner";

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
  Loader2,
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

/** ========================= Types ========================= */
type ApiTrimester = {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  status?: "active" | "inactive";
};

type BookingStatus = "pending" | "approved" | "rejected";
type EventType = "workshop" | "bootcamp" | "meeting" | "external" | "other";

type RoomBookingApi = {
  id: number;
  event_name: string;
  event_type: EventType;
  room_id: number;
  room?: { id: number; room_name: string; capacity: number } | null;
  booking_date: string;
  start_time: string;
  end_time: string;
  organiser_name: string;
  status: BookingStatus;
};

type ApiListResponse<T> = { status: number; message: string; data: T[] };

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

/** ========================= Helpers ========================= */
const toISODate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const normalizeISO = (v: any) => (v ? String(v).slice(0, 10) : "");
const inDateRange = (d: string, s: string, e: string) =>
  !!d && !!s && !!e && d >= s && d <= e;
const toMinutes = (t: string) => {
  if (!t) return 0;
  const [h, m] = String(t).trim().slice(0, 5).split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
};
const timeFromApi = (v: string) => {
  if (!v) return "";
  if (v.includes("T")) {
    const d = new Date(v);
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  }
  return v.slice(0, 5);
};

const dayFromDate = (iso: string): Day => {
  const [y, m, d] = iso.split("-").map(Number);
  return (
    [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ] as Day[]
  )[new Date(y, m - 1, d).getDay()];
};

const countWeekdayOccurrences = (
  startISO: string,
  endISO: string,
  weekday: Day,
) => {
  const [sy, sm, sd] = startISO.split("-").map(Number);
  const [ey, em, ed] = endISO.split("-").map(Number);
  const start = new Date(sy, sm - 1, sd),
    end = new Date(ey, em - 1, ed);
  const idx = {
    Sunday: 0,
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
  }[weekday];
  const cursor = new Date(start);
  while (cursor.getDay() !== idx) {
    cursor.setDate(cursor.getDate() + 1);
    if (cursor > end) return 0;
  }
  let count = 0;
  while (cursor <= end) {
    count++;
    cursor.setDate(cursor.getDate() + 7);
  }
  return count;
};

const isRunningNow = (s: ApiTimeTableSession) => {
  const cur = new Date().getHours() * 60 + new Date().getMinutes();
  return cur >= toMinutes(s.start_time) && cur < toMinutes(s.end_time);
};

const minsUntilStart = (s: ApiTimeTableSession) =>
  toMinutes(s.start_time) -
  (new Date().getHours() * 60 + new Date().getMinutes());
const formatStartsIn = (m: number) =>
  m <= 0
    ? "Now"
    : m < 60
      ? `${m}m`
      : `${Math.floor(m / 60)}h ${m % 60 ? `${m % 60}m` : ""}`.trim();

/** ========================= Skeletons ========================= */
function StatSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-card p-5 border border-light">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-3.5 w-28 rounded bg-gray-200 animate-pulse" />
          <div className="h-8 w-14 rounded bg-gray-200 animate-pulse" />
        </div>
        <div className="w-10 h-10 rounded-lg bg-gray-200 animate-pulse" />
      </div>
    </div>
  );
}

function ClassCardSkeleton() {
  return (
    <div className="p-4 bg-soft rounded-xl border border-light space-y-3">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="h-3.5 w-20 rounded bg-gray-200 animate-pulse" />
          <div className="h-4 w-40 rounded bg-gray-200 animate-pulse" />
          <div className="h-3.5 w-28 rounded bg-gray-200 animate-pulse" />
        </div>
        <div className="h-5 w-12 rounded-full bg-gray-200 animate-pulse" />
      </div>
      <div className="flex justify-between pt-2 border-t border-light">
        <div className="h-3 w-20 rounded bg-gray-200 animate-pulse" />
        <div className="h-3 w-20 rounded bg-gray-200 animate-pulse" />
      </div>
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="w-full h-56 rounded-xl bg-gray-50 border border-light animate-pulse" />
  );
}

/** ========================= Main ========================= */
export default function Dashboard() {
  const token = useMemo(() => localStorage.getItem("token"), []);

  const [loading, setLoading] = useState(true);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [teachers, setTeachers] = useState<ApiTeacher[]>([]);
  const [subjects, setSubjects] = useState<ApiSubject[]>([]);
  const [rooms, setRooms] = useState<ApiRoom[]>([]);
  const [sessions, setSessions] = useState<ApiTimeTableSession[]>([]);
  const [trimesters, setTrimesters] = useState<ApiTrimester[]>([]);
  const [selectedTrimesterId, setSelectedTrimesterId] = useState<string>("");
  const [roomBookings, setRoomBookings] = useState<RoomBookingApi[]>([]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
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

        const list = tr.data || [];
        const active = list.find((x: ApiTrimester) => x.status === "active");
        const pick = active || list[0];
        if (pick) setSelectedTrimesterId(String(pick.id));
      } catch (e: any) {
        toast.error(
          e?.response?.data?.message || "Failed to load dashboard data.",
        );
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        setLoadingBookings(true);
        const res = await api.get<ApiListResponse<RoomBookingApi>>(
          "/room-bookings",
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        if (res.data.status === 1) setRoomBookings(res.data.data || []);
      } catch {
        /* silent */
      } finally {
        setLoadingBookings(false);
      }
    })();
  }, [token]);

  /** ── Derived ── */
  const selectedTrimester = useMemo(
    () =>
      trimesters.find((t) => String(t.id) === String(selectedTrimesterId)) ||
      null,
    [trimesters, selectedTrimesterId],
  );

  const todayISO = useMemo(() => toISODate(new Date()), []);
  const todayDay = useMemo(() => dayFromDate(todayISO), [todayISO]);

  const daysRemaining = useMemo(() => {
    if (!selectedTrimester) return null;
    return Math.max(
      0,
      Math.ceil(
        (new Date(`${selectedTrimester.end_date}T23:59:59`).getTime() -
          Date.now()) /
          86400000,
      ),
    );
  }, [selectedTrimester]);

  const dateSessionsInTrimester = useMemo(() => {
    if (!selectedTrimester) return [];
    return (sessions || []).filter((s: any) => {
      const d = normalizeISO(s.date);
      return (
        d &&
        inDateRange(d, selectedTrimester.start_date, selectedTrimester.end_date)
      );
    });
  }, [sessions, selectedTrimester]);

  const routineTodaySessions = useMemo(() => {
    if (
      !selectedTrimester ||
      !inDateRange(
        todayISO,
        selectedTrimester.start_date,
        selectedTrimester.end_date,
      )
    )
      return [];
    return (sessions || []).filter(
      (s: any) => !normalizeISO(s.date) && s.day === todayDay,
    );
  }, [sessions, selectedTrimester, todayISO, todayDay]);

  const todayClasses = useMemo(() => {
    const dateToday = dateSessionsInTrimester.filter(
      (s: any) => normalizeISO(s.date) === todayISO,
    );
    return dateToday.length > 0 ? dateToday : routineTodaySessions;
  }, [dateSessionsInTrimester, routineTodaySessions, todayISO]);

  const runningNow = useMemo(
    () => todayClasses.filter((x) => isRunningNow(x)),
    [todayClasses],
  );
  const upcomingNextHour = useMemo(
    () =>
      todayClasses
        .filter((x) => {
          const m = minsUntilStart(x);
          return m > 0 && m <= 60;
        })
        .sort((a, b) =>
          String(a.start_time).localeCompare(String(b.start_time)),
        )
        .slice(0, 5),
    [todayClasses],
  );

  const weeklyData = useMemo(() => {
    if (!selectedTrimester)
      return DAYS.map((d) => ({ day: SHORT_DAY[d], classes: 0 }));
    const { start_date: s, end_date: e } = selectedTrimester;
    const counts: Record<Day, number> = {
      Monday: 0,
      Tuesday: 0,
      Wednesday: 0,
      Thursday: 0,
      Friday: 0,
      Saturday: 0,
      Sunday: 0,
    };
    (sessions || [])
      .filter((x: any) => !normalizeISO(x.date) && x.day)
      .forEach((x: any) => {
        counts[x.day as Day] += countWeekdayOccurrences(s, e, x.day as Day);
      });
    dateSessionsInTrimester.forEach((x: any) => {
      counts[dayFromDate(normalizeISO(x.date))] += 1;
    });
    return DAYS.map((d) => ({ day: SHORT_DAY[d], classes: counts[d] || 0 }));
  }, [sessions, selectedTrimester, dateSessionsInTrimester]);

  const roomBookingsTodayApproved = useMemo(
    () =>
      (roomBookings || [])
        .filter(
          (b) =>
            b.status === "approved" &&
            normalizeISO(b.booking_date) === todayISO,
        )
        .sort((a, b) =>
          timeFromApi(a.start_time).localeCompare(timeFromApi(b.start_time)),
        )
        .slice(0, 6),
    [roomBookings, todayISO],
  );

  const pendingRequests = useMemo(
    () => (roomBookings || []).filter((b) => b.status === "pending").length,
    [roomBookings],
  );

  const upcomingApprovedEvents = useMemo(() => {
    const now = Date.now(),
      in7 = now + 7 * 86400000;
    return (roomBookings || [])
      .filter(
        (b) =>
          b.status === "approved" &&
          (() => {
            const t = new Date(
              `${normalizeISO(b.booking_date)}T00:00:00`,
            ).getTime();
            return t >= now && t <= in7;
          })(),
      )
      .slice(0, 6);
  }, [roomBookings]);

  const totalClasses = weeklyData.reduce(
    (s, x) => s + Number(x.classes || 0),
    0,
  );

  const stats = [
    {
      label: "Teachers",
      value: loading ? "—" : teachers.length,
      icon: Users,
      bg: "bg-blue-50",
      color: "text-primary-blue",
    },
    {
      label: "Subjects",
      value: loading ? "—" : subjects.length,
      icon: BookOpen,
      bg: "bg-green-50",
      color: "text-green-600",
    },
    {
      label: "Rooms",
      value: loading ? "—" : rooms.length,
      icon: DoorOpen,
      bg: "bg-purple-50",
      color: "text-purple-600",
    },
    {
      label: "Classes (Trimester)",
      value: loading ? "—" : totalClasses,
      icon: Calendar,
      bg: "bg-orange-50",
      color: "text-orange-600",
    },
    {
      label: "Upcoming Events",
      value: loadingBookings ? "—" : upcomingApprovedEvents.length,
      icon: CalendarDays,
      bg: "bg-indigo-50",
      color: "text-indigo-600",
    },
    {
      label: "Pending Requests",
      value: loadingBookings ? "—" : pendingRequests,
      icon: AlertCircle,
      bg: "bg-yellow-50",
      color: "text-yellow-700",
    },
    {
      label: "Total Users",
      value: 0,
      icon: Users,
      bg: "bg-cyan-50",
      color: "text-cyan-600",
    },
    {
      label: "Active Users",
      value: 0,
      icon: UserCheck,
      bg: "bg-teal-50",
      color: "text-teal-600",
    },
  ];

  const todayInTrimester = selectedTrimester
    ? inDateRange(
        todayISO,
        selectedTrimester.start_date,
        selectedTrimester.end_date,
      )
    : false;

  /** ========================= Render ========================= */
  return (
    <div className="space-y-5">
      {/* ── Banner ── */}
      <div className="bg-primary-blue rounded-xl p-5 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-xl flex-shrink-0">
              <CalendarDays className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-semibold text-white">
                  {loading
                    ? "Loading…"
                    : selectedTrimester?.name || "No Trimester Selected"}
                </h2>
                {selectedTrimester && (
                  <span className="px-2.5 py-0.5 bg-white/20 rounded-full text-xs">
                    {selectedTrimester.start_date} →{" "}
                    {selectedTrimester.end_date}
                  </span>
                )}
              </div>
              <p className="text-white/70 text-xs mt-0.5">
                {selectedTrimester
                  ? `${daysRemaining} days remaining`
                  : "Select a trimester below to view data"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {loading && (
              <Loader2 className="w-4 h-4 text-white/60 animate-spin flex-shrink-0" />
            )}
            <select
              value={selectedTrimesterId}
              onChange={(e) => setSelectedTrimesterId(e.target.value)}
              className="px-3 py-2 border border-white/20 bg-white/10 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-white/40 text-sm cursor-pointer"
            >
              <option value="" className="text-dark">
                {loading ? "Loading…" : "Select Trimester"}
              </option>
              {trimesters.map((t) => (
                <option key={t.id} value={String(t.id)} className="text-dark">
                  {t.name} ({t.start_date} – {t.end_date})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {loading
          ? Array.from({ length: 8 }).map((_, i) => <StatSkeleton key={i} />)
          : stats.map(({ label, value, icon: Icon, bg, color }) => (
              <div
                key={label}
                className="bg-white rounded-xl shadow-card p-4 border border-light"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-body mb-1">{label}</p>
                    <p className={`text-2xl font-bold ${color}`}>{value}</p>
                  </div>
                  <div className={`${bg} p-2.5 rounded-lg`}>
                    <Icon className={`w-5 h-5 ${color}`} />
                  </div>
                </div>
              </div>
            ))}
      </div>

      {!loading && !selectedTrimester ? (
        <div className="bg-white rounded-xl shadow-card border border-light p-8 text-center text-body">
          Please select a trimester to view dashboard data.
        </div>
      ) : (
        <>
          {/* ── Running now + Upcoming ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Running now */}
            <div className="bg-white rounded-xl shadow-card p-5 border border-light">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="p-2 bg-green-50 rounded-lg">
                  <Clock className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <h3 className="text-dark font-semibold text-sm">
                    Classes Running Now
                  </h3>
                  <p className="text-xs text-body">
                    {loading
                      ? "Loading…"
                      : todayInTrimester
                        ? `${runningNow.length} active`
                        : "Outside trimester range"}
                  </p>
                </div>
              </div>

              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <ClassCardSkeleton key={i} />
                  ))}
                </div>
              ) : !todayInTrimester ? (
                <div className="text-center py-8 text-body text-sm bg-soft rounded-xl border border-light">
                  Today is outside the selected trimester.
                </div>
              ) : runningNow.length === 0 ? (
                <div className="text-center py-8 text-body text-sm bg-soft rounded-xl border border-light">
                  No classes running right now.
                </div>
              ) : (
                <div className="space-y-3">
                  {runningNow.map((cls) => (
                    <div
                      key={cls.id}
                      className="p-4 bg-green-50 rounded-xl border border-green-200"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold text-green-700">
                              {cls.subject?.subject_code || "SUB"}
                            </span>
                            <span className="px-2 py-0.5 bg-green-500 text-white rounded-full text-xs">
                              Live
                            </span>
                          </div>
                          <p className="text-sm font-medium text-dark">
                            {cls.subject?.subject_name || "Subject"}
                          </p>
                          <p className="text-xs text-body">
                            {cls.teacher?.full_name || "Teacher"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-body pt-2.5 border-t border-green-200">
                        <span className="flex items-center gap-1">
                          <DoorOpen className="w-3 h-3" />
                          {cls.room?.room_name || "Room"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {String(cls.start_time).slice(0, 5)} –{" "}
                          {String(cls.end_time).slice(0, 5)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {cls.enrolled_students ?? 0}/
                          {cls.room?.capacity ?? "—"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Upcoming next hour */}
            <div className="bg-white rounded-xl shadow-card p-5 border border-light">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Calendar className="w-4 h-4 text-primary-blue" />
                </div>
                <div>
                  <h3 className="text-dark font-semibold text-sm">
                    Upcoming Next Hour
                  </h3>
                  <p className="text-xs text-body">
                    {loading
                      ? "Loading…"
                      : todayInTrimester
                        ? `${upcomingNextHour.length} starting soon`
                        : "Outside trimester range"}
                  </p>
                </div>
              </div>

              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <ClassCardSkeleton key={i} />
                  ))}
                </div>
              ) : !todayInTrimester ? (
                <div className="text-center py-8 text-body text-sm bg-soft rounded-xl border border-light">
                  Today is outside the selected trimester.
                </div>
              ) : upcomingNextHour.length === 0 ? (
                <div className="text-center py-8 text-body text-sm bg-soft rounded-xl border border-light">
                  No classes in the next hour.
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingNextHour.map((cls) => {
                    const mins = minsUntilStart(cls);
                    return (
                      <div
                        key={cls.id}
                        className="p-4 bg-soft rounded-xl border border-light hover:border-primary-blue transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-bold text-primary-blue">
                                {cls.subject?.subject_code || "SUB"}
                              </span>
                              <span className="px-2 py-0.5 bg-orange-100 text-orange-600 rounded-full text-xs">
                                In {formatStartsIn(mins)}
                              </span>
                            </div>
                            <p className="text-sm font-medium text-dark">
                              {cls.subject?.subject_name || "Subject"}
                            </p>
                            <p className="text-xs text-body">
                              {cls.teacher?.full_name || "Teacher"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs text-body pt-2.5 border-t border-light">
                          <span className="flex items-center gap-1">
                            <DoorOpen className="w-3 h-3" />
                            {cls.room?.room_name || "Room"}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {String(cls.start_time).slice(0, 5)} –{" "}
                            {String(cls.end_time).slice(0, 5)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* ── Weekly chart ── */}
          <div className="bg-white rounded-xl shadow-card p-5 border border-light">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="p-2 bg-purple-50 rounded-lg">
                <TrendingUp className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <h3 className="text-dark font-semibold text-sm">
                  Weekly Classes
                </h3>
                <p className="text-xs text-body">
                  Trimester total distribution by weekday
                </p>
              </div>
            </div>
            {loading ? (
              <ChartSkeleton />
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  data={weeklyData}
                  margin={{ top: 4, right: 8, left: -16, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#F3F4F6"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="day"
                    stroke="#9CA3AF"
                    tick={{ fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="#9CA3AF"
                    tick={{ fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #E5E7EB",
                      borderRadius: "10px",
                      fontSize: 13,
                    }}
                    cursor={{ fill: "#F9FAFB" }}
                  />
                  <Bar
                    dataKey="classes"
                    name="Classes"
                    fill="#2563EB"
                    radius={[5, 5, 0, 0]}
                    maxBarSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* ── Today's Room Bookings ── */}
          <div className="bg-white rounded-xl shadow-card p-5 border border-light">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="p-2 bg-indigo-50 rounded-lg">
                <Building2 className="w-4 h-4 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-dark font-semibold text-sm">
                  Today's Room Bookings
                </h3>
                <p className="text-xs text-body">
                  {loadingBookings
                    ? "Loading…"
                    : `${roomBookingsTodayApproved.length} approved today`}
                </p>
              </div>
            </div>

            {loadingBookings ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div
                    key={i}
                    className="p-4 bg-soft rounded-xl border border-light space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="h-4 w-36 rounded bg-gray-200 animate-pulse" />
                        <div className="h-3.5 w-24 rounded bg-gray-200 animate-pulse" />
                      </div>
                      <div className="h-5 w-16 rounded-lg bg-gray-200 animate-pulse" />
                    </div>
                    <div className="flex justify-between pt-2 border-t border-light">
                      <div className="h-3 w-20 rounded bg-gray-200 animate-pulse" />
                      <div className="h-3 w-20 rounded bg-gray-200 animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : roomBookingsTodayApproved.length === 0 ? (
              <div className="text-center py-8 text-body text-sm bg-soft rounded-xl border border-light">
                No approved room bookings for today.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {roomBookingsTodayApproved.map((b) => (
                  <div
                    key={b.id}
                    className="p-4 bg-indigo-50 rounded-xl border border-indigo-200"
                  >
                    <div className="flex items-start justify-between mb-2.5">
                      <div>
                        <p className="text-sm font-semibold text-dark">
                          {b.event_name}
                        </p>
                        <p className="text-xs text-body">{b.organiser_name}</p>
                      </div>
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-lg text-xs font-medium flex-shrink-0">
                        Approved
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-body pt-2.5 border-t border-indigo-200">
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3 h-3" />
                        {b.room?.room_name ?? `Room #${b.room_id}`}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {timeFromApi(b.start_time)} – {timeFromApi(b.end_time)}
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
