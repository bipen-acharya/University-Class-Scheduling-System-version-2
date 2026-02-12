// src/types/timetable.d.ts

export type Day =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";

export type ClassType = "Lecture" | "Tutorial" | "Seminar";

export interface ApiProgramm {
  id: number;
  program_name: string;
  program_code: string;
  department?: string | null;
  level?: string | null;
  duration_years?: number;
  total_semesters?: number;
  status?: "Active" | "Inactive" | string;
  description?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ApiTeacher {
  id: number;
  full_name: string;
  university_email?: string;
  personal_email?: string;
  phone?: string;
  department?: string | null;
  area_of_expertise?: string | null;
  industry_field?: string | null;
  currently_working?: boolean;
  active_this_trimester?: boolean;
  role?: string | null;
  status?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ApiSubject {
  id: number;
  subject_code: string;
  subject_name: string;
  credit_hour?: number;
  department?: string | null;
  level?: string | null;
  trimester?: string | null;
  status?: string | null;
  created_at?: string;
  updated_at?: string;

  // optional scenario: subject endpoint ले teachers पनि पठाउन सक्छ
  teachers?: ApiTeacher[];
}

export interface ApiRoom {
  id: number;
  room_name: string;
  room_type?: string | null;
  department?: string | null;
  capacity: number;
  availability?: "available" | "occupied" | string;
  created_at?: string;
  updated_at?: string;
}

export interface ApiTimeTableSession {
  id: number;
  trimister_id: number;
  programm_id: number;
  subject_id: number;
  teacher_id: number;
  room_id: number;

  day: Day;
  date: string | null;

  start_time: string; // "09:00"
  end_time: string; // "11:00"

  class_type: ClassType;
  enrolled_students: number | null;

  programm?: ApiProgramm;
  subject?: ApiSubject;
  teacher?: ApiTeacher;
  room?: ApiRoom;

  created_at?: string;
  updated_at?: string;
}

export interface ApiListResponse<T> {
  status: number;
  message: string;
  data: T[];
  count?: number;
  pagination?: any;
}

export interface ApiSingleResponse<T> {
  status: number;
  message: string;
  data: T;
}

export type ApiTrimesterStatus = "active" | "inactive";

export type ApiTrimester = {
  id: number;
  name: string;

  start_date: string;
  end_date: string;

  break_start_date?: string | null;
  break_end_date?: string | null;

  status: ApiTrimesterStatus;
};
