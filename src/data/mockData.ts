export interface Teacher {
  id: string;
  name: string;
  universityEmail: string;
  personalEmail: string;
  phone: string;
  department: string;
  expertise: string;
  industryField: string;
  currentlyInIndustry: boolean;
  activeThisTrimester: boolean;
  roleType?: 'Lecturer' | 'Marker' | 'Both';
  photo?: string;
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  department: string;
  teacherIds: string[];
}

export interface Room {
  id: string;
  name: string;
  level: string;
  capacity: number;
}

export interface ClassSession {
  id: string;
  day: string;
  date: string;
  startTime: string;
  endTime: string;
  subjectId: string;
  teacherId: string;
  roomId: string;
  level: string;
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: 'Admin' | 'Observer';
  status: 'Active' | 'Inactive';
  createdOn: string;
  avatar?: string;
}

export const mockTeachers: Teacher[] = [
  {
    id: 't1',
    name: 'Dr. Sarah Johnson',
    universityEmail: 'sarah.johnson@university.edu',
    personalEmail: 'sarah.j@email.com',
    phone: '+1 (555) 123-4567',
    department: 'Computer Science',
    expertise: 'Artificial Intelligence',
    industryField: 'AI & Machine Learning',
    currentlyInIndustry: true,
    activeThisTrimester: true
  },
  {
    id: 't2',
    name: 'Prof. Michael Chen',
    universityEmail: 'michael.chen@university.edu',
    personalEmail: 'm.chen@email.com',
    phone: '+1 (555) 234-5678',
    department: 'Computer Science',
    expertise: 'Data Science',
    industryField: 'Data Analytics',
    currentlyInIndustry: false,
    activeThisTrimester: true
  },
  {
    id: 't3',
    name: 'Dr. Emily Rodriguez',
    universityEmail: 'emily.rodriguez@university.edu',
    personalEmail: 'emily.r@email.com',
    phone: '+1 (555) 345-6789',
    department: 'Cybersecurity',
    expertise: 'Network Security',
    industryField: 'Cybersecurity',
    currentlyInIndustry: true,
    activeThisTrimester: true
  },
  {
    id: 't4',
    name: 'Dr. James Wilson',
    universityEmail: 'james.wilson@university.edu',
    personalEmail: 'j.wilson@email.com',
    phone: '+1 (555) 456-7890',
    department: 'Software Engineering',
    expertise: 'Web Development',
    industryField: 'Software Development',
    currentlyInIndustry: false,
    activeThisTrimester: true
  },
  {
    id: 't5',
    name: 'Prof. Amanda Brown',
    universityEmail: 'amanda.brown@university.edu',
    personalEmail: 'amanda.b@email.com',
    phone: '+1 (555) 567-8901',
    department: 'Data Science',
    expertise: 'Big Data',
    industryField: 'Data Engineering',
    currentlyInIndustry: true,
    activeThisTrimester: false
  },
  {
    id: 't6',
    name: 'Dr. Robert Taylor',
    universityEmail: 'robert.taylor@university.edu',
    personalEmail: 'r.taylor@email.com',
    phone: '+1 (555) 678-9012',
    department: 'Computer Science',
    expertise: 'Cloud Computing',
    industryField: 'Cloud Infrastructure',
    currentlyInIndustry: false,
    activeThisTrimester: true
  }
];

export const mockSubjects: Subject[] = [
  {
    id: 's1',
    code: 'CS-101',
    name: 'Introduction to Programming',
    department: 'Computer Science',
    teacherIds: ['t1', 't4']
  },
  {
    id: 's2',
    code: 'AI-202',
    name: 'Advanced Artificial Intelligence',
    department: 'Computer Science',
    teacherIds: ['t1']
  },
  {
    id: 's3',
    code: 'DS-301',
    name: 'Data Science Fundamentals',
    department: 'Data Science',
    teacherIds: ['t2', 't5']
  },
  {
    id: 's4',
    code: 'CY-101',
    name: 'Cybersecurity Basics',
    department: 'Cybersecurity',
    teacherIds: ['t3']
  },
  {
    id: 's5',
    code: 'SE-205',
    name: 'Software Engineering Principles',
    department: 'Software Engineering',
    teacherIds: ['t4']
  },
  {
    id: 's6',
    code: 'CC-303',
    name: 'Cloud Computing Architecture',
    department: 'Computer Science',
    teacherIds: ['t6']
  }
];

export const mockRooms: Room[] = [
  { id: 'r1', name: 'Room 1.1', level: 'Level 1', capacity: 30 },
  { id: 'r2', name: 'Room 1.2', level: 'Level 1', capacity: 25 },
  { id: 'r3', name: 'Room 2.1', level: 'Level 2', capacity: 40 },
  { id: 'r4', name: 'Room 2.2', level: 'Level 2', capacity: 35 },
  { id: 'r5', name: 'Room 11.1', level: 'Level 11', capacity: 50 },
  { id: 'r6', name: 'Room 11.2', level: 'Level 11', capacity: 45 }
];

// Today's date for real-time highlighting
const today = new Date();
const todayStr = today.toISOString().split('T')[0];
const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const todayDay = dayNames[today.getDay()];

