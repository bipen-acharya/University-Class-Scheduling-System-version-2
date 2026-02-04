import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  Briefcase, 
  Building2,
  Award,
  Calendar,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { mockTeachers, mockClasses, mockSubjects, mockRooms, isClassRunning, todayDay } from '../../data/mockData';

export default function TeacherProfile() {
  const { id } = useParams<{ id: string }>();
  const teacher = mockTeachers.find(t => t.id === id);

  if (!teacher) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 text-xl">Teacher not found</p>
        <Link
          to="/admin/teachers"
          className="inline-flex items-center gap-2 mt-4 text-[#0AA6A6] hover:text-[#002A4A]"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Teachers
        </Link>
      </div>
    );
  }

  // Get teacher's classes
  const teacherClasses = mockClasses.filter(cls => cls.teacherId === teacher.id);
  const todayClasses = teacherClasses.filter(cls => cls.day === todayDay);
  const runningClass = todayClasses.find(isClassRunning);

  // Calculate free time today
  const allTimeSlots = Array.from({ length: 12 }, (_, i) => {
    const hour = i + 8;
    return { hour, label: `${hour}:00` };
  });

  const busySlots = new Set<number>();
  todayClasses.forEach(cls => {
    const [startHour] = cls.startTime.split(':').map(Number);
    const [endHour] = cls.endTime.split(':').map(Number);
    for (let h = startHour; h < endHour; h++) {
      busySlots.add(h);
    }
  });

  const freeSlots = allTimeSlots.filter(slot => !busySlots.has(slot.hour));

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link
        to="/admin/teachers"
        className="inline-flex items-center gap-2 text-[#0AA6A6] hover:text-[#002A4A] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Teachers
      </Link>

      {/* Profile Header */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
        <div className="h-32 bg-gradient-to-r from-[#002A4A] to-[#0AA6A6]" />
        <div className="px-8 pb-8">
          <div className="flex items-end gap-6 -mt-16">
            <div className="w-32 h-32 rounded-full bg-white border-4 border-white shadow-xl flex items-center justify-center text-4xl text-[#002A4A]">
              {teacher.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="flex-1 pt-20">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl text-[#002A4A] mb-2">{teacher.name}</h1>
                  <p className="text-xl text-gray-600 mb-3">{teacher.expertise}</p>
                  <div className="flex items-center gap-4">
                    <span className={`px-4 py-1 rounded-full ${
                      teacher.activeThisTrimester
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {teacher.activeThisTrimester ? 'Active This Trimester' : 'Not Teaching'}
                    </span>
                    {teacher.currentlyInIndustry && (
                      <span className="px-4 py-1 bg-blue-100 text-blue-700 rounded-full flex items-center gap-2">
                        <Briefcase className="w-4 h-4" />
                        Working in Industry
                      </span>
                    )}
                  </div>
                </div>
                {runningClass && (
                  <div className="px-4 py-2 bg-[#0AA6A6] text-white rounded-lg animate-pulse">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                      Teaching Now
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact & Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact Information */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h2 className="text-xl text-[#002A4A] mb-6 flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Contact Information
          </h2>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">University Email</p>
              <a 
                href={`mailto:${teacher.universityEmail}`}
                className="text-[#0AA6A6] hover:text-[#002A4A] flex items-center gap-2"
              >
                <Mail className="w-4 h-4" />
                {teacher.universityEmail}
              </a>
            </div>

            <div>
              <p className="text-sm text-gray-500 mb-1">Personal Email</p>
              <a 
                href={`mailto:${teacher.personalEmail}`}
                className="text-[#0AA6A6] hover:text-[#002A4A] flex items-center gap-2"
              >
                <Mail className="w-4 h-4" />
                {teacher.personalEmail}
              </a>
            </div>

            <div>
              <p className="text-sm text-gray-500 mb-1">Phone</p>
              <a 
                href={`tel:${teacher.phone}`}
                className="text-[#0AA6A6] hover:text-[#002A4A] flex items-center gap-2"
              >
                <Phone className="w-4 h-4" />
                {teacher.phone}
              </a>
            </div>
          </div>
        </div>

        {/* Professional Details */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h2 className="text-xl text-[#002A4A] mb-6 flex items-center gap-2">
            <Award className="w-5 h-5" />
            Professional Details
          </h2>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Department</p>
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#0AA6A6]" />
                <span className="text-[#002A4A]">{teacher.department}</span>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-500 mb-1">Area of Expertise</p>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-[#0AA6A6]" />
                <span className="text-[#002A4A]">{teacher.expertise}</span>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-500 mb-1">Industry Field</p>
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-[#0AA6A6]" />
                <span className="text-[#002A4A]">{teacher.industryField}</span>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-500 mb-1">Currently in Industry</p>
              <div className="flex items-center gap-2">
                {teacher.currentlyInIndustry ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-green-700">Yes</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">No</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Today's Status */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h2 className="text-xl text-[#002A4A] mb-6 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Today's Status
          </h2>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500 mb-2">Classes Today</p>
              <p className="text-3xl text-[#002A4A]">{todayClasses.length}</p>
            </div>

            {runningClass ? (
              <div className="bg-[#0AA6A6] text-white rounded-lg p-4">
                <p className="text-sm opacity-90 mb-1">Currently Teaching</p>
                <p className="mb-1">
                  {mockSubjects.find(s => s.id === runningClass.subjectId)?.code}
                </p>
                <p className="text-sm opacity-90">
                  {mockRooms.find(r => r.id === runningClass.roomId)?.name}
                </p>
                <p className="text-sm opacity-90 mt-2">
                  {runningClass.startTime} - {runningClass.endTime}
                </p>
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-700">Currently Free</p>
              </div>
            )}

            <div>
              <p className="text-sm text-gray-500 mb-2">Free Time Slots Today</p>
              {freeSlots.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {freeSlots.map(slot => (
                    <span
                      key={slot.hour}
                      className="px-2 py-1 bg-green-100 text-green-700 rounded text-sm"
                    >
                      {slot.label}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 text-sm">Fully booked today</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Today's Schedule */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h2 className="text-xl text-[#002A4A] mb-6 flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Today's Assigned Classes
        </h2>

        {todayClasses.length === 0 ? (
          <div className="text-center py-12 bg-[#F5F7FA] rounded-lg">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">No classes scheduled for today</p>
          </div>
        ) : (
          <div className="space-y-3">
            {todayClasses.sort((a, b) => a.startTime.localeCompare(b.startTime)).map(cls => {
              const subject = mockSubjects.find(s => s.id === cls.subjectId);
              const room = mockRooms.find(r => r.id === cls.roomId);
              const isRunning = isClassRunning(cls);

              return (
                <div
                  key={cls.id}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    isRunning
                      ? 'bg-[#0AA6A6] border-[#0AA6A6] text-white'
                      : 'bg-[#F5F7FA] border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`px-3 py-1 rounded ${
                        isRunning ? 'bg-white text-[#0AA6A6]' : 'bg-white text-gray-700'
                      }`}>
                        {cls.startTime} - {cls.endTime}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={isRunning ? 'text-white' : 'text-[#002A4A]'}>
                            {subject?.code}
                          </span>
                          {isRunning && (
                            <span className="px-2 py-0.5 bg-white text-[#0AA6A6] text-xs rounded">
                              Now Running
                            </span>
                          )}
                        </div>
                        <div className={`text-sm ${isRunning ? 'text-white opacity-90' : 'text-gray-600'}`}>
                          {subject?.name}
                        </div>
                      </div>
                    </div>
                    <div className={`text-right ${isRunning ? 'text-white opacity-90' : 'text-gray-600'}`}>
                      <div>{room?.name}</div>
                      <div className="text-sm">{room?.level}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Weekly Schedule Overview */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h2 className="text-xl text-[#002A4A] mb-6 flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Weekly Schedule Overview
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => {
            const dayClasses = teacherClasses.filter(cls => cls.day === day);
            const isToday = day === todayDay;
            const isWeekend = day === 'Saturday' || day === 'Sunday';

            return (
              <div
                key={day}
                className={`p-4 rounded-lg border-2 ${
                  isToday
                    ? 'border-blue-400 bg-blue-50'
                    : isWeekend
                    ? 'border-gray-200 bg-gray-50'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <div className="text-center mb-3">
                  <h3 className={`text-sm mb-1 ${
                    isToday ? 'text-blue-700' : 'text-gray-600'
                  }`}>
                    {day}
                  </h3>
                  <div className={`text-2xl ${
                    isToday ? 'text-blue-700' : 'text-[#002A4A]'
                  }`}>
                    {dayClasses.length}
                  </div>
                  <p className="text-xs text-gray-500">
                    {dayClasses.length === 1 ? 'class' : 'classes'}
                  </p>
                </div>
                {dayClasses.length > 0 && (
                  <div className="space-y-1">
                    {dayClasses.map(cls => (
                      <div
                        key={cls.id}
                        className="text-xs bg-[#0AA6A6] bg-opacity-10 text-[#002A4A] rounded px-2 py-1"
                      >
                        {cls.startTime}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
