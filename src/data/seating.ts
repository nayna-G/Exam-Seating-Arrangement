// Seating Arrangement Data Structure
export interface SeatingAssignment {
  studentId: string;
  roomId: string;
  seatNumber: number;
  row: number;
  column: number;
  qrCode?: string;
}

export interface SeatingArrangement {
  id: string;
  examId: string;
  generatedAt: Date;
  totalStudents: number;
  totalRooms: number;
  assignments: SeatingAssignment[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Sample seating arrangement data
export const sampleSeatingArrangements: SeatingArrangement[] = [
  {
    id: "SEATING001",
    examId: "EXAM001",
    generatedAt: new Date("2024-12-19T10:00:00"),
    totalStudents: 95,
    totalRooms: 2,
    assignments: [
      {
        studentId: "STU001",
        roomId: "ROOM001",
        seatNumber: 1,
        row: 1,
        column: 1,
        qrCode: "QR_STU001_ROOM001_1"
      },
      {
        studentId: "STU002",
        roomId: "ROOM001",
        seatNumber: 2,
        row: 1,
        column: 2,
        qrCode: "QR_STU002_ROOM001_2"
      },
      {
        studentId: "STU003",
        roomId: "ROOM002",
        seatNumber: 1,
        row: 1,
        column: 1,
        qrCode: "QR_STU003_ROOM002_1"
      },
      {
        studentId: "STU004",
        roomId: "ROOM002",
        seatNumber: 2,
        row: 1,
        column: 2,
        qrCode: "QR_STU004_ROOM002_2"
      },
      {
        studentId: "STU005",
        roomId: "ROOM001",
        seatNumber: 3,
        row: 1,
        column: 3,
        qrCode: "QR_STU005_ROOM001_3"
      }
    ],
    isActive: true,
    createdAt: new Date("2024-12-19T10:00:00"),
    updatedAt: new Date("2024-12-19T10:00:00")
  }
];

// Seating arrangement management functions
export class SeatingManager {
  private seatingArrangements: SeatingArrangement[] = [...sampleSeatingArrangements];

  // Get all seating arrangements
  getAllSeatingArrangements(): SeatingArrangement[] {
    return this.seatingArrangements.filter(arrangement => arrangement.isActive);
  }

  // Get seating arrangement by ID
  getSeatingArrangementById(id: string): SeatingArrangement | undefined {
    return this.seatingArrangements.find(arrangement => 
      arrangement.id === id && arrangement.isActive
    );
  }

  // Get seating arrangement by exam ID
  getSeatingArrangementByExamId(examId: string): SeatingArrangement | undefined {
    return this.seatingArrangements.find(arrangement => 
      arrangement.examId === examId && arrangement.isActive
    );
  }

  // Get student's seating assignment
  getStudentSeatingAssignment(studentId: string, examId: string): SeatingAssignment | undefined {
    const arrangement = this.getSeatingArrangementByExamId(examId);
    if (!arrangement) return undefined;
    
    return arrangement.assignments.find(assignment => assignment.studentId === studentId);
  }

  // Get room seating layout
  getRoomSeatingLayout(roomId: string, examId: string): SeatingAssignment[] {
    const arrangement = this.getSeatingArrangementByExamId(examId);
    if (!arrangement) return [];
    
    return arrangement.assignments.filter(assignment => assignment.roomId === roomId);
  }

  // Generate new seating arrangement
  generateSeatingArrangement(
    examId: string, 
    studentIds: string[], 
    roomIds: string[],
    roomCapacities: { [roomId: string]: number }
  ): SeatingArrangement {
    const assignments: SeatingAssignment[] = [];
    let seatCounter = 1;
    
    // Simple seating algorithm - can be enhanced with more sophisticated logic
    for (const roomId of roomIds) {
      const roomCapacity = roomCapacities[roomId] || 0;
      const studentsToAssign = Math.min(roomCapacity, studentIds.length);
      const studentsForThisRoom = studentIds.slice(0, studentsToAssign);
      studentIds = studentIds.slice(studentsToAssign);
      
      // Calculate rows and columns (assuming 5 seats per row)
      const seatsPerRow = 5;
      const totalRows = Math.ceil(roomCapacity / seatsPerRow);
      
      studentsForThisRoom.forEach((studentId, index) => {
        const row = Math.floor(index / seatsPerRow) + 1;
        const column = (index % seatsPerRow) + 1;
        
        assignments.push({
          studentId,
          roomId,
          seatNumber: seatCounter++,
          row,
          column,
          qrCode: `QR_${studentId}_${roomId}_${seatCounter - 1}`
        });
      });
    }
    
    const newArrangement: SeatingArrangement = {
      id: `SEATING${String(this.seatingArrangements.length + 1).padStart(3, '0')}`,
      examId,
      generatedAt: new Date(),
      totalStudents: assignments.length,
      totalRooms: roomIds.length,
      assignments,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.seatingArrangements.push(newArrangement);
    return newArrangement;
  }

  // Update seating arrangement
  updateSeatingArrangement(id: string, updates: Partial<SeatingArrangement>): SeatingArrangement | null {
    const index = this.seatingArrangements.findIndex(arrangement => arrangement.id === id);
    if (index === -1) return null;

    this.seatingArrangements[index] = {
      ...this.seatingArrangements[index],
      ...updates,
      updatedAt: new Date()
    };
    return this.seatingArrangements[index];
  }

  // Delete seating arrangement (soft delete)
  deleteSeatingArrangement(id: string): boolean {
    const index = this.seatingArrangements.findIndex(arrangement => arrangement.id === id);
    if (index === -1) return false;

    this.seatingArrangements[index].isActive = false;
    this.seatingArrangements[index].updatedAt = new Date();
    return true;
  }

  // Get seating statistics
  getSeatingStatistics(examId: string): {
    totalStudents: number;
    totalRooms: number;
    averageStudentsPerRoom: number;
    roomUtilization: { [roomId: string]: number };
  } {
    const arrangement = this.getSeatingArrangementByExamId(examId);
    if (!arrangement) {
      return {
        totalStudents: 0,
        totalRooms: 0,
        averageStudentsPerRoom: 0,
        roomUtilization: {}
      };
    }

    const roomUtilization: { [roomId: string]: number } = {};
    arrangement.assignments.forEach(assignment => {
      roomUtilization[assignment.roomId] = (roomUtilization[assignment.roomId] || 0) + 1;
    });

    return {
      totalStudents: arrangement.totalStudents,
      totalRooms: arrangement.totalRooms,
      averageStudentsPerRoom: arrangement.totalStudents / arrangement.totalRooms,
      roomUtilization
    };
  }

  // Export seating arrangement to CSV
  exportSeatingArrangementToCSV(examId: string): string {
    const arrangement = this.getSeatingArrangementByExamId(examId);
    if (!arrangement) return '';

    let csv = 'Student ID,Room ID,Seat Number,Row,Column,QR Code\n';
    arrangement.assignments.forEach(assignment => {
      csv += `${assignment.studentId},${assignment.roomId},${assignment.seatNumber},${assignment.row},${assignment.column},${assignment.qrCode}\n`;
    });

    return csv;
  }
}

// Export singleton instance
export const seatingManager = new SeatingManager();
