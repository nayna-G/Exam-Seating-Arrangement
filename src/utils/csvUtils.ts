/**
 * CSV Utilities for Seating Data
 * Handles export and import of seating arrangements
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

export const exportSeatingToCSV = (data: SeatingAssignment[]): string => { // Function declaration: Converts seating data to CSV format
  const headers = [ // Variable declaration: Array of CSV header strings
    'Student ID', // Array element: Header 1
    'Student Name', // Array element: Header 2
    'Student Exam', // Array element: Header 3
    'Date', // Array element: Header 4
    'Room No', // Array element: Header 5
    'Room Name', // Array element: Header 6
    'Seat No', // Array element: Header 7
    'Row', // Array element: Header 8
    'Column', // Array element: Header 9
    'Room Capacity', // Array element: Header 10
    'Room Layout' // Array element: Header 11
  ];

  const csvRows = [headers.join(',')]; // Variable declaration: Array with header row joined by commas

  data.forEach(student => { // Array method: Iterates through students to build CSV rows
    const row = [ // Variable declaration: Array of student data values
      `"${student.studentId}"`, // Array element: Quoted student ID
      `"${student.studentName}"`, // Array element: Quoted student name
      `"${student.studentExam}"`, // Array element: Quoted exam subject
      `"${student.date}"`, // Array element: Quoted date
      `"${student.roomNo}"`, // Array element: Quoted room number
      `"${student.roomName}"`, // Array element: Quoted room name
      student.seatNo.toString(), // Array element: Seat number as string
      student.row.toString(), // Array element: Row number as string
      student.column.toString(), // Array element: Column number as string
      student.roomCapacity.toString(), // Array element: Room capacity as string
      `"${student.roomLayout}"` // Array element: Quoted room layout
    ];
    csvRows.push(row.join(',')); // Array method: Adds joined row to CSV rows array
  });

  return csvRows.join('\n'); // Return statement: Returns complete CSV string with newline separators
};

export const downloadCSV = (csvContent: string, filename: string): void => { // Function declaration: Triggers CSV file download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' }); // Object instantiation: Creates Blob with CSV content
  const link = document.createElement('a'); // DOM method: Creates anchor element for download
  
  if (link.download !== undefined) { // Conditional check: Verifies download attribute is supported
    const url = URL.createObjectURL(blob); // URL method: Creates object URL for blob
    link.setAttribute('href', url); // DOM method: Sets href attribute to blob URL
    link.setAttribute('download', filename); // DOM method: Sets download attribute to filename
    link.style.visibility = 'hidden'; // Property assignment: Hides link element
    document.body.appendChild(link); // DOM method: Appends link to document body
    link.click(); // DOM method: Triggers click to start download
    document.body.removeChild(link); // DOM method: Removes link from document body
  }
};

export const parseCSVToSeating = (csvContent: string): SeatingAssignment[] => { // Function declaration: Parses CSV string to seating data
  const lines = csvContent.split('\n'); // String method: Splits CSV into lines
  const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim()); // String method: Parses header row, removes quotes and trims
  
  const seatingData: SeatingAssignment[] = []; // Variable declaration: Array to store parsed assignments
  
  for (let i = 1; i < lines.length; i++) { // For loop: Iterates through data rows (skipping header)
    const line = lines[i].trim(); // String method: Trims whitespace from line
    if (!line) continue; // Conditional check: Skips empty lines
    
    const values = line.split(',').map(v => v.replace(/"/g, '').trim()); // String method: Parses values, removes quotes and trims
    
    if (values.length >= headers.length) { // Conditional check: Validates row has enough values
      const student: SeatingAssignment = { // Variable declaration: Creates assignment object
        studentId: values[0] || '', // Property: Student ID or empty string
        studentName: values[1] || '', // Property: Student name or empty string
        studentExam: values[2] || '', // Property: Exam subject or empty string
        date: values[3] || '', // Property: Date or empty string
        roomNo: values[4] || '', // Property: Room number or empty string
        roomName: values[5] || '', // Property: Room name or empty string
        seatNo: parseInt(values[6]) || 0, // Property: Seat number parsed or 0
        row: parseInt(values[7]) || 0, // Property: Row number parsed or 0
        column: parseInt(values[8]) || 0, // Property: Column number parsed or 0
        roomCapacity: parseInt(values[9]) || 0, // Property: Room capacity parsed or 0
        roomLayout: values[10] || '' // Property: Room layout or empty string
      };
      
      seatingData.push(student); // Array method: Adds assignment to array
    }
  }
  
  return seatingData; // Return statement: Returns array of parsed assignments
};

export const saveSeatingDataToStorage = (data: SeatingAssignment[]): void => { // Function declaration: Saves seating data to localStorage
  const seatingData: SeatingData = { // Variable declaration: Creates seating data object
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

export const loadSeatingDataFromStorage = (): SeatingData | null => { // Function declaration: Loads seating data from localStorage
  try { // Try block: Begins localStorage load operation
    const saved = localStorage.getItem('examSeatingData'); // Storage method: Retrieves saved data string
    if (saved) { // Conditional check: If data exists
      return JSON.parse(saved); // Return statement: Parses and returns JSON object
    }
  } catch (error) { // Catch block: Handles parse errors
    console.error('Failed to load from localStorage:', error); // Console error: Logs error details
  }
  
  return null; // Return statement: Returns null if no data or error
};

export const searchStudentInSeating = (studentId: string, data: SeatingAssignment[]): SeatingAssignment | null => { // Function declaration: Searches for student in seating data
  return data.find(student => // Array method: Finds student matching ID (case-insensitive)
    student.studentId.toLowerCase() === studentId.toLowerCase()
  ) || null; // Return statement: Returns student or null if not found
};

export const generateSeatingFilename = (): string => { // Function declaration: Generates timestamped CSV filename
  const now = new Date(); // Variable declaration: Gets current date
  const timestamp = now.toISOString().split('T')[0]; // String method: Extracts date portion (YYYY-MM-DD)
  return `exam-seating-${timestamp}.csv`; // Return statement: Returns formatted filename
};
