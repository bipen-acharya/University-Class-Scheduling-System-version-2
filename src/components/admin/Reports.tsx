import { useEffect, useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { TrendingUp, Users, DoorOpen, Award } from "lucide-react";
import { toast } from "sonner";

import {
  ApiRoom,
  ApiSubject,
  ApiTeacher,
  ApiTimeTableSession,
  ApiProgramm,
} from "../../types/timetable";

import { getTimeTableSessions } from "../../services/timetable";
import {
  getRooms,
  getSubjects,
  getTeachers,
  getPrograms,
  getTrimesters,
} from "../../services/catalog";

/** ========================= Types ========================= */
type ApiTrimester = {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  status?: "active" | "inactive";
};

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;
type DayName = (typeof DAYS)[number];

/** ========================= Helpers ========================= */
const normalizeISO = (v: any) => (v ? String(v).slice(0, 10) : "");

const toMinutes = (t: string) => {
  if (!t) return 0;
  const [h, m] = String(t).trim().slice(0, 5).split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
};

const clamp = (n: number, min = 0, max = 100) =>
  Math.max(min, Math.min(max, n));

const inDateRange = (dateISO: string, startISO: string, endISO: string) => {
  if (!dateISO || !startISO || !endISO) return false;
  return dateISO >= startISO && dateISO <= endISO;
};

const dayFromDate = (isoDate: string): DayName => {
  const [y, m, d] = isoDate.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  const map: DayName[] = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return map[dt.getDay()];
};

const countWeekdayOccurrences = (
  startISO: string,
  endISO: string,
  weekday: DayName,
) => {
  const [sy, sm, sd] = startISO.split("-").map(Number);
  const [ey, em, ed] = endISO.split("-").map(Number);
  const start = new Date(sy, sm - 1, sd);
  const end = new Date(ey, em - 1, ed);

  const targetIndex: Record<DayName, number> = {
    Sunday: 0,
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
  };

  const cursor = new Date(start);
  while (cursor.getDay() !== targetIndex[weekday]) {
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

const HOURS_PER_DAY = 12;
const MINUTES_PER_DAY = HOURS_PER_DAY * 60;
const PIE_COLORS = [
  "#2563EB",
  "#10B981",
  "#F59E0B",
  "#8B5CF6",
  "#EF4444",
  "#06B6D4",
  "#84CC16",
  "#F97316",
  "#0EA5E9",
];

/** ========================= Skeletons ========================= */
function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-card p-5 border border-light">
      <div className="flex items-center justify-between mb-3">
        <div className="w-9 h-9 rounded-lg bg-gray-200 animate-pulse" />
        <div className="h-9 w-14 rounded bg-gray-200 animate-pulse" />
      </div>
      <div className="h-3.5 w-36 rounded bg-gray-200 animate-pulse" />
    </div>
  );
}

function BarRowSkeleton() {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="space-y-1.5">
          <div className="h-3.5 w-32 rounded bg-gray-200 animate-pulse" />
          <div className="h-3 w-20 rounded bg-gray-200 animate-pulse" />
        </div>
        <div className="h-4 w-10 rounded bg-gray-200 animate-pulse" />
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2">
        <div
          className="h-2 rounded-full bg-gray-200 animate-pulse"
          style={{ width: "60%" }}
        />
      </div>
    </div>
  );
}

function TeacherRowSkeleton() {
  return (
    <div className="flex items-center justify-between p-3 bg-soft rounded-xl border border-light">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-gray-200 animate-pulse" />
        <div className="space-y-1.5">
          <div className="h-3.5 w-28 rounded bg-gray-200 animate-pulse" />
          <div className="h-3 w-16 rounded bg-gray-200 animate-pulse" />
        </div>
      </div>
      <div className="text-right space-y-1">
        <div className="h-5 w-12 rounded bg-gray-200 animate-pulse" />
        <div className="h-3 w-14 rounded bg-gray-200 animate-pulse" />
      </div>
    </div>
  );
}

