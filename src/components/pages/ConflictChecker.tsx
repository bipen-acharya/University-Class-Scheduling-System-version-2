import { AlertTriangle, User, MapPin, Clock, CheckCircle, XCircle } from "lucide-react";
import { mockClasses } from "../../lib/mockData";
import { Button } from "../ui/button";

interface Conflict {
  id: string;
  type: "teacher" | "room" | "time";
  classA: any;
  classB: any;
  suggestedFix: string;
}

export function ConflictChecker() {
  // Auto-detect conflicts
  const detectConflicts = (): Conflict[] => {
    const conflicts: Conflict[] = [];
    
    // Check for teacher conflicts
    mockClasses.forEach((classA, indexA) => {
      mockClasses.forEach((classB, indexB) => {
        if (indexA >= indexB) return;
        
        // Same teacher, same day, overlapping times
        if (
          classA.teacherId === classB.teacherId &&
          classA.day === classB.day &&
          classA.id !== classB.id
        ) {
          const startA = parseInt(classA.startTime.split(":")[0]);
          const endA = parseInt(classA.endTime.split(":")[0]);
          const startB = parseInt(classB.startTime.split(":")[0]);
          const endB = parseInt(classB.endTime.split(":")[0]);
          
          if ((startA < endB && endA > startB)) {
            conflicts.push({
              id: `teacher-${classA.id}-${classB.id}`,
              type: "teacher",
              classA,
              classB,
              suggestedFix: `Move ${classB.subjectCode} to ${getAlternativeDay(classB.day)} ${classB.startTime}-${classB.endTime}`,
            });
          }
        }
        
        // Same room, same day, overlapping times
        if (
          classA.room === classB.room &&
          classA.day === classB.day &&
          classA.id !== classB.id
        ) {
          const startA = parseInt(classA.startTime.split(":")[0]);
          const endA = parseInt(classA.endTime.split(":")[0]);
          const startB = parseInt(classB.startTime.split(":")[0]);
          const endB = parseInt(classB.endTime.split(":")[0]);
          
          if ((startA < endB && endA > startB)) {
            const existingConflict = conflicts.find(
              c => (c.classA.id === classA.id && c.classB.id === classB.id) ||
                   (c.classA.id === classB.id && c.classB.id === classA.id)
            );
            
            if (!existingConflict) {
              conflicts.push({
                id: `room-${classA.id}-${classB.id}`,
                type: "room",
                classA,
                classB,
                suggestedFix: `Change ${classB.subjectCode} room to ${getAlternativeRoom(classB.room)}`,
              });
            }
          }
        }
      });
    });
    
    return conflicts;
  };

  const getAlternativeDay = (currentDay: string): string => {
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    const currentIndex = days.indexOf(currentDay);
    return days[(currentIndex + 1) % days.length];
  };

  const getAlternativeRoom = (currentRoom: string): string => {
    const roomNumber = parseInt(currentRoom.match(/\d+/)?.[0] || "101");
    return currentRoom.replace(/\d+/, (roomNumber + 1).toString());
  };

  const conflicts = detectConflicts();

  const getConflictIcon = (type: string) => {
    switch (type) {
      case "teacher": return User;
      case "room": return MapPin;
      case "time": return Clock;
      default: return AlertTriangle;
    }
  };

  const getConflictColor = (type: string) => {
    switch (type) {
      case "teacher": return "border-red-200 bg-red-50";
      case "room": return "border-orange-200 bg-orange-50";
      case "time": return "border-yellow-200 bg-yellow-50";
      default: return "border-gray-200 bg-gray-50";
    }
  };

  return (
    <div className="p-8 bg-[#F5F7FA] min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-gray-900">Conflict Checker</h1>
          <p className="text-gray-600 mt-1">Automatically detect and resolve scheduling conflicts</p>
        </div>

        {/* Summary Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-gray-900">Conflict Summary</h2>
              <p className="text-gray-600 mt-1">
                {conflicts.length === 0 
                  ? "No conflicts detected. All classes are properly scheduled."
                  : `${conflicts.length} conflict${conflicts.length > 1 ? 's' : ''} detected that need${conflicts.length === 1 ? 's' : ''} attention.`
                }
              </p>
            </div>
            <div className={`flex items-center gap-3 px-6 py-3 rounded-lg ${
              conflicts.length === 0 ? "bg-green-50" : "bg-red-50"
            }`}>
              {conflicts.length === 0 ? (
                <>
                  <CheckCircle className="w-8 h-8 text-green-600" />
                  <div>
                    <div className="text-green-900">All Clear</div>
                    <div className="text-sm text-green-600">No conflicts</div>
                  </div>
                </>
              ) : (
                <>
                  <XCircle className="w-8 h-8 text-red-600" />
                  <div>
                    <div className="text-red-900">{conflicts.length} Conflicts</div>
                    <div className="text-sm text-red-600">Needs attention</div>
                  </div>
                </>
              )}
            </div>
          </div>

          {conflicts.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-gray-900">
                    {conflicts.filter(c => c.type === "teacher").length}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Teacher Conflicts</div>
                </div>
                <div className="text-center">
                  <div className="text-gray-900">
                    {conflicts.filter(c => c.type === "room").length}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Room Conflicts</div>
                </div>
                <div className="text-center">
                  <div className="text-gray-900">
                    {conflicts.filter(c => c.type === "time").length}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Time Conflicts</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Conflict List */}
        {conflicts.length > 0 && (
          <div className="space-y-4">
            {conflicts.map((conflict) => {
              const Icon = getConflictIcon(conflict.type);
              
              return (
                <div
                  key={conflict.id}
                  className={`bg-white rounded-xl shadow-sm border-2 p-6 ${getConflictColor(conflict.type)}`}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="w-6 h-6 text-red-600" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-gray-900">
                          {conflict.type === "teacher" && "Teacher Double-Booked"}
                          {conflict.type === "room" && "Room Double-Booked"}
                          {conflict.type === "time" && "Time Overlap"}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs ${
                          conflict.type === "teacher" ? "bg-red-100 text-red-700" :
                          conflict.type === "room" ? "bg-orange-100 text-orange-700" :
                          "bg-yellow-100 text-yellow-700"
                        }`}>
                          {conflict.type.toUpperCase()}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        {/* Class A */}
                        <div className="p-4 bg-white rounded-lg border border-gray-200">
                          <div className="text-xs text-gray-500 mb-2">CLASS A</div>
                          <div className="space-y-2">
                            <div>
                              <span className="text-gray-900">{conflict.classA.subjectCode}</span>
                              <span className="text-gray-600 text-sm ml-2">
                                {conflict.classA.subjectName}
                              </span>
                            </div>
                            <div className="text-sm text-gray-600">
                              <div>Teacher: {conflict.classA.teacherName}</div>
                              <div>Room: {conflict.classA.room}</div>
                              <div>
                                {conflict.classA.day}, {conflict.classA.startTime}-{conflict.classA.endTime}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Class B */}
                        <div className="p-4 bg-white rounded-lg border border-gray-200">
                          <div className="text-xs text-gray-500 mb-2">CLASS B</div>
                          <div className="space-y-2">
                            <div>
                              <span className="text-gray-900">{conflict.classB.subjectCode}</span>
                              <span className="text-gray-600 text-sm ml-2">
                                {conflict.classB.subjectName}
                              </span>
                            </div>
                            <div className="text-sm text-gray-600">
                              <div>Teacher: {conflict.classB.teacherName}</div>
                              <div>Room: {conflict.classB.room}</div>
                              <div>
                                {conflict.classB.day}, {conflict.classB.startTime}-{conflict.classB.endTime}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <div className="text-sm text-green-900 mb-1">Suggested Fix</div>
                            <div className="text-sm text-green-700">{conflict.suggestedFix}</div>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3 mt-4">
                        <Button className="bg-[#0AA6A6] hover:bg-[#0B9696] text-white">
                          Apply Suggested Fix
                        </Button>
                        <Button variant="outline">
                          Edit Manually
                        </Button>
                        <Button variant="outline" className="text-gray-600">
                          Ignore
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {conflicts.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-gray-900 mb-2">No Conflicts Found</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Your timetable is properly scheduled with no overlapping classes, teacher conflicts, or room double-bookings.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
