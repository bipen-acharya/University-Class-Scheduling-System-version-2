import { ArrowLeft, CheckCircle, XCircle, Calendar } from "lucide-react";
import { Button } from "../ui/button";
import { mockClasses } from "../../lib/mockData";

interface TimesheetDetailProps {
  timesheet: any;
  onNavigate: (page: string) => void;
}

export function TimesheetDetail({ timesheet, onNavigate }: TimesheetDetailProps) {
  const teacherClasses = mockClasses.filter(c => c.teacherId === timesheet.teacherId);
  
  // Group classes by week (mock data - just show current week)
  const weekClasses = teacherClasses.map(cls => ({
    ...cls,
    delivered: Math.random() > 0.2, // Mock delivered status
    cancelled: Math.random() > 0.9, // Mock cancelled status
  }));

  return (
    <div className="p-8 bg-[#F5F7FA] min-h-screen">
      <div className="max-w-5xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => onNavigate("timesheets")}
          className="mb-6 text-gray-600 hover:text-[#002A4A]"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Timesheets
        </Button>

        {/* Teacher Info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-[#002A4A] rounded-full flex items-center justify-center text-white text-xl">
                {timesheet.teacherName.split(" ").map((n: string) => n[0]).join("")}
              </div>
              <div>
                <h1 className="text-gray-900">{timesheet.teacherName}</h1>
                <p className="text-gray-600">{timesheet.department}</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button className="bg-green-600 hover:bg-green-700 text-white">
                <CheckCircle className="w-4 h-4 mr-2" />
                Approve Timesheet
              </Button>
              <Button variant="outline" className="border-red-600 text-red-600 hover:bg-red-50">
                <XCircle className="w-4 h-4 mr-2" />
                Reject
              </Button>
            </div>
          </div>
        </div>

        {/* Week Selector */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-600" />
              <span className="text-gray-900">Week: December 2-6, 2025</span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">Previous Week</Button>
              <Button variant="outline" size="sm">Next Week</Button>
            </div>
          </div>
        </div>

        {/* Hours Summary */}
        <div className="grid grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <p className="text-gray-600 text-sm mb-2">Scheduled Hours</p>
            <p className="text-gray-900">{timesheet.scheduledHours} hours</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <p className="text-gray-600 text-sm mb-2">Delivered Hours</p>
            <p className="text-gray-900">{timesheet.deliveredHours} hours</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <p className="text-gray-600 text-sm mb-2">Variance</p>
            <p className={`${
              timesheet.scheduledHours === timesheet.deliveredHours ? "text-gray-900" :
              timesheet.scheduledHours > timesheet.deliveredHours ? "text-red-600" :
              "text-green-600"
            }`}>
              {timesheet.scheduledHours === timesheet.deliveredHours ? "On track" :
               timesheet.scheduledHours > timesheet.deliveredHours ? 
               `-${timesheet.scheduledHours - timesheet.deliveredHours}h` :
               `+${timesheet.deliveredHours - timesheet.scheduledHours}h`}
            </p>
          </div>
        </div>

        {/* Class List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-gray-900 mb-4">Weekly Classes</h2>
          <div className="space-y-3">
            {weekClasses.map((cls) => (
              <div
                key={cls.id}
                className={`p-4 rounded-lg border-2 ${
                  cls.cancelled ? "border-red-200 bg-red-50" :
                  cls.delivered ? "border-green-200 bg-green-50" :
                  "border-gray-200 bg-gray-50"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-gray-900">{cls.subjectCode}</span>
                      <span className="text-gray-600">{cls.subjectName}</span>
                      <span className="text-xs px-2 py-1 bg-white rounded text-gray-600">
                        {cls.classType}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>{cls.day}</span>
                      <span>{cls.startTime} - {cls.endTime}</span>
                      <span>Room: {cls.room}</span>
                      <span>
                        {parseInt(cls.endTime.split(":")[0]) - parseInt(cls.startTime.split(":")[0])}h
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {cls.cancelled ? (
                      <span className="text-xs px-3 py-1 bg-red-100 text-red-700 rounded-full flex items-center gap-1">
                        <XCircle className="w-3 h-3" />
                        Cancelled
                      </span>
                    ) : cls.delivered ? (
                      <span className="text-xs px-3 py-1 bg-green-100 text-green-700 rounded-full flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Delivered
                      </span>
                    ) : (
                      <span className="text-xs px-3 py-1 bg-gray-100 text-gray-700 rounded-full">
                        Pending
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
