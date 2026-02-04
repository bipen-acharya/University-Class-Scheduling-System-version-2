import { useMemo } from 'react';
import { AlertTriangle, CheckCircle, Calendar, Users, Building } from 'lucide-react';
import { mockClasses, mockSubjects, mockTeachers, mockRooms } from '../../data/mockData';

interface Conflict {
  type: 'teacher' | 'room' | 'overlap';
  severity: 'high' | 'medium';
  message: string;
  classes: string[];
  day: string;
  time: string;
}

export default function ConflictChecker() {
  const conflicts = useMemo<Conflict[]>(() => {
    const foundConflicts: Conflict[] = [];

    // Group classes by day
    const classesByDay = mockClasses.reduce((acc, cls) => {
      if (!acc[cls.day]) acc[cls.day] = [];
      acc[cls.day].push(cls);
      return acc;
    }, {} as Record<string, typeof mockClasses>);

    // Check each day
    Object.entries(classesByDay).forEach(([day, dayClasses]) => {
      // Check for teacher conflicts (same teacher, different rooms, overlapping time)
      const teacherSchedules = new Map<string, typeof mockClasses>();
      
      dayClasses.forEach(cls1 => {
        if (!teacherSchedules.has(cls1.teacherId)) {
          teacherSchedules.set(cls1.teacherId, []);
        }
        teacherSchedules.get(cls1.teacherId)!.push(cls1);
      });

      teacherSchedules.forEach((classes, teacherId) => {
        const teacher = mockTeachers.find(t => t.id === teacherId);
        
        for (let i = 0; i < classes.length; i++) {
          for (let j = i + 1; j < classes.length; j++) {
            const cls1 = classes[i];
            const cls2 = classes[j];
            
            // Check time overlap
            const [start1Hour, start1Min] = cls1.startTime.split(':').map(Number);
            const [end1Hour, end1Min] = cls1.endTime.split(':').map(Number);
            const [start2Hour, start2Min] = cls2.startTime.split(':').map(Number);
            const [end2Hour, end2Min] = cls2.endTime.split(':').map(Number);
            
            const start1 = start1Hour * 60 + start1Min;
            const end1 = end1Hour * 60 + end1Min;
            const start2 = start2Hour * 60 + start2Min;
            const end2 = end2Hour * 60 + end2Min;
            
            if (start1 < end2 && start2 < end1) {
              const room1 = mockRooms.find(r => r.id === cls1.roomId);
              const room2 = mockRooms.find(r => r.id === cls2.roomId);
              const subject1 = mockSubjects.find(s => s.id === cls1.subjectId);
              const subject2 = mockSubjects.find(s => s.id === cls2.subjectId);
              
              foundConflicts.push({
                type: 'teacher',
                severity: 'high',
                message: `${teacher?.name} is scheduled in ${room1?.name} and ${room2?.name} at the same time`,
                classes: [
                  `${subject1?.code} (${cls1.startTime}-${cls1.endTime})`,
                  `${subject2?.code} (${cls2.startTime}-${cls2.endTime})`
                ],
                day: cls1.day,
                time: `${cls1.startTime}-${cls1.endTime}`
              });
            }
          }
        }
      });

      // Check for room conflicts (same room, overlapping time)
      const roomSchedules = new Map<string, typeof mockClasses>();
      
      dayClasses.forEach(cls1 => {
        if (!roomSchedules.has(cls1.roomId)) {
          roomSchedules.set(cls1.roomId, []);
        }
        roomSchedules.get(cls1.roomId)!.push(cls1);
      });

      roomSchedules.forEach((classes, roomId) => {
        const room = mockRooms.find(r => r.id === roomId);
        
        for (let i = 0; i < classes.length; i++) {
          for (let j = i + 1; j < classes.length; j++) {
            const cls1 = classes[i];
            const cls2 = classes[j];
            
            // Check time overlap
            const [start1Hour, start1Min] = cls1.startTime.split(':').map(Number);
            const [end1Hour, end1Min] = cls1.endTime.split(':').map(Number);
            const [start2Hour, start2Min] = cls2.startTime.split(':').map(Number);
            const [end2Hour, end2Min] = cls2.endTime.split(':').map(Number);
            
            const start1 = start1Hour * 60 + start1Min;
            const end1 = end1Hour * 60 + end1Min;
            const start2 = start2Hour * 60 + start2Min;
            const end2 = end2Hour * 60 + end2Min;
            
            if (start1 < end2 && start2 < end1) {
              const teacher1 = mockTeachers.find(t => t.id === cls1.teacherId);
              const teacher2 = mockTeachers.find(t => t.id === cls2.teacherId);
              const subject1 = mockSubjects.find(s => s.id === cls1.subjectId);
              const subject2 = mockSubjects.find(s => s.id === cls2.subjectId);
              
              foundConflicts.push({
                type: 'room',
                severity: 'high',
                message: `${room?.name} is double-booked with ${teacher1?.name} and ${teacher2?.name}`,
                classes: [
                  `${subject1?.code} with ${teacher1?.name} (${cls1.startTime}-${cls1.endTime})`,
                  `${subject2?.code} with ${teacher2?.name} (${cls2.startTime}-${cls2.endTime})`
                ],
                day: cls1.day,
                time: `${cls1.startTime}-${cls1.endTime}`
              });
            }
          }
        }
      });
    });

    return foundConflicts;
  }, []);

  const stats = {
    totalClasses: mockClasses.length,
    conflicts: conflicts.length,
    highSeverity: conflicts.filter(c => c.severity === 'high').length,
    mediumSeverity: conflicts.filter(c => c.severity === 'medium').length
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-card-lg p-6 border border-light">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-body mb-1">Total Classes</p>
              <p className="text-3xl text-dark font-bold">{stats.totalClasses}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-xl">
              <Calendar className="w-6 h-6 text-primary-blue" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-card-lg p-6 border border-light">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-body mb-1">Total Conflicts</p>
              <p className="text-3xl text-dark font-bold">{stats.conflicts}</p>
            </div>
            <div className="p-3 bg-orange-50 rounded-xl">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-card-lg p-6 border border-light">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-body mb-1">High Severity</p>
              <p className="text-3xl text-red-600 font-bold">{stats.highSeverity}</p>
            </div>
            <div className="p-3 bg-red-50 rounded-xl">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-card-lg p-6 border border-light">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-body mb-1">Medium Severity</p>
              <p className="text-3xl text-orange-600 font-bold">{stats.mediumSeverity}</p>
            </div>
            <div className="p-3 bg-orange-50 rounded-xl">
              <AlertTriangle className="w-6 h-6 text-orange-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Status Message */}
      {conflicts.length === 0 ? (
        <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-success rounded-full flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <div>
              <h2 className="text-2xl text-dark mb-2 font-semibold">No Conflicts Found!</h2>
              <p className="text-body">
                Your schedule is conflict-free. All teachers and rooms are properly assigned without overlaps.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0 animate-pulse-gentle">
              <AlertTriangle className="w-10 h-10 text-white" />
            </div>
            <div>
              <h2 className="text-2xl text-dark mb-2 font-semibold">
                {conflicts.length} Conflict{conflicts.length !== 1 && 's'} Detected
              </h2>
              <p className="text-body">
                Please review and resolve the following scheduling conflicts to ensure smooth operations.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Conflicts List */}
      {conflicts.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl text-dark font-semibold">Conflict Details</h2>
          
          {conflicts.map((conflict, index) => (
            <div
              key={index}
              className={`bg-white rounded-2xl shadow-card-lg p-6 border-2 ${
                conflict.severity === 'high'
                  ? 'border-red-200'
                  : 'border-orange-200'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  conflict.severity === 'high' ? 'bg-red-50' : 'bg-orange-50'
                }`}>
                  {conflict.type === 'teacher' && (
                    <Users className={`w-6 h-6 ${
                      conflict.severity === 'high' ? 'text-red-600' : 'text-orange-600'
                    }`} />
                  )}
                  {conflict.type === 'room' && (
                    <Building className={`w-6 h-6 ${
                      conflict.severity === 'high' ? 'text-red-600' : 'text-orange-600'
                    }`} />
                  )}
                  {conflict.type === 'overlap' && (
                    <AlertTriangle className={`w-6 h-6 ${
                      conflict.severity === 'high' ? 'text-red-600' : 'text-orange-600'
                    }`} />
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg text-dark font-semibold mb-1">{conflict.message}</h3>
                      <div className="flex items-center gap-4 text-sm text-body">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {conflict.day}
                        </span>
                        <span>{conflict.time}</span>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      conflict.severity === 'high'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-orange-100 text-orange-700'
                    }`}>
                      {conflict.severity === 'high' ? 'High Priority' : 'Medium Priority'}
                    </span>
                  </div>

                  <div className="bg-soft rounded-xl p-4">
                    <p className="text-sm text-body mb-2 font-medium">Conflicting classes:</p>
                    <ul className="space-y-2">
                      {conflict.classes.map((cls, idx) => (
                        <li key={idx} className="text-sm text-body flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-primary-blue rounded-full mt-1.5 flex-shrink-0" />
                          <span>{cls}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recommendations */}
      <div className="bg-white rounded-2xl shadow-card-lg p-6 border border-light">
        <h2 className="text-xl text-dark font-semibold mb-4">Recommendations</h2>
        <ul className="space-y-3">
          <li className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
            <span className="text-body">
              Review teacher schedules to ensure no one is assigned to multiple rooms simultaneously
            </span>
          </li>
          <li className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
            <span className="text-body">
              Check room bookings for overlapping time slots
            </span>
          </li>
          <li className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
            <span className="text-body">
              Consider adjusting class times or moving to different rooms to resolve conflicts
            </span>
          </li>
          <li className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
            <span className="text-body">
              Run conflict checker regularly, especially after adding or modifying classes
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}