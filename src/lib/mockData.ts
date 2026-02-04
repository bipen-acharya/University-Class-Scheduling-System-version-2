export interface Teacher {
  id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  employeeId: string;
  classesAssigned: number;
  photo?: string;
  // New fields for enhanced features
  status: "active" | "inactive";
  personalEmail?: string;
  universityEmail: string;
  areaOfExpertise: string[];
  industryField: string;
  researchInterests?: string;
  workingInIndustry: boolean;
}

export interface Class {
  id: string;
  subjectCode: string;
  subjectName: string;
  teacherId: string;
  teacherName: string;
  room: string;
  classType: "Lecture" | "Tutorial" | "Workshop";
  day: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday";
  startTime: string;
  endTime: string;
  color?: string;
}

export const mockTeachers: Teacher[] = [
  {
    id: "1",
    name: "Dr. Sarah Johnson",
    email: "sarah.johnson@university.edu",
    universityEmail: "sarah.johnson@university.edu",
    personalEmail: "sarah.j.personal@gmail.com",
    phone: "+1 234 567 8901",
    department: "Computer Science",
    employeeId: "EMP001",
    classesAssigned: 8,
    status: "active",
    areaOfExpertise: ["Cyber Security", "Networking"],
    industryField: "IT Industry",
    researchInterests: "Security protocols, Cryptography, Network security architectures",
    workingInIndustry: true,
  },
  {
    id: "2",
    name: "Prof. Michael Chen",
    email: "michael.chen@university.edu",
    universityEmail: "michael.chen@university.edu",
    personalEmail: "mchen.academic@gmail.com",
    phone: "+1 234 567 8902",
    department: "Mathematics",
    employeeId: "EMP002",
    classesAssigned: 6,
    status: "active",
    areaOfExpertise: ["Applied Mathematics", "Statistics"],
    industryField: "Finance",
    researchInterests: "Quantitative finance, Statistical modeling, Risk analysis",
    workingInIndustry: false,
  },
  {
    id: "3",
    name: "Dr. Emily Rodriguez",
    email: "emily.rodriguez@university.edu",
    universityEmail: "emily.rodriguez@university.edu",
    personalEmail: "emily.rod@outlook.com",
    phone: "+1 234 567 8903",
    department: "Physics",
    employeeId: "EMP003",
    classesAssigned: 7,
    status: "inactive",
    areaOfExpertise: ["Quantum Physics", "Theoretical Physics"],
    industryField: "Education",
    researchInterests: "Quantum computing applications, Quantum entanglement",
    workingInIndustry: false,
  },
  {
    id: "4",
    name: "Prof. David Wilson",
    email: "david.wilson@university.edu",
    universityEmail: "david.wilson@university.edu",
    personalEmail: "dwilson.tech@proton.me",
    phone: "+1 234 567 8904",
    department: "Computer Science",
    employeeId: "EMP004",
    classesAssigned: 5,
    status: "active",
    areaOfExpertise: ["Artificial Intelligence", "Machine Learning"],
    industryField: "IT Industry",
    researchInterests: "Deep learning, Natural language processing, Computer vision",
    workingInIndustry: true,
  },
  {
    id: "5",
    name: "Dr. Lisa Anderson",
    email: "lisa.anderson@university.edu",
    universityEmail: "lisa.anderson@university.edu",
    phone: "+1 234 567 8905",
    department: "Engineering",
    employeeId: "EMP005",
    classesAssigned: 9,
    status: "active",
    areaOfExpertise: ["Mechanical Engineering", "Robotics"],
    industryField: "Engineering",
    researchInterests: "Autonomous systems, Industrial automation",
    workingInIndustry: true,
  },
];

export const mockClasses: Class[] = [
  {
    id: "1",
    subjectCode: "CS101",
    subjectName: "Introduction to Programming",
    teacherId: "1",
    teacherName: "Dr. Sarah Johnson",
    room: "A101",
    classType: "Lecture",
    day: "Monday",
    startTime: "09:00",
    endTime: "11:00",
    color: "#3B82F6",
  },
  {
    id: "2",
    subjectCode: "CS101",
    subjectName: "Introduction to Programming",
    teacherId: "1",
    teacherName: "Dr. Sarah Johnson",
    room: "Lab 1",
    classType: "Tutorial",
    day: "Wednesday",
    startTime: "14:00",
    endTime: "16:00",
    color: "#3B82F6",
  },
  {
    id: "3",
    subjectCode: "MATH201",
    subjectName: "Linear Algebra",
    teacherId: "2",
    teacherName: "Prof. Michael Chen",
    room: "B205",
    classType: "Lecture",
    day: "Tuesday",
    startTime: "10:00",
    endTime: "12:00",
    color: "#EC4899",
  },
  {
    id: "4",
    subjectCode: "PHYS301",
    subjectName: "Quantum Mechanics",
    teacherId: "3",
    teacherName: "Dr. Emily Rodriguez",
    room: "C301",
    classType: "Lecture",
    day: "Monday",
    startTime: "14:00",
    endTime: "16:00",
    color: "#F59E0B",
  },
  {
    id: "5",
    subjectCode: "CS202",
    subjectName: "Data Structures",
    teacherId: "4",
    teacherName: "Prof. David Wilson",
    room: "A102",
    classType: "Lecture",
    day: "Thursday",
    startTime: "09:00",
    endTime: "11:00",
    color: "#8B5CF6",
  },
  {
    id: "6",
    subjectCode: "ENG101",
    subjectName: "Engineering Mechanics",
    teacherId: "5",
    teacherName: "Dr. Lisa Anderson",
    room: "D101",
    classType: "Lecture",
    day: "Friday",
    startTime: "10:00",
    endTime: "12:00",
    color: "#10B981",
  },
  {
    id: "7",
    subjectCode: "CS101",
    subjectName: "Introduction to Programming",
    teacherId: "1",
    teacherName: "Dr. Sarah Johnson",
    room: "A101",
    classType: "Workshop",
    day: "Friday",
    startTime: "14:00",
    endTime: "17:00",
    color: "#3B82F6",
  },
  {
    id: "8",
    subjectCode: "MATH201",
    subjectName: "Linear Algebra",
    teacherId: "2",
    teacherName: "Prof. Michael Chen",
    room: "B205",
    classType: "Tutorial",
    day: "Thursday",
    startTime: "14:00",
    endTime: "15:30",
    color: "#EC4899",
  },
];

export interface Conflict {
  id: string;
  type: "teacher" | "room" | "time";
  classA: Class;
  classB: Class;
  suggestedFix: string;
}

export const mockConflicts: Conflict[] = [
  {
    id: "1",
    type: "teacher",
    classA: mockClasses[0],
    classB: {
      id: "99",
      subjectCode: "CS301",
      subjectName: "Advanced Algorithms",
      teacherId: "1",
      teacherName: "Dr. Sarah Johnson",
      room: "B101",
      classType: "Lecture",
      day: "Monday",
      startTime: "09:00",
      endTime: "11:00",
      color: "#6366F1",
    },
    suggestedFix: "Move CS301 to Tuesday 09:00-11:00",
  },
];