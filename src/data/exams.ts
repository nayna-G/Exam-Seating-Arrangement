// Exam Data Structure and Sample Data
export interface Exam {
  id: string;
  subject: string;
  subjectCode: string;
  date: Date;
  time: string;
  duration: number; // in minutes
  totalMarks: number;
  examType: 'Midterm' | 'Final' | 'Quiz' | 'Assignment';
  rooms: string[]; // Array of room IDs
  invigilators: string[];
  instructions: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Sample exam data
export const sampleExams: Exam[] = [
  {
    id: "EXAM001",
    subject: "Mathematics",
    subjectCode: "MATH101",
    date: new Date("2024-12-20"),
    time: "09:00",
    duration: 180,
    totalMarks: 100,
    examType: "Final",
    rooms: ["ROOM001", "ROOM002"],
    invigilators: ["Prof. Smith", "Dr. Johnson"],
    instructions: [
      "No calculators allowed",
      "Bring your own stationery",
      "Mobile phones must be switched off"
    ],
    isActive: true,
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15")
  },
  {
    id: "EXAM002",
    subject: "Physics",
    subjectCode: "PHYS101",
    date: new Date("2024-12-22"),
    time: "14:00",
    duration: 150,
    totalMarks: 80,
    examType: "Final",
    rooms: ["ROOM003", "ROOM004"],
    invigilators: ["Dr. Brown", "Prof. Wilson"],
    instructions: [
      "Scientific calculators allowed",
      "Formula sheet provided",
      "No electronic devices"
    ],
    isActive: true,
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15")
  },
  {
    id: "EXAM003",
    subject: "English Literature",
    subjectCode: "ENG201",
    date: new Date("2024-12-25"),
    time: "10:00",
    duration: 120,
    totalMarks: 60,
    examType: "Midterm",
    rooms: ["ROOM005"],
    invigilators: ["Ms. Davis"],
    instructions: [
      "Essay format required",
      "Bring blue/black pens only",
      "No dictionaries allowed"
    ],
    isActive: true,
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15")
  }
];

// Exam management functions
export class ExamManager {
  private exams: Exam[] = [...sampleExams];

  // Get all exams
  getAllExams(): Exam[] {
    return this.exams.filter(exam => exam.isActive);
  }

  // Get exam by ID
  getExamById(id: string): Exam | undefined {
    return this.exams.find(exam => exam.id === id && exam.isActive);
  }

  // Get exams by date range
  getExamsByDateRange(startDate: Date, endDate: Date): Exam[] {
    return this.exams.filter(exam => 
      exam.isActive && 
      exam.date >= startDate && 
      exam.date <= endDate
    );
  }

  // Get exams by subject
  getExamsBySubject(subject: string): Exam[] {
    return this.exams.filter(exam => 
      exam.isActive && 
      exam.subject.toLowerCase().includes(subject.toLowerCase())
    );
  }

  // Get upcoming exams
  getUpcomingExams(): Exam[] {
    const today = new Date();
    return this.exams.filter(exam => 
      exam.isActive && exam.date >= today
    ).sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  // Get exams for specific date
  getExamsByDate(date: Date): Exam[] {
    return this.exams.filter(exam => 
      exam.isActive && 
      exam.date.toDateString() === date.toDateString()
    );
  }

  // Add new exam
  addExam(exam: Omit<Exam, 'id' | 'createdAt' | 'updatedAt'>): Exam {
    const newExam: Exam = {
      ...exam,
      id: `EXAM${String(this.exams.length + 1).padStart(3, '0')}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.exams.push(newExam);
    return newExam;
  }

  // Update exam
  updateExam(id: string, updates: Partial<Exam>): Exam | null {
    const index = this.exams.findIndex(exam => exam.id === id);
    if (index === -1) return null;

    this.exams[index] = {
      ...this.exams[index],
      ...updates,
      updatedAt: new Date()
    };
    return this.exams[index];
  }

  // Delete exam (soft delete)
  deleteExam(id: string): boolean {
    const index = this.exams.findIndex(exam => exam.id === id);
    if (index === -1) return false;

    this.exams[index].isActive = false;
    this.exams[index].updatedAt = new Date();
    return true;
  }

  // Search exams
  searchExams(query: string): Exam[] {
    const lowercaseQuery = query.toLowerCase();
    return this.exams.filter(exam => 
      exam.isActive && (
        exam.subject.toLowerCase().includes(lowercaseQuery) ||
        exam.subjectCode.toLowerCase().includes(lowercaseQuery) ||
        exam.examType.toLowerCase().includes(lowercaseQuery)
      )
    );
  }

  // Check for exam conflicts
  checkExamConflicts(newExam: Omit<Exam, 'id' | 'createdAt' | 'updatedAt'>, excludeId?: string): string[] {
    const conflicts: string[] = [];
    
    this.exams.forEach(exam => {
      if (exam.isActive && (!excludeId || exam.id !== excludeId)) {
        // Check date and time conflicts
        if (exam.date.toDateString() === newExam.date.toDateString()) {
          const examStartTime = new Date(`${exam.date.toDateString()} ${exam.time}`);
          const examEndTime = new Date(examStartTime.getTime() + exam.duration * 60000);
          
          const newExamStartTime = new Date(`${newExam.date.toDateString()} ${newExam.time}`);
          const newExamEndTime = new Date(newExamStartTime.getTime() + newExam.duration * 60000);
          
          // Check for time overlap
          if (newExamStartTime < examEndTime && newExamEndTime > examStartTime) {
            // Check for room conflicts
            const roomConflicts = newExam.rooms.filter(room => exam.rooms.includes(room));
            if (roomConflicts.length > 0) {
              conflicts.push(`Room conflict: ${roomConflicts.join(', ')} at ${exam.time}`);
            }
          }
        }
      }
    });
    
    return conflicts;
  }
}

// Export singleton instance
export const examManager = new ExamManager();
