'use client';

import React from 'react';

interface RoomLayoutProps {
  roomNo: string;
  roomName: string;
  seatMatrix: string;
  students: Array<{
    studentId: string;
    studentName: string;
    seatNo: number;
    row: number;
    column: number;
    studentExam: string;
  }>;
}

export default function RoomLayout({ roomNo, roomName, seatMatrix, students }: RoomLayoutProps) {
  // Parse seat matrix (e.g., "10x5" -> rows: 10, columns: 5)
  const [rows, columns] = seatMatrix.split('x').map(Number);
  
  // Create a 2D array to represent the room layout
  const layout: (typeof students[0] | null)[][] = Array(rows).fill(null).map(() => Array(columns).fill(null));
  
  // Fill the layout with students
  students.forEach(student => {
    if (student.row <= rows && student.column <= columns) {
      layout[student.row - 1][student.column - 1] = student;
    }
  });

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800">{roomName}</h3>
        <p className="text-sm text-gray-600">Room No: {roomNo} | Layout: {seatMatrix}</p>
        <p className="text-sm text-gray-600">Total Seats: {rows * columns} | Occupied: {students.length}</p>
      </div>
      
      {/* Room Layout Grid */}
      <div className="overflow-x-auto">
        <div className="inline-block">
          {/* Column Headers */}
          <div className="flex mb-2">
            <div className="w-8 h-8 flex items-center justify-center text-xs font-semibold text-gray-500"></div>
            {Array.from({ length: columns }, (_, i) => (
              <div key={i} className="w-16 h-8 flex items-center justify-center text-xs font-semibold text-gray-500 border-l">
                Col {i + 1}
              </div>
            ))}
          </div>
          
          {/* Room Grid */}
          {layout.map((row, rowIndex) => (
            <div key={rowIndex} className="flex mb-1">
              {/* Row Header */}
              <div className="w-8 h-12 flex items-center justify-center text-xs font-semibold text-gray-500 border-r">
                Row {rowIndex + 1}
              </div>
              
              {/* Seats in this row */}
              {row.map((student, colIndex) => (
                <div
                  key={colIndex}
                  className={`w-16 h-12 border border-gray-300 flex flex-col items-center justify-center text-xs ${
                    student 
                      ? 'bg-green-100 border-green-400' 
                      : 'bg-gray-50 border-gray-200'
                  }`}
                  title={student ? `${student.studentName} (${student.studentId})` : 'Empty Seat'}
                >
                  {student ? (
                    <>
                      <div className="font-semibold text-green-800">{student.seatNo}</div>
                      <div className="text-xs text-green-600 truncate w-full text-center">
                        {student.studentId}
                      </div>
                    </>
                  ) : (
                    <div className="text-gray-400">-</div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      
      {/* Legend */}
      <div className="mt-4 flex gap-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-green-100 border border-green-400"></div>
          <span>Occupied</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-gray-50 border border-gray-200"></div>
          <span>Empty</span>
        </div>
      </div>
      
      {/* Student List */}
      <div className="mt-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Students in this room:</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {students.map((student, index) => (
            <div key={index} className="bg-gray-50 p-2 rounded text-xs">
              <div className="flex justify-between">
                <span className="font-semibold">{student.studentName}</span>
                <span className="bg-green-100 text-green-800 px-1 rounded">Seat {student.seatNo}</span>
              </div>
              <div className="text-gray-600">
                {student.studentId} - {student.studentExam}
              </div>
              <div className="text-gray-500">
                Row {student.row}, Col {student.column}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
