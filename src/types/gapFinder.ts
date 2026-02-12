// src/types/gapFinder.ts

import type { Room } from "./room";

export type FinderTab = "classroom" | "seminar" | "weekly";

export type RoomType = "lecture_hall" | "lab" | "seminar_room";
export type ClassType = "Lecture" | "Tutorial" | "Seminar";

export type DayName =
  | "Sunday"
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday";

export interface TimetableSession {
  id: number;
  day: DayName;

  start_time: string; // "09:00"
  end_time: string; // "11:00"

  class_type: ClassType;

  room_id: number;
  room?: Room;

  // optional/nice to have if your backend returns relations
  subject_id?: number;
  subject?: { id: number; subject_name: string; subject_code: string };

  teacher_id?: number;
  teacher?: { id: number; full_name: string };

  program?: string;

  created_at?: string;
  updated_at?: string;
}

export type TimelineSlotType = "gap" | "busy";

export interface TimelineSlot {
  type: TimelineSlotType;
  start: string;
  end: string;
  duration: number; // in hours (e.g. 1.5)
  session?: TimetableSession; // only for busy slots
}

export interface GapStats {
  totalFreeSlots: number;
  longestGap: number;
  firstFreeSlot: string;
  totalOccupiedHours: number;
}
