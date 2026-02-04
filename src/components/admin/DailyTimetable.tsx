import { useState, useMemo } from 'react';
import { Calendar, Filter, Plus, X, Download, Eye, Edit, Trash2, ZoomIn, ZoomOut, Users } from 'lucide-react';
import { 
  mockClasses, 
  mockSubjects, 
  mockTeachers, 
  mockRooms, 
  isClassRunning,
  ClassSession,
  todayDay
} from '../../data/mockData';

// Extended ClassSession with program and type
interface ExtendedClassSession extends ClassSession {
  program?: string;
  classType?: 'Lecture' | 'Tutorial' | 'Lab' | 'Workshop';
  enrolledStudents?: number;
}

// Program colors with extended program list
const programColors = {
  'ICT': { bg: 'bg-blue-500', hover: 'hover:bg-blue-600', light: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  'Nursing': { bg: 'bg-pink-500', hover: 'hover:bg-pink-600', light: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200' },
  'Business': { bg: 'bg-yellow-500', hover: 'hover:bg-yellow-600', light: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
  'Engineering': { bg: 'bg-green-500', hover: 'hover:bg-green-600', light: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  'Psychology': { bg: 'bg-purple-500', hover: 'hover:bg-purple-600', light: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  'Masters of ICT': { bg: 'bg-indigo-600', hover: 'hover:bg-indigo-700', light: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  'Bachelor of ICT': { bg: 'bg-cyan-500', hover: 'hover:bg-cyan-600', light: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200' },
  'Bachelor of Nursing': { bg: 'bg-rose-500', hover: 'hover:bg-rose-600', light: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
};

// Sample extended classes for multi-program view
const generateExtendedClasses = (): ExtendedClassSession[] => {
  const programs = ['ICT', 'Nursing', 'Business', 'Engineering', 'Psychology', 'Masters of ICT', 'Bachelor of ICT', 'Bachelor of Nursing'];
  const classTypes: ('Lecture' | 'Tutorial' | 'Lab' | 'Workshop')[] = ['Lecture', 'Tutorial', 'Lab', 'Workshop'];
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const levels = ['Bachelor', 'Master', 'PhD'];
  
  const extendedClasses: ExtendedClassSession[] = [];
  let idCounter = 1;

  days.forEach((day, dayIndex) => {
    const isWeekend = day === 'Saturday' || day === 'Sunday';
    const programsForDay = isWeekend ? programs.slice(0, 3) : programs; // Fewer classes on weekends
    
    programsForDay.forEach((program, programIndex) => {
      // Morning class (9-11 AM) - most days
      if (!isWeekend || Math.random() > 0.5) {
        extendedClasses.push({
          id: `ec${idCounter++}`,
          day: day,
          date: `2024-03-${dayIndex + 10}`,
          startTime: '09:00',
          endTime: '11:00',
          subjectId: mockSubjects[programIndex % mockSubjects.length].id,
          teacherId: mockTeachers[programIndex % mockTeachers.length].id,
          roomId: mockRooms[programIndex % mockRooms.length].id,
          level: levels[programIndex % levels.length],
          program: program,
          classType: classTypes[0],
          enrolledStudents: Math.floor(Math.random() * 30) + 20
        });
      }

      // Afternoon class (2-4 PM) - not every day
      if (!isWeekend && dayIndex % 2 === programIndex % 2) {
        extendedClasses.push({
          id: `ec${idCounter++}`,
          day: day,
          date: `2024-03-${dayIndex + 10}`,
          startTime: '14:00',
          endTime: '16:00',
          subjectId: mockSubjects[(programIndex + 1) % mockSubjects.length].id,
          teacherId: mockTeachers[(programIndex + 1) % mockTeachers.length].id,
          roomId: mockRooms[(programIndex + 2) % mockRooms.length].id,
          level: levels[(programIndex + 1) % levels.length],
          program: program,
          classType: classTypes[dayIndex % 4],
          enrolledStudents: Math.floor(Math.random() * 30) + 15
        });
      }

      // Late afternoon class (4-6 PM) - sparse
      if (!isWeekend && (dayIndex === 1 || dayIndex === 3)) {
        extendedClasses.push({
          id: `ec${idCounter++}`,
          day: day,
          date: `2024-03-${dayIndex + 10}`,
          startTime: '16:00',
          endTime: '18:00',
          subjectId: mockSubjects[(programIndex + 2) % mockSubjects.length].id,
          teacherId: mockTeachers[(programIndex + 2) % mockTeachers.length].id,
          roomId: mockRooms[(programIndex + 1) % mockRooms.length].id,
          level: levels[(programIndex + 2) % levels.length],
          program: program,
          classType: classTypes[2],
          enrolledStudents: Math.floor(Math.random() * 25) + 10
        });
      }
    });
  });

  return extendedClasses;
};

export default function DailyTimetable() {
  const [viewMode, setViewMode] = useState<'daily' | 'weekly'>('daily');
  const [selectedDay, setSelectedDay] = useState<string>(todayDay);
  const [selectedLevel, setSelectedLevel] = useState<string>('All');
  const [filterTeacher, setFilterTeacher] = useState<string>('');
  const [filterSubject, setFilterSubject] = useState<string>('');
  const [filterRoom, setFilterRoom] = useState<string>('');
  const [selectedPrograms, setSelectedPrograms] = useState<string[]>([]);
  const [showAllPrograms, setShowAllPrograms] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState<ExtendedClassSession | null>(null);
  const [hoveredClass, setHoveredClass] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(100);

  const allClasses = generateExtendedClasses();
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const levels = ['All', 'Bachelor', 'Master', 'PhD'];
  const timeSlots = Array.from({ length: 12 }, (_, i) => {
    const hour = i + 8;
    return `${hour.toString().padStart(2, '0')}:00`;
  });
  const programs = ['ICT', 'Nursing', 'Business', 'Engineering', 'Psychology', 'Masters of ICT', 'Bachelor of ICT', 'Bachelor of Nursing'];

  // Filter rooms by selected level
  const availableRooms = useMemo(() => {
    if (selectedLevel === 'All') return mockRooms;
    return mockRooms.filter(room => room.level === selectedLevel);
  }, [selectedLevel]);

  // Filter classes
  const filteredClasses = useMemo(() => {
    return allClasses.filter(cls => {
      const matchesDay = viewMode === 'weekly' || cls.day === selectedDay;
      const matchesLevel = selectedLevel === 'All' || cls.level === selectedLevel;
      const matchesTeacher = !filterTeacher || cls.teacherId === filterTeacher;
      const matchesSubject = !filterSubject || cls.subjectId === filterSubject;
      const matchesRoom = !filterRoom || cls.roomId === filterRoom;
      const matchesProgram = showAllPrograms || selectedPrograms.includes(cls.program || '');
      
      return matchesDay && matchesLevel && matchesTeacher && matchesSubject && matchesRoom && matchesProgram;
    });
  }, [viewMode, selectedDay, selectedLevel, filterTeacher, filterSubject, filterRoom, showAllPrograms, selectedPrograms, allClasses]);

  const isWeekendDay = (day: string) => day === 'Saturday' || day === 'Sunday';
  const isToday = selectedDay === todayDay;

  // Helper to get classes for a specific time and room (daily view)
  const getClassesForSlot = (time: string, roomId: string) => {
    return filteredClasses.filter(cls => {
      const [classHour] = cls.startTime.split(':').map(Number);
      const [slotHour] = time.split(':').map(Number);
      const [endHour] = cls.endTime.split(':').map(Number);
      
      return cls.roomId === roomId && slotHour >= classHour && slotHour < endHour;
    });
  };

  // Helper to get classes for a specific time and day (weekly view)
  const getClassesForWeeklySlot = (time: string, day: string) => {
    return filteredClasses.filter(cls => {
      const [classHour] = cls.startTime.split(':').map(Number);
      const [slotHour] = time.split(':').map(Number);
      const [endHour] = cls.endTime.split(':').map(Number);
      
      return cls.day === day && slotHour >= classHour && slotHour < endHour;
    });
  };

  // Helper to calculate rowspan
  const getRowSpan = (classSession: ExtendedClassSession) => {
    const [startHour] = classSession.startTime.split(':').map(Number);
    const [endHour] = classSession.endTime.split(':').map(Number);
    return endHour - startHour;
  };

  const clearFilters = () => {
    setFilterTeacher('');
    setFilterSubject('');
    setFilterRoom('');
  };

  const toggleProgram = (program: string) => {
    if (selectedPrograms.includes(program)) {
      setSelectedPrograms(selectedPrograms.filter(p => p !== program));
    } else {
      setSelectedPrograms([...selectedPrograms, program]);
    }
  };

  const handleViewClass = (classSession: ExtendedClassSession) => {
    setSelectedClass(classSession);
    setShowViewModal(true);
  };

  // Calculate statistics
  const stats = useMemo(() => {
    const totalClasses = filteredClasses.length;
    const conflictCount = 0; // Would need conflict detection logic
    const programCounts = programs.map(program => ({
      program,
      count: filteredClasses.filter(c => c.program === program).length
    }));
    const roomsUsed = new Set(filteredClasses.map(c => c.roomId)).size;

    return { totalClasses, conflictCount, programCounts, roomsUsed };
  }, [filteredClasses, programs]);

  const ClassBlock = ({ classSession, compact = false }: { classSession: ExtendedClassSession, compact?: boolean }) => {
    const subject = mockSubjects.find(s => s.id === classSession.subjectId);
    const teacher = mockTeachers.find(t => t.id === classSession.teacherId);
    const room = mockRooms.find(r => r.id === classSession.roomId);
    const isRunning = isClassRunning(classSession);
    const programColor = programColors[classSession.program as keyof typeof programColors] || programColors.ICT;
    const isHovered = hoveredClass === classSession.id;
    const isWeekendClass = isWeekendDay(classSession.day);

    return (
      <div
        className={`rounded-lg p-3 h-full ${programColor.bg} text-white relative transition-all duration-200 ${
          isHovered ? 'scale-105 shadow-lg z-10' : ''
        } ${isRunning ? 'ring-2 ring-white animate-pulse' : ''} ${
          isWeekendClass ? 'opacity-70' : 'opacity-100'
        }`}
        onMouseEnter={() => setHoveredClass(classSession.id)}
        onMouseLeave={() => setHoveredClass(null)}
      >
        {isRunning && (
          <span className="inline-block px-2 py-0.5 bg-white text-xs rounded-full mb-1" style={{ color: '#0AA6A6' }}>
            Now Running
          </span>
        )}
        
        {/* Subject Code */}
        <div className={`${compact ? 'text-xs' : 'text-sm font-medium'} truncate`}>{subject?.code}</div>
        
        {/* Room */}
        <div className="text-xs opacity-90 truncate mt-1">{room?.name}</div>
        
        {/* Teacher Name */}
        <div className="text-xs opacity-90 truncate">{teacher?.name}</div>
        
        {/* Class Type */}
        <div className="text-xs opacity-80 mt-1">
          <span className="px-2 py-0.5 bg-white/20 rounded-full">{classSession.classType}</span>
        </div>
        
        {/* Program Tag */}
        {!compact && (
          <div className="text-xs opacity-90 mt-1 truncate">
            <span className="px-2 py-0.5 bg-white/30 rounded-full">{classSession.program}</span>
          </div>
        )}
        
        {/* Hover Icons */}
        {isHovered && (
          <div className="absolute top-2 right-2 flex gap-1 bg-white/20 backdrop-blur-sm rounded p-1">
            <button 
              className="p-1 hover:bg-white/30 rounded transition-colors" 
              title="View Details"
              onClick={(e) => {
                e.stopPropagation();
                handleViewClass(classSession);
              }}
            >
              <Eye className="w-3 h-3" />
            </button>
            <button 
              className="p-1 hover:bg-white/30 rounded transition-colors" 
              title="Edit"
              onClick={(e) => e.stopPropagation()}
            >
              <Edit className="w-3 h-3" />
            </button>
            <button 
              className="p-1 hover:bg-white/30 rounded transition-colors" 
              title="Delete"
              onClick={(e) => e.stopPropagation()}
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-primary-blue mb-2">Timetable Builder</h1>
          <p className="text-body">View and manage your class schedule</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Zoom Controls */}
          <div className="flex items-center gap-2 bg-white rounded-lg p-2 shadow-card border border-light">
            <button
              onClick={() => setZoomLevel(Math.max(50, zoomLevel - 10))}
              className="p-2 hover:bg-soft rounded transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4 text-body" />
            </button>
            <span className="text-sm text-body px-2">{zoomLevel}%</span>
            <button
              onClick={() => setZoomLevel(Math.min(150, zoomLevel + 10))}
              className="p-2 hover:bg-soft rounded transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4 text-body" />
            </button>
          </div>
          
          <button
            onClick={() => setShowExportModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary-blue text-white rounded-xl hover:opacity-90 transition-opacity shadow-md"
          >
            <Download className="w-4 h-4" />
            Export as PDF
          </button>
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex gap-2 bg-white rounded-lg p-2 shadow-card border border-light w-fit">
        <button
          onClick={() => setViewMode('daily')}
          className={`px-6 py-3 rounded-lg transition-all ${
            viewMode === 'daily'
              ? 'bg-primary-blue text-white shadow-md'
              : 'text-body hover:bg-soft'
          }`}
        >
          Daily View
        </button>
        <button
          onClick={() => setViewMode('weekly')}
          className={`px-6 py-3 rounded-lg transition-all ${
            viewMode === 'weekly'
              ? 'bg-primary-blue text-white shadow-md'
              : 'text-body hover:bg-soft'
          }`}
        >
          Weekly View
        </button>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow-card p-5 border border-light">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-primary-blue" />
          <h2 className="text-dark">Schedule Controls</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {viewMode === 'daily' && (
            <div>
              <label className="block text-sm text-body mb-2">Select Day *</label>
              <select
                value={selectedDay}
                onChange={(e) => setSelectedDay(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue text-sm"
              >
                {days.map(day => (
                  <option key={day} value={day}>
                    {day} {day === todayDay && '(Today)'} {isWeekendDay(day) && '🏖️'}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm text-body mb-2">Select Level</label>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue text-sm"
            >
              {levels.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => setShowAddModal(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-blue text-white rounded-lg hover:opacity-90 transition-opacity shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Add Class
            </button>
          </div>
        </div>
      </div>

      {/* Filters with Programs */}
      <div className="bg-white rounded-lg shadow-card p-5 border border-light">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-primary-blue" />
            <h2 className="text-dark">Filters</h2>
          </div>
          {(filterTeacher || filterSubject || filterRoom || !showAllPrograms) && (
            <button
              onClick={() => {
                clearFilters();
                setShowAllPrograms(true);
                setSelectedPrograms([]);
              }}
              className="flex items-center gap-2 text-sm text-primary-blue hover:text-sky-blue transition-colors"
            >
              <X className="w-4 h-4" />
              Clear all filters
            </button>
          )}
        </div>

        {/* Teacher, Subject, Room Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
          <select
            value={filterTeacher}
            onChange={(e) => setFilterTeacher(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue text-sm"
          >
            <option value="">All Teachers</option>
            {mockTeachers.map(teacher => (
              <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
            ))}
          </select>

          <select
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue text-sm"
          >
            <option value="">All Subjects</option>
            {mockSubjects.map(subject => (
              <option key={subject.id} value={subject.id}>{subject.code} - {subject.name}</option>
            ))}
          </select>

          <select
            value={filterRoom}
            onChange={(e) => setFilterRoom(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue text-sm"
          >
            <option value="">All Rooms</option>
            {mockRooms.map(room => (
              <option key={room.id} value={room.id}>{room.name}</option>
            ))}
          </select>
        </div>

        {/* Program Filter Section */}
        <div className="border-t border-light pt-4">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm text-body">Filter by Programs</label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showAllPrograms}
                onChange={(e) => setShowAllPrograms(e.target.checked)}
                className="w-4 h-4 text-primary-blue rounded focus:ring-primary-blue border-gray-300"
              />
              <span className="text-xs text-body">Show All</span>
            </label>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {programs.map(program => {
              const color = programColors[program as keyof typeof programColors];
              const isSelected = selectedPrograms.includes(program);
              return (
                <button
                  key={program}
                  onClick={() => toggleProgram(program)}
                  disabled={showAllPrograms}
                  className={`px-3 py-1.5 rounded-full text-xs transition-all ${
                    showAllPrograms
                      ? `${color.light} ${color.text} border ${color.border} opacity-60 cursor-not-allowed`
                      : isSelected
                        ? `${color.bg} text-white shadow-sm`
                        : `${color.light} ${color.text} border ${color.border} hover:shadow-md`
                  }`}
                >
                  {program}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Status Badge */}
      {viewMode === 'daily' && (
        <div className="flex gap-3 flex-wrap">
          {isToday && (
            <div className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg border-2 border-blue-300">
              📅 Today's Schedule
            </div>
          )}
          {isWeekendDay(selectedDay) && (
            <div className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg border-2 border-gray-300">
              🏖️ Weekend Schedule
            </div>
          )}
        </div>
      )}

      {/* Daily View */}
      {viewMode === 'daily' && (
        <div className="bg-white rounded-lg shadow-card overflow-hidden border border-light" style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top left', width: `${10000 / zoomLevel}%` }}>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-soft border-b border-light">
                  <th className="sticky left-0 z-20 px-6 py-4 text-left text-sm text-body bg-soft border-r border-light min-w-[100px]">
                    Time
                  </th>
                  {availableRooms.map(room => (
                    <th
                      key={room.id}
                      className="px-6 py-4 text-center text-sm text-body border-r border-light min-w-[220px]"
                    >
                      <div className="font-medium">{room.name}</div>
                      <div className="text-xs text-gray-500 mt-1">Capacity: {room.capacity}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timeSlots.map((time) => (
                  <tr key={time} className={`border-b border-gray-100 hover:bg-soft/30 transition-colors ${isWeekendDay(selectedDay) ? 'bg-gray-50' : ''}`}>
                    <td className="sticky left-0 z-10 px-6 py-4 text-sm text-body bg-white border-r border-light">
                      <span className="font-medium">{time}</span>
                    </td>
                    {availableRooms.map(room => {
                      const classes = getClassesForSlot(time, room.id);
                      const firstClass = classes[0];
                      
                      if (firstClass) {
                        const [classStartHour] = firstClass.startTime.split(':').map(Number);
                        const [currentHour] = time.split(':').map(Number);
                        
                        if (classStartHour === currentHour) {
                          return (
                            <td
                              key={room.id}
                              rowSpan={getRowSpan(firstClass)}
                              className="px-3 py-3 border-r border-light align-top"
                            >
                              <ClassBlock classSession={firstClass} />
                            </td>
                          );
                        } else {
                          return null;
                        }
                      }

                      return (
                        <td
                          key={room.id}
                          className={`px-3 py-3 border-r border-light ${isWeekendDay(selectedDay) ? 'bg-gray-50' : 'bg-white'} hover:bg-soft cursor-pointer transition-colors`}
                          onClick={() => setShowAddModal(true)}
                        >
                          <div className="h-20 flex items-center justify-center text-gray-400 text-sm hover:text-primary-blue transition-colors">
                            <Plus className="w-5 h-5" />
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Weekly View with Weekends */}
      {viewMode === 'weekly' && (
        <div className="bg-white rounded-lg shadow-card overflow-hidden border border-light" style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top left', width: `${10000 / zoomLevel}%` }}>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-soft border-b border-light sticky top-0 z-20">
                  <th className="sticky left-0 z-30 px-6 py-4 text-left text-sm text-body bg-soft border-r border-light min-w-[100px]">
                    Time
                  </th>
                  {days.map(day => (
                    <th
                      key={day}
                      className={`px-6 py-4 text-center text-sm text-body border-r border-light min-w-[250px] ${
                        isWeekendDay(day) ? 'bg-gray-100' : ''
                      }`}
                    >
                      <div className="font-medium">{day}</div>
                      {isWeekendDay(day) && <div className="text-xs text-gray-500 mt-1">🏖️ Weekend</div>}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timeSlots.map((time) => (
                  <tr key={time} className="border-b border-gray-100 hover:bg-soft/30 transition-colors">
                    <td className="sticky left-0 z-10 px-6 py-4 text-sm text-body bg-white border-r border-light">
                      <span className="font-medium">{time}</span>
                    </td>
                    {days.map(day => {
                      const classes = getClassesForWeeklySlot(time, day);
                      const firstClass = classes[0];
                      
                      if (firstClass) {
                        const [classStartHour] = firstClass.startTime.split(':').map(Number);
                        const [currentHour] = time.split(':').map(Number);
                        
                        if (classStartHour === currentHour) {
                          return (
                            <td
                              key={day}
                              rowSpan={getRowSpan(firstClass)}
                              className={`px-3 py-3 border-r border-light align-top ${
                                isWeekendDay(day) ? 'bg-gray-50/50' : ''
                              }`}
                            >
                              <div className="space-y-2">
                                {classes.map((cls, idx) => {
                                  const [clsStartHour] = cls.startTime.split(':').map(Number);
                                  if (clsStartHour === currentHour) {
                                    return <ClassBlock key={cls.id} classSession={cls} compact={classes.length > 1} />;
                                  }
                                  return null;
                                })}
                              </div>
                            </td>
                          );
                        } else {
                          return null;
                        }
                      }

                      return (
                        <td
                          key={day}
                          className={`px-3 py-3 border-r border-light ${
                            isWeekendDay(day) ? 'bg-gray-50' : 'bg-white'
                          } hover:bg-soft cursor-pointer transition-colors`}
                          onClick={() => setShowAddModal(true)}
                        >
                          <div className="h-20 flex items-center justify-center text-gray-400 text-sm hover:text-primary-blue transition-colors">
                            <Plus className="w-5 h-5" />
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Program Legend */}
      <div className="bg-white rounded-lg shadow-card p-5 border border-light">
        <h3 className="text-dark mb-4">Program Legend</h3>
        <div className="flex flex-wrap gap-4">
          {programs.map(program => {
            const color = programColors[program as keyof typeof programColors];
            return (
              <div key={program} className="flex items-center gap-2">
                <div className={`w-5 h-5 rounded ${color.bg}`}></div>
                <span className="text-sm text-body">{program}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Weekly Summary */}
      <div className="bg-white rounded-lg shadow-card p-6 border border-light">
        <h3 className="text-dark mb-4">Schedule Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-sm text-body mb-1">Total Classes</p>
            <p className="text-3xl text-primary-blue">{stats.totalClasses}</p>
          </div>
          <div>
            <p className="text-sm text-body mb-1">Conflicts</p>
            <p className="text-3xl text-red-500">{stats.conflictCount}</p>
          </div>
          <div>
            <p className="text-sm text-body mb-1">Rooms Used</p>
            <p className="text-3xl text-green-600">{stats.roomsUsed}</p>
          </div>
          <div>
            <p className="text-sm text-body mb-1">Programs</p>
            <p className="text-3xl text-purple-600">{programs.length}</p>
          </div>
        </div>
        <div className="mt-6 pt-6 border-t border-light">
          <p className="text-sm text-body mb-4">Classes per Program:</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.programCounts.map(({ program, count }) => {
              const color = programColors[program as keyof typeof programColors];
              return (
                <div key={program} className={`${color.light} rounded-lg p-4 border ${color.border}`}>
                  <p className={`text-sm ${color.text} mb-1 truncate`}>{program}</p>
                  <p className={`text-2xl ${color.text}`}>{count}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Class Details Modal - Soft Frosted Backdrop */}
      {showViewModal && selectedClass && (
        <>
          <div 
            className="fixed inset-0 bg-white/40 backdrop-blur-sm z-50"
            onClick={() => setShowViewModal(false)}
          />
          
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="border-b border-light px-6 py-4 flex items-center justify-between sticky top-0 bg-white">
                <h2 className="text-primary-blue">Class Details</h2>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="p-2 hover:bg-soft rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-body" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Subject Info */}
                <div>
                  <label className="text-sm text-body mb-1 block">Subject Code & Name</label>
                  <p className="text-dark text-lg">
                    {mockSubjects.find(s => s.id === selectedClass.subjectId)?.code} - {mockSubjects.find(s => s.id === selectedClass.subjectId)?.name}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm text-body mb-1 block">Department / Program</label>
                    <p className="text-dark">{selectedClass.program}</p>
                  </div>
                  <div>
                    <label className="text-sm text-body mb-1 block">Level</label>
                    <p className="text-dark">{selectedClass.level}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm text-body mb-1 block">Class Type</label>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm ${
                      programColors[selectedClass.program as keyof typeof programColors]?.light || 'bg-blue-50'
                    } ${
                      programColors[selectedClass.program as keyof typeof programColors]?.text || 'text-blue-700'
                    }`}>
                      {selectedClass.classType}
                    </span>
                  </div>
                  <div>
                    <label className="text-sm text-body mb-1 block">Day & Time</label>
                    <p className="text-dark">{selectedClass.day}, {selectedClass.startTime} - {selectedClass.endTime}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm text-body mb-1 block">Room</label>
                    <p className="text-dark">{mockRooms.find(r => r.id === selectedClass.roomId)?.name}</p>
                  </div>
                  <div>
                    <label className="text-sm text-body mb-1 block">Room Capacity</label>
                    <p className="text-dark">{mockRooms.find(r => r.id === selectedClass.roomId)?.capacity} students</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm text-body mb-1 block">Teacher</label>
                  <div className="flex items-center gap-3 p-3 bg-soft rounded-lg border border-light">
                    <Users className="w-5 h-5 text-primary-blue" />
                    <div>
                      <p className="text-dark">{mockTeachers.find(t => t.id === selectedClass.teacherId)?.name}</p>
                      <p className="text-sm text-body">{mockTeachers.find(t => t.id === selectedClass.teacherId)?.department}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm text-body mb-1 block">Enrolled Students</label>
                  <p className="text-dark text-2xl text-primary-blue">{selectedClass.enrolledStudents || 0} students</p>
                </div>

                {isWeekendDay(selectedClass.day) && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      🏖️ This is a weekend class. Please ensure students are notified about the special schedule.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Export Modal - Soft Frosted Backdrop */}
      {showExportModal && (
        <>
          <div 
            className="fixed inset-0 bg-white/40 backdrop-blur-sm z-50"
            onClick={() => setShowExportModal(false)}
          />
          
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full shadow-2xl">
              <div className="border-b border-light px-6 py-4 flex items-center justify-between">
                <h2 className="text-dark">Export Timetable</h2>
                <button
                  onClick={() => setShowExportModal(false)}
                  className="p-2 hover:bg-soft rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-body" />
                </button>
              </div>

              <div className="p-6 space-y-3">
                <button className="w-full px-4 py-3 text-left border border-light rounded-xl hover:bg-soft transition-colors flex items-center justify-between">
                  <span className="text-dark">Export Daily Timetable</span>
                  <Download className="w-4 h-4 text-body" />
                </button>
                <button className="w-full px-4 py-3 text-left border border-light rounded-xl hover:bg-soft transition-colors flex items-center justify-between">
                  <span className="text-dark">Export Weekly Timetable</span>
                  <Download className="w-4 h-4 text-body" />
                </button>
                <button className="w-full px-4 py-3 text-left border border-light rounded-xl hover:bg-soft transition-colors flex items-center justify-between">
                  <span className="text-dark">Export Selected Programs</span>
                  <Download className="w-4 h-4 text-body" />
                </button>
                <button className="w-full px-4 py-3 text-left border border-light rounded-xl hover:bg-soft transition-colors flex items-center justify-between">
                  <span className="text-dark">Export with Weekend Highlights</span>
                  <Download className="w-4 h-4 text-body" />
                </button>
              </div>

              <div className="px-6 py-4 bg-soft rounded-b-xl">
                <button
                  onClick={() => setShowExportModal(false)}
                  className="w-full px-4 py-3 bg-primary-blue text-white rounded-xl hover:opacity-90 transition-opacity shadow-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Add Class Modal - Soft Frosted Backdrop */}
      {showAddModal && (
        <>
          <div 
            className="fixed inset-0 bg-white/40 backdrop-blur-sm z-50"
            onClick={() => setShowAddModal(false)}
          />
          
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full shadow-2xl">
              <div className="border-b border-light px-6 py-4 flex items-center justify-between">
                <h2 className="text-dark">Add New Class</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 hover:bg-soft rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-body" />
                </button>
              </div>

              <div className="p-6">
                <p className="text-body">Add class form coming soon...</p>
              </div>

              <div className="px-6 py-4 border-t border-light flex gap-3">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-3 bg-gray-100 text-body rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button className="flex-1 px-4 py-3 bg-primary-blue text-white rounded-xl hover:opacity-90 transition-opacity">
                  Add Class
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}