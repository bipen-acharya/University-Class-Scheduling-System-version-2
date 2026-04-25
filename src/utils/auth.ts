import api from "../api/axios";

export type UserRole = "SuperAdmin" | "Admin" | "Observer";
export type SafeUserRole = UserRole | "Unknown";

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  roles: string[];
  phone?: string | null;
  status?: string | null;
  created_at?: string;
}

interface MeResponse {
  status: number;
  message: string;
  data: AuthUser;
}

const AUTH_USER_KEY = "auth_user";

const normalizeRole = (value: unknown): UserRole | "" => {
  const role = String(value ?? "").trim().toLowerCase();

  if (role === "superadmin" || role === "super admin" || role === "super_admin") {
    return "SuperAdmin";
  }

  if (role === "admin") return "Admin";
  if (role === "observer") return "Observer";

  return "";
};

export const getStoredAuthUser = (): AuthUser | null => {
  try {
    const raw = localStorage.getItem(AUTH_USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
};

export const setStoredAuthUser = (user: AuthUser | null) => {
  if (!user) {
    localStorage.removeItem(AUTH_USER_KEY);
    return;
  }

  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
};

export const clearStoredAuthUser = () => {
  localStorage.removeItem(AUTH_USER_KEY);
};

export const getCurrentUserRoleFromUser = (user: AuthUser | null): SafeUserRole => {
  if (!user || !Array.isArray(user.roles)) return "Unknown";

  const normalizedRoles = user.roles
    .map((role) => normalizeRole(role))
    .filter(Boolean) as UserRole[];

  if (normalizedRoles.includes("SuperAdmin")) return "SuperAdmin";
  if (normalizedRoles.includes("Admin")) return "Admin";
  if (normalizedRoles.includes("Observer")) return "Observer";

  return "Unknown";
};

export const getStoredCurrentUserRole = (): SafeUserRole => {
  const user = getStoredAuthUser();
  return getCurrentUserRoleFromUser(user);
};

export const fetchMe = async (): Promise<AuthUser | null> => {
  try {
    const res = await api.get<MeResponse>("/me");

    if (res.data?.status === 1 && res.data?.data) {
      setStoredAuthUser(res.data.data);
      return res.data.data;
    }

    return null;
  } catch {
    return null;
  }
};

export const getMe = async (forceRefresh = false): Promise<AuthUser | null> => {
  const stored = getStoredAuthUser();

  if (!forceRefresh && stored) {
    return stored;
  }

  return await fetchMe();
};

export const getCurrentUserRole = async (forceRefresh = false): Promise<SafeUserRole> => {
  const user = await getMe(forceRefresh);
  return getCurrentUserRoleFromUser(user);
};

export const isObserver = async (forceRefresh = false): Promise<boolean> => {
  const role = await getCurrentUserRole(forceRefresh);
  return role === "Observer";
};

export const isAdmin = async (forceRefresh = false): Promise<boolean> => {
  const role = await getCurrentUserRole(forceRefresh);
  return role === "Admin";
};

export const isSuperAdmin = async (forceRefresh = false): Promise<boolean> => {
  const role = await getCurrentUserRole(forceRefresh);
  return role === "SuperAdmin";
};

export const canCreate = async (forceRefresh = false): Promise<boolean> => {
  const role = await getCurrentUserRole(forceRefresh);
  return role === "SuperAdmin" || role === "Admin";
};

export const canEdit = async (forceRefresh = false): Promise<boolean> => {
  const role = await getCurrentUserRole(forceRefresh);
  return role === "SuperAdmin" || role === "Admin";
};

export const canDelete = async (forceRefresh = false): Promise<boolean> => {
  const role = await getCurrentUserRole(forceRefresh);
  return role === "SuperAdmin" || role === "Admin";
};

export const getAllowedAssignableRoles = async (
  forceRefresh = false,
): Promise<UserRole[]> => {
  const role = await getCurrentUserRole(forceRefresh);

  if (role === "SuperAdmin") return ["SuperAdmin", "Admin", "Observer"];
  if (role === "Admin") return ["Admin", "Observer"];
  return [];
};