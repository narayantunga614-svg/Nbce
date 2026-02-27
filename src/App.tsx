/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  User, 
  GraduationCap,
  Users, 
  TrendingUp, 
  Calendar, 
  Mail, 
  X, 
  Download,
  Filter,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Phone,
  ShieldCheck,
  Lock,
  LogIn,
  LogOut,
  UserCheck,
  Camera,
  BookOpen,
  IdCard
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { Student, Grade } from './types';
import { MOCK_STUDENTS, COMPUTER_COURSES } from './constants';
import { cn, generateId, calculateGrade } from './utils';

export default function App() {
  const [user, setUser] = useState<{ role: 'admin' | 'student', id?: string } | null>(null);
  const [loginError, setLoginError] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [isLoaded, setIsLoaded] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<string | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [showReportSuccess, setShowReportSuccess] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [newStudentId, setNewStudentId] = useState<string | null>(null);
  const [loginRole, setLoginRole] = useState<'admin' | 'student'>('admin');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [showIdCard, setShowIdCard] = useState<Student | null>(null);

  // Load data
  useEffect(() => {
    const saved = localStorage.getItem('student_ledger_data');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setStudents(parsed);
      } catch (e) {
        console.error("Failed to parse students", e);
        setStudents(MOCK_STUDENTS);
      }
    } else {
      setStudents(MOCK_STUDENTS);
    }
    setIsLoaded(true);
  }, []);

  // Save data
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('student_ledger_data', JSON.stringify(students));
    }
  }, [students, isLoaded]);

  const stats = useMemo(() => {
    const total = students.length;
    const avgGpa = total > 0 ? students.reduce((acc, s) => acc + s.gpa, 0) / total : 0;
    const avgAttendance = total > 0 ? students.reduce((acc, s) => acc + s.attendance, 0) / total : 0;
    
    const gradeCounts: Record<string, number> = { A: 0, B: 0, C: 0, D: 0, F: 0 };
    students.forEach(s => {
      const grade = calculateGrade(s.gpa * 25); // Rough conversion for chart
      if (gradeCounts[grade] !== undefined) gradeCounts[grade]++;
    });

    const distribution = Object.entries(gradeCounts).map(([name, value]) => ({ name, value }));

    return { total, avgGpa, avgAttendance, distribution };
  }, [students]);

  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const matchesSearch = `${s.firstName} ${s.lastName} ${s.id}`.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'All' || s.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [students, searchTerm, filterStatus]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddStudent = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newStudent: Student = {
      id: `STU-${generateId().substring(0, 4)}`,
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      email: formData.get('email') as string,
      dateOfBirth: formData.get('dob') as string,
      enrollmentDate: new Date().toISOString().split('T')[0],
      gradeLevel: formData.get('gradeLevel') as string,
      status: 'Active',
      attendance: 100,
      gpa: 0,
      subjects: [],
      notes: '',
      mobileNo: formData.get('mobileNo') as string,
      guardianName: formData.get('guardianName') as string,
      photo: photoPreview || undefined,
      course: formData.get('course') as string
    };
    setStudents([...students, newStudent]);
    setIsAddModalOpen(false);
    setPhotoPreview(null);
  };

  const handleDeleteStudent = (id: string) => {
    setStudents(prev => prev.filter(s => s.id !== id));
    setSelectedStudent(null);
    setStudentToDelete(null);
  };

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const id = formData.get('id') as string;
    const password = formData.get('password') as string;
    const role = formData.get('role') as string;

    if (role === 'admin') {
      if (id === 'Suva@123456' && password === '1234567') {
        setUser({ role: 'admin' });
        setLoginError('');
      } else {
        setLoginError('Invalid Admin credentials');
      }
    } else {
      const student = students.find(s => s.id === id);
      if (student) {
        setUser({ role: 'student', id: student.id });
        setLoginError('');
      } else {
        setLoginError('Student ID not found');
      }
    }
  };

  const handleLogout = () => {
    setUser(null);
    setSelectedStudent(null);
    setIsSignUp(false);
    setNewStudentId(null);
  };

  const handleSignUp = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const id = `STU-${generateId().substring(0, 4)}`;
    const newStudent: Student = {
      id,
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      email: formData.get('email') as string,
      dateOfBirth: formData.get('dob') as string,
      enrollmentDate: new Date().toISOString().split('T')[0],
      gradeLevel: formData.get('gradeLevel') as string,
      status: 'Active',
      attendance: 100,
      gpa: 0,
      subjects: [],
      notes: '',
      mobileNo: formData.get('mobileNo') as string,
      guardianName: formData.get('guardianName') as string,
      photo: photoPreview || undefined,
      course: formData.get('course') as string
    };
    setStudents([...students, newStudent]);
    setNewStudentId(id);
    setIsSignUp(false);
    setPhotoPreview(null);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-4 relative overflow-hidden">
        {/* Watermark Background */}
        <div className="fixed inset-0 pointer-events-none flex items-center justify-center opacity-[0.03] z-0">
          <img 
            src="https://nbceindia.in/images/skill-logo.png" 
            alt="Watermark" 
            className="w-[800px] rotate-[-15deg]"
            referrerPolicy="no-referrer"
          />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 border border-black/5"
        >
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center overflow-hidden border border-black/5 shadow-sm mx-auto mb-4">
              <img src="https://nbceindia.in/images/logo.png" alt="NBCE Logo" className="w-full h-full object-contain p-2" referrerPolicy="no-referrer" />
            </div>
            <h1 className="font-serif text-2xl font-bold">Nbce Student Record</h1>
            <p className="text-xs text-black/40 uppercase tracking-widest font-bold mt-1">
              {isSignUp ? 'Student Registration' : 'Portal Login'}
            </p>
          </div>

          {newStudentId && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-center"
            >
              <p className="text-[10px] uppercase tracking-widest font-bold text-emerald-600 mb-1">Registration Successful</p>
              <p className="text-sm font-bold text-emerald-800">Your Student ID: <span className="font-mono text-lg">{newStudentId}</span></p>
              <p className="text-[10px] text-emerald-600 mt-2">Please use this ID to sign in.</p>
              <button 
                onClick={() => setNewStudentId(null)}
                className="mt-3 text-[10px] font-bold uppercase tracking-widest text-emerald-700 underline"
              >
                Dismiss
              </button>
            </motion.div>
          )}

          {!isSignUp ? (
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="flex bg-[#F1F3F5] p-1 rounded-xl">
                <label className="flex-1">
                  <input 
                    type="radio" 
                    name="role" 
                    value="admin" 
                    checked={loginRole === 'admin'} 
                    onChange={() => setLoginRole('admin')}
                    className="hidden peer" 
                  />
                  <div className="text-center py-2 text-xs font-bold uppercase tracking-widest cursor-pointer rounded-lg transition-all peer-checked:bg-white peer-checked:shadow-sm">
                    Admin
                  </div>
                </label>
                <label className="flex-1">
                  <input 
                    type="radio" 
                    name="role" 
                    value="student" 
                    checked={loginRole === 'student'} 
                    onChange={() => setLoginRole('student')}
                    className="hidden peer" 
                  />
                  <div className="text-center py-2 text-xs font-bold uppercase tracking-widest cursor-pointer rounded-lg transition-all peer-checked:bg-white peer-checked:shadow-sm">
                    Student
                  </div>
                </label>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-black/40">User ID / Student ID</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-black/20" size={18} />
                    <input required name="id" type="text" placeholder="Enter ID" className="w-full pl-12 pr-4 py-3 bg-[#F1F3F5] rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5" />
                  </div>
                </div>
                {loginRole === 'admin' && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-black/40">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-black/20" size={18} />
                      <input name="password" type="password" placeholder="••••••••" className="w-full pl-12 pr-4 py-3 bg-[#F1F3F5] rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5" />
                    </div>
                  </div>
                )}
              </div>

              {loginError && (
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="p-3 bg-red-50 text-red-600 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle size={14} />
                  {loginError}
                </motion.div>
              )}

              <button type="submit" className="w-full py-4 bg-black text-white rounded-xl font-bold uppercase tracking-widest hover:bg-black/80 transition-all flex items-center justify-center gap-2">
                <LogIn size={18} />
                Sign In
              </button>

              {loginRole === 'student' && (
                <p className="text-center text-xs text-black/40">
                  New student?{' '}
                  <button 
                    type="button"
                    onClick={() => setIsSignUp(true)}
                    className="text-black font-bold hover:underline"
                  >
                    Register here
                  </button>
                </p>
              )}
            </form>
          ) : (
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="flex justify-center mb-4">
                <div className="relative group">
                  <div className="w-20 h-20 rounded-2xl bg-[#F1F3F5] border-2 border-dashed border-black/10 flex items-center justify-center overflow-hidden">
                    {photoPreview ? (
                      <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="text-black/20" size={24} />
                    )}
                  </div>
                  <label className="absolute inset-0 cursor-pointer flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl">
                    <span className="text-[10px] text-white font-bold uppercase tracking-widest">Photo</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                  </label>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-black/40">First Name</label>
                  <input required name="firstName" type="text" className="w-full px-4 py-2.5 bg-[#F1F3F5] rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-black/40">Last Name</label>
                  <input required name="lastName" type="text" className="w-full px-4 py-2.5 bg-[#F1F3F5] rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest font-bold text-black/40">Email Address</label>
                <input required name="email" type="email" className="w-full px-4 py-2.5 bg-[#F1F3F5] rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-black/40">Date of Birth</label>
                  <input required name="dob" type="date" className="w-full px-4 py-2.5 bg-[#F1F3F5] rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-black/40">Grade Level</label>
                  <select name="gradeLevel" className="w-full px-4 py-2.5 bg-[#F1F3F5] rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5">
                    {[...Array(12)].map((_, i) => (
                      <option key={i + 1} value={`Grade ${i + 1}`}>Grade {i + 1}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-black/40">Mobile No.</label>
                  <input required name="mobileNo" type="tel" className="w-full px-4 py-2.5 bg-[#F1F3F5] rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-black/40">Guardian Name</label>
                  <input required name="guardianName" type="text" className="w-full px-4 py-2.5 bg-[#F1F3F5] rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest font-bold text-black/40">Computer Course</label>
                <select required name="course" className="w-full px-4 py-2.5 bg-[#F1F3F5] rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5">
                  <option value="">Select a Course</option>
                  {COMPUTER_COURSES.map((course, i) => (
                    <option key={i} value={course}>{course}</option>
                  ))}
                </select>
              </div>

              <div className="pt-4 space-y-3">
                <button type="submit" className="w-full py-4 bg-black text-white rounded-xl font-bold uppercase tracking-widest hover:bg-black/80 transition-all">
                  Register Account
                </button>
                <button 
                  type="button"
                  onClick={() => setIsSignUp(false)}
                  className="w-full py-3 border border-black/10 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-black/5 transition-all"
                >
                  Back to Login
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    );
  }

  const studentData = user.role === 'student' ? students.find(s => s.id === user.id) : null;

  if (user.role === 'student' && studentData) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex flex-col relative overflow-hidden">
        {/* Watermark Background */}
        <div className="fixed inset-0 pointer-events-none flex items-center justify-center opacity-[0.03] z-0">
          <img src="https://nbceindia.in/images/skill-logo.png" alt="Watermark" className="w-[800px] rotate-[-15deg]" referrerPolicy="no-referrer" />
        </div>

        <header className="bg-white border-b border-black/5 px-8 py-6 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center overflow-hidden border border-black/5 shadow-sm">
              <img src="https://nbceindia.in/images/logo.png" alt="NBCE Logo" className="w-full h-full object-contain p-1" referrerPolicy="no-referrer" />
            </div>
            <div>
              <h1 className="font-serif text-2xl font-bold tracking-tight">Nbce Student Portal</h1>
              <p className="text-[10px] uppercase tracking-widest text-black/40 font-semibold">Personal Academic Record</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowIdCard(studentData)}
              className="flex items-center gap-2 px-4 py-2 bg-black text-white hover:bg-black/80 rounded-full text-xs font-bold uppercase tracking-widest transition-all"
            >
              <IdCard size={16} />
              Generate ID Card
            </button>
            <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 bg-black/5 hover:bg-black/10 rounded-full text-xs font-bold uppercase tracking-widest transition-all">
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </header>

        <main className="flex-1 p-8 relative z-10">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-black/5">
              <div className="p-8 bg-black text-white flex items-center gap-6">
                <div className="w-24 h-24 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-3xl font-bold overflow-hidden">
                  {studentData.photo ? (
                    <img src={studentData.photo} alt="Student" className="w-full h-full object-cover" />
                  ) : (
                    <>{studentData.firstName[0]}{studentData.lastName[0]}</>
                  )}
                </div>
                <div>
                  <h2 className="font-serif text-3xl font-bold">{studentData.firstName} {studentData.lastName}</h2>
                  <p className="opacity-60 font-mono">{studentData.id} • {studentData.gradeLevel}</p>
                </div>
              </div>
              
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <h3 className="font-serif italic text-lg border-b border-black/5 pb-2">Personal Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <InfoItem label="Email" value={studentData.email} icon={<Mail size={14} />} />
                    <InfoItem label="Mobile" value={studentData.mobileNo} icon={<Phone size={14} />} />
                    <InfoItem label="Guardian" value={studentData.guardianName} icon={<ShieldCheck size={14} />} />
                    <InfoItem label="DOB" value={studentData.dateOfBirth} icon={<Calendar size={14} />} />
                    <InfoItem label="Course" value={studentData.course} icon={<BookOpen size={14} />} />
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="font-serif italic text-lg border-b border-black/5 pb-2">Academic Status</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-[#F8F9FA] rounded-2xl">
                      <p className="text-[10px] uppercase tracking-widest font-bold text-black/40 mb-1">GPA</p>
                      <p className="text-2xl font-mono font-bold">{studentData.gpa.toFixed(2)}</p>
                    </div>
                    <div className="p-4 bg-[#F8F9FA] rounded-2xl">
                      <p className="text-[10px] uppercase tracking-widest font-bold text-black/40 mb-1">Attendance</p>
                      <p className="text-2xl font-mono font-bold">{studentData.attendance}%</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8 border-t border-black/5">
                <h3 className="font-serif italic text-lg mb-4">Subject Performance</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {studentData.subjects.map((subject, idx) => (
                    <div key={idx} className="p-4 border border-black/5 rounded-2xl flex items-center justify-between">
                      <div>
                        <p className="font-bold text-sm">{subject.name}</p>
                        <p className="text-[10px] text-black/40 uppercase font-bold tracking-widest">Score: {subject.score}</p>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-bold text-sm">
                        {subject.grade}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const handleGenerateReport = async () => {
    setIsGeneratingReport(true);
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    try {
      const headers = ['ID', 'First Name', 'Last Name', 'Email', 'Grade Level', 'Course', 'GPA', 'Attendance', 'Status', 'Guardian', 'Mobile'];
      const rows = students.map(s => [
        s.id,
        s.firstName,
        s.lastName,
        s.email,
        s.gradeLevel,
        s.course,
        s.gpa.toFixed(2),
        `${s.attendance}%`,
        s.status,
        s.guardianName,
        s.mobileNo
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `Semester_Report_${new Date().getFullYear()}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setShowReportSuccess(true);
      setTimeout(() => setShowReportSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to generate report', error);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Watermark Background */}
      <div className="fixed inset-0 pointer-events-none flex items-center justify-center opacity-[0.03] z-0">
        <img 
          src="https://nbceindia.in/images/skill-logo.png" 
          alt="Watermark" 
          className="w-[800px] rotate-[-15deg]"
          referrerPolicy="no-referrer"
          onError={(e) => {
            e.currentTarget.src = "https://nbceindia.in/images/logo.png";
          }}
        />
      </div>

      {/* Sidebar / Header */}
      <header className="bg-white border-b border-black/5 px-8 py-6 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center overflow-hidden border border-black/5 shadow-sm">
            <img 
              src="https://nbceindia.in/images/logo.png" 
              alt="NBCE Logo" 
              className="w-full h-full object-contain p-1" 
              referrerPolicy="no-referrer"
              onError={(e) => {
                // Fallback if the external image fails to load
                e.currentTarget.src = "https://picsum.photos/seed/nbce/200/200";
              }}
            />
          </div>
          <div>
            <h1 className="font-serif text-2xl font-bold tracking-tight">Nbce Student Record</h1>
            <p className="text-[10px] uppercase tracking-widest text-black/40 font-semibold">Academic Management System</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-bold uppercase tracking-widest">
            <UserCheck size={14} />
            Admin Access
          </div>
          <button onClick={handleLogout} className="p-2 hover:bg-black/5 rounded-full transition-colors text-black/40 hover:text-black" title="Logout">
            <LogOut size={20} />
          </button>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-black/30" size={16} />
            <input 
              type="text" 
              placeholder="Search students..." 
              className="pl-10 pr-4 py-2 bg-[#F1F3F5] rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-black/5 w-64 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-black text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-black/80 transition-colors"
          >
            <Plus size={16} />
            Add Student
          </button>
        </div>
      </header>

      <main className="flex-1 p-8 max-w-[1600px] mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Stats & List */}
        <div className="lg:col-span-8 space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard 
              icon={<Users className="text-blue-500" />} 
              label="Total Students" 
              value={stats.total.toString()} 
              trend="+2 this month"
            />
            <StatCard 
              icon={<TrendingUp className="text-emerald-500" />} 
              label="Average GPA" 
              value={stats.avgGpa.toFixed(2)} 
              trend="Top 5% region"
            />
            <StatCard 
              icon={<Calendar className="text-orange-500" />} 
              label="Avg. Attendance" 
              value={`${stats.avgAttendance.toFixed(1)}%`} 
              trend="Stable"
            />
          </div>

          {/* Student List */}
          <div className="bg-white rounded-2xl border border-black/5 overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-black/5 flex items-center justify-between bg-white">
              <h2 className="font-serif italic text-lg">Student Directory</h2>
              <div className="flex items-center gap-2">
                <select 
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="text-xs font-semibold uppercase tracking-wider bg-[#F1F3F5] px-3 py-1.5 rounded-md focus:outline-none"
                >
                  <option value="All">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Graduated">Graduated</option>
                </select>
                <button className="p-2 hover:bg-black/5 rounded-md transition-colors">
                  <Filter size={16} className="text-black/40" />
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <div className="min-w-[800px]">
                <div className="grid grid-cols-[80px_1.5fr_1fr_1fr_1fr_100px] bg-[#F8F9FA]">
                  <div className="data-grid-header">ID</div>
                  <div className="data-grid-header">Student Name</div>
                  <div className="data-grid-header">Grade Level</div>
                  <div className="data-grid-header">GPA</div>
                  <div className="data-grid-header">Attendance</div>
                  <div className="data-grid-header">Status</div>
                </div>
                <div className="divide-y divide-black/5">
                  {filteredStudents.map((student) => (
                    <div 
                      key={student.id} 
                      className="data-grid-row"
                      onClick={() => setSelectedStudent(student)}
                    >
                      <div className="px-4 py-4 font-mono text-[11px] opacity-50">{student.id}</div>
                      <div className="px-4 py-4 font-medium flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center text-[10px] font-bold overflow-hidden">
                          {student.photo ? (
                            <img src={student.photo} alt="Avatar" className="w-full h-full object-cover" />
                          ) : (
                            <>{student.firstName[0]}{student.lastName[0]}</>
                          )}
                        </div>
                        {student.firstName} {student.lastName}
                      </div>
                      <div className="px-4 py-4 text-sm opacity-70">{student.gradeLevel}</div>
                      <div className="px-4 py-4 font-mono text-sm">{student.gpa.toFixed(2)}</div>
                      <div className="px-4 py-4">
                        <div className="w-full bg-black/5 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className={cn(
                              "h-full rounded-full",
                              student.attendance > 90 ? "bg-emerald-500" : student.attendance > 75 ? "bg-orange-500" : "bg-red-500"
                            )}
                            style={{ width: `${student.attendance}%` }}
                          />
                        </div>
                      </div>
                      <div className="px-4 py-4">
                        <span className={cn(
                          "text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full",
                          student.status === 'Active' ? "bg-emerald-100 text-emerald-700" : 
                          student.status === 'Inactive' ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
                        )}>
                          {student.status}
                        </span>
                      </div>
                    </div>
                  ))}
                  {filteredStudents.length === 0 && (
                    <div className="py-20 text-center text-black/30 italic">
                      No students found matching your criteria.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Charts & Details */}
        <div className="lg:col-span-4 space-y-8">
          {/* Grade Distribution Chart */}
          <div className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm">
            <h3 className="font-serif italic text-sm mb-6">Grade Distribution</h3>
            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.distribution}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#00000010" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: '#00000040' }} 
                  />
                  <YAxis hide />
                  <Tooltip 
                    cursor={{ fill: '#00000005' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="value" fill="#000000" radius={[4, 4, 0, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quick Actions / Recent Activity */}
          <div className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm">
            <h3 className="font-serif italic text-sm mb-4">System Health</h3>
            <div className="space-y-4">
              <HealthItem 
                icon={<CheckCircle2 className="text-emerald-500" size={16} />} 
                label="Database Sync" 
                status={`Last sync: ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`} 
              />
              <HealthItem 
                icon={isGeneratingReport ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}><TrendingUp size={16} className="text-blue-500" /></motion.div> : <AlertCircle className="text-orange-500" size={16} />} 
                label="Report Generation" 
                status={isGeneratingReport ? "Processing..." : "Ready"} 
              />
              <HealthItem 
                icon={<CheckCircle2 className="text-emerald-500" size={16} />} 
                label="Cloud Backup" 
                status="Completed" 
              />
            </div>
            <button 
              onClick={handleGenerateReport}
              disabled={isGeneratingReport || students.length === 0}
              className={cn(
                "w-full mt-6 py-3 border border-black/10 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2",
                isGeneratingReport ? "bg-black/5 text-black/40 cursor-not-allowed" : "hover:bg-black hover:text-white"
              )}
            >
              {isGeneratingReport ? (
                <>
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                    <Download size={14} />
                  </motion.div>
                  Generating...
                </>
              ) : (
                "Generate Semester Report"
              )}
            </button>
            
            <AnimatePresence>
              {showReportSuccess && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="mt-4 p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-2 text-emerald-700 text-[10px] font-bold uppercase tracking-wider"
                >
                  <CheckCircle2 size={14} />
                  Report Downloaded Successfully
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Student Detail Modal */}
      <AnimatePresence>
        {selectedStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-end">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedStudent(null)}
              className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-xl h-full bg-white shadow-2xl flex flex-col"
            >
              <div className="p-8 border-b border-black/5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-black text-white flex items-center justify-center text-xl font-bold overflow-hidden">
                    {selectedStudent.photo ? (
                      <img src={selectedStudent.photo} alt="Student" className="w-full h-full object-cover" />
                    ) : (
                      <>{selectedStudent.firstName[0]}{selectedStudent.lastName[0]}</>
                    )}
                  </div>
                  <div>
                    <h2 className="font-serif text-2xl font-bold">{selectedStudent.firstName} {selectedStudent.lastName}</h2>
                    <p className="font-mono text-xs opacity-40">{selectedStudent.id} • {selectedStudent.gradeLevel}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setShowIdCard(selectedStudent)}
                    className="flex items-center gap-2 px-4 py-2 bg-black text-white hover:bg-black/80 rounded-full text-xs font-bold uppercase tracking-widest transition-all"
                  >
                    <IdCard size={16} />
                    ID Card
                  </button>
                  <button 
                    onClick={() => setSelectedStudent(null)}
                    className="p-2 hover:bg-black/5 rounded-full transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-8">
                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-6">
                  <InfoItem label="Email Address" value={selectedStudent.email} icon={<Mail size={14} />} />
                  <InfoItem label="Mobile No." value={selectedStudent.mobileNo} icon={<Phone size={14} />} />
                  <InfoItem label="Guardian Name" value={selectedStudent.guardianName} icon={<ShieldCheck size={14} />} />
                  <InfoItem label="Date of Birth" value={selectedStudent.dateOfBirth} icon={<Calendar size={14} />} />
                  <InfoItem label="Enrollment Date" value={selectedStudent.enrollmentDate} icon={<Calendar size={14} />} />
                  <InfoItem label="Current Status" value={selectedStudent.status} icon={<User size={14} />} />
                  <InfoItem label="Computer Course" value={selectedStudent.course} icon={<BookOpen size={14} />} />
                </div>

                {/* Academic Performance */}
                <div className="space-y-4">
                  <h3 className="font-serif italic text-lg border-b border-black/5 pb-2">Academic Performance</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-[#F8F9FA] rounded-xl">
                      <p className="text-[10px] uppercase tracking-wider text-black/40 font-bold mb-1">Cumulative GPA</p>
                      <p className="text-3xl font-mono font-bold">{selectedStudent.gpa.toFixed(2)}</p>
                    </div>
                    <div className="p-4 bg-[#F8F9FA] rounded-xl">
                      <p className="text-[10px] uppercase tracking-wider text-black/40 font-bold mb-1">Attendance Rate</p>
                      <p className="text-3xl font-mono font-bold">{selectedStudent.attendance}%</p>
                    </div>
                  </div>
                </div>

                {/* Subjects */}
                <div className="space-y-4">
                  <h3 className="font-serif italic text-lg border-b border-black/5 pb-2">Subject Breakdown</h3>
                  <div className="space-y-2">
                    {selectedStudent.subjects.map((subject, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-white border border-black/5 rounded-lg">
                        <span className="font-medium">{subject.name}</span>
                        <div className="flex items-center gap-4">
                          <span className="font-mono text-sm opacity-50">{subject.score}%</span>
                          <span className="w-8 h-8 rounded-md bg-black text-white flex items-center justify-center text-xs font-bold">
                            {subject.grade}
                          </span>
                        </div>
                      </div>
                    ))}
                    {selectedStudent.subjects.length === 0 && (
                      <p className="text-sm italic text-black/30 py-4">No subject records available for this student.</p>
                    )}
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-4">
                  <h3 className="font-serif italic text-lg border-b border-black/5 pb-2">Administrative Notes</h3>
                  <div className="p-4 bg-orange-50 border border-orange-100 rounded-xl text-sm text-orange-900 leading-relaxed">
                    {selectedStudent.notes || "No additional notes recorded."}
                  </div>
                </div>
              </div>

              <div className="p-8 border-t border-black/5 flex items-center justify-between bg-[#F8F9FA]">
                <button 
                  onClick={() => setStudentToDelete(selectedStudent.id)}
                  className="flex items-center gap-2 text-red-600 font-bold text-xs uppercase tracking-widest hover:text-red-700 transition-colors"
                >
                  <Trash2 size={16} />
                  Delete Record
                </button>
                <div className="flex items-center gap-3">
                  <button className="px-6 py-2 border border-black/10 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-black/5 transition-all">
                    Edit Profile
                  </button>
                  <button className="px-6 py-2 bg-black text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-black/80 transition-all">
                    Download PDF
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {studentToDelete && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setStudentToDelete(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-sm bg-white rounded-3xl p-8 shadow-2xl text-center"
            >
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trash2 size={32} />
              </div>
              <h3 className="font-serif text-xl font-bold mb-2">Delete Record?</h3>
              <p className="text-sm text-black/50 mb-8">
                This action cannot be undone. All data associated with this student will be permanently removed.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setStudentToDelete(null)}
                  className="flex-1 py-3 border border-black/10 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-black/5 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => handleDeleteStudent(studentToDelete)}
                  className="flex-1 py-3 bg-red-600 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-red-200"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Student Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-black/5 flex items-center justify-between">
                <h2 className="font-serif text-2xl font-bold">New Student Enrollment</h2>
                <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-black/5 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleAddStudent} className="p-8 space-y-6">
                <div className="flex justify-center mb-6">
                  <div className="relative group">
                    <div className="w-24 h-24 rounded-2xl bg-[#F1F3F5] border-2 border-dashed border-black/10 flex items-center justify-center overflow-hidden">
                      {photoPreview ? (
                        <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <Camera className="text-black/20" size={32} />
                      )}
                    </div>
                    <label className="absolute inset-0 cursor-pointer flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl">
                      <span className="text-[10px] text-white font-bold uppercase tracking-widest">Change</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                    </label>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-black/40">First Name</label>
                    <input required name="firstName" type="text" className="w-full px-4 py-2.5 bg-[#F1F3F5] rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-black/40">Last Name</label>
                    <input required name="lastName" type="text" className="w-full px-4 py-2.5 bg-[#F1F3F5] rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-black/40">Email Address</label>
                  <input required name="email" type="email" className="w-full px-4 py-2.5 bg-[#F1F3F5] rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-black/40">Date of Birth</label>
                    <input required name="dob" type="date" className="w-full px-4 py-2.5 bg-[#F1F3F5] rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-black/40">Grade Level</label>
                    <select name="gradeLevel" className="w-full px-4 py-2.5 bg-[#F1F3F5] rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5">
                      {[...Array(12)].map((_, i) => (
                        <option key={i + 1} value={`Grade ${i + 1}`}>Grade {i + 1}</option>
                      ))}
                      <option value="Graduation">Graduation</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-black/40">Mobile No.</label>
                    <input required name="mobileNo" type="tel" placeholder="+1 (555) 000-0000" className="w-full px-4 py-2.5 bg-[#F1F3F5] rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-black/40">Guardian Name</label>
                    <input required name="guardianName" type="text" placeholder="Full Name" className="w-full px-4 py-2.5 bg-[#F1F3F5] rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-black/40">Computer Course</label>
                  <select required name="course" className="w-full px-4 py-2.5 bg-[#F1F3F5] rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5">
                    <option value="">Select a Course</option>
                    {COMPUTER_COURSES.map((course, i) => (
                      <option key={i} value={course}>{course}</option>
                    ))}
                  </select>
                </div>

                <div className="pt-4 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="flex-1 py-3 border border-black/10 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-black/5 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-3 bg-black text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-black/80 transition-all shadow-lg shadow-black/10"
                  >
                    Enroll Student
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {showIdCard && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowIdCard(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 space-y-8">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                      <GraduationCap className="text-white" size={18} />
                    </div>
                    <span className="font-serif italic font-bold text-lg tracking-tight">NBCE</span>
                  </div>
                  <button 
                    onClick={() => setShowIdCard(null)}
                    className="p-2 hover:bg-black/5 rounded-full transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* ID Card Preview */}
                <div id="id-card-print" className="relative aspect-[1.586/1] w-full bg-gradient-to-br from-[#1a1a1a] to-[#2d2d2d] rounded-2xl p-6 text-white overflow-hidden shadow-xl border border-white/10">
                  {/* Decorative Elements */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl" />
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12 blur-xl" />
                  
                  <div className="relative h-full flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/40">Student Identity Card</h4>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-white/10 rounded flex items-center justify-center">
                            <GraduationCap size={14} />
                          </div>
                          <span className="font-serif italic font-bold text-sm">NBCE Institute</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[8px] font-mono opacity-40 uppercase">Academic Year</span>
                        <p className="text-[10px] font-bold">2024-2025</p>
                      </div>
                    </div>

                    <div className="flex gap-6 items-center">
                      <div className="w-24 h-24 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center overflow-hidden shrink-0">
                        {showIdCard.photo ? (
                          <img src={showIdCard.photo} alt="Student" className="w-full h-full object-cover" />
                        ) : (
                          <User size={40} className="text-white/20" />
                        )}
                      </div>
                      <div className="space-y-3 min-w-0">
                        <div>
                          <h3 className="text-xl font-bold leading-tight truncate">{showIdCard.firstName} {showIdCard.lastName}</h3>
                          <p className="text-[10px] font-mono text-white/60 uppercase tracking-widest">{showIdCard.id}</p>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                          <div>
                            <p className="text-[8px] uppercase tracking-wider text-white/40 font-bold">Course</p>
                            <p className="text-[10px] font-medium truncate">{showIdCard.course}</p>
                          </div>
                          <div className="flex gap-4">
                            <div>
                              <p className="text-[8px] uppercase tracking-wider text-white/40 font-bold">Grade</p>
                              <p className="text-[10px] font-medium">{showIdCard.gradeLevel}</p>
                            </div>
                            <div>
                              <p className="text-[8px] uppercase tracking-wider text-white/40 font-bold">Status</p>
                              <p className="text-[10px] font-medium text-emerald-400">{showIdCard.status}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-end pt-2 border-t border-white/10">
                      <div className="flex items-center gap-2">
                        <ShieldCheck size={12} className="text-emerald-400" />
                        <span className="text-[8px] font-bold uppercase tracking-widest text-white/60">Verified Student</span>
                      </div>
                      <div className="w-12 h-12 bg-white rounded flex items-center justify-center p-1">
                        {/* Mock QR Code */}
                        <div className="grid grid-cols-3 gap-0.5 w-full h-full">
                          {[...Array(9)].map((_, i) => (
                            <div key={i} className={`bg-black ${Math.random() > 0.5 ? 'opacity-100' : 'opacity-20'}`} />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 space-y-3">
                  <button 
                    onClick={() => window.print()}
                    className="w-full py-4 bg-black text-white rounded-xl font-bold uppercase tracking-widest hover:bg-black/80 transition-all flex items-center justify-center gap-2"
                  >
                    <Download size={18} />
                    Download / Print ID Card
                  </button>
                  <p className="text-center text-[10px] text-black/40 font-medium uppercase tracking-widest">
                    Authorized by NBCE Academic Board
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCard({ icon, label, value, trend }: { icon: React.ReactNode, label: string, value: string, trend: string }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm hover:shadow-md transition-all group">
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 bg-[#F8F9FA] rounded-lg group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
          {trend}
        </span>
      </div>
      <p className="text-[10px] uppercase tracking-widest font-bold text-black/40 mb-1">{label}</p>
      <p className="text-3xl font-mono font-bold tracking-tighter">{value}</p>
    </div>
  );
}

function InfoItem({ label, value, icon }: { label: string, value: string, icon: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-[10px] uppercase tracking-widest font-bold text-black/40 flex items-center gap-2">
        {icon}
        {label}
      </p>
      <p className="font-medium text-sm">{value}</p>
    </div>
  );
}

function HealthItem({ icon, label, status }: { icon: React.ReactNode, label: string, status: string }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <div className="flex items-center gap-2 text-black/60">
        {icon}
        <span>{label}</span>
      </div>
      <span className="font-bold opacity-40">{status}</span>
    </div>
  );
}
