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

import {
  ApiRoom,
  ApiSubject,
  ApiTeacher,
  ApiTimeTableSession,
  ApiProgramm,
} from "../../types/timetable";

import { getTimeTableSessions } from "../../services/timetable";
import { getRooms, getSubjects, getTeachers, getPrograms, getTrimesters } from "../../services/catalog";

/** ---------- TYPES ---------- */
type ApiTrimester = {
  id: number;
  name: string;
  start_date: string; // YYYY-MM-DD
  end_date: string;   // YYYY-MM-DD
  status?: "active" | "inactive";
};

const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"] as const;
type DayName = (typeof DAYS)[number];

/** ---------- HELPERS ---------- */
const normalizeISO = (v: any) => (v ? String(v).slice(0, 10) : "");

const toMinutes = (t: string) => {
  if (!t) return 0;
  const [h, m] = String(t).trim().slice(0, 5).split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
};

const clamp = (n: number, min = 0, max = 100) => Math.max(min, Math.min(max, n));

const inDateRange = (dateISO: string, startISO: string, endISO: string) => {
  if (!dateISO || !startISO || !endISO) return false;
  return dateISO >= startISO && dateISO <= endISO;
};

const dayFromDate = (isoDate: string): DayName => {
  const [y, m, d] = isoDate.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  const map: DayName[] = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  return map[dt.getDay()];
};

/** count weekday occurrences between start/end (inclusive) */
const countWeekdayOccurrences = (startISO: string, endISO: string, weekday: DayName) => {
  const [sy, sm, sd] = startISO.split("-").map(Number);
  const [ey, em, ed] = endISO.split("-").map(Number);
  const start = new Date(sy, sm - 1, sd);
  const end = new Date(ey, em - 1, ed);

  const targetIndex: Record<DayName, number> = {
    Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6,
  };

  // move cursor to first occurrence
  const cursor = new Date(start);
  while (cursor.getDay() !== targetIndex[weekday]) {
    cursor.setDate(cursor.getDate() + 1);
    if (cursor > end) return 0;
  }

  let count = 0;
  while (cursor <= end) {
    count += 1;
    cursor.setDate(cursor.getDate() + 7);
  }
  return count;
};

// timetable day window assumption = 08:00 to 20:00 => 12 hours
const HOURS_PER_DAY = 12;
const MINUTES_PER_DAY = HOURS_PER_DAY * 60;

// colors for pie
const PIE_COLORS = ["#2563EB","#10B981","#F59E0B","#8B5CF6","#EF4444","#06B6D4","#84CC16","#F97316","#0EA5E9"];

