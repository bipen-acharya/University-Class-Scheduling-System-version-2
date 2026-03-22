import { GraduationCap, Plus, X, Edit, Trash2, Eye, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import api from "../../api/axios";
import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import {
  ProgramData,
  ProgramResponse,
  ProgramListResponse,
} from "../../types/program";

interface Program {
  id: string;
  name: string;
  level: "Bachelor" | "Master" | "PhD" | "Other";
  status: "Active" | "Inactive";
}

const PAGE_SIZE = 10;

const levels = ["Bachelor", "Master", "PhD", "Other"] as const;

/** ── Skeleton row ── */
function SkeletonRow() {
  return (
    <tr className="border-t border-light">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
          <div className="h-4 w-40 rounded bg-gray-200 animate-pulse" />
        </div>
      </td>
      <td className="px-6 py-4"><div className="h-6 w-20 rounded-full bg-gray-200 animate-pulse" /></td>
      <td className="px-6 py-4"><div className="h-6 w-16 rounded-full bg-gray-200 animate-pulse" /></td>
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

export default function Programs() {
  const [programs, setPrograms]       = useState<Program[]>([]);
  const [loading, setLoading]         = useState(true);
  const [saving, setSaving]           = useState(false);
  const [deleting, setDeleting]       = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const [showAddModal,      setShowAddModal]      = useState(false);
  const [showViewModal,     setShowViewModal]      = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedProgram,   setSelectedProgram]   = useState<Program | null>(null);
  const [deleteTarget,      setDeleteTarget]      = useState<string | null>(null);
  const [isEditMode,        setIsEditMode]        = useState(false);
  const [editId,            setEditId]            = useState<string | null>(null);

  // Form state
  const [programName,   setProgramName]   = useState("");
  const [programLevel,  setProgramLevel]  = useState<Program["level"]>("Bachelor");
  const [programStatus, setProgramStatus] = useState<Program["status"]>("Active");

  const token = () => localStorage.getItem("token");

  // ── Pagination ─────────────────────────────────────────────────────────────
  const totalItems = programs.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const safePage   = Math.min(currentPage, totalPages);

  const paginatedPrograms = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return programs.slice(start, start + PAGE_SIZE);
  }, [programs, safePage]);

  const fromItem = totalItems === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const toItem   = Math.min(safePage * PAGE_SIZE, totalItems);

  const pageNumbers = useMemo(() => {
    const range: number[] = [];
    const left  = Math.max(1, safePage - 2);
    const right = Math.min(totalPages, safePage + 2);
    for (let i = left; i <= right; i++) range.push(i);
    return range;
  }, [safePage, totalPages]);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        setLoading(true);
        const res = await api.get<ProgramListResponse>("/programms", {
          headers: { Authorization: `Bearer ${token()}` },
        });
        if (res.data.status === 1) {
          setPrograms(
            res.data.data.map((p: ProgramData) => ({
              id: p.id.toString(),
              name: p.program_name,
              level: (p.level || "Other") as Program["level"],
              status: p.status,
            }))
          );
          setCurrentPage(1);
        } else {
          toast.error("Failed to fetch programs: " + res.data.message);
        }
      } catch {
        toast.error("Error fetching programs. Check console for details.");
      } finally {
        setLoading(false);
      }
    };
    fetchPrograms();
  }, []);

  // ── Save (add / edit) ──────────────────────────────────────────────────────
  const handleAddProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { program_name: programName, level: programLevel, status: programStatus };

    try {
      setSaving(true);
      const res = isEditMode
        ? await api.put<ProgramResponse>(`/programms/${editId}`, payload, { headers: { Authorization: `Bearer ${token()}` } })
        : await api.post<ProgramResponse>("/programms", payload, { headers: { Authorization: `Bearer ${token()}` } });

      if (res.data.status === 1) {
        const p = res.data.data;
        const mapped: Program = {
          id: p.id.toString(),
          name: p.program_name,
          level: (p.level || "Other") as Program["level"],
          status: p.status,
        };
        setPrograms((prev) =>
          isEditMode ? prev.map((pr) => (pr.id === mapped.id ? mapped : pr)) : [mapped, ...prev]
        );
        if (!isEditMode) setCurrentPage(1);
        closeModal();
        toast.success(isEditMode ? "Program updated successfully!" : "Program added successfully!");
      } else {
        toast.error(res.data.message || "Failed to save program.");
      }
    } catch {
      toast.error("Error saving program. Check console.");
    } finally {
      setSaving(false);
    }
  };

  // ── Edit (load) ────────────────────────────────────────────────────────────
  const handleEditProgram = async (program: Program) => {
    try {
      const res = await api.get<{ status: number; message: string; data: ProgramData }>(
        `/programms/${program.id}`,
        { headers: { Authorization: `Bearer ${token()}` } }
      );
      if (res.data.status === 1) {
        const p = res.data.data;
        setProgramName(p.program_name);
        setProgramLevel((p.level || "Other") as Program["level"]);
        setProgramStatus(p.status);
        setEditId(p.id.toString());
        setIsEditMode(true);
        setShowAddModal(true);
      } else {
        toast.error("Failed to load program for edit.");
      }
    } catch {
      toast.error("Error loading program. Check console.");
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      const res = await api.delete<{ status: number; message: string }>(
        `/programms/${deleteTarget}`,
        { headers: { Authorization: `Bearer ${token()}` } }
      );
      if (res.data.status === 1) {
        setPrograms((prev) => {
          const updated = prev.filter((p) => p.id !== deleteTarget);
          const newLast = Math.max(1, Math.ceil(updated.length / PAGE_SIZE));
          if (safePage > newLast) setCurrentPage(newLast);
          return updated;
        });
        toast.success(res.data.message || "Program deleted.");
      } else {
        toast.error("Failed to delete program.");
      }
    } catch {
      toast.error("Error deleting program. Check console for details.");
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
      setDeleteTarget(null);
    }
  };

  // ── Helpers ────────────────────────────────────────────────────────────────
  const resetForm = () => { setProgramName(""); setProgramLevel("Bachelor"); setProgramStatus("Active"); };
  const closeModal = () => { setShowAddModal(false); setIsEditMode(false); setEditId(null); resetForm(); };

  const handleViewProgram  = (p: Program) => { setSelectedProgram(p); setShowViewModal(true); };
  const handleDeleteClick  = (id: string) => { setDeleteTarget(id); setShowDeleteConfirm(true); };

  // ── Stats ──────────────────────────────────────────────────────────────────
  const totalCount    = programs.length;
  const activeCount   = programs.filter((p) => p.status === "Active").length;
  const bachelorCount = programs.filter((p) => p.level === "Bachelor").length;
  const masterCount   = programs.filter((p) => p.level === "Master").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-primary-blue mb-2">Programs</h1>
          <p className="text-body">Manage the academic programs your institution offers</p>
        </div>
        <button
          onClick={() => { resetForm(); setIsEditMode(false); setEditId(null); setShowAddModal(true); }}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary-blue text-white rounded-xl hover:opacity-90 active:scale-[0.97] active:opacity-80 transition-all duration-150 shadow-md select-none cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Program
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-card border border-light overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-soft sticky top-0">
              <tr>
                {["Program Name", "Level / Type", "Status", "Actions"].map((h) => (
                  <th key={h} className="px-6 py-3 text-left text-body font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                // ── Loading skeleton ──
                Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
              ) : (
                paginatedPrograms.map((program, index) => (
                  <tr
                    key={program.id}
                    className={`border-t border-light hover:bg-soft transition-colors ${
                      index % 2 === 0 ? "bg-white" : "bg-[#FAFAFA]"
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary-blue/10 flex items-center justify-center">
                          <GraduationCap className="w-5 h-5 text-primary-blue" />
                        </div>
                        <span className="text-dark font-medium">{program.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-blue-50 text-primary-blue rounded-full text-sm font-medium">
                        {program.level}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        program.status === "Active" ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-500"
                      }`}>
                        {program.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleViewProgram(program)}
                          className="p-1.5 text-primary-blue hover:bg-blue-50 active:bg-blue-100 active:scale-95 rounded-lg transition-all duration-100 cursor-pointer"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditProgram(program)}
                          className="p-1.5 text-sky-blue hover:bg-blue-50 active:bg-blue-100 active:scale-95 rounded-lg transition-all duration-100 cursor-pointer"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(program.id)}
                          className="p-1.5 text-red-500 hover:bg-red-50 active:bg-red-100 active:scale-95 rounded-lg transition-all duration-100 cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Empty state */}
        {!loading && programs.length === 0 && (
          <div className="p-12 text-center">
            <GraduationCap className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-body">No programs found. Add your first program to get started.</p>
          </div>
        )}

        {/* Pagination */}
        {!loading && totalItems > 0 && (
          <div className="border-t border-light px-6 py-3 flex items-center justify-between flex-wrap gap-3">
            <p className="text-sm text-body">
              Showing <span className="font-medium text-dark">{fromItem}–{toItem}</span> of{" "}
              <span className="font-medium text-dark">{totalItems}</span> programs
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={safePage === 1}
                className="p-1.5 rounded-lg border border-light text-body hover:bg-soft active:bg-soft/80 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {pageNumbers[0] > 1 && (<>
                <button onClick={() => setCurrentPage(1)} className="w-8 h-8 rounded-lg border border-light text-sm text-body hover:bg-soft cursor-pointer">1</button>
                {pageNumbers[0] > 2 && <span className="px-1 text-body text-sm">…</span>}
              </>)}

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

              {pageNumbers[pageNumbers.length - 1] < totalPages && (<>
                {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && <span className="px-1 text-body text-sm">…</span>}
                <button onClick={() => setCurrentPage(totalPages)} className="w-8 h-8 rounded-lg border border-light text-sm text-body hover:bg-soft cursor-pointer">{totalPages}</button>
              </>)}

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
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
          { label: "Total Programs",    value: totalCount,    color: "text-primary-blue" },
          { label: "Active Programs",   value: activeCount,   color: "text-green-600" },
          { label: "Bachelor Programs", value: bachelorCount, color: "text-blue-600" },
          { label: "Master Programs",   value: masterCount,   color: "text-purple-600" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-lg shadow-card p-6 border border-light">
            <p className="text-sm text-body mb-2">{label}</p>
            {loading
              ? <div className="h-9 w-12 rounded bg-gray-200 animate-pulse mt-1" />
              : <p className={`text-3xl font-bold ${color}`}>{value}</p>
            }
          </div>
        ))}
      </div>

      {/* Add / Edit Modal */}
      {showAddModal && (
        <>
          <div className="fixed inset-0 bg-white/40 backdrop-blur-sm z-50" onClick={closeModal} />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-lg w-full shadow-2xl">
              <div className="border-b border-light px-6 py-4 flex items-center justify-between">
                <h2 className="text-primary-blue">{isEditMode ? "Edit Program" : "Add New Program"}</h2>
                <button onClick={closeModal} className="p-2 hover:bg-soft active:bg-soft/80 rounded-lg transition-colors cursor-pointer">
                  <X className="w-5 h-5 text-body" />
                </button>
              </div>

              <form onSubmit={handleAddProgram} className="p-6 space-y-5">
                <div>
                  <label className="block text-sm text-body mb-2">Program Name *</label>
                  <input
                    type="text" required value={programName}
                    onChange={(e) => setProgramName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-shadow"
                    placeholder="e.g., Bachelor of Computer Science"
                  />
                </div>

                <div>
                  <label className="block text-sm text-body mb-2">Level / Type *</label>
                  <select
                    required value={programLevel}
                    onChange={(e) => setProgramLevel(e.target.value as Program["level"])}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-shadow cursor-pointer"
                  >
                    {levels.map((level) => <option key={level} value={level}>{level}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-body mb-2">Status</label>
                  <select
                    value={programStatus}
                    onChange={(e) => setProgramStatus(e.target.value as Program["status"])}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-shadow cursor-pointer"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                <div className="flex gap-4 pt-2">
                  <button
                    type="submit" disabled={saving}
                    className="flex-1 py-3 bg-primary-blue text-white rounded-xl hover:opacity-90 active:opacity-80 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-150 font-medium shadow-sm cursor-pointer"
                  >
                    {saving
                      ? <span className="inline-flex items-center gap-2 justify-center"><Loader2 className="w-4 h-4 animate-spin" />Saving…</span>
                      : isEditMode ? "Update Program" : "Save Program"
                    }
                  </button>
                  <button
                    type="button" onClick={closeModal}
                    className="flex-1 py-3 bg-gray-100 text-body rounded-xl hover:bg-gray-200 active:bg-gray-300 active:scale-[0.98] transition-all duration-150 font-medium cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}

      {/* View Modal */}
      {showViewModal && selectedProgram && (
        <>
          <div className="fixed inset-0 bg-white/40 backdrop-blur-sm z-50" onClick={() => setShowViewModal(false)} />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-lg w-full shadow-2xl">
              <div className="border-b border-light px-6 py-4 flex items-center justify-between">
                <h2 className="text-primary-blue">Program Details</h2>
                <button onClick={() => setShowViewModal(false)} className="p-2 hover:bg-soft rounded-lg transition-colors cursor-pointer">
                  <X className="w-5 h-5 text-body" />
                </button>
              </div>
              <div className="p-6 space-y-5">
                <div className="flex items-center gap-4 pb-4 border-b border-light">
                  <div className="w-14 h-14 rounded-full bg-primary-blue/10 flex items-center justify-center">
                    <GraduationCap className="w-7 h-7 text-primary-blue" />
                  </div>
                  <div>
                    <h3 className="text-dark font-semibold text-lg">{selectedProgram.name}</h3>
                    <p className="text-body text-sm">Academic Program</p>
                  </div>
                </div>

                <div className="grid gap-4">
                  <div className="p-4 bg-soft rounded-lg border border-light">
                    <p className="text-xs text-body mb-1">Level / Type</p>
                    <p className="text-dark text-sm font-medium">{selectedProgram.level}</p>
                  </div>
                  <div className="p-4 bg-soft rounded-lg border border-light">
                    <p className="text-xs text-body mb-1">Status</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      selectedProgram.status === "Active" ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-500"
                    }`}>
                      {selectedProgram.status}
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
      {showDeleteConfirm && (
        <>
          <div className="fixed inset-0 bg-white/40 backdrop-blur-sm z-50" onClick={() => setShowDeleteConfirm(false)} />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full shadow-2xl">
              <div className="p-6">
                <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-6 h-6 text-red-500" />
                </div>
                <h3 className="text-dark font-semibold text-center mb-2">Confirm Deletion</h3>
                <p className="text-body text-sm text-center mb-6">
                  Are you sure you want to delete this program? This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={confirmDelete} disabled={deleting}
                    className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 active:bg-red-700 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-150 font-medium cursor-pointer"
                  >
                    {deleting
                      ? <span className="inline-flex items-center gap-2 justify-center"><Loader2 className="w-4 h-4 animate-spin" />Deleting…</span>
                      : "Delete"
                    }
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