function ChartSkeleton({ height = 280 }: { height?: number }) {
  return (
    <div
      className="w-full rounded-xl bg-gray-50 border border-light animate-pulse"
      style={{ height }}
    />
  );
}

/** ========================= Main Component ========================= */
export default function Reports() {
  const [loading, setLoading] = useState(true);

  const [sessions, setSessions] = useState<ApiTimeTableSession[]>([]);
  const [teachers, setTeachers] = useState<ApiTeacher[]>([]);
  const [rooms, setRooms] = useState<ApiRoom[]>([]);
  const [subjects, setSubjects] = useState<ApiSubject[]>([]);
  const [programs, setPrograms] = useState<ApiProgramm[]>([]);
  const [trimesters, setTrimesters] = useState<ApiTrimester[]>([]);
  const [selectedTrimesterId, setSelectedTrimesterId] = useState<string>("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [tt, t, r, s, p, tr] = await Promise.all([
          getTimeTableSessions(),
          getTeachers(),
          getRooms(),
          getSubjects(),
          getPrograms(),
          getTrimesters(),
        ]);

        setSessions((tt as any).data || []);
        setTeachers((t as any).data || []);
        setRooms((r as any).data || []);
        setSubjects((s as any).data || []);
        setPrograms((p as any).data || []);
        setTrimesters((tr as any).data || []);

        const list = (tr as any).data || [];
        const active = list.find((x: ApiTrimester) => x.status === "active");
        const pick = active || list[0];
        if (pick) setSelectedTrimesterId(String(pick.id));
      } catch (e: any) {
        toast.error(
          e?.response?.data?.message || "Failed to load report data.",
        );
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const selectedTrimester = useMemo(
    () =>
      trimesters.find((t) => String(t.id) === String(selectedTrimesterId)) ||
      null,
    [trimesters, selectedTrimesterId],
  );

  /** ── Enriched sessions ── */
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

  const routineSessions = useMemo(
    () => (sessions || []).filter((s: any) => !normalizeISO(s.date)),
    [sessions],
  );

  const enriched = useMemo(() => {
    if (!selectedTrimester) return [];
    const { start_date: startISO, end_date: endISO } = selectedTrimester;
    const all = [...dateSessionsInTrimester, ...routineSessions];

    return all.map((s: any) => {
      const teacher =
        s.teacher ||
        teachers.find((t) => Number(t.id) === Number(s.teacher_id));
      const room =
        s.room || rooms.find((r) => Number(r.id) === Number(s.room_id));
      const subject =
        s.subject ||
        subjects.find((x) => Number(x.id) === Number(s.subject_id));
      const programm =
        s.programm ||
        programs.find((p) => Number(p.id) === Number(s.programm_id));

      const durationMin = Math.max(
        0,
        toMinutes(s.end_time) - toMinutes(s.start_time),
      );
      const hasDate = !!normalizeISO(s.date);
      const day: DayName =
        (s.day as DayName) ||
        (hasDate ? dayFromDate(normalizeISO(s.date)) : "Monday");
      const occurrences = hasDate
        ? 1
        : countWeekdayOccurrences(startISO, endISO, day);

      return {
        ...s,
        teacher,
        room,
        subject,
        programm,
        durationMin,
        occurrences,
        day,
        hasDate,
      };
    });
  }, [
    selectedTrimester,
    dateSessionsInTrimester,
    routineSessions,
    teachers,
    rooms,
    subjects,
    programs,
  ]);

  /** ── Summary stats ── */
  const summary = useMemo(() => {
    const totalClasses = enriched.reduce(
      (sum: number, s: any) => sum + Number(s.occurrences || 1),
      0,
    );

    const teacherMinutes = new Map<number, number>();
    enriched.forEach((s: any) => {
      const tid = Number(s.teacher_id);
      teacherMinutes.set(
        tid,
        (teacherMinutes.get(tid) || 0) +
          Number(s.durationMin || 0) * Number(s.occurrences || 1),
      );
    });
    const avgHoursPerTeacher =
      Array.from(teacherMinutes.values()).reduce((a, b) => a + b, 0) /
      60 /
      Math.max(1, teacherMinutes.size);

    let avgRoomUtilization = 0;
    if (selectedTrimester) {
      const start = new Date(selectedTrimester.start_date);
      const end = new Date(selectedTrimester.end_date);
      const daysInTrimester = Math.max(
        1,
        Math.floor((end.getTime() - start.getTime()) / 86400000) + 1,
      );
      const totalRoomAvailableMin =
        Math.max(1, rooms.length) * daysInTrimester * MINUTES_PER_DAY;
      const totalUsedRoomMin = enriched.reduce(
        (sum: number, s: any) =>
          sum + Number(s.durationMin || 0) * Number(s.occurrences || 1),
        0,
      );
      avgRoomUtilization = clamp(
        Math.round((totalUsedRoomMin / totalRoomAvailableMin) * 100),
      );
    }

    return {
      totalClasses,
      avgHoursPerTeacher: Math.round(avgHoursPerTeacher * 10) / 10,
      avgRoomUtilization,
      avgDailyClasses: Math.round((totalClasses / 7) * 10) / 10,
    };
  }, [enriched, rooms.length, selectedTrimester]);

  /** ── Room usage ── */
  const roomUsageData = useMemo(() => {
    if (!selectedTrimester) return [];
    const byRoom = new Map<
      number,
      { room: string; classes: number; usedMin: number }
    >();

    enriched.forEach((s: any) => {
      const rid = Number(s.room_id);
      const name = s.room?.room_name || `Room #${rid}`;
      if (!byRoom.has(rid))
        byRoom.set(rid, { room: name, classes: 0, usedMin: 0 });
      const rec = byRoom.get(rid)!;
      rec.classes += Number(s.occurrences || 1);
      rec.usedMin += Number(s.durationMin || 0) * Number(s.occurrences || 1);
    });

    const start = new Date(selectedTrimester.start_date);
    const end = new Date(selectedTrimester.end_date);
    const daysInTrimester = Math.max(
      1,
      Math.floor((end.getTime() - start.getTime()) / 86400000) + 1,
    );
    const availableMinPerRoom = daysInTrimester * MINUTES_PER_DAY;

    return Array.from(byRoom.values())
      .map((v) => ({
        room: v.room,
        classes: v.classes,
        utilization: clamp(Math.round((v.usedMin / availableMinPerRoom) * 100)),
        usedMin: v.usedMin,
      }))
      .sort((a, b) => b.usedMin - a.usedMin)
      .slice(0, 6);
  }, [enriched, selectedTrimester]);

  /** ── Teaching load ── */
  const teachingLoadData = useMemo(() => {
    const byTeacher = new Map<
      number,
      { teacher: string; minutes: number; classes: number }
    >();

    enriched.forEach((s: any) => {
      const tid = Number(s.teacher_id);
      const name = s.teacher?.full_name || `Teacher #${tid}`;
      if (!byTeacher.has(tid))
        byTeacher.set(tid, { teacher: name, minutes: 0, classes: 0 });
      const rec = byTeacher.get(tid)!;
      rec.classes += Number(s.occurrences || 1);
      rec.minutes += Number(s.durationMin || 0) * Number(s.occurrences || 1);
    });

    return Array.from(byTeacher.values())
      .map((v) => ({
        teacher: v.teacher,
        hours: Math.round((v.minutes / 60) * 10) / 10,
        classes: v.classes,
        minutes: v.minutes,
      }))
      .sort((a, b) => b.minutes - a.minutes)
      .slice(0, 6);
  }, [enriched]);

  /** ── Daily distribution ── */
  const dailyAverageData = useMemo(() => {
    const countByDay: Record<DayName, number> = {
      Monday: 0,
      Tuesday: 0,
      Wednesday: 0,
      Thursday: 0,
      Friday: 0,
      Saturday: 0,
      Sunday: 0,
    };
    enriched.forEach((s: any) => {
      countByDay[s.day as DayName] =
        (countByDay[s.day as DayName] || 0) + Number(s.occurrences || 1);
    });
    return DAYS.map((d) => ({
      day: d.slice(0, 3),
      avgClasses: countByDay[d] || 0,
    }));
  }, [enriched]);

  /** ── Program pie ── */
  const programPieData = useMemo(() => {
    const byProgram = new Map<string, number>();
    enriched.forEach((s: any) => {
      const name =
        s.programm?.program_name ||
        s.programm?.name ||
        `Program #${s.programm_id ?? "?"}`;
      byProgram.set(
        name,
        (byProgram.get(name) || 0) + Number(s.occurrences || 1),
      );
    });

    const items = Array.from(byProgram.entries())
      .map(([name, count], idx) => ({
        name,
        count,
        color: PIE_COLORS[idx % PIE_COLORS.length],
      }))
      .sort((a, b) => b.count - a.count);

    const total = Math.max(
      1,
      items.reduce((sum, x) => sum + x.count, 0),
    );
    return items.map((x) => ({
      name: x.name,
      value: Math.round((x.count / total) * 100),
      color: x.color,
      _count: x.count,
    }));
  }, [enriched]);

  /** ========================= Render ========================= */
  return (
    <div className="space-y-5">
      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-primary-blue mb-1">Reports</h1>
          <p className="text-body text-sm">
            {loading
              ? "Loading report data…"
              : selectedTrimester
                ? `${selectedTrimester.name} · ${selectedTrimester.start_date} → ${selectedTrimester.end_date}`
                : "Select a trimester to view reports"}
          </p>
        </div>

        <select
          value={selectedTrimesterId}
          onChange={(e) => setSelectedTrimesterId(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue text-sm cursor-pointer bg-white shadow-card"
        >
          <option value="">Select Trimester</option>
          {trimesters.map((t) => (
            <option key={t.id} value={String(t.id)}>
              {t.name} ({t.start_date} – {t.end_date})
            </option>
          ))}
        </select>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <StatCardSkeleton key={i} />
            ))
          : [
              {
                label: "Total Classes",
                value: summary.totalClasses,
                color: "text-primary-blue",
                icon: <TrendingUp className="w-5 h-5 text-primary-blue" />,
                bg: "bg-blue-50",
              },
              {
                label: "Avg Hours / Teacher",
                value: `${summary.avgHoursPerTeacher}h`,
                color: "text-green-600",
                icon: <Users className="w-5 h-5 text-green-600" />,
                bg: "bg-green-50",
              },
              {
                label: "Avg Room Utilization",
                value: `${summary.avgRoomUtilization}%`,
                color: "text-purple-600",
                icon: <DoorOpen className="w-5 h-5 text-purple-600" />,
                bg: "bg-purple-50",
              },
              {
                label: "Avg Classes / Day",
                value: summary.avgDailyClasses,
                color: "text-orange-600",
                icon: <Award className="w-5 h-5 text-orange-600" />,
                bg: "bg-orange-50",
              },
            ].map(({ label, value, color, icon, bg }) => (
              <div
                key={label}
                className="bg-white rounded-xl shadow-card p-5 border border-light"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-2 ${bg} rounded-lg`}>{icon}</div>
                  <span className={`text-3xl font-bold ${color}`}>{value}</span>
                </div>
                <p className="text-sm text-body">{label}</p>
              </div>
            ))}
      </div>

      {/* ── Rooms + Teachers ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Most Used Rooms */}
        <div className="bg-white rounded-xl shadow-card p-5 border border-light">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="p-2 bg-blue-50 rounded-lg">
              <DoorOpen className="w-4 h-4 text-primary-blue" />
            </div>
            <div>
              <h3 className="text-dark font-semibold text-sm">
                Most Used Rooms
              </h3>
              <p className="text-xs text-body">
                Room utilization this trimester
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <BarRowSkeleton key={i} />
              ))
            ) : roomUsageData.length === 0 ? (
              <p className="text-body text-sm py-6 text-center">
                No room usage data for this trimester.
              </p>
            ) : (
              roomUsageData.map((room, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-dark font-medium">
                        {room.room}
                      </p>
                      <p className="text-xs text-body">
                        {room.classes} classes
                      </p>
                    </div>
                    <span className="text-sm text-primary-blue font-bold">
                      {room.utilization}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-primary-blue rounded-full h-2 transition-all"
                      style={{ width: `${room.utilization}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Teaching Load */}
        <div className="bg-white rounded-xl shadow-card p-5 border border-light">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="p-2 bg-green-50 rounded-lg">
              <Users className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <h3 className="text-dark font-semibold text-sm">
                Top Teaching Load
              </h3>
              <p className="text-xs text-body">
                Most active teachers this trimester
              </p>
            </div>
          </div>

          <div className="space-y-2.5">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <TeacherRowSkeleton key={i} />
              ))
            ) : teachingLoadData.length === 0 ? (
              <p className="text-body text-sm py-6 text-center">
                No teacher load data for this trimester.
              </p>
            ) : (
              teachingLoadData.map((teacher, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 bg-soft rounded-xl border border-light"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary-blue rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                      {i + 1}
                    </div>
                    <div>
                      <p className="text-sm text-dark font-medium leading-tight">
                        {teacher.teacher}
                      </p>
                      <p className="text-xs text-body">
                        {teacher.classes} classes
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-base font-bold text-primary-blue">
                      {teacher.hours}h
                    </p>
                    <p className="text-xs text-body">teaching</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ── Bar chart: classes per day ── */}
      <div className="bg-white rounded-xl shadow-card p-5 border border-light">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="p-2 bg-purple-50 rounded-lg">
            <TrendingUp className="w-4 h-4 text-purple-600" />
          </div>
          <div>
            <h3 className="text-dark font-semibold text-sm">
              Classes per Weekday
            </h3>
            <p className="text-xs text-body">
              Trimester total distribution across days
            </p>
          </div>
        </div>

        {loading ? (
          <ChartSkeleton height={260} />
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={dailyAverageData}
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
                  borderRadius: "12px",
                  boxShadow: "0 4px 6px -1px rgba(0,0,0,.1)",
                  fontSize: 13,
                }}
                cursor={{ fill: "#F9FAFB" }}
              />
              <Bar
                dataKey="avgClasses"
                name="Classes"
                fill="#2563EB"
                radius={[6, 6, 0, 0]}
                maxBarSize={48}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* ── Pie chart: classes by program ── */}
      <div className="bg-white rounded-xl shadow-card p-5 border border-light">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="p-2 bg-orange-50 rounded-lg">
            <Award className="w-4 h-4 text-orange-600" />
          </div>
          <div>
            <h3 className="text-dark font-semibold text-sm">
              Classes by Program
            </h3>
            <p className="text-xs text-body">
              Distribution across programs this trimester
            </p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <ChartSkeleton height={260} />
            <div className="space-y-2.5">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 bg-soft rounded-xl border border-light"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded bg-gray-200 animate-pulse" />
                    <div className="space-y-1.5">
                      <div className="h-3.5 w-28 rounded bg-gray-200 animate-pulse" />
                      <div className="h-3 w-16 rounded bg-gray-200 animate-pulse" />
                    </div>
                  </div>
                  <div className="h-4 w-8 rounded bg-gray-200 animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-center">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={programPieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={100}
                  dataKey="value"
                >
                  {programPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any, name: any, props: any) => [
                    `${value}% (${props?.payload?._count} classes)`,
                    name,
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>

            <div className="space-y-2">
              {programPieData.length === 0 ? (
                <p className="text-body text-sm py-6 text-center">
                  No program data for this trimester.
                </p>
              ) : (
                programPieData.map((p, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 bg-soft rounded-xl border border-light"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: p.color }}
                      />
                      <div>
                        <p className="text-sm text-dark font-medium leading-tight">
                          {p.name}
                        </p>
                        <p className="text-xs text-body">{p._count} classes</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-body">
                      {p.value}%
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
