// src/types/auth.d.ts

// Represents the inner "data" object
export interface LoginData {
  id: number;
  name: string;
  email: string;
  token: string;
  roles: string[];
}

// Represents the full login API response
export interface LoginResponse {
  status: number;      // 1 for success
  message: string;     // e.g., "Success"
  data: LoginData;
}
