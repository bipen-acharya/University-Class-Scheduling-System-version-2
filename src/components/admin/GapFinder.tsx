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
  RefreshCcw,
} from "lucide-react";
import { toast } from "sonner";

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

/** ========================= Types ========================= */
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
  duration: number;
};
type TimelineBusy = {
  type: "busy";
  start: string;
  end: string;
  duration: number;
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

/** ========================= Constants ========================= */
const DAYS: Day[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
const START_HOUR = 8;
const END_HOUR = 20;

/** ========================= Helpers ========================= */
const dateOnly = (v: any) => String(v || "").slice(0, 10);
const normalizeTimeHM = (t: any) =>
  String(t || "")
    .trim()
    .slice(0, 5);
const toMinutes = (hhmm: string) => {
  const [h, m] = normalizeTimeHM(hhmm).split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
};
const toHHMM = (mins: number) =>
  `${String(Math.floor(mins / 60)).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")}`;
const todayDay = (): Day => {
  const map: Day[] = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return map[new Date().getDay()] as Day;
};
const hoursDisplay = (h: number) =>
  Number.isInteger(Number(h)) ? String(Number(h)) : Number(h).toFixed(1);

/** ========================= Skeleton ========================= */
function StatSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-card p-5 border border-light">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-lg bg-gray-200 animate-pulse" />
        <div className="h-3.5 w-28 rounded bg-gray-200 animate-pulse" />
      </div>
      <div className="h-9 w-16 rounded bg-gray-200 animate-pulse" />
    </div>
  );
}

function TimelineSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className={`rounded-xl p-4 border-2 border-gray-200 ${i % 2 === 0 ? "bg-gray-50" : "bg-gray-100"}`}
        >
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 rounded bg-gray-200 animate-pulse flex-shrink-0" />
            <div className="h-4 w-32 rounded bg-gray-200 animate-pulse" />
            <div className="h-4 w-48 rounded bg-gray-200 animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** ========================= Main Component ========================= */
