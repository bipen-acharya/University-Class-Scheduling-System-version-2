import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  Edit,
  Eye,
  Trash2,
  X,
  UserPlus,
  Info,
  Shield,
  Eye as EyeIcon,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import api from "../../api/axios";
import { toast } from "sonner";

/** ========================= Types ========================= */
type ApiUser = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  status: "active" | "inactive" | null;
  created_at?: string;
  roles: string[];
};

type MeResponse = {
  status: number;
  message: string;
  data: {
    id: number;
    name: string;
    email: string;
    roles: string[];
    phone?: string | null;
    status?: string | null;
    created_at?: string;
  };
};

type ApiListResponse = { status: number; message: string; data: ApiUser[] };
type ApiOneResponse = { status: number; message: string; data: ApiUser };

type UiUserRole = "SuperAdmin" | "Admin" | "Observer";

type UiUser = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: UiUserRole;
  status: "Active" | "Inactive";
  createdOn: string;
};

/** ========================= Helpers ========================= */
const token = () => localStorage.getItem("token");

const normalizeRole = (value: unknown): UiUserRole | "" => {
  const role = String(value ?? "").trim().toLowerCase();

  if (role === "superadmin" || role === "super_admin" || role === "super admin") {
    return "SuperAdmin";
  }
  if (role === "admin") return "Admin";
  if (role === "observer") return "Observer";

  return "";
};

const mapRoleFromApi = (roles: string[]): UiUserRole => {
  const normalized = (roles || [])
    .map((r) => normalizeRole(r))
    .filter(Boolean) as UiUserRole[];

  if (normalized.includes("SuperAdmin")) return "SuperAdmin";
  if (normalized.includes("Admin")) return "Admin";
  return "Observer";
};

const mapStatusFromApi = (status: string | null): "Active" | "Inactive" =>
  !status || status.toLowerCase() !== "inactive" ? "Active" : "Inactive";

const mapUserFromApi = (u: ApiUser): UiUser => ({
  id: String(u.id),
  fullName: u.name,
  email: u.email,
  phone: u.phone ?? "",
  role: mapRoleFromApi(u.roles),
  status: mapStatusFromApi(u.status ?? "active"),
  createdOn: u.created_at
    ? u.created_at.split("T")[0]
    : new Date().toISOString().split("T")[0],
});

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

const PAGE_SIZE = 10;

/** ========================= Badges ========================= */
function RoleBadge({ role }: { role: UiUserRole }) {
  if (role === "SuperAdmin") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-medium">
        <Shield className="w-3 h-3" />
        SuperAdmin
      </span>
    );
  }

  if (role === "Admin") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-primary-blue rounded-full text-xs font-medium">
        <Shield className="w-3 h-3" />
        Admin
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-body rounded-full text-xs font-medium">
      <EyeIcon className="w-3 h-3" />
      Observer
    </span>
  );
}

function StatusBadge({ status }: { status: "Active" | "Inactive" }) {
  return status === "Active" ? (
    <span className="inline-flex px-2.5 py-1 bg-green-50 text-green-600 rounded-full text-xs font-medium">
      Active
    </span>
  ) : (
    <span className="inline-flex px-2.5 py-1 bg-gray-100 text-gray-500 rounded-full text-xs font-medium">
      Inactive
    </span>
  );
}

