import { useEffect, useMemo, useState } from "react";
import {
  Plus, Search, Edit, Eye, Trash2,
  Mail, Phone, Briefcase, X,
  CheckCircle, XCircle, User, Award,
  ChevronLeft, ChevronRight, Loader2,
} from "lucide-react";
import { mockTeachers, Teacher } from "../../data/mockData";
import api from "../../api/axios";
import { toast } from "sonner";
import {
  TeacherData,
  TeacherResponse,
  TeacherListResponse,
} from "../../types/teacher";

// ── Role / status mappers ────────────────────────────────────────────────────
const mapRoleFromApi = (role: string | null): "Lecturer" | "Marker" | "Both" | undefined => {
  if (!role) return undefined;
  const n = role.toLowerCase();
  if (n === "lecturer") return "Lecturer";
  if (n === "marker")   return "Marker";
  if (n === "both")     return "Both";
  return undefined;
};

const mapRoleToApi = (role: string | null) => {
  if (!role) return null;
  return role.toLowerCase();
};

const mapTeacherFromApi = (t: TeacherData): Teacher => ({
  id: String(t.id),
  name: t.full_name,
  department: t.department ?? "",
  universityEmail: t.university_email,
  personalEmail: t.personal_email ?? "",
  phone: t.phone ?? "",
  expertise: t.area_of_expertise ?? "",
  industryField: t.industry_field ?? "",
  currentlyInIndustry: t.currently_working,
  activeThisTrimester: t.active_this_trimester,
  roleType: mapRoleFromApi(t.role),
});

type TeacherFormState = {
  name: string;
  universityEmail: string;
  personalEmail: string;
  phone: string;
  roleType: "Lecturer" | "Marker" | "Both" | "";
  expertise: string;
  industryExperienceText: string;
  industryField: string;
  active: boolean;
};

const initialForm: TeacherFormState = {
  name: "", universityEmail: "", personalEmail: "", phone: "",
  roleType: "", expertise: "", industryExperienceText: "", industryField: "", active: true,
};

const PAGE_SIZE = 10;

// ── Shared badge components ──────────────────────────────────────────────────
function RoleBadge({ role }: { role: Teacher["roleType"] }) {
  if (role === "Lecturer") return <span className="inline-flex items-center px-2.5 py-1 bg-blue-50 text-primary-blue rounded-full text-xs font-medium">Lecturer</span>;
  if (role === "Marker")   return <span className="inline-flex items-center px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">Marker</span>;
  if (role === "Both")     return <span className="inline-flex items-center px-2.5 py-1 bg-purple-50 text-purple-600 rounded-full text-xs font-medium">Both</span>;
  return <span className="inline-flex items-center px-2.5 py-1 bg-gray-100 text-gray-400 rounded-full text-xs">Not Set</span>;
}

function StatusBadge({ active }: { active: boolean }) {
  return active
    ? <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-50 text-green-600 rounded-full text-xs font-medium"><CheckCircle className="w-3 h-3" />Active</span>
    : <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-500 rounded-full text-xs font-medium"><XCircle className="w-3 h-3" />Inactive</span>;
}

// ── Skeleton row (desktop) ───────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <tr className="border-t border-light">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse flex-shrink-0" />
          <div className="space-y-1.5">
            <div className="h-3.5 w-32 rounded bg-gray-200 animate-pulse" />
            <div className="h-3 w-44 rounded bg-gray-200 animate-pulse" />
          </div>
        </div>
      </td>
      <td className="px-6 py-4"><div className="h-6 w-20 rounded-full bg-gray-200 animate-pulse" /></td>
      <td className="px-6 py-4"><div className="h-6 w-16 rounded-full bg-gray-200 animate-pulse" /></td>
      <td className="px-6 py-4"><div className="h-4 w-28 rounded bg-gray-200 animate-pulse" /></td>
      <td className="px-6 py-4">
        <div className="flex gap-1.5">
          <div className="w-7 h-7 rounded-lg bg-gray-200 animate-pulse" />
          <div className="w-7 h-7 rounded-lg bg-gray-200 animate-pulse" />
          <div className="w-7 h-7 rounded-lg bg-gray-200 animate-pulse" />
        </div>
      </td>
    </tr>
  );
}

