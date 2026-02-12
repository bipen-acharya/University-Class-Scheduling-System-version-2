import { Layers, Plus, X, Edit, Trash2, Eye } from "lucide-react";
import api from "../../api/axios";
import { useEffect, useMemo, useState } from "react";

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

export default function Trimesters() {
  const [trimesters, setTrimesters] = useState<Trimester[]>([]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [selectedTrimester, setSelectedTrimester] = useState<Trimester | null>(
    null
  );
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [breakStartDate, setBreakStartDate] = useState<string>("");
  const [breakEndDate, setBreakEndDate] = useState<string>("");
  const [status, setStatus] = useState<TrimesterStatus>("active");

  const token = useMemo(() => localStorage.getItem("token"), []);

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
    from && to ? `${from} → ${to}` : "-";

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
      if (breakStartDate < startDate)
        return "Break start date must be after or equal to start date.";
      if (breakEndDate < breakStartDate)
        return "Break end date must be after or equal to break start date.";
      if (breakEndDate > endDate)
        return "Break end date must be before or equal to end date.";
    }

    return null;
  };

  // ✅ Fetch all trimesters
  useEffect(() => {
    const fetchTrimesters = async () => {
      try {
        const res = await api.get<TrimesterListResponse>("/trimisters", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.status === 1) {
          setTrimesters((res.data.data || []).map(mapToUi));
        } else {
          alert("Failed to fetch trimesters: " + res.data.message);
        }
      } catch (error) {
        console.error("Error fetching trimesters:", error);
        alert("Error fetching trimesters. Check console for details.");
      }
    };

    fetchTrimesters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ Create / Update
  const handleSaveTrimester = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateDates();
    if (validationError) return alert(validationError);

    const payload = {
      name: name.trim(),
      start_date: startDate,
      end_date: endDate,
      break_start_date: breakStartDate ? breakStartDate : null,
      break_end_date: breakEndDate ? breakEndDate : null,
      status,
    };

    try {
      const res = isEditMode
        ? await api.put<TrimesterSingleResponse>(
            `/trimisters/${editId}`,
            payload,
            { headers: { Authorization: `Bearer ${token}` } }
          )
        : await api.post<TrimesterSingleResponse>("/trimisters", payload, {
            headers: { Authorization: `Bearer ${token}` },
          });

      if (res.data.status === 1) {
        const saved = mapToUi(res.data.data);

        setTrimesters((prev) => {
          // if update => replace, else add on top
          const exists = prev.some((x) => x.id === saved.id);
          if (exists) return prev.map((x) => (x.id === saved.id ? saved : x));
          return [saved, ...prev];
        });

        closeAddModal();
        alert(isEditMode ? "Trimester updated successfully!" : "Trimester added successfully!");
      } else {
        alert(res.data.message);
      }
    } catch (error) {
      console.error("Error saving trimester:", error);
      alert("Error saving trimester. Check console.");
    }
  };

  const handleEditTrimester = async (t: Trimester) => {
    try {
      const res = await api.get<TrimesterSingleResponse>(`/trimisters/${t.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.status === 1) {
        const data = res.data.data;
        setName(data.name || "");
        setStartDate(data.start_date || "");
        setEndDate(data.end_date || "");
        setBreakStartDate(data.break_start_date ?? "");
        setBreakEndDate(data.break_end_date ?? "");
        setStatus((data.status || "inactive") as TrimesterStatus);

        setEditId(String(data.id));
        setIsEditMode(true);
        setShowAddModal(true);
      } else {
        alert("Failed to load trimester for edit.");
      }
    } catch (error) {
      console.error("Error loading trimester:", error);
      // fallback: use row data if single GET is not available
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

  // ✅ Delete
  const handleDeleteClick = (id: string) => {
    setDeleteTarget(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      const res = await api.delete<{ status: number; message: string }>(
        `/trimisters/${deleteTarget}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.status === 1) {
        setTrimesters((prev) => prev.filter((t) => t.id !== deleteTarget));
        alert(res.data.message);
      } else {
        alert("Failed to delete trimester.");
      }
    } catch (error) {
      console.error("Error deleting trimester:", error);
      alert("Error deleting trimester. Check console for details.");
    } finally {
      setShowDeleteConfirm(false);
      setDeleteTarget(null);
    }
  };

  // Stats
  const totalCount = trimesters.length;
  const activeCount = trimesters.filter((t) => t.status === "active").length;
  const withBreakCount = trimesters.filter(
    (t) => t.break_start_date && t.break_end_date
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
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary-blue text-white rounded-xl hover:opacity-90 transition-opacity shadow-md"
        >
          <Plus className="w-4 h-4" />
          Add Trimester
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-card border border-light overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-soft sticky top-0">
              <tr>
                <th className="px-6 py-3 text-left text-body">Trimester</th>
                <th className="px-6 py-3 text-left text-body">Dates</th>
                <th className="px-6 py-3 text-left text-body">Break</th>
                <th className="px-6 py-3 text-left text-body">Status</th>
                <th className="px-6 py-3 text-left text-body">Actions</th>
              </tr>
            </thead>

            <tbody>
              {trimesters.map((t, index) => (
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
                      <span className="text-dark">{t.name}</span>
                    </div>
                  </td>

                  <td className="px-6 py-4 text-body">
                    {formatRange(t.start_date, t.end_date)}
                  </td>

                  <td className="px-6 py-4 text-body">
                    {t.break_start_date && t.break_end_date
                      ? formatRange(t.break_start_date, t.break_end_date)
                      : "-"}
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${
                        t.status === "active"
                          ? "bg-green-50 text-green-600"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {t.status}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewTrimester(t)}
                        className="p-1.5 text-primary-blue hover:bg-blue-50 rounded transition-colors"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleEditTrimester(t)}
                        className="p-1.5 text-sky-blue hover:bg-blue-50 rounded transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDeleteClick(t.id)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {trimesters.length === 0 && (
          <div className="p-12 text-center">
            <Layers className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-body">
              No trimesters found. Add your first trimester to get started.
            </p>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-card p-6 border border-light">
          <p className="text-sm text-body mb-2">Total Trimesters</p>
          <p className="text-3xl text-primary-blue">{totalCount}</p>
        </div>

        <div className="bg-white rounded-lg shadow-card p-6 border border-light">
          <p className="text-sm text-body mb-2">Active Trimesters</p>
          <p className="text-3xl text-green-600">{activeCount}</p>
        </div>

        <div className="bg-white rounded-lg shadow-card p-6 border border-light">
          <p className="text-sm text-body mb-2">With Break</p>
          <p className="text-3xl text-blue-600">{withBreakCount}</p>
        </div>

        <div className="bg-white rounded-lg shadow-card p-6 border border-light">
          <p className="text-sm text-body mb-2">No Break</p>
          <p className="text-3xl text-purple-600">{noBreakCount}</p>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
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
                  className="p-2 hover:bg-soft rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-body" />
                </button>
              </div>

              <form onSubmit={handleSaveTrimester} className="p-6 space-y-6">
                <div>
                  <label className="block text-sm text-body mb-2">
                    Trimester Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent"
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent"
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent"
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent"
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                  >
                    <option value="active">active</option>
                    <option value="inactive">inactive</option>
                  </select>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-primary-blue text-white rounded-xl hover:opacity-90 transition-opacity shadow-sm"
                  >
                    {isEditMode ? "Update Trimester" : "Save Trimester"}
                  </button>
                  <button
                    type="button"
                    onClick={closeAddModal}
                    className="flex-1 py-3 bg-gray-100 text-body rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                </div>

                <p className="text-xs text-body/70">
                  Note: If you enter break dates, both start and end are required.
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
                  className="p-2 hover:bg-soft rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-body" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="flex items-center gap-4 pb-4 border-b border-light">
                  <div className="w-16 h-16 rounded-full bg-primary-blue/10 flex items-center justify-center">
                    <Layers className="w-8 h-8 text-primary-blue" />
                  </div>
                  <div>
                    <h3 className="text-dark text-lg">{selectedTrimester.name}</h3>
                    <p className="text-body text-sm">Academic Trimester</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm text-body mb-1 block">Dates</label>
                  <p className="text-dark">
                    {formatRange(selectedTrimester.start_date, selectedTrimester.end_date)}
                  </p>
                </div>

                <div>
                  <label className="text-sm text-body mb-1 block">Break</label>
                  <p className="text-dark">
                    {selectedTrimester.break_start_date && selectedTrimester.break_end_date
                      ? formatRange(
                          selectedTrimester.break_start_date,
                          selectedTrimester.break_end_date
                        )
                      : "-"}
                  </p>
                </div>

                <div>
                  <label className="text-sm text-body mb-1 block">Status</label>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm ${
                      selectedTrimester.status === "active"
                        ? "bg-green-50 text-green-600"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {selectedTrimester.status}
                  </span>
                </div>

                <div className="pt-4 border-t border-light">
                  <button
                    onClick={() => setShowViewModal(false)}
                    className="w-full py-3 bg-primary-blue text-white rounded-xl hover:opacity-90 transition-opacity"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <>
          <div
            className="fixed inset-0 bg-white/40 backdrop-blur-sm z-50"
            onClick={() => setShowDeleteConfirm(false)}
          />

          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full shadow-2xl">
              <div className="p-6">
                <h3 className="text-dark mb-2">Confirm Deletion</h3>
                <p className="text-body mb-6">
                  Are you sure you want to delete this trimester? This action
                  cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={confirmDelete}
                    className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
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
