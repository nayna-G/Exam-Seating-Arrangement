// Smart Seating Algorithm - Groups students by exam
import { Student } from './students'; // Import statement: Imports Student interface from students module
import { Room } from './rooms'; // Import statement: Imports Room interface from rooms module

export interface SeatingAssignment { // Interface declaration: Defines individual student seat assignment
  studentId: string; // Property: Student ID
  studentName: string; // Property: Student name
  studentExam: string; // Property: Exam subject
  date: string; // Property: Exam date
  roomNo: string; // Property: Room number
  roomName: string; // Property: Room name
  seatNo: number; // Property: Seat number
  row: number; // Property: Row number
  column: number; // Property: Column number
}

export interface RoomSeating { // Interface declaration: Defines seating for a single room
  roomNo: string; // Property: Room number
  roomName: string; // Property: Room name
  seatMatrix: string; // Property: Seat layout string
  students: SeatingAssignment[]; // Property: Array of student assignments in this room
  totalSeats: number; // Property: Total seat capacity
  occupiedSeats: number; // Property: Number of occupied seats
  availableSeats: number; // Property: Number of available seats
}

export interface ExamSeating { // Interface declaration: Defines complete seating for an exam
  examName: string; // Property: Exam name
  date: string; // Property: Exam date
  totalStudents: number; // Property: Total students assigned
  rooms: RoomSeating[]; // Property: Array of room seatings
  generatedAt: Date; // Property: Generation timestamp
}

export class SmartSeatingAlgorithm { // Class declaration: Implements smart seating algorithm with exam grouping
  
  static generateExamBasedSeating( // Method declaration: Generates seating arrangement grouping students by exam
    students: Student[], // Parameter: Array of all students
    rooms: Room[], // Parameter: Array of available rooms
    examDate: string // Parameter: Exam date to filter students
  ): ExamSeating {
    const examStudents = students.filter(s => s.date === examDate && s.isActive); // Array method: Filters students by exam date and active status
    
    const examGroups = this.groupStudentsByExam(examStudents); // Method call: Groups students by exam subject
    
    const sortedRooms = [...rooms].sort((a, b) => b.numberOfSeats - a.numberOfSeats); // Array method: Sorts rooms by capacity (largest first)
    
    const roomSeatings: RoomSeating[] = []; // Variable declaration: Array to store room seatings
    let currentRoomIndex = 0; // Variable declaration: Tracks current room index for assignment
    
    for (const [examName, examStudents] of examGroups.entries()) { // For loop: Iterates through exam groups
      const studentsForExam = examStudents; // Variable: Students in this exam group
      
      let roomFound = false; // Variable: Flag indicating if suitable room was found
      
      for (let i = currentRoomIndex; i < sortedRooms.length; i++) { // For loop: Searches for room that fits all students
        const room = sortedRooms[i]; // Variable: Current room being evaluated
        
        if (studentsForExam.length <= room.numberOfSeats) { // Conditional check: If room can fit all students
          const seating = this.assignStudentsToRoom(studentsForExam, room, examName, examDate); // Method call: Assigns students to room
          roomSeatings.push(seating); // Array method: Adds room seating to array
          currentRoomIndex = i + 1; // Variable assignment: Advances room index
          roomFound = true; // Variable assignment: Sets flag to true
          break; // Break statement: Exits room search loop
        }
      }
      
      if (!roomFound) { // Conditional check: If no single room can fit all students
        const splitSeating = this.splitStudentsAcrossRooms( // Method call: Splits students across multiple rooms
          studentsForExam, // Argument: Students to split
          sortedRooms.slice(currentRoomIndex), // Argument: Available rooms starting from current index
          examName, // Argument: Exam name
          examDate // Argument: Exam date
        );
        roomSeatings.push(...splitSeating); // Array method: Adds all split room seatings
        currentRoomIndex += splitSeating.length; // Variable assignment: Advances room index by number of rooms used
      }
    }
    
    return { // Return statement: Returns complete exam seating object
      examName: examGroups.keys().next().value || 'Mixed Exams', // Property: First exam name or fallback
      date: examDate, // Property: Exam date
      totalStudents: examStudents.length, // Property: Total students assigned
      rooms: roomSeatings, // Property: Array of room seatings
      generatedAt: new Date() // Property: Generation timestamp
    };
  }
  
  private static groupStudentsByExam(students: Student[]): Map<string, Student[]> { // Method declaration: Groups students by exam subject
    const examGroups = new Map<string, Student[]>(); // Object instantiation: Creates Map for exam groups
    
    for (const student of students) { // For loop: Iterates through students
      if (!examGroups.has(student.studentExam)) { // Conditional check: If exam group doesn't exist
        examGroups.set(student.studentExam, []); // Map method: Creates empty array for this exam
      }
      examGroups.get(student.studentExam)!.push(student); // Map method: Adds student to exam group array
    }
    
    return examGroups; // Return statement: Returns Map of exam groups
  }
  
