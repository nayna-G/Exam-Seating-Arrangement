// Seating Arrangement Data Structure
export interface SeatingAssignment { // Interface declaration: Defines individual seat assignment
  studentId: string; // Property: Student ID assigned to this seat
  roomId: string; // Property: Room ID where seat is located
  seatNumber: number; // Property: Sequential seat number within room
  row: number; // Property: Row number in room layout
  column: number; // Property: Column number in room layout
  qrCode?: string; // Optional property: QR code string for seat verification
}

export interface SeatingArrangement { // Interface declaration: Defines complete seating arrangement for an exam
  id: string; // Property: Unique arrangement identifier
  examId: string; // Property: Associated exam ID
  generatedAt: Date; // Property: Timestamp when arrangement was generated
  totalStudents: number; // Property: Total number of students assigned
  totalRooms: number; // Property: Total number of rooms used
  assignments: SeatingAssignment[]; // Property: Array of all seat assignments
  isActive: boolean; // Property: Flag indicating if arrangement is active
  createdAt: Date; // Property: Timestamp when record was created
  updatedAt: Date; // Property: Timestamp when record was last updated
}

// Sample seating arrangement data
export const sampleSeatingArrangements: SeatingArrangement[] = [ // Constant declaration: Array of sample seating arrangements
  {
    id: "SEATING001", // Property: Arrangement ID
    examId: "EXAM001", // Property: Associated exam ID
    generatedAt: new Date("2024-12-19T10:00:00"), // Property: Generation timestamp
    totalStudents: 95, // Property: Total students assigned
    totalRooms: 2, // Property: Total rooms used
    assignments: [ // Property: Array of seat assignments
      {
        studentId: "STU001", // Property: Student ID
        roomId: "ROOM001", // Property: Room ID
        seatNumber: 1, // Property: Seat number
        row: 1, // Property: Row number
        column: 1, // Property: Column number
        qrCode: "QR_STU001_ROOM001_1" // Property: QR code
      },
      {
        studentId: "STU002", // Property: Student ID
        roomId: "ROOM001", // Property: Room ID
        seatNumber: 2, // Property: Seat number
        row: 1, // Property: Row number
        column: 2, // Property: Column number
        qrCode: "QR_STU002_ROOM001_2" // Property: QR code
      },
      {
        studentId: "STU003", // Property: Student ID
        roomId: "ROOM002", // Property: Room ID
        seatNumber: 1, // Property: Seat number
        row: 1, // Property: Row number
        column: 1, // Property: Column number
        qrCode: "QR_STU003_ROOM002_1" // Property: QR code
      },
      {
        studentId: "STU004", // Property: Student ID
        roomId: "ROOM002", // Property: Room ID
        seatNumber: 2, // Property: Seat number
        row: 1, // Property: Row number
        column: 2, // Property: Column number
        qrCode: "QR_STU004_ROOM002_2" // Property: QR code
      },
      {
        studentId: "STU005", // Property: Student ID
        roomId: "ROOM001", // Property: Room ID
        seatNumber: 3, // Property: Seat number
        row: 1, // Property: Row number
        column: 3, // Property: Column number
        qrCode: "QR_STU005_ROOM001_3" // Property: QR code
      }
    ],
    isActive: true, // Property: Active status flag
    createdAt: new Date("2024-12-19T10:00:00"), // Property: Creation timestamp
    updatedAt: new Date("2024-12-19T10:00:00") // Property: Update timestamp
  }
];

// Seating arrangement management functions
export class SeatingManager { // Class declaration: Manages seating arrangement data with CRUD operations
  private seatingArrangements: SeatingArrangement[] = [...sampleSeatingArrangements]; // Property: Private array initialized with sample data

  getAllSeatingArrangements(): SeatingArrangement[] { // Method declaration: Returns all active seating arrangements
    return this.seatingArrangements.filter(arrangement => arrangement.isActive); // Array method: Filters to return only active arrangements
  }

