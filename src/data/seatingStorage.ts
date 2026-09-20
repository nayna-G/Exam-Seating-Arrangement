/**
 * Seating Data Storage
 * Handles saving and loading seating arrangements
 */

export interface SeatingAssignment { // Interface declaration: Defines individual seat assignment
  studentId: string; // Property: Student ID
  studentName: string; // Property: Student name
  studentExam: string; // Property: Exam subject
  date: string; // Property: Exam date
  roomNo: string; // Property: Room number
  roomName: string; // Property: Room name
  seatNo: number; // Property: Seat number
  row: number; // Property: Row number
  column: number; // Property: Column number
  roomCapacity: number; // Property: Room capacity
  roomLayout: string; // Property: Room layout string
}

export interface SeatingData { // Interface declaration: Defines complete seating data structure
  seatingArrangement: SeatingAssignment[]; // Property: Array of seat assignments
  generatedAt: string; // Property: Generation timestamp string
  totalStudents: number; // Property: Total students count
}

let seatingData: SeatingData | null = null; // Variable declaration: In-memory storage for seating data

export const saveSeatingData = (data: SeatingAssignment[]): void => { // Function declaration: Saves seating data to memory and localStorage
  seatingData = { // Variable assignment: Updates in-memory storage
    seatingArrangement: data, // Property: Assignments array
    generatedAt: new Date().toISOString(), // Property: Current timestamp in ISO format
    totalStudents: data.length // Property: Total students count
  };
  
  try { // Try block: Begins localStorage save operation
    localStorage.setItem('examSeatingData', JSON.stringify(seatingData)); // Storage method: Saves data as JSON string
    console.log('Seating data saved to localStorage'); // Console log: Success message
  } catch (error) { // Catch block: Handles storage errors
    console.error('Failed to save to localStorage:', error); // Console error: Logs error details
  }
};

export const loadSeatingData = (): SeatingData | null => { // Function declaration: Loads seating data from memory or localStorage
  if (seatingData) { // Conditional check: Returns in-memory data if available
    return seatingData; // Return statement: Returns in-memory data
  }
  
  try { // Try block: Begins localStorage load operation
    const saved = localStorage.getItem('examSeatingData'); // Storage method: Retrieves saved data string
    if (saved) { // Conditional check: If data exists
      seatingData = JSON.parse(saved); // Variable assignment: Parses and stores JSON data
      console.log('Seating data loaded from localStorage'); // Console log: Success message
      return seatingData; // Return statement: Returns loaded data
    }
  } catch (error) { // Catch block: Handles parse errors
    console.error('Failed to load from localStorage:', error); // Console error: Logs error details
  }
  
  return null; // Return statement: Returns null if no data found
};

export const searchStudent = (studentId: string): SeatingAssignment | null => { // Function declaration: Searches for student by ID
  const data = loadSeatingData(); // Function call: Loads seating data
  if (!data) { // Conditional check: Returns null if no data
    return null; // Return statement: Returns null
  }
  
  return data.seatingArrangement.find(student => // Array method: Finds student matching ID (case-insensitive)
    student.studentId.toLowerCase() === studentId.toLowerCase()
  ) || null; // Return statement: Returns student or null if not found
};

export const getAllSeatingData = (): SeatingData | null => { // Function declaration: Returns all seating data
  return loadSeatingData(); // Return statement: Returns loaded seating data
};

export const clearSeatingData = (): void => { // Function declaration: Clears seating data from memory and localStorage
  seatingData = null; // Variable assignment: Clears in-memory storage
  try { // Try block: Begins localStorage clear operation
    localStorage.removeItem('examSeatingData'); // Storage method: Removes data from localStorage
    console.log('Seating data cleared'); // Console log: Success message
  } catch (error) { // Catch block: Handles clear errors
    console.error('Failed to clear localStorage:', error); // Console error: Logs error details
  }
};
