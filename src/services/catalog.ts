// src/services/catalog.ts
import api from "../api/axios";
import {
  ApiListResponse,
  ApiProgramm,
  ApiRoom,
  ApiSubject,
  ApiTeacher,
  ApiTrimester,
} from "../types/timetable";

export const getPrograms = async () => {
  const res = await api.get<ApiListResponse<ApiProgramm>>("/programms");
  return res.data;
};

export const getSubjects = async () => {
  const res = await api.get<ApiListResponse<ApiSubject>>("/subjects");
  return res.data;
};

export const getTeachers = async () => {
  const res = await api.get<ApiListResponse<ApiTeacher>>("/teachers");
  return res.data;
};

export const getRooms = async () => {
  const res = await api.get<ApiListResponse<ApiRoom>>("/rooms");
  return res.data;
};

export const getTrimesters = async () => {
  const res = await api.get<ApiListResponse<ApiTrimester>>("/trimisters");
  return res.data;
};

export const getSubjectsByProgram = async (programmId: number | string) => {
  const res = await api.get<ApiListResponse<ApiSubject>>(
    `/programms/${programmId}/subjects`
  );
  return res.data;
};

export const getTeachersBySubject = async (subjectId: number | string) => {
  const res = await api.get<ApiListResponse<ApiTeacher>>(
    `/subjects/${subjectId}/teachers`
  );
  return res.data;
};
