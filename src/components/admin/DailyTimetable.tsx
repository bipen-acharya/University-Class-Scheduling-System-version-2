// DailyTimetable.tsx
import { useEffect, useMemo, useState } from "react";
import {
  Calendar,
  Filter,
  Plus,
  X,
  Download,
  Eye,
  Edit,
  Trash2,
  ZoomIn,
  ZoomOut,
  Users,
  ChevronLeft,
  ChevronRight,
  RefreshCcw,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

import { todayDay } from "../../data/mockData";
import { isClassRunning as isClassRunningMock } from "../../data/mockData";

import {
  Day,
  ClassType,
  ApiProgramm,
  ApiRoom,
  ApiSubject,
  ApiTeacher,
  ApiTimeTableSession,
} from "../../types/timetable";

import {
  getTimeTableSessions,
  createTimeTableSession,
  updateTimeTableSession,
  deleteTimeTableSession,
} from "../../services/timetable";

import {
  getPrograms,
  getRooms,
  getSubjects,
  getTeachers,
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

interface ExtendedClassSession {
  id: number;
  day: Day;
  date: string | null;
  startTime: string;
  endTime: string;
  trimesterId: number;
  programmId: number;
  subjectId: number;
  teacherId: number;
  roomId: number;
  programName: string;
  level: string;
  classType: ClassType;
  enrolledStudents: number;
  trimester?: ApiTrimester;
  programm?: ApiProgramm;
  subject?: ApiSubject;
  teacher?: ApiTeacher;
  room?: ApiRoom;
}

/** ========================= Constants ========================= */
const programColors: Record<
  string,
  { bg: string; hover: string; light: string; text: string; border: string }
> = {
  ICT: {
    bg: "bg-blue-500",
    hover: "hover:bg-blue-600",
    light: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
  },
  Nursing: {
    bg: "bg-pink-500",
    hover: "hover:bg-pink-600",
    light: "bg-pink-50",
    text: "text-pink-700",
    border: "border-pink-200",
  },
  Business: {
    bg: "bg-yellow-500",
    hover: "hover:bg-yellow-600",
    light: "bg-yellow-50",
    text: "text-yellow-700",
    border: "border-yellow-200",
  },
  Engineering: {
    bg: "bg-green-500",
    hover: "hover:bg-green-600",
    light: "bg-green-50",
    text: "text-green-700",
    border: "border-green-200",
  },
  Psychology: {
    bg: "bg-purple-500",
    hover: "hover:bg-purple-600",
    light: "bg-purple-50",
    text: "text-purple-700",
    border: "border-purple-200",
  },
  "Masters of ICT": {
    bg: "bg-indigo-600",
    hover: "hover:bg-indigo-700",
    light: "bg-indigo-50",
    text: "text-indigo-700",
    border: "border-indigo-200",
  },
  "Bachelor of ICT": {
    bg: "bg-cyan-500",
    hover: "hover:bg-cyan-600",
    light: "bg-cyan-50",
    text: "text-cyan-700",
    border: "border-cyan-200",
  },
  "Bachelor of Nursing": {
    bg: "bg-rose-500",
    hover: "hover:bg-rose-600",
    light: "bg-rose-50",
    text: "text-rose-700",
    border: "border-rose-200",
  },
};

const DEFAULT_COLOR = programColors.ICT;

const days: Day[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const timeSlots = Array.from({ length: 12 }, (_, i) => {
  const hour = i + 8;
  return `${hour.toString().padStart(2, "0")}:00`;
});

const isWeekendDay = (day: Day) => day === "Saturday" || day === "Sunday";

/** ========================= Helpers ========================= */
const normalizeTimeHM = (t: string) => {
  if (!t) return "";
  const sliced = String(t).trim().slice(0, 5);
  const [h, m] = sliced.split(":");
  if (!h || !m) return "";
  return `${h.padStart(2, "0")}:${m.padStart(2, "0")}`;
};

const toISODate = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};
const todayLocalISO = () => toISODate(new Date());

const normalizeISODateOnly = (v: any): string | null => {
  if (!v) return null;
  return String(v).slice(0, 10);
};

const dayFromDate = (isoDate: string): Day => {
  const [y, m, d] = isoDate.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  const map: Day[] = [
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

const startOfWeekMonday = (isoDate: string) => {
  const [y, m, d] = isoDate.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  const diffToMonday = (dt.getDay() + 6) % 7;
  dt.setDate(dt.getDate() - diffToMonday);
  return toISODate(dt);
};

const addDays = (isoDate: string, n: number) => {
  const [y, m, d] = isoDate.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + n);
  return toISODate(dt);
};

const shiftDays = (isoDate: string, n: number) => addDays(isoDate, n);

const toMinutes = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

const inDateRange = (dateISO: string, startISO: string, endISO: string) => {
  if (!dateISO || !startISO || !endISO) return false;
  return dateISO >= startISO && dateISO <= endISO;
};

const extractFieldErrors = (e: any): Record<string, string[]> => {
  const data = e?.response?.data;
  if (data?.errors && typeof data.errors === "object") return data.errors;
  return {};
};

const extractErrorSummary = (e: any): string => {
  const data = e?.response?.data;
  if (data?.message && data?.errors) {
    const all = Object.values(data.errors).flat() as string[];
    return all.length ? all.join("\n") : String(data.message);
  }
  if (data?.message) return String(data.message);
  return "Validation failed. Please check the form.";
};

function isClassRunningSafe(session: ExtendedClassSession): boolean {
  try {
    return isClassRunningMock({
      id: String(session.id),
      day: session.day,
      date: session.date ?? "",
      startTime: session.startTime,
      endTime: session.endTime,
      subjectId: String(session.subjectId),
      teacherId: String(session.teacherId),
      roomId: String(session.roomId),
      level: session.level,
    } as any);
  } catch {
    return false;
  }
}

/** ========================= Main Component ========================= */
export default function DailyTimetable() {
  const [viewMode, setViewMode] = useState<"daily" | "weekly">("daily");

  const [selectedDate, setSelectedDate] = useState<string>(() =>
    todayLocalISO(),
  );
  const [selectedDay, setSelectedDay] = useState<Day>(
    (todayDay as Day) || dayFromDate(todayLocalISO()),
  );

  const [filterTeacher, setFilterTeacher] = useState<string>("");
  const [filterSubject, setFilterSubject] = useState<string>("");
  const [filterRoom, setFilterRoom] = useState<string>("");

  const [selectedPrograms, setSelectedPrograms] = useState<string[]>([]);
  const [showAllPrograms, setShowAllPrograms] = useState(true);

  const [trimesters, setTrimesters] = useState<ApiTrimester[]>([]);
  const [selectedTrimesterId, setSelectedTrimesterId] = useState<string>("");

  const [zoomLevel, setZoomLevel] = useState(100);
  const [hoveredClass, setHoveredClass] = useState<number | null>(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ExtendedClassSession | null>(
    null,
  );

  const [selectedClass, setSelectedClass] =
    useState<ExtendedClassSession | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [modalError, setModalError] = useState<string>("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const [sessions, setSessions] = useState<ApiTimeTableSession[]>([]);
  const [programs, setPrograms] = useState<ApiProgramm[]>([]);
  const [subjects, setSubjects] = useState<ApiSubject[]>([]);
  const [teachers, setTeachers] = useState<ApiTeacher[]>([]);
  const [rooms, setRooms] = useState<ApiRoom[]>([]);

  const [form, setForm] = useState<{
    trimister_id: string;
    programm_id: string;
    subject_id: string;
    teacher_id: string;
    room_id: string;
    day: Day;
    date: string;
    start_time: string;
    end_time: string;
    class_type: ClassType;
    enrolled_students: string;
  }>({
    trimister_id: "",
    programm_id: "",
    subject_id: "",
    teacher_id: "",
    room_id: "",
    day: (todayDay as Day) || dayFromDate(todayLocalISO()),
    date: "",
    start_time: "09:00",
    end_time: "11:00",
    class_type: "Lecture",
    enrolled_students: "30",
  });

  /** ── Data fetch ── */
  const refreshAll = async () => {
    setLoading(true);
    try {
      const [tt, p, s, t, r, tr] = await Promise.all([
        getTimeTableSessions(),
        getPrograms(),
        getSubjects(),
        getTeachers(),
        getRooms(),
        getTrimesters(),
      ]);

      setSessions(tt.data || []);
      setPrograms(p.data || []);
      setSubjects(s.data || []);
      setTeachers(t.data || []);
      setRooms(r.data || []);
      setTrimesters(tr.data || []);

      const activeTri = (tr.data || []).find(
        (x: ApiTrimester) => x.status === "active",
      );
      const pick = activeTri || (tr.data || [])[0];

      if (pick) {
        const newTriId = String(pick.id);
        setSelectedTrimesterId((prev) => prev || newTriId);

        const triStart = normalizeISODateOnly(pick.start_date);
        const triEnd = normalizeISODateOnly(pick.end_date);
        const today = todayLocalISO();

        const inside =
          triStart && triEnd ? inDateRange(today, triStart, triEnd) : true;
        const safeDate = inside ? today : triStart || today;

        setSelectedDate(safeDate);
        setSelectedDay(dayFromDate(safeDate));
      }
    } catch (e: any) {
      toast.error("Failed to load timetable data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAll(); /* eslint-disable-next-line */
  }, []);

  const selectedTrimesterObj = useMemo(() => {
    if (!selectedTrimesterId) return null;
    return (
      trimesters.find((t) => String(t.id) === String(selectedTrimesterId)) ||
      null
    );
  }, [trimesters, selectedTrimesterId]);

  useEffect(() => {
    if (selectedDate) setSelectedDay(dayFromDate(selectedDate));
  }, [selectedDate]);

  useEffect(() => {
    if (!selectedTrimesterObj) return;
    const triStart = normalizeISODateOnly(selectedTrimesterObj.start_date);
    const triEnd = normalizeISODateOnly(selectedTrimesterObj.end_date);
    if (!triStart || !triEnd) return;
    if (!inDateRange(selectedDate, triStart, triEnd)) {
      setSelectedDate(triStart);
      setSelectedDay(dayFromDate(triStart));
    }
    // eslint-disable-next-line
  }, [selectedTrimesterObj]);

  /** ── Derived data ── */
  const subjectsForSelectedProgram = useMemo(() => {
    const pid = Number(form.programm_id);
    if (!pid) return [];
    return subjects.filter((s: any) => Number(s.programm_id) === pid);
  }, [subjects, form.programm_id]);

  const teachersForSelectedSubject = useMemo(() => {
    const sid = Number(form.subject_id);
    if (!sid) return [];
    const subj: any = subjects.find((s) => Number(s.id) === sid);
    if (subj?.teachers?.length) return subj.teachers as ApiTeacher[];
    return teachers;
  }, [subjects, teachers, form.subject_id]);

  const allClasses: ExtendedClassSession[] = useMemo(() => {
    return (sessions || []).map((s: any) => {
      const triId = Number(s.trimister_id ?? s.trimester_id);
      const trimester =
        s.trimister ||
        s.trimester ||
        trimesters.find((tr) => Number(tr.id) === triId);
      const programm =
        s.programm ||
        programs.find((p) => Number(p.id) === Number(s.programm_id));
      const subject =
        s.subject ||
        subjects.find((x) => Number(x.id) === Number(s.subject_id));
      const teacher =
        s.teacher ||
        teachers.find((x) => Number(x.id) === Number(s.teacher_id));
      const room =
        s.room || rooms.find((x) => Number(x.id) === Number(s.room_id));

      return {
        id: Number(s.id),
        day: s.day as Day,
        date: normalizeISODateOnly(s.date),
        startTime: normalizeTimeHM(s.start_time),
        endTime: normalizeTimeHM(s.end_time),
        trimesterId: triId,
        programmId: Number(s.programm_id),
        subjectId: Number(s.subject_id),
        teacherId: Number(s.teacher_id),
        roomId: Number(s.room_id),
        programName: programm?.program_name || "ICT",
        level: programm?.level || (subject as any)?.level || "Bachelor",
        classType: s.class_type,
        enrolledStudents: Number(s.enrolled_students ?? 0),
        trimester,
        programm,
        subject,
        teacher,
        room,
      };
    });
  }, [sessions, trimesters, programs, subjects, teachers, rooms]);

  const programNames = useMemo(
    () => programs.map((p) => p.program_name).filter(Boolean),
    [programs],
  );

  const filteredClasses = useMemo(() => {
    const weekStart = startOfWeekMonday(selectedDate);
    const weekEnd = addDays(weekStart, 6);

    return allClasses.filter((cls) => {
      if (
        selectedTrimesterId &&
        String(cls.trimesterId) !== String(selectedTrimesterId)
      )
        return false;

      const tri = cls.trimester || selectedTrimesterObj;
      const triStart = normalizeISODateOnly(tri?.start_date);
      const triEnd = normalizeISODateOnly(tri?.end_date);

      const dateInTrimester =
        triStart && triEnd ? inDateRange(selectedDate, triStart, triEnd) : true;

      const inRange =
        viewMode === "daily"
          ? cls.date
            ? cls.date === selectedDate
            : dateInTrimester && cls.day === selectedDay
          : cls.date
            ? cls.date >= weekStart && cls.date <= weekEnd
            : triStart && triEnd
              ? !(weekEnd < triStart || weekStart > triEnd)
              : true;

      return (
        inRange &&
        (!filterTeacher || String(cls.teacherId) === String(filterTeacher)) &&
        (!filterSubject || String(cls.subjectId) === String(filterSubject)) &&
        (!filterRoom || String(cls.roomId) === String(filterRoom)) &&
        (showAllPrograms || selectedPrograms.includes(cls.programName || ""))
      );
    });
  }, [
    allClasses,
    viewMode,
    selectedDate,
    selectedDay,
    filterTeacher,
    filterSubject,
    filterRoom,
    showAllPrograms,
    selectedPrograms,
    selectedTrimesterId,
    selectedTrimesterObj,
  ]);

  const getClassesForWeeklySlot = (time: string, day: Day) => {
    const slotStart = toMinutes(time),
      slotEnd = slotStart + 60;
    return filteredClasses.filter((cls) => {
      const clsStart = toMinutes(cls.startTime),
        clsEnd = toMinutes(cls.endTime);
      return cls.day === day && clsStart < slotEnd && clsEnd > slotStart;
    });
  };

  const getRowSpan = (cls: ExtendedClassSession) => {
    const start = toMinutes(cls.startTime),
      end = toMinutes(cls.endTime);
    return Math.max(1, Math.ceil((end - start) / 60));
  };

  const clearFilters = () => {
    setFilterTeacher("");
    setFilterSubject("");
    setFilterRoom("");
  };

  const openView = (cls: ExtendedClassSession) => {
    setSelectedClass(cls);
    setShowViewModal(true);
  };
  const openEdit = (cls: ExtendedClassSession) => {
    setModalError("");
    setFieldErrors({});
    setSelectedClass(cls);
    setForm({
      trimister_id: String(cls.trimesterId),
      programm_id: String(cls.programmId),
      subject_id: String(cls.subjectId),
      teacher_id: String(cls.teacherId),
      room_id: String(cls.roomId),
      day: cls.day,
      date: cls.date ?? "",
      start_time: normalizeTimeHM(cls.startTime),
      end_time: normalizeTimeHM(cls.endTime),
      class_type: cls.classType,
      enrolled_students: String(cls.enrolledStudents ?? 0),
    });
    setShowEditModal(true);
  };

  /** ── Form validation ── */
  const validateForm = () => {
    setFieldErrors({});
    if (!form.trimister_id) {
      setModalError("Please select a Trimester.");
      return false;
    }
    if (
      !form.programm_id ||
      !form.subject_id ||
      !form.teacher_id ||
      !form.room_id
    ) {
      setModalError("Please select Program, Subject, Teacher, and Room.");
      return false;
    }
    if (form.end_time <= form.start_time) {
      setModalError("End time must be after start time.");
      return false;
    }
    return true;
  };

  /** ── Create ── */
  const handleCreate = async () => {
    setModalError("");
    setFieldErrors({});
    if (!validateForm()) return;
    const dateVal = form.date?.trim() || "";
    const derivedDay = dateVal ? dayFromDate(dateVal) : form.day;

    setSaving(true);
    try {
      await createTimeTableSession({
        trimister_id: Number(form.trimister_id),
        programm_id: Number(form.programm_id),
        subject_id: Number(form.subject_id),
        teacher_id: Number(form.teacher_id),
        room_id: Number(form.room_id),
        day: derivedDay,
        date: dateVal || null,
        start_time: normalizeTimeHM(form.start_time),
        end_time: normalizeTimeHM(form.end_time),
        class_type: form.class_type,
        enrolled_students: form.enrolled_students
          ? Number(form.enrolled_students)
          : 0,
      } as any);

      const fresh = await getTimeTableSessions();
      setSessions(fresh.data || []);
      setShowAddModal(false);
      setForm((p) => ({
        ...p,
        programm_id: "",
        subject_id: "",
        teacher_id: "",
        room_id: "",
        date: "",
        day: dayFromDate(selectedDate),
        start_time: "09:00",
        end_time: "11:00",
        class_type: "Lecture",
        enrolled_students: "30",
      }));
      toast.success("Session added successfully!");
    } catch (e: any) {
      setFieldErrors(extractFieldErrors(e));
      setModalError(extractErrorSummary(e));
      toast.error(extractErrorSummary(e));
    } finally {
      setSaving(false);
    }
  };

  /** ── Update ── */
  const handleUpdate = async () => {
    if (!selectedClass) return;
    setModalError("");
    setFieldErrors({});
    if (!validateForm()) return;
    const dateVal = form.date?.trim() || "";
    const derivedDay = dateVal ? dayFromDate(dateVal) : form.day;

    setSaving(true);
    try {
      await updateTimeTableSession(selectedClass.id, {
        trimister_id: Number(form.trimister_id),
        programm_id: Number(form.programm_id),
        subject_id: Number(form.subject_id),
        teacher_id: Number(form.teacher_id),
        room_id: Number(form.room_id),
        day: derivedDay,
        date: dateVal || null,
        start_time: normalizeTimeHM(form.start_time),
        end_time: normalizeTimeHM(form.end_time),
        class_type: form.class_type,
        enrolled_students: form.enrolled_students
          ? Number(form.enrolled_students)
          : 0,
      } as any);

      const fresh = await getTimeTableSessions();
      setSessions(fresh.data || []);
      setShowEditModal(false);
      setSelectedClass(null);
      toast.success("Session updated successfully!");
    } catch (e: any) {
      setFieldErrors(extractFieldErrors(e));
      setModalError(extractErrorSummary(e));
      toast.error(extractErrorSummary(e));
    } finally {
      setSaving(false);
    }
  };

  /** ── Delete ── */
  const handleDeleteClick = (cls: ExtendedClassSession) => {
    setDeleteTarget(cls);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteTimeTableSession(deleteTarget.id);
      const fresh = await getTimeTableSessions();
      setSessions(fresh.data || []);
      toast.success("Session deleted.");
      setShowDeleteConfirm(false);
      setDeleteTarget(null);
    } catch (e: any) {
      toast.error(extractErrorSummary(e));
    } finally {
      setDeleting(false);
    }
  };

  /** ── Stats ── */
  const stats = useMemo(
    () => ({
      totalClasses: filteredClasses.length,
      roomsUsed: new Set(filteredClasses.map((c) => c.roomId)).size,
      conflictCount: 0,
    }),
    [filteredClasses],
  );

  const triStart = normalizeISODateOnly(selectedTrimesterObj?.start_date || "");
  const triEnd = normalizeISODateOnly(selectedTrimesterObj?.end_date || "");
  const weekStart = startOfWeekMonday(selectedDate);
  const weekEnd = addDays(weekStart, 6);
  const isToday = selectedDate === todayLocalISO();
  const hasFilters = !!(
    filterTeacher ||
    filterSubject ||
    filterRoom ||
    !showAllPrograms
  );

  /** ── Form fields — rendered as JSX (NOT a nested component) to prevent focus loss ── */
  const renderFormFields = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="text-sm text-body block mb-1.5">Trimester *</label>
        <select
          value={form.trimister_id}
          onChange={(e) =>
            setForm((p) => ({ ...p, trimister_id: e.target.value }))
          }
          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent text-sm cursor-pointer"
        >
          <option value="">Select Trimester</option>
          {trimesters.map((t) => (
            <option key={t.id} value={String(t.id)}>
              {t.name}
            </option>
          ))}
        </select>
        {!!fieldErrors.trimister_id?.length && (
          <p className="text-xs text-red-600 mt-1">
            {fieldErrors.trimister_id[0]}
          </p>
        )}
      </div>

      <div>
        <label className="text-sm text-body block mb-1.5">Program *</label>
        <select
          value={form.programm_id}
          onChange={(e) =>
            setForm((p) => ({
              ...p,
              programm_id: e.target.value,
              subject_id: "",
              teacher_id: "",
            }))
          }
          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent text-sm cursor-pointer"
        >
          <option value="">Select Program</option>
          {programs.map((p) => (
            <option key={p.id} value={String(p.id)}>
              {p.program_name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-sm text-body block mb-1.5">Subject *</label>
        <select
          value={form.subject_id}
          onChange={(e) =>
            setForm((p) => ({
              ...p,
              subject_id: e.target.value,
              teacher_id: "",
            }))
          }
          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent text-sm cursor-pointer disabled:opacity-50"
          disabled={!form.programm_id}
        >
          <option value="">
            {form.programm_id ? "Select Subject" : "Select Program first"}
          </option>
          {subjectsForSelectedProgram.map((s: any) => (
            <option key={s.id} value={String(s.id)}>
              {s.subject_code} – {s.subject_name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-sm text-body block mb-1.5">Teacher *</label>
        <select
          value={form.teacher_id}
          onChange={(e) =>
            setForm((p) => ({ ...p, teacher_id: e.target.value }))
          }
          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent text-sm cursor-pointer disabled:opacity-50"
          disabled={!form.subject_id}
        >
          <option value="">
            {form.subject_id ? "Select Teacher" : "Select Subject first"}
          </option>
          {teachersForSelectedSubject.map((t) => (
            <option key={t.id} value={String(t.id)}>
              {t.full_name}
            </option>
          ))}
        </select>
        {!!fieldErrors.teacher_id?.length && (
          <p className="text-xs text-red-600 mt-1">
            {fieldErrors.teacher_id[0]}
          </p>
        )}
      </div>

      <div>
        <label className="text-sm text-body block mb-1.5">Room *</label>
        <select
          value={form.room_id}
          onChange={(e) => setForm((p) => ({ ...p, room_id: e.target.value }))}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent text-sm cursor-pointer"
        >
          <option value="">Select Room</option>
          {rooms.map((r) => (
            <option key={r.id} value={String(r.id)}>
              {r.room_name} (Cap: {r.capacity})
            </option>
          ))}
        </select>
        {!!fieldErrors.room_id?.length && (
          <p className="text-xs text-red-600 mt-1">{fieldErrors.room_id[0]}</p>
        )}
      </div>

      <div>
        <label className="text-sm text-body block mb-1.5">Day</label>
        <select
          value={form.day}
          onChange={(e) =>
            setForm((p) => ({ ...p, day: e.target.value as Day }))
          }
          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent text-sm cursor-pointer"
        >
          {days.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-sm text-body block mb-1.5">
          Date (optional)
        </label>
        <input
          type="date"
          value={form.date}
          onChange={(e) => {
            const v = e.target.value;
            setForm((p) => ({
              ...p,
              date: v,
              day: v ? dayFromDate(v) : p.day,
            }));
          }}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent text-sm"
        />
      </div>

      <div>
        <label className="text-sm text-body block mb-1.5">Class Type *</label>
        <select
          value={form.class_type}
          onChange={(e) =>
            setForm((p) => ({ ...p, class_type: e.target.value as ClassType }))
          }
          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent text-sm cursor-pointer"
        >
          <option value="Lecture">Lecture</option>
          <option value="Tutorial">Tutorial</option>
          <option value="Seminar">Seminar</option>
        </select>
      </div>

      <div>
        <label className="text-sm text-body block mb-1.5">Start Time *</label>
        <input
          type="time"
          value={form.start_time}
          onChange={(e) =>
            setForm((p) => ({
              ...p,
              start_time: normalizeTimeHM(e.target.value),
            }))
          }
          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent text-sm"
        />
      </div>

      <div>
        <label className="text-sm text-body block mb-1.5">End Time *</label>
        <input
          type="time"
          value={form.end_time}
          onChange={(e) =>
            setForm((p) => ({
              ...p,
              end_time: normalizeTimeHM(e.target.value),
            }))
          }
          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent text-sm"
        />
      </div>

      <div>
        <label className="text-sm text-body block mb-1.5">
          Enrolled Students
        </label>
        <input
          type="number"
          min={0}
          value={form.enrolled_students}
          onChange={(e) =>
            setForm((p) => ({ ...p, enrolled_students: e.target.value }))
          }
          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent text-sm"
        />
        {!!fieldErrors.enrolled_students?.length && (
          <p className="text-xs text-red-600 mt-1">
            {fieldErrors.enrolled_students[0]}
          </p>
        )}
      </div>
    </div>
  );

  /** ── Class block ── */
  const ClassBlock = ({
    classSession,
    compact = false,
  }: {
    classSession: ExtendedClassSession;
    compact?: boolean;
  }) => {
    const programColor =
      programColors[classSession.programName] || DEFAULT_COLOR;
    const isHovered = hoveredClass === classSession.id;
    const running = isClassRunningSafe(classSession);

    return (
      <div
        className={[
          "rounded-xl p-3 h-full text-white relative",
          programColor.bg,
          "transition-all duration-200 ease-out will-change-transform",
          isHovered
            ? "shadow-xl ring-2 ring-white/70 -translate-y-0.5"
            : "shadow-md",
          running ? "ring-2 ring-white animate-pulse" : "",
          isWeekendDay(classSession.day) ? "opacity-70" : "opacity-100",
        ].join(" ")}
        onMouseEnter={() => setHoveredClass(classSession.id)}
        onMouseLeave={() => setHoveredClass(null)}
      >
        {running && (
          <span
            className="inline-block px-2 py-0.5 bg-white text-xs rounded-full mb-1"
            style={{ color: "#0AA6A6" }}
          >
            Now Running
          </span>
        )}
        <div
          className={`${compact ? "text-xs" : "text-sm font-medium"} truncate`}
        >
          {(classSession.subject as any)?.subject_code || "SUB"}
        </div>
        <div className="text-xs opacity-90 truncate mt-0.5">
          {classSession.room?.room_name || "Room"}
        </div>
        <div className="text-xs opacity-90 truncate">
          {classSession.teacher?.full_name || "Teacher"}
        </div>
        <div className="text-xs opacity-80 mt-1">
          <span className="px-2 py-0.5 bg-white/20 rounded-full">
            {classSession.classType}
          </span>
        </div>
        {!compact && (
          <div className="text-xs opacity-90 mt-1 truncate">
            <span className="px-2 py-0.5 bg-white/30 rounded-full">
              {classSession.programName}
            </span>
          </div>
        )}
        {isHovered && (
          <div className="absolute top-2 right-2 flex gap-1 bg-white/20 backdrop-blur-sm rounded-lg p-1">
            <button
              className="p-1 hover:bg-white/30 rounded-lg transition-colors"
              title="View"
              onClick={(e) => {
                e.stopPropagation();
                openView(classSession);
              }}
            >
              <Eye className="w-3 h-3" />
            </button>
            <button
              className="p-1 hover:bg-white/30 rounded-lg transition-colors"
              title="Edit"
              onClick={(e) => {
                e.stopPropagation();
                openEdit(classSession);
              }}
            >
              <Edit className="w-3 h-3" />
            </button>
            <button
              className="p-1 hover:bg-white/30 rounded-lg transition-colors"
              title="Delete"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteClick(classSession);
              }}
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    );
  };

  /** ========================= Render ========================= */
  return (
    <div className="space-y-5">
      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-primary-blue mb-1">Timetable Builder</h1>
          <p className="text-body text-sm">
            View and manage your class schedule
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Zoom */}
          <div className="flex items-center gap-1 bg-white rounded-xl p-1.5 shadow-card border border-light">
            <button
              onClick={() => setZoomLevel(Math.max(50, zoomLevel - 10))}
              className="p-1.5 hover:bg-soft rounded-lg transition-colors cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4 text-body" />
            </button>
            <span className="text-xs text-body px-1.5 min-w-[40px] text-center">
              {zoomLevel}%
            </span>
            <button
              onClick={() => setZoomLevel(Math.min(150, zoomLevel + 10))}
              className="p-1.5 hover:bg-soft rounded-lg transition-colors cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4 text-body" />
            </button>
          </div>
          <button
            onClick={() => setShowExportModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary-blue text-white rounded-xl hover:opacity-90 active:scale-[0.97] active:opacity-80 transition-all duration-150 shadow-md select-none cursor-pointer text-sm"
          >
            <Download className="w-4 h-4" />
            Export PDF
          </button>
        </div>
      </div>
      {/* ── View toggle + date controls ── */}
      <div className="bg-white rounded-xl shadow-card border border-light p-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          {/* View toggle */}
          <div className="flex items-center gap-1 p-1 bg-soft rounded-lg w-fit">
            {(["daily", "weekly"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setViewMode(m)}
                className={`px-5 py-2 rounded-md text-sm font-medium transition-all duration-150 cursor-pointer capitalize ${
                  viewMode === m
                    ? "bg-white text-primary-blue shadow-sm"
                    : "text-body hover:text-dark"
                }`}
              >
                {m.charAt(0).toUpperCase() + m.slice(1)}
              </button>
            ))}
          </div>

          {/* Trimester selector */}
          <select
            value={selectedTrimesterId}
            onChange={(e) => setSelectedTrimesterId(e.target.value)}
            className="flex-1 min-w-[180px] px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue text-sm cursor-pointer"
          >
            <option value="">Select Trimester</option>
            {trimesters.map((t) => (
              <option key={t.id} value={String(t.id)}>
                {t.name}
              </option>
            ))}
          </select>

          {/* Date picker */}
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue text-sm"
          />

          {/* Nav buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setSelectedDate(shiftDays(selectedDate, -1))}
              className="p-2 border border-light rounded-xl hover:bg-soft active:bg-soft/80 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4 text-body" />
            </button>
            <button
              onClick={() => setSelectedDate(todayLocalISO())}
              className={`px-3 py-2 rounded-xl text-sm transition-colors cursor-pointer border ${
                isToday
                  ? "bg-primary-blue text-white border-primary-blue"
                  : "border-light text-body hover:bg-soft"
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setSelectedDate(shiftDays(selectedDate, 1))}
              className="p-2 border border-light rounded-xl hover:bg-soft active:bg-soft/80 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4 text-body" />
            </button>
          </div>

          {/* Refresh + Add */}
          <div className="flex items-center gap-1.5 sm:ml-auto">
            <button
              onClick={refreshAll}
              disabled={loading}
              className="p-2 border border-light rounded-xl hover:bg-soft active:bg-soft/80 transition-colors cursor-pointer disabled:opacity-50"
              title="Refresh"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 text-body animate-spin" />
              ) : (
                <RefreshCcw className="w-4 h-4 text-body" />
              )}
            </button>
            <button
              onClick={() => {
                setModalError("");
                setFieldErrors({});
                setForm((p) => ({
                  ...p,
                  trimister_id: selectedTrimesterId,
                  day: dayFromDate(selectedDate),
                  date: "",
                }));
                setShowAddModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-primary-blue text-white rounded-xl hover:opacity-90 active:scale-[0.97] active:opacity-80 transition-all duration-150 shadow-sm select-none cursor-pointer text-sm"
            >
              <Plus className="w-4 h-4" />
              Add Session
            </button>
          </div>
        </div>

        {/* Subtitle info */}
        <div className="flex items-center gap-3 mt-3 text-xs text-body flex-wrap">
          <span>
            {viewMode === "daily" ? (
              <>
                <span className="font-medium text-dark">{selectedDate}</span> ·{" "}
                <span className="font-medium text-dark">{selectedDay}</span>
              </>
            ) : (
              <>
                <span className="font-medium text-dark">{weekStart}</span> →{" "}
                <span className="font-medium text-dark">{weekEnd}</span>
              </>
            )}
          </span>
          {selectedTrimesterObj && triStart && triEnd && (
            <span className="text-body">
              Trimester:{" "}
              <span className="font-medium text-dark">{triStart}</span> →{" "}
              <span className="font-medium text-dark">{triEnd}</span>
            </span>
          )}
          <span className="ml-auto font-medium text-dark">
            {filteredClasses.length} class
            {filteredClasses.length !== 1 ? "es" : ""}
          </span>
        </div>
      </div>
      {/* ── Filters ── */}
      <div className="bg-white rounded-xl shadow-card p-4 border border-light">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-primary-blue" />
            <span className="text-sm font-medium text-dark">Filters</span>
          </div>
          {hasFilters && (
            <button
              onClick={() => {
                clearFilters();
                setShowAllPrograms(true);
                setSelectedPrograms([]);
              }}
              className="flex items-center gap-1.5 text-xs text-primary-blue hover:underline cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              Clear all
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <select
            value={filterTeacher}
            onChange={(e) => setFilterTeacher(e.target.value)}
            className="flex-1 min-w-[150px] px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue cursor-pointer"
          >
            <option value="">All Teachers</option>
            {teachers.map((t) => (
              <option key={t.id} value={String(t.id)}>
                {t.full_name}
              </option>
            ))}
          </select>

          <select
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
            className="flex-1 min-w-[150px] px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue cursor-pointer"
          >
            <option value="">All Subjects</option>
            {subjects.map((s) => (
              <option key={s.id} value={String(s.id)}>
                {(s as any).subject_code} – {(s as any).subject_name}
              </option>
            ))}
          </select>

          <select
            value={filterRoom}
            onChange={(e) => setFilterRoom(e.target.value)}
            className="flex-1 min-w-[130px] px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue cursor-pointer"
          >
            <option value="">All Rooms</option>
            {rooms.map((r) => (
              <option key={r.id} value={String(r.id)}>
                {r.room_name}
              </option>
            ))}
          </select>

          {/* Show all programs toggle */}
          <label className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-xl text-sm cursor-pointer hover:bg-soft transition-colors">
            <input
              type="checkbox"
              checked={showAllPrograms}
              onChange={(e) => setShowAllPrograms(e.target.checked)}
              className="w-4 h-4 text-primary-blue rounded border-gray-300 cursor-pointer"
            />
            <span className="text-body">All Programs</span>
          </label>
        </div>

        {/* Program pills */}
        {!showAllPrograms && programNames.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-light">
            {programNames.map((program) => {
              const color = programColors[program] || DEFAULT_COLOR;
              const isSelected = selectedPrograms.includes(program);
              return (
                <button
                  key={program}
                  onClick={() => {
                    setSelectedPrograms((prev) =>
                      isSelected
                        ? prev.filter((p) => p !== program)
                        : [...prev, program],
                    );
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs transition-all cursor-pointer ${
                    isSelected
                      ? `${color.bg} text-white shadow-sm`
                      : `${color.light} ${color.text} border ${color.border} hover:shadow-sm`
                  }`}
                >
                  {program}
                </button>
              );
            })}
          </div>
        )}
      </div>
      {/* ── Grid ── */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-card border border-light overflow-hidden">
          <div className="bg-soft px-5 py-3 border-b border-light">
            <div className="h-4 w-32 rounded bg-gray-200 animate-pulse" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-soft border-b border-light">
                  <th className="px-5 py-3 min-w-[90px]">
                    <div className="h-3 w-10 rounded bg-gray-200 animate-pulse" />
                  </th>
                  {Array.from({ length: 4 }).map((_, i) => (
                    <th
                      key={i}
                      className="px-5 py-3 min-w-[200px] border-l border-light"
                    >
                      <div className="h-3 w-24 rounded bg-gray-200 animate-pulse mx-auto mb-1" />
                      <div className="h-2.5 w-16 rounded bg-gray-200 animate-pulse mx-auto" />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 8 }).map((_, row) => (
                  <tr key={row} className="border-b border-gray-100">
                    <td className="px-5 py-4 border-r border-light">
                      <div className="h-3 w-12 rounded bg-gray-200 animate-pulse" />
                    </td>
                    {Array.from({ length: 4 }).map((_, col) => (
                      <td key={col} className="px-3 py-3 border-r border-light">
                        <div className="h-16 rounded-xl bg-gray-100 animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div
          className="bg-white rounded-xl shadow-card overflow-hidden border border-light"
          style={{
            transform: `scale(${zoomLevel / 100})`,
            transformOrigin: "top left",
            width: `${10000 / zoomLevel}%`,
          }}
        >
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-soft border-b border-light">
                  <th className="sticky left-0 z-20 px-5 py-3 text-left text-xs text-body bg-soft border-r border-light min-w-[90px]">
                    Time
                  </th>
                  {viewMode === "daily"
                    ? rooms.map((room) => (
                        <th
                          key={room.id}
                          className="px-5 py-3 text-center text-xs text-body border-r border-light min-w-[200px]"
                        >
                          <div className="font-medium text-dark">
                            {room.room_name}
                          </div>
                          <div className="text-gray-400 mt-0.5">
                            Cap: {room.capacity}
                          </div>
                        </th>
                      ))
                    : days.map((day) => (
                        <th
                          key={day}
                          className={`px-5 py-3 text-center text-xs text-body border-r border-light min-w-[230px] ${isWeekendDay(day) ? "bg-gray-50" : ""}`}
                        >
                          <div className="font-medium text-dark">{day}</div>
                          {isWeekendDay(day) && (
                            <div className="text-gray-400 mt-0.5">Weekend</div>
                          )}
                        </th>
                      ))}
                </tr>
              </thead>
              <tbody>
                {timeSlots.map((time) => (
                  <tr
                    key={time}
                    className="border-b border-gray-100 hover:bg-soft/30 transition-colors"
                  >
                    <td className="sticky left-0 z-10 px-5 py-3 text-xs font-medium text-body bg-white border-r border-light">
                      {time}
                    </td>

                    {viewMode === "daily"
                      ? rooms.map((room) => {
                          const classes = filteredClasses.filter((cls) => {
                            const slotStart = toMinutes(time),
                              slotEnd = slotStart + 60;
                            const clsStart = toMinutes(cls.startTime),
                              clsEnd = toMinutes(cls.endTime);
                            return (
                              Number(cls.roomId) === Number(room.id) &&
                              clsStart < slotEnd &&
                              clsEnd > slotStart
                            );
                          });
                          const slotStart = toMinutes(time),
                            slotEnd = slotStart + 60;
                          const startingNow = classes.find((c) => {
                            const cs = toMinutes(c.startTime);
                            return cs >= slotStart && cs < slotEnd;
                          });

                          if (startingNow) {
                            return (
                              <td
                                key={room.id}
                                rowSpan={getRowSpan(startingNow)}
                                className="px-2 py-2 border-r border-light align-top"
                              >
                                <ClassBlock classSession={startingNow} />
                              </td>
                            );
                          }
                          if (
                            classes.some(
                              (c) => toMinutes(c.startTime) < slotStart,
                            )
                          )
                            return null;
                          return (
                            <td
                              key={room.id}
                              className="px-2 py-2 border-r border-light bg-white hover:bg-soft cursor-pointer transition-colors"
                              onClick={() => {
                                setModalError("");
                                setFieldErrors({});
                                setForm((p) => ({
                                  ...p,
                                  trimister_id: selectedTrimesterId,
                                  day: dayFromDate(selectedDate),
                                  date: "",
                                  room_id: String(room.id),
                                  start_time: time,
                                }));
                                setShowAddModal(true);
                              }}
                            >
                              <div className="h-16 flex items-center justify-center text-gray-300 hover:text-primary-blue transition-colors">
                                <Plus className="w-4 h-4" />
                              </div>
                            </td>
                          );
                        })
                      : days.map((day) => {
                          const classes = getClassesForWeeklySlot(time, day);
                          const slotStart = toMinutes(time),
                            slotEnd = slotStart + 60;
                          const startingNow = classes.find((c) => {
                            const cs = toMinutes(c.startTime);
                            return cs >= slotStart && cs < slotEnd;
                          });

                          if (startingNow) {
                            return (
                              <td
                                key={day}
                                rowSpan={getRowSpan(startingNow)}
                                className={`px-2 py-2 border-r border-light align-top ${isWeekendDay(day) ? "bg-gray-50/50" : ""}`}
                              >
                                <div className="space-y-1.5">
                                  {classes
                                    .filter((c) => {
                                      const cs = toMinutes(c.startTime);
                                      return cs >= slotStart && cs < slotEnd;
                                    })
                                    .map((cls) => (
                                      <ClassBlock
                                        key={cls.id}
                                        classSession={cls}
                                        compact={classes.length > 1}
                                      />
                                    ))}
                                </div>
                              </td>
                            );
                          }
                          if (
                            classes.some(
                              (c) => toMinutes(c.startTime) < slotStart,
                            )
                          )
                            return null;
                          return (
                            <td
                              key={day}
                              className={`px-2 py-2 border-r border-light ${isWeekendDay(day) ? "bg-gray-50" : "bg-white"} hover:bg-soft cursor-pointer transition-colors`}
                              onClick={() => {
                                setModalError("");
                                setFieldErrors({});
                                setForm((p) => ({
                                  ...p,
                                  trimister_id: selectedTrimesterId,
                                  day,
                                  date: "",
                                  start_time: time,
                                }));
                                setShowAddModal(true);
                              }}
                            >
                              <div className="h-16 flex items-center justify-center text-gray-300 hover:text-primary-blue transition-colors">
                                <Plus className="w-4 h-4" />
                              </div>
                            </td>
                          );
                        })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}{" "}
      {/* end loading ternary */}
      {/* ── Legend + summary in one row ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Legend */}
        <div className="md:col-span-2 bg-white rounded-xl shadow-card p-4 border border-light">
          <p className="text-sm font-medium text-dark mb-3">Program Legend</p>
          <div className="flex flex-wrap gap-3">
            {programNames.map((program) => {
              const color = programColors[program] || DEFAULT_COLOR;
              return (
                <div key={program} className="flex items-center gap-1.5">
                  <div className={`w-3 h-3 rounded-full ${color.bg}`} />
                  <span className="text-xs text-body">{program}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Stats */}
        <div className="bg-white rounded-xl shadow-card p-4 border border-light">
          <p className="text-sm font-medium text-dark mb-3">Summary</p>
          <div className="space-y-2">
            {[
              {
                label: "Classes",
                value: stats.totalClasses,
                color: "text-primary-blue",
              },
              {
                label: "Rooms Used",
                value: stats.roomsUsed,
                color: "text-green-600",
              },
              {
                label: "Programs",
                value: programNames.length,
                color: "text-purple-600",
              },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-xs text-body">{label}</span>
                <span className={`text-sm font-bold ${color}`}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* ===================== MODALS ===================== */}
      {/* View Modal */}
      {showViewModal && selectedClass && (
        <>
          <div
            className="fixed inset-0 bg-white/40 backdrop-blur-sm z-50"
            onClick={() => setShowViewModal(false)}
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="border-b border-light px-6 py-4 flex items-center justify-between sticky top-0 bg-white z-10">
                <h2 className="text-primary-blue">Class Details</h2>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="p-2 hover:bg-soft rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5 text-body" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-soft rounded-lg border border-light md:col-span-2">
                    <label className="text-xs text-body mb-1 block">
                      Subject
                    </label>
                    <p className="text-dark font-medium">
                      {(selectedClass.subject as any)?.subject_code} –{" "}
                      {(selectedClass.subject as any)?.subject_name}
                    </p>
                  </div>
                  {[
                    {
                      label: "Trimester",
                      value:
                        selectedClass.trimester?.name ||
                        `#${selectedClass.trimesterId}`,
                    },
                    { label: "Program", value: selectedClass.programName },
                    { label: "Class Type", value: selectedClass.classType },
                    {
                      label: "Day & Time",
                      value: `${selectedClass.day}, ${selectedClass.startTime} – ${selectedClass.endTime}${selectedClass.date ? ` (${selectedClass.date})` : " (Routine)"}`,
                    },
                    {
                      label: "Room",
                      value: selectedClass.room?.room_name || "—",
                    },
                    {
                      label: "Capacity",
                      value: `${selectedClass.room?.capacity ?? "—"} students`,
                    },
                  ].map(({ label, value }) => (
                    <div
                      key={label}
                      className="p-4 bg-soft rounded-lg border border-light"
                    >
                      <label className="text-xs text-body mb-1 block">
                        {label}
                      </label>
                      <p className="text-dark text-sm">{value}</p>
                    </div>
                  ))}
                </div>
                <div className="p-4 bg-soft rounded-lg border border-light">
                  <label className="text-xs text-body mb-1 block">
                    Teacher
                  </label>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary-blue flex-shrink-0" />
                    <p className="text-dark text-sm">
                      {selectedClass.teacher?.full_name}
                    </p>
                  </div>
                </div>
                <div className="p-4 bg-soft rounded-lg border border-light">
                  <label className="text-xs text-body mb-1 block">
                    Enrolled Students
                  </label>
                  <p className={`text-2xl font-bold text-primary-blue`}>
                    {selectedClass.enrolledStudents}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
      {/* Add Modal */}
      {showAddModal && (
        <>
          <div
            className="fixed inset-0 bg-white/40 backdrop-blur-sm z-50"
            onClick={() => setShowAddModal(false)}
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full shadow-2xl max-h-[90vh] flex flex-col">
              <div className="border-b border-light px-6 py-4 flex items-center justify-between">
                <h2 className="text-primary-blue">Add Timetable Session</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 hover:bg-soft active:bg-soft/80 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5 text-body" />
                </button>
              </div>
              <div className="p-6 space-y-4 overflow-y-auto">
                {modalError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 whitespace-pre-line">
                    {modalError}
                  </div>
                )}
                {renderFormFields()}
              </div>
              <div className="px-6 py-4 border-t border-light flex gap-3">
                <button
                  onClick={handleCreate}
                  disabled={saving}
                  className="flex-1 py-3 bg-primary-blue text-white rounded-xl hover:opacity-90 active:opacity-80 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-150 font-medium shadow-sm cursor-pointer"
                >
                  {saving ? (
                    <span className="inline-flex items-center gap-2 justify-center">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving…
                    </span>
                  ) : (
                    "Add Session"
                  )}
                </button>
                <button
                  onClick={() => setShowAddModal(false)}
                  disabled={saving}
                  className="flex-1 py-3 bg-gray-100 text-body rounded-xl hover:bg-gray-200 active:bg-gray-300 active:scale-[0.98] transition-all duration-150 font-medium cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </>
      )}
      {/* Edit Modal */}
      {showEditModal && selectedClass && (
        <>
          <div
            className="fixed inset-0 bg-white/40 backdrop-blur-sm z-50"
            onClick={() => setShowEditModal(false)}
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full shadow-2xl max-h-[90vh] flex flex-col">
              <div className="border-b border-light px-6 py-4 flex items-center justify-between">
                <h2 className="text-primary-blue">Edit Timetable Session</h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-2 hover:bg-soft active:bg-soft/80 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5 text-body" />
                </button>
              </div>
              <div className="p-6 space-y-4 overflow-y-auto">
                {modalError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 whitespace-pre-line">
                    {modalError}
                  </div>
                )}
                {renderFormFields()}
              </div>
              <div className="px-6 py-4 border-t border-light flex gap-3">
                <button
                  onClick={handleUpdate}
                  disabled={saving}
                  className="flex-1 py-3 bg-primary-blue text-white rounded-xl hover:opacity-90 active:opacity-80 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-150 font-medium shadow-sm cursor-pointer"
                >
                  {saving ? (
                    <span className="inline-flex items-center gap-2 justify-center">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving…
                    </span>
                  ) : (
                    "Update Session"
                  )}
                </button>
                <button
                  onClick={() => setShowEditModal(false)}
                  disabled={saving}
                  className="flex-1 py-3 bg-gray-100 text-body rounded-xl hover:bg-gray-200 active:bg-gray-300 active:scale-[0.98] transition-all duration-150 font-medium cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </>
      )}
      {/* Delete Confirmation */}
      {showDeleteConfirm && deleteTarget && (
        <>
          <div
            className="fixed inset-0 bg-white/40 backdrop-blur-sm z-50"
            onClick={() => setShowDeleteConfirm(false)}
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full shadow-2xl">
              <div className="p-6">
                <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-6 h-6 text-red-500" />
                </div>
                <h3 className="text-dark font-semibold text-center mb-2">
                  Delete Session
                </h3>
                <p className="text-body text-sm text-center mb-6">
                  Are you sure you want to delete{" "}
                  <span className="font-medium text-dark">
                    {(deleteTarget.subject as any)?.subject_code ||
                      "this session"}
                  </span>
                  ? This cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={confirmDelete}
                    disabled={deleting}
                    className="flex-1 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 active:bg-red-700 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-150 font-medium cursor-pointer"
                  >
                    {deleting ? (
                      <span className="inline-flex items-center gap-2 justify-center">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Deleting…
                      </span>
                    ) : (
                      "Delete"
                    )}
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 py-3 bg-gray-100 text-body rounded-xl hover:bg-gray-200 active:bg-gray-300 active:scale-[0.98] transition-all duration-150 font-medium cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
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
                <h2 className="text-primary-blue">Export Timetable</h2>
                <button
                  onClick={() => setShowExportModal(false)}
                  className="p-2 hover:bg-soft rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5 text-body" />
                </button>
              </div>
              <div className="p-6">
                <p className="text-body text-sm mb-6">
                  Export the current timetable view as a PDF report.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      toast.success("PDF export triggered.");
                      setShowExportModal(false);
                    }}
                    className="flex-1 py-3 bg-primary-blue text-white rounded-xl hover:opacity-90 active:opacity-80 active:scale-[0.98] transition-all duration-150 font-medium cursor-pointer"
                  >
                    Export PDF
                  </button>
                  <button
                    onClick={() => setShowExportModal(false)}
                    className="flex-1 py-3 bg-gray-100 text-body rounded-xl hover:bg-gray-200 active:bg-gray-300 active:scale-[0.98] transition-all duration-150 font-medium cursor-pointer"
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
