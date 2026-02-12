import { useEffect, useMemo, useState } from "react";
import {
  Clock,
  TrendingUp,
  CheckCircle,
  Download,
  Users,
  X,
  Filter,
  Loader2,
} from "lucide-react";

import api from "../../api/axios";
import { getTimeTableSessions } from "../../services/timetable";
import { getTrimesters } from "../../services/catalog";

import {
  ApiRoom,
  ApiSubject,
  ApiTeacher,
  ApiProgramm,
  ApiTimeTableSession,
} from "../../types/timetable";

/* =========================
   Types
========================= */
type FinderTab = "classroom" | "seminar" | "weekly";

type ApiTrimester = {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  status?: "active" | "inactive";
};

type Day =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";

type TimelineGap = {
  type: "gap";
  start: string;
  end: string;
  duration: number; // hours
};

type TimelineBusy = {
  type: "busy";
  start: string;
  end: string;
  duration: number; // hours
  class_type: "Lecture" | "Tutorial" | "Seminar";

  subject?: string;
  code?: string;
  teacher?: string;
  program?: string;
  enrolled?: number | null;
  capacity?: number | string;
  roomName?: string;
};

type TimelineSlot = TimelineGap | TimelineBusy;

/* =========================
   Constants
========================= */
const DAYS: Day[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const START_HOUR = 8;  // working day start
const END_HOUR = 20;   // working day end

/* =========================
   Helpers
========================= */
const dateOnly = (v: any) => String(v || "").slice(0, 10);

const normalizeTimeHM = (t: any) => String(t || "").trim().slice(0, 5);

const toMinutes = (hhmm: string) => {
  const [h, m] = normalizeTimeHM(hhmm).split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
};

const toHHMM = (mins: number) => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

const todayDay = (): Day => {
  const map: Day[] = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return map[new Date().getDay()] as Day;
};

const hoursDisplay = (h: number) =>
  Number.isInteger(Number(h)) ? String(Number(h)) : Number(h).toFixed(2);

/* =========================
   Main Component
========================= */
export default function GapFinder() {
  const [activeTab, setActiveTab] = useState<FinderTab>("classroom");
  const [showExportModal, setShowExportModal] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Core routine filters
  const [trimesters, setTrimesters] = useState<ApiTrimester[]>([]);
  const [selectedTrimesterId, setSelectedTrimesterId] = useState<string>("");
  const [selectedDay, setSelectedDay] = useState<Day>(() => todayDay());

  // Optional filters
  const [selectedRoomId, setSelectedRoomId] = useState<number | "">("");
  const [selectedProgramId, setSelectedProgramId] = useState<number | "">("");
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | "">("");
  const [selectedRoomType, setSelectedRoomType] = useState<
    "lecture_hall" | "lab" | "seminar_room" | ""
  >("");

  // Data
  const [rooms, setRooms] = useState<ApiRoom[]>([]);
  const [subjects, setSubjects] = useState<ApiSubject[]>([]);
  const [teachers, setTeachers] = useState<ApiTeacher[]>([]);
  const [programms, setProgramms] = useState<ApiProgramm[]>([]);
  const [sessions, setSessions] = useState<ApiTimeTableSession[]>([]);

  const [loading, setLoading] = useState({
    rooms: false,
    subjects: false,
    teachers: false,
    programms: false,
    sessions: false,
    trimesters: false,
  });

  const [error, setError] = useState<string>("");

  /* =========================
     Fetchers
  ========================= */
  const fetchRooms = async () => {
    setLoading((p) => ({ ...p, rooms: true }));
    try {
      const res = await api.get<{ status: number; message: string; data: ApiRoom[] }>("/rooms");
      if (res.data.status === 1) setRooms(res.data.data || []);
      else throw new Error(res.data.message || "Failed to fetch rooms");
    } finally {
      setLoading((p) => ({ ...p, rooms: false }));
    }
  };

  const fetchSubjects = async () => {
    setLoading((p) => ({ ...p, subjects: true }));
    try {
      const res = await api.get<{ status: number; message: string; data: ApiSubject[] }>("/subjects");
      if (res.data.status === 1) setSubjects(res.data.data || []);
      else throw new Error(res.data.message || "Failed to fetch subjects");
    } finally {
      setLoading((p) => ({ ...p, subjects: false }));
    }
  };

  const fetchTeachers = async () => {
    setLoading((p) => ({ ...p, teachers: true }));
    try {
      const res = await api.get<{ status: number; message: string; data: ApiTeacher[] }>("/teachers");
      if (res.data.status === 1) setTeachers(res.data.data || []);
      else throw new Error(res.data.message || "Failed to fetch teachers");
    } finally {
      setLoading((p) => ({ ...p, teachers: false }));
    }
  };

  const fetchProgramms = async () => {
    setLoading((p) => ({ ...p, programms: true }));
    try {
      const res = await api.get<{ status: number; message: string; data: ApiProgramm[] }>("/programms");
      if (res.data.status === 1) setProgramms(res.data.data || []);
      else throw new Error(res.data.message || "Failed to fetch programs");
    } finally {
      setLoading((p) => ({ ...p, programms: false }));
    }
  };

  const fetchSessions = async () => {
    setLoading((p) => ({ ...p, sessions: true }));
    try {
      const data = await getTimeTableSessions();
      if ((data as any).status === 1) setSessions((data as any).data || []);
      else throw new Error((data as any).message || "Failed to fetch timetable");
    } finally {
      setLoading((p) => ({ ...p, sessions: false }));
    }
  };

  const fetchTrimesters = async () => {
    setLoading((p) => ({ ...p, trimesters: true }));
    try {
      const res = await getTrimesters();
      const list = (res as any)?.data || [];
      setTrimesters(list);

      const active = list.find((x: ApiTrimester) => x.status === "active");
      const pick = active || list[0];
      if (pick) setSelectedTrimesterId(String(pick.id));
    } finally {
      setLoading((p) => ({ ...p, trimesters: false }));
    }
  };

  useEffect(() => {
    setError("");
    Promise.all([
      fetchRooms(),
      fetchSubjects(),
      fetchTeachers(),
      fetchProgramms(),
      fetchSessions(),
      fetchTrimesters(),
    ]).catch((e) => {
      console.error(e);
      setError(e?.message || "Failed to load gap finder data.");
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* =========================
     Options / Defaults
  ========================= */
  const classroomRoomOptions = useMemo(
    () => rooms.filter((r) => r.room_type === "lecture_hall" || r.room_type === "lab"),
    [rooms]
  );

  const seminarRoomOptions = useMemo(
    () => rooms.filter((r) => r.room_type === "seminar_room"),
    [rooms]
  );

  // When tab changes, apply friendly defaults
  useEffect(() => {
    if (activeTab === "seminar") {
      const first = seminarRoomOptions[0];
      setSelectedRoomId(first ? first.id : "");
      setSelectedRoomType("seminar_room");
    } else if (activeTab === "classroom") {
      const first = classroomRoomOptions[0];
      setSelectedRoomId(first ? first.id : "");
      setSelectedRoomType("");
    } else {
      // weekly
      setSelectedRoomType("");
      // keep room optional
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, seminarRoomOptions.length, classroomRoomOptions.length]);

  const selectedTrimesterObj = useMemo(() => {
    if (!selectedTrimesterId) return null;
    return trimesters.find((t) => String(t.id) === String(selectedTrimesterId)) || null;
  }, [trimesters, selectedTrimesterId]);

  const selectedRoom = useMemo(
    () => rooms.find((r) => Number(r.id) === Number(selectedRoomId)) || null,
    [rooms, selectedRoomId]
  );

  const isDataLoading =
    loading.rooms ||
    loading.subjects ||
    loading.teachers ||
    loading.programms ||
    loading.sessions ||
    loading.trimesters;

  /* =========================
     Core Filter: Trimester + Day (routine)
     IMPORTANT:
     - We assume sessions are routine (no date)
     - We compute gaps from day schedule
  ========================= */
  const filteredSessions = useMemo(() => {
    const selRoom = selectedRoomId === "" ? NaN : Number(selectedRoomId);
    const selProg = selectedProgramId === "" ? NaN : Number(selectedProgramId);
    const selSub = selectedSubjectId === "" ? NaN : Number(selectedSubjectId);

    return (sessions || [])
      .filter((s: any) => {
        if (!selectedTrimesterId) return true;
        // some APIs use trimister_id vs trimester_id — support both
        const tri = s.trimester_id ?? s.trimister_id;
        return String(tri) === String(selectedTrimesterId);
      })
      .filter((s: any) => {
        if (activeTab === "weekly") return true;
        return String(s.day) === String(selectedDay);
      })
      .filter((s: any) => {
        const rid = Number(s.room_id);
        return Number.isNaN(selRoom) ? true : rid === selRoom;
      })
      .filter((s: any) => {
        const pid = Number(s.programm_id);
        return Number.isNaN(selProg) ? true : pid === selProg;
      })
      .filter((s: any) => {
        const sid = Number(s.subject_id);
        return Number.isNaN(selSub) ? true : sid === selSub;
      })
      .filter((s: any) => {
        if (!selectedRoomType) return true;
        const room = rooms.find((r) => Number(r.id) === Number(s.room_id));
        return room?.room_type === selectedRoomType;
      })
      .filter((s: any) => {
        if (activeTab === "seminar") return s.class_type === "Seminar";
        return true;
      })
      .map((s: any) => ({
        ...s,
        start_time: normalizeTimeHM(s.start_time),
        end_time: normalizeTimeHM(s.end_time),
      }));
  }, [
    sessions,
    rooms,
    selectedTrimesterId,
    selectedDay,
    selectedRoomId,
    selectedProgramId,
    selectedSubjectId,
    selectedRoomType,
    activeTab,
  ]);

  /* =========================
     Timeline Builder
     Given a day + session list, produce:
     [gap, busy, gap, busy, ...]
  ========================= */
  const buildTimelineForDay = (day: Day, list: any[]): TimelineSlot[] => {
    const daySessions = list
      .filter((s) => String(s.day) === String(day))
      .sort((a, b) => toMinutes(a.start_time) - toMinutes(b.start_time));

    // full-day free
    if (!daySessions.length) {
      return [
        {
          type: "gap",
          start: toHHMM(START_HOUR * 60),
          end: toHHMM(END_HOUR * 60),
          duration: END_HOUR - START_HOUR,
        },
      ];
    }

    const slots: TimelineSlot[] = [];
    let cursor = START_HOUR * 60;

    // leading gap
    const firstStart = toMinutes(daySessions[0].start_time);
    if (firstStart > cursor) {
      slots.push({
        type: "gap",
        start: toHHMM(cursor),
        end: daySessions[0].start_time,
        duration: (firstStart - cursor) / 60,
      });
      cursor = firstStart;
    }

    // busy + middle gaps
    for (let i = 0; i < daySessions.length; i++) {
      const s = daySessions[i];
      const start = toMinutes(s.start_time);
      const end = toMinutes(s.end_time);

      // busy block
      const room = rooms.find((r) => Number(r.id) === Number(s.room_id));
      slots.push({
        type: "busy",
        start: s.start_time,
        end: s.end_time,
        duration: Math.max(0, (end - start) / 60),
        class_type: s.class_type,

        subject: s.subject?.subject_name,
        code: s.subject?.subject_code,
        teacher: s.teacher?.full_name,
        program: s.programm?.program_name,
        enrolled: s.enrolled_students ? Number(s.enrolled_students) : null,
        capacity: room?.capacity ?? s.room?.capacity,
        roomName: room?.room_name ?? s.room?.room_name,
      });

      cursor = Math.max(cursor, end);

      const next = daySessions[i + 1];
      if (next) {
        const nextStart = toMinutes(next.start_time);
        if (nextStart > cursor) {
          slots.push({
            type: "gap",
            start: s.end_time,
            end: next.start_time,
            duration: (nextStart - cursor) / 60,
          });
          cursor = nextStart;
        }
      }
    }

    // trailing gap
    const dayEnd = END_HOUR * 60;
    if (cursor < dayEnd) {
      slots.push({
        type: "gap",
        start: toHHMM(cursor),
        end: toHHMM(dayEnd),
        duration: (dayEnd - cursor) / 60,
      });
    }

    return slots;
  };

  // Timeline output
  const timeline = useMemo<TimelineSlot[]>(() => {
    if (activeTab === "weekly") return [];
    return buildTimelineForDay(selectedDay, filteredSessions);
  }, [activeTab, selectedDay, filteredSessions]);

  // Weekly map
  const weeklyTimeline = useMemo(() => {
    if (activeTab !== "weekly") return null;
    const map: Record<string, TimelineSlot[]> = {};
    for (const d of DAYS) map[d] = buildTimelineForDay(d, filteredSessions);
    return map;
  }, [activeTab, filteredSessions]);

  /* =========================
     Stats
  ========================= */
  const stats = useMemo(() => {
    const list =
      activeTab === "weekly" ? Object.values(weeklyTimeline || {}).flat() : timeline;

    const gaps = list.filter((t) => t.type === "gap") as TimelineGap[];
    const busy = list.filter((t) => t.type === "busy") as TimelineBusy[];

    return {
      totalFreeSlots: gaps.length,
      longestGap: gaps.length ? Math.max(...gaps.map((g) => g.duration)) : 0,
      firstFreeSlot: gaps.length ? `${gaps[0].start} - ${gaps[0].end}` : "None",
      totalUsedHours: busy.reduce((sum, b) => sum + b.duration, 0),
    };
  }, [timeline, weeklyTimeline, activeTab]);

  /* =========================
     Actions
  ========================= */
  const refresh = async () => {
    setError("");
    try {
      await fetchSessions();
    } catch (e: any) {
      setError(e?.message || "Failed to fetch timetable");
    }
  };

  const clearFilters = () => {
    setSelectedRoomId("");
    setSelectedProgramId("");
    setSelectedSubjectId("");
    setSelectedRoomType(activeTab === "seminar" ? "seminar_room" : "");
    setSelectedDay(todayDay());
  };

  /* =========================
     UI
  ========================= */
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-primary-blue mb-2">Gap Finder</h1>
          <p className="text-body">
            Find available time slots using routine timetable sessions (Trimester + Day)
          </p>

          <p className="text-xs text-gray-500 mt-1">
            Trimester: <b>{selectedTrimesterObj?.name || "—"}</b>{" "}
            {selectedTrimesterObj ? (
              <>
                ({dateOnly(selectedTrimesterObj.start_date)} → {dateOnly(selectedTrimesterObj.end_date)})
              </>
            ) : null}
            {" • "}
            {activeTab === "weekly" ? (
              <>Mode: <b>Weekly</b></>
            ) : (
              <>Day: <b>{selectedDay}</b></>
            )}
            {" • "}
            Matched: <b>{filteredSessions.length}</b>
          </p>
        </div>

        <button
          onClick={() => setShowExportModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary-blue text-white rounded-xl hover:opacity-90 transition-opacity shadow-md"
        >
          <Download className="w-4 h-4" />
          Export to PDF
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 bg-white rounded-lg p-2 shadow-card border border-light w-fit">
        <button
          onClick={() => setActiveTab("classroom")}
          className={`px-6 py-3 rounded-lg transition-all ${
            activeTab === "classroom"
              ? "bg-primary-blue text-white shadow-md"
              : "text-body hover:bg-soft"
          }`}
        >
          Classroom Gaps
        </button>
        <button
          onClick={() => setActiveTab("seminar")}
          className={`px-6 py-3 rounded-lg transition-all ${
            activeTab === "seminar"
              ? "bg-primary-blue text-white shadow-md"
              : "text-body hover:bg-soft"
          }`}
        >
          Seminar Hall Gaps
        </button>
        <button
          onClick={() => setActiveTab("weekly")}
          className={`px-6 py-3 rounded-lg transition-all ${
            activeTab === "weekly"
              ? "bg-primary-blue text-white shadow-md"
              : "text-body hover:bg-soft"
          }`}
        >
          Weekly Gaps
        </button>
      </div>

      {isDataLoading && (
        <div className="bg-white rounded-lg shadow-card p-5 border border-light">
          <span className="inline-flex items-center gap-2 text-body">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading Gap Finder data...
          </span>
        </div>
      )}

      {/* Filters (Upgraded UI) */}
      <div className="bg-white rounded-2xl shadow-card p-5 border border-light">
        <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-primary-blue" />
            <h2 className="text-dark">Schedule Controls</h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={refresh}
              className="px-4 py-2 rounded-lg bg-soft hover:bg-gray-100 text-sm text-body border border-light"
            >
              Refresh
            </button>

            <button
              onClick={clearFilters}
              className="px-4 py-2 rounded-lg bg-soft hover:bg-gray-100 text-sm text-body border border-light"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Primary Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          {/* Trimester */}
          <div className="lg:col-span-2">
            <label className="block text-sm text-body mb-2">Trimester *</label>
            <select
              value={selectedTrimesterId}
              onChange={(e) => setSelectedTrimesterId(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue text-sm"
            >
              <option value="">Select Trimester</option>
              {trimesters.map((t) => (
                <option key={t.id} value={String(t.id)}>
                  {t.name} ({dateOnly(t.start_date)} - {dateOnly(t.end_date)})
                </option>
              ))}
            </select>
          </div>

          {/* Day */}
          <div className={activeTab === "weekly" ? "opacity-50 pointer-events-none" : ""}>
            <label className="block text-sm text-body mb-2">Day *</label>
            <select
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value as Day)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue text-sm"
              disabled={activeTab === "weekly"}
            >
              {DAYS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            {activeTab !== "weekly" && (
              <p className="text-xs text-gray-500 mt-1">Routine view for selected day</p>
            )}
          </div>

          {/* Room */}
          <div className="lg:col-span-2">
            <label className="block text-sm text-body mb-2">
              {activeTab === "seminar" ? "Seminar Room" : "Room"}
            </label>
            <select
              value={selectedRoomId}
              onChange={(e) => setSelectedRoomId(e.target.value ? Number(e.target.value) : "")}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue text-sm"
            >
              <option value="">All Rooms</option>
              {(activeTab === "seminar" ? seminarRoomOptions : rooms).map((r) => (
                <option key={r.id} value={r.id}>
                  {r.room_name}
                </option>
              ))}
            </select>

            {selectedRoom && (
              <p className="text-xs text-gray-500 mt-1">
                Capacity: {selectedRoom.capacity ?? "—"} • Type: {selectedRoom.room_type ?? "—"}
              </p>
            )}
          </div>

          {/* Advanced toggle */}
          <div className="flex items-end">
            <button
              type="button"
              onClick={() => setShowAdvanced((p) => !p)}
              className="w-full px-4 py-2.5 rounded-xl bg-white border border-light text-sm text-body hover:bg-soft transition-colors"
            >
              {showAdvanced ? "Hide Advanced" : "Show Advanced"}
            </button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="mt-4 pt-4 border-t border-light">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {/* Room Type */}
              <div>
                <label className="block text-sm text-body mb-2">Room Type</label>
                <select
                  value={selectedRoomType}
                  onChange={(e) => setSelectedRoomType(e.target.value as any)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue text-sm"
                  disabled={activeTab === "seminar"}
                >
                  <option value="">All</option>
                  <option value="lecture_hall">Lecture Hall</option>
                  <option value="lab">Lab</option>
                  <option value="seminar_room">Seminar Room</option>
                </select>
              </div>

              {/* Program */}
              <div className="lg:col-span-2">
                <label className="block text-sm text-body mb-2">Program</label>
                <select
                  value={selectedProgramId}
                  onChange={(e) => setSelectedProgramId(e.target.value ? Number(e.target.value) : "")}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue text-sm"
                >
                  <option value="">All Programs</option>
                  {programms.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.program_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subject */}
              <div className="lg:col-span-3">
                <label className="block text-sm text-body mb-2">Subject</label>
                <select
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value ? Number(e.target.value) : "")}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue text-sm"
                >
                  <option value="">All Subjects</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.subject_code} - {s.subject_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4 p-3 rounded-xl bg-blue-50 border border-blue-100 text-sm text-blue-800">
              ✅ Gap results are calculated from <b>routine timetable sessions</b> filtered by Trimester + Day.
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-xl shadow-card p-5 border border-light">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 bg-blue-50 rounded-lg">
              <Clock className="w-5 h-5 text-primary-blue" />
            </div>
            <p className="text-sm text-body">Total Free Slots</p>
          </div>
          <p className="text-3xl text-primary-blue">{stats.totalFreeSlots}</p>
        </div>

        <div className="bg-white rounded-xl shadow-card p-5 border border-light">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 bg-green-50 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-sm text-body">Longest Gap</p>
          </div>
          <p className="text-3xl text-green-600">{hoursDisplay(stats.longestGap)}h</p>
        </div>

        <div className="bg-white rounded-xl shadow-card p-5 border border-light">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 bg-purple-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-sm text-body">First Available Slot</p>
          </div>
          <p className="text-sm text-purple-600 mt-2">{stats.firstFreeSlot}</p>
        </div>

        <div className="bg-white rounded-xl shadow-card p-5 border border-light">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 bg-orange-50 rounded-lg">
              <Users className="w-5 h-5 text-orange-600" />
            </div>
            <p className="text-sm text-body">Total Hours Used</p>
          </div>
          <p className="text-3xl text-orange-600">{hoursDisplay(stats.totalUsedHours)}h</p>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-lg shadow-card p-6 border border-light">
        <h3 className="text-dark mb-4">
          {activeTab === "weekly" ? (
            <>Weekly Timeline • {selectedTrimesterObj?.name || "Trimester"}</>
          ) : (
            <>
              Timeline • {selectedDay} • {selectedTrimesterObj?.name || "Trimester"}{" "}
              {selectedRoom ? `- ${selectedRoom.room_name}` : "- All Rooms"}
            </>
          )}
        </h3>

        {activeTab !== "weekly" ? (
          <div className="space-y-3">
            {timeline.map((slot, index) => (
              <div
                key={index}
                className={`rounded-xl p-4 border-2 transition-all ${
                  slot.type === "gap"
                    ? "bg-gradient-to-r from-blue-50 to-sky-50 border-blue-200 hover:border-primary-blue hover:shadow-md"
                    : "bg-purple-500 text-white border-purple-500 hover:bg-purple-600"
                }`}
              >
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-4">
                    <div className={`flex items-center gap-2 ${slot.type === "gap" ? "text-primary-blue" : "text-white"}`}>
                      <Clock className="w-5 h-5" />
                      <span className="font-medium">
                        {slot.start} - {slot.end}
                      </span>
                    </div>

                    {slot.type === "busy" ? (
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {slot.code ? `${slot.code} - ` : ""}
                          {slot.subject ?? "Class"} ({slot.class_type})
                        </span>
                        <span className="text-sm opacity-90">
                          {slot.teacher ?? "—"}
                          {slot.program ? ` • ${slot.program}` : ""}
                          {slot.roomName ? ` • ${slot.roomName}` : ""}
                        </span>
                      </div>
                    ) : (
                      <span className="text-primary-blue font-medium">
                        Available ({hoursDisplay(slot.duration)}h gap)
                      </span>
                    )}
                  </div>

                  {slot.type === "busy" && (
                    <div className="flex items-center gap-3">
                      {typeof slot.enrolled === "number" && (
                        <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                          Enrolled: {slot.enrolled}
                        </span>
                      )}
                      {slot.capacity !== undefined && slot.capacity !== null && (
                        <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                          Capacity: {slot.capacity}
                        </span>
                      )}
                      <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                        {hoursDisplay(slot.duration)}h
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {DAYS.map((d) => {
              const slots = weeklyTimeline?.[d] || [];
              return (
                <div key={d} className="border border-light rounded-xl p-4">
                  <h4 className="text-dark mb-3">{d}</h4>
                  <div className="space-y-3">
                    {slots.map((slot, idx) => (
                      <div
                        key={idx}
                        className={`rounded-xl p-4 border-2 ${
                          slot.type === "gap"
                            ? "bg-blue-50 border-blue-200"
                            : "bg-purple-500 text-white border-purple-500"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3 flex-wrap">
                          <div className="flex items-center gap-3">
                            <Clock className="w-5 h-5" />
                            <span className="font-medium">
                              {slot.start} - {slot.end}
                            </span>

                            {slot.type === "gap" ? (
                              <span className="font-medium">
                                • Available ({hoursDisplay(slot.duration)}h)
                              </span>
                            ) : (
                              <span className="font-medium">
                                • {slot.code ? `${slot.code} - ` : ""}
                                {slot.subject ?? "Class"} ({slot.class_type})
                              </span>
                            )}
                          </div>

                          {slot.type === "busy" && (
                            <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                              {hoursDisplay(slot.duration)}h
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <>
          <div
            className="fixed inset-0 bg-white/40 backdrop-blur-sm z-50"
            onClick={() => setShowExportModal(false)}
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full shadow-2xl">
              <div className="border-b border-light px-6 py-4 flex items-center justify-between">
                <h2 className="text-primary-blue">Export Gap Report</h2>
                <button
                  onClick={() => setShowExportModal(false)}
                  className="p-2 hover:bg-soft rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-body" />
                </button>
              </div>

              <div className="p-6">
                <p className="text-body mb-6">
                  Export the current gap finder view as a PDF report. (Implement PDF later.)
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      alert("PDF Export functionality would be implemented here");
                      setShowExportModal(false);
                    }}
                    className="flex-1 px-4 py-3 bg-primary-blue text-white rounded-xl hover:opacity-90 transition-opacity"
                  >
                    Export PDF
                  </button>
                  <button
                    onClick={() => setShowExportModal(false)}
                    className="flex-1 px-4 py-3 bg-gray-100 text-body rounded-xl hover:bg-gray-200 transition-colors"
                  >
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
