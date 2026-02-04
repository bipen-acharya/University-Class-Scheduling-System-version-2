import { useState, useMemo } from 'react';
import { 
  Calendar, 
  Clock, 
  DoorOpen, 
  BookOpen, 
  TrendingUp, 
  CheckCircle, 
  Download,
  Building2,
  Users,
  X,
  AlertCircle,
  Filter,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

type FinderTab = 'classroom' | 'seminar' | 'weekly';

interface ClassroomSchedule {
  start: string;
  end: string;
  subject: string;
  code: string;
  capacity: string;
  teacher: string;
  program: string;
}

interface SeminarEvent {
  start: string;
  end: string;
  event: string;
  type: 'booked' | 'pending';
  organizer: string;
}

interface TimelineSlot {
  type: 'gap' | 'busy' | 'pending';
  start: string;
  end: string;
  duration: number;
  subject?: string;
  code?: string;
  capacity?: string;
  teacher?: string;
  program?: string;
  event?: string;
  organizer?: string;
}

interface RoomGaps {
  roomName: string;
  gaps: TimelineSlot[];
}

export default function GapFinder() {
  const [activeTab, setActiveTab] = useState<FinderTab>('classroom');
  const [showExportModal, setShowExportModal] = useState(false);

  // Unified filters
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [selectedBuilding, setSelectedBuilding] = useState('All Buildings');
  const [selectedLevel, setSelectedLevel] = useState('Level 1');
  const [selectedProgram, setSelectedProgram] = useState('All Programs');
  const [selectedRoomType, setSelectedRoomType] = useState('Classroom');
  const [selectedRoom, setSelectedRoom] = useState('Room 1.01');
  const [selectedSubject, setSelectedSubject] = useState('All Subjects');
  
  // Show all rooms toggle
  const [showAllRooms, setShowAllRooms] = useState(false);
  
  // Expanded rooms for all rooms view
  const [expandedRooms, setExpandedRooms] = useState<Set<string>>(new Set());

  // Seminar hall specific
  const [selectedSeminarHall, setSelectedSeminarHall] = useState('Main Auditorium');

  // Weekly specific room filter
  const [weeklyRoom, setWeeklyRoom] = useState('Room 1.01');

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const levels = ['Level 1', 'Level 2', 'Level 3'];
  const buildings = ['All Buildings', 'Building 1', 'Building 2'];
  const roomTypes = ['Classroom', 'Seminar Hall'];
  const seminarHalls = ['Main Auditorium', 'Seminar Hall A', 'Seminar Hall B', 'Conference Room'];
  const programs = [
    'All Programs', 
    'Bachelor of ICT', 
    'Bachelor of Nursing', 
    'Bachelor of Early Childhood', 
    'Masters in ICT', 
    'Masters in Cybersecurity',
    'ICT',
    'Nursing',
    'Business',
    'Engineering',
    'Psychology'
  ];
  const subjects = ['All Subjects', 'Artificial Intelligence', 'Web Development Lab', 'Cloud Computing', 'Data Structures', 'Algorithms'];

  // Dynamic rooms based on building, level, and room type
  const getRooms = () => {
    if (selectedRoomType === 'Seminar Hall') {
      return seminarHalls;
    }
    
    if (selectedLevel === 'Level 1') {
      return ['Room 1.01', 'Room 1.02', 'Room 1.03', 'Lab 1.1', 'Studio 1.1'];
    } else if (selectedLevel === 'Level 2') {
      return ['Room 2.01', 'Room 2.02', 'Room 2.03', 'Lab 2.1'];
    } else {
      return ['Room 3.01', 'Room 3.02', 'Room 3.03', 'Studio 3.1'];
    }
  };

  // Mock classroom schedule data for different rooms
  const getClassroomSchedule = (roomName: string): ClassroomSchedule[] => {
    if (roomName === 'Room 1.01') {
      return [
        { start: '09:00', end: '11:00', subject: 'Artificial Intelligence', code: 'AI-202', capacity: '30/35', teacher: 'Dr. Sarah Johnson', program: 'Bachelor of ICT' },
        { start: '13:00', end: '15:00', subject: 'Web Development Lab', code: 'WEB-301', capacity: '25/30', teacher: 'Prof. John Smith', program: 'ICT' },
        { start: '16:00', end: '18:00', subject: 'Cloud Computing', code: 'CTL-101', capacity: '22/28', teacher: 'Dr. Emily Brown', program: 'Masters in ICT' }
      ];
    } else if (roomName === 'Room 1.02') {
      return [
        { start: '10:00', end: '12:00', subject: 'Data Structures', code: 'CS-301', capacity: '24/30', teacher: 'Dr. Michael Chen', program: 'Bachelor of ICT' },
        { start: '14:00', end: '16:00', subject: 'Algorithms', code: 'CS-401', capacity: '20/25', teacher: 'Prof. Amanda Lee', program: 'ICT' }
      ];
    } else if (roomName === 'Room 1.03') {
      return [
        { start: '08:00', end: '10:00', subject: 'Nursing Fundamentals', code: 'NUR-101', capacity: '28/30', teacher: 'Dr. Lisa Chang', program: 'Bachelor of Nursing' },
        { start: '15:00', end: '17:00', subject: 'Patient Care', code: 'NUR-201', capacity: '22/25', teacher: 'Prof. Jane Smith', program: 'Nursing' }
      ];
    } else if (roomName === 'Lab 1.1') {
      return [
        { start: '09:00', end: '12:00', subject: 'Network Security Lab', code: 'SEC-305', capacity: '18/25', teacher: 'Dr. James Wilson', program: 'Masters in Cybersecurity' },
        { start: '15:00', end: '17:00', subject: 'Penetration Testing', code: 'SEC-401', capacity: '15/20', teacher: 'Prof. Robert Taylor', program: 'Masters in Cybersecurity' }
      ];
    } else if (roomName === 'Room 2.01') {
      return [
        { start: '11:00', end: '13:00', subject: 'Database Management', code: 'DB-301', capacity: '28/32', teacher: 'Dr. Lisa Chang', program: 'Bachelor of ICT' }
      ];
    }
    return [];
  };

  // Filter schedule by program
  const filterScheduleByProgram = (schedule: ClassroomSchedule[]): ClassroomSchedule[] => {
    if (selectedProgram === 'All Programs') return schedule;
    return schedule.filter(item => item.program === selectedProgram);
  };

  // Mock seminar hall schedule
  const seminarSchedule: SeminarEvent[] = useMemo(() => {
    if (selectedSeminarHall === 'Main Auditorium') {
      return [
        { start: '09:00', end: '11:00', event: 'Orientation Event', type: 'booked', organizer: 'Student Affairs' },
        { start: '14:00', end: '16:00', event: 'Guest Lecture - Industry 4.0', type: 'booked', organizer: 'Dr. Sarah Johnson' },
        { start: '17:00', end: '18:00', event: 'Department Meeting', type: 'pending', organizer: 'Dean Office' }
      ];
    } else if (selectedSeminarHall === 'Seminar Hall A') {
      return [
        { start: '10:00', end: '12:00', event: 'Internal Meeting - Curriculum Review', type: 'booked', organizer: 'Academic Committee' },
        { start: '15:00', end: '17:00', event: 'Workshop - Research Methodology', type: 'booked', organizer: 'Prof. Michael Chen' }
      ];
    }
    return [
      { start: '13:00', end: '15:00', event: 'Faculty Training Session', type: 'pending', organizer: 'HR Department' }
    ];
  }, [selectedSeminarHall]);

  // Generate timeline with gaps for a specific room
  const generateTimeline = (schedule: ClassroomSchedule[]): TimelineSlot[] => {
    const slots: TimelineSlot[] = [];
    const startHour = 8;
    const endHour = 20;

    const filteredSchedule = filterScheduleByProgram(schedule);

    const sortedClasses = [...filteredSchedule].sort((a, b) => {
      const aTime = parseInt(a.start.split(':')[0]) * 60 + parseInt(a.start.split(':')[1]);
      const bTime = parseInt(b.start.split(':')[0]) * 60 + parseInt(b.start.split(':')[1]);
      return aTime - bTime;
    });

    let currentTime = startHour * 60;

    if (sortedClasses.length > 0) {
      const firstClassStart = parseInt(sortedClasses[0].start.split(':')[0]) * 60 + parseInt(sortedClasses[0].start.split(':')[1]);
      if (firstClassStart > currentTime) {
        slots.push({
          type: 'gap',
          start: `${String(Math.floor(currentTime / 60)).padStart(2, '0')}:${String(currentTime % 60).padStart(2, '0')}`,
          end: sortedClasses[0].start,
          duration: (firstClassStart - currentTime) / 60
        });
        currentTime = firstClassStart;
      }
    }

    sortedClasses.forEach((classItem, index) => {
      const classStart = parseInt(classItem.start.split(':')[0]) * 60 + parseInt(classItem.start.split(':')[1]);
      const classEnd = parseInt(classItem.end.split(':')[0]) * 60 + parseInt(classItem.end.split(':')[1]);

      slots.push({
        type: 'busy',
        ...classItem,
        duration: (classEnd - classStart) / 60
      });

      currentTime = classEnd;

      if (index < sortedClasses.length - 1) {
        const nextClassStart = parseInt(sortedClasses[index + 1].start.split(':')[0]) * 60 + parseInt(sortedClasses[index + 1].start.split(':')[1]);
        if (nextClassStart > currentTime) {
          slots.push({
            type: 'gap',
            start: classItem.end,
            end: sortedClasses[index + 1].start,
            duration: (nextClassStart - currentTime) / 60
          });
          currentTime = nextClassStart;
        }
      }
    });

    if (currentTime < endHour * 60) {
      const lastEnd = sortedClasses.length > 0 ? sortedClasses[sortedClasses.length - 1].end : '08:00';
      slots.push({
        type: 'gap',
        start: lastEnd,
        end: '20:00',
        duration: (endHour * 60 - currentTime) / 60
      });
    }

    return slots;
  };

  // Get timeline for selected room
  const classroomTimeline = useMemo(() => {
    const schedule = getClassroomSchedule(selectedRoom);
    return generateTimeline(schedule);
  }, [selectedRoom, selectedProgram]);

  // Get all rooms gaps for selected level
  const allRoomsGaps = useMemo((): RoomGaps[] => {
    const rooms = getRooms();
    return rooms.map(roomName => {
      const schedule = getClassroomSchedule(roomName);
      const timeline = generateTimeline(schedule);
      const gaps = timeline.filter(slot => slot.type === 'gap');
      return { roomName, gaps };
    });
  }, [selectedLevel, selectedRoomType, selectedProgram, selectedBuilding]);

  // Generate seminar timeline with gaps
  const seminarTimeline = useMemo((): TimelineSlot[] => {
    const slots: TimelineSlot[] = [];
    const startHour = 8;
    const endHour = 20;

    const sortedEvents = [...seminarSchedule].sort((a, b) => {
      const aTime = parseInt(a.start.split(':')[0]) * 60 + parseInt(a.start.split(':')[1]);
      const bTime = parseInt(b.start.split(':')[0]) * 60 + parseInt(b.start.split(':')[1]);
      return aTime - bTime;
    });

    let currentTime = startHour * 60;

    if (sortedEvents.length > 0) {
      const firstEventStart = parseInt(sortedEvents[0].start.split(':')[0]) * 60 + parseInt(sortedEvents[0].start.split(':')[1]);
      if (firstEventStart > currentTime) {
        slots.push({
          type: 'gap',
          start: `${String(Math.floor(currentTime / 60)).padStart(2, '0')}:${String(currentTime % 60).padStart(2, '0')}`,
          end: sortedEvents[0].start,
          duration: (firstEventStart - currentTime) / 60
        });
        currentTime = firstEventStart;
      }
    }

    sortedEvents.forEach((eventItem, index) => {
      const eventStart = parseInt(eventItem.start.split(':')[0]) * 60 + parseInt(eventItem.start.split(':')[1]);
      const eventEnd = parseInt(eventItem.end.split(':')[0]) * 60 + parseInt(eventItem.end.split(':')[1]);

      slots.push({
        type: eventItem.type === 'booked' ? 'busy' : 'pending',
        start: eventItem.start,
        end: eventItem.end,
        event: eventItem.event,
        organizer: eventItem.organizer,
        duration: (eventEnd - eventStart) / 60
      });

      currentTime = eventEnd;

      if (index < sortedEvents.length - 1) {
        const nextEventStart = parseInt(sortedEvents[index + 1].start.split(':')[0]) * 60 + parseInt(sortedEvents[index + 1].start.split(':')[1]);
        if (nextEventStart > currentTime) {
          slots.push({
            type: 'gap',
            start: eventItem.end,
            end: sortedEvents[index + 1].start,
            duration: (nextEventStart - currentTime) / 60
          });
          currentTime = nextEventStart;
        }
      }
    });

    if (currentTime < endHour * 60) {
      const lastEnd = sortedEvents.length > 0 ? sortedEvents[sortedEvents.length - 1].end : '08:00';
      slots.push({
        type: 'gap',
        start: lastEnd,
        end: '20:00',
        duration: (endHour * 60 - currentTime) / 60
      });
    }

    return slots;
  }, [seminarSchedule]);

  // Calculate classroom statistics
  const classroomStats = useMemo(() => {
    let allGaps: TimelineSlot[] = [];
    let allBusySlots: TimelineSlot[] = [];

    if (showAllRooms) {
      // Aggregate stats from all rooms
      allRoomsGaps.forEach(roomData => {
        allGaps = [...allGaps, ...roomData.gaps];
        const schedule = getClassroomSchedule(roomData.roomName);
        const timeline = generateTimeline(schedule);
        const busy = timeline.filter(slot => slot.type === 'busy');
        allBusySlots = [...allBusySlots, ...busy];
      });
    } else {
      // Single room stats
      allGaps = classroomTimeline.filter(slot => slot.type === 'gap');
      allBusySlots = classroomTimeline.filter(slot => slot.type === 'busy');
    }

    const totalFreeSlots = allGaps.length;
    const longestGap = allGaps.length > 0 ? Math.max(...allGaps.map(g => g.duration)) : 0;
    const firstFreeSlot = allGaps.length > 0 ? `${allGaps[0].start} - ${allGaps[0].end}` : 'None';
    const totalOccupiedHours = allBusySlots.reduce((sum, slot) => sum + slot.duration, 0);

    return { totalFreeSlots, longestGap, firstFreeSlot, totalOccupiedHours };
  }, [classroomTimeline, allRoomsGaps, showAllRooms]);

  // Calculate seminar statistics
  const seminarStats = useMemo(() => {
    const gaps = seminarTimeline.filter(slot => slot.type === 'gap');
    const longestGap = gaps.length > 0 ? Math.max(...gaps.map(g => g.duration)) : 0;
    const totalOccupiedHours = seminarTimeline
      .filter(slot => slot.type === 'busy' || slot.type === 'pending')
      .reduce((sum, slot) => sum + slot.duration, 0);
    const largestFreeBlock = gaps.length > 0 ? `${gaps[0].start} - ${gaps[0].end}` : 'None';

    return { longestGap, totalOccupiedHours, largestFreeBlock, totalFreeSlots: gaps.length };
  }, [seminarTimeline]);

  // Check current status
  const currentStatus = useMemo(() => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeInMinutes = currentHour * 60 + currentMinute;

    const currentDay = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][now.getDay()];
    if (selectedDay !== currentDay) return null;

    const timeline = activeTab === 'seminar' ? seminarTimeline : classroomTimeline;

    for (const slot of timeline) {
      const slotStart = parseInt(slot.start.split(':')[0]) * 60 + parseInt(slot.start.split(':')[1]);
      const slotEnd = parseInt(slot.end.split(':')[0]) * 60 + parseInt(slot.end.split(':')[1]);

      if (currentTimeInMinutes >= slotStart && currentTimeInMinutes < slotEnd) {
        return { type: slot.type, slot };
      }
    }
    return null;
  }, [classroomTimeline, seminarTimeline, selectedDay, activeTab]);

  const toggleRoomExpansion = (roomName: string) => {
    const newExpanded = new Set(expandedRooms);
    if (newExpanded.has(roomName)) {
      newExpanded.delete(roomName);
    } else {
      newExpanded.add(roomName);
    }
    setExpandedRooms(newExpanded);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-primary-blue mb-2">Class Gap Finder</h1>
          <p className="text-body">Find available time slots across classrooms, seminar halls, and weekly schedules</p>
        </div>
        <button
          onClick={() => setShowExportModal(true)}
          className="flex items-center gap-3 px-6 py-3 bg-primary-blue text-white rounded-xl hover:opacity-90 transition-opacity shadow-md"
        >
          <Download className="w-5 h-5" />
          <span>Export to PDF</span>
        </button>
      </div>

      {/* Finder Type Tabs */}
      <div className="flex gap-2 bg-white rounded-lg p-2 shadow-card border border-light w-fit">
        <button
          onClick={() => setActiveTab('classroom')}
          className={`px-6 py-3 rounded-lg transition-all ${
            activeTab === 'classroom'
              ? 'bg-primary-blue text-white shadow-md'
              : 'text-body hover:bg-soft'
          }`}
        >
          Classroom Gaps
        </button>
        <button
          onClick={() => setActiveTab('seminar')}
          className={`px-6 py-3 rounded-lg transition-all ${
            activeTab === 'seminar'
              ? 'bg-primary-blue text-white shadow-md'
              : 'text-body hover:bg-soft'
          }`}
        >
          Seminar Hall Gaps
        </button>
        <button
          onClick={() => setActiveTab('weekly')}
          className={`px-6 py-3 rounded-lg transition-all ${
            activeTab === 'weekly'
              ? 'bg-primary-blue text-white shadow-md'
              : 'text-body hover:bg-soft'
          }`}
        >
          Weekly Gaps
        </button>
      </div>

      {/* Classroom Gap Finder */}
      {activeTab === 'classroom' && (
        <>
          {/* Filters */}
          <div className="bg-white rounded-lg shadow-card p-5 border border-light">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-primary-blue" />
                <h2 className="text-dark">Filter Options</h2>
              </div>
              <label className="flex items-center gap-2 cursor-pointer bg-soft px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
                <input
                  type="checkbox"
                  checked={showAllRooms}
                  onChange={(e) => setShowAllRooms(e.target.checked)}
                  className="w-4 h-4 text-primary-blue rounded focus:ring-primary-blue border-gray-300"
                />
                <span className="text-sm text-dark">Show All Rooms for Selected Level</span>
              </label>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              <div>
                <label className="block text-sm text-body mb-2">Day *</label>
                <select
                  value={selectedDay}
                  onChange={(e) => setSelectedDay(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue text-sm"
                >
                  {days.map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-body mb-2">Building</label>
                <select
                  value={selectedBuilding}
                  onChange={(e) => setSelectedBuilding(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue text-sm"
                >
                  {buildings.map(building => (
                    <option key={building} value={building}>{building}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-body mb-2">Level *</label>
                <select
                  value={selectedLevel}
                  onChange={(e) => {
                    setSelectedLevel(e.target.value);
                    const rooms = getRooms();
                    if (rooms.length > 0) setSelectedRoom(rooms[0]);
                  }}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue text-sm"
                >
                  {levels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-body mb-2">Program</label>
                <select
                  value={selectedProgram}
                  onChange={(e) => setSelectedProgram(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue text-sm"
                >
                  {programs.map(program => (
                    <option key={program} value={program}>{program}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-body mb-2">Room Type</label>
                <select
                  value={selectedRoomType}
                  onChange={(e) => {
                    setSelectedRoomType(e.target.value);
                    const rooms = getRooms();
                    if (rooms.length > 0) setSelectedRoom(rooms[0]);
                  }}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue text-sm"
                >
                  {roomTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {!showAllRooms && (
                <div>
                  <label className="block text-sm text-body mb-2">Room *</label>
                  <select
                    value={selectedRoom}
                    onChange={(e) => setSelectedRoom(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue text-sm"
                  >
                    {getRooms().map(room => (
                      <option key={room} value={room}>{room}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Current Status Card */}
          {!showAllRooms && currentStatus && currentStatus.type === 'gap' && (
            <div className="bg-[#E6F9EC] rounded-lg p-5 border-2 border-[#32D583]">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-[#32D583]" />
                <div>
                  <h3 className="text-dark">Room Currently Free</h3>
                  <p className="text-sm text-body">Available until {currentStatus.slot.end}</p>
                </div>
              </div>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white rounded-xl shadow-card p-5 border border-light text-center">
              <div className="flex justify-center mb-3">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <Clock className="w-6 h-6 text-primary-blue" />
                </div>
              </div>
              <p className="text-sm text-body mb-2">Total Free Slots</p>
              <p className="text-3xl text-primary-blue">{classroomStats.totalFreeSlots}</p>
            </div>

            <div className="bg-white rounded-xl shadow-card p-5 border border-light text-center">
              <div className="flex justify-center mb-3">
                <div className="p-3 bg-green-50 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <p className="text-sm text-body mb-2">Longest Gap</p>
              <p className="text-3xl text-green-600">{classroomStats.longestGap}h</p>
            </div>

            <div className="bg-white rounded-xl shadow-card p-5 border border-light text-center">
              <div className="flex justify-center mb-3">
                <div className="p-3 bg-purple-50 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <p className="text-sm text-body mb-2">First Available Slot</p>
              <p className="text-sm text-purple-600 mt-2">{classroomStats.firstFreeSlot}</p>
            </div>

            <div className="bg-white rounded-xl shadow-card p-5 border border-light text-center">
              <div className="flex justify-center mb-3">
                <div className="p-3 bg-orange-50 rounded-lg">
                  <BookOpen className="w-6 h-6 text-orange-600" />
                </div>
              </div>
              <p className="text-sm text-body mb-2">Total Hours Used</p>
              <p className="text-3xl text-orange-600">{classroomStats.totalOccupiedHours}h</p>
            </div>
          </div>

          {/* Gap Results */}
          {!showAllRooms ? (
            // Single Room Mode - Timeline View
            <div className="bg-white rounded-lg shadow-card p-6 border border-light">
              <h3 className="text-dark mb-4">{selectedDay}'s Timeline - {selectedRoom}</h3>
              <div className="space-y-3">
                {classroomTimeline.map((slot, index) => (
                  <div
                    key={index}
                    className={`rounded-xl p-4 border-2 transition-all ${
                      slot.type === 'gap'
                        ? 'bg-gradient-to-r from-blue-50 to-sky-50 border-blue-200 hover:border-primary-blue hover:shadow-lg cursor-pointer'
                        : 'bg-purple-500 text-white border-purple-500 hover:bg-purple-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`flex items-center gap-2 ${slot.type === 'gap' ? 'text-primary-blue' : 'text-white'}`}>
                          <Clock className="w-5 h-5" />
                          <span className="font-medium">{slot.start} - {slot.end}</span>
                        </div>
                        {slot.type === 'busy' && (
                          <div className="flex flex-col">
                            <span className="font-medium">{slot.code} - {slot.subject}</span>
                            <span className="text-sm opacity-90">{slot.teacher}</span>
                          </div>
                        )}
                        {slot.type === 'gap' && (
                          <span className="text-primary-blue font-medium text-lg">{slot.duration}h gap</span>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        {slot.type === 'busy' && (
                          <>
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4" />
                              <span className="text-sm">{slot.capacity}</span>
                            </div>
                            <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                              {slot.program}
                            </span>
                            <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                              {slot.duration}h
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            // All Rooms Mode - List View with Expandable Cards
            <div className="bg-white rounded-lg shadow-card p-6 border border-light">
              <h3 className="text-dark mb-4">Gap Results for All Rooms in {selectedLevel}</h3>
              <div className="space-y-4">
                {allRoomsGaps.map((roomData) => (
                  <div key={roomData.roomName} className="bg-soft rounded-xl border border-light overflow-hidden">
                    <div 
                      className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => toggleRoomExpansion(roomData.roomName)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary-blue/10 rounded-lg">
                          <DoorOpen className="w-5 h-5 text-primary-blue" />
                        </div>
                        <div>
                          <h4 className="text-dark">{roomData.roomName}</h4>
                          <p className="text-sm text-body">
                            {roomData.gaps.length === 0 ? 'No gaps available' : `${roomData.gaps.length} gap${roomData.gaps.length > 1 ? 's' : ''} found`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {roomData.gaps.length > 0 && (
                          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                            {roomData.gaps.reduce((sum, gap) => sum + gap.duration, 0)}h total free
                          </span>
                        )}
                        {expandedRooms.has(roomData.roomName) ? (
                          <ChevronUp className="w-5 h-5 text-body" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-body" />
                        )}
                      </div>
                    </div>
                    
                    {expandedRooms.has(roomData.roomName) && (
                      <div className="px-4 pb-4 space-y-2">
                        {roomData.gaps.length === 0 ? (
                          <p className="text-sm text-body italic py-2">No available gaps for this room on {selectedDay}</p>
                        ) : (
                          roomData.gaps.map((gap, idx) => (
                            <div 
                              key={idx}
                              className="bg-gradient-to-r from-blue-50 to-sky-50 rounded-lg p-3 border border-blue-200 flex items-center justify-between"
                            >
                              <div className="flex items-center gap-3">
                                <Clock className="w-4 h-4 text-primary-blue" />
                                <span className="text-sm text-dark">{gap.start} - {gap.end}</span>
                              </div>
                              <span className="px-3 py-1 bg-blue-100 text-primary-blue rounded-full text-sm font-medium">
                                {gap.duration}h gap
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Seminar Hall Gap Finder */}
      {activeTab === 'seminar' && (
        <>
          {/* Filters */}
          <div className="bg-white rounded-lg shadow-card p-5 border border-light">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-5 h-5 text-primary-blue" />
              <h2 className="text-dark">Filter Options</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              <div>
                <label className="block text-sm text-body mb-2">Day *</label>
                <select
                  value={selectedDay}
                  onChange={(e) => setSelectedDay(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue text-sm"
                >
                  {days.map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-body mb-2">Building</label>
                <select
                  value={selectedBuilding}
                  onChange={(e) => setSelectedBuilding(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue text-sm"
                >
                  {buildings.map(building => (
                    <option key={building} value={building}>{building}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-body mb-2">Level</label>
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue text-sm"
                >
                  {levels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-body mb-2">Seminar Hall *</label>
                <select
                  value={selectedSeminarHall}
                  onChange={(e) => setSelectedSeminarHall(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue text-sm"
                >
                  {seminarHalls.map(hall => (
                    <option key={hall} value={hall}>{hall}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-body mb-2">Room Type</label>
                <select
                  value={selectedRoomType}
                  onChange={(e) => setSelectedRoomType(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue text-sm"
                >
                  {roomTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-body mb-2">Program</label>
                <select
                  value={selectedProgram}
                  onChange={(e) => setSelectedProgram(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue text-sm"
                >
                  {programs.map(program => (
                    <option key={program} value={program}>{program}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Current Status Card */}
          {currentStatus && currentStatus.type === 'gap' && (
            <div className="bg-[#E6F9EC] rounded-lg p-5 border-2 border-[#32D583]">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-[#32D583]" />
                <div>
                  <h3 className="text-dark">Room Currently Free</h3>
                  <p className="text-sm text-body">Available until {currentStatus.slot.end}</p>
                </div>
              </div>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white rounded-xl shadow-card p-5 border border-light text-center">
              <div className="flex justify-center mb-3">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <Clock className="w-6 h-6 text-primary-blue" />
                </div>
              </div>
              <p className="text-sm text-body mb-2">Total Free Slots</p>
              <p className="text-3xl text-primary-blue">{seminarStats.totalFreeSlots}</p>
            </div>

            <div className="bg-white rounded-xl shadow-card p-5 border border-light text-center">
              <div className="flex justify-center mb-3">
                <div className="p-3 bg-green-50 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <p className="text-sm text-body mb-2">Longest Gap</p>
              <p className="text-3xl text-green-600">{seminarStats.longestGap}h</p>
            </div>

            <div className="bg-white rounded-xl shadow-card p-5 border border-light text-center">
              <div className="flex justify-center mb-3">
                <div className="p-3 bg-purple-50 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <p className="text-sm text-body mb-2">Largest Free Block</p>
              <p className="text-sm text-purple-600 mt-2">{seminarStats.largestFreeBlock}</p>
            </div>

            <div className="bg-white rounded-xl shadow-card p-5 border border-light text-center">
              <div className="flex justify-center mb-3">
                <div className="p-3 bg-orange-50 rounded-lg">
                  <BookOpen className="w-6 h-6 text-orange-600" />
                </div>
              </div>
              <p className="text-sm text-body mb-2">Total Hours Used</p>
              <p className="text-3xl text-orange-600">{seminarStats.totalOccupiedHours}h</p>
            </div>
          </div>

          {/* Timeline View */}
          <div className="bg-white rounded-lg shadow-card p-6 border border-light">
            <h3 className="text-dark mb-4">{selectedDay}'s Timeline - {selectedSeminarHall}</h3>
            <div className="space-y-3">
              {seminarTimeline.map((slot, index) => (
                <div
                  key={index}
                  className={`rounded-xl p-4 border-2 transition-all ${
                    slot.type === 'gap'
                      ? 'bg-gradient-to-r from-blue-50 to-sky-50 border-blue-200 hover:border-primary-blue hover:shadow-lg cursor-pointer'
                      : slot.type === 'pending'
                      ? 'bg-yellow-500 text-white border-yellow-500 hover:bg-yellow-600'
                      : 'bg-purple-500 text-white border-purple-500 hover:bg-purple-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`flex items-center gap-2 ${slot.type === 'gap' ? 'text-primary-blue' : 'text-white'}`}>
                        <Clock className="w-5 h-5" />
                        <span className="font-medium">{slot.start} - {slot.end}</span>
                      </div>
                      {slot.type !== 'gap' && (
                        <div className="flex flex-col">
                          <span className="font-medium">{slot.event}</span>
                          <span className="text-sm opacity-90">{slot.organizer}</span>
                        </div>
                      )}
                      {slot.type === 'gap' && (
                        <span className="text-primary-blue font-medium text-lg">{slot.duration}h gap</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      {slot.type !== 'gap' && (
                        <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                          {slot.type === 'pending' ? 'Pending' : 'Booked'}
                        </span>
                      )}
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        slot.type === 'gap' ? 'bg-blue-100 text-primary-blue font-medium' : 'bg-white/20 text-white'
                      }`}>
                        {slot.duration}h
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Weekly Gap Finder */}
      {activeTab === 'weekly' && (
        <>
          {/* Filters */}
          <div className="bg-white rounded-lg shadow-card p-5 border border-light">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-5 h-5 text-primary-blue" />
              <h2 className="text-dark">Filter Options</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div>
                <label className="block text-sm text-body mb-2">Building</label>
                <select
                  value={selectedBuilding}
                  onChange={(e) => setSelectedBuilding(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue text-sm"
                >
                  {buildings.map(building => (
                    <option key={building} value={building}>{building}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-body mb-2">Level *</label>
                <select
                  value={selectedLevel}
                  onChange={(e) => {
                    setSelectedLevel(e.target.value);
                    const rooms = getRooms();
                    if (rooms.length > 0) setWeeklyRoom(rooms[0]);
                  }}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue text-sm"
                >
                  {levels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-body mb-2">Room *</label>
                <select
                  value={weeklyRoom}
                  onChange={(e) => setWeeklyRoom(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue text-sm"
                >
                  {getRooms().map(room => (
                    <option key={room} value={room}>{room}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-body mb-2">Room Type</label>
                <select
                  value={selectedRoomType}
                  onChange={(e) => setSelectedRoomType(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue text-sm"
                >
                  {roomTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-body mb-2">Program</label>
                <select
                  value={selectedProgram}
                  onChange={(e) => setSelectedProgram(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue text-sm"
                >
                  {programs.map(program => (
                    <option key={program} value={program}>{program}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-body mb-2">Subject (Optional)</label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue text-sm"
                >
                  {subjects.map(subject => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Weekly Summary */}
          <div className="bg-white rounded-xl shadow-card p-6 border border-light">
            <h3 className="text-dark mb-5">Weekly Summary - {weeklyRoom}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-green-50 rounded-lg p-5 border border-green-200 text-center">
                <p className="text-sm text-body mb-2">Free This Week</p>
                <p className="text-3xl text-green-600">18 hours</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-5 border border-blue-200 text-center">
                <p className="text-sm text-body mb-2">Longest Continuous Gap</p>
                <p className="text-3xl text-primary-blue">4 hours</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-5 border border-purple-200 text-center">
                <p className="text-sm text-body mb-2">Best Time to Schedule</p>
                <p className="text-xl text-purple-600">2:00 - 4:00 PM</p>
              </div>
            </div>
          </div>

          {/* Weekly Grid */}
          <div className="bg-white rounded-lg shadow-card overflow-hidden border border-light">
            <div className="p-4 bg-soft border-b border-light">
              <h3 className="text-dark">Weekly Timeline - {weeklyRoom}</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-soft border-b border-light sticky top-0">
                    <th className="px-4 py-3 text-left text-sm text-body border-r border-light min-w-[100px]">Time</th>
                    {days.map(day => (
                      <th key={day} className="px-4 py-3 text-center text-sm text-body border-r border-light min-w-[150px]">
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {['08:00-09:00', '09:00-10:00', '10:00-11:00', '11:00-12:00', '12:00-13:00', '13:00-14:00', '14:00-15:00', '15:00-16:00', '16:00-17:00', '17:00-18:00', '18:00-19:00', '19:00-20:00'].map((time, timeIndex) => (
                    <tr key={time} className="border-b border-light hover:bg-soft/50">
                      <td className="px-4 py-3 text-sm text-body bg-soft border-r border-light">{time}</td>
                      {days.map((day, dayIndex) => {
                        const isFree = (timeIndex + dayIndex) % 3 === 0;
                        const gapDuration = isFree ? 2 : 0;
                        return (
                          <td
                            key={day}
                            className={`px-2 py-2 border-r border-light transition-colors ${
                              isFree ? 'bg-green-50 hover:bg-green-100' : 'bg-white'
                            }`}
                          >
                            <div className={`rounded-lg p-3 transition-all ${
                              isFree 
                                ? 'bg-[#E6F9EC] border border-[#32D583] hover:shadow-md cursor-pointer' 
                                : 'bg-purple-500 text-white hover:bg-purple-600'
                            }`}>
                              <div className="text-xs">
                                {isFree ? (
                                  <div>
                                    <span className="text-green-700 font-medium block">Available</span>
                                    <span className="text-green-600 text-[10px]">{gapDuration}h gap</span>
                                  </div>
                                ) : (
                                  <div>
                                    <span className="font-medium block">AI-202</span>
                                    <span className="opacity-80 text-[10px]">Dr. Sarah J.</span>
                                  </div>
                                )}
                              </div>
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
        </>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <>
          <div 
            className="fixed inset-0 bg-white/40 backdrop-blur-sm z-50"
            onClick={() => setShowExportModal(false)}
          />
          
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full shadow-2xl">
              <div className="border-b border-light px-6 py-4 flex items-center justify-between">
                <h2 className="text-primary-blue">Export Gap Report</h2>
                <button
                  onClick={() => setShowExportModal(false)}
                  className="p-2 hover:bg-soft rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-body" />
                </button>
              </div>

              <div className="p-6">
                <p className="text-body mb-6">
                  Export the current gap finder view as a PDF report. This will include all visible filters and gap results based on your current selection.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      alert('PDF Export functionality would be implemented here');
                      setShowExportModal(false);
                    }}
                    className="flex-1 px-4 py-3 bg-primary-blue text-white rounded-xl hover:opacity-90 transition-opacity"
                  >
                    Export PDF
                  </button>
                  <button
                    onClick={() => setShowExportModal(false)}
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