export default function GapFinder() {
  const [activeTab, setActiveTab] = useState<FinderTab>("classroom");
  const [showExportModal, setShowExportModal] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [exporting, setExporting] = useState(false); // ← NEW

  const [trimesters, setTrimesters] = useState<ApiTrimester[]>([]);
  const [selectedTrimesterId, setSelectedTrimesterId] = useState<string>("");
  const [selectedDay, setSelectedDay] = useState<Day>(() => todayDay());

  const [selectedRoomId, setSelectedRoomId] = useState<number | "">("");
  const [selectedProgramId, setSelectedProgramId] = useState<number | "">("");
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | "">("");
  const [selectedRoomType, setSelectedRoomType] = useState<
    "lecture_hall" | "lab" | "seminar_room" | ""
  >("");

  const [rooms, setRooms] = useState<ApiRoom[]>([]);   
  const [subjects, setSubjects] = useState<ApiSubject[]>([]);
  const [teachers, setTeachers] = useState<ApiTeacher[]>([]);
  const [programms, setProgramms] = useState<ApiProgramm[]>([]);
  const [sessions, setSessions] = useState<ApiTimeTableSession[]>([]);

  const [loading, setLoading] = useState({
    rooms: true,
    subjects: true,
    teachers: true,
    programms: true,
    sessions: true,
    trimesters: true,
  });

  /** ── Fetchers ── */
  const fetchRooms = async () => {
    setLoading((p) => ({ ...p, rooms: true }));
    try {
      const res = await api.get<{
        status: number;
        message: string;
        data: ApiRoom[];
      }>("/rooms");
      if (res.data.status === 1) setRooms(res.data.data || []);
      else toast.error(res.data.message || "Failed to fetch rooms.");
    } catch {
      toast.error("Failed to fetch rooms.");
    } finally {
      setLoading((p) => ({ ...p, rooms: false }));
    }
  };

  const fetchSubjects = async () => {
    setLoading((p) => ({ ...p, subjects: true }));
    try {
      const res = await api.get<{
        status: number;
        message: string;
        data: ApiSubject[];
      }>("/subjects");
      if (res.data.status === 1) setSubjects(res.data.data || []);
      else toast.error(res.data.message || "Failed to fetch subjects.");
    } catch {
      toast.error("Failed to fetch subjects.");
    } finally {
      setLoading((p) => ({ ...p, subjects: false }));
    }
  };

  const fetchTeachers = async () => {
    setLoading((p) => ({ ...p, teachers: true }));
    try {
      const res = await api.get<{
        status: number;
        message: string;
        data: ApiTeacher[];
      }>("/teachers");
      if (res.data.status === 1) setTeachers(res.data.data || []);
      else toast.error(res.data.message || "Failed to fetch teachers.");
    } catch {
      toast.error("Failed to fetch teachers.");
    } finally {
      setLoading((p) => ({ ...p, teachers: false }));
    }
  };

  const fetchProgramms = async () => {
    setLoading((p) => ({ ...p, programms: true }));
    try {
      const res = await api.get<{
        status: number;
        message: string;
        data: ApiProgramm[];
      }>("/programms");
      if (res.data.status === 1) setProgramms(res.data.data || []);
      else toast.error(res.data.message || "Failed to fetch programs.");
    } catch {
      toast.error("Failed to fetch programs.");
    } finally {
      setLoading((p) => ({ ...p, programms: false }));
    }
  };

  const fetchSessions = async () => {
    setLoading((p) => ({ ...p, sessions: true }));
    try {
      const data = await getTimeTableSessions();
      if ((data as any).status === 1) setSessions((data as any).data || []);
      else toast.error((data as any).message || "Failed to fetch timetable.");
    } catch {
      toast.error("Failed to fetch timetable sessions.");
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
    } catch {
      toast.error("Failed to fetch trimesters.");
    } finally {
      setLoading((p) => ({ ...p, trimesters: false }));
    }
  };

  useEffect(() => {
    Promise.all([
      fetchRooms(),
      fetchSubjects(),
      fetchTeachers(),
      fetchProgramms(),
      fetchSessions(),
      fetchTrimesters(),
    ]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isDataLoading = Object.values(loading).some(Boolean);

  /** ── Room option lists ── */
  const classroomRoomOptions = useMemo(
    () =>
      rooms.filter(
        (r) => r.room_type === "lecture_hall" || r.room_type === "lab",
      ),
    [rooms],
  );
  const seminarRoomOptions = useMemo(
    () => rooms.filter((r) => r.room_type === "seminar_room"),
    [rooms],
  );

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
      setSelectedRoomType("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, seminarRoomOptions.length, classroomRoomOptions.length]);

  const selectedTrimesterObj = useMemo(
    () =>
      trimesters.find((t) => String(t.id) === String(selectedTrimesterId)) ||
      null,
    [trimesters, selectedTrimesterId],
  );

  const selectedRoom = useMemo(
    () => rooms.find((r) => Number(r.id) === Number(selectedRoomId)) || null,
    [rooms, selectedRoomId],
  );

  /** ── Filtered sessions ── */
  const filteredSessions = useMemo(() => {
    const selRoom = selectedRoomId === "" ? NaN : Number(selectedRoomId);
    const selProg = selectedProgramId === "" ? NaN : Number(selectedProgramId);
    const selSub = selectedSubjectId === "" ? NaN : Number(selectedSubjectId);

    return (sessions || [])
      .filter((s: any) => {
        if (!selectedTrimesterId) return true;
        const tri = s.trimester_id ?? s.trimister_id;
        return String(tri) === String(selectedTrimesterId);
      })
      .filter((s: any) =>
        activeTab === "weekly" ? true : String(s.day) === String(selectedDay),
      )
      .filter((s: any) =>
        Number.isNaN(selRoom) ? true : Number(s.room_id) === selRoom,
      )
      .filter((s: any) =>
        Number.isNaN(selProg) ? true : Number(s.programm_id) === selProg,
      )
      .filter((s: any) =>
        Number.isNaN(selSub) ? true : Number(s.subject_id) === selSub,
      )
      .filter((s: any) => {
        if (!selectedRoomType) return true;
        const room = rooms.find((r) => Number(r.id) === Number(s.room_id));
        return room?.room_type === selectedRoomType;
      })
      .filter((s: any) =>
        activeTab === "seminar" ? s.class_type === "Seminar" : true,
      )
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

  /** ── Timeline builder ── */
  const buildTimelineForDay = (day: Day, list: any[]): TimelineSlot[] => {
    const daySessions = list
      .filter((s) => String(s.day) === String(day))
      .sort((a, b) => toMinutes(a.start_time) - toMinutes(b.start_time));

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

    for (let i = 0; i < daySessions.length; i++) {
      const s = daySessions[i];
      const start = toMinutes(s.start_time);
      const end = toMinutes(s.end_time);
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

    if (cursor < END_HOUR * 60) {
      slots.push({
        type: "gap",
        start: toHHMM(cursor),
        end: toHHMM(END_HOUR * 60),
        duration: (END_HOUR * 60 - cursor) / 60,
      });
    }

    return slots;
  };

  const timeline = useMemo<TimelineSlot[]>(() => {
    if (activeTab === "weekly") return [];
    return buildTimelineForDay(selectedDay, filteredSessions);
  }, [activeTab, selectedDay, filteredSessions]);

  const weeklyTimeline = useMemo(() => {
    if (activeTab !== "weekly") return null;
    const map: Record<string, TimelineSlot[]> = {};
    for (const d of DAYS) map[d] = buildTimelineForDay(d, filteredSessions);
    return map;
  }, [activeTab, filteredSessions]);

  /** ── Stats ── */
  const stats = useMemo(() => {
    const list =
      activeTab === "weekly"
        ? Object.values(weeklyTimeline || {}).flat()
        : timeline;
    const gaps = list.filter((t) => t.type === "gap") as TimelineGap[];
    const busy = list.filter((t) => t.type === "busy") as TimelineBusy[];
    return {
      totalFreeSlots: gaps.length,
      longestGap: gaps.length ? Math.max(...gaps.map((g) => g.duration)) : 0,
      firstFreeSlot: gaps.length ? `${gaps[0].start} – ${gaps[0].end}` : "None",
      totalUsedHours: busy.reduce((sum, b) => sum + b.duration, 0),
    };
  }, [timeline, weeklyTimeline, activeTab]);

  const refresh = async () => {
    await fetchSessions();
    toast.success("Gap data refreshed.");
  };

  const clearFilters = () => {
    setSelectedRoomId("");
    setSelectedProgramId("");
    setSelectedSubjectId("");
    setSelectedRoomType(activeTab === "seminar" ? "seminar_room" : "");
    setSelectedDay(todayDay());
  };

  const hasAdvancedFilters = !!(
    selectedProgramId ||
    selectedSubjectId ||
    selectedRoomType
  );

  // ─────────────────────────────────────────────
  // Export PDF — calls /timetable/export-gap-pdf
  // ─────────────────────────────────────────────
  const handleExportPDF = async () => {
    try {
      setExporting(true);

      const response = await api.get("/timetable/export-gap-pdf", {
        params: {
          view: activeTab,
          day: activeTab !== "weekly" ? selectedDay : "",
          trimister_id: selectedTrimesterId || "",
          room_id: selectedRoomId || "",
          programm_id: selectedProgramId || "",
          subject_id: selectedSubjectId || "",
          room_type: selectedRoomType || "",
        },
        responseType: "blob",
      });

      // Guard: make sure we actually got a PDF back
      const contentType = response.headers["content-type"] || "";
      if (!contentType.includes("application/pdf")) {
        toast.error("Backend did not return a PDF. Please try again.");
        return;
      }

      // Trigger browser download
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `gap-finder-${activeTab}-${activeTab !== "weekly" ? selectedDay + "-" : ""}${selectedTrimesterId || "all"}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success("PDF downloaded successfully.");
      setShowExportModal(false);
    } catch {
      toast.error("Failed to export PDF. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  /** ========================= Render ========================= */
  return (
    <div className="space-y-5">
      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-primary-blue mb-1">Gap Finder</h1>
          <p className="text-body text-sm">
            Find available time slots from routine timetable sessions
          </p>
        </div>
        <button
          onClick={() => setShowExportModal(true)}
          disabled={exporting}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary-blue text-white rounded-xl hover:opacity-90 active:scale-[0.97] active:opacity-80 transition-all duration-150 shadow-md select-none cursor-pointer text-sm disabled:opacity-60"
        >
          {exporting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Exporting…
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              Export PDF
            </>
          )}
        </button>
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 bg-white rounded-xl p-1.5 shadow-card border border-light w-fit">
        {(
          [
            { id: "classroom", label: "Classroom Gaps" },
            { id: "seminar", label: "Seminar Hall" },
            { id: "weekly", label: "Weekly" },
          ] as const
        ).map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer ${
              activeTab === id
                ? "bg-primary-blue text-white shadow-sm"
                : "text-body hover:bg-soft"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Controls ── */}
      <div className="bg-white rounded-xl shadow-card p-4 border border-light">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Trimester */}
          <select
            value={selectedTrimesterId}
            onChange={(e) => setSelectedTrimesterId(e.target.value)}
            className="flex-1 min-w-[160px] px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue text-sm cursor-pointer"
          >
            <option value="">Select Trimester</option>
            {trimesters.map((t) => (
              <option key={t.id} value={String(t.id)}>
                {t.name} ({dateOnly(t.start_date)} – {dateOnly(t.end_date)})
              </option>
            ))}
          </select>

          {/* Day (hidden for weekly) */}
          {activeTab !== "weekly" && (
            <select
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value as Day)}
              className="px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue text-sm cursor-pointer"
            >
              {DAYS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          )}

          {/* Room */}
          <select
            value={selectedRoomId}
            onChange={(e) =>
              setSelectedRoomId(e.target.value ? Number(e.target.value) : "")
            }
            className="flex-1 min-w-[140px] px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue text-sm cursor-pointer"
          >
            <option value="">All Rooms</option>
            {(activeTab === "seminar" ? seminarRoomOptions : rooms).map((r) => (
              <option key={r.id} value={r.id}>
                {r.room_name}
              </option>
            ))}
          </select>

          {/* Advanced toggle */}
          <button
            onClick={() => setShowAdvanced((p) => !p)}
            className={`px-3 py-2.5 rounded-xl border text-sm transition-colors cursor-pointer flex items-center gap-1.5 ${
              showAdvanced || hasAdvancedFilters
                ? "border-primary-blue text-primary-blue bg-blue-50"
                : "border-gray-300 text-body hover:bg-soft"
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            {showAdvanced ? "Hide" : "Advanced"}
            {hasAdvancedFilters && (
              <span className="w-1.5 h-1.5 rounded-full bg-primary-blue" />
            )}
          </button>

          {/* Clear */}
          <button
            onClick={clearFilters}
            className="px-3 py-2.5 border border-gray-300 rounded-xl text-sm text-body hover:bg-soft active:bg-soft/80 transition-colors cursor-pointer"
          >
            Clear
          </button>

          {/* Refresh */}
          <button
            onClick={refresh}
            disabled={isDataLoading}
            className="p-2.5 border border-gray-300 rounded-xl text-body hover:bg-soft active:bg-soft/80 transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh"
          >
            {isDataLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCcw className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Advanced filters */}
        {showAdvanced && (
          <div className="mt-3 pt-3 border-t border-light grid grid-cols-1 sm:grid-cols-3 gap-3">
            <select
              value={selectedRoomType}
              onChange={(e) => setSelectedRoomType(e.target.value as any)}
              disabled={activeTab === "seminar"}
              className="px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue cursor-pointer disabled:opacity-50"
            >
              <option value="">All Room Types</option>
              <option value="lecture_hall">Lecture Hall</option>
              <option value="lab">Lab</option>
              <option value="seminar_room">Seminar Room</option>
            </select>

            <select
              value={selectedProgramId}
              onChange={(e) =>
                setSelectedProgramId(
                  e.target.value ? Number(e.target.value) : "",
                )
              }
              className="px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue cursor-pointer"
            >
              <option value="">All Programs</option>
              {programms.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.program_name}
                </option>
              ))}
            </select>

            <select
              value={selectedSubjectId}
              onChange={(e) =>
                setSelectedSubjectId(
                  e.target.value ? Number(e.target.value) : "",
                )
              }
              className="px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue cursor-pointer"
            >
              <option value="">All Subjects</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.subject_code} – {s.subject_name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Room info strip */}
        {selectedRoom && (
          <div className="mt-3 flex items-center gap-3 text-xs text-body">
            <span className="font-medium text-dark">
              {selectedRoom.room_name}
            </span>
            <span>
              Cap:{" "}
              <span className="font-medium text-dark">
                {selectedRoom.capacity ?? "—"}
              </span>
            </span>
            <span>
              Type:{" "}
              <span className="font-medium text-dark">
                {selectedRoom.room_type ?? "—"}
              </span>
            </span>
          </div>
        )}
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {isDataLoading
          ? Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i} />)
          : [
              {
                label: "Free Slots",
                value: stats.totalFreeSlots,
                unit: "",
                color: "text-primary-blue",
                icon: <Clock className="w-5 h-5 text-primary-blue" />,
                bg: "bg-blue-50",
              },
              {
                label: "Longest Gap",
                value: hoursDisplay(stats.longestGap),
                unit: "h",
                color: "text-green-600",
                icon: <TrendingUp className="w-5 h-5 text-green-600" />,
                bg: "bg-green-50",
              },
              {
                label: "First Available",
                value: stats.firstFreeSlot,
                unit: "",
                color: "text-purple-600",
                icon: <CheckCircle className="w-5 h-5 text-purple-600" />,
                bg: "bg-purple-50",
              },
              {
                label: "Total Hours Used",
                value: hoursDisplay(stats.totalUsedHours),
                unit: "h",
                color: "text-orange-600",
                icon: <Users className="w-5 h-5 text-orange-600" />,
                bg: "bg-orange-50",
              },
            ].map(({ label, value, unit, color, icon, bg }) => (
              <div
                key={label}
                className="bg-white rounded-xl shadow-card p-4 border border-light"
              >
                <div className="flex items-center gap-2.5 mb-2">
                  <div className={`p-2 ${bg} rounded-lg flex-shrink-0`}>
                    {icon}
                  </div>
                  <p className="text-xs text-body">{label}</p>
                </div>
                <p className={`text-2xl font-bold ${color} truncate`}>
                  {value}
                  {unit}
                </p>
              </div>
            ))}
      </div>

      {/* ── Timeline ── */}
      <div className="bg-white rounded-xl shadow-card p-5 border border-light">
        <h3 className="text-dark text-sm font-medium mb-4 flex items-center justify-between flex-wrap gap-2">
          <span>
            {activeTab === "weekly" ? (
              <>
                Weekly Timeline ·{" "}
                <span className="text-body font-normal">
                  {selectedTrimesterObj?.name || "Trimester"}
                </span>
              </>
            ) : (
              <>
                {selectedDay} ·{" "}
                <span className="text-body font-normal">
                  {selectedTrimesterObj?.name || "Trimester"}
                  {selectedRoom ? ` · ${selectedRoom.room_name}` : ""}
                </span>
              </>
            )}
          </span>
          <span className="text-xs text-body font-normal">
            {filteredSessions.length} session
            {filteredSessions.length !== 1 ? "s" : ""} matched
          </span>
        </h3>

        {isDataLoading ? (
          <TimelineSkeleton />
        ) : activeTab !== "weekly" ? (
          <div className="space-y-3">
            {timeline.map((slot, index) => {
              const prevSlot = index > 0 ? timeline[index - 1] : null;
              const typeChanged = prevSlot && prevSlot.type !== slot.type;
              return (
                <div key={index}>
                  {typeChanged && (
                    <div className="flex items-center gap-2 my-1">
                      <div className="flex-1 h-px bg-gray-200" />
                    </div>
                  )}
                  <div
                    className={`rounded-xl px-5 py-4 border flex items-center justify-between flex-wrap gap-4 ${
                      slot.type === "gap"
                        ? "bg-green-50 border-green-300 hover:border-green-500 hover:shadow-sm transition-all border-l-4 border-l-green-500"
                        : "border-l-4 border-l-indigo-800 border-indigo-500"
                    }`}
                    style={
                      slot.type === "busy"
                        ? {
                            background:
                              "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
                            borderColor: "#4338ca",
                          }
                        : undefined
                    }
                  >
                    <div className="flex items-center gap-4 flex-wrap">
                      <div
                        className={`flex items-center gap-2 flex-shrink-0 ${slot.type === "gap" ? "text-green-700" : "text-white"}`}
                      >
                        <Clock className="w-4 h-4 flex-shrink-0" />
                        <span className="font-bold text-sm tabular-nums whitespace-nowrap">
                          {slot.start} – {slot.end}
                        </span>
                      </div>

                      {slot.type === "busy" ? (
                        <div>
                          <p className="text-sm font-semibold text-white">
                            {slot.code ? (
                              <span className="px-2 py-0.5 bg-white/20 rounded-md text-xs font-bold mr-2">
                                {slot.code}
                              </span>
                            ) : null}
                            {slot.subject ?? "Class"}{" "}
                            <span
                              className="font-normal text-xs"
                              style={{ color: "rgba(255,255,255,0.72)" }}
                            >
                              ({slot.class_type})
                            </span>
                          </p>
                          <p
                            className="text-xs mt-0.5"
                            style={{ color: "rgba(255,255,255,0.65)" }}
                          >
                            {[slot.teacher, slot.program, slot.roomName]
                              .filter(Boolean)
                              .join(" · ")}
                          </p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-sm font-bold text-green-800">
                            Available — {hoursDisplay(slot.duration)}h free
                          </p>
                          <p className="text-xs text-green-600 mt-0.5">
                            This slot is open for booking
                          </p>
                        </div>
                      )}
                    </div>

                    {slot.type === "busy" ? (
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {typeof slot.enrolled === "number" && (
                          <span className="px-3 py-1 bg-white/15 border border-white/20 rounded-full text-xs font-medium text-white/90">
                            👥 {slot.enrolled} enrolled
                          </span>
                        )}
                        {slot.capacity != null && (
                          <span className="px-3 py-1 bg-white/15 border border-white/20 rounded-full text-xs font-medium text-white/90">
                            Cap: {slot.capacity}
                          </span>
                        )}
                        <span className="px-3 py-1.5 bg-white/20 border border-white/30 text-white rounded-full text-xs font-bold">
                          {hoursDisplay(slot.duration)}h
                        </span>
                      </div>
                    ) : (
                      <span className="px-3 py-1.5 bg-green-500 text-white rounded-full text-xs font-semibold flex-shrink-0">
                        {hoursDisplay(slot.duration)}h free
                      </span>
                    )}
                  </div>
                </div>
              );
            })}

            {timeline.length === 0 && (
              <div className="text-center py-10 text-body text-sm">
                <Clock className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                No sessions found for {selectedDay}. Try different filters.
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-5">
            {DAYS.map((d) => {
              const slots = weeklyTimeline?.[d] || [];
              const gapCount = slots.filter((s) => s.type === "gap").length;
              const busyCount = slots.filter((s) => s.type === "busy").length;
              return (
                <div
                  key={d}
                  className="border border-light rounded-xl overflow-hidden"
                >
                  <div className="bg-soft px-4 py-2.5 flex items-center justify-between border-b border-light">
                    <h4 className="text-sm font-medium text-dark">{d}</h4>
                    <div className="flex items-center gap-2 text-xs text-body">
                      <span className="px-2 py-0.5 bg-blue-50 text-primary-blue rounded-full">
                        {gapCount} free
                      </span>
                      <span className="px-2 py-0.5 bg-purple-50 text-purple-600 rounded-full">
                        {busyCount} busy
                      </span>
                    </div>
                  </div>
                  <div className="p-3 space-y-2">
                    {slots.map((slot, idx) => (
                      <div
                        key={idx}
                        className={`rounded-lg px-3 py-2.5 flex items-center justify-between gap-3 border ${
                          slot.type === "gap"
                            ? "bg-blue-50 border-blue-100"
                            : "bg-purple-500 text-white border-purple-500"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="text-xs font-medium">
                            {slot.start} – {slot.end}
                          </span>
                          {slot.type === "gap" ? (
                            <span className="text-xs text-primary-blue">
                              Available ({hoursDisplay(slot.duration)}h)
                            </span>
                          ) : (
                            <span className="text-xs truncate">
                              {slot.code ? `${slot.code} · ` : ""}
                              {slot.subject ?? "Class"} ({slot.class_type})
                            </span>
                          )}
                        </div>
                        {slot.type === "busy" && (
                          <span className="text-xs px-2 py-0.5 bg-white/20 rounded-full flex-shrink-0">
                            {hoursDisplay(slot.duration)}h
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Export Modal ── */}
      {showExportModal && (
        <>
          <div
            className="fixed inset-0 bg-white/40 backdrop-blur-sm z-50"
            onClick={() => !exporting && setShowExportModal(false)}
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full shadow-2xl">
              <div className="border-b border-light px-6 py-4 flex items-center justify-between">
                <h2 className="text-primary-blue">Export Gap Report</h2>
                <button
                  onClick={() => !exporting && setShowExportModal(false)}
                  disabled={exporting}
                  className="p-2 hover:bg-soft rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                >
                  <X className="w-5 h-5 text-body" />
                </button>
              </div>

              <div className="p-6">
                {/* Summary of what will be exported */}
                <div className="mb-5 p-3 bg-soft rounded-xl border border-light space-y-1.5 text-xs text-body">
                  <div className="flex justify-between">
                    <span>View</span>
                    <span className="font-medium text-dark capitalize">
                      {activeTab}
                    </span>
                  </div>
                  {activeTab !== "weekly" && (
                    <div className="flex justify-between">
                      <span>Day</span>
                      <span className="font-medium text-dark">
                        {selectedDay}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Trimester</span>
                    <span className="font-medium text-dark">
                      {selectedTrimesterObj?.name || "All"}
                    </span>
                  </div>
                  {selectedRoom && (
                    <div className="flex justify-between">
                      <span>Room</span>
                      <span className="font-medium text-dark">
                        {selectedRoom.room_name}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Sessions matched</span>
                    <span className="font-medium text-dark">
                      {filteredSessions.length}
                    </span>
                  </div>
                </div>

                <p className="text-body text-sm mb-5">
                  Export the current gap finder view as a PDF report with the
                  filters above applied.
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={handleExportPDF}
                    disabled={exporting}
                    className="flex-1 py-3 bg-primary-blue text-white rounded-xl hover:opacity-90 active:opacity-80 active:scale-[0.98] transition-all duration-150 font-medium cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {exporting ? (
                      <span className="inline-flex items-center gap-2 justify-center">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Exporting…
                      </span>
                    ) : (
                      "Export PDF"
                    )}
                  </button>
                  <button
                    onClick={() => setShowExportModal(false)}
                    disabled={exporting}
                    className="flex-1 py-3 bg-gray-100 text-body rounded-xl hover:bg-gray-200 active:bg-gray-300 active:scale-[0.98] transition-all duration-150 font-medium cursor-pointer disabled:opacity-50"
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
