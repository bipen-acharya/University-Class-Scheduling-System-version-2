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
} from "lucide-react";

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

/** ✅ Trimester type (matches your API: trimister/trimester object) */
type ApiTrimester = {
  id: number;
  name: string;
  start_date: string; // may include time
  end_date: string; // may include time
  status?: "active" | "inactive";
};

/** UI Model */
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

/** Program colors */
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

const normalizeTimeHM = (t: string) => {
  if (!t) return "";
  const sliced = String(t).trim().slice(0, 5);
  const [h, m] = sliced.split(":");
  if (!h || !m) return "";
  return `${h.padStart(2, "0")}:${m.padStart(2, "0")}`;
};

/** ✅ date helpers */
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
  const js = dt.getDay();
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

const startOfWeekMonday = (isoDate: string) => {
  const [y, m, d] = isoDate.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  const js = dt.getDay(); // 0 Sun ... 6 Sat
  const diffToMonday = (js + 6) % 7;
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

/** ✅ Minute helpers */
const toMinutes = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

/** ✅ range helper (expects date-only) */
const inDateRange = (dateISO: string, startISO: string, endISO: string) => {
  if (!dateISO || !startISO || !endISO) return false;
  return dateISO >= startISO && dateISO <= endISO;
};

/** ✅ error helpers */
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

export default function DailyTimetable() {
  const [viewMode, setViewMode] = useState<"daily" | "weekly">("daily");

  /** ✅ Date changeable */
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

  const [selectedClass, setSelectedClass] =
    useState<ExtendedClassSession | null>(null);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [modalError, setModalError] = useState<string>("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const [sessions, setSessions] = useState<ApiTimeTableSession[]>([]);
  const [programs, setPrograms] = useState<ApiProgramm[]>([]);
  const [subjects, setSubjects] = useState<ApiSubject[]>([]);
  const [teachers, setTeachers] = useState<ApiTeacher[]>([]);
  const [rooms, setRooms] = useState<ApiRoom[]>([]);

  // ✅ IMPORTANT: backend expects trimister_id
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

        // Ensure selectedDate is inside trimester
        const triStart = normalizeISODateOnly(pick.start_date);
        const triEnd = normalizeISODateOnly(pick.end_date);
        const today = todayLocalISO();

        const inside =
          triStart && triEnd ? inDateRange(today, triStart, triEnd) : true;
        const safeDate = inside ? today : triStart || today;

        const finalDate = safeDate; 

        setSelectedDate(finalDate);
        setSelectedDay(dayFromDate(finalDate));
      }
    } catch (e: any) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedTrimesterObj = useMemo(() => {
    if (!selectedTrimesterId) return null;
    return (
      trimesters.find((t) => String(t.id) === String(selectedTrimesterId)) ||
      null
    );
  }, [trimesters, selectedTrimesterId]);

  /** sync day when date changes */
  useEffect(() => {
    if (!selectedDate) return;
    setSelectedDay(dayFromDate(selectedDate));
  }, [selectedDate]);

  /** when trimester changes, move date into that trimester */
  useEffect(() => {
    if (!selectedTrimesterObj) return;

    const triStart = normalizeISODateOnly(selectedTrimesterObj.start_date);
    const triEnd = normalizeISODateOnly(selectedTrimesterObj.end_date);
    if (!triStart || !triEnd) return;

    if (!inDateRange(selectedDate, triStart, triEnd)) {
      setSelectedDate(triStart);
      setSelectedDay(dayFromDate(triStart));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTrimesterObj]);

  const subjectsForSelectedProgram = useMemo(() => {
    const pid = Number(form.programm_id);
    if (!pid) return [];
    return subjects.filter((s: any) => Number((s as any).programm_id) === pid);
  }, [subjects, form.programm_id]);

  const teachersForSelectedSubject = useMemo(() => {
    const sid = Number(form.subject_id);
    if (!sid) return [];
    const subj: any = subjects.find((s) => Number(s.id) === sid);
    if (
      subj?.teachers &&
      Array.isArray(subj.teachers) &&
      subj.teachers.length > 0
    ) {
      return subj.teachers as ApiTeacher[];
    }
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

  const availableRooms = useMemo(() => rooms, [rooms]);

  const filteredClasses = useMemo(() => {
    const weekStart = startOfWeekMonday(selectedDate);
    const weekEnd = addDays(weekStart, 6);

    return allClasses.filter((cls) => {
      if (
        selectedTrimesterId &&
        String(cls.trimesterId) !== String(selectedTrimesterId)
      ) {
        return false;
      }

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

      const matchesTeacher =
        !filterTeacher || String(cls.teacherId) === String(filterTeacher);
      const matchesSubject =
        !filterSubject || String(cls.subjectId) === String(filterSubject);
      const matchesRoom =
        !filterRoom || String(cls.roomId) === String(filterRoom);

      const matchesProgram =
        showAllPrograms || selectedPrograms.includes(cls.programName || "");

      return (
        inRange &&
        matchesTeacher &&
        matchesSubject &&
        matchesRoom &&
        matchesProgram
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
    const slotStart = toMinutes(time);
    const slotEnd = slotStart + 60;

    return filteredClasses.filter((cls) => {
      const clsStart = toMinutes(cls.startTime);
      const clsEnd = toMinutes(cls.endTime);
      return cls.day === day && clsStart < slotEnd && clsEnd > slotStart;
    });
  };

  const getRowSpan = (classSession: ExtendedClassSession) => {
    const start = toMinutes(classSession.startTime);
    const end = toMinutes(classSession.endTime);
    const diffHours = Math.ceil((end - start) / 60);
    return Math.max(1, diffHours);
  };

  const clearFilters = () => {
    setFilterTeacher("");
    setFilterSubject("");
    setFilterRoom("");
  };

  const toggleProgram = (program: string) => {
    if (selectedPrograms.includes(program)) {
      setSelectedPrograms(selectedPrograms.filter((p) => p !== program));
    } else {
      setSelectedPrograms([...selectedPrograms, program]);
    }
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

  const validateForm = () => {
    setFieldErrors({});
    if (!form.trimister_id) {
      setModalError("Please select Trimester.");
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
      setModalError("End time must be greater than start time.");
      return false;
    }
    return true;
  };

  const handleCreate = async () => {
    setModalError("");
    setFieldErrors({});
    if (!validateForm()) return;

    const dateVal = form.date?.trim() || "";
    const derivedDay = dateVal ? dayFromDate(dateVal) : form.day;

    setSaving(true);
    try {
      const payload: any = {
        trimister_id: Number(form.trimister_id),
        programm_id: Number(form.programm_id),
        subject_id: Number(form.subject_id),
        teacher_id: Number(form.teacher_id),
        room_id: Number(form.room_id),

        day: derivedDay,
        date: dateVal ? dateVal : null,

        start_time: normalizeTimeHM(form.start_time),
        end_time: normalizeTimeHM(form.end_time),

        class_type: form.class_type,
        enrolled_students: form.enrolled_students
          ? Number(form.enrolled_students)
          : 0,
      };

      await createTimeTableSession(payload);

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
    } catch (e: any) {
      console.error(e);
      setFieldErrors(extractFieldErrors(e));
      setModalError(extractErrorSummary(e));
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedClass) return;

    setModalError("");
    setFieldErrors({});
    if (!validateForm()) return;

    const dateVal = form.date?.trim() || "";
    const derivedDay = dateVal ? dayFromDate(dateVal) : form.day;

    setSaving(true);
    try {
      const payload: any = {
        trimister_id: Number(form.trimister_id),
        programm_id: Number(form.programm_id),
        subject_id: Number(form.subject_id),
        teacher_id: Number(form.teacher_id),
        room_id: Number(form.room_id),

        day: derivedDay,
        date: dateVal ? dateVal : null,

        start_time: normalizeTimeHM(form.start_time),
        end_time: normalizeTimeHM(form.end_time),

        class_type: form.class_type,
        enrolled_students: form.enrolled_students
          ? Number(form.enrolled_students)
          : 0,
      };

      await updateTimeTableSession(selectedClass.id, payload);

      const fresh = await getTimeTableSessions();
      setSessions(fresh.data || []);

      setShowEditModal(false);
      setSelectedClass(null);
    } catch (e: any) {
      console.error(e);
      setFieldErrors(extractFieldErrors(e));
      setModalError(extractErrorSummary(e));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (cls: ExtendedClassSession) => {
    const ok = window.confirm(
      "Are you sure you want to delete this timetable session?",
    );
    if (!ok) return;

    setSaving(true);
    setModalError("");
    setFieldErrors({});
    try {
      await deleteTimeTableSession(cls.id);
      const fresh = await getTimeTableSessions();
      setSessions(fresh.data || []);
    } catch (e: any) {
      console.error(e);
      setFieldErrors(extractFieldErrors(e));
      setModalError(extractErrorSummary(e));
    } finally {
      setSaving(false);
    }
  };

  const stats = useMemo(() => {
    const totalClasses = filteredClasses.length;
    const conflictCount = 0;
    const roomsUsed = new Set(filteredClasses.map((c) => c.roomId)).size;
    return { totalClasses, conflictCount, roomsUsed };
  }, [filteredClasses]);

  /** Shared Form Fields (for Add + Edit) */
  const TimetableFormFields = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="text-sm text-body block mb-1">Trimester *</label>
        <select
          value={form.trimister_id}
          onChange={(e) =>
            setForm((p) => ({ ...p, trimister_id: e.target.value }))
          }
          className="w-full px-4 py-2.5 border rounded-lg"
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
        <label className="text-sm text-body block mb-1">Program *</label>
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
          className="w-full px-4 py-2.5 border rounded-lg"
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
        <label className="text-sm text-body block mb-1">Subject *</label>
        <select
          value={form.subject_id}
          onChange={(e) =>
            setForm((p) => ({
              ...p,
              subject_id: e.target.value,
              teacher_id: "",
            }))
          }
          className="w-full px-4 py-2.5 border rounded-lg"
          disabled={!form.programm_id}
        >
          <option value="">
            {form.programm_id ? "Select Subject" : "Select Program first"}
          </option>
          {subjectsForSelectedProgram.map((s: any) => (
            <option key={s.id} value={String(s.id)}>
              {s.subject_code} - {s.subject_name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-sm text-body block mb-1">Teacher *</label>
        <select
          value={form.teacher_id}
          onChange={(e) =>
            setForm((p) => ({ ...p, teacher_id: e.target.value }))
          }
          className="w-full px-4 py-2.5 border rounded-lg"
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
        <label className="text-sm text-body block mb-1">Room *</label>
        <select
          value={form.room_id}
          onChange={(e) => setForm((p) => ({ ...p, room_id: e.target.value }))}
          className="w-full px-4 py-2.5 border rounded-lg"
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
        <label className="text-sm text-body block mb-1">Day</label>
        <select
          value={form.day}
          onChange={(e) =>
            setForm((p) => ({ ...p, day: e.target.value as Day }))
          }
          className="w-full px-4 py-2.5 border rounded-lg"
        >
          {days.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-sm text-body block mb-1">Date (optional)</label>
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
          className="w-full px-4 py-2.5 border rounded-lg"
        />
      </div>

      <div>
        <label className="text-sm text-body block mb-1">Start Time *</label>
        <input
          type="time"
          value={form.start_time}
          onChange={(e) =>
            setForm((p) => ({
              ...p,
              start_time: normalizeTimeHM(e.target.value),
            }))
          }
          className="w-full px-4 py-2.5 border rounded-lg"
        />
      </div>

      <div>
        <label className="text-sm text-body block mb-1">End Time *</label>
        <input
          type="time"
          value={form.end_time}
          onChange={(e) =>
            setForm((p) => ({
              ...p,
              end_time: normalizeTimeHM(e.target.value),
            }))
          }
          className="w-full px-4 py-2.5 border rounded-lg"
        />
      </div>

      <div>
        <label className="text-sm text-body block mb-1">Class Type *</label>
        <select
          value={form.class_type}
          onChange={(e) =>
            setForm((p) => ({ ...p, class_type: e.target.value as ClassType }))
          }
          className="w-full px-4 py-2.5 border rounded-lg"
        >
          <option value="Lecture">Lecture</option>
          <option value="Tutorial">Tutorial</option>
          <option value="Seminar">Seminar</option>
        </select>
        {!!fieldErrors.class_type?.length && (
          <p className="text-xs text-red-600 mt-1">
            {fieldErrors.class_type[0]}
          </p>
        )}
      </div>

      <div>
        <label className="text-sm text-body block mb-1">
          Enrolled Students
        </label>
        <input
          type="number"
          min={0}
          value={form.enrolled_students}
          onChange={(e) =>
            setForm((p) => ({ ...p, enrolled_students: e.target.value }))
          }
          className="w-full px-4 py-2.5 border rounded-lg"
        />
        {!!fieldErrors.enrolled_students?.length && (
          <p className="text-xs text-red-600 mt-1">
            {fieldErrors.enrolled_students[0]}
          </p>
        )}
      </div>
    </div>
  );

  /** Class card */
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
          "transition-[box-shadow,transform,filter] duration-200 ease-out",
          "will-change-transform",
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

        <div className="text-xs opacity-90 truncate mt-1">
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
          <div className="absolute top-2 right-2 flex gap-1 bg-white/20 backdrop-blur-sm rounded p-1">
            <button
              className="p-1 hover:bg-white/30 rounded transition-colors"
              title="View Details"
              onClick={(e) => {
                e.stopPropagation();
                openView(classSession);
              }}
            >
              <Eye className="w-3 h-3" />
            </button>

            <button
              className="p-1 hover:bg-white/30 rounded transition-colors"
              title="Edit"
              onClick={(e) => {
                e.stopPropagation();
                openEdit(classSession);
              }}
            >
              <Edit className="w-3 h-3" />
            </button>

            <button
              className="p-1 hover:bg-white/30 rounded transition-colors"
              title="Delete"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(classSession);
              }}
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    );
  };

  const isToday = selectedDate === todayLocalISO();

  // nicer labels
  const triStart = normalizeISODateOnly(selectedTrimesterObj?.start_date || "");
  const triEnd = normalizeISODateOnly(selectedTrimesterObj?.end_date || "");

  const weekStart = startOfWeekMonday(selectedDate);
  const weekEnd = addDays(weekStart, 6);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-primary-blue mb-2">Timetable Builder</h1>
          <p className="text-body">
            View and manage your class schedule{" "}
            {loading && (
              <span className="ml-2 text-sm text-gray-500">(Loading...)</span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Zoom */}
          <div className="flex items-center gap-2 bg-white rounded-xl p-2 shadow-card border border-light">
            <button
              onClick={() => setZoomLevel(Math.max(50, zoomLevel - 10))}
              className="p-2 hover:bg-soft rounded-lg transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4 text-body" />
            </button>
            <span className="text-sm text-body px-2">{zoomLevel}%</span>
            <button
              onClick={() => setZoomLevel(Math.min(150, zoomLevel + 10))}
              className="p-2 hover:bg-soft rounded-lg transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4 text-body" />
            </button>
          </div>

          <button
            onClick={() => setShowExportModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary-blue text-white rounded-xl hover:opacity-90 transition-opacity shadow-md"
          >
            <Download className="w-4 h-4" />
            Export as PDF
          </button>
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex gap-2 bg-white rounded-xl p-2 shadow-card border border-light w-fit">
        <button
          onClick={() => setViewMode("daily")}
          className={`px-5 py-2.5 rounded-lg transition-all text-sm font-medium ${
            viewMode === "daily"
              ? "bg-primary-blue text-white shadow-md"
              : "text-body hover:bg-soft"
          }`}
        >
          Daily
        </button>
        <button
          onClick={() => setViewMode("weekly")}
          className={`px-5 py-2.5 rounded-lg transition-all text-sm font-medium ${
            viewMode === "weekly"
              ? "bg-primary-blue text-white shadow-md"
              : "text-body hover:bg-soft"
          }`}
        >
          Weekly
        </button>
      </div>

      {/* ✅ Clean + modern schedule controls */}
      <div className="bg-white rounded-2xl shadow-card border border-light overflow-hidden">
        <div className="px-5 py-4 border-b border-light flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-50 border border-blue-100">
              <Calendar className="w-5 h-5 text-primary-blue" />
            </div>
            <div>
              <h2 className="text-dark">Schedule Controls</h2>
              <p className="text-xs text-gray-500">
                {viewMode === "daily"
                  ? `Daily: ${selectedDate} (${selectedDay})`
                  : `Week: ${weekStart} → ${weekEnd}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={refreshAll}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-soft hover:bg-gray-100 text-sm text-body border border-light"
              title="Refresh"
            >
              <RefreshCcw className="w-4 h-4" />
              Refresh
            </button>

            <button
              onClick={() => {
                const d = todayLocalISO();
                setSelectedDate(d);
              }}
              className="px-3 py-2 rounded-xl bg-soft hover:bg-gray-100 text-sm text-body border border-light"
            >
              Today
            </button>

            <button
              onClick={() => setSelectedDate(shiftDays(selectedDate, -1))}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-soft hover:bg-gray-100 text-sm text-body border border-light"
              title="Previous day"
            >
              <ChevronLeft className="w-4 h-4" />
              Prev
            </button>

            <button
              onClick={() => setSelectedDate(shiftDays(selectedDate, 1))}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-soft hover:bg-gray-100 text-sm text-body border border-light"
              title="Next day"
            >
              Next
              <ChevronRight className="w-4 h-4" />
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
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-primary-blue text-white hover:opacity-90 transition-opacity shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Add Session
            </button>
          </div>
        </div>

        <div className="p-5 grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-5">
            <label className="block text-sm text-body mb-2">Trimester *</label>
            <select
              value={selectedTrimesterId}
              onChange={(e) => setSelectedTrimesterId(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue text-sm"
            >
              <option value="">Select Trimester</option>
              {trimesters.map((t) => (
                <option key={t.id} value={String(t.id)}>
                  {t.name}
                </option>
              ))}
            </select>

            {selectedTrimesterObj && (
              <p className="text-xs text-gray-500 mt-2">
                Range: <span className="font-medium">{triStart}</span> →{" "}
                <span className="font-medium">{triEnd}</span>
              </p>
            )}
          </div>

          <div className="md:col-span-4">
            <label className="block text-sm text-body mb-2">Select Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue text-sm"
            />
            <p className="text-xs text-gray-500 mt-2">
              Auto Day: <span className="font-medium">{selectedDay}</span>
            </p>
          </div>

          <div className="md:col-span-3">
            <label className="block text-sm text-body mb-2">Quick Info</label>
            <div className="rounded-xl border border-light bg-soft p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Showing</span>
                <span className="text-sm font-semibold text-dark">
                  {filteredClasses.length}
                </span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-500">Rooms used</span>
                <span className="text-sm font-semibold text-dark">
                  {stats.roomsUsed}
                </span>
              </div>
            </div>
          </div>

          {selectedTrimesterObj && (
            <div className="md:col-span-12">
              <div className="mt-1 p-3 rounded-xl bg-blue-50 border border-blue-100 text-sm text-blue-800">
                ✅ Routine sessions (date = null) appear based on selected{" "}
                <b>day</b> and only when your selected date is inside this
                trimester.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-card p-5 border border-light">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-primary-blue" />
            <h2 className="text-dark">Filters</h2>
          </div>

          {(filterTeacher ||
            filterSubject ||
            filterRoom ||
            !showAllPrograms) && (
            <button
              onClick={() => {
                clearFilters();
                setShowAllPrograms(true);
                setSelectedPrograms([]);
              }}
              className="flex items-center gap-2 text-sm text-primary-blue hover:text-sky-blue transition-colors"
            >
              <X className="w-4 h-4" />
              Clear all filters
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
          <select
            value={filterTeacher}
            onChange={(e) => setFilterTeacher(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue text-sm"
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
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue text-sm"
          >
            <option value="">All Subjects</option>
            {subjects.map((s) => (
              <option key={s.id} value={String(s.id)}>
                {(s as any).subject_code} - {(s as any).subject_name}
              </option>
            ))}
          </select>

          <select
            value={filterRoom}
            onChange={(e) => setFilterRoom(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue text-sm"
          >
            <option value="">All Rooms</option>
            {rooms.map((r) => (
              <option key={r.id} value={String(r.id)}>
                {r.room_name}
              </option>
            ))}
          </select>
        </div>

        <div className="border-t border-light pt-4">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm text-body">Filter by Programs</label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showAllPrograms}
                onChange={(e) => setShowAllPrograms(e.target.checked)}
                className="w-4 h-4 text-primary-blue rounded focus:ring-primary-blue border-gray-300"
              />
              <span className="text-xs text-body">Show All</span>
            </label>
          </div>

          <div className="flex flex-wrap gap-2">
            {programNames.map((program) => {
              const color = programColors[program] || DEFAULT_COLOR;
              const isSelected = selectedPrograms.includes(program);

              return (
                <button
                  key={program}
                  onClick={() => toggleProgram(program)}
                  disabled={showAllPrograms}
                  className={`px-3 py-1.5 rounded-full text-xs transition-all ${
                    showAllPrograms
                      ? `${color.light} ${color.text} border ${color.border} opacity-60 cursor-not-allowed`
                      : isSelected
                        ? `${color.bg} text-white shadow-sm`
                        : `${color.light} ${color.text} border ${color.border} hover:shadow-md`
                  }`}
                >
                  {program}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Badges */}
      {viewMode === "daily" && (
        <div className="flex gap-3 flex-wrap">
          {isToday && (
            <div className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg border-2 border-blue-300">
              📅 Today&apos;s Schedule
            </div>
          )}
          {isWeekendDay(dayFromDate(selectedDate)) && (
            <div className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg border-2 border-gray-300">
              🏖️ Weekend Schedule
            </div>
          )}
          <div className="px-4 py-2 bg-soft text-body rounded-lg border border-light">
            Showing: <b>{filteredClasses.length}</b> class(es)
          </div>
        </div>
      )}

      {/* Daily View */}
      {viewMode === "daily" && (
        <div
          className="bg-white rounded-lg shadow-card overflow-hidden border border-light"
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
                  <th className="sticky left-0 z-20 px-6 py-4 text-left text-sm text-body bg-soft border-r border-light min-w-[100px]">
                    Time
                  </th>

                  {availableRooms.map((room) => (
                    <th
                      key={room.id}
                      className="px-6 py-4 text-center text-sm text-body border-r border-light min-w-[220px]"
                    >
                      <div className="font-medium">{room.room_name}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        Capacity: {room.capacity}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {timeSlots.map((time) => (
                  <tr
                    key={time}
                    className={`border-b border-gray-100 hover:bg-soft/30 transition-colors ${
                      isWeekendDay(selectedDay) ? "bg-gray-50" : ""
                    }`}
                  >
                    <td className="sticky left-0 z-10 px-6 py-4 text-sm text-body bg-white border-r border-light">
                      <span className="font-medium">{time}</span>
                    </td>

                    {availableRooms.map((room) => {
                      const classes = filteredClasses.filter((cls) => {
                        const slotStart = toMinutes(time);
                        const slotEnd = slotStart + 60;
                        const clsStart = toMinutes(cls.startTime);
                        const clsEnd = toMinutes(cls.endTime);

                        return (
                          Number(cls.roomId) === Number(room.id) &&
                          clsStart < slotEnd &&
                          clsEnd > slotStart
                        );
                      });

                      const slotStart = toMinutes(time);
                      const slotEnd = slotStart + 60;

                      const classStartingNow = classes.find((c) => {
                        const cStart = toMinutes(c.startTime);
                        return cStart >= slotStart && cStart < slotEnd;
                      });

                      if (classStartingNow) {
                        return (
                          <td
                            key={room.id}
                            rowSpan={getRowSpan(classStartingNow)}
                            className="px-3 py-3 border-r border-light align-top"
                          >
                            <ClassBlock classSession={classStartingNow} />
                          </td>
                        );
                      }

                      const overlappedButNotStart = classes.some(
                        (c) => toMinutes(c.startTime) < slotStart,
                      );
                      if (overlappedButNotStart) return null;

                      return (
                        <td
                          key={room.id}
                          className={`px-3 py-3 border-r border-light ${
                            isWeekendDay(dayFromDate(selectedDate))
                              ? "bg-gray-50"
                              : "bg-white"
                          } hover:bg-soft cursor-pointer transition-colors`}
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
                          <div className="h-20 flex items-center justify-center text-gray-400 text-sm hover:text-primary-blue transition-colors">
                            <Plus className="w-5 h-5" />
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
      )}

      {/* Weekly View */}
      {viewMode === "weekly" && (
        <div
          className="bg-white rounded-lg shadow-card overflow-hidden border border-light"
          style={{
            transform: `scale(${zoomLevel / 100})`,
            transformOrigin: "top left",
            width: `${10000 / zoomLevel}%`,
          }}
        >
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-soft border-b border-light sticky top-0 z-20">
                  <th className="sticky left-0 z-30 px-6 py-4 text-left text-sm text-body bg-soft border-r border-light min-w-[100px]">
                    Time
                  </th>

                  {days.map((day) => (
                    <th
                      key={day}
                      className={`px-6 py-4 text-center text-sm text-body border-r border-light min-w-[250px] ${
                        isWeekendDay(day) ? "bg-gray-100" : ""
                      }`}
                    >
                      <div className="font-medium">{day}</div>
                      {isWeekendDay(day) && (
                        <div className="text-xs text-gray-500 mt-1">
                          🏖️ Weekend
                        </div>
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
                    <td className="sticky left-0 z-10 px-6 py-4 text-sm text-body bg-white border-r border-light">
                      <span className="font-medium">{time}</span>
                    </td>

                    {days.map((day) => {
                      const classes = getClassesForWeeklySlot(time, day);

                      const slotStart = toMinutes(time);
                      const slotEnd = slotStart + 60;

                      const classStartingNow = classes.find((c) => {
                        const cStart = toMinutes(c.startTime);
                        return cStart >= slotStart && cStart < slotEnd;
                      });

                      if (classStartingNow) {
                        return (
                          <td
                            key={day}
                            rowSpan={getRowSpan(classStartingNow)}
                            className={`px-3 py-3 border-r border-light align-top ${
                              isWeekendDay(day) ? "bg-gray-50/50" : ""
                            }`}
                          >
                            <div className="space-y-2">
                              {classes
                                .filter((cls) => {
                                  const clsStart = toMinutes(cls.startTime);
                                  return (
                                    clsStart >= slotStart && clsStart < slotEnd
                                  );
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

                      const overlappedButNotStart = classes.some(
                        (c) => toMinutes(c.startTime) < slotStart,
                      );
                      if (overlappedButNotStart) return null;

                      return (
                        <td
                          key={day}
                          className={`px-3 py-3 border-r border-light ${
                            isWeekendDay(day) ? "bg-gray-50" : "bg-white"
                          } hover:bg-soft cursor-pointer transition-colors`}
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
                          <div className="h-20 flex items-center justify-center text-gray-400 text-sm hover:text-primary-blue transition-colors">
                            <Plus className="w-5 h-5" />
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
      )}

      {/* ✅ Program Legend */}
      <div className="bg-white rounded-lg shadow-card p-5 border border-light">
        <h3 className="text-dark mb-4">Program Legend</h3>
        <div className="flex flex-wrap gap-4">
          {programNames.map((program) => {
            const color = programColors[program] || DEFAULT_COLOR;
            return (
              <div key={program} className="flex items-center gap-2">
                <div className={`w-5 h-5 rounded ${color.bg}`} />
                <span className="text-sm text-body">{program}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ✅ Summary */}
      <div className="bg-white rounded-lg shadow-card p-6 border border-light">
        <h3 className="text-dark mb-4">Schedule Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-sm text-body mb-1">Total Classes</p>
            <p className="text-3xl text-primary-blue">{stats.totalClasses}</p>
          </div>
          <div>
            <p className="text-sm text-body mb-1">Conflicts</p>
            <p className="text-3xl text-red-500">{stats.conflictCount}</p>
          </div>
          <div>
            <p className="text-sm text-body mb-1">Rooms Used</p>
            <p className="text-3xl text-green-600">{stats.roomsUsed}</p>
          </div>
          <div>
            <p className="text-sm text-body mb-1">Programs</p>
            <p className="text-3xl text-purple-600">{programNames.length}</p>
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
              <div className="border-b border-light px-6 py-4 flex items-center justify-between sticky top-0 bg-white">
                <h2 className="text-primary-blue">Class Details</h2>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="p-2 hover:bg-soft rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-body" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <label className="text-sm text-body mb-1 block">
                    Trimester
                  </label>
                  <p className="text-dark">
                    {selectedClass.trimester?.name ||
                      `Trimester #${selectedClass.trimesterId}`}
                  </p>
                </div>

                <div>
                  <label className="text-sm text-body mb-1 block">
                    Subject Code & Name
                  </label>
                  <p className="text-dark text-lg">
                    {(selectedClass.subject as any)?.subject_code} -{" "}
                    {(selectedClass.subject as any)?.subject_name}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm text-body mb-1 block">
                      Program
                    </label>
                    <p className="text-dark">{selectedClass.programName}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm text-body mb-1 block">
                      Class Type
                    </label>
                    <span className="inline-block px-3 py-1 rounded-full text-sm bg-blue-50 text-blue-700">
                      {selectedClass.classType}
                    </span>
                  </div>
                  <div>
                    <label className="text-sm text-body mb-1 block">
                      Day & Time
                    </label>
                    <p className="text-dark">
                      {selectedClass.day}, {selectedClass.startTime} -{" "}
                      {selectedClass.endTime}
                      {selectedClass.date ? (
                        <span className="ml-2 text-xs text-gray-500">
                          (Date: {selectedClass.date})
                        </span>
                      ) : (
                        <span className="ml-2 text-xs text-gray-500">
                          (Routine)
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm text-body mb-1 block">Room</label>
                    <p className="text-dark">{selectedClass.room?.room_name}</p>
                  </div>
                  <div>
                    <label className="text-sm text-body mb-1 block">
                      Room Capacity
                    </label>
                    <p className="text-dark">
                      {selectedClass.room?.capacity} students
                    </p>
                  </div>
                </div>

                <div>
                  <label className="text-sm text-body mb-1 block">
                    Teacher
                  </label>
                  <div className="flex items-center gap-3 p-3 bg-soft rounded-lg border border-light">
                    <Users className="w-5 h-5 text-primary-blue" />
                    <div>
                      <p className="text-dark">
                        {selectedClass.teacher?.full_name}
                      </p>
                      <p className="text-sm text-body">
                        {(selectedClass.teacher as any)?.department || ""}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm text-body mb-1 block">
                    Enrolled Students
                  </label>
                  <p className="text-dark text-2xl text-primary-blue">
                    {selectedClass.enrolledStudents} students
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
            <div className="bg-white rounded-xl max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
              <div className="border-b border-light px-6 py-4 flex items-center justify-between">
                <h2 className="text-dark">Add Timetable</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 hover:bg-soft rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-body" />
                </button>
              </div>

              <div className="p-6 space-y-4 overflow-y-auto">
                {modalError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 whitespace-pre-line">
                    {modalError}
                  </div>
                )}
                <TimetableFormFields />
              </div>

              <div className="px-6 py-4 border-t border-light flex gap-3">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-3 bg-gray-100 text-body rounded-xl hover:bg-gray-200 transition-colors"
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  onClick={handleCreate}
                  className="flex-1 px-4 py-3 bg-primary-blue text-white rounded-xl hover:opacity-90 transition-opacity"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Add Timetable"}
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
            <div className="bg-white rounded-xl max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
              <div className="border-b border-light px-6 py-4 flex items-center justify-between">
                <h2 className="text-dark">Edit Timetable</h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-2 hover:bg-soft rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-body" />
                </button>
              </div>

              <div className="p-6 space-y-4 overflow-y-auto">
                {modalError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 whitespace-pre-line">
                    {modalError}
                  </div>
                )}
                <TimetableFormFields />
              </div>

              <div className="px-6 py-4 border-t border-light flex gap-3">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-3 bg-gray-100 text-body rounded-xl hover:bg-gray-200 transition-colors"
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  onClick={handleUpdate}
                  className="flex-1 px-4 py-3 bg-primary-blue text-white rounded-xl hover:opacity-90 transition-opacity"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Update Timetable"}
                </button>
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
                  className="p-2 hover:bg-soft rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-body" />
                </button>
              </div>

              <div className="p-6">
                <p className="text-body mb-6">
                  Export the current timetable view as a PDF report.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      alert("PDF Export should be implemented here.");
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
