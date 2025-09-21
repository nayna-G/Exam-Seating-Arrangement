// Smart Seating Algorithm - Groups students by exam
import { Student } from './students';
import { Room } from './rooms';

export interface SeatingAssignment {
  studentId: string;
  studentName: string;
  studentExam: string;
  date: string;
  roomNo: string;
  roomName: string;
  seatNo: number;
  row: number;
  column: number;
}

export interface RoomSeating {
  roomNo: string;
  roomName: string;
  seatMatrix: string;
  students: SeatingAssignment[];
  totalSeats: number;
  occupiedSeats: number;
  availableSeats: number;
}

export interface ExamSeating {
  examName: string;
  date: string;
  totalStudents: number;
  rooms: RoomSeating[];
  generatedAt: Date;
}

export class SmartSeatingAlgorithm {
  
  /**
   * Generate seating arrangement based on exam grouping
   * Students with same exam are seated together in the same room
   */
  static generateExamBasedSeating(
    students: Student[], 
    rooms: Room[], 
    examDate: string
  ): ExamSeating {
    
    // Filter students for the specific exam date
    const examStudents = students.filter(s => s.date === examDate && s.isActive);
    
    // Group students by exam
    const examGroups = this.groupStudentsByExam(examStudents);
    
    // Sort rooms by capacity (largest first)
    const sortedRooms = [...rooms].sort((a, b) => b.numberOfSeats - a.numberOfSeats);
    
    const roomSeatings: RoomSeating[] = [];
    let currentRoomIndex = 0;
    
    // Assign each exam group to rooms
    for (const [examName, examStudents] of examGroups.entries()) {
      const studentsForExam = examStudents;
      
      // Try to fit all students of this exam in one room
      let roomFound = false;
      
      for (let i = currentRoomIndex; i < sortedRooms.length; i++) {
        const room = sortedRooms[i];
        
        if (studentsForExam.length <= room.numberOfSeats) {
          // All students can fit in this room
          const seating = this.assignStudentsToRoom(studentsForExam, room, examName, examDate);
          roomSeatings.push(seating);
          currentRoomIndex = i + 1;
          roomFound = true;
          break;
        }
      }
      
      if (!roomFound) {
        // Split students across multiple rooms
        const splitSeating = this.splitStudentsAcrossRooms(
          studentsForExam, 
          sortedRooms.slice(currentRoomIndex), 
          examName, 
          examDate
        );
        roomSeatings.push(...splitSeating);
        currentRoomIndex += splitSeating.length;
      }
    }
    
    return {
      examName: examGroups.keys().next().value || 'Mixed Exams',
      date: examDate,
      totalStudents: examStudents.length,
      rooms: roomSeatings,
      generatedAt: new Date()
    };
  }
  
  /**
   * Group students by their exam
   */
  private static groupStudentsByExam(students: Student[]): Map<string, Student[]> {
    const examGroups = new Map<string, Student[]>();
    
    for (const student of students) {
      if (!examGroups.has(student.studentExam)) {
        examGroups.set(student.studentExam, []);
      }
      examGroups.get(student.studentExam)!.push(student);
    }
    
    return examGroups;
  }
  
  /**
   * Assign students to a specific room with proper seating arrangement
   */
  private static assignStudentsToRoom(
    students: Student[], 
    room: Room, 
    examName: string, 
    examDate: string
  ): RoomSeating {
    
    const assignments: SeatingAssignment[] = [];
    let seatNumber = 1;
    
    // Shuffle students for fair distribution within the exam group
    const shuffledStudents = [...students].sort(() => Math.random() - 0.5);
    
    for (let i = 0; i < shuffledStudents.length; i++) {
      const student = shuffledStudents[i];
      const row = Math.floor(i / room.columns) + 1;
      const column = (i % room.columns) + 1;
      
      assignments.push({
        studentId: student.studentId,
        studentName: student.studentName,
        studentExam: student.studentExam,
        date: student.date,
        roomNo: room.roomNo,
        roomName: room.roomName,
        seatNo: seatNumber++,
        row,
        column
      });
    }
    
    return {
      roomNo: room.roomNo,
      roomName: room.roomName,
      seatMatrix: room.seatMatrix,
      students: assignments,
      totalSeats: room.numberOfSeats,
      occupiedSeats: assignments.length,
      availableSeats: room.numberOfSeats - assignments.length
    };
  }
  
  /**
   * Split students across multiple rooms when they don't fit in one room
   */
  private static splitStudentsAcrossRooms(
    students: Student[], 
    availableRooms: Room[], 
    examName: string, 
    examDate: string
  ): RoomSeating[] {
    
    const roomSeatings: RoomSeating[] = [];
    let studentIndex = 0;
    
    for (const room of availableRooms) {
      if (studentIndex >= students.length) break;
      
      const studentsForThisRoom = students.slice(studentIndex, studentIndex + room.numberOfSeats);
      const seating = this.assignStudentsToRoom(studentsForThisRoom, room, examName, examDate);
      roomSeatings.push(seating);
      
      studentIndex += room.numberOfSeats;
    }
    
    return roomSeatings;
  }
  
  /**
   * Get students in a specific room
   */
  static getStudentsInRoom(roomNo: string, seating: ExamSeating): SeatingAssignment[] {
    const room = seating.rooms.find(r => r.roomNo === roomNo);
    return room ? room.students : [];
  }
  
  /**
   * Find student's seating assignment
   */
  static findStudentSeating(studentId: string, seating: ExamSeating): SeatingAssignment | null {
    for (const room of seating.rooms) {
      const student = room.students.find(s => s.studentId === studentId);
      if (student) return student;
    }
    return null;
  }
  
  /**
   * Generate room layout visualization
   */
  static generateRoomLayout(roomSeating: RoomSeating): string[][] {
    const layout: string[][] = [];
    const { rows, columns } = this.parseSeatMatrix(roomSeating.seatMatrix);
    
    // Initialize empty layout
    for (let i = 0; i < rows; i++) {
      layout[i] = [];
      for (let j = 0; j < columns; j++) {
        layout[i][j] = 'Empty';
      }
    }
    
    // Fill with students
    for (const student of roomSeating.students) {
      if (student.row <= rows && student.column <= columns) {
        layout[student.row - 1][student.column - 1] = `${student.studentId} - ${student.studentName}`;
      }
    }
    
    return layout;
  }
  
  /**
   * Parse seat matrix string (e.g., "10x5" -> {rows: 10, columns: 5})
   */
  private static parseSeatMatrix(seatMatrix: string): { rows: number; columns: number } {
    const [rows, columns] = seatMatrix.split('x').map(Number);
    return { rows, columns };
  }
  
  /**
   * Export seating arrangement to CSV
   */
  static exportToCSV(seating: ExamSeating): string {
    let csv = 'Student ID,Student Name,Exam,Date,Room No,Room Name,Seat No,Row,Column\n';
    
    for (const room of seating.rooms) {
      for (const student of room.students) {
        csv += `${student.studentId},${student.studentName},${student.studentExam},${student.date},${student.roomNo},${student.roomName},${student.seatNo},${student.row},${student.column}\n`;
      }
    }
    
    return csv;
  }
}

// Export singleton instance
export const smartSeatingAlgorithm = new SmartSeatingAlgorithm();
