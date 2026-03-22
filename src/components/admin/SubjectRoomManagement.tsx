import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  Building,
  Plus,
  Edit,
  Trash2,
  X,
  Users,
  Search,
  Eye,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import api from "../../api/axios";
import { toast } from "sonner";
import {
  SubjectData,
  SubjectListResponse,
  Teacher,
  Program,
} from "../../types/subject";
import { Room, RoomListResponse, RoomType } from "../../types/room";

type Tab = "subjects" | "rooms";
type DeleteTarget = { type: "subject" | "room"; id: number };

type Trimister = {
  id: number;
  name: string;
  start_date?: string;
  end_date?: string;
  status?: "active" | "inactive" | string;
};

type SubjectFormState = {
  subject_code: string;
  subject_name: string;
  credit_hour: number | "";
  programm_id: number | "";
  trimister_id: number | "";
  teacher_ids: number[];
};

type RoomFormState = {
  room_name: string;
  room_type: "" | RoomType;
  capacity: number | "";
  availability: "" | "available" | "occupied";
};

const initialSubjectForm: SubjectFormState = {
  subject_code: "",
  subject_name: "",
  credit_hour: "",
  programm_id: "",
  trimister_id: "",
  teacher_ids: [],
};

const initialRoomForm: RoomFormState = {
  room_name: "",
  room_type: "",
  capacity: "",
  availability: "",
};

const PAGE_SIZE = 10;

