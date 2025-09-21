// Student Data Structure and Sample Data
export interface Student {
  studentId: string;
  studentName: string;
  studentExam: string;
  date: string;
  roomNo?: string;
  seatNo?: number;
  row?: number;
  column?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Sample student data
export const sampleStudents: Student[] = [
  {
    studentId: "STU001",
    studentName: "John Doe",
    studentExam: "Mathematics",
    date: "2024-12-20",
    isActive: true,
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15")
  },
  {
    studentId: "STU002",
    studentName: "Jane Smith",
    studentExam: "Mathematics",
    date: "2024-12-20",
    isActive: true,
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15")
  },
  {
    studentId: "STU003",
    studentName: "Mike Johnson",
    studentExam: "Physics",
    date: "2024-12-22",
    isActive: true,
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15")
  },
  {
    studentId: "STU004",
    studentName: "Sarah Wilson",
    studentExam: "Mathematics",
    date: "2024-12-20",
    isActive: true,
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15")
  },
  {
    studentId: "STU005",
    studentName: "David Brown",
    studentExam: "Physics",
    date: "2024-12-22",
    isActive: true,
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15")
  }
];

// Student management functions
export class StudentManager {
  private students: Student[] = [...sampleStudents];

  // Get all students
  getAllStudents(): Student[] {
    return this.students.filter(student => student.isActive);
  }

  // Get student by ID
  getStudentById(id: string): Student | undefined {
    return this.students.find(student => student.studentId === id && student.isActive);
  }

  // Get students by class and section
  getStudentsByClassAndSection(className: string, section: string): Student[] {
    return this.students.filter(
      student => student.studentExam === className && 
      student.isActive
    );
  }

  // Add new student
  addStudent(student: Omit<Student, 'createdAt' | 'updatedAt'>): Student {
    const newStudent: Student = {
      ...student,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.students.push(newStudent);
    return newStudent;
  }

  // Update student
  updateStudent(id: string, updates: Partial<Student>): Student | null {
    const index = this.students.findIndex(student => student.studentId === id);
    if (index === -1) return null;

    this.students[index] = {
      ...this.students[index],
      ...updates,
      updatedAt: new Date()
    };
    return this.students[index];
  }

  // Delete student (soft delete)
  deleteStudent(id: string): boolean {
    const index = this.students.findIndex(student => student.studentId === id);
    if (index === -1) return false;

    this.students[index].isActive = false;
    this.students[index].updatedAt = new Date();
    return true;
  }

  // Search students
  searchStudents(query: string): Student[] {
    const lowercaseQuery = query.toLowerCase();
    return this.students.filter(student => 
      student.isActive && (
        student.studentName.toLowerCase().includes(lowercaseQuery) ||
        student.studentId.toLowerCase().includes(lowercaseQuery) ||
        student.studentExam.toLowerCase().includes(lowercaseQuery)
      )
    );
  }
}

// Export singleton instance
export const studentManager = new StudentManager();
