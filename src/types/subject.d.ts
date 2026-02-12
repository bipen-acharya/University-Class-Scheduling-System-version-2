export interface Teacher {
  id: number;
  full_name: string;
  university_email: string;
  department: string | null;
}
export interface Program {
  id: number;
  program_name: string;
  program_code: string;
  level?: string | null;
}

export interface SubjectData {
  id: number;
  subject_code: string;
  subject_name: string;
  credit_hour: number;
  department: string;
  level: string;
  trimester: string;
  programm_id: number;
  programm?: Program;
  teachers: Teacher[];
  created_at?: string;
  updated_at?: string;
}

export interface SubjectResponse {
  status: number;
  message: string;
  data: SubjectData;
}

export interface SubjectListResponse {
  status: number;
  message: string;
  data: SubjectData[];
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
