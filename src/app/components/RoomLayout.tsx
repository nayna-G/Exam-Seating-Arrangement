'use client'; // Directive: Marks this file as a client-side component (can use hooks and browser APIs)

import React from 'react'; // Import statement: Imports React library for JSX and component functionality

interface RoomLayoutProps { // Interface declaration: Defines props interface for RoomLayout component
  roomNo: string; // Property: Room number string
  roomName: string; // Property: Room name string
  seatMatrix: string; // Property: Seat matrix string in "rows x columns" format
  students: Array<{ // Property: Array of student objects assigned to this room
    studentId: string; // Property: Student ID string
    studentName: string; // Property: Student name string
    seatNo: number; // Property: Seat number within the room
    row: number; // Property: Row number in room layout
    column: number; // Property: Column number in room layout
    studentExam: string; // Property: Exam subject string
  }>;
}

export default function RoomLayout({ roomNo, roomName, seatMatrix, students }: RoomLayoutProps) { // Function declaration: Default export of RoomLayout component with destructured props
  const [rows, columns] = seatMatrix.split('x').map(Number); // String method: Splits matrix string by 'x' and converts to numbers (e.g., "10x5" -> [10, 5])
  
  const layout: (typeof students[0] | null)[][] = Array(rows).fill(null).map(() => Array(columns).fill(null)); // Array method: Creates 2D array representing room grid with null values
  
  students.forEach(student => { // Array method: Iterates over students to populate layout
    if (student.row <= rows && student.column <= columns) { // Conditional check: Validates student position is within grid bounds
      layout[student.row - 1][student.column - 1] = student; // Array assignment: Places student in grid (adjusting for 0-based indexing)
    }
  });

  return ( // Return statement: Returns JSX for component
    <div className="bg-white p-6 rounded-lg shadow-md"> // JSX element: Main container with white background, padding, rounded corners, and shadow
      <div className="mb-4"> // JSX element: Header section with bottom margin
        <h3 className="text-lg font-semibold text-gray-800">{roomName}</h3> // JSX element: Room name heading
        <p className="text-sm text-gray-600">Room No: {roomNo} | Layout: {seatMatrix}</p> // JSX element: Room number and layout info
        <p className="text-sm text-gray-600">Total Seats: {rows * columns} | Occupied: {students.length}</p> // JSX element: Seat count statistics
      </div>
      
      {/* Room Layout Grid */}
      <div className="overflow-x-auto"> // JSX element: Scrollable container for horizontal overflow
        <div className="inline-block"> // JSX element: Inline block container for grid
          {/* Column Headers */}
          <div className="flex mb-2"> // JSX element: Flex container for column headers with bottom margin
            <div className="w-8 h-8 flex items-center justify-center text-xs font-semibold text-gray-500"></div> // JSX element: Empty corner cell for row header alignment
            {Array.from({ length: columns }, (_, i) => ( // Array method: Creates array of column indices for headers
              <div key={i} className="w-16 h-8 flex items-center justify-center text-xs font-semibold text-gray-500 border-l"> // JSX element: Column header cell
                Col {i + 1} // JSX text: Column number (1-based)
              </div>
            ))}
          </div>
          
          {/* Room Grid */}
          {layout.map((row, rowIndex) => ( // Array method: Maps layout rows to JSX
            <div key={rowIndex} className="flex mb-1"> // JSX element: Row container with bottom margin
              {/* Row Header */}
              <div className="w-8 h-12 flex items-center justify-center text-xs font-semibold text-gray-500 border-r"> // JSX element: Row header cell with right border
                Row {rowIndex + 1} // JSX text: Row number (1-based)
              </div>
              
              {/* Seats in this row */}
              {row.map((student, colIndex) => ( // Array method: Maps row cells to seat JSX
                <div // JSX element: Seat cell
                  key={colIndex} // Attribute: Unique key for React
                  className={`w-16 h-12 border border-gray-300 flex flex-col items-center justify-center text-xs ${ // Attribute: Dynamic styling based on occupancy
                    student  // Conditional: If student exists at this position
                      ? 'bg-green-100 border-green-400' // Class: Green background and border for occupied seats
                      : 'bg-gray-50 border-gray-200' // Class: Gray background and border for empty seats
                  }`}
                  title={student ? `${student.studentName} (${student.studentId})` : 'Empty Seat'} // Attribute: Tooltip showing student info or empty message
                >
                  {student ? ( // Conditional rendering: Shows student info if seat occupied
                    <>
                      <div className="font-semibold text-green-800">{student.seatNo}</div> // JSX element: Seat number
                      <div className="text-xs text-green-600 truncate w-full text-center"> // JSX element: Student ID with truncation
                        {student.studentId} // JSX expression: Student ID
                      </div>
                    </>
                  ) : ( // Else block: Shows empty indicator
                    <div className="text-gray-400">-</div> // JSX element: Dash for empty seat
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      
      {/* Legend */}
      <div className="mt-4 flex gap-4 text-xs"> // JSX element: Legend container with top margin and gap
        <div className="flex items-center gap-1"> // JSX element: Occupied legend item
          <div className="w-4 h-4 bg-green-100 border border-green-400"></div> // JSX element: Green color swatch
          <span>Occupied</span> // JSX text: Legend label
        </div>
        <div className="flex items-center gap-1"> // JSX element: Empty legend item
          <div className="w-4 h-4 bg-gray-50 border border-gray-200"></div> // JSX element: Gray color swatch
          <span>Empty</span> // JSX text: Legend label
        </div>
      </div>
      
      {/* Student List */}
      <div className="mt-4"> // JSX element: Student list section with top margin
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Students in this room:</h4> // JSX element: List heading
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2"> // JSX element: Responsive grid for student cards
          {students.map((student, index) => ( // Array method: Maps students to card JSX
            <div key={index} className="bg-gray-50 p-2 rounded text-xs"> // JSX element: Student card with background and padding
              <div className="flex justify-between"> // JSX element: Flex container for name and seat
                <span className="font-semibold">{student.studentName}</span> // JSX element: Student name
                <span className="bg-green-100 text-green-800 px-1 rounded">Seat {student.seatNo}</span> // JSX element: Seat number badge
              </div>
              <div className="text-gray-600"> // JSX element: Student ID and exam
                {student.studentId} - {student.studentExam} // JSX text: ID and exam subject
              </div>
              <div className="text-gray-500"> // JSX element: Position info
                Row {student.row}, Col {student.column} // JSX text: Row and column
              </div>
            </div>
          ))}
        </div>
      </div>
    </div> // JSX closing tag: Closes main container div
  ); // JSX closing tag: Closes return statement
} // Function closing brace: End of RoomLayout component