/** ========================= Skeleton row ========================= */
function SkeletonRow() {
  return (
    <tr className="border-t border-light">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gray-200 animate-pulse flex-shrink-0" />
          <div className="space-y-1.5">
            <div className="h-3.5 w-32 rounded bg-gray-200 animate-pulse" />
            <div className="h-3 w-44 rounded bg-gray-200 animate-pulse" />
          </div>
        </div>
      </td>
      <td className="px-6 py-4"><div className="h-4 w-24 rounded bg-gray-200 animate-pulse" /></td>
      <td className="px-6 py-4"><div className="h-5 w-20 rounded-full bg-gray-200 animate-pulse" /></td>
      <td className="px-6 py-4"><div className="h-5 w-16 rounded-full bg-gray-200 animate-pulse" /></td>
      <td className="px-6 py-4"><div className="h-4 w-24 rounded bg-gray-200 animate-pulse" /></td>
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

/** ========================= Component ========================= */
export default function UsersManagement() {
  const [users, setUsers] = useState<UiUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const [currentUserRole, setCurrentUserRole] = useState<UiUserRole | "Unknown">("Unknown");
  const [meLoading, setMeLoading] = useState(true);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [selectedUser, setSelectedUser] = useState<UiUser | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "Observer" as UiUserRole,
    status: "Active" as "Active" | "Inactive",
  });

  const resetForm = () =>
    setFormData({
      fullName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      role: "Observer",
      status: "Active",
    });

  const canManageUsers =
    currentUserRole === "SuperAdmin" || currentUserRole === "Admin";

  const isCurrentUserSuperAdmin = currentUserRole === "SuperAdmin";

  const getAllowedRolesForCurrentUser = (): UiUserRole[] => {
    if (currentUserRole === "SuperAdmin") return ["SuperAdmin", "Admin", "Observer"];
    if (currentUserRole === "Admin") return ["Admin", "Observer"];
    return [];
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterRole, filterStatus]);

  /** Fetch logged in user */
  useEffect(() => {
    const fetchMe = async () => {
      try {
        setMeLoading(true);

        const res = await api.get<MeResponse>("/me", {
          headers: {
            Authorization: `Bearer ${token()}`,
          },
        });

        if (res.data.status === 1) {
          const role = mapRoleFromApi(res.data.data.roles || []);
          setCurrentUserRole(role);
        } else {
          setCurrentUserRole("Unknown");
        }
      } catch (error: any) {
        setCurrentUserRole("Unknown");
        console.error("Failed to fetch /me:", error?.response?.data || error);
      } finally {
        setMeLoading(false);
      }
    };

    if (token()) {
      fetchMe();
    } else {
      setCurrentUserRole("Unknown");
      setMeLoading(false);
    }
  }, []);

  /** Fetch users */
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);

        const res = await api.get<ApiListResponse>("/users", {
          headers: { Authorization: `Bearer ${token()}` },
          params: {
            search: searchTerm || undefined,
            role: filterRole || undefined,
            status:
              filterStatus === "Active"
                ? "active"
                : filterStatus === "Inactive"
                ? "inactive"
                : undefined,
          },
        });

        if (res.data.status === 1) {
          setUsers(res.data.data.map(mapUserFromApi));
        } else {
          toast.error(res.data.message || "Failed to fetch users");
        }
      } catch (e: any) {
        toast.error(e.response?.data?.message || "Error fetching users");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [searchTerm, filterRole, filterStatus]);

  /** Local filter */
  const filteredUsers = useMemo(
    () =>
      users.filter((u) => {
        const matchesSearch =
          u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.email.toLowerCase().includes(searchTerm.toLowerCase());

        return (
          matchesSearch &&
          (!filterRole || u.role === filterRole) &&
          (!filterStatus || u.status === filterStatus)
        );
      }),
    [users, searchTerm, filterRole, filterStatus]
  );

  /** Pagination */
  const totalItems = filteredUsers.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);

  const paginatedUsers = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filteredUsers.slice(start, start + PAGE_SIZE);
  }, [filteredUsers, safePage]);

  const fromItem = totalItems === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const toItem = Math.min(safePage * PAGE_SIZE, totalItems);

  const pageNumbers = useMemo(() => {
    const range: number[] = [];
    for (let i = Math.max(1, safePage - 2); i <= Math.min(totalPages, safePage + 2); i++) {
      range.push(i);
    }
    return range;
  }, [safePage, totalPages]);

  /** Stats */
  const totalCount = users.length;
  const activeCount = users.filter((u) => u.status === "Active").length;
  const superAdminCount = users.filter((u) => u.role === "SuperAdmin").length;
  const adminCount = users.filter((u) => u.role === "Admin").length;
  const observerCount = users.filter((u) => u.role === "Observer").length;

  /** Add */
  const handleAddUser = async () => {
    if (!canManageUsers) {
      toast.error("You are not authorized to add users");
      return;
    }

    const allowedRoles = getAllowedRolesForCurrentUser();

    if (!allowedRoles.includes(formData.role)) {
      toast.error("You are not allowed to create this role");
      return;
    }

    if (!formData.fullName || !formData.email || !formData.phone || !formData.password) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setSaving(true);

      const res = await api.post<ApiOneResponse>(
        "/users",
        {
          name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          password_confirmation: formData.confirmPassword,
          role: formData.role,
          status: formData.status === "Active" ? "active" : "inactive",
        },
        {
          headers: { Authorization: `Bearer ${token()}` },
        }
      );

      if (res.data.status === 1) {
        const created = mapUserFromApi(res.data.data);
        setUsers((prev) => [created, ...prev]);
        setCurrentPage(1);
        toast.success(`${created.fullName} added successfully`);
        setShowAddModal(false);
        resetForm();
      } else {
        toast.error(res.data.message || "Failed to add user");
      }
    } catch (error: any) {
      if (error.response?.status === 422) {
        const errors = error.response.data?.errors;
        toast.error((Object.values(errors ?? {})[0] as string[])?.[0] || "Validation error");
        return;
      }

      toast.error(error.response?.data?.message || "Failed to add user");
    } finally {
      setSaving(false);
    }
  };

  /** Edit */
  const handleEditClick = (user: UiUser) => {
    if (!canManageUsers) {
      toast.error("You are not authorized to edit users");
      return;
    }

    if (user.role === "SuperAdmin" && !isCurrentUserSuperAdmin) {
      toast.error("Only SuperAdmin can edit a SuperAdmin user");
      return;
    }

    setSelectedUser(user);
    setFormData({
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      password: "",
      confirmPassword: "",
      role: user.role,
      status: user.status,
    });
    setShowEditModal(true);
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;

    if (!canManageUsers) {
      toast.error("You are not authorized to update users");
      return;
    }

    if (!formData.fullName || !formData.email || !formData.phone) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (formData.password && formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    const allowedRoles = getAllowedRolesForCurrentUser();

    if (!allowedRoles.includes(formData.role)) {
      toast.error("You are not allowed to assign this role");
      return;
    }

    const payload: any = {
      name: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      role: formData.role,
      status: formData.status === "Active" ? "active" : "inactive",
    };

    if (formData.password) {
      payload.password = formData.password;
      payload.password_confirmation = formData.confirmPassword;
    }

    try {
      setSaving(true);

      const res = await api.put<ApiOneResponse>(`/users/${selectedUser.id}`, payload, {
        headers: { Authorization: `Bearer ${token()}` },
      });

      if (res.data.status === 1) {
        const updated = mapUserFromApi(res.data.data);
        setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
        toast.success(`${updated.fullName} updated successfully`);
        setShowEditModal(false);
        setSelectedUser(null);
        resetForm();
      } else {
        toast.error(res.data.message || "Failed to update user");
      }
    } catch (error: any) {
      if (error.response?.status === 422) {
        const errors = error.response.data?.errors;
        toast.error((Object.values(errors ?? {})[0] as string[])?.[0] || "Validation error");
        return;
      }

      toast.error(error.response?.data?.message || "Failed to update user");
    } finally {
      setSaving(false);
    }
  };

  /** View / Delete */
  const handleViewUser = (u: UiUser) => {
    setSelectedUser(u);
    setShowViewModal(true);
  };

  const handleDeleteClick = (user: UiUser) => {
    if (!canManageUsers) {
      toast.error("You are not authorized to delete users");
      return;
    }

    if (user.role === "SuperAdmin") {
      toast.error("SuperAdmin user cannot be deleted");
      return;
    }

    setDeleteTargetId(user.id);
    setSelectedUser(user);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!deleteTargetId) return;

    try {
      setDeleting(true);

      const res = await api.delete<{ status: number; message: string }>(
        `/users/${deleteTargetId}`,
        { headers: { Authorization: `Bearer ${token()}` } }
      );

      if (res.data.status === 1) {
        const name = users.find((u) => u.id === deleteTargetId)?.fullName ?? "User";

        setUsers((prev) => {
          const updated = prev.filter((u) => u.id !== deleteTargetId);
          const newLast = Math.max(1, Math.ceil(updated.length / PAGE_SIZE));
          if (safePage > newLast) setCurrentPage(newLast);
          return updated;
        });

        toast.success(`${name} deleted successfully`);
      } else {
        toast.error(res.data.message || "Failed to delete user");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete user");
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
      setDeleteTargetId(null);
      setSelectedUser(null);
    }
  };

  /** Shared form fields */
  const renderFormFields = (isEdit: boolean) => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm text-body mb-2">
          Full Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.fullName}
          onChange={(e) => setFormData((p) => ({ ...p, fullName: e.target.value }))}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-shadow"
          placeholder="John Doe"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-body mb-2">
            Email Address <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-shadow"
            placeholder="john.doe@university.edu"
          />
        </div>

        <div>
          <label className="block text-sm text-body mb-2">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-shadow"
            placeholder="+1 (555) 123-4567"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-body mb-2">
            {isEdit ? "Reset Password (optional)" : <>Password <span className="text-red-500">*</span></>}
          </label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData((p) => ({ ...p, password: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-shadow"
            placeholder={isEdit ? "Leave blank to keep" : "••••••••"}
          />
        </div>

        {(!isEdit || formData.password) && (
          <div>
            <label className="block text-sm text-body mb-2">
              {isEdit ? "Confirm New Password" : <>Confirm Password <span className="text-red-500">*</span></>}
            </label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData((p) => ({ ...p, confirmPassword: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-shadow"
              placeholder="••••••••"
            />
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm text-body mb-2">
          Role <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.role}
          onChange={(e) => setFormData((p) => ({ ...p, role: e.target.value as UiUserRole }))}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-shadow cursor-pointer"
        >
          {getAllowedRolesForCurrentUser().map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm text-body mb-2">Status</label>
        <div className="flex gap-3">
          {(["Active", "Inactive"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setFormData((p) => ({ ...p, status: s }))}
              className={`flex-1 py-3 rounded-xl border text-sm font-medium transition-all duration-150 cursor-pointer ${
                formData.status === s
                  ? s === "Active"
                    ? "bg-green-50 border-green-400 text-green-600"
                    : "bg-gray-100 border-gray-400 text-gray-600"
                  : "border-gray-300 text-body hover:bg-soft"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-primary-blue mb-2">Users Management</h1>
          <p className="text-body">Manage system users and access roles</p>
          <p className="text-xs text-gray-500 mt-1">
            Current role: {meLoading ? "Loading..." : currentUserRole}
          </p>
        </div>

        {!meLoading && canManageUsers && (
          <button
            onClick={() => {
              resetForm();
              setShowAddModal(true);
            }}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary-blue text-white rounded-xl hover:opacity-90 active:scale-[0.97] active:opacity-80 transition-all duration-150 shadow-md select-none cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add User
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: "Total Users", value: totalCount, color: "text-primary-blue" },
          { label: "Active Users", value: activeCount, color: "text-green-600" },
          { label: "Super Admins", value: superAdminCount, color: "text-purple-700" },
          { label: "Admins", value: adminCount, color: "text-blue-600" },
          { label: "Observers", value: observerCount, color: "text-purple-600" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-lg shadow-card p-5 border border-light">
            <p className="text-sm text-body mb-1">{label}</p>
            {loading ? (
              <div className="h-9 w-12 rounded bg-gray-200 animate-pulse mt-1" />
            ) : (
              <p className={`text-3xl font-bold ${color}`}>{value}</p>
            )}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl p-4 border border-light shadow-card space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent text-sm"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="flex-1 min-w-[140px] px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue bg-white text-body text-sm cursor-pointer"
            >
              <option value="">All Roles</option>
              <option value="SuperAdmin">SuperAdmin</option>
              <option value="Admin">Admin</option>
              <option value="Observer">Observer</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="flex-1 min-w-[120px] px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue bg-white text-body text-sm cursor-pointer"
            >
              <option value="">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>

            {(searchTerm || filterRole || filterStatus) && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setFilterRole("");
                  setFilterStatus("");
                }}
                className="px-3 py-2.5 border border-gray-300 rounded-xl hover:bg-soft active:bg-soft/80 text-body text-sm flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                Clear
              </button>
            )}
          </div>
        </div>

        <div className="p-3 bg-soft rounded-lg border border-light flex items-start gap-2">
          <Info className="w-4 h-4 text-primary-blue flex-shrink-0 mt-0.5" />
          <p className="text-xs text-body">
            <span className="text-purple-700 font-medium">SuperAdmin</span> — highest access.{" "}
            <span className="text-primary-blue font-medium">Admin</span> — user management and system access.{" "}
            <span className="font-medium text-dark">Observer</span> — read-only access.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-light shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-soft">
              <tr>
                {["User", "Phone", "Role", "Status", "Created", "Actions"].map((h) => (
                  <th key={h} className="text-left px-6 py-4 text-sm text-body font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                : paginatedUsers.map((user, index) => {
                    const showManageActions =
                      canManageUsers &&
                      (user.role !== "SuperAdmin" || isCurrentUserSuperAdmin);

                    return (
                      <tr
                        key={user.id}
                        className={`border-t border-light hover:bg-soft transition-colors ${
                          index % 2 === 0 ? "bg-white" : "bg-[#FAFAFA]"
                        }`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-primary-blue text-white flex items-center justify-center text-sm font-semibold flex-shrink-0">
                              {getInitials(user.fullName)}
                            </div>
                            <div>
                              <p className="text-dark font-medium text-sm">{user.fullName}</p>
                              <p className="text-xs text-body">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-body">{user.phone || "—"}</td>
                        <td className="px-6 py-4"><RoleBadge role={user.role} /></td>
                        <td className="px-6 py-4"><StatusBadge status={user.status} /></td>
                        <td className="px-6 py-4 text-sm text-body">
                          {new Date(user.createdOn).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleViewUser(user)}
                              title="View"
                              className="p-1.5 text-primary-blue hover:bg-blue-50 active:bg-blue-100 active:scale-95 rounded-lg transition-all duration-100 cursor-pointer"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {showManageActions && (
                              <>
                                <button
                                  onClick={() => handleEditClick(user)}
                                  title="Edit"
                                  className="p-1.5 text-sky-blue hover:bg-blue-50 active:bg-blue-100 active:scale-95 rounded-lg transition-all duration-100 cursor-pointer"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>

                                {user.role !== "SuperAdmin" && (
                                  <button
                                    onClick={() => handleDeleteClick(user)}
                                    title="Delete"
                                    className="p-1.5 text-red-500 hover:bg-red-50 active:bg-red-100 active:scale-95 rounded-lg transition-all duration-100 cursor-pointer"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
            </tbody>
          </table>
        </div>

        {!loading && filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <UserPlus className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-body">No users found</p>
          </div>
        )}

        {!loading && totalItems > 0 && (
          <div className="border-t border-light px-6 py-3 flex items-center justify-between flex-wrap gap-3">
            <p className="text-sm text-body">
              Showing <span className="font-medium text-dark">{fromItem}–{toItem}</span> of{" "}
              <span className="font-medium text-dark">{totalItems}</span> users
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
                  {pageNumbers[0] > 2 && <span className="px-1 text-body text-sm">…</span>}
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

      {showAddModal && canManageUsers && (
        <>
          <div className="fixed inset-0 bg-white/40 backdrop-blur-sm z-50" onClick={() => setShowAddModal(false)} />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="border-b border-light px-6 py-4 flex items-center justify-between sticky top-0 bg-white z-10">
                <h2 className="text-primary-blue">Add New User</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 hover:bg-soft active:bg-soft/80 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5 text-body" />
                </button>
              </div>

              <div className="p-6">{renderFormFields(false)}</div>

              <div className="border-t border-light px-6 py-4 flex gap-3">
                <button
                  onClick={handleAddUser}
                  disabled={saving}
                  className="flex-1 py-3 bg-primary-blue text-white rounded-xl hover:opacity-90 active:opacity-80 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-150 font-medium shadow-sm cursor-pointer"
                >
                  {saving ? (
                    <span className="inline-flex items-center gap-2 justify-center">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving…
                    </span>
                  ) : (
                    "Create User"
                  )}
                </button>

                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 bg-gray-100 text-body rounded-xl hover:bg-gray-200 active:bg-gray-300 active:scale-[0.98] transition-all duration-150 font-medium cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {showEditModal && selectedUser && (
        <>
          <div className="fixed inset-0 bg-white/40 backdrop-blur-sm z-50" onClick={() => setShowEditModal(false)} />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="border-b border-light px-6 py-4 flex items-center justify-between sticky top-0 bg-white z-10">
                <h2 className="text-primary-blue">Edit User</h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-2 hover:bg-soft active:bg-soft/80 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5 text-body" />
                </button>
              </div>

              <div className="p-6">{renderFormFields(true)}</div>

              <div className="border-t border-light px-6 py-4 flex gap-3">
                <button
                  onClick={handleUpdateUser}
                  disabled={saving}
                  className="flex-1 py-3 bg-primary-blue text-white rounded-xl hover:opacity-90 active:opacity-80 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-150 font-medium shadow-sm cursor-pointer"
                >
                  {saving ? (
                    <span className="inline-flex items-center gap-2 justify-center">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving…
                    </span>
                  ) : (
                    "Update User"
                  )}
                </button>

                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 py-3 bg-gray-100 text-body rounded-xl hover:bg-gray-200 active:bg-gray-300 active:scale-[0.98] transition-all duration-150 font-medium cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {showViewModal && selectedUser && (
        <>
          <div className="fixed inset-0 bg-white/40 backdrop-blur-sm z-50" onClick={() => setShowViewModal(false)} />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
              <div className="px-6 py-4 border-b border-light flex items-center justify-between">
                <h2 className="text-primary-blue">User Details</h2>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="p-2 hover:bg-soft rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5 text-body" />
                </button>
              </div>

              <div className="p-6 space-y-5">
                <div className="flex items-center gap-4 pb-5 border-b border-light">
                  <div className="w-14 h-14 rounded-full bg-primary-blue text-white flex items-center justify-center text-lg font-semibold flex-shrink-0">
                    {getInitials(selectedUser.fullName)}
                  </div>
                  <div>
                    <p className="text-dark font-semibold text-lg">{selectedUser.fullName}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <RoleBadge role={selectedUser.role} />
                      <StatusBadge status={selectedUser.status} />
                    </div>
                  </div>
                </div>

                <div className="grid gap-3">
                  {[
                    { label: "Email", value: selectedUser.email },
                    { label: "Phone", value: selectedUser.phone || "—" },
                    {
                      label: "Created On",
                      value: new Date(selectedUser.createdOn).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }),
                    },
                  ].map(({ label, value }) => (
                    <div key={label} className="p-3 bg-soft rounded-lg border border-light">
                      <p className="text-xs text-body mb-1">{label}</p>
                      <p className="text-dark text-sm">{value}</p>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3 pt-2">
                  {canManageUsers &&
                    (selectedUser.role !== "SuperAdmin" || isCurrentUserSuperAdmin) && (
                      <button
                        onClick={() => {
                          setShowViewModal(false);
                          handleEditClick(selectedUser);
                        }}
                        className="flex-1 py-3 bg-primary-blue text-white rounded-xl hover:opacity-90 active:opacity-80 active:scale-[0.98] transition-all duration-150 flex items-center justify-center gap-2 text-sm font-medium cursor-pointer"
                      >
                        <Edit className="w-4 h-4" />
                        Edit User
                      </button>
                    )}

                  <button
                    onClick={() => setShowViewModal(false)}
                    className="flex-1 py-3 bg-gray-100 text-body rounded-xl hover:bg-gray-200 active:bg-gray-300 active:scale-[0.98] transition-all duration-150 text-sm font-medium cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {showDeleteConfirm && (
        <>
          <div className="fixed inset-0 bg-white/40 backdrop-blur-sm z-50" onClick={() => setShowDeleteConfirm(false)} />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
              <div className="p-6">
                <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-6 h-6 text-red-500" />
                </div>

                <h3 className="text-dark font-semibold text-center mb-2">Delete User</h3>
                <p className="text-body text-center text-sm mb-6">
                  Are you sure you want to delete this user? This action cannot be undone.
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
    </div>
  );
}