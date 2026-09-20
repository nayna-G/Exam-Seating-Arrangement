// Exam Data Structure and Sample Data
export interface Exam { // Interface declaration: Defines the shape of an Exam object
  id: string; // Property: Unique exam identifier string
  subject: string; // Property: Exam subject name
  subjectCode: string; // Property: Subject code string
  date: Date; // Property: Exam date
  time: string; // Property: Exam start time
  duration: number; // Property: Exam duration in minutes
  totalMarks: number; // Property: Total marks for the exam
  examType: 'Midterm' | 'Final' | 'Quiz' | 'Assignment'; // Property: Type of exam (union type)
  rooms: string[]; // Property: Array of room IDs assigned to exam
  invigilators: string[]; // Property: Array of invigilator names
  instructions: string[]; // Property: Array of exam instructions
  isActive: boolean; // Property: Flag indicating if exam record is active
  createdAt: Date; // Property: Timestamp when record was created
  updatedAt: Date; // Property: Timestamp when record was last updated
}

// Sample exam data
export const sampleExams: Exam[] = [ // Constant declaration: Array of sample exam objects for testing
  {
    id: "EXAM001", // Property: Exam ID
    subject: "Mathematics", // Property: Subject name
    subjectCode: "MATH101", // Property: Subject code
    date: new Date("2024-12-20"), // Property: Exam date
    time: "09:00", // Property: Start time
    duration: 180, // Property: Duration in minutes
    totalMarks: 100, // Property: Total marks
    examType: "Final", // Property: Exam type
    rooms: ["ROOM001", "ROOM002"], // Property: Assigned rooms
    invigilators: ["Prof. Smith", "Dr. Johnson"], // Property: Invigilators
    instructions: [ // Property: Exam instructions array
      "No calculators allowed", // Array element: Instruction 1
      "Bring your own stationery", // Array element: Instruction 2
      "Mobile phones must be switched off" // Array element: Instruction 3
    ],
    isActive: true, // Property: Active status flag
    createdAt: new Date("2024-01-15"), // Property: Creation timestamp
    updatedAt: new Date("2024-01-15") // Property: Update timestamp
  },
  {
    id: "EXAM002", // Property: Exam ID
    subject: "Physics", // Property: Subject name
    subjectCode: "PHYS101", // Property: Subject code
    date: new Date("2024-12-22"), // Property: Exam date
    time: "14:00", // Property: Start time
    duration: 150, // Property: Duration in minutes
    totalMarks: 80, // Property: Total marks
    examType: "Final", // Property: Exam type
    rooms: ["ROOM003", "ROOM004"], // Property: Assigned rooms
    invigilators: ["Dr. Brown", "Prof. Wilson"], // Property: Invigilators
    instructions: [ // Property: Exam instructions array
      "Scientific calculators allowed", // Array element: Instruction 1
      "Formula sheet provided", // Array element: Instruction 2
      "No electronic devices" // Array element: Instruction 3
    ],
    isActive: true, // Property: Active status flag
    createdAt: new Date("2024-01-15"), // Property: Creation timestamp
    updatedAt: new Date("2024-01-15") // Property: Update timestamp
  },
  {
    id: "EXAM003", // Property: Exam ID
    subject: "English Literature", // Property: Subject name
    subjectCode: "ENG201", // Property: Subject code
    date: new Date("2024-12-25"), // Property: Exam date
    time: "10:00", // Property: Start time
    duration: 120, // Property: Duration in minutes
    totalMarks: 60, // Property: Total marks
    examType: "Midterm", // Property: Exam type
    rooms: ["ROOM005"], // Property: Assigned rooms
    invigilators: ["Ms. Davis"], // Property: Invigilators
    instructions: [ // Property: Exam instructions array
      "Essay format required", // Array element: Instruction 1
      "Bring blue/black pens only", // Array element: Instruction 2
      "No dictionaries allowed" // Array element: Instruction 3
    ],
    isActive: true, // Property: Active status flag
    createdAt: new Date("2024-01-15"), // Property: Creation timestamp
    updatedAt: new Date("2024-01-15") // Property: Update timestamp
  }
];

// Exam management functions
export class ExamManager { // Class declaration: Manages exam data with CRUD operations
  private exams: Exam[] = [...sampleExams]; // Property: Private array of exams initialized with sample data

  getAllExams(): Exam[] { // Method declaration: Returns all active exams
    return this.exams.filter(exam => exam.isActive); // Array method: Filters to return only active exams
  }

  getExamById(id: string): Exam | undefined { // Method declaration: Returns exam by ID or undefined
    return this.exams.find(exam => exam.id === id && exam.isActive); // Array method: Finds exam matching ID and active status
  }

  getExamsByDateRange(startDate: Date, endDate: Date): Exam[] { // Method declaration: Returns exams within date range
    return this.exams.filter(exam => // Array method: Filters exams by date range
      exam.isActive && // Conditional: Checks active status
      exam.date >= startDate && // Conditional: Checks date is after or equal to start
      exam.date <= endDate // Conditional: Checks date is before or equal to end
    );
  }