// Reusable pagination bar — shows whenever totalItems > 0, uses safePage
function PaginationBar({
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
  label,
}: {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  label: string;
}) {
  const safePage = Math.min(currentPage, totalPages);
  const fromItem = totalItems === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const toItem   = Math.min(safePage * PAGE_SIZE, totalItems);

  const pageNumbers = useMemo(() => {
    const range: number[] = [];
    for (let i = Math.max(1, safePage - 2); i <= Math.min(totalPages, safePage + 2); i++) range.push(i);
    return range;
  }, [safePage, totalPages]);

  if (totalItems === 0) return null;

  return (
    <div className="border-t border-light px-6 py-3 flex items-center justify-between flex-wrap gap-3">
      <p className="text-sm text-body">
        Showing <span className="font-medium text-dark">{fromItem}–{toItem}</span> of{" "}
        <span className="font-medium text-dark">{totalItems}</span> {label}
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(Math.max(1, safePage - 1))}
          disabled={safePage === 1}
          className="p-1.5 rounded-lg border border-light text-body hover:bg-soft active:bg-soft/80 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        {pageNumbers[0] > 1 && (<>
          <button onClick={() => onPageChange(1)} className="w-8 h-8 rounded-lg border border-light text-sm text-body hover:bg-soft cursor-pointer">1</button>
          {pageNumbers[0] > 2 && <span className="px-1 text-body text-sm">…</span>}
        </>)}
        {pageNumbers.map((page) => (
          <button key={page} onClick={() => onPageChange(page)}
            className={`w-8 h-8 rounded-lg border text-sm transition-colors cursor-pointer ${
              page === safePage ? "bg-primary-blue text-white border-primary-blue font-medium" : "border-light text-body hover:bg-soft"
            }`}>
            {page}
          </button>
        ))}
        {pageNumbers[pageNumbers.length - 1] < totalPages && (<>
          {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && <span className="px-1 text-body text-sm">…</span>}
          <button onClick={() => onPageChange(totalPages)} className="w-8 h-8 rounded-lg border border-light text-sm text-body hover:bg-soft cursor-pointer">{totalPages}</button>
        </>)}
        <button
          onClick={() => onPageChange(Math.min(totalPages, safePage + 1))}
          disabled={safePage === totalPages}
          className="p-1.5 rounded-lg border border-light text-body hover:bg-soft active:bg-soft/80 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default function SubjectRoomManagement() {
  const [activeTab, setActiveTab] = useState<Tab>("subjects");

  const [programs, setPrograms] = useState<Program[]>([]);
  const [trimisters, setTrimisters] = useState<Trimister[]>([]);
  const [subjects, setSubjects] = useState<SubjectData[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);

  // Pagination state
  const [subjectPage, setSubjectPage] = useState(1);
  const [roomPage, setRoomPage] = useState(1);

  const [loading, setLoading] = useState({
    subjects: false,
    rooms: false,
    teachers: false,
    programs: false,
    trimisters: false,
    subjectSubmit: false,
    roomSubmit: false,
    delete: false,
  });
  const [roomModalError, setRoomModalError] = useState<string>("");
  const [subjectModalError, setSubjectModalError] = useState<string>("");

  const [showViewSubjectModal, setShowViewSubjectModal] = useState(false);
  const [showViewRoomModal, setShowViewRoomModal] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<SubjectData | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);

  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [subjectModalMode, setSubjectModalMode] = useState<"create" | "edit">("create");
  const [roomModalMode, setRoomModalMode] = useState<"create" | "edit">("create");

  const [subjectForm, setSubjectForm] = useState<SubjectFormState>(initialSubjectForm);
  const [roomForm, setRoomForm] = useState<RoomFormState>(initialRoomForm);

  const [teacherSearchTerm, setTeacherSearchTerm] = useState("");
  const [showTeacherDropdown, setShowTeacherDropdown] = useState(false);

  const [subjectSearch, setSubjectSearch] = useState("");
  const [subjectProgramFilter, setSubjectProgramFilter] = useState<number | "">("");
  const [subjectTrimisterFilter, setSubjectTrimisterFilter] = useState<number | "">("");

  const [roomSearch, setRoomSearch] = useState("");
  const [roomTypeFilter, setRoomTypeFilter] = useState("");

  const roomTypes: { label: string; value: RoomType }[] = [
    { label: "Lecture Hall", value: "lecture_hall" },
    { label: "Lab", value: "lab" },
    { label: "Seminar Room", value: "seminar_room" },
  ];

  const token = () => localStorage.getItem("token");

  // Reset pages when filters change
  useEffect(() => { setSubjectPage(1); }, [subjectSearch, subjectProgramFilter, subjectTrimisterFilter]);
  useEffect(() => { setRoomPage(1); }, [roomSearch, roomTypeFilter]);

  // -----------------------------
  // Fetchers
  // -----------------------------
  const fetchTeachers = async () => {
    setLoading((p) => ({ ...p, teachers: true }));
    try {
      const res = await api.get<{ status: number; message: string; data: Teacher[] }>("/teachers", {
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (res.data.status === 1) setTeachers(res.data.data);
      else toast.error(res.data.message || "Failed to fetch teachers.");
    } catch (e) {
      toast.error("Failed to fetch teachers.");
    } finally {
      setLoading((p) => ({ ...p, teachers: false }));
    }
  };

  const fetchSubjects = async () => {
    setLoading((p) => ({ ...p, subjects: true }));
    try {
      const res = await api.get<SubjectListResponse>("/subjects", {
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (res.data.status === 1) setSubjects(res.data.data);
      else toast.error(res.data.message || "Failed to fetch subjects.");
    } catch (e) {
      toast.error("Failed to fetch subjects.");
    } finally {
      setLoading((p) => ({ ...p, subjects: false }));
    }
  };

  const fetchRooms = async () => {
    setLoading((p) => ({ ...p, rooms: true }));
    try {
      const res = await api.get<RoomListResponse>("/rooms", {
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (res.data.status === 1) setRooms(res.data.data);
      else toast.error(res.data.message || "Failed to fetch rooms.");
    } catch (e) {
      toast.error("Failed to fetch rooms.");
    } finally {
      setLoading((p) => ({ ...p, rooms: false }));
    }
  };

  const fetchPrograms = async () => {
    setLoading((p) => ({ ...p, programs: true }));
    try {
      const res = await api.get<{ status: number; message?: string; data: Program[] }>("/programms", {
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (res.data.status === 1) setPrograms(res.data.data);
    } catch (e) {
      console.error("Failed to fetch programs", e);
    } finally {
      setLoading((p) => ({ ...p, programs: false }));
    }
  };

  const fetchTrimisters = async () => {
    setLoading((p) => ({ ...p, trimisters: true }));
    try {
      const res = await api.get<{ status: number; message?: string; data: Trimister[] }>("/trimisters", {
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (res.data.status === 1) setTrimisters(res.data.data);
    } catch (e) {
      console.error("Failed to fetch trimisters", e);
    } finally {
      setLoading((p) => ({ ...p, trimisters: false }));
    }
  };

  useEffect(() => {
    fetchTeachers();
    fetchSubjects();
    fetchRooms();
    fetchPrograms();
    fetchTrimisters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // -----------------------------
  // Modal helpers
  // -----------------------------
  const openCreateSubjectModal = () => {
    setSubjectModalMode("create");
    setSelectedSubject(null);
    setSubjectForm(initialSubjectForm);
    setTeacherSearchTerm("");
    setShowTeacherDropdown(false);
    setSubjectModalError("");
    setShowSubjectModal(true);
  };

  const openEditSubjectModal = (subject: SubjectData) => {
    setSubjectModalMode("edit");
    setSelectedSubject(subject);
    const inferredProgrammId =
      typeof (subject as any).programm_id === "number"
        ? (subject as any).programm_id
        : ((subject as any)?.programm?.id ?? "");
    const inferredTrimisterId =
      typeof (subject as any).trimister_id === "number"
        ? (subject as any).trimister_id
        : ((subject as any)?.trimister?.id ?? "");
    setSubjectForm({
      subject_code: subject.subject_code ?? "",
      subject_name: subject.subject_name ?? "",
      credit_hour: typeof subject.credit_hour === "number" ? subject.credit_hour : "",
      programm_id: inferredProgrammId,
      trimister_id: inferredTrimisterId,
      teacher_ids: (subject.teachers ?? []).map((t) => t.id),
    });
    setTeacherSearchTerm("");
    setShowTeacherDropdown(false);
    setSubjectModalError("");
    setShowSubjectModal(true);
  };

  const openCreateRoomModal = () => {
    setRoomModalMode("create");
    setRoomForm(initialRoomForm);
    setRoomModalError("");
    setShowRoomModal(true);
  };

  const openEditRoomModal = (room: Room) => {
    setRoomModalMode("edit");
    setSelectedRoom(room);
    setRoomForm({
      room_name: room.room_name ?? "",
      room_type: (room.room_type ?? "") as RoomFormState["room_type"],
      capacity: typeof room.capacity === "number" ? room.capacity : "",
      availability:
        room.availability === "available" || room.availability === "occupied"
          ? room.availability
          : "",
    });
    setRoomModalError("");
    setShowRoomModal(true);
  };

  const handleViewSubject = (subject: SubjectData) => {
    setSelectedSubject(subject);
    setShowViewSubjectModal(true);
  };

  const handleViewRoom = (room: Room) => {
    setSelectedRoom(room);
    setShowViewRoomModal(true);
  };

  const handleDeleteClick = (type: "subject" | "room", id: number) => {
    setDeleteTarget({ type, id });
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setLoading((p) => ({ ...p, delete: true }));
    try {
      if (deleteTarget.type === "subject") {
        const res = await api.delete<{ status: number; message: string }>(`/subjects/${deleteTarget.id}`, {
          headers: { Authorization: `Bearer ${token()}` },
        });
        if (res.data.status === 1) { setSubjects((prev) => prev.filter((s) => s.id !== deleteTarget.id)); toast.success(res.data.message || "Subject deleted."); }
        else toast.error(res.data.message || "Failed to delete subject.");
      } else {
        const res = await api.delete<{ status: number; message: string }>(`/rooms/${deleteTarget.id}`, {
          headers: { Authorization: `Bearer ${token()}` },
        });
        if (res.data.status === 1) { setRooms((prev) => prev.filter((r) => r.id !== deleteTarget.id)); toast.success(res.data.message || "Room deleted."); }
        else toast.error(res.data.message || "Failed to delete room.");
      }
    } catch (e) {
      toast.error("Delete failed. Check API endpoint and server logs.");
    } finally {
      setLoading((p) => ({ ...p, delete: false }));
      setShowDeleteConfirm(false);
      setDeleteTarget(null);
    }
  };

  // Teacher dropdown
  const availableTeachers = useMemo(() => {
    const term = teacherSearchTerm.trim().toLowerCase();
    return teachers.filter((t) => {
      if (subjectForm.teacher_ids.includes(t.id)) return false;
      if (!term) return true;
      return (
        t.full_name.toLowerCase().includes(term) ||
        t.university_email.toLowerCase().includes(term)
      );
    });
  }, [teachers, teacherSearchTerm, subjectForm.teacher_ids]);

  const handleAddTeacher = (teacherId: number) => {
    setSubjectForm((prev) => ({ ...prev, teacher_ids: [...prev.teacher_ids, teacherId] }));
    setTeacherSearchTerm("");
    setShowTeacherDropdown(false);
  };

  const handleRemoveTeacher = (teacherId: number) => {
    setSubjectForm((prev) => ({ ...prev, teacher_ids: prev.teacher_ids.filter((id) => id !== teacherId) }));
  };

  const selectedTeacherObjects = useMemo(
    () => subjectForm.teacher_ids.map((id) => teachers.find((t) => t.id === id)).filter(Boolean) as Teacher[],
    [subjectForm.teacher_ids, teachers]
  );

  const getProgramNameForSubject = (subject: SubjectData) => {
    const byRelation = (subject as any)?.programm?.program_name;
    if (byRelation) return byRelation as string;
    const pid = typeof (subject as any).programm_id === "number" ? (subject as any).programm_id : undefined;
    if (!pid) return "N/A";
    return programs.find((p) => p.id === pid)?.program_name || "N/A";
  };

  const getTrimisterNameForSubject = (subject: SubjectData) => {
    const byRelation = (subject as any)?.trimister?.name;
    if (byRelation) return byRelation as string;
    const tid = typeof (subject as any).trimister_id === "number" ? (subject as any).trimister_id : undefined;
    if (!tid) return "N/A";
    return trimisters.find((t) => t.id === tid)?.name || "N/A";
  };

  // -----------------------------
  // Filtered + paginated lists
  // -----------------------------
  const filteredSubjects = useMemo(() => {
    const search = subjectSearch.toLowerCase();
    return subjects.filter((subject) => {
      const matchesSearch =
        subject.subject_name.toLowerCase().includes(search) ||
        subject.subject_code.toLowerCase().includes(search);
      const pid =
        typeof (subject as any).programm_id === "number"
          ? (subject as any).programm_id
          : (subject as any)?.programm?.id;
      const matchesProgram = subjectProgramFilter === "" || pid === subjectProgramFilter;
      const tid =
        typeof (subject as any).trimister_id === "number"
          ? (subject as any).trimister_id
          : (subject as any)?.trimister?.id;
      const matchesTrimister = subjectTrimisterFilter === "" || tid === subjectTrimisterFilter;
      return matchesSearch && matchesProgram && matchesTrimister;
    });
  }, [subjects, subjectSearch, subjectProgramFilter, subjectTrimisterFilter]);

  const filteredRooms = useMemo(() => {
    const search = roomSearch.toLowerCase();
    return rooms.filter((room) => {
      const matchesSearch = room.room_name.toLowerCase().includes(search);
      const matchesType = !roomTypeFilter || room.room_type === roomTypeFilter;
      return matchesSearch && matchesType;
    });
  }, [rooms, roomSearch, roomTypeFilter]);

  // Clamp pages on list change
  const subjectTotalPages = Math.max(1, Math.ceil(filteredSubjects.length / PAGE_SIZE));
  const roomTotalPages = Math.max(1, Math.ceil(filteredRooms.length / PAGE_SIZE));
  useEffect(() => { if (subjectPage > subjectTotalPages) setSubjectPage(subjectTotalPages); }, [subjectTotalPages, subjectPage]);
  useEffect(() => { if (roomPage > roomTotalPages) setRoomPage(roomTotalPages); }, [roomTotalPages, roomPage]);

  const paginatedSubjects = useMemo(() => {
    const start = (subjectPage - 1) * PAGE_SIZE;
    return filteredSubjects.slice(start, start + PAGE_SIZE);
  }, [filteredSubjects, subjectPage]);

  const paginatedRooms = useMemo(() => {
    const start = (roomPage - 1) * PAGE_SIZE;
    return filteredRooms.slice(start, start + PAGE_SIZE);
  }, [filteredRooms, roomPage]);

  // -----------------------------
  // Submit handlers
  // -----------------------------
  const submitSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubjectModalError("");
    setLoading((p) => ({ ...p, subjectSubmit: true }));

    const getErrorMessage = (dataOrErr: any) => {
      const data = dataOrErr?.response?.data ?? dataOrErr;
      if (data?.errors && typeof data.errors === "object") {
        const firstKey = Object.keys(data.errors)[0];
        const firstMsg = data.errors?.[firstKey]?.[0];
        if (firstMsg) return firstMsg;
      }
      return data?.message || dataOrErr?.message || "Something went wrong.";
    };

    try {
      if (
        !subjectForm.subject_code.trim() ||
        !subjectForm.subject_name.trim() ||
        subjectForm.programm_id === "" ||
        subjectForm.trimister_id === "" ||
        subjectForm.credit_hour === "" ||
        Number(subjectForm.credit_hour) <= 0
      ) {
        setSubjectModalError("Please fill all required subject fields correctly.");
        return;
      }

      const payload = {
        subject_code: subjectForm.subject_code.trim(),
        subject_name: subjectForm.subject_name.trim(),
        credit_hour: Number(subjectForm.credit_hour),
        programm_id: Number(subjectForm.programm_id),
        trimister_id: Number(subjectForm.trimister_id),
        teacher_ids: subjectForm.teacher_ids,
      };

      if (subjectModalMode === "create") {
        const res = await api.post<{ status: number; message: string; data?: SubjectData; errors?: Record<string, string[]> }>(
          "/subjects", payload, { headers: { Authorization: `Bearer ${token()}` } }
        );
        if (res.data.status === 1) { await fetchSubjects(); setShowSubjectModal(false); toast.success("Subject added successfully!"); }
        else setSubjectModalError(getErrorMessage(res.data));
      } else {
        if (!selectedSubject) { setSubjectModalError("No subject selected for editing."); return; }
        const res = await api.put<{ status: number; message: string; data?: SubjectData; errors?: Record<string, string[]> }>(
          `/subjects/${selectedSubject.id}`, payload, { headers: { Authorization: `Bearer ${token()}` } }
        );
        if (res.data.status === 1) { await fetchSubjects(); setShowSubjectModal(false); toast.success("Subject updated successfully!"); }
        else setSubjectModalError(getErrorMessage(res.data));
      }
    } catch (err: any) {
      setSubjectModalError(getErrorMessage(err));
    } finally {
      setLoading((p) => ({ ...p, subjectSubmit: false }));
    }
  };

  const submitRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setRoomModalError("");
    setLoading((p) => ({ ...p, roomSubmit: true }));

    try {
      if (!roomForm.room_name.trim() || !roomForm.room_type || roomForm.capacity === "" || Number(roomForm.capacity) <= 0) {
        setRoomModalError("Please fill all required room fields correctly.");
        return;
      }

      const payload = {
        room_name: roomForm.room_name.trim(),
        room_type: roomForm.room_type,
        capacity: Number(roomForm.capacity),
        availability: roomForm.availability?.trim() || undefined,
      };

      if (roomModalMode === "create") {
        const res = await api.post<{ status: number; message: string; data: Room }>(
          "/rooms", payload, { headers: { Authorization: `Bearer ${token()}` } }
        );
        if (res.data.status === 1) { await fetchRooms(); setShowRoomModal(false); toast.success("Room added successfully!"); }
        else setRoomModalError(res.data.message || "Failed to create room.");
      } else {
        if (!selectedRoom) { setRoomModalError("No room selected for editing."); return; }
        const res = await api.put<{ status: number; message: string; data: Room }>(
          `/rooms/${selectedRoom.id}`, payload, { headers: { Authorization: `Bearer ${token()}` } }
        );
        if (res.data.status === 1) { await fetchRooms(); setShowRoomModal(false); toast.success("Room updated successfully!"); }
        else setRoomModalError(res.data.message || "Failed to update room.");
      }
    } catch (err: any) {
      setRoomModalError(err?.response?.data?.message || "Room submit failed. Check API endpoint/payload.");
    } finally {
      setLoading((p) => ({ ...p, roomSubmit: false }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-primary-blue mb-2">Subjects & Rooms</h1>
        <p className="text-body">Manage subjects, courses, and classroom spaces</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 bg-white rounded-lg p-2 shadow-card border border-light w-fit">
        <button
          onClick={() => setActiveTab("subjects")}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all ${
            activeTab === "subjects" ? "bg-primary-blue text-white shadow-md" : "text-body hover:bg-soft"
          }`}
        >
          <BookOpen className="w-5 h-5" />
          Subjects
        </button>
        <button
          onClick={() => setActiveTab("rooms")}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all ${
            activeTab === "rooms" ? "bg-primary-blue text-white shadow-md" : "text-body hover:bg-soft"
          }`}
        >
          <Building className="w-5 h-5" />
          Rooms
        </button>
      </div>

      {/* ── SUBJECTS TAB ── */}
      {activeTab === "subjects" && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="bg-white rounded-lg shadow-card p-4 border border-light">
            <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full lg:w-auto">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by code or name..."
                    value={subjectSearch}
                    onChange={(e) => setSubjectSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                  />
                </div>

                <select
                  value={subjectProgramFilter}
                  onChange={(e) => setSubjectProgramFilter(e.target.value === "" ? "" : Number(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                >
                  <option value="">{loading.programs ? "Loading programs..." : "All Programs"}</option>
                  {programs.map((p) => (
                    <option key={p.id} value={p.id}>{p.program_name} ({p.level})</option>
                  ))}
                </select>

                <select
                  value={subjectTrimisterFilter}
                  onChange={(e) => setSubjectTrimisterFilter(e.target.value === "" ? "" : Number(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                >
                  <option value="">{loading.trimisters ? "Loading trimisters..." : "All Trimisters"}</option>
                  {trimisters.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={openCreateSubjectModal}
                className="flex items-center gap-2 px-4 py-2 bg-primary-blue text-white rounded-xl hover:opacity-90 active:scale-[0.97] active:opacity-80 transition-all duration-150 shadow-sm whitespace-nowrap select-none cursor-pointer text-sm"
              >
                <Plus className="w-4 h-4" />
                Add Subject
              </button>
            </div>

            {(subjectSearch || subjectProgramFilter !== "" || subjectTrimisterFilter !== "") && (
              <button
                onClick={() => { setSubjectSearch(""); setSubjectProgramFilter(""); setSubjectTrimisterFilter(""); }}
                className="flex items-center gap-2 text-sm text-primary-blue hover:text-sky-blue transition-colors mt-3"
              >
                <X className="w-4 h-4" />
                Clear all filters
              </button>
            )}
          </div>

          {/* Subjects Table */}
          <div className="bg-white rounded-lg shadow-card border border-light overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-soft sticky top-0">
                  <tr>
                    <th className="px-6 py-3 text-left text-body font-medium">Subject Code</th>
                    <th className="px-6 py-3 text-left text-body font-medium">Subject Name</th>
                    <th className="px-6 py-3 text-left text-body font-medium">Trimister</th>
                    <th className="px-6 py-3 text-left text-body font-medium">Teachers</th>
                    <th className="px-6 py-3 text-left text-body font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading.subjects ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="border-t border-light">
                        <td className="px-6 py-4"><div className="h-4 w-20 rounded bg-gray-200 animate-pulse" /></td>
                        <td className="px-6 py-4"><div className="h-4 w-40 rounded bg-gray-200 animate-pulse" /></td>
                        <td className="px-6 py-4"><div className="h-6 w-28 rounded-full bg-gray-200 animate-pulse" /></td>
                        <td className="px-6 py-4"><div className="h-4 w-20 rounded bg-gray-200 animate-pulse" /></td>
                        <td className="px-6 py-4">
                          <div className="flex gap-1.5">
                            <div className="w-7 h-7 rounded-lg bg-gray-200 animate-pulse" />
                            <div className="w-7 h-7 rounded-lg bg-gray-200 animate-pulse" />
                            <div className="w-7 h-7 rounded-lg bg-gray-200 animate-pulse" />
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    paginatedSubjects.map((subject, index) => (
                      <tr
                        key={subject.id}
                        className={`border-t border-light hover:bg-soft transition-colors ${
                          index % 2 === 0 ? "bg-white" : "bg-[#FAFAFA]"
                        }`}
                      >
                        <td className="px-6 py-4 text-primary-blue font-medium">{subject.subject_code}</td>
                        <td className="px-6 py-4 text-dark">{subject.subject_name}</td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-blue-50 text-primary-blue rounded-full text-sm">
                            {getTrimisterNameForSubject(subject)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-body text-sm">
                          {subject.teachers?.length ?? 0} Teacher{(subject.teachers?.length ?? 0) !== 1 ? "s" : ""}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleViewSubject(subject)}
                              className="p-1.5 text-primary-blue hover:bg-blue-50 active:bg-blue-100 active:scale-95 rounded-lg transition-all duration-100 cursor-pointer"
                              title="View"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openEditSubjectModal(subject)}
                              className="p-1.5 text-sky-blue hover:bg-blue-50 active:bg-blue-100 active:scale-95 rounded-lg transition-all duration-100 cursor-pointer"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteClick("subject", subject.id)}
                              className="p-1.5 text-red-500 hover:bg-red-50 active:bg-red-100 active:scale-95 rounded-lg transition-all duration-100 cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {!loading.subjects && filteredSubjects.length === 0 && (
              <div className="p-12 text-center">
                <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-body">No subjects found matching your filters</p>
              </div>
            )}

            <PaginationBar
              currentPage={subjectPage}
              totalPages={subjectTotalPages}
              totalItems={filteredSubjects.length}
              onPageChange={setSubjectPage}
              label="subjects"
            />
          </div>
        </div>
      )}

      {/* ── ROOMS TAB ── */}
      {activeTab === "rooms" && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="bg-white rounded-lg shadow-card p-4 border border-light">
            <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full lg:w-auto">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search rooms..."
                    value={roomSearch}
                    onChange={(e) => setRoomSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                  />
                </div>

                <select
                  value={roomTypeFilter}
                  onChange={(e) => setRoomTypeFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                >
                  <option value="">All Room Types</option>
                  {roomTypes.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={openCreateRoomModal}
                className="flex items-center gap-2 px-4 py-2 bg-primary-blue text-white rounded-xl hover:opacity-90 active:scale-[0.97] active:opacity-80 transition-all duration-150 shadow-sm whitespace-nowrap select-none cursor-pointer text-sm"
              >
                <Plus className="w-4 h-4" />
                Add Room
              </button>
            </div>

            {(roomSearch || roomTypeFilter) && (
              <button
                onClick={() => { setRoomSearch(""); setRoomTypeFilter(""); }}
                className="flex items-center gap-2 text-sm text-primary-blue hover:text-sky-blue transition-colors mt-3"
              >
                <X className="w-4 h-4" />
                Clear all filters
              </button>
            )}
          </div>

          {/* Rooms Table */}
          <div className="bg-white rounded-lg shadow-card border border-light overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-soft sticky top-0">
                  <tr>
                    <th className="px-6 py-3 text-left text-body font-medium">Room Name</th>
                    <th className="px-6 py-3 text-left text-body font-medium">Capacity</th>
                    <th className="px-6 py-3 text-left text-body font-medium">Room Type</th>
                    <th className="px-6 py-3 text-left text-body font-medium">Availability</th>
                    <th className="px-6 py-3 text-left text-body font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading.rooms ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="border-t border-light">
                        <td className="px-6 py-4"><div className="h-4 w-28 rounded bg-gray-200 animate-pulse" /></td>
                        <td className="px-6 py-4"><div className="h-4 w-20 rounded bg-gray-200 animate-pulse" /></td>
                        <td className="px-6 py-4"><div className="h-6 w-24 rounded-full bg-gray-200 animate-pulse" /></td>
                        <td className="px-6 py-4"><div className="h-6 w-20 rounded-full bg-gray-200 animate-pulse" /></td>
                        <td className="px-6 py-4">
                          <div className="flex gap-1.5">
                            <div className="w-7 h-7 rounded-lg bg-gray-200 animate-pulse" />
                            <div className="w-7 h-7 rounded-lg bg-gray-200 animate-pulse" />
                            <div className="w-7 h-7 rounded-lg bg-gray-200 animate-pulse" />
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    paginatedRooms.map((room, index) => {
                      const typeLabel = roomTypes.find((t) => t.value === room.room_type)?.label || room.room_type;
                      return (
                        <tr
                          key={room.id}
                          className={`border-t border-light hover:bg-soft transition-colors ${
                            index % 2 === 0 ? "bg-white" : "bg-[#FAFAFA]"
                          }`}
                        >
                          <td className="px-6 py-4 text-primary-blue font-medium">{room.room_name}</td>
                          <td className="px-6 py-4 text-body text-sm">{room.capacity} students</td>
                          <td className="px-6 py-4">
                            <span className="px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-sm">
                              {typeLabel}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {room.availability ? (
                              <span
                                className={`px-3 py-1 rounded-full text-sm ${
                                  room.availability === "available"
                                    ? "bg-green-50 text-green-600"
                                    : "bg-gray-100 text-gray-500"
                                }`}
                              >
                                {room.availability}
                              </span>
                            ) : (
                              <span className="text-body text-sm">—</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleViewRoom(room)}
                                className="p-1.5 text-primary-blue hover:bg-blue-50 active:bg-blue-100 active:scale-95 rounded-lg transition-all duration-100 cursor-pointer"
                                title="View"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => openEditRoomModal(room)}
                                className="p-1.5 text-sky-blue hover:bg-blue-50 active:bg-blue-100 active:scale-95 rounded-lg transition-all duration-100 cursor-pointer"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteClick("room", room.id)}
                                className="p-1.5 text-red-500 hover:bg-red-50 active:bg-red-100 active:scale-95 rounded-lg transition-all duration-100 cursor-pointer"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {!loading.rooms && filteredRooms.length === 0 && (
              <div className="p-12 text-center">
                <Building className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-body">No rooms found matching your filters</p>
              </div>
            )}

            <PaginationBar
              currentPage={roomPage}
              totalPages={roomTotalPages}
              totalItems={filteredRooms.length}
              onPageChange={setRoomPage}
              label="rooms"
            />
          </div>
        </div>
      )}

      {/* VIEW SUBJECT MODAL */}
      {showViewSubjectModal && selectedSubject && (
        <>
          <div className="fixed inset-0 bg-white/40 backdrop-blur-sm z-50" onClick={() => setShowViewSubjectModal(false)} />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="border-b border-light px-6 py-4 flex items-center justify-between sticky top-0 bg-white">
                <h2 className="text-primary-blue">Subject Details</h2>
                <button onClick={() => setShowViewSubjectModal(false)} className="p-2 hover:bg-soft rounded-lg transition-colors">
                  <X className="w-5 h-5 text-body" />
                </button>
              </div>
              <div className="p-6 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="p-4 bg-soft rounded-lg border border-light">
                    <label className="text-xs text-body mb-1 block">Subject Code</label>
                    <p className="text-dark font-medium">{selectedSubject.subject_code}</p>
                  </div>
                  <div className="p-4 bg-soft rounded-lg border border-light">
                    <label className="text-xs text-body mb-1 block">Credit Hour</label>
                    <p className="text-dark font-medium">{selectedSubject.credit_hour}</p>
                  </div>
                </div>
                <div className="p-4 bg-soft rounded-lg border border-light">
                  <label className="text-xs text-body mb-1 block">Subject Name</label>
                  <p className="text-dark">{selectedSubject.subject_name}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="p-4 bg-soft rounded-lg border border-light">
                    <label className="text-xs text-body mb-1 block">Program</label>
                    <p className="text-dark">{getProgramNameForSubject(selectedSubject)}</p>
                  </div>
                  <div className="p-4 bg-soft rounded-lg border border-light">
                    <label className="text-xs text-body mb-1 block">Trimister</label>
                    <p className="text-dark">{getTrimisterNameForSubject(selectedSubject)}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-body mb-2 block">Assigned Teachers</label>
                  <div className="space-y-2">
                    {(selectedSubject.teachers ?? []).length === 0 ? (
                      <p className="text-body text-sm">No teachers assigned.</p>
                    ) : (
                      selectedSubject.teachers.map((t) => (
                        <div key={t.id} className="flex items-center gap-3 p-3 bg-soft rounded-lg border border-light">
                          <Users className="w-4 h-4 text-primary-blue" />
                          <p className="text-dark text-sm">{t.full_name}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* VIEW ROOM MODAL */}
      {showViewRoomModal && selectedRoom && (
        <>
          <div className="fixed inset-0 bg-white/40 backdrop-blur-sm z-50" onClick={() => setShowViewRoomModal(false)} />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-lg w-full shadow-2xl">
              <div className="border-b border-light px-6 py-4 flex items-center justify-between">
                <h2 className="text-primary-blue">Room Details</h2>
                <button onClick={() => setShowViewRoomModal(false)} className="p-2 hover:bg-soft rounded-lg transition-colors">
                  <X className="w-5 h-5 text-body" />
                </button>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-soft rounded-lg border border-light col-span-full">
                  <label className="text-xs text-body mb-1 block">Room Name</label>
                  <p className="text-dark font-medium">{selectedRoom.room_name}</p>
                </div>
                <div className="p-4 bg-soft rounded-lg border border-light">
                  <label className="text-xs text-body mb-1 block">Room Type</label>
                  <p className="text-dark">{roomTypes.find((t) => t.value === selectedRoom.room_type)?.label || selectedRoom.room_type}</p>
                </div>
                <div className="p-4 bg-soft rounded-lg border border-light">
                  <label className="text-xs text-body mb-1 block">Capacity</label>
                  <p className="text-dark">{selectedRoom.capacity} students</p>
                </div>
                <div className="p-4 bg-soft rounded-lg border border-light">
                  <label className="text-xs text-body mb-1 block">Availability</label>
                  <p className="text-dark capitalize">{selectedRoom.availability ?? "N/A"}</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* DELETE CONFIRM */}
      {showDeleteConfirm && (
        <>
          <div className="fixed inset-0 bg-white/40 backdrop-blur-sm z-50" onClick={() => setShowDeleteConfirm(false)} />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full shadow-2xl">
              <div className="p-6">
                <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-6 h-6 text-red-500" />
                </div>
                <h3 className="text-dark font-semibold text-center mb-2">Confirm Deletion</h3>
                <p className="text-body text-sm text-center mb-6">
                  Are you sure you want to delete this {deleteTarget?.type}? This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={confirmDelete}
                    disabled={loading.delete}
                    className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 active:bg-red-700 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-150 font-medium cursor-pointer"
                  >
                    {loading.delete ? (
                      <span className="inline-flex items-center gap-2 justify-center">
                        <Loader2 className="w-4 h-4 animate-spin" />Deleting…
                      </span>
                    ) : "Delete"}
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 px-4 py-3 bg-gray-100 text-body rounded-xl hover:bg-gray-200 active:bg-gray-300 active:scale-[0.98] transition-all duration-150 font-medium cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* SUBJECT ADD/EDIT MODAL */}
      {showSubjectModal && (
        <>
          <div className="fixed inset-0 bg-white/40 backdrop-blur-sm z-50" onClick={() => setShowSubjectModal(false)} />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="border-b border-light px-6 py-4 flex items-center justify-between sticky top-0 bg-white z-10">
                <h2 className="text-primary-blue">
                  {subjectModalMode === "create" ? "Add New Subject" : "Edit Subject"}
                </h2>
                <button onClick={() => setShowSubjectModal(false)} className="p-2 hover:bg-soft rounded-lg transition-colors">
                  <X className="w-5 h-5 text-body" />
                </button>
              </div>

              <form className="p-6 space-y-5" onSubmit={submitSubject}>
                {subjectModalError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 text-sm">{subjectModalError}</div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm text-body mb-2">Subject Code *</label>
                    <input
                      type="text"
                      required
                      value={subjectForm.subject_code}
                      onChange={(e) => setSubjectForm((p) => ({ ...p, subject_code: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                      placeholder="CS-101"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-body mb-2">Credit Hour *</label>
                    <input
                      type="number"
                      min={1}
                      required
                      value={subjectForm.credit_hour}
                      onChange={(e) => setSubjectForm((p) => ({ ...p, credit_hour: e.target.value === "" ? "" : Number(e.target.value) }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                      placeholder="3"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-body mb-2">Subject Name *</label>
                  <input
                    type="text"
                    required
                    value={subjectForm.subject_name}
                    onChange={(e) => setSubjectForm((p) => ({ ...p, subject_name: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                    placeholder="Introduction to Programming"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm text-body mb-2">Program *</label>
                    <select
                      required
                      value={subjectForm.programm_id}
                      onChange={(e) => setSubjectForm((p) => ({ ...p, programm_id: e.target.value === "" ? "" : Number(e.target.value) }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                    >
                      <option value="">{loading.programs ? "Loading..." : "Select Program"}</option>
                      {programs.map((prg) => (
                        <option key={prg.id} value={prg.id}>{prg.program_name}{prg.level ? ` (${prg.level})` : ""}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-body mb-2">Trimister *</label>
                    <select
                      required
                      value={subjectForm.trimister_id}
                      onChange={(e) => setSubjectForm((p) => ({ ...p, trimister_id: e.target.value === "" ? "" : Number(e.target.value) }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                    >
                      <option value="">{loading.trimisters ? "Loading..." : "Select Trimister"}</option>
                      {trimisters.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}{t.start_date && t.end_date ? ` (${t.start_date} → ${t.end_date})` : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-body mb-2">Assign Teachers</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={teacherSearchTerm}
                      onChange={(e) => { setTeacherSearchTerm(e.target.value); setShowTeacherDropdown(true); }}
                      onFocus={() => setShowTeacherDropdown(true)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                      placeholder="Search teachers by name or email..."
                    />
                    {showTeacherDropdown && availableTeachers.length > 0 && (
                      <div className="absolute z-10 w-full mt-2 bg-white border border-gray-300 rounded-xl shadow-lg max-h-56 overflow-y-auto">
                        {availableTeachers.map((t) => (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => handleAddTeacher(t.id)}
                            className="w-full text-left px-4 py-3 hover:bg-soft transition-colors border-b border-light last:border-b-0"
                          >
                            <p className="text-dark text-sm">{t.full_name}</p>
                            <p className="text-xs text-body">{t.university_email}</p>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {selectedTeacherObjects.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {selectedTeacherObjects.map((t) => (
                        <div key={t.id} className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-primary-blue rounded-full border border-blue-200">
                          <p className="text-sm">{t.full_name}</p>
                          <button type="button" onClick={() => handleRemoveTeacher(t.id)} className="hover:bg-blue-100 rounded-full p-0.5 transition-colors">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-2">Search and add multiple teachers. Click × to remove.</p>
                </div>

                <div className="flex gap-4 pt-2">
                  <button
                    type="submit"
                    disabled={loading.subjectSubmit}
                    className="flex-1 py-3 bg-primary-blue text-white rounded-xl hover:opacity-90 active:opacity-80 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-150 font-medium shadow-sm cursor-pointer"
                  >
                    {loading.subjectSubmit ? (
                      <span className="inline-flex items-center gap-2 justify-center">
                        <Loader2 className="w-4 h-4 animate-spin" />Saving…
                      </span>
                    ) : subjectModalMode === "create" ? "Add Subject" : "Update Subject"}
                  </button>
                  <button type="button" onClick={() => setShowSubjectModal(false)} className="flex-1 py-3 bg-gray-100 text-body rounded-xl hover:bg-gray-200 active:bg-gray-300 active:scale-[0.98] transition-all duration-150 font-medium cursor-pointer">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}

      {/* ROOM ADD/EDIT MODAL */}
      {showRoomModal && (
        <>
          <div className="fixed inset-0 bg-white/40 backdrop-blur-sm z-50" onClick={() => setShowRoomModal(false)} />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-lg w-full shadow-2xl">
              <div className="border-b border-light px-6 py-4 flex items-center justify-between">
                <h2 className="text-primary-blue">
                  {roomModalMode === "create" ? "Add New Room" : "Edit Room"}
                </h2>
                <button onClick={() => setShowRoomModal(false)} className="p-2 hover:bg-soft rounded-lg transition-colors">
                  <X className="w-5 h-5 text-body" />
                </button>
              </div>

              <form className="p-6 space-y-5" onSubmit={submitRoom}>
                {roomModalError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 text-sm">{roomModalError}</div>
                )}

                <div>
                  <label className="block text-sm text-body mb-2">Room Name *</label>
                  <input
                    type="text"
                    required
                    value={roomForm.room_name}
                    onChange={(e) => setRoomForm((p) => ({ ...p, room_name: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                    placeholder="Room 1.1"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm text-body mb-2">Room Type *</label>
                    <select
                      required
                      value={roomForm.room_type}
                      onChange={(e) => setRoomForm((p) => ({ ...p, room_type: e.target.value as RoomFormState["room_type"] }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                    >
                      <option value="">Select Type</option>
                      {roomTypes.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-body mb-2">Capacity *</label>
                    <input
                      type="number"
                      min={1}
                      required
                      value={roomForm.capacity}
                      onChange={(e) => setRoomForm((p) => ({ ...p, capacity: e.target.value === "" ? "" : Number(e.target.value) }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                      placeholder="30"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-body mb-2">Availability</label>
                  <select
                    value={roomForm.availability}
                    onChange={(e) => setRoomForm((p) => ({ ...p, availability: e.target.value as RoomFormState["availability"] }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                  >
                    <option value="">Select Availability</option>
                    <option value="available">Available</option>
                    <option value="occupied">Occupied</option>
                  </select>
                </div>

                <div className="flex gap-4 pt-2">
                  <button
                    type="submit"
                    disabled={loading.roomSubmit}
                    className="flex-1 py-3 bg-primary-blue text-white rounded-xl hover:opacity-90 active:opacity-80 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-150 font-medium shadow-sm cursor-pointer"
                  >
                    {loading.roomSubmit ? (
                      <span className="inline-flex items-center gap-2 justify-center">
                        <Loader2 className="w-4 h-4 animate-spin" />Saving…
                      </span>
                    ) : roomModalMode === "create" ? "Add Room" : "Update Room"}
                  </button>
                  <button type="button" onClick={() => setShowRoomModal(false)} className="flex-1 py-3 bg-gray-100 text-body rounded-xl hover:bg-gray-200 active:bg-gray-300 active:scale-[0.98] transition-all duration-150 font-medium cursor-pointer">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
}