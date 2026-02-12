import { JSX, useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import { Calendar, Plus, Edit2, Trash2, X } from "lucide-react";

/** =========================
 * Types (API + UI)
 * ========================= */

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

type ApiListResponse<T> = {
  status: number;
  message: string;
  data: T[];
};

type ApiSingleResponse<T> = {
  status: number;
  message: string;
  data: T;
};

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

/** =========================
 * Helpers
 * ========================= */

function toDateStart(yyyyMmDd: string) {
  return new Date(`${yyyyMmDd}T00:00:00`);
}
function toDateEnd(yyyyMmDd: string) {
  return new Date(`${yyyyMmDd}T23:59:59`);
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
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** =========================
 * Component
 * ========================= */

export default function AcademicCalendar() {
  const [selectedYear, setSelectedYear] = useState(2025);
  const [selectedCampus, setSelectedCampus] = useState("main");

  // Dynamic data
  const [trimesters, setTrimesters] = useState<TrimisterApi[]>([]);
  const [selectedTrimisterId, setSelectedTrimisterId] = useState<number | null>(
    null,
  );
  const [periods, setPeriods] = useState<AcademicPeriodUI[]>([]);

  // UI state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPeriod, setEditingPeriod] = useState<AcademicPeriodUI | null>(
    null,
  );
  const [selectedPeriod, setSelectedPeriod] = useState<AcademicPeriodUI | null>(
    null,
  );

  // ✅ NEW: modal-specific error + saving state
  const [periodModalError, setPeriodModalError] = useState<string>("");
  const [savingPeriod, setSavingPeriod] = useState(false);

  const token = useMemo(() => localStorage.getItem("token"), []);

  const monthNames = [
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

  const selectedTrimister = useMemo(() => {
    if (!selectedTrimisterId) return null;
    return trimesters.find((t) => t.id === selectedTrimisterId) ?? null;
  }, [selectedTrimisterId, trimesters]);

  /** =========================
   * Fetch Trimesters
   * ========================= */
  useEffect(() => {
    const fetchTrimesters = async () => {
      try {
        const res = await api.get<ApiListResponse<TrimisterApi>>("/trimisters", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.status === 1) {
          const list = res.data.data || [];
          setTrimesters(list);

          const active = list.find((t) => t.status === "active") || list[0];
          if (active?.id) {
            setSelectedTrimisterId(active.id);

            const startYear = new Date(`${active.start_date}T00:00:00`).getFullYear();
            setSelectedYear(startYear);
          }
        } else {
          alert(res.data.message || "Failed to load trimesters.");
        }
      } catch (err) {
        console.error(err);
        alert("Error loading trimesters. Check console.");
      }
    };

    fetchTrimesters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** =========================
   * Fetch Periods (filtered by trimester)
   * ========================= */
  useEffect(() => {
    if (!selectedTrimisterId) return;

    const fetchPeriods = async () => {
      try {
        const res = await api.get<ApiListResponse<AcademicPeriodApi>>(
          `/academic-periods?trimister_id=${selectedTrimisterId}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );

        if (res.data.status === 1) {
          setPeriods((res.data.data || []).map(mapPeriodApiToUi));
        } else {
          alert(res.data.message || "Failed to load academic periods.");
        }
      } catch (err) {
        console.error(err);
        alert("Error loading academic periods. Check console.");
      }
    };

    fetchPeriods();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTrimisterId]);

  /** =========================
   * CRUD API functions
   * ✅ UPDATED: return ok + message (no alert)
   * ========================= */

  const createPeriod = async (payload: {
    trimister_id: number;
    name: string;
    type: PeriodType;
    start_date: string;
    end_date: string;
    notes?: string;
  }): Promise<{ ok: boolean; message: string }> => {
    try {
      const res = await api.post<ApiSingleResponse<AcademicPeriodApi>>(
        "/academic-periods",
        payload,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (res.data.status === 1) {
        const saved = mapPeriodApiToUi(res.data.data);
        setPeriods((prev) => [saved, ...prev]);
        return { ok: true, message: "" };
      }

      return { ok: false, message: res.data.message || "Failed to create period." };
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        "Failed to create period. Please check API and try again.";
      return { ok: false, message: msg };
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
    try {
      const res = await api.put<ApiSingleResponse<AcademicPeriodApi>>(
        `/academic-periods/${id}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (res.data.status === 1) {
        const saved = mapPeriodApiToUi(res.data.data);
        setPeriods((prev) => prev.map((p) => (p.id === id ? saved : p)));
        return { ok: true, message: "" };
      }

      return { ok: false, message: res.data.message || "Failed to update period." };
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        "Failed to update period. Please check API and try again.";
      return { ok: false, message: msg };
    }
  };

  const deletePeriodApi = async (id: string) => {
    const res = await api.delete<{ status: number; message: string }>(
      `/academic-periods/${id}`,
      { headers: { Authorization: `Bearer ${token}` } },
    );

    if (res.data.status === 1) {
      setPeriods((prev) => prev.filter((p) => p.id !== id));
      return true;
    } else {
      alert(res.data.message || "Failed to delete period.");
      return false;
    }
  };

  /** =========================
   * Calendar helpers
   * ========================= */

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const isDateInPeriod = (date: Date, period: AcademicPeriodUI) => {
    const dateTime = date.getTime();
    const startTime = new Date(period.startDate).setHours(0, 0, 0, 0);
    const endTime = new Date(period.endDate).setHours(23, 59, 59, 999);
    return dateTime >= startTime && dateTime <= endTime;
  };

  const getPeriodsForDate = (date: Date) => {
    return periods.filter((period) => isDateInPeriod(date, period));
  };

  /** =========================
   * UI handlers
   * ========================= */

  const handleAddPeriod = () => {
    setEditingPeriod(null);
    setPeriodModalError("");
    setIsModalOpen(true);
  };

  const handleEditPeriod = (period: AcademicPeriodUI) => {
    setEditingPeriod(period);
    setPeriodModalError("");
    setIsModalOpen(true);
  };

  const handleDeletePeriod = async (periodId: string) => {
    const ok = await deletePeriodApi(periodId);
    if (ok) setSelectedPeriod(null);
  };

  const renderCalendarMonth = (month: number) => {
    const daysInMonth = getDaysInMonth(selectedYear, month);
    const firstDay = getFirstDayOfMonth(selectedYear, month);
    const days: JSX.Element[] = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="aspect-square" />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(selectedYear, month, day);
      const dayPeriods = getPeriodsForDate(date);
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
            className={`w-full h-full flex items-center justify-center text-xs relative ${
              isToday ? "font-semibold" : ""
            }`}
          >
            <span
              className={`z-10 ${
                dayPeriods.length > 0 ? "text-dark" : "text-body"
              } ${isToday ? "relative" : ""}`}
            >
              {day}
            </span>

            {isToday && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-7 h-7 rounded-full border-2 border-primary-blue" />
              </div>
            )}

            {dayPeriods.length > 0 && (
              <div
                className="absolute inset-0.5 rounded-md transition-all group-hover:scale-105"
                style={{
                  backgroundColor: dayPeriods[0].bgColor,
                  borderWidth: "1px",
                  borderColor: dayPeriods[0].borderColor,
                }}
              />
            )}

            {dayPeriods.length > 1 && (
              <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-primary-blue z-20" />
            )}
          </div>

          {dayPeriods.length > 0 && (
            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-30 shadow-lg">
              {dayPeriods[0].name}
              <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900" />
            </div>
          )}
        </div>,
      );
    }

    return days;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-card-lg p-6 border border-light">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-2xl text-dark font-semibold mb-1">
              Academic Calendar
            </h2>
            <p className="text-sm text-body">
              Manage trimesters, teaching periods, exams, and breaks
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Year Selector */}
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="px-4 py-2.5 border border-light rounded-xl text-sm text-body focus:outline-none focus:ring-2 focus:ring-primary-blue bg-white"
            >
              <option value={2024}>2024</option>
              <option value={2025}>2025</option>
              <option value={2026}>2026</option>
              <option value={2027}>2027</option>
            </select>

            {/* Campus Selector */}
            <select
              value={selectedCampus}
              onChange={(e) => setSelectedCampus(e.target.value)}
              className="px-4 py-2.5 border border-light rounded-xl text-sm text-body focus:outline-none focus:ring-2 focus:ring-primary-blue bg-white"
            >
              <option value="main">Main Campus</option>
              <option value="north">North Campus</option>
              <option value="south">South Campus</option>
            </select>

            {/* Trimester Filter */}
            <select
              value={selectedTrimisterId ?? ""}
              onChange={(e) => {
                const id = Number(e.target.value);
                setSelectedTrimisterId(id);

                const t = trimesters.find((x) => x.id === id);
                if (t) {
                  const startYear = new Date(`${t.start_date}T00:00:00`).getFullYear();
                  setSelectedYear(startYear);
                }
              }}
              className="px-4 py-2.5 border border-light rounded-xl text-sm text-body focus:outline-none focus:ring-2 focus:ring-primary-blue bg-white"
            >
              {trimesters.length === 0 && <option value="">Loading...</option>}
              {trimesters.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.start_date} → {t.end_date})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Trimester meta + Add Period */}
        {selectedTrimister && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-body">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-soft border border-light">
                <Calendar className="w-4 h-4 text-primary-blue" />
                {selectedTrimister.name}: {selectedTrimister.start_date} →{" "}
                {selectedTrimister.end_date}
              </span>

              <span
                className={`inline-flex items-center px-3 py-1 rounded-lg border ${
                  selectedTrimister.status === "active"
                    ? "bg-green-50 text-green-700 border-green-200"
                    : "bg-gray-50 text-gray-600 border-gray-200"
                }`}
              >
                {selectedTrimister.status}
              </span>
            </div>

            <button
              onClick={handleAddPeriod}
              disabled={!selectedTrimisterId}
              className="px-4 py-2.5 bg-primary-blue text-white rounded-xl hover:bg-blue-600 transition-colors flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
              Add Period
            </button>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="bg-white rounded-2xl shadow-card-lg p-6 border border-light">
        <h3 className="text-sm font-semibold text-dark mb-4">
          Academic Period Types
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {periodTypes.map((type) => (
            <div key={type.value} className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded border"
                style={{
                  backgroundColor: type.bgColor,
                  borderColor: type.borderColor,
                }}
              />
              <span className="text-xs text-body">{type.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Sidebar */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl shadow-card-lg p-4 border border-light">
            <h3 className="text-sm font-semibold text-dark mb-4">
              Academic Year
            </h3>

            <div className="space-y-6">
              {trimesters.map((t, index) => (
                <div key={t.id} className="relative">
                  <div className="mb-3">
                    <div className="flex items-center gap-2 mb-1">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          t.id === selectedTrimisterId
                            ? "bg-primary-blue"
                            : "bg-gray-300"
                        }`}
                      />
                      <h4 className="text-sm font-semibold text-dark">
                        {t.name}
                      </h4>
                    </div>
                    <p className="text-xs text-body ml-5">
                      {new Date(`${t.start_date}T00:00:00`).toLocaleDateString(
                        "en-US",
                        { month: "short", day: "numeric" },
                      )}{" "}
                      -{" "}
                      {new Date(`${t.end_date}T00:00:00`).toLocaleDateString(
                        "en-US",
                        { month: "short", day: "numeric" },
                      )}
                    </p>
                  </div>

                  {index < trimesters.length - 1 && (
                    <div className="absolute left-1.5 top-full h-6 w-0.5 bg-light" />
                  )}
                </div>
              ))}

              {trimesters.length === 0 && (
                <p className="text-xs text-body">
                  No trimesters found. Create trimesters first.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Months */}
        <div className="lg:col-span-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {monthNames.map((monthName, monthIndex) => (
              <div
                key={monthIndex}
                className="bg-white rounded-2xl shadow-card-lg border border-light overflow-hidden"
              >
                <div className="bg-soft px-4 py-3 border-b border-light">
                  <h3 className="text-sm font-semibold text-dark">
                    {monthName} {selectedYear}
                  </h3>
                </div>

                <div className="p-4">
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                      (day) => (
                        <div
                          key={day}
                          className="text-center text-xs font-medium text-body py-1"
                        >
                          {day}
                        </div>
                      ),
                    )}
                  </div>

                  <div className="grid grid-cols-7 gap-1">
                    {renderCalendarMonth(monthIndex)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Period Detail Modal */}
      {selectedPeriod && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-card-xl max-w-md w-full">
            <div className="p-6 border-b border-light flex items-center justify-between">
              <h3 className="text-lg font-semibold text-dark">Period Details</h3>
              <button
                onClick={() => setSelectedPeriod(null)}
                className="p-2 hover:bg-soft rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-body" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-medium text-body mb-1 block">
                  Period Name
                </label>
                <p className="text-sm text-dark font-medium">
                  {selectedPeriod.name}
                </p>
              </div>

              <div>
                <label className="text-xs font-medium text-body mb-1 block">
                  Type
                </label>
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded border"
                    style={{
                      backgroundColor: selectedPeriod.bgColor,
                      borderColor: selectedPeriod.borderColor,
                    }}
                  />
                  <span className="text-sm text-dark">
                    {periodTypes.find((t) => t.value === selectedPeriod.type)
                      ?.label ?? selectedPeriod.type}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-body mb-1 block">
                  Date Range
                </label>
                <p className="text-sm text-dark">
                  {selectedPeriod.startDate.toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}{" "}
                  -{" "}
                  {selectedPeriod.endDate.toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>

              {selectedPeriod.notes && (
                <div>
                  <label className="text-xs font-medium text-body mb-1 block">
                    Notes
                  </label>
                  <p className="text-sm text-dark">{selectedPeriod.notes}</p>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-light flex items-center justify-end gap-3">
              <button
                onClick={() => handleDeletePeriod(selectedPeriod.id)}
                className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors flex items-center gap-2 text-sm"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
              <button
                onClick={() => {
                  handleEditPeriod(selectedPeriod);
                  setSelectedPeriod(null);
                }}
                className="px-4 py-2 bg-primary-blue text-white rounded-xl hover:bg-blue-600 transition-colors flex items-center gap-2 text-sm"
              >
                <Edit2 className="w-4 h-4" />
                Edit Period
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Add/Edit Period Modal */}
      {isModalOpen && (
        <AddEditPeriodModal
          trimisterId={selectedTrimisterId}
          period={editingPeriod}
          error={periodModalError}
          saving={savingPeriod}
          onClearError={() => setPeriodModalError("")}
          onClose={() => {
            setIsModalOpen(false);
            setEditingPeriod(null);
            setPeriodModalError("");
          }}
          onSave={async (form) => {
            if (!selectedTrimisterId) {
              setPeriodModalError("Please select a trimester first.");
              return;
            }

            setSavingPeriod(true);
            setPeriodModalError("");

            const payload = {
              trimister_id: selectedTrimisterId,
              name: form.name.trim(),
              type: form.type,
              start_date: form.startDate,
              end_date: form.endDate,
              notes: form.notes?.trim() ? form.notes.trim() : undefined,
            };

            const result = editingPeriod
              ? await updatePeriod(editingPeriod.id, payload)
              : await createPeriod(payload);

            setSavingPeriod(false);

            if (result.ok) {
              setIsModalOpen(false);
              setEditingPeriod(null);
              setPeriodModalError("");
            } else {
              setPeriodModalError(result.message); // ✅ overlap shows here
            }
          }}
        />
      )}
    </div>
  );
}

/** =========================
 * Add/Edit Period Modal Component
 * ========================= */

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
    startDate: string; // YYYY-MM-DD
    endDate: string; // YYYY-MM-DD
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

    if (!trimisterId) {
      onClearError?.();
      return;
    }

    if (!formData.name.trim()) {
      onClearError?.();
      return;
    }

    if (!formData.startDate || !formData.endDate) {
      onClearError?.();
      return;
    }

    onSave({
      name: formData.name,
      type: formData.type,
      startDate: formData.startDate,
      endDate: formData.endDate,
      notes: formData.notes,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-card-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-light flex items-center justify-between sticky top-0 bg-white">
          <h3 className="text-lg font-semibold text-dark">
            {period ? "Edit Period" : "Add New Period"}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-soft rounded-lg transition-colors"
            disabled={!!saving}
          >
            <X className="w-5 h-5 text-body" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* ✅ Error box */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">
              {error}
            </div>
          )}

          {/* Period Name */}
          <div>
            <label className="text-sm font-medium text-dark mb-2 block">
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
              placeholder="e.g., Trimester 1 - Teaching Weeks"
              className="w-full px-4 py-2.5 border border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue"
            />
          </div>

          {/* Period Type */}
          <div>
            <label className="text-sm font-medium text-dark mb-2 block">
              Period Type <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={formData.type}
              onChange={(e) => {
                clearErr();
                setFormData({ ...formData, type: e.target.value as PeriodType });
              }}
              className="w-full px-4 py-2.5 border border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue"
            >
              {periodTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-dark mb-2 block">
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
                className="w-full px-4 py-2.5 border border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-dark mb-2 block">
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
                className="w-full px-4 py-2.5 border border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue"
              />
            </div>
          </div>

          {/* Color Preview */}
          <div>
            <label className="text-sm font-medium text-dark mb-2 block">
              Color Preview
            </label>
            <div className="flex items-center gap-3 p-4 rounded-xl border border-light">
              <div
                className="w-12 h-12 rounded-lg border-2"
                style={{
                  backgroundColor: periodTypes.find(
                    (t) => t.value === formData.type,
                  )?.bgColor,
                  borderColor: periodTypes.find(
                    (t) => t.value === formData.type,
                  )?.borderColor,
                }}
              />
              <div>
                <p className="text-sm font-medium text-dark">
                  {periodTypes.find((t) => t.value === formData.type)?.label}
                </p>
                <p className="text-xs text-body">
                  This color will be used in the calendar
                </p>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-sm font-medium text-dark mb-2 block">
              Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => {
                clearErr();
                setFormData({ ...formData, notes: e.target.value });
              }}
              placeholder="Add any additional information..."
              rows={3}
              className="w-full px-4 py-2.5 border border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-light">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-body hover:bg-soft rounded-xl transition-colors disabled:opacity-50"
              disabled={!!saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-primary-blue text-white rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-50"
              disabled={!trimisterId || !!saving}
            >
              {saving ? "Saving..." : period ? "Update Period" : "Save Period"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
