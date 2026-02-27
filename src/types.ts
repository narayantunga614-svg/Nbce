export type Grade = 'A' | 'B' | 'C' | 'D' | 'F' | 'N/A';

export interface Subject {
  name: string;
  score: number;
  grade: Grade;
}

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: string;
  enrollmentDate: string;
  gradeLevel: string;
  status: 'Active' | 'Inactive' | 'Graduated';
  attendance: number; // percentage
  gpa: number;
  subjects: Subject[];
  notes: string;
  mobileNo: string;
  guardianName: string;
  photo?: string;
  course: string;
}

export interface DashboardStats {
  totalStudents: number;
  averageGpa: number;
  averageAttendance: number;
  gradeDistribution: { name: string; value: number }[];
}
