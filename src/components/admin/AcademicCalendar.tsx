import { JSX, useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import { Calendar, Plus, Edit2, Trash2, X, Filter } from "lucide-react";
import { toast } from "sonner";
import { getCurrentUserRole, type SafeUserRole } from "../../utils/auth";

/** ========================= Types ========================= */
type PeriodType =
  | "teaching"
  | "orientation"
  | "exam"
  | "exam-break"
  | "holiday"
  | "census"
  | "trimester-break";

type TrimesterStatus = "active" | "inactive";

type AcademicPeriodApi = {
  id: number;
  trimister_id: number;
  name: string;
  type: PeriodType;
  start_date: string;
  end_date: string;
  notes?: string | null;
  trimister?: TrimisterApi | null;
  created_at?: string;
  updated_at?: string;
};

type TrimisterApi = {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  break_start_date: string | null;
  break_end_date: string | null;
  status: TrimesterStatus;
  created_at?: string;
  updated_at?: string;
};

type ApiListResponse<T> = { status: number; message: string; data: T[] };
type ApiSingleResponse<T> = { status: number; message: string; data: T };

interface AcademicPeriodUI {
  id: string;
  name: string;
  type: PeriodType;
  startDate: Date;
  endDate: Date;
  color: string;
  bgColor: string;
  borderColor: string;
  notes?: string;
}

const periodTypes = [
  {
    value: "teaching",
    label: "Teaching Weeks",
    color: "#60A5FA",
    bgColor: "#EFF6FF",
    borderColor: "#BFDBFE",
  },
  {
    value: "orientation",
    label: "Orientation",
    color: "#A78BFA",
    bgColor: "#F5F3FF",
    borderColor: "#DDD6FE",
  },
  {
    value: "holiday",
    label: "Public Holidays",
    color: "#EF4444",
    bgColor: "#FEF2F2",
    borderColor: "#FECACA",
  },
  {
    value: "census",
    label: "Census Date",
    color: "#F59E0B",
    bgColor: "#FFFBEB",
    borderColor: "#FDE68A",
  },
  {
    value: "exam",
    label: "Examination Period",
    color: "#EAB308",
    bgColor: "#FEFCE8",
    borderColor: "#FDE047",
  },
  {
    value: "exam-break",
    label: "Examination Break",
    color: "#6B7280",
    bgColor: "#F9FAFB",
    borderColor: "#D1D5DB",
  },
  {
    value: "trimester-break",
    label: "Trimester Break",
    color: "#1E40AF",
    bgColor: "#EFF6FF",
    borderColor: "#93C5FD",
  },
] as const;

/** ========================= Helpers ========================= */
function toDateStart(s: string) {
  return new Date(`${s}T00:00:00`);
}
function toDateEnd(s: string) {
  return new Date(`${s}T23:59:59`);
}

function mapPeriodApiToUi(p: AcademicPeriodApi): AcademicPeriodUI {
  const meta = periodTypes.find((x) => x.value === p.type);
  return {
    id: String(p.id),
    name: p.name,
    type: p.type,
    startDate: toDateStart(p.start_date),
    endDate: toDateEnd(p.end_date),
    color: meta?.color ?? "#60A5FA",
    bgColor: meta?.bgColor ?? "#EFF6FF",
    borderColor: meta?.borderColor ?? "#BFDBFE",
    notes: p.notes ?? undefined,
  };
}

function formatYmd(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function shortDate(yyyyMmDd: string) {
  return new Date(`${yyyyMmDd}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const trimesterColorPalette = [
  { bgColor: "#E0F2FE", borderColor: "#00b3ffff" },
  { bgColor: "#ECFDF5", borderColor: "#04925eff" },
  { bgColor: "#FEF3C7", borderColor: "#F59E0B" },
  { bgColor: "#FCE7F3", borderColor: "#fdf109ff" },
  { bgColor: "#EDE9FE", borderColor: "#5109f7ff" },
  { bgColor: "#DCFCE7", borderColor: "#c52289ff" },
] as const;

/** ========================= Skeleton: sidebar item ========================= */
function SidebarSkeletonItem() {
  return (
    <div className="px-3 py-3 rounded-lg">
      <div className="flex items-start gap-2">
        <div className="w-2 h-2 rounded-full bg-gray-200 animate-pulse mt-1.5 flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-3.5 w-28 rounded bg-gray-200 animate-pulse" />
          <div className="h-3 w-20 rounded bg-gray-200 animate-pulse" />
          <div className="h-4 w-12 rounded-full bg-gray-200 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

/** ========================= Skeleton: calendar month card ========================= */
function CalendarMonthSkeleton({ name, year }: { name: string; year: number }) {
  return (
    <div className="bg-white rounded-lg shadow-card border border-light overflow-hidden">
      <div className="bg-soft px-3 py-2 border-b border-light">
        <h3 className="text-xs font-medium text-dark">
          {name} {year}
        </h3>
      </div>
      <div className="p-2">
        <div className="grid grid-cols-7 mb-1">
          {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
            <div
              key={i}
              className="text-center text-xs font-medium text-body py-0.5"
            >
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-0.5">
          {Array.from({ length: 35 }).map((_, i) => (
            <div
              key={i}
              className="aspect-square rounded-sm bg-gray-100 animate-pulse"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/** ========================= Component ========================= */
export default function AcademicCalendar() {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedCampus] = useState("main");

  const [currentUserRole, setCurrentUserRole] =
    useState<SafeUserRole>("Unknown");
  const [meLoading, setMeLoading] = useState(true);

  const [trimesters, setTrimesters] = useState<TrimisterApi[]>([]);
  const [loadingTrimesters, setLoadingTrimesters] = useState(true);
  const [loadingPeriods, setLoadingPeriods] = useState(false);
  const [selectedTrimisterId, setSelectedTrimisterId] = useState<number | null>(
    null,
  );
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("active");
  const [periods, setPeriods] = useState<AcademicPeriodUI[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPeriod, setEditingPeriod] = useState<AcademicPeriodUI | null>(
    null,
  );
  const [selectedPeriod, setSelectedPeriod] = useState<AcademicPeriodUI | null>(
    null,
  );
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [modalError, setModalError] = useState("");
  const [savingPeriod, setSavingPeriod] = useState(false);

  const token = useMemo(() => localStorage.getItem("token"), []);

  const canCreate =
    currentUserRole === "SuperAdmin" || currentUserRole === "Admin";
  const canEdit = canCreate;
  const canDelete = canCreate;

  // ── Derived ────────────────────────────────────────────────────────────────
  const filteredTrimesters = useMemo(
    () =>
      statusFilter === "all"
        ? trimesters
        : trimesters.filter((t) => t.status === statusFilter),
    [trimesters, statusFilter],
  );

  const selectedTrimister = useMemo(
    () =>
      selectedTrimisterId
        ? (trimesters.find((t) => t.id === selectedTrimisterId) ?? null)
        : null,
    [selectedTrimisterId, trimesters],
  );

  const getTrimesterColorById = (trimesterId: number) => {
    const index = trimesters.findIndex((t) => t.id === trimesterId);
    return trimesterColorPalette[
      index >= 0 ? index % trimesterColorPalette.length : 0
    ];
  };

  // ── Fetch auth role ────────────────────────────────────────────────────────
  useEffect(() => {
    const loadRole = async () => {
      try {
        setMeLoading(true);
        const role = await getCurrentUserRole();
        setCurrentUserRole(role);
      } finally {
        setMeLoading(false);
      }
    };

    loadRole();
  }, []);

  // ── Fetch trimesters ───────────────────────────────────────────────────────
  useEffect(() => {
    const fetchTrimesters = async () => {
      try {
        setLoadingTrimesters(true);
        const res = await api.get<ApiListResponse<TrimisterApi>>(
          "/trimisters",
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        if (res.data.status === 1) {
          const list = res.data.data || [];
          setTrimesters(list);
          const active = list.find((t) => t.status === "active") ?? list[0];
          if (active) {
            setSelectedTrimisterId(active.id);
            setSelectedYear(
              new Date(`${active.start_date}T00:00:00`).getFullYear(),
            );
          }
        } else {
          toast.error(res.data.message || "Failed to load trimesters.");
        }
      } catch {
        toast.error("Error loading trimesters.");
      } finally {
        setLoadingTrimesters(false);
      }
    };
    fetchTrimesters();
  }, [token]);

  // If selected trimester becomes hidden by the filter, switch to first visible
  useEffect(() => {
    if (!selectedTrimisterId) return;
    const stillVisible = filteredTrimesters.some(
      (t) => t.id === selectedTrimisterId,
    );
    if (!stillVisible && filteredTrimesters.length > 0) {
      const next = filteredTrimesters[0];
      setSelectedTrimisterId(next.id);
      setSelectedYear(new Date(`${next.start_date}T00:00:00`).getFullYear());
    }
  }, [filteredTrimesters, selectedTrimisterId]);

  // ── Fetch periods ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!selectedTrimisterId) return;
    const fetchPeriods = async () => {
      try {
        setLoadingPeriods(true);
        const res = await api.get<ApiListResponse<AcademicPeriodApi>>(
          `/academic-periods?trimister_id=${selectedTrimisterId}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        if (res.data.status === 1)
          setPeriods((res.data.data || []).map(mapPeriodApiToUi));
        else
          toast.error(res.data.message || "Failed to load academic periods.");
      } catch {
        toast.error("Error loading academic periods.");
      } finally {
        setLoadingPeriods(false);
      }
    };
    fetchPeriods();
  }, [selectedTrimisterId, token]);

  // ── CRUD ───────────────────────────────────────────────────────────────────
  const createPeriod = async (payload: {
    trimister_id: number;
    name: string;
    type: PeriodType;
    start_date: string;
    end_date: string;
    notes?: string;
  }): Promise<{ ok: boolean; message: string }> => {
    if (!canCreate) {
      return {
        ok: false,
        message: "You do not have permission to create period.",
      };
    }

    try {
      const res = await api.post<ApiSingleResponse<AcademicPeriodApi>>(
        "/academic-periods",
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (res.data.status === 1) {
        setPeriods((prev) => [mapPeriodApiToUi(res.data.data), ...prev]);
        return { ok: true, message: "" };
      }
      return {
        ok: false,
        message: res.data.message || "Failed to create period.",
      };
    } catch (err: any) {
      return {
        ok: false,
        message: err?.response?.data?.message || "Failed to create period.",
      };
    }
  };

  const updatePeriod = async (
    id: string,
    payload: {
      trimister_id: number;
      name: string;
      type: PeriodType;
      start_date: string;
      end_date: string;
      notes?: string;
    },
  ): Promise<{ ok: boolean; message: string }> => {
    if (!canEdit) {
      return {
        ok: false,
        message: "You do not have permission to update period.",
      };
    }

    try {
      const res = await api.put<ApiSingleResponse<AcademicPeriodApi>>(
        `/academic-periods/${id}`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (res.data.status === 1) {
        setPeriods((prev) =>
          prev.map((p) => (p.id === id ? mapPeriodApiToUi(res.data.data) : p)),
        );
        return { ok: true, message: "" };
      }
      return {
        ok: false,
        message: res.data.message || "Failed to update period.",
      };
    } catch (err: any) {
      return {
        ok: false,
        message: err?.response?.data?.message || "Failed to update period.",
      };
    }
  };

  const deletePeriodApi = async (id: string) => {
    if (!canDelete) {
      toast.error("You do not have permission to delete period.");
      return false;
    }

    try {
      setDeletingId(id);
      const res = await api.delete<{ status: number; message: string }>(
        `/academic-periods/${id}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (res.data.status === 1) {
        setPeriods((prev) => prev.filter((p) => p.id !== id));
        toast.success("Period deleted successfully.");
        return true;
      }
      toast.error(res.data.message || "Failed to delete period.");
      return false;
    } catch {
      toast.error("Error deleting period.");
      return false;
    } finally {
      setDeletingId(null);
    }
  };

  // ── Calendar helpers ───────────────────────────────────────────────────────
  const getDaysInMonth = (y: number, m: number) =>
    new Date(y, m + 1, 0).getDate();
  const getFirstDayOfMonth = (y: number, m: number) =>
    new Date(y, m, 1).getDay();

  const isDateInPeriod = (date: Date, p: AcademicPeriodUI) => {
    const t = date.getTime();
    return (
      t >= new Date(p.startDate).setHours(0, 0, 0, 0) &&
      t <= new Date(p.endDate).setHours(23, 59, 59, 999)
    );
  };

  const getPeriodsForDate = (date: Date) =>
    periods.filter((p) => isDateInPeriod(date, p));

  const isDateInTrimester = (date: Date, trimester: TrimisterApi) => {
    const t = date.getTime();
    const start = new Date(`${trimester.start_date}T00:00:00`).getTime();
    const end = new Date(`${trimester.end_date}T23:59:59`).getTime();
    return t >= start && t <= end;
  };

  const getTrimesterForDate = (date: Date) => {
    return trimesters.find((t) => isDateInTrimester(date, t)) ?? null;
  };

  // ── UI handlers ────────────────────────────────────────────────────────────
  const handleAddPeriod = () => {
    if (!canCreate) {
      toast.error("You do not have permission to add period.");
      return;
    }
    setEditingPeriod(null);
    setModalError("");
    setIsModalOpen(true);
  };

  const handleEditPeriod = (p: AcademicPeriodUI) => {
    if (!canEdit) {
      toast.error("You do not have permission to edit period.");
      return;
    }
    setEditingPeriod(p);
    setModalError("");
    setIsModalOpen(true);
  };

  const handleDeletePeriod = async (id: string) => {
    if (!canDelete) {
      toast.error("You do not have permission to delete period.");
      return;
    }
    const ok = await deletePeriodApi(id);
    if (ok) setSelectedPeriod(null);
  };

  const selectTrimester = (t: TrimisterApi) => {
    setSelectedTrimisterId(t.id);
    setSelectedYear(new Date(`${t.start_date}T00:00:00`).getFullYear());
  };

  // ── Render month cells ─────────────────────────────────────────────────────
  const renderCalendarMonth = (month: number): JSX.Element[] => {
    const daysInMonth = getDaysInMonth(selectedYear, month);
    const firstDay = getFirstDayOfMonth(selectedYear, month);
    const days: JSX.Element[] = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`e${i}`} className="aspect-square" />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(selectedYear, month, day);
      const dayPeriods = getPeriodsForDate(date);
      const dayTrimester = getTrimesterForDate(date);
      const trimesterColor = dayTrimester
        ? getTrimesterColorById(dayTrimester.id)
        : null;
      const isToday = new Date().toDateString() === date.toDateString();

      days.push(
        <div
          key={day}
          className="aspect-square relative group cursor-pointer"
          onClick={() => {
            if (dayPeriods.length > 0) setSelectedPeriod(dayPeriods[0]);
          }}
        >
          <div
            className={`w-full h-full flex items-center justify-center text-xs relative ${isToday ? "font-semibold" : ""}`}
          >
            {trimesterColor && (
              <div
                className="absolute inset-0.5 rounded-sm"
                style={{
                  backgroundColor: trimesterColor.bgColor,
                  border: `1px solid ${trimesterColor.borderColor}`,
                  opacity: 0.45,
                }}
              />
            )}

            {dayPeriods.length > 0 && (
              <div
                className="absolute inset-0.5 rounded-sm z-10 transition-all group-hover:scale-105"
                style={{
                  backgroundColor: dayPeriods[0].bgColor,
                  borderWidth: 1,
                  borderStyle: "solid",
                  borderColor: dayPeriods[0].borderColor,
                }}
              />
            )}

            <span
              className={`z-20 ${dayPeriods.length > 0 ? "text-dark" : "text-body"}`}
            >
              {day}
            </span>

            {isToday && (
              <div className="absolute inset-0 flex items-center justify-center z-30">
                <div className="w-6 h-6 rounded-full border-2 border-primary-blue" />
              </div>
            )}

            {dayPeriods.length > 1 && (
              <div className="absolute top-0.5 right-0.5 w-1 h-1 rounded-full bg-primary-blue z-30" />
            )}
          </div>

          {dayPeriods.length > 0 && (
            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1 px-2 py-1.5 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-40 shadow-lg">
              {dayPeriods[0].name}
              <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900" />
            </div>
          )}
        </div>,
      );
    }
    return days;
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-primary-blue mb-1">Academic Calendar</h1>
          <p className="text-body text-sm">
            Manage trimesters, teaching periods, exams, and breaks
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Current role: {meLoading ? "Loading..." : currentUserRole}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-xl text-sm text-body focus:outline-none focus:ring-2 focus:ring-primary-blue bg-white cursor-pointer"
          >
            {[2024, 2025, 2026, 2027].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>

          {selectedTrimisterId && canCreate && !meLoading && (
            <button
              onClick={handleAddPeriod}
              className="flex items-center gap-2 px-4 py-2 bg-primary-blue text-white rounded-xl hover:opacity-90 active:scale-[0.97] active:opacity-80 transition-all duration-150 shadow-md select-none cursor-pointer text-sm"
            >
              <Plus className="w-4 h-4" />
              Add Period
            </button>
          )}
        </div>
      </div>

      {/* ── Legend — unchanged + trimester legend ── */}
      <div className="bg-white rounded-lg shadow-card px-5 py-3 border border-light space-y-3">
        <div className="flex flex-wrap items-center gap-4">
          {periodTypes.map((type) => (
            <div key={type.value} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded border"
                style={{
                  backgroundColor: type.bgColor,
                  borderColor: type.borderColor,
                }}
              />
              <span className="text-sm text-body whitespace-nowrap">
                {type.label}
              </span>
            </div>
          ))}
        </div>

        <div className="border-t border-light pt-3">
          <p className="text-xs font-medium text-dark mb-2">Trimester colors</p>
          <div className="flex flex-wrap items-center gap-4">
            {trimesters.map((trimester) => {
              const c = getTrimesterColorById(trimester.id);
              return (
                <div key={trimester.id} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded border flex-shrink-0"
                    style={{
                      backgroundColor: c.bgColor,
                      borderColor: c.borderColor,
                    }}
                  />
                  <span className="text-sm text-body whitespace-nowrap">
                    {trimester.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Body: sidebar + calendar grid ── */}
      <div className="flex gap-5 items-start">
        {/* ── Trimester sidebar ── */}
        <div className="w-56 flex-shrink-0 bg-white rounded-lg shadow-card border border-light overflow-hidden sticky top-24">
          {/* Header */}
          <div className="px-4 py-3 border-b border-light flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-primary-blue" />
              <span className="text-sm font-medium text-dark">Trimesters</span>
            </div>
            {statusFilter !== "active" && (
              <button
                onClick={() => setStatusFilter("active")}
                className="text-xs text-primary-blue hover:underline cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>

          {/* Status toggle */}
          <div className="px-3 py-2.5 border-b border-light">
            <div className="flex gap-1 p-1 bg-soft rounded-lg">
              {(["active", "inactive", "all"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`flex-1 py-1 rounded-md text-xs font-medium transition-all duration-150 cursor-pointer capitalize ${
                    statusFilter === s
                      ? "bg-white text-primary-blue shadow-sm"
                      : "text-body hover:text-dark"
                  }`}
                >
                  {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Trimester list */}
          <div
            className="overflow-y-auto"
            style={{ maxHeight: "calc(100vh - 320px)" }}
          >
            {loadingTrimesters ? (
              <div className="p-2 space-y-1">
                {Array.from({ length: 3 }).map((_, i) => (
                  <SidebarSkeletonItem key={i} />
                ))}
              </div>
            ) : filteredTrimesters.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <Calendar className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-xs text-body">
                  No {statusFilter !== "all" ? statusFilter : ""} trimesters
                  found.
                </p>
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {filteredTrimesters.map((t) => {
                  const isSelected = t.id === selectedTrimisterId;
                  const trimesterColor = getTrimesterColorById(t.id);

                  return (
                    <button
                      key={t.id}
                      onClick={() => selectTrimester(t)}
                      className={`w-full text-left px-3 py-3 rounded-lg transition-all duration-150 cursor-pointer ${
                        isSelected
                          ? "bg-primary-blue/10 border border-primary-blue/20"
                          : "hover:bg-soft border border-transparent"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <div
                          className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                          style={{
                            backgroundColor: trimesterColor.borderColor,
                          }}
                        />
                        <div className="min-w-0">
                          <p
                            className={`text-sm font-medium truncate leading-tight ${isSelected ? "text-primary-blue" : "text-dark"}`}
                          >
                            {t.name}
                          </p>
                          <p className="text-xs text-body mt-0.5">
                            {shortDate(t.start_date)} – {shortDate(t.end_date)}
                          </p>
                          <span
                            className={`inline-block mt-1.5 px-2 py-0.5 rounded-full text-xs ${
                              t.status === "active"
                                ? "bg-green-50 text-green-600"
                                : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            {t.status}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer summary */}
          {!loadingTrimesters && selectedTrimister && (
            <div className="border-t border-light px-4 py-3 bg-soft">
              <p className="text-xs text-body">Viewing periods for</p>
              <p className="text-sm font-medium text-dark truncate mt-0.5">
                {selectedTrimister.name}
              </p>
              <p className="text-xs text-body mt-0.5">
                {loadingPeriods
                  ? "Loading periods…"
                  : `${periods.length} period${periods.length !== 1 ? "s" : ""} defined`}
              </p>
            </div>
          )}
        </div>

        {/* ── Calendar grid ── */}
        <div className="flex-1 min-w-0">
          {!selectedTrimisterId && !loadingTrimesters ? (
            <div className="bg-white rounded-lg shadow-card border border-light p-16 text-center">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-body">
                Select a trimester from the sidebar to view its calendar.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {loadingTrimesters || loadingPeriods
                ? MONTH_NAMES.map((name, i) => (
                    <CalendarMonthSkeleton
                      key={i}
                      name={name}
                      year={selectedYear}
                    />
                  ))
                : MONTH_NAMES.map((monthName, monthIndex) => (
                    <div
                      key={monthIndex}
                      className="bg-white rounded-lg shadow-card border border-light overflow-hidden"
                    >
                      <div className="bg-soft px-3 py-2 border-b border-light">
                        <h3 className="text-xs font-medium text-dark">
                          {monthName} {selectedYear}
                        </h3>
                      </div>
                      <div className="p-2">
                        <div className="grid grid-cols-7 mb-1">
                          {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                            <div
                              key={i}
                              className="text-center text-xs font-medium text-body py-0.5"
                            >
                              {d}
                            </div>
                          ))}
                        </div>
                        <div className="grid grid-cols-7">
                          {renderCalendarMonth(monthIndex)}
                        </div>
                      </div>
                    </div>
                  ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Period Detail Modal ── */}
      {selectedPeriod && (
        <>
          <div
            className="fixed inset-0 bg-white/40 backdrop-blur-sm z-50"
            onClick={() => setSelectedPeriod(null)}
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
              <div className="px-6 py-4 border-b border-light flex items-center justify-between">
                <h2 className="text-primary-blue">Period Details</h2>
                <button
                  onClick={() => setSelectedPeriod(null)}
                  className="p-2 hover:bg-soft rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5 text-body" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div
                  className="flex items-center gap-3 p-3 rounded-lg border"
                  style={{
                    backgroundColor: selectedPeriod.bgColor,
                    borderColor: selectedPeriod.borderColor,
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-lg border-2 flex-shrink-0"
                    style={{
                      backgroundColor: selectedPeriod.bgColor,
                      borderColor: selectedPeriod.borderColor,
                    }}
                  />
                  <div>
                    <p className="text-sm font-semibold text-dark">
                      {selectedPeriod.name}
                    </p>
                    <p className="text-xs text-body">
                      {periodTypes.find((t) => t.value === selectedPeriod.type)
                        ?.label ?? selectedPeriod.type}
                    </p>
                  </div>
                </div>

                <div className="grid gap-3">
                  <div className="p-4 bg-soft rounded-lg border border-light">
                    <p className="text-xs text-body mb-1">Date Range</p>
                    <p className="text-dark text-sm">
                      {selectedPeriod.startDate.toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                      {" – "}
                      {selectedPeriod.endDate.toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>

                  {selectedPeriod.notes && (
                    <div className="p-4 bg-soft rounded-lg border border-light">
                      <p className="text-xs text-body mb-1">Notes</p>
                      <p className="text-dark text-sm">
                        {selectedPeriod.notes}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="px-6 py-4 border-t border-light flex items-center justify-between">
                {canDelete ? (
                  <button
                    onClick={() => handleDeletePeriod(selectedPeriod.id)}
                    disabled={deletingId === selectedPeriod.id}
                    className="flex items-center gap-2 px-4 py-2.5 text-red-500 hover:bg-red-50 active:bg-red-100 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed rounded-xl transition-all duration-150 text-sm font-medium cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    {deletingId === selectedPeriod.id ? "Deleting…" : "Delete"}
                  </button>
                ) : (
                  <div />
                )}

                {canEdit ? (
                  <button
                    onClick={() => {
                      handleEditPeriod(selectedPeriod);
                      setSelectedPeriod(null);
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 bg-primary-blue text-white rounded-xl hover:opacity-90 active:opacity-80 active:scale-[0.98] transition-all duration-150 text-sm font-medium cursor-pointer"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit Period
                  </button>
                ) : (
                  <button
                    onClick={() => setSelectedPeriod(null)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-primary-blue text-white rounded-xl hover:opacity-90 active:opacity-80 active:scale-[0.98] transition-all duration-150 text-sm font-medium cursor-pointer"
                  >
                    Close
                  </button>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── Add/Edit Modal ── */}
      {isModalOpen && canCreate && (
        <AddEditPeriodModal
          trimisterId={selectedTrimisterId}
          period={editingPeriod}
          error={modalError}
          saving={savingPeriod}
          onClearError={() => setModalError("")}
          onClose={() => {
            setIsModalOpen(false);
            setEditingPeriod(null);
            setModalError("");
          }}
          onSave={async (form) => {
            if (!selectedTrimisterId) {
              setModalError("Please select a trimester first.");
              return;
            }
            setSavingPeriod(true);
            setModalError("");

            const payload = {
              trimister_id: selectedTrimisterId,
              name: form.name.trim(),
              type: form.type,
              start_date: form.startDate,
              end_date: form.endDate,
              notes: form.notes?.trim() || undefined,
            };

            const result = editingPeriod
              ? await updatePeriod(editingPeriod.id, payload)
              : await createPeriod(payload);

            setSavingPeriod(false);

            if (result.ok) {
              setIsModalOpen(false);
              setEditingPeriod(null);
              setModalError("");
              toast.success(
                editingPeriod
                  ? "Period updated successfully!"
                  : "Period added successfully!",
              );
            } else {
              setModalError(result.message);
            }
          }}
        />
      )}
    </div>
  );
}

/** ========================= Add/Edit Modal ========================= */
interface AddEditPeriodModalProps {
  trimisterId: number | null;
  period: AcademicPeriodUI | null;
  error?: string;
  saving?: boolean;
  onClearError?: () => void;
  onClose: () => void;
  onSave: (period: {
    name: string;
    type: PeriodType;
    startDate: string;
    endDate: string;
    notes?: string;
  }) => void;
}

function AddEditPeriodModal({
  trimisterId,
  period,
  error,
  saving,
  onClearError,
  onClose,
  onSave,
}: AddEditPeriodModalProps) {
  const [formData, setFormData] = useState({
    name: period?.name || "",
    type: (period?.type || "teaching") as PeriodType,
    startDate: period?.startDate ? formatYmd(period.startDate) : "",
    endDate: period?.endDate ? formatYmd(period.endDate) : "",
    notes: period?.notes || "",
  });

  const clearErr = () => onClearError?.();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !trimisterId ||
      !formData.name.trim() ||
      !formData.startDate ||
      !formData.endDate
    )
      return;
    onSave({
      name: formData.name,
      type: formData.type,
      startDate: formData.startDate,
      endDate: formData.endDate,
      notes: formData.notes,
    });
  };

  const selectedMeta = periodTypes.find((t) => t.value === formData.type);

  return (
    <>
      <div
        className="fixed inset-0 bg-white/40 backdrop-blur-sm z-50"
        onClick={!saving ? onClose : undefined}
      />
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
          <div className="border-b border-light px-6 py-4 flex items-center justify-between sticky top-0 bg-white z-10">
            <h2 className="text-primary-blue">
              {period ? "Edit Period" : "Add New Period"}
            </h2>
            <button
              onClick={onClose}
              disabled={!!saving}
              className="p-2 hover:bg-soft active:bg-soft/80 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
            >
              <X className="w-5 h-5 text-body" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm text-body mb-2">
                Period Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => {
                  clearErr();
                  setFormData({ ...formData, name: e.target.value });
                }}
                placeholder="e.g., Trimester 1 – Teaching Weeks"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-shadow"
              />
            </div>

            <div>
              <label className="block text-sm text-body mb-2">
                Period Type <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.type}
                onChange={(e) => {
                  clearErr();
                  setFormData({
                    ...formData,
                    type: e.target.value as PeriodType,
                  });
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-shadow cursor-pointer"
              >
                {periodTypes.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div
              className="flex items-center gap-3 p-4 rounded-xl border"
              style={{
                backgroundColor: selectedMeta?.bgColor,
                borderColor: selectedMeta?.borderColor,
              }}
            >
              <div
                className="w-10 h-10 rounded-lg border-2 flex-shrink-0"
                style={{
                  backgroundColor: selectedMeta?.bgColor,
                  borderColor: selectedMeta?.borderColor,
                }}
              />
              <div>
                <p className="text-sm font-medium text-dark">
                  {selectedMeta?.label}
                </p>
                <p className="text-xs text-body">
                  This colour will appear on the calendar
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-body mb-2">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={formData.startDate}
                  onChange={(e) => {
                    clearErr();
                    setFormData({ ...formData, startDate: e.target.value });
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-shadow"
                />
              </div>
              <div>
                <label className="block text-sm text-body mb-2">
                  End Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={formData.endDate}
                  onChange={(e) => {
                    clearErr();
                    setFormData({ ...formData, endDate: e.target.value });
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-shadow"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-body mb-2">
                Notes (optional)
              </label>
              <textarea
                rows={3}
                value={formData.notes}
                onChange={(e) => {
                  clearErr();
                  setFormData({ ...formData, notes: e.target.value });
                }}
                placeholder="Add any additional information…"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-shadow resize-none"
              />
            </div>

            <div className="flex gap-4 pt-2 border-t border-light">
              <button
                type="submit"
                disabled={!trimisterId || !!saving}
                className="flex-1 py-3 bg-primary-blue text-white rounded-xl hover:opacity-90 active:opacity-80 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-150 font-medium shadow-sm cursor-pointer"
              >
                {saving ? "Saving…" : period ? "Update Period" : "Save Period"}
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={!!saving}
                className="flex-1 py-3 bg-gray-100 text-body rounded-xl hover:bg-gray-200 active:bg-gray-300 active:scale-[0.98] disabled:opacity-50 transition-all duration-150 font-medium cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
