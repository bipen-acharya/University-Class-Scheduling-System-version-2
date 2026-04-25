import {
  Layers,
  Plus,
  X,
  Edit,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import api from "../../api/axios";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { getCurrentUserRole, type SafeUserRole } from "../../utils/auth";

type TrimesterStatus = "active" | "inactive";

interface TrimesterApi {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  break_start_date: string | null;
  break_end_date: string | null;
  status: TrimesterStatus;
  created_at: string;
  updated_at: string;
}

interface Trimester {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  break_start_date: string | null;
  break_end_date: string | null;
  status: TrimesterStatus;
  created_at?: string;
  updated_at?: string;
}

interface TrimesterListResponse {
  data: TrimesterApi[];
  count: number;
  pagination: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
    from: number;
    to: number;
    path: string;
    links: { prev: string | null; next: string | null };
  };
  message: string;
  status: number;
}

interface TrimesterSingleResponse {
  data: TrimesterApi;
  message: string;
  status: number;
}

const PAGE_SIZE = 10;

/** ── Skeleton row ── */
function SkeletonRow() {
  return (
    <tr className="border-t border-light">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse flex-shrink-0" />
          <div className="h-4 w-36 rounded bg-gray-200 animate-pulse" />
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 w-40 rounded bg-gray-200 animate-pulse" />
      </td>
      <td className="px-6 py-4">
        <div className="h-4 w-32 rounded bg-gray-200 animate-pulse" />
      </td>
      <td className="px-6 py-4">
        <div className="h-6 w-16 rounded-full bg-gray-200 animate-pulse" />
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gray-200 animate-pulse" />
          <div className="w-7 h-7 rounded-lg bg-gray-200 animate-pulse" />
          <div className="w-7 h-7 rounded-lg bg-gray-200 animate-pulse" />
        </div>
      </td>
    </tr>
  );
}

