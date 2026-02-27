import { Student } from './types';

export const MOCK_STUDENTS: Student[] = [
  {
    id: "STU001",
    firstName: "Alice",
    lastName: "Johnson",
    email: "alice.j@example.edu",
    dateOfBirth: "2008-05-15",
    enrollmentDate: "2023-09-01",
    gradeLevel: "Grade 10",
    status: "Active",
    attendance: 98,
    gpa: 3.8,
    subjects: [
      { name: "Mathematics", score: 95, grade: "A" },
      { name: "Physics", score: 88, grade: "B" },
      { name: "History", score: 92, grade: "A" }
    ],
    notes: "Exceptional performance in STEM subjects.",
    mobileNo: "+1 (555) 010-2233",
    guardianName: "Robert Johnson",
    course: "ADCA (1 Year)"
  },
  {
    id: "STU002",
    firstName: "Bob",
    lastName: "Smith",
    email: "bob.smith@example.edu",
    dateOfBirth: "2007-11-20",
    enrollmentDate: "2022-09-01",
    gradeLevel: "Grade 11",
    status: "Active",
    attendance: 92,
    gpa: 3.2,
    subjects: [
      { name: "Mathematics", score: 78, grade: "C" },
      { name: "English", score: 85, grade: "B" },
      { name: "Biology", score: 82, grade: "B" }
    ],
    notes: "Active in basketball team.",
    mobileNo: "+1 (555) 010-4455",
    guardianName: "Sarah Smith",
    course: "DCA (6 Months)"
  },
  {
    id: "STU003",
    firstName: "Charlie",
    lastName: "Davis",
    email: "charlie.d@example.edu",
    dateOfBirth: "2009-02-10",
    enrollmentDate: "2024-01-15",
    gradeLevel: "Grade 9",
    status: "Active",
    attendance: 95,
    gpa: 3.9,
    subjects: [
      { name: "Art", score: 98, grade: "A" },
      { name: "Geography", score: 94, grade: "A" },
      { name: "Music", score: 96, grade: "A" }
    ],
    notes: "New student, very creative.",
    mobileNo: "+1 (555) 010-6677",
    guardianName: "Michael Davis",
    course: "CCA (3 Months)"
  },
  {
    id: "STU004",
    firstName: "Diana",
    lastName: "Prince",
    email: "diana.p@example.edu",
    dateOfBirth: "2008-08-25",
    enrollmentDate: "2023-09-01",
    gradeLevel: "Grade 10",
    status: "Inactive",
    attendance: 45,
    gpa: 2.1,
    subjects: [
      { name: "Mathematics", score: 62, grade: "D" },
      { name: "English", score: 68, grade: "D" }
    ],
    notes: "On medical leave.",
    mobileNo: "+1 (555) 010-8899",
    guardianName: "Hippolyta Prince",
    course: "DCA (6 Months)"
  }
];

export const COMPUTER_COURSES = [
  "CCA (3 Months)",
  "DCA (6 Months)",
  "ADCA (1 Year)",
  "DTP (3 Months)",
  "Tally Prime (3 Months)",
  "PGDCA (1 Year)",
  "DOAP (1 Year)",
  "ADIT (2 Year)",
  "Hardware & Networking (1 Year)",
  "Web Development (1 Year)",
  "Cyber Security (1 Year)"
];
