import { GraduationCap, Plus, X, Edit, Trash2, Eye } from "lucide-react";
import api from "../../api/axios";
import { useState, useEffect } from "react";
import {
  ProgramData,
  ProgramResponse,
  ProgramListResponse,
} from "../../types/program";

interface Program {
  id: string;
  name: string;
  level: "Bachelor" | "Master" | "PhD" | "Other";
  status: "Active" | "Inactive";
}

export default function Programs() {
  const [programs, setPrograms] = useState<Program[]>([]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  // Form state
  const [programName, setProgramName] = useState("");
  const [programLevel, setProgramLevel] = useState<
    "Bachelor" | "Master" | "PhD" | "Other"
  >("Bachelor");
  const [programStatus, setProgramStatus] = useState<"Active" | "Inactive">(
    "Active"
  );

  const levels = ["Bachelor", "Master", "PhD", "Other"];

  // Fetch programs from API on mount
  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await api.get<ProgramListResponse>("/programms", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.data.status === 1) {
          const fetchedPrograms: Program[] = res.data.data.map(
            (p: ProgramData) => ({
              id: p.id.toString(),
              name: p.program_name,
              level: (p.level || "Other") as Program["level"],
              status: p.status,
            })
          );

          setPrograms(fetchedPrograms);
        } else {
          alert("Failed to fetch programs: " + res.data.message);
        }
      } catch (error) {
        console.error("Error fetching programs:", error);
        alert("Error fetching programs. Check console for details.");
      }
    };

    fetchPrograms();
  }, []);

  const handleAddProgram = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      program_name: programName,
      level: programLevel,
      status: programStatus,
    };

    try {
      const token = localStorage.getItem("token");

      // If editing, call PUT, else POST
      const res = isEditMode
        ? await api.put<ProgramResponse>(`/programms/${editId}`, payload, {
            headers: { Authorization: `Bearer ${token}` },
          })
        : await api.post<ProgramResponse>("/programms", payload, {
            headers: { Authorization: `Bearer ${token}` },
          });

      if (res.data.status === 1) {
        const p = res.data.data;
        const mappedProgram: Program = {
          id: p.id.toString(),
          name: p.program_name,
          level: (p.level || "Other") as Program["level"],
          status: p.status,
        };

        setPrograms((prev) =>
          isEditMode
            ? prev.map((pr) =>
                pr.id === mappedProgram.id ? mappedProgram : pr
              )
            : [...prev, mappedProgram]
        );

        resetForm();
        setShowAddModal(false);
        setIsEditMode(false);
        setEditId(null);

        alert(
          isEditMode
            ? "Program updated successfully!"
            : "Program added successfully!"
        );
      } else {
        alert(res.data.message);
      }
    } catch (error) {
      console.error("Error saving program:", error);
      alert("Error saving program. Check console.");
    }
  };

  const handleEditProgram = async (program: Program) => {
    try {
      const token = localStorage.getItem("token");

      const res = await api.get<{
        status: number;
        message: string;
        data: ProgramData;
      }>(`/programms/${program.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data.status === 1) {
        const p = res.data.data;

        // Fill form fields
        setProgramName(p.program_name);
        setProgramLevel((p.level || "Other") as Program["level"]);
        setProgramStatus(p.status);

        setEditId(p.id.toString());
        setIsEditMode(true);
        setShowAddModal(true);
      } else {
        alert("Failed to load program for edit.");
      }
    } catch (error) {
      console.error("Error loading program:", error);
      alert("Error loading program. Check console.");
    }
  };

  const resetForm = () => {
    setProgramName("");
    setProgramLevel("Bachelor");
    setProgramStatus("Active");
  };

  const handleViewProgram = (program: Program) => {
    setSelectedProgram(program);
    setShowViewModal(true);
  };

  const handleDeleteClick = (id: string) => {
    setDeleteTarget(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      const token = localStorage.getItem("token");

      const res = await api.delete<{ status: number; message: string }>(
        `/programms/${deleteTarget}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data.status === 1) {
        setPrograms((prev) => prev.filter((p) => p.id !== deleteTarget));
        alert(res.data.message);
      } else {
        alert("Failed to delete program.");
      }
    } catch (error) {
      console.error("Error deleting program:", error);
      alert("Error deleting program. Check console for details.");
    } finally {
      setShowDeleteConfirm(false);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-primary-blue mb-2">Programs</h1>
          <p className="text-body">
            Manage the academic programs your institution offers
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary-blue text-white rounded-xl hover:opacity-90 transition-opacity shadow-md"
        >
          <Plus className="w-4 h-4" />
          Add Program
        </button>
      </div>

      {/* Programs Table */}
      <div className="bg-white rounded-lg shadow-card border border-light overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-soft sticky top-0">
              <tr>
                <th className="px-6 py-3 text-left text-body">Program Name</th>
                <th className="px-6 py-3 text-left text-body">Level / Type</th>
                <th className="px-6 py-3 text-left text-body">Status</th>
                <th className="px-6 py-3 text-left text-body">Actions</th>
              </tr>
            </thead>
            <tbody>
              {programs.map((program, index) => (
                <tr
                  key={program.id}
                  className={`border-t border-light hover:bg-soft transition-colors ${
                    index % 2 === 0 ? "bg-white" : "bg-[#FAFAFA]"
                  }`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary-blue/10 flex items-center justify-center">
                        <GraduationCap className="w-5 h-5 text-primary-blue" />
                      </div>
                      <span className="text-dark">{program.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-blue-50 text-primary-blue rounded-full text-sm">
                      {program.level}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${
                        program.status === "Active"
                          ? "bg-green-50 text-green-600"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {program.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewProgram(program)}
                        className="p-1.5 text-primary-blue hover:bg-blue-50 rounded transition-colors"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEditProgram(program)}
                        className="p-1.5 text-sky-blue hover:bg-blue-50 rounded transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDeleteClick(program.id)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {programs.length === 0 && (
          <div className="p-12 text-center">
            <GraduationCap className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-body">
              No programs found. Add your first program to get started.
            </p>
          </div>
        )}
      </div>

      {/* Program Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-card p-6 border border-light">
          <p className="text-sm text-body mb-2">Total Programs</p>
          <p className="text-3xl text-primary-blue">{programs.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-card p-6 border border-light">
          <p className="text-sm text-body mb-2">Active Programs</p>
          <p className="text-3xl text-green-600">
            {programs.filter((p) => p.status === "Active").length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-card p-6 border border-light">
          <p className="text-sm text-body mb-2">Bachelor Programs</p>
          <p className="text-3xl text-blue-600">
            {programs.filter((p) => p.level === "Bachelor").length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-card p-6 border border-light">
          <p className="text-sm text-body mb-2">Master Programs</p>
          <p className="text-3xl text-purple-600">
            {programs.filter((p) => p.level === "Master").length}
          </p>
        </div>
      </div>

      {/* Add Program Modal */}
      {showAddModal && (
        <>
          {/* Soft Frosted Backdrop */}
          <div
            className="fixed inset-0 bg-white/40 backdrop-blur-sm z-50"
            onClick={() => {
              setShowAddModal(false);
              resetForm();
            }}
          />

          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-lg w-full shadow-2xl">
              <div className="border-b border-light px-6 py-4 flex items-center justify-between">
                <h2 className="text-primary-blue">Add New Program</h2>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  className="p-2 hover:bg-soft rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-body" />
                </button>
              </div>

              <form onSubmit={handleAddProgram} className="p-6 space-y-6">
                <div>
                  <label className="block text-sm text-body mb-2">
                    Program Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={programName}
                    onChange={(e) => setProgramName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                    placeholder="e.g., Bachelor of Computer Science"
                  />
                </div>

                <div>
                  <label className="block text-sm text-body mb-2">
                    Level / Type *
                  </label>
                  <select
                    required
                    value={programLevel}
                    onChange={(e) => setProgramLevel(e.target.value as any)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                  >
                    {levels.map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-body mb-2">Status</label>
                  <select
                    value={programStatus}
                    onChange={(e) => setProgramStatus(e.target.value as any)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-primary-blue text-white rounded-xl hover:opacity-90 transition-opacity shadow-sm"
                  >
                    Save Program
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      resetForm();
                    }}
                    className="flex-1 py-3 bg-gray-100 text-body rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}

      {/* View Program Modal */}
      {showViewModal && selectedProgram && (
        <>
          {/* Soft Frosted Backdrop */}
          <div
            className="fixed inset-0 bg-white/40 backdrop-blur-sm z-50"
            onClick={() => setShowViewModal(false)}
          />

          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-lg w-full shadow-2xl">
              <div className="border-b border-light px-6 py-4 flex items-center justify-between">
                <h2 className="text-primary-blue">Program Details</h2>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="p-2 hover:bg-soft rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-body" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="flex items-center gap-4 pb-4 border-b border-light">
                  <div className="w-16 h-16 rounded-full bg-primary-blue/10 flex items-center justify-center">
                    <GraduationCap className="w-8 h-8 text-primary-blue" />
                  </div>
                  <div>
                    <h3 className="text-dark text-lg">
                      {selectedProgram.name}
                    </h3>
                    <p className="text-body text-sm">Academic Program</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm text-body mb-1 block">
                    Level / Type
                  </label>
                  <p className="text-dark">{selectedProgram.level}</p>
                </div>

                <div>
                  <label className="text-sm text-body mb-1 block">Status</label>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm ${
                      selectedProgram.status === "Active"
                        ? "bg-green-50 text-green-600"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {selectedProgram.status}
                  </span>
                </div>

                <div className="pt-4 border-t border-light">
                  <button
                    onClick={() => setShowViewModal(false)}
                    className="w-full py-3 bg-primary-blue text-white rounded-xl hover:opacity-90 transition-opacity"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <>
          {/* Soft Frosted Backdrop */}
          <div
            className="fixed inset-0 bg-white/40 backdrop-blur-sm z-50"
            onClick={() => setShowDeleteConfirm(false)}
          />

          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full shadow-2xl">
              <div className="p-6">
                <h3 className="text-dark mb-2">Confirm Deletion</h3>
                <p className="text-body mb-6">
                  Are you sure you want to delete this program? This action
                  cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={confirmDelete}
                    className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 px-4 py-3 bg-gray-100 text-body rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