  getSeatingArrangementById(id: string): SeatingArrangement | undefined { // Method declaration: Returns arrangement by ID or undefined
    return this.seatingArrangements.find(arrangement => // Array method: Finds arrangement matching ID and active status
      arrangement.id === id && arrangement.isActive
    );
  }

  getSeatingArrangementByExamId(examId: string): SeatingArrangement | undefined { // Method declaration: Returns arrangement by exam ID
    return this.seatingArrangements.find(arrangement => // Array method: Finds arrangement matching exam ID and active status
      arrangement.examId === examId && arrangement.isActive
    );
  }

  getStudentSeatingAssignment(studentId: string, examId: string): SeatingAssignment | undefined { // Method declaration: Returns student's seat assignment
    const arrangement = this.getSeatingArrangementByExamId(examId); // Variable: Gets arrangement for exam
    if (!arrangement) return undefined; // Conditional check: Returns undefined if no arrangement
    
    return arrangement.assignments.find(assignment => assignment.studentId === studentId); // Array method: Finds student's assignment
  }

  getRoomSeatingLayout(roomId: string, examId: string): SeatingAssignment[] { // Method declaration: Returns all assignments in a room
    const arrangement = this.getSeatingArrangementByExamId(examId); // Variable: Gets arrangement for exam
    if (!arrangement) return []; // Conditional check: Returns empty array if no arrangement
    
    return arrangement.assignments.filter(assignment => assignment.roomId === roomId); // Array method: Filters assignments by room ID
  }

  generateSeatingArrangement( // Method declaration: Generates new seating arrangement with sequential room filling
    examId: string, // Parameter: Associated exam ID
    studentIds: string[], // Parameter: Array of student IDs to assign
    roomIds: string[], // Parameter: Array of room IDs to use
    roomCapacities: { [roomId: string]: number } // Parameter: Object mapping room IDs to capacities
  ): SeatingArrangement {
    const assignments: SeatingAssignment[] = []; // Variable declaration: Array to store generated assignments
    let seatCounter = 1; // Variable declaration: Counter for sequential seat numbering
    
    for (const roomId of roomIds) { // For loop: Iterates through rooms
      const roomCapacity = roomCapacities[roomId] || 0; // Variable: Gets room capacity or defaults to 0
      const studentsToAssign = Math.min(roomCapacity, studentIds.length); // Variable: Calculates students to assign (capacity or remaining)
      const studentsForThisRoom = studentIds.slice(0, studentsToAssign); // Variable: Slices student IDs for this room
      studentIds = studentIds.slice(studentsToAssign); // Variable assignment: Removes assigned students from pool
      
      const seatsPerRow = 5; // Constant: Assumes 5 seats per row for layout calculation
      const totalRows = Math.ceil(roomCapacity / seatsPerRow); // Variable: Calculates total rows needed
      
      studentsForThisRoom.forEach((studentId, index) => { // Array method: Assigns each student to a seat
        const row = Math.floor(index / seatsPerRow) + 1; // Variable: Calculates row number (1-based)
        const column = (index % seatsPerRow) + 1; // Variable: Calculates column number (1-based)
        
        assignments.push({ // Array method: Adds assignment to array
          studentId, // Property: Student ID
          roomId, // Property: Room ID
          seatNumber: seatCounter++, // Property: Sequential seat number (increments after use)
          row, // Property: Row number
          column, // Property: Column number
          qrCode: `QR_${studentId}_${roomId}_${seatCounter - 1}` // Property: Generated QR code string
        });
      });
    }
    
    const newArrangement: SeatingArrangement = { // Variable declaration: Creates new arrangement object
      id: `SEATING${String(this.seatingArrangements.length + 1).padStart(3, '0')}`, // Property: Generates ID with zero-padding
      examId, // Property: Associated exam ID
      generatedAt: new Date(), // Property: Generation timestamp
      totalStudents: assignments.length, // Property: Total students assigned
      totalRooms: roomIds.length, // Property: Total rooms used
      assignments, // Property: Array of assignments
      isActive: true, // Property: Active status flag
      createdAt: new Date(), // Property: Creation timestamp
      updatedAt: new Date() // Property: Update timestamp
    };
    
    this.seatingArrangements.push(newArrangement); // Array method: Adds new arrangement to array
    return newArrangement; // Return statement: Returns generated arrangement
  }

