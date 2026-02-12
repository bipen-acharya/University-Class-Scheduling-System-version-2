export type RoomType = "lecture_hall" | "lab" | "seminar_room";

export interface Room {
  id: number;
  room_name: string;

  room_type: RoomType;

  department: string;
  capacity: number;
  availability?: "available" | "occupied";
  created_at?: string;
  updated_at?: string;
}

export interface RoomResponse {
  status: number;
  message: string;
  data: Room;
}

export interface RoomListResponse {
  status: number;
  message: string;
  data: Room[];
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
