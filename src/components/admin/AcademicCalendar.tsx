import { useState } from 'react';
import { Calendar, Plus, ChevronLeft, ChevronRight, Edit2, Trash2, X } from 'lucide-react';

interface AcademicPeriod {
  id: string;
  name: string;
  type: 'teaching' | 'orientation' | 'exam' | 'exam-break' | 'holiday' | 'census' | 'trimester-break';
  startDate: Date;
  endDate: Date;
  color: string;
  bgColor: string;
  borderColor: string;
  programs: string[];
  notes?: string;
}

interface Trimester {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  sessions: {
    id: string;
    name: string;
    startDate: Date;
    endDate: Date;
  }[];
}

const periodTypes = [
  { value: 'teaching', label: 'Teaching Weeks', color: '#60A5FA', bgColor: '#EFF6FF', borderColor: '#BFDBFE' },
  { value: 'orientation', label: 'Orientation', color: '#A78BFA', bgColor: '#F5F3FF', borderColor: '#DDD6FE' },
  { value: 'holiday', label: 'Public Holidays', color: '#EF4444', bgColor: '#FEF2F2', borderColor: '#FECACA' },
  { value: 'census', label: 'Census Date', color: '#F59E0B', bgColor: '#FFFBEB', borderColor: '#FDE68A' },
  { value: 'exam', label: 'Examination Period', color: '#EAB308', bgColor: '#FEFCE8', borderColor: '#FDE047' },
  { value: 'exam-break', label: 'Examination Break', color: '#6B7280', bgColor: '#F9FAFB', borderColor: '#D1D5DB' },
  { value: 'trimester-break', label: 'Trimester Break', color: '#1E40AF', bgColor: '#EFF6FF', borderColor: '#93C5FD' },
];