export default function Trimesters() {
  const [trimesters, setTrimesters] = useState<Trimester[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const [currentUserRole, setCurrentUserRole] =
    useState<SafeUserRole>("Unknown");
  const [meLoading, setMeLoading] = useState(true);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [selectedTrimester, setSelectedTrimester] = useState<Trimester | null>(
    null,
  );
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);

  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [breakStartDate, setBreakStartDate] = useState<string>("");
  const [breakEndDate, setBreakEndDate] = useState<string>("");
  const [status, setStatus] = useState<TrimesterStatus>("active");

  const token = useMemo(() => localStorage.getItem("token"), []);

  const canCreate =
    currentUserRole === "SuperAdmin" || currentUserRole === "Admin";
  const canEdit = canCreate;
  const canDelete = canCreate;

  // ── Pagination ─────────────────────────────────────────────────────────────
  const totalItems = trimesters.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);

  const paginatedTrimesters = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return trimesters.slice(start, start + PAGE_SIZE);
  }, [trimesters, safePage]);

  const fromItem = totalItems === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const toItem = Math.min(safePage * PAGE_SIZE, totalItems);

  const pageNumbers = useMemo(() => {
    const pages: number[] = [];
    for (
      let i = Math.max(1, safePage - 2);
      i <= Math.min(totalPages, safePage + 2);
      i++
    ) {
      pages.push(i);
    }
    return pages;
  }, [safePage, totalPages]);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const mapToUi = (t: TrimesterApi): Trimester => ({
    id: String(t.id),
    name: t.name,
    start_date: t.start_date,
    end_date: t.end_date,
    break_start_date: t.break_start_date ?? null,
    break_end_date: t.break_end_date ?? null,
    status: t.status,
    created_at: t.created_at,
    updated_at: t.updated_at,
  });

  const resetForm = () => {
    setName("");
    setStartDate("");
    setEndDate("");
    setBreakStartDate("");
    setBreakEndDate("");
    setStatus("active");
  };

  const openAddModal = () => {
    if (!canCreate) {
      toast.error("You do not have permission to add trimester");
      return;
    }

    setIsEditMode(false);
    setEditId(null);
    resetForm();
    setShowAddModal(true);
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    setIsEditMode(false);
    setEditId(null);
    resetForm();
  };

  const formatRange = (from: string, to: string) =>
    from && to ? `${from} → ${to}` : "—";

  const validateDates = () => {
    if (!name.trim()) return "Name is required.";
    if (!startDate) return "Start date is required.";
    if (!endDate) return "End date is required.";
    if (endDate < startDate)
      return "End date must be after or equal to start date.";

    const hasBreakStart = !!breakStartDate;
    const hasBreakEnd = !!breakEndDate;

    if (hasBreakStart !== hasBreakEnd) {
      return "Please provide both break start date and break end date.";
    }

    if (hasBreakStart && hasBreakEnd) {
      if (breakStartDate < startDate) {
        return "Break start date must be after or equal to start date.";
      }
      if (breakEndDate < breakStartDate) {
        return "Break end date must be after or equal to break start date.";
      }
      if (breakEndDate > endDate) {
        return "Break end date must be before or equal to end date.";
      }
    }

    return null;
  };

  // ── Fetch auth user role ───────────────────────────────────────────────────
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
        setLoading(true);
        const res = await api.get<TrimesterListResponse>("/trimisters", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.status === 1) {
          setTrimesters((res.data.data || []).map(mapToUi));
          setCurrentPage(1);
        } else {
          toast.error(res.data.message || "Failed to fetch trimesters.");
        }
      } catch {
        toast.error("Error fetching trimesters. Check console for details.");
      } finally {
        setLoading(false);
      }
    };

    fetchTrimesters();
  }, [token]);

  // ── Save ───────────────────────────────────────────────────────────────────
  const handleSaveTrimester = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!canCreate) {
      toast.error("You do not have permission to save trimester");
      return;
    }

    const validationError = validateDates();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    const payload = {
      name: name.trim(),
      start_date: startDate,
      end_date: endDate,
      break_start_date: breakStartDate || null,
      break_end_date: breakEndDate || null,
      status,
    };

    try {
      setSaving(true);

      const res = isEditMode
        ? await api.put<TrimesterSingleResponse>(
            `/trimisters/${editId}`,
            payload,
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          )
        : await api.post<TrimesterSingleResponse>("/trimisters", payload, {
            headers: { Authorization: `Bearer ${token}` },
          });

      if (res.data.status === 1) {
        const saved = mapToUi(res.data.data);

        setTrimesters((prev) => {
          const exists = prev.some((x) => x.id === saved.id);
          if (exists) return prev.map((x) => (x.id === saved.id ? saved : x));
          return [saved, ...prev];
        });

        if (!isEditMode) setCurrentPage(1);

        closeAddModal();
        toast.success(
          isEditMode
            ? "Trimester updated successfully!"
            : "Trimester added successfully!",
        );
      } else {
        toast.error(res.data.message || "Failed to save trimester.");
      }
    } catch {
      toast.error("Error saving trimester. Check console.");
    } finally {
      setSaving(false);
    }
  };

  // ── Edit ───────────────────────────────────────────────────────────────────
  const handleEditTrimester = async (t: Trimester) => {
    if (!canEdit) {
      toast.error("You do not have permission to edit trimester");
      return;
    }

    try {
      const res = await api.get<TrimesterSingleResponse>(
        `/trimisters/${t.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (res.data.status === 1) {
        const d = res.data.data;
        setName(d.name || "");
        setStartDate(d.start_date || "");
        setEndDate(d.end_date || "");
        setBreakStartDate(d.break_start_date ?? "");
        setBreakEndDate(d.break_end_date ?? "");
        setStatus((d.status || "inactive") as TrimesterStatus);
        setEditId(String(d.id));
        setIsEditMode(true);
        setShowAddModal(true);
      } else {
        toast.error("Failed to load trimester for edit.");
      }
    } catch {
      setName(t.name);
      setStartDate(t.start_date);
      setEndDate(t.end_date);
      setBreakStartDate(t.break_start_date ?? "");
      setBreakEndDate(t.break_end_date ?? "");
      setStatus(t.status);
      setEditId(t.id);
      setIsEditMode(true);
      setShowAddModal(true);
    }
  };

  const handleViewTrimester = (t: Trimester) => {
    setSelectedTrimester(t);
    setShowViewModal(true);
  };

  const handleDeleteClick = (id: string) => {
    if (!canDelete) {
      toast.error("You do not have permission to delete trimester");
      return;
    }

    setDeleteTarget(id);
    setShowDeleteConfirm(true);
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const confirmDelete = async () => {
    if (!deleteTarget) return;

    if (!canDelete) {
      toast.error("You do not have permission to delete trimester");
      return;
    }

    try {
      setDeleting(true);

      const res = await api.delete<{ status: number; message: string }>(
        `/trimisters/${deleteTarget}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (res.data.status === 1) {
        setTrimesters((prev) => {
          const updated = prev.filter((t) => t.id !== deleteTarget);
          const newLast = Math.max(1, Math.ceil(updated.length / PAGE_SIZE));
          if (safePage > newLast) setCurrentPage(newLast);
          return updated;
        });

        toast.success(res.data.message || "Trimester deleted.");
      } else {
        toast.error("Failed to delete trimester.");
      }
    } catch {
      toast.error("Error deleting trimester.");
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
      setDeleteTarget(null);
    }
  };

  // ── Stats ──────────────────────────────────────────────────────────────────
  const totalCount = trimesters.length;
  const activeCount = trimesters.filter((t) => t.status === "active").length;
  const withBreakCount = trimesters.filter(
    (t) => t.break_start_date && t.break_end_date,
  ).length;
  const noBreakCount = totalCount - withBreakCount;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-primary-blue mb-2">Trimesters</h1>
          <p className="text-body">
            Manage academic trimesters with dates, breaks, and status
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Current role: {meLoading ? "Loading..." : currentUserRole}
          </p>
        </div>

        {!meLoading && canCreate && (
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary-blue text-white rounded-xl hover:opacity-90 active:scale-[0.97] active:opacity-80 transition-all duration-150 shadow-md select-none cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Trimester
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-card border border-light overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-soft sticky top-0">
              <tr>
                {["Trimester", "Dates", "Break", "Status", "Actions"].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-6 py-3 text-left text-body font-medium"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>

            <tbody>
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <SkeletonRow key={i} />
                  ))
                : paginatedTrimesters.map((t, index) => (
                    <tr
                      key={t.id}
                      className={`border-t border-light hover:bg-soft transition-colors ${
                        index % 2 === 0 ? "bg-white" : "bg-[#FAFAFA]"
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary-blue/10 flex items-center justify-center">
                            <Layers className="w-5 h-5 text-primary-blue" />
                          </div>
                          <span className="text-dark font-medium">
                            {t.name}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-body text-sm">
                        {formatRange(t.start_date, t.end_date)}
                      </td>

                      <td className="px-6 py-4 text-body text-sm">
                        {t.break_start_date && t.break_end_date
                          ? formatRange(t.break_start_date, t.break_end_date)
                          : "—"}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            t.status === "active"
                              ? "bg-green-50 text-green-600"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {t.status.charAt(0).toUpperCase() + t.status.slice(1)}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleViewTrimester(t)}
                            title="View"
                            className="p-1.5 text-primary-blue hover:bg-blue-50 active:bg-blue-100 active:scale-95 rounded-lg transition-all duration-100 cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {canEdit && (
                            <button
                              onClick={() => handleEditTrimester(t)}
                              title="Edit"
                              className="p-1.5 text-sky-blue hover:bg-blue-50 active:bg-blue-100 active:scale-95 rounded-lg transition-all duration-100 cursor-pointer"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          )}

                          {canDelete && (
                            <button
                              onClick={() => handleDeleteClick(t.id)}
                              title="Delete"
                              className="p-1.5 text-red-500 hover:bg-red-50 active:bg-red-100 active:scale-95 rounded-lg transition-all duration-100 cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>

        {/* Empty state */}
        {!loading && trimesters.length === 0 && (
          <div className="p-12 text-center">
            <Layers className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-body">
              No trimesters found.{" "}
              {canCreate ? "Add your first trimester to get started." : ""}
            </p>
          </div>
        )}

        {/* Pagination */}
        {!loading && totalItems > 0 && (
          <div className="border-t border-light px-6 py-3 flex items-center justify-between flex-wrap gap-3">
            <p className="text-sm text-body">
              Showing{" "}
              <span className="font-medium text-dark">
                {fromItem}–{toItem}
              </span>{" "}
              of <span className="font-medium text-dark">{totalItems}</span>{" "}
              trimesters
            </p>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={safePage === 1}
                className="p-1.5 rounded-lg border border-light text-body hover:bg-soft active:bg-soft/80 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {pageNumbers[0] > 1 && (
                <>
                  <button
                    onClick={() => setCurrentPage(1)}
                    className="w-8 h-8 rounded-lg border border-light text-sm text-body hover:bg-soft cursor-pointer"
                  >
                    1
                  </button>
                  {pageNumbers[0] > 2 && (
                    <span className="px-1 text-body text-sm">…</span>
                  )}
                </>
              )}

              {pageNumbers.map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded-lg border text-sm transition-colors cursor-pointer ${
                    page === safePage
                      ? "bg-primary-blue text-white border-primary-blue font-medium"
                      : "border-light text-body hover:bg-soft"
                  }`}
                >
                  {page}
                </button>
              ))}

              {pageNumbers[pageNumbers.length - 1] < totalPages && (
                <>
                  {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
                    <span className="px-1 text-body text-sm">…</span>
                  )}
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    className="w-8 h-8 rounded-lg border border-light text-sm text-body hover:bg-soft cursor-pointer"
                  >
                    {totalPages}
                  </button>
                </>
              )}

              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={safePage === totalPages}
                className="p-1.5 rounded-lg border border-light text-body hover:bg-soft active:bg-soft/80 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          {
            label: "Total Trimesters",
            value: totalCount,
            color: "text-primary-blue",
          },
          {
            label: "Active Trimesters",
            value: activeCount,
            color: "text-green-600",
          },
          {
            label: "With Break",
            value: withBreakCount,
            color: "text-blue-600",
          },
          { label: "No Break", value: noBreakCount, color: "text-purple-600" },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className="bg-white rounded-lg shadow-card p-6 border border-light"
          >
            <p className="text-sm text-body mb-2">{label}</p>
            {loading ? (
              <div className="h-9 w-12 rounded bg-gray-200 animate-pulse mt-1" />
            ) : (
              <p className={`text-3xl font-bold ${color}`}>{value}</p>
            )}
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && canCreate && (
        <>
          <div
            className="fixed inset-0 bg-white/40 backdrop-blur-sm z-50"
            onClick={closeAddModal}
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-lg w-full shadow-2xl">
              <div className="border-b border-light px-6 py-4 flex items-center justify-between">
                <h2 className="text-primary-blue">
                  {isEditMode ? "Edit Trimester" : "Add New Trimester"}
                </h2>
                <button
                  onClick={closeAddModal}
                  className="p-2 hover:bg-soft active:bg-soft/80 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5 text-body" />
                </button>
              </div>

              <form onSubmit={handleSaveTrimester} className="p-6 space-y-5">
                <div>
                  <label className="block text-sm text-body mb-2">
                    Trimester Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-shadow"
                    placeholder="e.g., Trimester 1 - 2025"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-body mb-2">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-shadow"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-body mb-2">
                      End Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-shadow"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-body mb-2">
                      Break Start Date (optional)
                    </label>
                    <input
                      type="date"
                      value={breakStartDate}
                      onChange={(e) => setBreakStartDate(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-shadow"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-body mb-2">
                      Break End Date (optional)
                    </label>
                    <input
                      type="date"
                      value={breakEndDate}
                      onChange={(e) => setBreakEndDate(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-shadow"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-body mb-2">Status</label>
                  <select
                    value={status}
                    onChange={(e) =>
                      setStatus(e.target.value as TrimesterStatus)
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-shadow cursor-pointer"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div className="flex gap-4 pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 py-3 bg-primary-blue text-white rounded-xl hover:opacity-90 active:opacity-80 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-150 font-medium shadow-sm cursor-pointer"
                  >
                    {saving ? (
                      <span className="inline-flex items-center gap-2 justify-center">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving…
                      </span>
                    ) : isEditMode ? (
                      "Update Trimester"
                    ) : (
                      "Save Trimester"
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={closeAddModal}
                    className="flex-1 py-3 bg-gray-100 text-body rounded-xl hover:bg-gray-200 active:bg-gray-300 active:scale-[0.98] transition-all duration-150 font-medium cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>

                <p className="text-xs text-body/70">
                  Note: If you enter break dates, both start and end are
                  required.
                </p>
              </form>
            </div>
          </div>
        </>
      )}

      {/* View Modal */}
      {showViewModal && selectedTrimester && (
        <>
          <div
            className="fixed inset-0 bg-white/40 backdrop-blur-sm z-50"
            onClick={() => setShowViewModal(false)}
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-lg w-full shadow-2xl">
              <div className="border-b border-light px-6 py-4 flex items-center justify-between">
                <h2 className="text-primary-blue">Trimester Details</h2>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="p-2 hover:bg-soft rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5 text-body" />
                </button>
              </div>

              <div className="p-6 space-y-5">
                <div className="flex items-center gap-4 pb-4 border-b border-light">
                  <div className="w-14 h-14 rounded-full bg-primary-blue/10 flex items-center justify-center">
                    <Layers className="w-7 h-7 text-primary-blue" />
                  </div>
                  <div>
                    <h3 className="text-dark font-semibold text-lg">
                      {selectedTrimester.name}
                    </h3>
                    <p className="text-body text-sm">Academic Trimester</p>
                  </div>
                </div>

                <div className="grid gap-4">
                  {[
                    {
                      label: "Dates",
                      value: formatRange(
                        selectedTrimester.start_date,
                        selectedTrimester.end_date,
                      ),
                    },
                    {
                      label: "Break",
                      value:
                        selectedTrimester.break_start_date &&
                        selectedTrimester.break_end_date
                          ? formatRange(
                              selectedTrimester.break_start_date,
                              selectedTrimester.break_end_date,
                            )
                          : "—",
                    },
                  ].map(({ label, value }) => (
                    <div
                      key={label}
                      className="p-4 bg-soft rounded-lg border border-light"
                    >
                      <p className="text-xs text-body mb-1">{label}</p>
                      <p className="text-dark text-sm">{value}</p>
                    </div>
                  ))}

                  <div className="p-4 bg-soft rounded-lg border border-light">
                    <p className="text-xs text-body mb-1">Status</p>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                        selectedTrimester.status === "active"
                          ? "bg-green-50 text-green-600"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {selectedTrimester.status}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setShowViewModal(false)}
                  className="w-full py-3 bg-primary-blue text-white rounded-xl hover:opacity-90 active:opacity-80 active:scale-[0.98] transition-all duration-150 font-medium cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && canDelete && (
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
                  Confirm Deletion
                </h3>
                <p className="text-body text-sm text-center mb-6">
                  Are you sure you want to delete this trimester? This action
                  cannot be undone.
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={confirmDelete}
                    disabled={deleting}
                    className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 active:bg-red-700 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-150 font-medium cursor-pointer"
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
                    className="flex-1 px-4 py-3 bg-gray-100 text-body rounded-xl hover:bg-gray-200 active:bg-gray-300 active:scale-[0.98] transition-all duration-150 font-medium cursor-pointer"
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