export default function Reports() {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [sessions, setSessions] = useState<ApiTimeTableSession[]>([]);
  const [teachers, setTeachers] = useState<ApiTeacher[]>([]);
  const [rooms, setRooms] = useState<ApiRoom[]>([]);
  const [subjects, setSubjects] = useState<ApiSubject[]>([]);
  const [programs, setPrograms] = useState<ApiProgramm[]>([]);
  const [trimesters, setTrimesters] = useState<ApiTrimester[]>([]);

  const [selectedTrimesterId, setSelectedTrimesterId] = useState<string>("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setErrorMsg("");
      try {
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

        const active = ((tr as any).data || []).find((x: ApiTrimester) => x.status === "active");
        if (active) setSelectedTrimesterId(String(active.id));
        else if (((tr as any).data || []).length) setSelectedTrimesterId(String(((tr as any).data || [])[0].id));
      } catch (e: any) {
        console.error(e);
        setErrorMsg(e?.response?.data?.message || "Failed to load reports data.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const selectedTrimester = useMemo(() => {
    if (!selectedTrimesterId) return null;
    return trimesters.find((t) => String(t.id) === String(selectedTrimesterId)) || null;
  }, [trimesters, selectedTrimesterId]);

  /** date sessions in trimester range (if your API sometimes has date sessions) */
  const dateSessionsInTrimester = useMemo(() => {
    if (!selectedTrimester) return [];
    const startISO = selectedTrimester.start_date;
    const endISO = selectedTrimester.end_date;

    return (sessions || []).filter((s: any) => {
      const d = normalizeISO(s.date);
      if (!d) return false;
      return inDateRange(d, startISO, endISO);
    });
  }, [sessions, selectedTrimester]);

  /** routine sessions (date is null/empty) */
  const routineSessions = useMemo(() => {
    return (sessions || []).filter((s: any) => !normalizeISO(s.date));
  }, [sessions]);

  /**
   * Enrich + expand:
   * - if hasDate => occurrences = 1
   * - routine => occurrences = weekday occurrences within trimester range
   */
  const enriched = useMemo(() => {
    if (!selectedTrimester) return [];

    const startISO = selectedTrimester.start_date;
    const endISO = selectedTrimester.end_date;

    const all = [...dateSessionsInTrimester, ...routineSessions];

    return all.map((s: any) => {
      const teacher = s.teacher || teachers.find((t) => Number(t.id) === Number(s.teacher_id));
      const room = s.room || rooms.find((r) => Number(r.id) === Number(s.room_id));
      const subject = s.subject || subjects.find((x) => Number(x.id) === Number(s.subject_id));
      const programm = s.programm || programs.find((p) => Number(p.id) === Number(s.programm_id));

      const start = toMinutes(s.start_time);
      const end = toMinutes(s.end_time);
      const durationMin = Math.max(0, end - start);

      const hasDate = !!normalizeISO(s.date);
      const day: DayName =
        (s.day as DayName) ||
        (hasDate ? dayFromDate(normalizeISO(s.date)) : "Monday");

      const occurrences = hasDate ? 1 : countWeekdayOccurrences(startISO, endISO, day);

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

  /** --- Summary stats --- */
  const summary = useMemo(() => {
    const totalClasses = enriched.reduce((sum: number, s: any) => sum + Number(s.occurrences || 1), 0);

    // avg hours per teacher
    const teacherMinutes = new Map<number, number>();
    enriched.forEach((s: any) => {
      const tid = Number(s.teacher_id);
      const add = Number(s.durationMin || 0) * Number(s.occurrences || 1);
      teacherMinutes.set(tid, (teacherMinutes.get(tid) || 0) + add);
    });
    const teachersWithClasses = Math.max(1, teacherMinutes.size);
    const totalTeacherMinutes = Array.from(teacherMinutes.values()).reduce((a, b) => a + b, 0);
    const avgHoursPerTeacher = (totalTeacherMinutes / 60) / teachersWithClasses;

    // avg room utilization across all rooms
    let avgRoomUtilization = 0;

    if (selectedTrimester) {
      const start = new Date(selectedTrimester.start_date);
      const end = new Date(selectedTrimester.end_date);
      const daysInTrimester = Math.max(1, Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);

      const availableMinPerRoom = daysInTrimester * MINUTES_PER_DAY;
      const totalRoomAvailableMin = Math.max(1, rooms.length) * availableMinPerRoom;

      const totalUsedRoomMin = enriched.reduce(
        (sum: number, s: any) => sum + Number(s.durationMin || 0) * Number(s.occurrences || 1),
        0
      );

      avgRoomUtilization = clamp(Math.round((totalUsedRoomMin / totalRoomAvailableMin) * 100));
    }

    // average classes per weekday (7-day distribution)
    const avgDailyClasses = Math.round((totalClasses / 7) * 10) / 10;

    return {
      totalClasses,
      avgHoursPerTeacher: Math.round(avgHoursPerTeacher * 10) / 10,
      avgRoomUtilization,
      avgDailyClasses,
    };
  }, [enriched, rooms.length, selectedTrimester]);

  /** --- Most Used Rooms (top 6) --- */
  const roomUsageData = useMemo(() => {
    if (!selectedTrimester) return [];

    const byRoom = new Map<number, { room: string; classes: number; usedMin: number }>();

    enriched.forEach((s: any) => {
      const rid = Number(s.room_id);
      const name = s.room?.room_name || `Room #${rid}`;

      if (!byRoom.has(rid)) byRoom.set(rid, { room: name, classes: 0, usedMin: 0 });

      const rec = byRoom.get(rid)!;
      rec.classes += Number(s.occurrences || 1);
      rec.usedMin += Number(s.durationMin || 0) * Number(s.occurrences || 1);
    });

    const start = new Date(selectedTrimester.start_date);
    const end = new Date(selectedTrimester.end_date);
    const daysInTrimester = Math.max(1, Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);

    const availableMinPerRoom = daysInTrimester * MINUTES_PER_DAY;

    const arr = Array.from(byRoom.values()).map((v) => ({
      room: v.room,
      classes: v.classes,
      utilization: clamp(Math.round((v.usedMin / availableMinPerRoom) * 100)),
      usedMin: v.usedMin,
    }));

    arr.sort((a, b) => b.usedMin - a.usedMin);
    return arr.slice(0, 6);
  }, [enriched, selectedTrimester]);

  /** --- Top teaching load (top 6) --- */
  const teachingLoadData = useMemo(() => {
    const byTeacher = new Map<number, { teacher: string; minutes: number; classes: number }>();

    enriched.forEach((s: any) => {
      const tid = Number(s.teacher_id);
      const name = s.teacher?.full_name || `Teacher #${tid}`;

      if (!byTeacher.has(tid)) byTeacher.set(tid, { teacher: name, minutes: 0, classes: 0 });

      const rec = byTeacher.get(tid)!;
      rec.classes += Number(s.occurrences || 1);
      rec.minutes += Number(s.durationMin || 0) * Number(s.occurrences || 1);
    });

    const arr = Array.from(byTeacher.values()).map((v) => ({
      teacher: v.teacher,
      hours: Math.round((v.minutes / 60) * 10) / 10,
      classes: v.classes,
      minutes: v.minutes,
    }));

    arr.sort((a, b) => b.minutes - a.minutes);
    return arr.slice(0, 6);
  }, [enriched]);

  /** --- Bar: classes per weekday (Trimester totals) --- */
  const dailyAverageData = useMemo(() => {
    const countByDay: Record<DayName, number> = {
      Monday: 0, Tuesday: 0, Wednesday: 0, Thursday: 0, Friday: 0, Saturday: 0, Sunday: 0,
    };

    enriched.forEach((s: any) => {
      const d: DayName = s.day;
      countByDay[d] = (countByDay[d] || 0) + Number(s.occurrences || 1);
    });

    return DAYS.map((d) => ({
      day: d,
      avgClasses: countByDay[d] || 0,
    }));
  }, [enriched]);

  /** --- Pie: classes by program (percentage) --- */
  const programPieData = useMemo(() => {
    const byProgram = new Map<string, number>();

    enriched.forEach((s: any) => {
      const name =
        s.programm?.program_name ||
        s.programm?.name ||
        `Program #${s.programm_id ?? "?"}`;

      byProgram.set(name, (byProgram.get(name) || 0) + Number(s.occurrences || 1));
    });

    const items = Array.from(byProgram.entries()).map(([name, count], idx) => ({
      name,
      count,
      color: PIE_COLORS[idx % PIE_COLORS.length],
    }));

    items.sort((a, b) => b.count - a.count);

    const total = Math.max(1, items.reduce((sum, x) => sum + x.count, 0));

    // recharts pie uses "value"
    return items.map((x) => ({
      name: x.name,
      value: Math.round((x.count / total) * 100),
      color: x.color,
      _count: x.count,
    }));
  }, [enriched]);

  return (
    <div className="space-y-6">
      {/* Header + Trimester */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl text-dark font-semibold">Reports</h1>
          <p className="text-sm text-body">
            {loading
              ? "Generating reports..."
              : selectedTrimester
              ? `Trimester report: ${selectedTrimester.name} (${selectedTrimester.start_date} to ${selectedTrimester.end_date})`
              : "Select a trimester to view reports"}
          </p>
          {errorMsg && <p className="text-sm text-red-600 mt-2">{errorMsg}</p>}
        </div>

        <div className="bg-white rounded-2xl shadow-card-lg p-4 border border-light">
          <label className="block text-xs text-body mb-1">Select Trimester *</label>
          <select
            value={selectedTrimesterId}
            onChange={(e) => setSelectedTrimesterId(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue text-sm"
          >
            <option value="">Select Trimester</option>
            {trimesters.map((t) => (
              <option key={t.id} value={String(t.id)}>
                {t.name} ({t.start_date} - {t.end_date})
              </option>
            ))}
          </select>
        </div>
      </div>

      {!selectedTrimester ? (
        <div className="bg-white rounded-2xl shadow-card-lg p-6 border border-light text-body">
          Please select a trimester to generate reports.
        </div>
      ) : (
        <>
          {/* Summary Stats (NEW UI) */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl shadow-card-lg p-6 border border-light">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-primary-blue" />
                </div>
                <span className="text-3xl text-dark font-bold">{summary.totalClasses}</span>
              </div>
              <p className="text-sm text-body">Total Classes (Trimester)</p>
            </div>

            <div className="bg-white rounded-2xl shadow-card-lg p-6 border border-light">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-green-50 rounded-lg">
                  <Users className="w-5 h-5 text-success" />
                </div>
                <span className="text-3xl text-dark font-bold">{summary.avgHoursPerTeacher}</span>
              </div>
              <p className="text-sm text-body">Avg Hours per Teacher</p>
            </div>

            <div className="bg-white rounded-2xl shadow-card-lg p-6 border border-light">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-purple-50 rounded-lg">
                  <DoorOpen className="w-5 h-5 text-purple-600" />
                </div>
                <span className="text-3xl text-dark font-bold">{summary.avgRoomUtilization}%</span>
              </div>
              <p className="text-sm text-body">Avg Room Utilization</p>
            </div>

            <div className="bg-white rounded-2xl shadow-card-lg p-6 border border-light">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-orange-50 rounded-lg">
                  <Award className="w-5 h-5 text-orange-600" />
                </div>
                <span className="text-3xl text-dark font-bold">{summary.avgDailyClasses}</span>
              </div>
              <p className="text-sm text-body">Avg Classes per Weekday</p>
            </div>
          </div>

          {/* Most Used Rooms & Top Teaching Load (NEW UI) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Most Used Rooms */}
            <div className="bg-white rounded-2xl shadow-card-lg p-6 border border-light">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <DoorOpen className="w-5 h-5 text-primary-blue" />
                </div>
                <div>
                  <h3 className="text-lg text-dark font-semibold">Most Used Rooms</h3>
                  <p className="text-sm text-body">Room utilization in this trimester</p>
                </div>
              </div>

              <div className="space-y-4">
                {roomUsageData.length === 0 ? (
                  <div className="p-4 bg-soft rounded-xl text-body text-sm">
                    No room usage data for this trimester.
                  </div>
                ) : (
                  roomUsageData.map((room, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-dark font-medium">{room.room}</p>
                          <p className="text-xs text-body">{room.classes} classes scheduled</p>
                        </div>
                        <span className="text-sm text-primary-blue font-semibold">
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
            <div className="bg-white rounded-2xl shadow-card-lg p-6 border border-light">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-green-50 rounded-lg">
                  <Users className="w-5 h-5 text-success" />
                </div>
                <div>
                  <h3 className="text-lg text-dark font-semibold">Top Teaching Load</h3>
                  <p className="text-sm text-body">Most active teachers in this trimester</p>
                </div>
              </div>

              <div className="space-y-4">
                {teachingLoadData.length === 0 ? (
                  <div className="p-4 bg-soft rounded-xl text-body text-sm">
                    No teacher load data for this trimester.
                  </div>
                ) : (
                  teachingLoadData.map((teacher, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-soft rounded-xl border border-light"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-blue rounded-full flex items-center justify-center text-white font-semibold text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <p className="text-sm text-dark font-medium">{teacher.teacher}</p>
                          <p className="text-xs text-body">{teacher.classes} classes</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg text-primary-blue font-bold">{teacher.hours}h</p>
                        <p className="text-xs text-body">teaching</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Average Classes per Day Chart (NEW UI) */}
          <div className="bg-white rounded-2xl shadow-card-lg p-6 border border-light">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-50 rounded-lg">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg text-dark font-semibold">Average Classes per Day</h3>
                <p className="text-sm text-body">Weekly distribution (trimester totals)</p>
              </div>
            </div>

            <div style={{ width: "100%", height: 320, minHeight: 320 }}>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={dailyAverageData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="day" stroke="#374151" style={{ fontSize: "12px" }} />
                  <YAxis stroke="#374151" style={{ fontSize: "12px" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#FFFFFF",
                      border: "1px solid #E5E7EB",
                      borderRadius: "12px",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                  <Bar dataKey="avgClasses" fill="#2563EB" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Classes by Program (Pie) — replaces Department */}
          <div className="bg-white rounded-2xl shadow-card-lg p-6 border border-light">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-orange-50 rounded-lg">
                <Award className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h3 className="text-lg text-dark font-semibold">Classes by Program</h3>
                <p className="text-sm text-body">Distribution of classes across programs</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
              <div style={{ width: "100%", height: 320, minHeight: 320 }}>
                <ResponsiveContainer width="100%" height={320}>
                  <PieChart>
                    <Pie
                      data={programPieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={100}
                      dataKey="value"
                    >
                      {programPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: any, name: any, props: any) => {
                        const count = props?.payload?._count;
                        return [`${value}% (${count} classes)`, name];
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-3">
                {programPieData.length === 0 ? (
                  <div className="p-4 bg-soft rounded-xl text-body text-sm">
                    No program distribution data for this trimester.
                  </div>
                ) : (
                  programPieData.map((p, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-soft rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded" style={{ backgroundColor: p.color }} />
                        <div>
                          <span className="text-sm text-dark font-medium block">{p.name}</span>
                          <span className="text-xs text-body">{p._count} classes</span>
                        </div>
                      </div>
                      <span className="text-sm text-body font-semibold">{p.value}%</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