// Mock data for academic periods
const mockPeriods: AcademicPeriod[] = [
  {
    id: '1',
    name: 'Trimester 1 - Orientation',
    type: 'orientation',
    startDate: new Date(2025, 0, 13),
    endDate: new Date(2025, 0, 17),
    color: '#A78BFA',
    bgColor: '#F5F3FF',
    borderColor: '#DDD6FE',
    programs: ['All Programs'],
  },
  {
    id: '2',
    name: 'Trimester 1 - Teaching Weeks 1-6',
    type: 'teaching',
    startDate: new Date(2025, 0, 20),
    endDate: new Date(2025, 2, 2),
    color: '#60A5FA',
    bgColor: '#EFF6FF',
    borderColor: '#BFDBFE',
    programs: ['All Programs'],
  },
  {
    id: '3',
    name: 'Census Date',
    type: 'census',
    startDate: new Date(2025, 1, 7),
    endDate: new Date(2025, 1, 7),
    color: '#F59E0B',
    bgColor: '#FFFBEB',
    borderColor: '#FDE68A',
    programs: ['All Programs'],
  },
  {
    id: '4',
    name: 'Trimester 1 - Teaching Weeks 7-12',
    type: 'teaching',
    startDate: new Date(2025, 2, 3),
    endDate: new Date(2025, 3, 13),
    color: '#60A5FA',
    bgColor: '#EFF6FF',
    borderColor: '#BFDBFE',
    programs: ['All Programs'],
  },
  {
    id: '5',
    name: 'Trimester 1 - Examination Period',
    type: 'exam',
    startDate: new Date(2025, 3, 14),
    endDate: new Date(2025, 3, 27),
    color: '#EAB308',
    bgColor: '#FEFCE8',
    borderColor: '#FDE047',
    programs: ['All Programs'],
  },
  {
    id: '6',
    name: 'Trimester Break',
    type: 'trimester-break',
    startDate: new Date(2025, 3, 28),
    endDate: new Date(2025, 4, 4),
    color: '#1E40AF',
    bgColor: '#EFF6FF',
    borderColor: '#93C5FD',
    programs: ['All Programs'],
  },
  {
    id: '7',
    name: 'Trimester 2 - Orientation',
    type: 'orientation',
    startDate: new Date(2025, 4, 5),
    endDate: new Date(2025, 4, 9),
    color: '#A78BFA',
    bgColor: '#F5F3FF',
    borderColor: '#DDD6FE',
    programs: ['All Programs'],
  },
  {
    id: '8',
    name: 'Trimester 2 - Teaching Weeks 1-6',
    type: 'teaching',
    startDate: new Date(2025, 4, 12),
    endDate: new Date(2025, 5, 22),
    color: '#60A5FA',
    bgColor: '#EFF6FF',
    borderColor: '#BFDBFE',
    programs: ['All Programs'],
  },
  {
    id: '9',
    name: 'Trimester 2 - Teaching Weeks 7-12',
    type: 'teaching',
    startDate: new Date(2025, 5, 23),
    endDate: new Date(2025, 7, 3),
    color: '#60A5FA',
    bgColor: '#EFF6FF',
    borderColor: '#BFDBFE',
    programs: ['All Programs'],
  },
  {
    id: '10',
    name: 'Trimester 2 - Examination Period',
    type: 'exam',
    startDate: new Date(2025, 7, 4),
    endDate: new Date(2025, 7, 17),
    color: '#EAB308',
    bgColor: '#FEFCE8',
    borderColor: '#FDE047',
    programs: ['All Programs'],
  },
  {
    id: '11',
    name: 'Trimester Break',
    type: 'trimester-break',
    startDate: new Date(2025, 7, 18),
    endDate: new Date(2025, 7, 24),
    color: '#1E40AF',
    bgColor: '#EFF6FF',
    borderColor: '#93C5FD',
    programs: ['All Programs'],
  },
  {
    id: '12',
    name: 'Trimester 3 - Orientation',
    type: 'orientation',
    startDate: new Date(2025, 7, 25),
    endDate: new Date(2025, 7, 29),
    color: '#A78BFA',
    bgColor: '#F5F3FF',
    borderColor: '#DDD6FE',
    programs: ['All Programs'],
  },
  {
    id: '13',
    name: 'Trimester 3 - Teaching Weeks 1-6',
    type: 'teaching',
    startDate: new Date(2025, 8, 1),
    endDate: new Date(2025, 9, 12),
    color: '#60A5FA',
    bgColor: '#EFF6FF',
    borderColor: '#BFDBFE',
    programs: ['All Programs'],
  },
  {
    id: '14',
    name: 'Trimester 3 - Teaching Weeks 7-12',
    type: 'teaching',
    startDate: new Date(2025, 9, 13),
    endDate: new Date(2025, 10, 23),
    color: '#60A5FA',
    bgColor: '#EFF6FF',
    borderColor: '#BFDBFE',
    programs: ['All Programs'],
  },
  {
    id: '15',
    name: 'Trimester 3 - Examination Period',
    type: 'exam',
    startDate: new Date(2025, 10, 24),
    endDate: new Date(2025, 11, 7),
    color: '#EAB308',
    bgColor: '#FEFCE8',
    borderColor: '#FDE047',
    programs: ['All Programs'],
  },
];

const mockTrimesters: Trimester[] = [
  {
    id: 't1',
    name: 'Trimester 1',
    startDate: new Date(2025, 0, 13),
    endDate: new Date(2025, 3, 27),
    sessions: [
      { id: 's1', name: 'Session 1', startDate: new Date(2025, 0, 20), endDate: new Date(2025, 2, 2) },
      { id: 's2', name: 'Session 2', startDate: new Date(2025, 2, 3), endDate: new Date(2025, 3, 13) },
    ],
  },
  {
    id: 't2',
    name: 'Trimester 2',
    startDate: new Date(2025, 4, 5),
    endDate: new Date(2025, 7, 17),
    sessions: [
      { id: 's3', name: 'Session 1', startDate: new Date(2025, 4, 12), endDate: new Date(2025, 5, 22) },
      { id: 's4', name: 'Session 2', startDate: new Date(2025, 5, 23), endDate: new Date(2025, 7, 3) },
    ],
  },
  {
    id: 't3',
    name: 'Trimester 3',
    startDate: new Date(2025, 7, 25),
    endDate: new Date(2025, 11, 7),
    sessions: [
      { id: 's5', name: 'Session 1', startDate: new Date(2025, 8, 1), endDate: new Date(2025, 9, 12) },
      { id: 's6', name: 'Session 2', startDate: new Date(2025, 9, 13), endDate: new Date(2025, 10, 23) },
    ],
  },
];