  getExamsBySubject(subject: string): Exam[] { // Method declaration: Returns exams by subject
    return this.exams.filter(exam => // Array method: Filters exams by subject
      exam.isActive && // Conditional: Checks active status
      exam.subject.toLowerCase().includes(subject.toLowerCase()) // Conditional: Case-insensitive subject match
    );
  }

  getUpcomingExams(): Exam[] { // Method declaration: Returns upcoming exams sorted by date
    const today = new Date(); // Variable declaration: Gets current date
    return this.exams.filter(exam => // Array method: Filters future exams
      exam.isActive && exam.date >= today // Conditional: Active and future dates
    ).sort((a, b) => a.date.getTime() - b.date.getTime()); // Array method: Sorts by date ascending
  }

  getExamsByDate(date: Date): Exam[] { // Method declaration: Returns exams on specific date
    return this.exams.filter(exam => // Array method: Filters exams by date
      exam.isActive && // Conditional: Checks active status
      exam.date.toDateString() === date.toDateString() // Conditional: Matches date string
    );
  }

  addExam(exam: Omit<Exam, 'id' | 'createdAt' | 'updatedAt'>): Exam { // Method declaration: Adds new exam with auto-generated ID and timestamps
    const newExam: Exam = { // Variable declaration: Creates new exam object
      ...exam, // Spread operator: Copies provided exam properties
      id: `EXAM${String(this.exams.length + 1).padStart(3, '0')}`, // Property: Generates ID with zero-padding
      createdAt: new Date(), // Property: Sets creation timestamp to current date
      updatedAt: new Date() // Property: Sets update timestamp to current date
    };
    this.exams.push(newExam); // Array method: Adds new exam to array
    return newExam; // Return statement: Returns the created exam
  }

  updateExam(id: string, updates: Partial<Exam>): Exam | null { // Method declaration: Updates exam by ID with partial updates
    const index = this.exams.findIndex(exam => exam.id === id); // Array method: Finds index of exam by ID
    if (index === -1) return null; // Conditional check: Returns null if exam not found

    this.exams[index] = { // Array assignment: Updates exam at index
      ...this.exams[index], // Spread operator: Copies existing exam properties
      ...updates, // Spread operator: Applies provided updates
      updatedAt: new Date() // Property: Updates timestamp to current date
    };
    return this.exams[index]; // Return statement: Returns updated exam
  }

  deleteExam(id: string): boolean { // Method declaration: Soft deletes exam by setting isActive to false
    const index = this.exams.findIndex(exam => exam.id === id); // Array method: Finds index of exam by ID
    if (index === -1) return false; // Conditional check: Returns false if exam not found

    this.exams[index].isActive = false; // Property assignment: Sets active flag to false
    this.exams[index].updatedAt = new Date(); // Property assignment: Updates timestamp
    return true; // Return statement: Returns true on success
  }

  searchExams(query: string): Exam[] { // Method declaration: Searches exams by subject, code, or type
    const lowercaseQuery = query.toLowerCase(); // String method: Converts query to lowercase for case-insensitive search
    return this.exams.filter(exam => // Array method: Filters exams matching search criteria
      exam.isActive && // Conditional: Checks active status
      (
        exam.subject.toLowerCase().includes(lowercaseQuery) || // Conditional: Matches subject
        exam.subjectCode.toLowerCase().includes(lowercaseQuery) || // Conditional: Matches subject code
        exam.examType.toLowerCase().includes(lowercaseQuery) // Conditional: Matches exam type
      )
    );
  }

  checkExamConflicts(newExam: Omit<Exam, 'id' | 'createdAt' | 'updatedAt'>, excludeId?: string): string[] { // Method declaration: Checks for scheduling conflicts
    const conflicts: string[] = []; // Variable declaration: Array to store conflict messages
    
    this.exams.forEach(exam => { // Array method: Iterates over existing exams
      if (exam.isActive && (!excludeId || exam.id !== excludeId)) { // Conditional check: Skips excluded or inactive exams
        if (exam.date.toDateString() === newExam.date.toDateString()) { // Conditional check: Same date
          const examStartTime = new Date(`${exam.date.toDateString()} ${exam.time}`); // Variable: Calculates exam start time
          const examEndTime = new Date(examStartTime.getTime() + exam.duration * 60000); // Variable: Calculates exam end time (duration in milliseconds)
          
          const newExamStartTime = new Date(`${newExam.date.toDateString()} ${newExam.time}`); // Variable: Calculates new exam start time
          const newExamEndTime = new Date(newExamStartTime.getTime() + newExam.duration * 60000); // Variable: Calculates new exam end time
          
          if (newExamStartTime < examEndTime && newExamEndTime > examStartTime) { // Conditional check: Time overlap detection
            const roomConflicts = newExam.rooms.filter(room => exam.rooms.includes(room)); // Array method: Finds overlapping rooms
            if (roomConflicts.length > 0) { // Conditional check: If room conflicts exist
              conflicts.push(`Room conflict: ${roomConflicts.join(', ')} at ${exam.time}`); // Array method: Adds conflict message
            }
          }
        }
      }
    });
    
    return conflicts; // Return statement: Returns array of conflict messages
  }
}

export const examManager = new ExamManager(); // Constant declaration: Singleton instance of ExamManager
