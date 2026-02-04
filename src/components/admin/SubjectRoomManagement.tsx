import { useState } from 'react';
import { BookOpen, Building, Plus, Edit, Trash2, X, Users, Search, Eye, CheckCircle, XCircle } from 'lucide-react';
import { mockSubjects, mockRooms, mockTeachers, Subject, Room } from '../../data/mockData';

export default function SubjectRoomManagement() {
  const [activeTab, setActiveTab] = useState<'subjects' | 'rooms'>('subjects');
  const [subjects, setSubjects] = useState<Subject[]>(mockSubjects);
  const [rooms, setRooms] = useState<Room[]>(mockRooms);
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [showViewSubjectModal, setShowViewSubjectModal] = useState(false);
  const [showViewRoomModal, setShowViewRoomModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<any | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<any | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'subject' | 'room', id: string } | null>(null);

  // Teacher assignment state for Add Subject modal
  const [selectedTeachers, setSelectedTeachers] = useState<string[]>([]);
  const [teacherSearchTerm, setTeacherSearchTerm] = useState('');
  const [showTeacherDropdown, setShowTeacherDropdown] = useState(false);

  // Subject filters
  const [subjectSearch, setSubjectSearch] = useState('');
  const [subjectDepartmentFilter, setSubjectDepartmentFilter] = useState('');
  const [subjectLevelFilter, setSubjectLevelFilter] = useState('');
  const [subjectTrimesterFilter, setSubjectTrimesterFilter] = useState('');

  // Room filters
  const [roomSearch, setRoomSearch] = useState('');
  const [roomTypeFilter, setRoomTypeFilter] = useState('');

  const departments = ['Computer Science', 'Data Science', 'Cybersecurity', 'Software Engineering', 'Nursing', 'Business'];
  const levels = ['Diploma', 'Bachelor', 'Master', 'PhD'];
  const trimesters = ['T1', 'T2', 'T3', 'All'];
  const roomTypes = ['Lecture Hall', 'Lab', 'Seminar Room'];

  // Enhanced mock data with additional fields
  const enhancedSubjects = subjects.map(subject => ({
    ...subject,
    level: levels[Math.floor(Math.random() * levels.length)],
    description: 'Comprehensive course covering fundamental concepts and practical applications.',
    trimester: trimesters[Math.floor(Math.random() * 3)],
    assignedRooms: ['Room 1.1', 'Lab 2.3']
  }));

  const enhancedRooms = rooms.map(room => ({
    ...room,
    department: departments[Math.floor(Math.random() * departments.length)],
    roomType: roomTypes[Math.floor(Math.random() * roomTypes.length)],
    availabilityStatus: Math.random() > 0.3 ? 'Available' : 'Occupied',
    assignedSubjects: ['CS-101', 'CS-205'],
    timeSlots: ['Monday 8:00-10:00 AM', 'Wednesday 2:00-4:00 PM']
  }));

  const filteredSubjects = enhancedSubjects.filter(subject => {
    const matchesSearch = subject.name.toLowerCase().includes(subjectSearch.toLowerCase()) ||
      subject.code.toLowerCase().includes(subjectSearch.toLowerCase());
    const matchesDepartment = !subjectDepartmentFilter || subject.department === subjectDepartmentFilter;
    const matchesLevel = !subjectLevelFilter || subject.level === subjectLevelFilter;
    const matchesTrimester = !subjectTrimesterFilter || subjectTrimesterFilter === 'All' || subject.trimester === subjectTrimesterFilter;
    return matchesSearch && matchesDepartment && matchesLevel && matchesTrimester;
  });

  const filteredRooms = enhancedRooms.filter(room => {
    const matchesSearch = room.name.toLowerCase().includes(roomSearch.toLowerCase());
    const matchesType = !roomTypeFilter || room.roomType === roomTypeFilter;
    return matchesSearch && matchesType;
  });

  // Filter teachers for dropdown
  const availableTeachers = mockTeachers.filter(t => 
    t.activeThisTrimester && 
    !selectedTeachers.includes(t.id) &&
    (t.name.toLowerCase().includes(teacherSearchTerm.toLowerCase()) || 
     t.universityEmail.toLowerCase().includes(teacherSearchTerm.toLowerCase()))
  );

  const handleAddTeacher = (teacherId: string) => {
    setSelectedTeachers([...selectedTeachers, teacherId]);
    setTeacherSearchTerm('');
    setShowTeacherDropdown(false);
  };

  const handleRemoveTeacher = (teacherId: string) => {
    setSelectedTeachers(selectedTeachers.filter(id => id !== teacherId));
  };

  const handleViewSubject = (subject: any) => {
    setSelectedSubject(subject);
    setShowViewSubjectModal(true);
  };

  const handleViewRoom = (room: any) => {
    setSelectedRoom(room);
    setShowViewRoomModal(true);
  };

  const handleDeleteClick = (type: 'subject' | 'room', id: string) => {
    setDeleteTarget({ type, id });
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      if (deleteTarget.type === 'subject') {
        setSubjects(subjects.filter(s => s.id !== deleteTarget.id));
      } else {
        setRooms(rooms.filter(r => r.id !== deleteTarget.id));
      }
    }
    setShowDeleteConfirm(false);
    setDeleteTarget(null);
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
          onClick={() => setActiveTab('subjects')}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all ${
            activeTab === 'subjects'
              ? 'bg-primary-blue text-white shadow-md'
              : 'text-body hover:bg-soft'
          }`}
        >
          <BookOpen className="w-5 h-5" />
          Subjects
        </button>
        <button
          onClick={() => setActiveTab('rooms')}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all ${
            activeTab === 'rooms'
              ? 'bg-primary-blue text-white shadow-md'
              : 'text-body hover:bg-soft'
          }`}
        >
          <Building className="w-5 h-5" />
          Rooms
        </button>
      </div>

      {/* Subjects Tab */}
      {activeTab === 'subjects' && (
        <div className="space-y-6">
          {/* Filters Bar */}
          <div className="bg-white rounded-lg shadow-card p-4 border border-light">
            <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full lg:w-auto">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by code or name..."
                    value={subjectSearch}
                    onChange={(e) => setSubjectSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                  />
                </div>
                
                <select
                  value={subjectDepartmentFilter}
                  onChange={(e) => setSubjectDepartmentFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                >
                  <option value="">All Departments</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>

                <select
                  value={subjectLevelFilter}
                  onChange={(e) => setSubjectLevelFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                >
                  <option value="">All Levels</option>
                  {levels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>

                <select
                  value={subjectTrimesterFilter}
                  onChange={(e) => setSubjectTrimesterFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                >
                  <option value="">All Trimesters</option>
                  {trimesters.map(trimester => (
                    <option key={trimester} value={trimester}>{trimester}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => {
                  setShowSubjectModal(true);
                  setSelectedTeachers([]);
                  setTeacherSearchTerm('');
                }}
                className="flex items-center gap-2 px-4 py-2 bg-primary-blue text-white rounded-lg hover:opacity-90 transition-opacity shadow-sm whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                Add Subject
              </button>
            </div>

            {(subjectSearch || subjectDepartmentFilter || subjectLevelFilter || subjectTrimesterFilter) && (
              <button
                onClick={() => {
                  setSubjectSearch('');
                  setSubjectDepartmentFilter('');
                  setSubjectLevelFilter('');
                  setSubjectTrimesterFilter('');
                }}
                className="flex items-center gap-2 text-sm text-primary-blue hover:text-sky-blue transition-colors mt-3"
              >
                <X className="w-4 h-4" />
                Clear all filters
              </button>
            )}
          </div>

          {/* Subjects Table - Status column removed */}
          <div className="bg-white rounded-lg shadow-card border border-light overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-soft sticky top-0">
                  <tr>
                    <th className="px-6 py-3 text-left text-body">Subject Code</th>
                    <th className="px-6 py-3 text-left text-body">Subject Name</th>
                    <th className="px-6 py-3 text-left text-body">Department</th>
                    <th className="px-6 py-3 text-left text-body">Level</th>
                    <th className="px-6 py-3 text-left text-body">Assigned Teachers</th>
                    <th className="px-6 py-3 text-left text-body">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubjects.map((subject, index) => (
                    <tr 
                      key={subject.id} 
                      className={`border-t border-light hover:bg-soft transition-colors ${
                        index % 2 === 0 ? 'bg-white' : 'bg-[#FAFAFA]'
                      }`}
                    >
                      <td className="px-6 py-4 text-primary-blue">{subject.code}</td>
                      <td className="px-6 py-4 text-dark">{subject.name}</td>
                      <td className="px-6 py-4 text-body">{subject.department}</td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-blue-50 text-primary-blue rounded-full text-sm">
                          {subject.level}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-body">
                        {subject.teacherIds.length} Teacher{subject.teacherIds.length !== 1 ? 's' : ''}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewSubject(subject)}
                            className="p-1.5 text-primary-blue hover:bg-blue-50 rounded transition-colors"
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            className="p-1.5 text-sky-blue hover:bg-blue-50 rounded transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick('subject', subject.id)}
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

            {filteredSubjects.length === 0 && (
              <div className="p-12 text-center">
                <p className="text-body">No subjects found matching your filters</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Rooms Tab */}
      {activeTab === 'rooms' && (
        <div className="space-y-6">
          {/* Filters Bar */}
          <div className="bg-white rounded-lg shadow-card p-4 border border-light">
            <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full lg:w-auto">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
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
                  {roomTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => setShowRoomModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary-blue text-white rounded-lg hover:opacity-90 transition-opacity shadow-sm whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                Add Room
              </button>
            </div>

            {(roomSearch || roomTypeFilter) && (
              <button
                onClick={() => {
                  setRoomSearch('');
                  setRoomTypeFilter('');
                }}
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
                    <th className="px-6 py-3 text-left text-body">Room Number</th>
                    <th className="px-6 py-3 text-left text-body">Capacity</th>
                    <th className="px-6 py-3 text-left text-body">Room Type</th>
                    <th className="px-6 py-3 text-left text-body">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRooms.map((room, index) => (
                    <tr 
                      key={room.id} 
                      className={`border-t border-light hover:bg-soft transition-colors ${
                        index % 2 === 0 ? 'bg-white' : 'bg-[#FAFAFA]'
                      }`}
                    >
                      <td className="px-6 py-4 text-primary-blue">{room.name}</td>
                      <td className="px-6 py-4 text-body">{room.capacity} students</td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-sm">
                          {room.roomType}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewRoom(room)}
                            className="p-1.5 text-primary-blue hover:bg-blue-50 rounded transition-colors"
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            className="p-1.5 text-sky-blue hover:bg-blue-50 rounded transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick('room', room.id)}
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

            {filteredRooms.length === 0 && (
              <div className="p-12 text-center">
                <p className="text-body">No rooms found matching your filters</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* View Subject Modal - Soft frosted overlay, Status removed */}
      {showViewSubjectModal && selectedSubject && (
        <>
          {/* Soft Frosted Backdrop */}
          <div 
            className="fixed inset-0 bg-white/40 backdrop-blur-sm z-50"
            onClick={() => setShowViewSubjectModal(false)}
          />
          
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="border-b border-light px-6 py-4 flex items-center justify-between sticky top-0 bg-white">
                <h2 className="text-primary-blue">Subject Details</h2>
                <button
                  onClick={() => setShowViewSubjectModal(false)}
                  className="p-2 hover:bg-soft rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-body" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <label className="text-sm text-body mb-1 block">Subject Code</label>
                  <p className="text-dark">{selectedSubject.code}</p>
                </div>

                <div>
                  <label className="text-sm text-body mb-1 block">Full Name</label>
                  <p className="text-dark">{selectedSubject.name}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm text-body mb-1 block">Department</label>
                    <p className="text-dark">{selectedSubject.department}</p>
                  </div>
                  <div>
                    <label className="text-sm text-body mb-1 block">Level</label>
                    <p className="text-dark">{selectedSubject.level}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm text-body mb-1 block">Description</label>
                  <p className="text-dark">{selectedSubject.description}</p>
                </div>

                <div>
                  <label className="text-sm text-body mb-1 block">Trimester Availability</label>
                  <p className="text-dark">{selectedSubject.trimester}</p>
                </div>

                <div>
                  <label className="text-sm text-body mb-2 block">Assigned Teachers</label>
                  <div className="space-y-2">
                    {selectedSubject.teacherIds.map((teacherId: string) => {
                      const teacher = mockTeachers.find(t => t.id === teacherId);
                      return teacher ? (
                        <div key={teacherId} className="flex items-center gap-3 p-3 bg-soft rounded-lg border border-light">
                          <Users className="w-4 h-4 text-primary-blue" />
                          <div>
                            <p className="text-dark">{teacher.name}</p>
                            <p className="text-sm text-body">{teacher.department}</p>
                          </div>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>

                <div>
                  <label className="text-sm text-body mb-2 block">Assigned Rooms</label>
                  <div className="flex flex-wrap gap-2">
                    {selectedSubject.assignedRooms.map((room: string, idx: number) => (
                      <span key={idx} className="px-3 py-1 bg-blue-50 text-primary-blue rounded-full text-sm">
                        {room}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* View Room Modal - Soft frosted overlay */}
      {showViewRoomModal && selectedRoom && (
        <>
          {/* Soft Frosted Backdrop */}
          <div 
            className="fixed inset-0 bg-white/40 backdrop-blur-sm z-50"
            onClick={() => setShowViewRoomModal(false)}
          />
          
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="border-b border-light px-6 py-4 flex items-center justify-between sticky top-0 bg-white">
                <h2 className="text-primary-blue">Room Details</h2>
                <button
                  onClick={() => setShowViewRoomModal(false)}
                  className="p-2 hover:bg-soft rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-body" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <label className="text-sm text-body mb-1 block">Room Number</label>
                  <p className="text-dark">{selectedRoom.name}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm text-body mb-1 block">Capacity</label>
                    <p className="text-dark">{selectedRoom.capacity} students</p>
                  </div>
                  <div>
                    <label className="text-sm text-body mb-1 block">Room Type</label>
                    <p className="text-dark">{selectedRoom.roomType}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm text-body mb-2 block">Assigned Subjects</label>
                  <div className="flex flex-wrap gap-2">
                    {selectedRoom.assignedSubjects.map((subject: string, idx: number) => (
                      <span key={idx} className="px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-sm">
                        {subject}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm text-body mb-2 block">Assigned Time Slots</label>
                  <div className="space-y-2">
                    {selectedRoom.timeSlots.map((slot: string, idx: number) => (
                      <div key={idx} className="p-3 bg-soft rounded-lg border border-light text-body">
                        {slot}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Delete Confirmation Modal - Soft frosted overlay */}
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
                  Are you sure you want to delete this {deleteTarget?.type}? This action cannot be undone.
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

      {/* Add Subject Modal - Soft frosted overlay + Chip-based teacher selector */}
      {showSubjectModal && (
        <>
          {/* Soft Frosted Backdrop */}
          <div 
            className="fixed inset-0 bg-white/40 backdrop-blur-sm z-50"
            onClick={() => setShowSubjectModal(false)}
          />
          
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="border-b border-light px-6 py-4 flex items-center justify-between sticky top-0 bg-white z-10">
                <h2 className="text-primary-blue">Add New Subject</h2>
                <button
                  onClick={() => setShowSubjectModal(false)}
                  className="p-2 hover:bg-soft rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-body" />
                </button>
              </div>

              <form className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm text-body mb-2">Subject Code *</label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                      placeholder="CS-101"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-body mb-2">Department *</label>
                    <select
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                    >
                      <option value="">Select Department</option>
                      {departments.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-body mb-2">Subject Name *</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                    placeholder="Introduction to Programming"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm text-body mb-2">Level *</label>
                    <select
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                    >
                      <option value="">Select Level</option>
                      {levels.map(level => (
                        <option key={level} value={level}>{level}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-body mb-2">Trimester *</label>
                    <select
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                    >
                      <option value="">Select Trimester</option>
                      {trimesters.filter(t => t !== 'All').map(trimester => (
                        <option key={trimester} value={trimester}>{trimester}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Chip-based Teacher Selector */}
                <div>
                  <label className="block text-sm text-body mb-2">Assign Teachers</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={teacherSearchTerm}
                      onChange={(e) => {
                        setTeacherSearchTerm(e.target.value);
                        setShowTeacherDropdown(true);
                      }}
                      onFocus={() => setShowTeacherDropdown(true)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                      placeholder="Search teachers by name or email..."
                    />
                    
                    {/* Dropdown */}
                    {showTeacherDropdown && availableTeachers.length > 0 && (
                      <div className="absolute z-10 w-full mt-2 bg-white border border-gray-300 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                        {availableTeachers.map(teacher => (
                          <button
                            key={teacher.id}
                            type="button"
                            onClick={() => handleAddTeacher(teacher.id)}
                            className="w-full text-left px-4 py-3 hover:bg-soft transition-colors border-b border-light last:border-b-0"
                          >
                            <p className="text-dark">{teacher.name}</p>
                            <p className="text-sm text-body">{teacher.department}</p>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Selected Teachers Chips */}
                  {selectedTeachers.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {selectedTeachers.map(teacherId => {
                        const teacher = mockTeachers.find(t => t.id === teacherId);
                        return teacher ? (
                          <div 
                            key={teacherId}
                            className="inline-flex items-center gap-2 px-3 py-2 bg-blue-50 text-primary-blue rounded-full border border-blue-200"
                          >
                            <div>
                              <p className="text-sm">{teacher.name}</p>
                              <p className="text-xs text-body">{teacher.department}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveTeacher(teacherId)}
                              className="hover:bg-blue-100 rounded-full p-1 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : null;
                      })}
                    </div>
                  )}
                  
                  <p className="text-xs text-gray-500 mt-2">
                    Search and add multiple teachers. Click the 'x' to remove.
                  </p>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-primary-blue text-white rounded-xl hover:opacity-90 transition-opacity shadow-sm"
                  >
                    Add Subject
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowSubjectModal(false)}
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

      {/* Add Room Modal - Soft frosted overlay */}
      {showRoomModal && (
        <>
          {/* Soft Frosted Backdrop */}
          <div 
            className="fixed inset-0 bg-white/40 backdrop-blur-sm z-50"
            onClick={() => setShowRoomModal(false)}
          />
          
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-lg w-full shadow-2xl">
              <div className="border-b border-light px-6 py-4 flex items-center justify-between">
                <h2 className="text-primary-blue">Add New Room</h2>
                <button
                  onClick={() => setShowRoomModal(false)}
                  className="p-2 hover:bg-soft rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-body" />
                </button>
              </div>

              <form className="p-6 space-y-6">
                <div>
                  <label className="block text-sm text-body mb-2">Room Name *</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                    placeholder="Room 1.1"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm text-body mb-2">Room Type *</label>
                    <select
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                    >
                      <option value="">Select Type</option>
                      {roomTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-body mb-2">Capacity *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                      placeholder="30"
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-primary-blue text-white rounded-xl hover:opacity-90 transition-opacity shadow-sm"
                  >
                    Add Room
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowRoomModal(false)}
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
    </div>
  );
}