import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  Edit,
  Eye,
  Trash2,
  Mail,
  Phone,
  Briefcase,
  X,
  Circle,
  CheckCircle,
  XCircle,
  User,
  Award,
} from "lucide-react";
import { mockTeachers, Teacher } from "../../data/mockData";
import api from "../../api/axios";
import {
  TeacherData,
  TeacherResponse,
  TeacherListResponse,
} from "../../types/teacher";

interface Toast {
  id: string;
  message: string;
  type: "success" | "error";
}

const mapRoleFromApi = (
  role: string | null,
): "Lecturer" | "Marker" | "Both" | undefined => {
  if (!role) return undefined;
  const normalized = role.toLowerCase();
  if (normalized === "lecturer") return "Lecturer";
  if (normalized === "marker") return "Marker";
  if (normalized === "both") return "Both";
  return undefined;
};

const mapRoleToApi = (role: string | null) => {
  if (!role) return null;
  const normalized = role.toLowerCase();
  if (normalized === "lecturer") return "lecturer";
  if (normalized === "marker") return "marker";
  if (normalized === "both") return "both";
  return role;
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

const initialTeacherForm: TeacherFormState = {
  name: "",
  universityEmail: "",
  personalEmail: "",
  phone: "",
  roleType: "",
  expertise: "",
  industryExperienceText: "",
  industryField: "",
  active: true,
};

export default function TeacherManagement() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [showAddDrawer, setShowAddDrawer] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editTeacherId, setEditTeacherId] = useState<string | null>(null);

  const [form, setForm] = useState<TeacherFormState>(initialTeacherForm);
  const [submitting, setSubmitting] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterExpertise, setFilterExpertise] = useState("");
  const [filterProgramLevel, setFilterProgramLevel] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterRoleType, setFilterRoleType] = useState("");

  const expertiseAreas = useMemo(
    () =>
      Array.from(new Set(mockTeachers.map((t) => t.expertise))).filter(Boolean),
    [],
  );

  // Toast
  const showToast = (
    message: string,
    type: "success" | "error" = "success",
  ) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3000);
  };

  const clearFilters = () => {
    setFilterExpertise("");
    setFilterRoleType("");
    setFilterProgramLevel("");
    setFilterStatus("");
    setSearchTerm("");
  };

  const filteredTeachers = useMemo(() => {
    return teachers.filter((teacher) => {
      const matchesSearch =
        teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.universityEmail
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesExpertise =
        !filterExpertise || teacher.expertise === filterExpertise;

      const matchesStatus =
        !filterStatus ||
        (filterStatus === "Active" && teacher.activeThisTrimester) ||
        (filterStatus === "Inactive" && !teacher.activeThisTrimester) ||
        (filterStatus === "Industry Only" && teacher.currentlyInIndustry);

      const matchesRoleType =
        !filterRoleType || teacher.roleType === filterRoleType;

      return (
        matchesSearch && matchesExpertise && matchesStatus && matchesRoleType
      );
    });
  }, [teachers, searchTerm, filterExpertise, filterStatus, filterRoleType]);

  const token = () => localStorage.getItem("token");

  // FETCH TEACHERS (API)
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const res = await api.get<TeacherListResponse>("/teachers", {
          headers: { Authorization: `Bearer ${token()}` },
          params: {
            role: filterRoleType ? mapRoleToApi(filterRoleType) : undefined,
            search: searchTerm || undefined,
          },
        });

        if (res.data.status === 1) {
          const fetchedTeachers = res.data.data.map(mapTeacherFromApi);
          setTeachers(fetchedTeachers);
        } else {
          showToast("Failed to fetch teachers: " + res.data.message, "error");
        }
      } catch (err) {
        console.error("Error fetching teachers:", err);
        showToast("Error fetching teachers. Check console.", "error");
      }
    };

    fetchTeachers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterRoleType, searchTerm]);

  // VIEW
  const handleViewTeacher = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setShowViewModal(true);
  };

  // DELETE
  const handleDeleteClick = (id: string) => {
    setDeleteTargetId(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!deleteTargetId) return;

    try {
      const res = await api.delete<{ status: number; message: string }>(
        `/teachers/${deleteTargetId}`,
        { headers: { Authorization: `Bearer ${token()}` } },
      );

      if (res.data.status === 1) {
        setTeachers((prev) => prev.filter((t) => t.id !== deleteTargetId));
        showToast(res.data.message || "Teacher deleted", "success");

        if (selectedTeacher?.id === deleteTargetId) {
          setShowViewModal(false);
          setSelectedTeacher(null);
        }
      } else {
        showToast(res.data.message || "Failed to delete teacher", "error");
      }
    } catch (error: any) {
      console.error("Delete error:", error);
      showToast(
        error.response?.data?.message || "Failed to delete teacher",
        "error",
      );
    } finally {
      setShowDeleteConfirm(false);
      setDeleteTargetId(null);
    }
  };

  // OPEN ADD DRAWER
  const openAddDrawer = () => {
    setIsEditMode(false);
    setEditTeacherId(null);
    setForm(initialTeacherForm);
    setShowAddDrawer(true);
  };

  // OPEN EDIT DRAWER
  const openEditDrawer = (teacher: Teacher) => {
    setIsEditMode(true);
    setEditTeacherId(teacher.id);

    setForm({
      name: teacher.name ?? "",
      universityEmail: teacher.universityEmail ?? "",
      personalEmail: teacher.personalEmail ?? "",
      phone: teacher.phone ?? "",
      roleType: (teacher.roleType as any) ?? "",
      expertise: teacher.expertise ?? "",
      industryExperienceText: teacher.currentlyInIndustry ? "Yes" : "",
      industryField: teacher.industryField ?? "",
      active: !!teacher.activeThisTrimester,
    });

    setShowAddDrawer(true);
  };

  // SUBMIT (ADD/EDIT)
  const handleSubmitTeacher = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;

    if (!form.name.trim()) return showToast("Full Name is required", "error");
    if (!form.universityEmail.trim())
      return showToast("University Email is required", "error");
    if (!form.phone.trim()) return showToast("Phone is required", "error");
    if (!form.roleType) return showToast("Role Type is required", "error");
    if (!form.expertise.trim())
      return showToast("Area of Expertise is required", "error");

    const payload = {
      full_name: form.name.trim(),
      university_email: form.universityEmail.trim(),
      personal_email: form.personalEmail.trim()
        ? form.personalEmail.trim()
        : null,
      phone: form.phone.trim() ? form.phone.trim() : null,
      area_of_expertise: form.expertise.trim() ? form.expertise.trim() : null,
      industry_field: form.industryField.trim()
        ? form.industryField.trim()
        : null,
      currently_working: !!form.industryExperienceText?.trim(),
      active_this_trimester: !!form.active,
      role: mapRoleToApi(form.roleType),
      status: "active",
    };

    try {
      setSubmitting(true);

      if (!isEditMode) {
        const res = await api.post<TeacherResponse>("/teachers", payload, {
          headers: { Authorization: `Bearer ${token()}` },
        });

        if (res.data.status === 1) {
          const teacher = mapTeacherFromApi(res.data.data);
          setTeachers((prev) => [teacher, ...prev]);
          setShowAddDrawer(false);
          showToast("Teacher added successfully!", "success");
          setForm(initialTeacherForm);
        } else {
          showToast(res.data.message || "Failed to add teacher", "error");
        }
      } else {
        if (!editTeacherId)
          return showToast("No teacher selected for edit", "error");

        const res = await api.put<TeacherResponse>(
          `/teachers/${editTeacherId}`,
          payload,
          {
            headers: { Authorization: `Bearer ${token()}` },
          },
        );

        if (res.data.status === 1) {
          const updated = mapTeacherFromApi(res.data.data);
          setTeachers((prev) =>
            prev.map((t) => (t.id === updated.id ? updated : t)),
          );

          if (selectedTeacher?.id === updated.id) setSelectedTeacher(updated);

          setShowAddDrawer(false);
          showToast("Teacher updated successfully!", "success");
        } else {
          showToast(res.data.message || "Failed to update teacher", "error");
        }
      }
    } catch (error: any) {
      if (error.response?.status === 422) {
        const errors = error.response.data?.errors;
        const firstError = errors
          ? (Object.values(errors)[0] as string[])
          : null;
        showToast(firstError?.[0] || "Validation error", "error");
        return;
      }
      console.error("Submit error:", error);
      showToast(error.response?.data?.message || "Submit failed", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-[60] space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 animate-fade-in ${
              toast.type === "success"
                ? "bg-green-50 border border-green-200 text-green-800"
                : "bg-red-50 border border-red-200 text-red-800"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
            ) : (
              <XCircle className="w-5 h-5 flex-shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
        ))}
      </div>

      {/* Header */}
      <div>
        <h1 className="text-primary-blue mb-2">Teacher Management</h1>
        <p className="text-body">
          Manage your teaching staff and their information
        </p>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-xl shadow-card p-4 sm:p-6 border border-light">
        <div className="flex flex-col gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent"
            />
          </div>

          {/* Filter Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
            <div className="relative">
              <Award className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10" />
              <select
                value={filterExpertise}
                onChange={(e) => setFilterExpertise(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent appearance-none bg-white"
              >
                <option value="">All Expertise</option>
                {expertiseAreas.map((exp) => (
                  <option key={exp} value={exp}>
                    {exp}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10" />
              <select
                value={filterRoleType}
                onChange={(e) => setFilterRoleType(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent appearance-none bg-white"
              >
                <option value="">All Roles</option>
                <option value="Lecturer">Lecturer</option>
                <option value="Marker">Marker</option>
                <option value="Both">Both</option>
              </select>
            </div>

            <div className="relative">
              <Circle className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent appearance-none bg-white"
              >
                <option value="">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Industry Only">Industry Only</option>
              </select>
            </div>
          </div>

          {/* Add button and clear filters */}
          <div className="flex items-center justify-between gap-2">
            {(searchTerm ||
              filterExpertise ||
              filterRoleType ||
              filterStatus) && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 text-sm text-primary-blue hover:text-sky-blue transition-colors"
              >
                <X className="w-5 h-5" />
                Clear all filters
              </button>
            )}

            <button
              onClick={openAddDrawer}
              className="ml-auto flex items-center gap-2 px-5 py-3 bg-primary-blue text-white rounded-xl hover:opacity-90 transition-opacity shadow-sm whitespace-nowrap"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">Add Teacher</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>
        </div>
      </div>

      {/* Desktop/Tablet Table View */}
      <div className="hidden md:block bg-white rounded-xl shadow-card border border-light overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-soft sticky top-0">
              <tr>
                <th className="px-6 py-4 text-left text-body">Teacher Name</th>
                <th className="px-6 py-4 text-left text-body">Role</th>
                <th className="px-6 py-4 text-left text-body">Status</th>
                <th className="px-6 py-4 text-left text-body">Phone</th>
                <th className="px-6 py-4 text-left text-body">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTeachers.map((teacher, index) => (
                <tr
                  key={teacher.id}
                  className={`border-t border-light hover:bg-soft transition-colors ${
                    index % 2 === 0 ? "bg-white" : "bg-[#FAFAFA]"
                  }`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-blue rounded-full flex items-center justify-center text-white flex-shrink-0">
                        {teacher.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)}
                      </div>
                      <span className="text-dark">{teacher.name}</span>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    {teacher.roleType === "Lecturer" && (
                      <span className="inline-flex items-center px-3 py-1 bg-green-50 text-green-600 rounded-full text-sm">
                        Lecturer
                      </span>
                    )}
                    {teacher.roleType === "Marker" && (
                      <span className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                        Marker
                      </span>
                    )}
                    {teacher.roleType === "Both" && (
                      <span className="inline-flex items-center px-3 py-1 bg-green-50 text-green-600 rounded-full text-sm">
                        Both
                      </span>
                    )}
                    {!teacher.roleType && (
                      <span className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-sm">
                        Not Set
                      </span>
                    )}
                  </td>

                  <td className="px-6 py-4">
                    {teacher.activeThisTrimester ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-600 rounded-full text-sm">
                        <CheckCircle className="w-4 h-4" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-sm">
                        <XCircle className="w-4 h-4" />
                        Inactive
                      </span>
                    )}
                  </td>

                  <td className="px-6 py-4 text-body">{teacher.phone}</td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewTeacher(teacher)}
                        className="p-2 text-primary-blue hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-5 h-5" />
                      </button>

                      <button
                        onClick={() => openEditDrawer(teacher)}
                        className="p-2 text-sky-blue hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-5 h-5" />
                      </button>

                      <button
                        onClick={() => handleDeleteClick(teacher.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredTeachers.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-body">No teachers found matching your filters</p>
          </div>
        )}
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {filteredTeachers.map((teacher) => (
          <div
            key={teacher.id}
            className="bg-white rounded-xl shadow-card border border-light p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start gap-3 mb-3">
              <div className="w-12 h-12 bg-primary-blue rounded-full flex items-center justify-center text-white flex-shrink-0">
                {teacher.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-dark mb-1 truncate">{teacher.name}</h3>

                {teacher.activeThisTrimester ? (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-600 rounded-full text-xs">
                    <CheckCircle className="w-3 h-3" />
                    Active
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-500 rounded-full text-xs">
                    <XCircle className="w-3 h-3" />
                    Inactive
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-2 mb-3 text-sm">
              <div className="flex items-center gap-2 text-body">
                <Phone className="w-4 h-4 text-primary-blue flex-shrink-0" />
                <span>{teacher.phone}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-3 border-t border-light">
              <button
                onClick={() => handleViewTeacher(teacher)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-primary-blue hover:bg-blue-50 rounded-lg transition-colors text-sm"
              >
                <Eye className="w-4 h-4" />
                View
              </button>

              <button
                onClick={() => openEditDrawer(teacher)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-sky-blue hover:bg-blue-50 rounded-lg transition-colors text-sm"
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>

              <button
                onClick={() => handleDeleteClick(teacher.id)}
                className="flex items-center justify-center px-3 py-2.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {filteredTeachers.length === 0 && (
          <div className="p-12 text-center bg-white rounded-xl shadow-card border border-light">
            <p className="text-body">No teachers found matching your filters</p>
          </div>
        )}
      </div>

      {/* Add/Edit Teacher Drawer */}
      {showAddDrawer && (
        <>
          <div
            className="fixed inset-0 bg-white/30 backdrop-blur-sm z-50"
            onClick={() => setShowAddDrawer(false)}
          />

          <div className="fixed right-0 top-0 h-full w-full sm:w-[500px] lg:w-[600px] bg-white z-50 shadow-2xl overflow-y-auto animate-fade-in">
            <div className="sticky top-0 bg-white border-b border-light px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-primary-blue">
                {isEditMode ? "Edit Teacher" : "Add New Teacher"}
              </h2>

              <button
                onClick={() => setShowAddDrawer(false)}
                className="p-2 hover:bg-soft rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-body" />
              </button>
            </div>

            <form onSubmit={handleSubmitTeacher} className="p-6 space-y-5">
              <div>
                <label className="block text-sm text-body mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, name: e.target.value }))
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                  placeholder="Dr. Jane Smith"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm text-body mb-2">
                    University Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={form.universityEmail}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        universityEmail: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                    placeholder="jane@university.edu"
                  />
                </div>

                <div>
                  <label className="block text-sm text-body mb-2">
                    Personal Email
                  </label>
                  <input
                    type="email"
                    value={form.personalEmail}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, personalEmail: e.target.value }))
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                    placeholder="jane@email.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm text-body mb-2">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={form.phone}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, phone: e.target.value }))
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-body mb-2">
                  Teacher Role Type *
                </label>
                <select
                  required
                  value={form.roleType}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      roleType: e.target.value as any,
                    }))
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                >
                  <option value="">Select Role Type</option>
                  <option value="Lecturer">Lecturer (Teaches Subjects)</option>
                  <option value="Marker">
                    Marker (Paper / Assignment Marker Only)
                  </option>
                  <option value="Both">Both (Lecturer + Marker)</option>
                </select>
                <p className="text-xs text-gray-500 mt-2">
                  Lecturer appears in class timetable, Marker is for grading
                  only, Both does teaching and marking.
                </p>
              </div>

              <div>
                <label className="block text-sm text-body mb-2">
                  Area of Expertise *
                </label>
                <input
                  type="text"
                  required
                  value={form.expertise}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, expertise: e.target.value }))
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                  placeholder="Artificial Intelligence"
                />
              </div>

              <div>
                <label className="block text-sm text-body mb-2">
                  Industry Experience / Currently Working in Industry
                </label>
                <textarea
                  rows={3}
                  value={form.industryExperienceText}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      industryExperienceText: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent resize-none"
                  placeholder="E.g., 5 years at Google as Senior AI Engineer..."
                />
              </div>

              <div>
                <label className="block text-sm text-body mb-2">
                  Industry Field / Specialisation
                </label>
                <input
                  type="text"
                  value={form.industryField}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, industryField: e.target.value }))
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                  placeholder="E.g., AI, Cloud, Cybersecurity"
                />
              </div>

              <div className="flex flex-col gap-3 p-4 bg-soft rounded-xl">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.active}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, active: e.target.checked }))
                    }
                    className="w-5 h-5 text-primary-blue rounded focus:ring-primary-blue border-gray-300"
                  />
                  <span className="text-body">Active This Trimester</span>
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 bg-primary-blue text-white rounded-xl hover:opacity-90 transition-opacity shadow-sm disabled:opacity-60"
                >
                  {submitting
                    ? "Saving..."
                    : isEditMode
                      ? "Update Teacher"
                      : "Add Teacher"}
                </button>

                <button
                  type="button"
                  onClick={() => setShowAddDrawer(false)}
                  className="flex-1 py-3 bg-gray-100 text-body rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* View Teacher Modal (Subjects & schedule removed) */}
      {showViewModal && selectedTeacher && (
        <>
          <div
            className="fixed inset-0 bg-white/30 backdrop-blur-sm z-50"
            onClick={() => setShowViewModal(false)}
          />

          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-3xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="border-b border-light px-6 py-4 flex items-center justify-between sticky top-0 bg-white z-10">
                <h2 className="text-primary-blue">Teacher Details</h2>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="p-2 hover:bg-soft rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-body" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="flex items-start gap-4 pb-6 border-b border-light">
                  <div className="w-20 h-20 bg-primary-blue rounded-full flex items-center justify-center text-white text-2xl flex-shrink-0">
                    {selectedTeacher.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)}
                  </div>

                  <div className="flex-1">
                    <h3 className="text-dark mb-1">{selectedTeacher.name}</h3>

                    {selectedTeacher.roleType && (
                      <p className="text-sm text-gray-500 mb-3">
                        Role:{" "}
                        <span className="font-medium">
                          {selectedTeacher.roleType}
                        </span>
                      </p>
                    )}

                    <div className="mt-2">
                      {selectedTeacher.activeThisTrimester ? (
                        <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-green-50 text-green-600 rounded-full text-sm">
                          <CheckCircle className="w-4 h-4" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-100 text-gray-500 rounded-full text-sm">
                          <XCircle className="w-4 h-4" />
                          Inactive
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Contact */}
                <div>
                  <h4 className="text-dark mb-3 flex items-center gap-2">
                    <Mail className="w-5 h-5 text-primary-blue" />
                    Contact Information
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-soft rounded-xl border border-light">
                      <label className="text-xs text-body mb-1 block">
                        University Email
                      </label>
                      <p className="text-dark">
                        {selectedTeacher.universityEmail}
                      </p>
                    </div>

                    <div className="p-4 bg-soft rounded-xl border border-light">
                      <label className="text-xs text-body mb-1 block">
                        Personal Email
                      </label>
                      <p className="text-dark">
                        {selectedTeacher.personalEmail}
                      </p>
                    </div>

                    <div className="p-4 bg-soft rounded-xl border border-light">
                      <label className="text-xs text-body mb-1 block">
                        Phone Number
                      </label>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-primary-blue" />
                        <p className="text-dark">{selectedTeacher.phone}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Industry */}
                {selectedTeacher.currentlyInIndustry && (
                  <div>
                    <h4 className="text-dark mb-3 flex items-center gap-2">
                      <Briefcase className="w-5 h-5 text-primary-blue" />
                      Industry Experience
                    </h4>
                    <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                      <p className="text-body mb-2">
                        Currently working in industry.
                      </p>
                      {selectedTeacher.industryField && (
                        <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                          {selectedTeacher.industryField}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Expertise */}
                <div>
                  <h4 className="text-dark mb-3 flex items-center gap-2">
                    <Award className="w-5 h-5 text-primary-blue" />
                    Expertise
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-4 py-2 bg-blue-50 text-primary-blue rounded-full">
                      {selectedTeacher.expertise}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-light">
                  <button
                    onClick={() => {
                      setShowViewModal(false);
                      openEditDrawer(selectedTeacher);
                    }}
                    className="flex-1 px-4 py-3 bg-primary-blue text-white rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                  >
                    <Edit className="w-5 h-5" />
                    Edit Teacher
                  </button>

                  <button
                    onClick={() => {
                      setShowViewModal(false);
                      handleDeleteClick(selectedTeacher.id);
                    }}
                    className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-5 h-5" />
                    Delete Teacher
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <>
          <div
            className="fixed inset-0 bg-white/30 backdrop-blur-sm z-50"
            onClick={() => setShowDeleteConfirm(false)}
          />

          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full shadow-2xl">
              <div className="p-6">
                <h3 className="text-dark mb-2">Confirm Deletion</h3>
                <p className="text-body mb-6">
                  Are you sure you want to delete this teacher? This action
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