export const mockClasses: ClassSession[] = [
  // Monday Classes
  {
    id: 'c1',
    day: 'Monday',
    date: '2025-01-06',
    startTime: '08:00',
    endTime: '10:00',
    subjectId: 's1',
    teacherId: 't1',
    roomId: 'r1',
    level: 'Level 1'
  },
  {
    id: 'c2',
    day: 'Monday',
    date: '2025-01-06',
    startTime: '09:00',
    endTime: '11:00',
    subjectId: 's3',
    teacherId: 't2',
    roomId: 'r3',
    level: 'Level 2'
  },
  {
    id: 'c3',
    day: 'Monday',
    date: '2025-01-06',
    startTime: '11:00',
    endTime: '13:00',
    subjectId: 's4',
    teacherId: 't3',
    roomId: 'r5',
    level: 'Level 11'
  },
  {
    id: 'c4',
    day: 'Monday',
    date: '2025-01-06',
    startTime: '14:00',
    endTime: '16:00',
    subjectId: 's2',
    teacherId: 't1',
    roomId: 'r2',
    level: 'Level 1'
  },
  
  // Tuesday Classes
  {
    id: 'c5',
    day: 'Tuesday',
    date: '2025-01-07',
    startTime: '08:00',
    endTime: '10:00',
    subjectId: 's5',
    teacherId: 't4',
    roomId: 'r1',
    level: 'Level 1'
  },
  {
    id: 'c6',
    day: 'Tuesday',
    date: '2025-01-07',
    startTime: '10:00',
    endTime: '12:00',
    subjectId: 's6',
    teacherId: 't6',
    roomId: 'r3',
    level: 'Level 2'
  },
  {
    id: 'c7',
    day: 'Tuesday',
    date: '2025-01-07',
    startTime: '13:00',
    endTime: '15:00',
    subjectId: 's3',
    teacherId: 't2',
    roomId: 'r5',
    level: 'Level 11'
  },

  // Wednesday Classes
  {
    id: 'c8',
    day: 'Wednesday',
    date: '2025-01-08',
    startTime: '09:00',
    endTime: '11:00',
    subjectId: 's2',
    teacherId: 't1',
    roomId: 'r1',
    level: 'Level 1'
  },
  {
    id: 'c9',
    day: 'Wednesday',
    date: '2025-01-08',
    startTime: '11:00',
    endTime: '13:00',
    subjectId: 's4',
    teacherId: 't3',
    roomId: 'r3',
    level: 'Level 2'
  },

  // Saturday Classes
  {
    id: 'c10',
    day: 'Saturday',
    date: '2025-01-11',
    startTime: '10:00',
    endTime: '12:00',
    subjectId: 's1',
    teacherId: 't4',
    roomId: 'r1',
    level: 'Level 1'
  },
  {
    id: 'c11',
    day: 'Saturday',
    date: '2025-01-11',
    startTime: '14:00',
    endTime: '16:00',
    subjectId: 's3',
    teacherId: 't2',
    roomId: 'r5',
    level: 'Level 11'
  }
];

// Helper function to check if a class is currently running
export function isClassRunning(classSession: ClassSession): boolean {
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();
  
  const [startHour, startMin] = classSession.startTime.split(':').map(Number);
  const [endHour, endMin] = classSession.endTime.split(':').map(Number);
  
  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;
  
  const isToday = classSession.day === todayDay || classSession.date === todayStr;
  
  return isToday && currentTime >= startMinutes && currentTime < endMinutes;
}

export const mockUsers: User[] = [
  {
    id: 'u1',
    fullName: 'John Anderson',
    email: 'john.anderson@university.edu',
    phone: '+1 (555) 111-2222',
    role: 'Admin',
    status: 'Active',
    createdOn: '2024-08-15'
  },
  {
    id: 'u2',
    fullName: 'Sarah Mitchell',
    email: 'sarah.mitchell@university.edu',
    phone: '+1 (555) 222-3333',
    role: 'Admin',
    status: 'Active',
    createdOn: '2024-09-20'
  },
  {
    id: 'u3',
    fullName: 'David Thompson',
    email: 'david.thompson@university.edu',
    phone: '+1 (555) 333-4444',
    role: 'Observer',
    status: 'Active',
    createdOn: '2024-10-05'
  },
  {
    id: 'u4',
    fullName: 'Emily Parker',
    email: 'emily.parker@university.edu',
    phone: '+1 (555) 444-5555',
    role: 'Observer',
    status: 'Active',
    createdOn: '2024-11-12'
  },
  {
    id: 'u5',
    fullName: 'Michael Roberts',
    email: 'michael.roberts@university.edu',
    phone: '+1 (555) 555-6666',
    role: 'Admin',
    status: 'Inactive',
    createdOn: '2024-07-22'
  },
  {
    id: 'u6',
    fullName: 'Lisa Johnson',
    email: 'lisa.johnson@university.edu',
    phone: '+1 (555) 666-7777',
    role: 'Observer',
    status: 'Inactive',
    createdOn: '2024-06-10'
  },
  {
    id: 'u7',
    fullName: 'James Wilson',
    email: 'james.wilson@university.edu',
    phone: '+1 (555) 777-8888',
    role: 'Admin',
    status: 'Active',
    createdOn: '2025-01-03'
  },
  {
    id: 'u8',
    fullName: 'Rachel Green',
    email: 'rachel.green@university.edu',
    phone: '+1 (555) 888-9999',
    role: 'Observer',
    status: 'Active',
    createdOn: '2024-12-18'
  }
];

export { todayDay, todayStr };