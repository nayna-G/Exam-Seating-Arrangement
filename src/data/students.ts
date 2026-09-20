// Student Data Structure and Sample Data
export interface Student { // Interface declaration: Defines the shape of a Student object
  studentId: string; // Property: Unique student identifier string
  studentName: string; // Property: Student full name
  studentExam: string; // Property: Exam subject the student is taking
  date: string; // Property: Exam date string
  roomNo?: string; // Optional property: Assigned room number
  seatNo?: number; // Optional property: Assigned seat number
  row?: number; // Optional property: Row number in room layout
  column?: number; // Optional property: Column number in room layout
  isActive: boolean; // Property: Flag indicating if student record is active
  createdAt: Date; // Property: Timestamp when record was created
  updatedAt: Date; // Property: Timestamp when record was last updated
}

// Sample student data
export const sampleStudents: Student[] = [ // Constant declaration: Array of sample student objects for testing
  {
    studentId: "STU001", // Property: Student ID
    studentName: "John Doe", // Property: Student name
    studentExam: "Mathematics", // Property: Exam subject
    date: "2024-12-20", // Property: Exam date
    isActive: true, // Property: Active status flag
    createdAt: new Date("2024-01-15"), // Property: Creation timestamp
    updatedAt: new Date("2024-01-15") // Property: Update timestamp
  },
  {
    studentId: "STU002", // Property: Student ID
    studentName: "Jane Smith", // Property: Student name
    studentExam: "Mathematics", // Property: Exam subject
    date: "2024-12-20", // Property: Exam date
    isActive: true, // Property: Active status flag
    createdAt: new Date("2024-01-15"), // Property: Creation timestamp
    updatedAt: new Date("2024-01-15") // Property: Update timestamp
  },
  {
    studentId: "STU003", // Property: Student ID
    studentName: "Mike Johnson", // Property: Student name
    studentExam: "Physics", // Property: Exam subject
    date: "2024-12-22", // Property: Exam date
    isActive: true, // Property: Active status flag
    createdAt: new Date("2024-01-15"), // Property: Creation timestamp
    updatedAt: new Date("2024-01-15") // Property: Update timestamp
  },
  {
    studentId: "STU004", // Property: Student ID
    studentName: "Sarah Wilson", // Property: Student name
    studentExam: "Mathematics", // Property: Exam subject
    date: "2024-12-20", // Property: Exam date
    isActive: true, // Property: Active status flag
    createdAt: new Date("2024-01-15"), // Property: Creation timestamp
    updatedAt: new Date("2024-01-15") // Property: Update timestamp
  },
  {
    studentId: "STU005", // Property: Student ID
    studentName: "David Brown", // Property: Student name
    studentExam: "Physics", // Property: Exam subject
    date: "2024-12-22", // Property: Exam date
    isActive: true, // Property: Active status flag
    createdAt: new Date("2024-01-15"), // Property: Creation timestamp
    updatedAt: new Date("2024-01-15") // Property: Update timestamp
  }
];

// Student management functions
export class StudentManager { // Class declaration: Manages student data with CRUD operations
  private students: Student[] = [...sampleStudents]; // Property: Private array of students initialized with sample data

  getAllStudents(): Student[] { // Method declaration: Returns all active students
    return this.students.filter(student => student.isActive); // Array method: Filters to return only active students
  }

  getStudentById(id: string): Student | undefined { // Method declaration: Returns student by ID or undefined
    return this.students.find(student => student.studentId === id && student.isActive); // Array method: Finds student matching ID and active status
  }

  getStudentsByClassAndSection(className: string, section: string): Student[] { // Method declaration: Returns students by exam/class
    return this.students.filter( // Array method: Filters students by exam subject
      student => student.studentExam === className && // Conditional: Matches exam subject
      student.isActive // Conditional: Checks active status
    );
  }

  addStudent(student: Omit<Student, 'createdAt' | 'updatedAt'>): Student { // Method declaration: Adds new student with auto-generated timestamps
    const newStudent: Student = { // Variable declaration: Creates new student object
      ...student, // Spread operator: Copies provided student properties
      createdAt: new Date(), // Property: Sets creation timestamp to current date
      updatedAt: new Date() // Property: Sets update timestamp to current date
    };
    this.students.push(newStudent); // Array method: Adds new student to array
    return newStudent; // Return statement: Returns the created student
  }

  updateStudent(id: string, updates: Partial<Student>): Student | null { // Method declaration: Updates student by ID with partial updates
    const index = this.students.findIndex(student => student.studentId === id); // Array method: Finds index of student by ID
    if (index === -1) return null; // Conditional check: Returns null if student not found

    this.students[index] = { // Array assignment: Updates student at index
      ...this.students[index], // Spread operator: Copies existing student properties
      ...updates, // Spread operator: Applies provided updates
      updatedAt: new Date() // Property: Updates timestamp to current date
    };
    return this.students[index]; // Return statement: Returns updated student
  }

  deleteStudent(id: string): boolean { // Method declaration: Soft deletes student by setting isActive to false
    const index = this.students.findIndex(student => student.studentId === id); // Array method: Finds index of student by ID
    if (index === -1) return false; // Conditional check: Returns false if student not found

    this.students[index].isActive = false; // Property assignment: Sets active flag to false
    this.students[index].updatedAt = new Date(); // Property assignment: Updates timestamp
    return true; // Return statement: Returns true on success
  }

  searchStudents(query: string): Student[] { // Method declaration: Searches students by name, ID, or exam
    const lowercaseQuery = query.toLowerCase(); // String method: Converts query to lowercase for case-insensitive search
    return this.students.filter(student => // Array method: Filters students matching search criteria
      student.isActive && // Conditional: Checks active status
      (
        student.studentName.toLowerCase().includes(lowercaseQuery) || // Conditional: Matches name
        student.studentId.toLowerCase().includes(lowercaseQuery) || // Conditional: Matches ID
        student.studentExam.toLowerCase().includes(lowercaseQuery) // Conditional: Matches exam
      )
    );
  }
}

export const studentManager = new StudentManager(); // Constant declaration: Singleton instance of StudentManager
