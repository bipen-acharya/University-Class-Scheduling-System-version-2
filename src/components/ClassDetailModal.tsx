import { X, Calendar, Clock, MapPin, User, BookOpen, Pencil, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";

interface ClassDetailModalProps {
  class: any;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (classData: any) => void;
  onDelete?: (classId: string) => void;
}

export function ClassDetailModal({ class: classData, isOpen, onClose, onEdit, onDelete }: ClassDetailModalProps) {
  if (!classData) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Class Details</span>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Subject Info */}
          <div className="p-4 rounded-lg" style={{ backgroundColor: classData.color + '20' }}>
            <div className="flex items-center gap-3 mb-2">
              <BookOpen className="w-5 h-5" style={{ color: classData.color }} />
              <div>
                <h3 className="text-gray-900">{classData.subjectCode}</h3>
                <p className="text-gray-600 text-sm">{classData.subjectName}</p>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <User className="w-5 h-5 text-gray-600 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600">Teacher</p>
                <p className="text-gray-900 mt-1">{classData.teacherName}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <MapPin className="w-5 h-5 text-gray-600 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600">Room</p>
                <p className="text-gray-900 mt-1">{classData.room}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <Calendar className="w-5 h-5 text-gray-600 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600">Day</p>
                <p className="text-gray-900 mt-1">{classData.day}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <Clock className="w-5 h-5 text-gray-600 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600">Time</p>
                <p className="text-gray-900 mt-1">
                  {classData.startTime} - {classData.endTime}
                </p>
              </div>
            </div>
          </div>

          {/* Class Type */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Class Type</p>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
              classData.classType === "Lecture" ? "bg-blue-100 text-blue-700" :
              classData.classType === "Tutorial" ? "bg-purple-100 text-purple-700" :
              "bg-green-100 text-green-700"
            }`}>
              {classData.classType}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <Button
              onClick={() => onEdit?.(classData)}
              className="bg-[#0AA6A6] hover:bg-[#0B9696] text-white flex-1"
            >
              <Pencil className="w-4 h-4 mr-2" />
              Edit Class
            </Button>
            <Button
              onClick={() => onDelete?.(classData.id)}
              variant="outline"
              className="border-red-600 text-red-600 hover:bg-red-50 flex-1"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Class
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