export default function AcademicCalendar() {
  const [selectedYear, setSelectedYear] = useState(2025);
  const [selectedCampus, setSelectedCampus] = useState('main');
  const [periods, setPeriods] = useState<AcademicPeriod[]>(mockPeriods);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPeriod, setEditingPeriod] = useState<AcademicPeriod | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<AcademicPeriod | null>(null);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const isDateInPeriod = (date: Date, period: AcademicPeriod) => {
    const dateTime = date.getTime();
    const startTime = new Date(period.startDate).setHours(0, 0, 0, 0);
    const endTime = new Date(period.endDate).setHours(23, 59, 59, 999);
    return dateTime >= startTime && dateTime <= endTime;
  };

  const getPeriodsForDate = (date: Date) => {
    return periods.filter(period => isDateInPeriod(date, period));
  };

  const handleAddPeriod = () => {
    setEditingPeriod(null);
    setIsModalOpen(true);
  };

  const handleEditPeriod = (period: AcademicPeriod) => {
    setEditingPeriod(period);
    setIsModalOpen(true);
  };

  const handleDeletePeriod = (periodId: string) => {
    setPeriods(periods.filter(p => p.id !== periodId));
    setSelectedPeriod(null);
  };

  const renderCalendarMonth = (month: number) => {
    const daysInMonth = getDaysInMonth(selectedYear, month);
    const firstDay = getFirstDayOfMonth(selectedYear, month);
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="aspect-square" />);
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(selectedYear, month, day);
      const dayPeriods = getPeriodsForDate(date);
      const isToday = new Date().toDateString() === date.toDateString();

      days.push(
        <div
          key={day}
          className="aspect-square relative group cursor-pointer"
          onClick={() => {
            if (dayPeriods.length > 0) {
              setSelectedPeriod(dayPeriods[0]);
            }
          }}
        >
          <div className={`w-full h-full flex items-center justify-center text-xs relative ${
            isToday ? 'font-semibold' : ''
          }`}>
            {/* Day number */}
            <span className={`z-10 ${
              dayPeriods.length > 0 ? 'text-dark' : 'text-body'
            } ${isToday ? 'relative' : ''}`}>
              {day}
            </span>
            
            {/* Today indicator */}
            {isToday && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-7 h-7 rounded-full border-2 border-primary-blue" />
              </div>
            )}

            {/* Period background */}
            {dayPeriods.length > 0 && (
              <div
                className="absolute inset-0.5 rounded-md transition-all group-hover:scale-105"
                style={{
                  backgroundColor: dayPeriods[0].bgColor,
                  borderWidth: '1px',
                  borderColor: dayPeriods[0].borderColor,
                }}
              />
            )}

            {/* Multiple periods indicator */}
            {dayPeriods.length > 1 && (
              <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-primary-blue z-20" />
            )}
          </div>

          {/* Tooltip on hover */}
          {dayPeriods.length > 0 && (
            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-30 shadow-lg">
              {dayPeriods[0].name}
              <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900" />
            </div>
          )}
        </div>
      );
    }

    return days;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-card-lg p-6 border border-light">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-2xl text-dark font-semibold mb-1">Academic Calendar</h2>
            <p className="text-sm text-body">Manage trimesters, teaching periods, exams, and breaks</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Year Selector */}
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="px-4 py-2.5 border border-light rounded-xl text-sm text-body focus:outline-none focus:ring-2 focus:ring-primary-blue bg-white"
            >
              <option value={2024}>2024</option>
              <option value={2025}>2025</option>
              <option value={2026}>2026</option>
              <option value={2027}>2027</option>
            </select>

            {/* Campus Selector */}
            <select
              value={selectedCampus}
              onChange={(e) => setSelectedCampus(e.target.value)}
              className="px-4 py-2.5 border border-light rounded-xl text-sm text-body focus:outline-none focus:ring-2 focus:ring-primary-blue bg-white"
            >
              <option value="main">Main Campus</option>
              <option value="north">North Campus</option>
              <option value="south">South Campus</option>
            </select>

            {/* Add Period Button */}
            <button
              onClick={handleAddPeriod}
              className="px-4 py-2.5 bg-primary-blue text-white rounded-xl hover:bg-blue-600 transition-colors flex items-center gap-2 text-sm"
            >
              <Plus className="w-4 h-4" />
              Add Period
            </button>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-white rounded-2xl shadow-card-lg p-6 border border-light">
        <h3 className="text-sm font-semibold text-dark mb-4">Academic Period Types</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {periodTypes.map((type) => (
            <div key={type.value} className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded border"
                style={{
                  backgroundColor: type.bgColor,
                  borderColor: type.borderColor,
                }}
              />
              <span className="text-xs text-body">{type.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Trimester Timeline - Left Sidebar */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl shadow-card-lg p-4 border border-light">
            <h3 className="text-sm font-semibold text-dark mb-4">Academic Year</h3>
            <div className="space-y-6">
              {mockTrimesters.map((trimester, index) => (
                <div key={trimester.id} className="relative">
                  {/* Trimester Label */}
                  <div className="mb-3">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-3 h-3 rounded-full bg-primary-blue" />
                      <h4 className="text-sm font-semibold text-dark">{trimester.name}</h4>
                    </div>
                    <p className="text-xs text-body ml-5">
                      {trimester.startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {trimester.endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>

                  {/* Sessions */}
                  <div className="ml-5 space-y-2 border-l-2 border-light pl-3">
                    {trimester.sessions.map((session) => (
                      <div key={session.id}>
                        <p className="text-xs font-medium text-body">{session.name}</p>
                        <p className="text-xs text-body/70">
                          {session.startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {session.endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Connector line */}
                  {index < mockTrimesters.length - 1 && (
                    <div className="absolute left-1.5 top-full h-6 w-0.5 bg-light" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Calendar Months - Main Area */}
        <div className="lg:col-span-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {monthNames.map((monthName, monthIndex) => (
              <div key={monthIndex} className="bg-white rounded-2xl shadow-card-lg border border-light overflow-hidden">
                {/* Month Header */}
                <div className="bg-soft px-4 py-3 border-b border-light">
                  <h3 className="text-sm font-semibold text-dark">{monthName} {selectedYear}</h3>
                </div>

                {/* Calendar Grid */}
                <div className="p-4">
                  {/* Weekday Headers */}
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                      <div key={day} className="text-center text-xs font-medium text-body py-1">
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Days Grid */}
                  <div className="grid grid-cols-7 gap-1">
                    {renderCalendarMonth(monthIndex)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Period Detail Modal */}
      {selectedPeriod && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-card-xl max-w-md w-full">
            <div className="p-6 border-b border-light flex items-center justify-between">
              <h3 className="text-lg font-semibold text-dark">Period Details</h3>
              <button
                onClick={() => setSelectedPeriod(null)}
                className="p-2 hover:bg-soft rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-body" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-medium text-body mb-1 block">Period Name</label>
                <p className="text-sm text-dark font-medium">{selectedPeriod.name}</p>
              </div>

              <div>
                <label className="text-xs font-medium text-body mb-1 block">Type</label>
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded border"
                    style={{
                      backgroundColor: selectedPeriod.bgColor,
                      borderColor: selectedPeriod.borderColor,
                    }}
                  />
                  <span className="text-sm text-dark">
                    {periodTypes.find(t => t.value === selectedPeriod.type)?.label}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-body mb-1 block">Date Range</label>
                <p className="text-sm text-dark">
                  {selectedPeriod.startDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} - {selectedPeriod.endDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              </div>

              <div>
                <label className="text-xs font-medium text-body mb-1 block">Applies To</label>
                <div className="flex flex-wrap gap-2">
                  {selectedPeriod.programs.map((program, idx) => (
                    <span key={idx} className="px-3 py-1 bg-soft text-dark text-xs rounded-lg border border-light">
                      {program}
                    </span>
                  ))}
                </div>
              </div>

              {selectedPeriod.notes && (
                <div>
                  <label className="text-xs font-medium text-body mb-1 block">Notes</label>
                  <p className="text-sm text-dark">{selectedPeriod.notes}</p>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-light flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  handleDeletePeriod(selectedPeriod.id);
                }}
                className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors flex items-center gap-2 text-sm"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
              <button
                onClick={() => {
                  handleEditPeriod(selectedPeriod);
                  setSelectedPeriod(null);
                }}
                className="px-4 py-2 bg-primary-blue text-white rounded-xl hover:bg-blue-600 transition-colors flex items-center gap-2 text-sm"
              >
                <Edit2 className="w-4 h-4" />
                Edit Period
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Period Modal */}
      {isModalOpen && (
        <AddEditPeriodModal
          period={editingPeriod}
          onClose={() => setIsModalOpen(false)}
          onSave={(period) => {
            if (editingPeriod) {
              setPeriods(periods.map(p => p.id === period.id ? period : p));
            } else {
              setPeriods([...periods, { ...period, id: Date.now().toString() }]);
            }
            setIsModalOpen(false);
          }}
        />
      )}
    </div>
  );
}

// Add/Edit Period Modal Component
interface AddEditPeriodModalProps {
  period: AcademicPeriod | null;
  onClose: () => void;
  onSave: (period: AcademicPeriod) => void;
}

function AddEditPeriodModal({ period, onClose, onSave }: AddEditPeriodModalProps) {
  const [formData, setFormData] = useState({
    name: period?.name || '',
    type: period?.type || 'teaching',
    startDate: period?.startDate ? new Date(period.startDate).toISOString().split('T')[0] : '',
    endDate: period?.endDate ? new Date(period.endDate).toISOString().split('T')[0] : '',
    programs: period?.programs || ['All Programs'],
    notes: period?.notes || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedType = periodTypes.find(t => t.value === formData.type);
    if (!selectedType) return;

    const newPeriod: AcademicPeriod = {
      id: period?.id || Date.now().toString(),
      name: formData.name,
      type: formData.type as AcademicPeriod['type'],
      startDate: new Date(formData.startDate),
      endDate: new Date(formData.endDate),
      color: selectedType.color,
      bgColor: selectedType.bgColor,
      borderColor: selectedType.borderColor,
      programs: formData.programs,
      notes: formData.notes,
    };

    onSave(newPeriod);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-card-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-light flex items-center justify-between sticky top-0 bg-white">
          <h3 className="text-lg font-semibold text-dark">
            {period ? 'Edit Period' : 'Add New Period'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-soft rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-body" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Period Name */}
          <div>
            <label className="text-sm font-medium text-dark mb-2 block">
              Period Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Trimester 1 - Teaching Weeks"
              className="w-full px-4 py-2.5 border border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue"
            />
          </div>

          {/* Period Type */}
          <div>
            <label className="text-sm font-medium text-dark mb-2 block">
              Period Type <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-4 py-2.5 border border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue"
            >
              {periodTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-dark mb-2 block">
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-4 py-2.5 border border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-dark mb-2 block">
                End Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-4 py-2.5 border border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue"
              />
            </div>
          </div>

          {/* Color Preview */}
          <div>
            <label className="text-sm font-medium text-dark mb-2 block">Color Preview</label>
            <div className="flex items-center gap-3 p-4 rounded-xl border border-light">
              <div
                className="w-12 h-12 rounded-lg border-2"
                style={{
                  backgroundColor: periodTypes.find(t => t.value === formData.type)?.bgColor,
                  borderColor: periodTypes.find(t => t.value === formData.type)?.borderColor,
                }}
              />
              <div>
                <p className="text-sm font-medium text-dark">
                  {periodTypes.find(t => t.value === formData.type)?.label}
                </p>
                <p className="text-xs text-body">This color will be used in the calendar</p>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-sm font-medium text-dark mb-2 block">Notes (Optional)</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Add any additional information..."
              rows={3}
              className="w-full px-4 py-2.5 border border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-light">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-body hover:bg-soft rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-primary-blue text-white rounded-xl hover:bg-blue-600 transition-colors"
            >
              {period ? 'Update Period' : 'Save Period'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
