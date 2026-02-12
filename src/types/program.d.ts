// src/types/program.d.ts

// Represents a single Program object returned by the API
export interface ProgramData {
  id: number;
  program_name: string;
  program_code: string;
  status: "Active" | "Inactive";
  // Optional fields, can be added later if needed
  department?: string;
  level?: string;
  duration_years?: number;
  total_semesters?: number;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

// Represents the full API response for adding/fetching a program
export interface ProgramResponse {
  status: number; // 1 for success
  message: string;
  data: ProgramData;
}

// GET /programms
export interface ProgramListResponse {
  status: number;
  message: string;
  data: ProgramData[];
  count: number;
  pagination: {
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
