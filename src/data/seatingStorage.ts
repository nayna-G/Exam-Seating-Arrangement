/**
 * Seating Data Storage
 * Handles saving and loading seating arrangements
 */

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
  roomCapacity: number;
  roomLayout: string;
}

export interface SeatingData {
  seatingArrangement: SeatingAssignment[];
  generatedAt: string;
  totalStudents: number;
}

// In-memory storage (in a real app, this would be a database)
let seatingData: SeatingData | null = null;

export const saveSeatingData = (data: SeatingAssignment[]): void => {
  seatingData = {
    seatingArrangement: data,
    generatedAt: new Date().toISOString(),
    totalStudents: data.length
  };
  
  // Also save to localStorage for persistence
  try {
    localStorage.setItem('examSeatingData', JSON.stringify(seatingData));
    console.log('Seating data saved to localStorage');
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
};

export const loadSeatingData = (): SeatingData | null => {
  // First try to load from memory
  if (seatingData) {
    return seatingData;
  }
  
  // Then try to load from localStorage
  try {
    const saved = localStorage.getItem('examSeatingData');
    if (saved) {
      seatingData = JSON.parse(saved);
      console.log('Seating data loaded from localStorage');
      return seatingData;
    }
  } catch (error) {
    console.error('Failed to load from localStorage:', error);
  }
  
  return null;
};

export const searchStudent = (studentId: string): SeatingAssignment | null => {
  const data = loadSeatingData();
  if (!data) {
    return null;
  }
  
  return data.seatingArrangement.find(student => 
    student.studentId.toLowerCase() === studentId.toLowerCase()
  ) || null;
};

export const getAllSeatingData = (): SeatingData | null => {
  return loadSeatingData();
};

export const clearSeatingData = (): void => {
  seatingData = null;
  try {
    localStorage.removeItem('examSeatingData');
    console.log('Seating data cleared');
  } catch (error) {
    console.error('Failed to clear localStorage:', error);
  }
};
