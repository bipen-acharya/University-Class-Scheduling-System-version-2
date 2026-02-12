// Represents a single Teacher object returned by the API
export interface TeacherData {
  id: number;
  full_name: string;
  university_email: string;
  personal_email: string | null;
  phone: string | null;
  department: string | null;
  area_of_expertise: string | null;
  industry_field: string | null;
  currently_working: boolean;
  active_this_trimester: boolean;
  role: string | null;
  status: string | null;
  created_at?: string;
  updated_at?: string;
}

// Response for a single teacher (add/view/edit)
export interface TeacherResponse {
  status: number; // 1 for success
  message: string;
  data: TeacherData;
}

// Response for list of teachers
export interface TeacherListResponse {
  status: number;
  message: string;
  data: TeacherData[];
  count?: number;
  pagination?: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
    from: number;
    to: number;
    path: string;
    links: {
      prev: string | null;
      next: string | null;
    };
  };
}