  updateSeatingArrangement(id: string, updates: Partial<SeatingArrangement>): SeatingArrangement | null { // Method declaration: Updates arrangement by ID
    const index = this.seatingArrangements.findIndex(arrangement => arrangement.id === id); // Array method: Finds index by ID
    if (index === -1) return null; // Conditional check: Returns null if not found

    this.seatingArrangements[index] = { // Array assignment: Updates arrangement at index
      ...this.seatingArrangements[index], // Spread operator: Copies existing properties
      ...updates, // Spread operator: Applies provided updates
      updatedAt: new Date() // Property: Updates timestamp
    };
    return this.seatingArrangements[index]; // Return statement: Returns updated arrangement
  }

  deleteSeatingArrangement(id: string): boolean { // Method declaration: Soft deletes arrangement by setting isActive to false
    const index = this.seatingArrangements.findIndex(arrangement => arrangement.id === id); // Array method: Finds index by ID
    if (index === -1) return false; // Conditional check: Returns false if not found

    this.seatingArrangements[index].isActive = false; // Property assignment: Sets active flag to false
    this.seatingArrangements[index].updatedAt = new Date(); // Property assignment: Updates timestamp
    return true; // Return statement: Returns true on success
  }

  getSeatingStatistics(examId: string): { // Method declaration: Returns seating statistics for exam
    totalStudents: number; // Return type: Total students count
    totalRooms: number; // Return type: Total rooms count
    averageStudentsPerRoom: number; // Return type: Average students per room
    roomUtilization: { [roomId: string]: number }; // Return type: Object with room utilization counts
  } {
    const arrangement = this.getSeatingArrangementByExamId(examId); // Variable: Gets arrangement for exam
    if (!arrangement) { // Conditional check: If no arrangement found
      return { // Return statement: Returns empty statistics
        totalStudents: 0, // Property: Zero students
        totalRooms: 0, // Property: Zero rooms
        averageStudentsPerRoom: 0, // Property: Zero average
        roomUtilization: {} // Property: Empty utilization object
      };
    }

    const roomUtilization: { [roomId: string]: number } = {}; // Variable: Object to count students per room
    arrangement.assignments.forEach(assignment => { // Array method: Counts students per room
      roomUtilization[assignment.roomId] = (roomUtilization[assignment.roomId] || 0) + 1; // Increment: Adds 1 to room count
    });

    return { // Return statement: Returns calculated statistics
      totalStudents: arrangement.totalStudents, // Property: Total students
      totalRooms: arrangement.totalRooms, // Property: Total rooms
      averageStudentsPerRoom: arrangement.totalStudents / arrangement.totalRooms, // Property: Calculated average
      roomUtilization // Property: Room utilization counts
    };
  }

  exportSeatingArrangementToCSV(examId: string): string { // Method declaration: Exports arrangement to CSV format
    const arrangement = this.getSeatingArrangementByExamId(examId); // Variable: Gets arrangement for exam
    if (!arrangement) return ''; // Conditional check: Returns empty string if no arrangement

    let csv = 'Student ID,Room ID,Seat Number,Row,Column,QR Code\n'; // Variable: CSV header row
    arrangement.assignments.forEach(assignment => { // Array method: Appends each assignment as CSV row
      csv += `${assignment.studentId},${assignment.roomId},${assignment.seatNumber},${assignment.row},${assignment.column},${assignment.qrCode}\n`; // String concatenation: Builds CSV row
    });

    return csv; // Return statement: Returns complete CSV string
  }
}

export const seatingManager = new SeatingManager(); // Constant declaration: Singleton instance of SeatingManager
