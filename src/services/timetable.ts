
import api from "../api/axios";
import type { ApiListResponse, ApiTimeTableSession } from "../types/timetable";

export type GetTimeTableSessionsParams = {
  trimister_id?: number;
  programm_id?: number;
  teacher_id?: number;
  subject_id?: number;
  room_id?: number;
  day?: string;
  date?: string; // YYYY-MM-DD
};

export type ExportTimeTablePdfParams = {
  view?: string;
  date?: string;
  trimister_id?: string;
  programm_id?: string;
  teacher_id?: string;
  subject_id?: string;
  room_id?: string;
};

export async function getTimeTableSessions(
  params?: GetTimeTableSessionsParams,
) {
  const res = await api.get<ApiListResponse<ApiTimeTableSession>>(
    "/time-table-sessions",
    {
      params,
    },
  );
  return res.data;
}

export async function createTimeTableSession(payload: any) {
  const res = await api.post("/time-table-sessions", payload);
  return res.data;
}

export async function updateTimeTableSession(id: number, payload: any) {
  const res = await api.put(`/time-table-sessions/${id}`, payload);
  return res.data;
}

export async function deleteTimeTableSession(id: number) {
  const res = await api.delete(`/time-table-sessions/${id}`);
  return res.data;
}

export async function exportTimeTablePdf(params: ExportTimeTablePdfParams) {
  const res = await api.get("/timetable/export-pdf", {
    params,
    responseType: "blob",
  });

  return res;
}