// ── Main component ───────────────────────────────────────────────────────────
export default function TeacherManagement() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const [showAddDrawer,     setShowAddDrawer]     = useState(false);
  const [showViewModal,     setShowViewModal]     = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedTeacher,   setSelectedTeacher]   = useState<Teacher | null>(null);
  const [deleteTargetId,    setDeleteTargetId]    = useState<string | null>(null);
  const [deleting,          setDeleting]          = useState(false);

  const [isEditMode,     setIsEditMode]     = useState(false);
  const [editTeacherId,  setEditTeacherId]  = useState<string | null>(null);
  const [form,           setForm]           = useState<TeacherFormState>(initialForm);
  const [submitting,     setSubmitting]     = useState(false);

  const [searchTerm,      setSearchTerm]      = useState("");
  const [filterExpertise, setFilterExpertise] = useState("");
  const [filterStatus,    setFilterStatus]    = useState("");
  const [filterRoleType,  setFilterRoleType]  = useState("");

  const expertiseAreas = useMemo(
    () => Array.from(new Set(mockTeachers.map((t) => t.expertise))).filter(Boolean),
    []
  );

  const hasFilters = !!(searchTerm || filterExpertise || filterRoleType || filterStatus);

  const clearFilters = () => {
    setSearchTerm(""); setFilterExpertise(""); setFilterRoleType(""); setFilterStatus("");
  };

  const token = () => localStorage.getItem("token");

  // ── Filtered + paginated ──────────────────────────────────────────────────
  const filteredTeachers = useMemo(() =>
    teachers.filter((t) => {
      const matchesSearch =
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.universityEmail.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesExpertise  = !filterExpertise || t.expertise === filterExpertise;
      const matchesStatus     =
        !filterStatus ||
        (filterStatus === "Active"        && t.activeThisTrimester) ||
        (filterStatus === "Inactive"      && !t.activeThisTrimester) ||
        (filterStatus === "Industry Only" && t.currentlyInIndustry);
      const matchesRoleType   = !filterRoleType || t.roleType === filterRoleType;
      return matchesSearch && matchesExpertise && matchesStatus && matchesRoleType;
    }),
    [teachers, searchTerm, filterExpertise, filterStatus, filterRoleType]
  );

  useEffect(() => { setCurrentPage(1); }, [searchTerm, filterExpertise, filterStatus, filterRoleType]);

  const totalItems = filteredTeachers.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const safePage   = Math.min(currentPage, totalPages);

  const paginatedTeachers = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filteredTeachers.slice(start, start + PAGE_SIZE);
  }, [filteredTeachers, safePage]);

  const fromItem = totalItems === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const toItem   = Math.min(safePage * PAGE_SIZE, totalItems);

  const pageNumbers = useMemo(() => {
    const range: number[] = [];
    for (let i = Math.max(1, safePage - 2); i <= Math.min(totalPages, safePage + 2); i++) range.push(i);
    return range;
  }, [safePage, totalPages]);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        setLoading(true);
        const res = await api.get<TeacherListResponse>("/teachers", {
          headers: { Authorization: `Bearer ${token()}` },
          params: {
            role:   filterRoleType ? mapRoleToApi(filterRoleType) : undefined,
            search: searchTerm     || undefined,
          },
        });
        if (res.data.status === 1) {
          setTeachers(res.data.data.map(mapTeacherFromApi));
        } else {
          toast.error("Failed to fetch teachers: " + res.data.message);
        }
      } catch {
        toast.error("Error fetching teachers. Check console.");
      } finally {
        setLoading(false);
      }
    };
    fetchTeachers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterRoleType, searchTerm]);

  // ── View ──────────────────────────────────────────────────────────────────
  const handleViewTeacher = (t: Teacher) => { setSelectedTeacher(t); setShowViewModal(true); };

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDeleteClick = (id: string) => { setDeleteTargetId(id); setShowDeleteConfirm(true); };

  const confirmDelete = async () => {
    if (!deleteTargetId) return;
    try {
      setDeleting(true);
      const res = await api.delete<{ status: number; message: string }>(
        `/teachers/${deleteTargetId}`, { headers: { Authorization: `Bearer ${token()}` } }
      );
      if (res.data.status === 1) {
        setTeachers((prev) => {
          const updated = prev.filter((t) => t.id !== deleteTargetId);
          const newLast = Math.max(1, Math.ceil(updated.length / PAGE_SIZE));
          if (safePage > newLast) setCurrentPage(newLast);
          return updated;
        });
        toast.success(res.data.message || "Teacher deleted");
        if (selectedTeacher?.id === deleteTargetId) { setShowViewModal(false); setSelectedTeacher(null); }
      } else {
        toast.error(res.data.message || "Failed to delete teacher");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete teacher");
    } finally {
      setDeleting(false); setShowDeleteConfirm(false); setDeleteTargetId(null);
    }
  };

  // ── Drawer ────────────────────────────────────────────────────────────────
  const openAddDrawer = () => { setIsEditMode(false); setEditTeacherId(null); setForm(initialForm); setShowAddDrawer(true); };
  const openEditDrawer = (t: Teacher) => {
    setIsEditMode(true); setEditTeacherId(t.id);
    setForm({
      name: t.name ?? "", universityEmail: t.universityEmail ?? "",
      personalEmail: t.personalEmail ?? "", phone: t.phone ?? "",
      roleType: (t.roleType as any) ?? "", expertise: t.expertise ?? "",
      industryExperienceText: t.currentlyInIndustry ? "Yes" : "",
      industryField: t.industryField ?? "", active: !!t.activeThisTrimester,
    });
    setShowAddDrawer(true);
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmitTeacher = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;

    if (!form.name.trim())              return toast.error("Full Name is required");
    if (!form.universityEmail.trim())   return toast.error("University Email is required");
    if (!form.phone.trim())             return toast.error("Phone is required");
    if (!form.roleType)                 return toast.error("Role Type is required");
    if (!form.expertise.trim())         return toast.error("Area of Expertise is required");

    const payload = {
      full_name:            form.name.trim(),
      university_email:     form.universityEmail.trim(),
      personal_email:       form.personalEmail.trim()        || null,
      phone:                form.phone.trim()                || null,
      area_of_expertise:    form.expertise.trim()            || null,
      industry_field:       form.industryField.trim()        || null,
      currently_working:    !!form.industryExperienceText?.trim(),
      active_this_trimester: !!form.active,
      role:   mapRoleToApi(form.roleType),
      status: "active",
    };

    try {
      setSubmitting(true);
      if (!isEditMode) {
        const res = await api.post<TeacherResponse>("/teachers", payload, { headers: { Authorization: `Bearer ${token()}` } });
        if (res.data.status === 1) {
          setTeachers((prev) => [mapTeacherFromApi(res.data.data), ...prev]);
          setCurrentPage(1);
          setShowAddDrawer(false);
          setForm(initialForm);
          toast.success("Teacher added successfully!");
        } else { toast.error(res.data.message || "Failed to add teacher"); }
      } else {
        if (!editTeacherId) return toast.error("No teacher selected for edit");
        const res = await api.put<TeacherResponse>(`/teachers/${editTeacherId}`, payload, { headers: { Authorization: `Bearer ${token()}` } });
        if (res.data.status === 1) {
          const updated = mapTeacherFromApi(res.data.data);
          setTeachers((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
          if (selectedTeacher?.id === updated.id) setSelectedTeacher(updated);
          setShowAddDrawer(false);
          toast.success("Teacher updated successfully!");
        } else { toast.error(res.data.message || "Failed to update teacher"); }
      }
    } catch (error: any) {
      if (error.response?.status === 422) {
        const errors = error.response.data?.errors;
        const firstError = errors ? (Object.values(errors)[0] as string[]) : null;
        toast.error(firstError?.[0] || "Validation error");
        return;
      }
      toast.error(error.response?.data?.message || "Submit failed");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Pagination bar (desktop) ──────────────────────────────────────────────
  const PaginationBar = () =>
    totalItems > 0 ? (
      <div className="border-t border-light px-6 py-3 flex items-center justify-between flex-wrap gap-3">
        <p className="text-sm text-body">
          Showing <span className="font-medium text-dark">{fromItem}–{toItem}</span> of{" "}
          <span className="font-medium text-dark">{totalItems}</span> teachers
        </p>
        <div className="flex items-center gap-1">
          <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={safePage === 1}
            className="p-1.5 rounded-lg border border-light text-body hover:bg-soft active:bg-soft/80 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer">
            <ChevronLeft className="w-4 h-4" />
          </button>
          {pageNumbers[0] > 1 && (<>
            <button onClick={() => setCurrentPage(1)} className="w-8 h-8 rounded-lg border border-light text-sm text-body hover:bg-soft cursor-pointer">1</button>
            {pageNumbers[0] > 2 && <span className="px-1 text-body text-sm">…</span>}
          </>)}
          {pageNumbers.map((page) => (
            <button key={page} onClick={() => setCurrentPage(page)}
              className={`w-8 h-8 rounded-lg border text-sm transition-colors cursor-pointer ${
                page === safePage ? "bg-primary-blue text-white border-primary-blue font-medium" : "border-light text-body hover:bg-soft"
              }`}>
              {page}
            </button>
          ))}
          {pageNumbers[pageNumbers.length - 1] < totalPages && (<>
            {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && <span className="px-1 text-body text-sm">…</span>}
            <button onClick={() => setCurrentPage(totalPages)} className="w-8 h-8 rounded-lg border border-light text-sm text-body hover:bg-soft cursor-pointer">{totalPages}</button>
          </>)}
          <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={safePage === totalPages}
            className="p-1.5 rounded-lg border border-light text-body hover:bg-soft active:bg-soft/80 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    ) : null;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-primary-blue mb-2">Teacher Management</h1>
        <p className="text-body">Manage your teaching staff and their information</p>
      </div>

      {/* ── Compact filter bar ── */}
      <div className="bg-white rounded-xl shadow-card p-4 border border-light">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent"
            />
          </div>

          {/* Dropdowns in a row */}
          <div className="flex gap-2 flex-wrap sm:flex-nowrap">
            <select
              value={filterRoleType}
              onChange={(e) => setFilterRoleType(e.target.value)}
              className="flex-1 min-w-[110px] px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue bg-white text-body cursor-pointer"
            >
              <option value="">All Roles</option>
              <option value="Lecturer">Lecturer</option>
              <option value="Marker">Marker</option>
              <option value="Both">Both</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="flex-1 min-w-[110px] px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue bg-white text-body cursor-pointer"
            >
              <option value="">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Industry Only">Industry</option>
            </select>

            <select
              value={filterExpertise}
              onChange={(e) => setFilterExpertise(e.target.value)}
              className="flex-1 min-w-[120px] px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue bg-white text-body cursor-pointer"
            >
              <option value="">All Expertise</option>
              {expertiseAreas.map((exp) => <option key={exp} value={exp}>{exp}</option>)}
            </select>

            {hasFilters && (
              <button
                onClick={clearFilters}
                title="Clear filters"
                className="px-3 py-2.5 border border-gray-300 rounded-xl text-body hover:bg-soft active:bg-soft/80 transition-colors cursor-pointer flex items-center gap-1.5 text-sm whitespace-nowrap"
              >
                <X className="w-3.5 h-3.5" />
                Clear
              </button>
            )}

            <button
              onClick={openAddDrawer}
              className="flex items-center gap-2 px-4 py-2.5 bg-primary-blue text-white rounded-xl hover:opacity-90 active:scale-[0.97] active:opacity-80 transition-all duration-150 shadow-sm whitespace-nowrap text-sm cursor-pointer select-none"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Teacher</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Desktop table ── */}
      <div className="hidden md:block bg-white rounded-xl shadow-card border border-light overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-soft sticky top-0">
              <tr>
                {["Teacher Name", "Role", "Status", "Phone", "Actions"].map((h) => (
                  <th key={h} className="px-6 py-4 text-left text-body font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
              ) : (
                paginatedTeachers.map((teacher, index) => (
                  <tr
                    key={teacher.id}
                    className={`border-t border-light hover:bg-soft transition-colors ${index % 2 === 0 ? "bg-white" : "bg-[#FAFAFA]"}`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-primary-blue rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                          {teacher.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                        </div>
                        <div>
                          <p className="text-dark font-medium text-sm">{teacher.name}</p>
                          <p className="text-xs text-body">{teacher.universityEmail}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4"><RoleBadge role={teacher.roleType} /></td>
                    <td className="px-6 py-4"><StatusBadge active={!!teacher.activeThisTrimester} /></td>
                    <td className="px-6 py-4 text-body text-sm">{teacher.phone || "—"}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => handleViewTeacher(teacher)} title="View"
                          className="p-1.5 text-primary-blue hover:bg-blue-50 active:bg-blue-100 active:scale-95 rounded-lg transition-all duration-100 cursor-pointer">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => openEditDrawer(teacher)} title="Edit"
                          className="p-1.5 text-sky-blue hover:bg-blue-50 active:bg-blue-100 active:scale-95 rounded-lg transition-all duration-100 cursor-pointer">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDeleteClick(teacher.id)} title="Delete"
                          className="p-1.5 text-red-500 hover:bg-red-50 active:bg-red-100 active:scale-95 rounded-lg transition-all duration-100 cursor-pointer">
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

        {!loading && filteredTeachers.length === 0 && (
          <div className="p-12 text-center">
            <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-body">No teachers found matching your filters</p>
          </div>
        )}

        <PaginationBar />
      </div>

      {/* ── Mobile cards ── */}
      <div className="md:hidden space-y-3">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-card border border-light p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-gray-200 animate-pulse flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 w-32 rounded bg-gray-200 animate-pulse" />
                  <div className="flex gap-2">
                    <div className="h-5 w-16 rounded-full bg-gray-200 animate-pulse" />
                    <div className="h-5 w-14 rounded-full bg-gray-200 animate-pulse" />
                  </div>
                </div>
              </div>
              <div className="h-8 rounded-lg bg-gray-200 animate-pulse" />
            </div>
          ))
        ) : (
          paginatedTeachers.map((teacher) => (
            <div key={teacher.id} className="bg-white rounded-xl shadow-card border border-light p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-11 h-11 bg-primary-blue rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                  {teacher.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-dark font-medium mb-1 truncate">{teacher.name}</p>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <StatusBadge active={!!teacher.activeThisTrimester} />
                    <RoleBadge role={teacher.roleType} />
                  </div>
                </div>
              </div>
              {teacher.phone && (
                <div className="flex items-center gap-2 text-sm text-body mb-3">
                  <Phone className="w-3.5 h-3.5 text-primary-blue flex-shrink-0" />
                  <span>{teacher.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-2 pt-3 border-t border-light">
                <button onClick={() => handleViewTeacher(teacher)}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-primary-blue hover:bg-blue-50 rounded-lg transition-colors text-sm cursor-pointer">
                  <Eye className="w-3.5 h-3.5" />View
                </button>
                <button onClick={() => openEditDrawer(teacher)}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sky-blue hover:bg-blue-50 rounded-lg transition-colors text-sm cursor-pointer">
                  <Edit className="w-3.5 h-3.5" />Edit
                </button>
                <button onClick={() => handleDeleteClick(teacher.id)}
                  className="flex items-center justify-center px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}

        {/* Mobile pagination */}
        {!loading && totalItems > 0 && (
          <div className="bg-white rounded-xl shadow-card border border-light px-4 py-3 flex items-center justify-between gap-3">
            <p className="text-sm text-body">{fromItem}–{toItem} of {totalItems}</p>
            <div className="flex items-center gap-1">
              <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={safePage === 1}
                className="p-1.5 rounded-lg border border-light text-body hover:bg-soft disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 text-sm text-dark font-medium">{safePage} / {totalPages}</span>
              <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={safePage === totalPages}
                className="p-1.5 rounded-lg border border-light text-body hover:bg-soft disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {!loading && filteredTeachers.length === 0 && (
          <div className="p-12 text-center bg-white rounded-xl shadow-card border border-light">
            <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-body">No teachers found matching your filters</p>
          </div>
        )}
      </div>

      {/* ── Add/Edit Modal (centered, matching Programs/Trimesters) ── */}
      {showAddDrawer && (
        <>
          <div className="fixed inset-0 bg-white/40 backdrop-blur-sm z-50" onClick={() => setShowAddDrawer(false)} />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="border-b border-light px-6 py-4 flex items-center justify-between sticky top-0 bg-white z-10">
                <h2 className="text-primary-blue">{isEditMode ? "Edit Teacher" : "Add New Teacher"}</h2>
                <button onClick={() => setShowAddDrawer(false)} className="p-2 hover:bg-soft active:bg-soft/80 rounded-lg transition-colors cursor-pointer">
                  <X className="w-5 h-5 text-body" />
                </button>
              </div>

              <form onSubmit={handleSubmitTeacher} className="p-6 space-y-5">
                <div>
                  <label className="block text-sm text-body mb-2">Full Name *</label>
                  <input type="text" required value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-shadow"
                    placeholder="Dr. Jane Smith" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-body mb-2">University Email *</label>
                    <input type="email" required value={form.universityEmail}
                      onChange={(e) => setForm((p) => ({ ...p, universityEmail: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-shadow"
                      placeholder="jane@university.edu" />
                  </div>
                  <div>
                    <label className="block text-sm text-body mb-2">Personal Email</label>
                    <input type="email" value={form.personalEmail}
                      onChange={(e) => setForm((p) => ({ ...p, personalEmail: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-shadow"
                      placeholder="jane@email.com" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-body mb-2">Phone *</label>
                    <input type="tel" required value={form.phone}
                      onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-shadow"
                      placeholder="+1 (555) 123-4567" />
                  </div>
                  <div>
                    <label className="block text-sm text-body mb-2">Teacher Role Type *</label>
                    <select required value={form.roleType}
                      onChange={(e) => setForm((p) => ({ ...p, roleType: e.target.value as any }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-shadow cursor-pointer">
                      <option value="">Select Role Type</option>
                      <option value="Lecturer">Lecturer (Teaches Subjects)</option>
                      <option value="Marker">Marker (Grading Only)</option>
                      <option value="Both">Both (Lecturer + Marker)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-body mb-2">Area of Expertise *</label>
                  <input type="text" required value={form.expertise}
                    onChange={(e) => setForm((p) => ({ ...p, expertise: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-shadow"
                    placeholder="Artificial Intelligence" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-body mb-2">Industry Experience</label>
                    <textarea rows={3} value={form.industryExperienceText}
                      onChange={(e) => setForm((p) => ({ ...p, industryExperienceText: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-shadow resize-none"
                      placeholder="E.g., 5 years at Google as Senior AI Engineer…" />
                  </div>
                  <div>
                    <label className="block text-sm text-body mb-2">Industry Field / Specialisation</label>
                    <input type="text" value={form.industryField}
                      onChange={(e) => setForm((p) => ({ ...p, industryField: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-shadow"
                      placeholder="E.g., AI, Cloud, Cybersecurity" />
                  </div>
                </div>

                <div className="p-4 bg-soft rounded-xl">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={form.active}
                      onChange={(e) => setForm((p) => ({ ...p, active: e.target.checked }))}
                      className="w-5 h-5 text-primary-blue rounded focus:ring-primary-blue border-gray-300" />
                    <span className="text-body text-sm">Active This Trimester</span>
                  </label>
                </div>

                <div className="flex gap-4 pt-2">
                  <button type="submit" disabled={submitting}
                    className="flex-1 py-3 bg-primary-blue text-white rounded-xl hover:opacity-90 active:opacity-80 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-150 font-medium shadow-sm cursor-pointer">
                    {submitting
                      ? <span className="inline-flex items-center gap-2 justify-center"><Loader2 className="w-4 h-4 animate-spin" />Saving…</span>
                      : isEditMode ? "Update Teacher" : "Add Teacher"
                    }
                  </button>
                  <button type="button" onClick={() => setShowAddDrawer(false)}
                    className="flex-1 py-3 bg-gray-100 text-body rounded-xl hover:bg-gray-200 active:bg-gray-300 active:scale-[0.98] transition-all duration-150 font-medium cursor-pointer">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}

      {/* ── View modal ── */}
      {showViewModal && selectedTeacher && (
        <>
          <div className="fixed inset-0 bg-white/30 backdrop-blur-sm z-50" onClick={() => setShowViewModal(false)} />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="border-b border-light px-6 py-4 flex items-center justify-between sticky top-0 bg-white z-10">
                <h2 className="text-primary-blue">Teacher Details</h2>
                <button onClick={() => setShowViewModal(false)} className="p-2 hover:bg-soft rounded-lg transition-colors cursor-pointer">
                  <X className="w-5 h-5 text-body" />
                </button>
              </div>
              <div className="p-6 space-y-5">
                {/* Profile */}
                <div className="flex items-start gap-4 pb-5 border-b border-light">
                  <div className="w-16 h-16 bg-primary-blue rounded-full flex items-center justify-center text-white text-xl font-semibold flex-shrink-0">
                    {selectedTeacher.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-dark font-semibold text-lg mb-0.5">{selectedTeacher.name}</h3>
                    {selectedTeacher.roleType && (
                      <p className="text-sm text-body mb-2">Role: <span className="font-medium text-dark">{selectedTeacher.roleType}</span></p>
                    )}
                    <div className="flex items-center gap-2 flex-wrap">
                      <StatusBadge active={!!selectedTeacher.activeThisTrimester} />
                      <RoleBadge role={selectedTeacher.roleType} />
                    </div>
                  </div>
                </div>

                {/* Contact */}
                <div>
                  <h4 className="text-dark font-medium mb-3 flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-primary-blue" />Contact Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      { label: "University Email", value: selectedTeacher.universityEmail },
                      { label: "Personal Email",   value: selectedTeacher.personalEmail || "—" },
                    ].map(({ label, value }) => (
                      <div key={label} className="p-3 bg-soft rounded-lg border border-light">
                        <p className="text-xs text-body mb-0.5">{label}</p>
                        <p className="text-dark text-sm">{value}</p>
                      </div>
                    ))}
                    <div className="p-3 bg-soft rounded-lg border border-light">
                      <p className="text-xs text-body mb-0.5">Phone Number</p>
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-primary-blue" />
                        <p className="text-dark text-sm">{selectedTeacher.phone || "—"}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Industry */}
                {selectedTeacher.currentlyInIndustry && (
                  <div>
                    <h4 className="text-dark font-medium mb-3 flex items-center gap-2 text-sm">
                      <Briefcase className="w-4 h-4 text-primary-blue" />Industry Experience
                    </h4>
                    <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                      <p className="text-body text-sm mb-2">Currently working in industry.</p>
                      {selectedTeacher.industryField && (
                        <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                          {selectedTeacher.industryField}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Expertise */}
                <div>
                  <h4 className="text-dark font-medium mb-3 flex items-center gap-2 text-sm">
                    <Award className="w-4 h-4 text-primary-blue" />Expertise
                  </h4>
                  <span className="px-3 py-1.5 bg-blue-50 text-primary-blue rounded-full text-sm">
                    {selectedTeacher.expertise}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-light">
                  <button
                    onClick={() => { setShowViewModal(false); openEditDrawer(selectedTeacher); }}
                    className="flex-1 px-4 py-3 bg-primary-blue text-white rounded-xl hover:opacity-90 active:opacity-80 active:scale-[0.98] transition-all duration-150 flex items-center justify-center gap-2 font-medium cursor-pointer"
                  >
                    <Edit className="w-4 h-4" />Edit Teacher
                  </button>
                  <button
                    onClick={() => { setShowViewModal(false); handleDeleteClick(selectedTeacher.id); }}
                    className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 active:bg-red-700 active:scale-[0.98] transition-all duration-150 flex items-center justify-center gap-2 font-medium cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── Delete confirmation ── */}
      {showDeleteConfirm && (
        <>
          <div className="fixed inset-0 bg-white/30 backdrop-blur-sm z-50" onClick={() => setShowDeleteConfirm(false)} />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full shadow-2xl">
              <div className="p-6">
                <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-6 h-6 text-red-500" />
                </div>
                <h3 className="text-dark font-semibold text-center mb-2">Confirm Deletion</h3>
                <p className="text-body text-sm text-center mb-6">
                  Are you sure you want to delete this teacher? This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button onClick={confirmDelete} disabled={deleting}
                    className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 active:bg-red-700 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-150 font-medium cursor-pointer">
                    {deleting
                      ? <span className="inline-flex items-center gap-2 justify-center"><Loader2 className="w-4 h-4 animate-spin" />Deleting…</span>
                      : "Delete"
                    }
                  </button>
                  <button onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 px-4 py-3 bg-gray-100 text-body rounded-xl hover:bg-gray-200 active:bg-gray-300 active:scale-[0.98] transition-all duration-150 font-medium cursor-pointer">
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