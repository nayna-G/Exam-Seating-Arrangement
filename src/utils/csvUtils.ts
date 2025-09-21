/**
 * CSV Utilities for Seating Data
 * Handles export and import of seating arrangements
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

/**
 * Convert seating data to CSV format
 */
export const exportSeatingToCSV = (data: SeatingAssignment[]): string => {
  const headers = [
    'Student ID',
    'Student Name', 
    'Student Exam',
    'Date',
    'Room No',
    'Room Name',
    'Seat No',
    'Row',
    'Column',
    'Room Capacity',
    'Room Layout'
  ];

  const csvRows = [headers.join(',')];

  data.forEach(student => {
    const row = [
      `"${student.studentId}"`,
      `"${student.studentName}"`,
      `"${student.studentExam}"`,
      `"${student.date}"`,
      `"${student.roomNo}"`,
      `"${student.roomName}"`,
      student.seatNo.toString(),
      student.row.toString(),
      student.column.toString(),
      student.roomCapacity.toString(),
      `"${student.roomLayout}"`
    ];
    csvRows.push(row.join(','));
  });

  return csvRows.join('\n');
};

/**
 * Download CSV file
 */
export const downloadCSV = (csvContent: string, filename: string): void => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

/**
 * Parse CSV content to seating data
 */
export const parseCSVToSeating = (csvContent: string): SeatingAssignment[] => {
  const lines = csvContent.split('\n');
  const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
  
  const seatingData: SeatingAssignment[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const values = line.split(',').map(v => v.replace(/"/g, '').trim());
    
    if (values.length >= headers.length) {
      const student: SeatingAssignment = {
        studentId: values[0] || '',
        studentName: values[1] || '',
        studentExam: values[2] || '',
        date: values[3] || '',
        roomNo: values[4] || '',
        roomName: values[5] || '',
        seatNo: parseInt(values[6]) || 0,
        row: parseInt(values[7]) || 0,
        column: parseInt(values[8]) || 0,
        roomCapacity: parseInt(values[9]) || 0,
        roomLayout: values[10] || ''
      };
      
      seatingData.push(student);
    }
  }
  
  return seatingData;
};

/**
 * Save seating data to localStorage with timestamp
 */
export const saveSeatingDataToStorage = (data: SeatingAssignment[]): void => {
  const seatingData: SeatingData = {
    seatingArrangement: data,
    generatedAt: new Date().toISOString(),
    totalStudents: data.length
  };
  
  try {
    localStorage.setItem('examSeatingData', JSON.stringify(seatingData));
    console.log('Seating data saved to localStorage');
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
};

/**
 * Load seating data from localStorage
 */
export const loadSeatingDataFromStorage = (): SeatingData | null => {
  try {
    const saved = localStorage.getItem('examSeatingData');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error('Failed to load from localStorage:', error);
  }
  
  return null;
};

/**
 * Search for a student in seating data
 */
export const searchStudentInSeating = (studentId: string, data: SeatingAssignment[]): SeatingAssignment | null => {
  return data.find(student => 
    student.studentId.toLowerCase() === studentId.toLowerCase()
  ) || null;
};

/**
 * Generate filename with timestamp
 */
export const generateSeatingFilename = (): string => {
  const now = new Date();
  const timestamp = now.toISOString().split('T')[0]; // YYYY-MM-DD format
  return `exam-seating-${timestamp}.csv`;
};