  private static assignStudentsToRoom( // Method declaration: Assigns students to a room with seat layout
    students: Student[], // Parameter: Students to assign
    room: Room, // Parameter: Room to assign to
    examName: string, // Parameter: Exam name
    examDate: string // Parameter: Exam date
  ): RoomSeating {
    const assignments: SeatingAssignment[] = []; // Variable declaration: Array to store assignments
    let seatNumber = 1; // Variable declaration: Sequential seat number counter
    
    const shuffledStudents = [...students].sort(() => Math.random() - 0.5); // Array method: Shuffles students for random distribution
    
    for (let i = 0; i < shuffledStudents.length; i++) { // For loop: Assigns each student to a seat
      const student = shuffledStudents[i]; // Variable: Current student
      const row = Math.floor(i / room.columns) + 1; // Variable: Calculates row number (1-based)
      const column = (i % room.columns) + 1; // Variable: Calculates column number (1-based)
      
      assignments.push({ // Array method: Adds assignment to array
        studentId: student.studentId, // Property: Student ID
        studentName: student.studentName, // Property: Student name
        studentExam: student.studentExam, // Property: Exam subject
        date: student.date, // Property: Exam date
        roomNo: room.roomNo, // Property: Room number
        roomName: room.roomName, // Property: Room name
        seatNo: seatNumber++, // Property: Seat number (increments after use)
        row, // Property: Row number
        column // Property: Column number
      });
    }
    
    return { // Return statement: Returns room seating object
      roomNo: room.roomNo, // Property: Room number
      roomName: room.roomName, // Property: Room name
      seatMatrix: room.seatMatrix, // Property: Seat layout
      students: assignments, // Property: Student assignments
      totalSeats: room.numberOfSeats, // Property: Total capacity
      occupiedSeats: assignments.length, // Property: Occupied seats count
      availableSeats: room.numberOfSeats - assignments.length // Property: Available seats count
    };
  }
  
  private static splitStudentsAcrossRooms( // Method declaration: Splits students across multiple rooms
    students: Student[], // Parameter: Students to split
    availableRooms: Room[], // Parameter: Available rooms
    examName: string, // Parameter: Exam name
    examDate: string // Parameter: Exam date
  ): RoomSeating[] {
    const roomSeatings: RoomSeating[] = []; // Variable declaration: Array to store room seatings
    let studentIndex = 0; // Variable declaration: Tracks current student index
    
    for (const room of availableRooms) { // For loop: Iterates through available rooms
      if (studentIndex >= students.length) break; // Conditional check: Breaks if all students assigned
      
      const remainingStudents = students.length - studentIndex; // Variable: Calculates remaining students
      const studentsToAssign = Math.min(room.numberOfSeats, remainingStudents); // Variable: Calculates students for this room
      
      const studentsForThisRoom = students.slice(studentIndex, studentIndex + studentsToAssign); // Array method: Slices students for this room
      const seating = this.assignStudentsToRoom(studentsForThisRoom, room, examName, examDate); // Method call: Assigns to room
      roomSeatings.push(seating); // Array method: Adds room seating
      
      studentIndex += studentsToAssign; // Variable assignment: Increments by actual students assigned (FIXED BUG)
    }
    
    return roomSeatings; // Return statement: Returns array of room seatings
  }
  
  static getStudentsInRoom(roomNo: string, seating: ExamSeating): SeatingAssignment[] { // Method declaration: Returns students in specific room
    const room = seating.rooms.find(r => r.roomNo === roomNo); // Array method: Finds room by number
    return room ? room.students : []; // Ternary: Returns students or empty array
  }
  
  static findStudentSeating(studentId: string, seating: ExamSeating): SeatingAssignment | null { // Method declaration: Finds student's assignment
    for (const room of seating.rooms) { // For loop: Iterates through rooms
      const student = room.students.find(s => s.studentId === studentId); // Array method: Finds student by ID
      if (student) return student; // Conditional check: Returns student if found
    }
    return null; // Return statement: Returns null if not found
  }
  
  static generateRoomLayout(roomSeating: RoomSeating): string[][] { // Method declaration: Generates 2D layout visualization
    const layout: string[][] = []; // Variable declaration: 2D array for layout
    const { rows, columns } = this.parseSeatMatrix(roomSeating.seatMatrix); // Method call: Parses seat matrix
    
    for (let i = 0; i < rows; i++) { // For loop: Initializes layout rows
      layout[i] = []; // Array assignment: Creates empty row array
      for (let j = 0; j < columns; j++) { // For loop: Initializes layout columns
        layout[i][j] = 'Empty'; // Array assignment: Sets cell to 'Empty'
      }
    }
    
    for (const student of roomSeating.students) { // For loop: Fills layout with students
      if (student.row <= rows && student.column <= columns) { // Conditional check: Validates position is within bounds
        layout[student.row - 1][student.column - 1] = `${student.studentId} - ${student.studentName}`; // Array assignment: Sets cell to student info (adjusts for 0-based indexing)
      }
    }
    
    return layout; // Return statement: Returns 2D layout array
  }
  
  private static parseSeatMatrix(seatMatrix: string): { rows: number; columns: number } { // Method declaration: Parses seat matrix string
    const [rows, columns] = seatMatrix.split('x').map(Number); // String method: Splits by 'x' and converts to numbers
    return { rows, columns }; // Return statement: Returns object with rows and columns
  }
  
  static exportToCSV(seating: ExamSeating): string { // Method declaration: Exports seating to CSV format
    let csv = 'Student ID,Student Name,Exam,Date,Room No,Room Name,Seat No,Row,Column\n'; // Variable: CSV header row
    
    for (const room of seating.rooms) { // For loop: Iterates through rooms
      for (const student of room.students) { // For loop: Iterates through students in room
        csv += `${student.studentId},${student.studentName},${student.studentExam},${student.date},${student.roomNo},${student.roomName},${student.seatNo},${student.row},${student.column}\n`; // String concatenation: Builds CSV row
      }
    }
    
    return csv; // Return statement: Returns complete CSV string
  }
}

export const smartSeatingAlgorithm = new SmartSeatingAlgorithm(); // Constant declaration: Singleton instance
