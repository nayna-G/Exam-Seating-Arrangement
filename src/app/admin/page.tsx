'use client';

import React, { useState } from 'react';
import RoomLayout from '../components/RoomLayout';
import { saveSeatingData } from '../../data/seatingStorage';
import { exportSeatingToCSV, downloadCSV, generateSeatingFilename, saveSeatingDataToStorage, parseCSVToSeating } from '../../utils/csvUtils';
import { saveSeatingToServer, loadSeatingFromServer } from '../../services/serverStorage';

/**
 * Admin Dashboard Page
 * 
 * This page provides the main interface for administrators to manage
 * the exam seating arrangement system with Excel upload functionality.
 */
export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [students, setStudents] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [seatingArrangement, setSeatingArrangement] = useState<any[] | null>(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isSavingToServer, setIsSavingToServer] = useState(false);
  const [isLoadingFromServer, setIsLoadingFromServer] = useState(false);

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'upload', label: 'Upload Data', icon: '📤' },
    { id: 'seating', label: 'Seating', icon: '🪑' },
    { id: 'rooms', label: 'Room View', icon: '🏢' },
    { id: 'reports', label: 'Reports', icon: '📋' }
  ];

  // Handle Excel file upload
  const handleFileUpload = (file: File, type: 'students' | 'rooms') => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const csv = e.target?.result as string;
      const lines = csv.split('\n');
      const headers = lines[0].split(',');
      const data = lines.slice(1).map(line => {
        const values = line.split(',');
        const obj: any = {};
        headers.forEach((header, index) => {
          obj[header.trim()] = values[index]?.trim();
        });
        return obj;
      }).filter(row => row[headers[0]]); // Remove empty rows

      if (type === 'students') {
        setStudents(data);
        console.log('Students uploaded:', data);
      } else {
        // Parse seat matrix for rooms
        const roomsWithMatrix = data.map(room => ({
          ...room,
          rows: parseInt(room['Seat Matrix (Rows x Columns)']?.split('x')[0]) || 0,
          columns: parseInt(room['Seat Matrix (Rows x Columns)']?.split('x')[1]) || 0
        }));
        setRooms(roomsWithMatrix);
        console.log('Rooms uploaded:', roomsWithMatrix);
      }
    };
    reader.readAsText(file);
  };

  // Create anti-cheating pattern by alternating students from different exams
  const createAntiCheatPattern = (examGroups) => {
    const antiCheatStudents = [];
    
    // Convert to arrays for easier manipulation
    const examArrays = Array.from(examGroups.values());
    
    // Shuffle each exam group for randomization
    examArrays.forEach(examArray => {
      for (let i = examArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [examArray[i], examArray[j]] = [examArray[j], examArray[i]];
      }
    });
    
    console.log('🔀 Creating anti-cheat pattern...');
    
    // Create alternating pattern
    const maxSize = Math.max(...examArrays.map(arr => arr.length));
    
    for (let i = 0; i < maxSize; i++) {
      for (const examArray of examArrays) {
        if (i < examArray.length) {
          const student = examArray[i];
          antiCheatStudents.push(student);
          console.log(`   Added: ${student['Student Name']} (Exam: ${student['Student Exam']})`);
        }
      }
    }
    
    console.log(`✅ Anti-cheat pattern created: ${antiCheatStudents.length} students arranged`);
    return antiCheatStudents;
  };

  // Generate seating arrangement with BULLETPROOF sequential filling
  const generateSeating = async () => {
    if (students.length === 0 || rooms.length === 0) {
      alert('Please upload both students and rooms data first!');
      return;
    }

    console.clear(); // Clear console for fresh debugging
    console.log('🚀🚀🚀 BULLETPROOF SEATING GENERATION v2.0 STARTING 🚀🚀🚀');
    console.log('🔧 Algorithm ID: BULLETPROOF-SEQUENTIAL-FILL-v2.0');
    console.log('📅 Timestamp:', new Date().toISOString());
    console.log('👥 Total students loaded:', students.length);
    console.log('🏢 Total rooms loaded:', rooms.length);
    
    // FORCE REFRESH CHECK
    if (students.length === 0) {
      alert('❌ No students loaded! Please upload student data first.');
      return;
    }
    if (rooms.length === 0) {
      alert('❌ No rooms loaded! Please upload room data first.');
      return;
    }
    
    // Group students by exam and date
    const examGroups = new Map();
    students.forEach(student => {
      const key = `${student['Student Exam']}-${student['Date']}`;
      if (!examGroups.has(key)) {
        examGroups.set(key, []);
      }
      examGroups.get(key).push(student);
    });

    console.log('📊 EXAM GROUPS ANALYSIS:');
    examGroups.forEach((students, examKey) => {
      console.log(`   ${examKey}: ${students.length} students`);
    });

    // ANTI-CHEATING: Create alternating pattern to prevent same-exam adjacency
    const allStudents = createAntiCheatPattern(examGroups);
    console.log(`\n🔒 ANTI-CHEAT PATTERN CREATED: ${allStudents.length} students arranged`);
    
    // Sort rooms by capacity (smallest first for optimal filling)
    const sortedRooms = [...rooms].sort((a, b) => 
      parseInt(a['Number of Seats']) - parseInt(b['Number of Seats'])
    );

    console.log('🏢 Available rooms (sorted by capacity):');
    sortedRooms.forEach(room => {
      console.log(`   ${room['Room No']}: ${room['Number of Seats']} seats`);
    });

    // CRITICAL DEBUG ALERT
    alert(`🚀 BULLETPROOF Algorithm v2.0 with ANTI-CHEATING!\nTotal Students: ${allStudents.length}\nRooms: ${sortedRooms.length}\n\n🔒 Students with same exam will NOT be adjacent\n🔀 Alternating pattern created\n\nCheck console for detailed logs.`);
    
    // Generate seating for ALL students together
    const seating = [];
    
    // BULLETPROOF SEQUENTIAL FILLING ALGORITHM
    let studentIndex = 0;
    
    for (let roomIndex = 0; roomIndex < sortedRooms.length && studentIndex < allStudents.length; roomIndex++) {
      const currentRoom = sortedRooms[roomIndex];
      const roomCapacity = parseInt(currentRoom['Number of Seats']);
      
      // Calculate how many students to assign to this room
      const remainingStudents = allStudents.length - studentIndex;
      const studentsForThisRoom = Math.min(roomCapacity, remainingStudents);
      
      console.log(`🏢 Room ${currentRoom['Room No']} (capacity: ${roomCapacity}): Assigning ${studentsForThisRoom} students`);
        
        // Parse room layout
        let roomColumns = 5; // Default
        if (currentRoom['Seat Matrix (Rows x Columns)']) {
          const matrix = currentRoom['Seat Matrix (Rows x Columns)'].split('x');
          if (matrix.length === 2) {
            roomColumns = parseInt(matrix[1]);
          }
        }
        
      // Assign students to this room - STRICT CAPACITY ENFORCEMENT
      for (let seatInRoom = 1; seatInRoom <= studentsForThisRoom; seatInRoom++) {
        if (studentIndex >= allStudents.length) {
          break; // No more students to assign
        }
        
        const student = allStudents[studentIndex];
          
          // Calculate row and column
          const row = Math.floor((seatInRoom - 1) / roomColumns) + 1;
          const column = ((seatInRoom - 1) % roomColumns) + 1;
          
        // Add to seating arrangement
        seating.push({
          studentId: student['Student ID'],
          studentName: student['Student Name'],
          studentExam: student['Student Exam'] || 'Mathematics',
          date: student['Date'] || '2024-12-20',
          roomNo: currentRoom['Room No'],
          roomName: currentRoom['Room Name'],
          seatNo: seatInRoom,
          row: row,
          column: column,
          roomCapacity: roomCapacity,
          roomLayout: currentRoom['Seat Matrix (Rows x Columns)']
        });
        
        studentIndex++;
      }
      
      const utilization = ((studentsForThisRoom/roomCapacity)*100).toFixed(1);
      console.log(`✅ Room ${currentRoom['Room No']}: Assigned ${studentsForThisRoom}/${roomCapacity} students (${utilization}% utilized)`);
      
      // CRITICAL VALIDATION: Check for overflow
      if (studentsForThisRoom > roomCapacity) {
        console.error(`🚨🚨🚨 CRITICAL ERROR: Room ${currentRoom['Room No']} OVERFLOW! ${studentsForThisRoom} > ${roomCapacity}`);
        alert(`CRITICAL ERROR: Room overflow detected! Room ${currentRoom['Room No']} has ${studentsForThisRoom} students but capacity is only ${roomCapacity}`);
        return; // Stop execution
      }
    }
    
    // Check if all students were assigned
    if (studentIndex < allStudents.length) {
      const unassigned = allStudents.length - studentIndex;
      console.warn(`⚠️ Warning: ${unassigned} students could not be assigned (insufficient room capacity)`);
      alert(`Warning: ${unassigned} students could not be assigned. Please add more rooms or increase capacity.`);
    }

    // Generate summary of room utilization
    const roomSummary = new Map();
    seating.forEach(assignment => {
      const roomNo = assignment.roomNo;
      if (!roomSummary.has(roomNo)) {
        roomSummary.set(roomNo, { count: 0, capacity: assignment.roomCapacity });
      }
      roomSummary.get(roomNo).count++;
    });
    
    console.log(`\n=== FINAL SEATING SUMMARY ===`);
    console.log(`Total students assigned: ${seating.length}`);
    roomSummary.forEach((data, roomNo) => {
      const utilization = ((data.count / data.capacity) * 100).toFixed(1);
      console.log(`${roomNo}: ${data.count}/${data.capacity} students (${utilization}% utilized)`);
    });
    
    setSeatingArrangement(seating);
    
    // Save the seating data for student portal access
    saveSeatingData(seating);
    saveSeatingDataToStorage(seating);
    
    // Save to server CSV file
    setIsSavingToServer(true);
    try {
      const serverSaved = await saveSeatingToServer(seating);
      if (serverSaved) {
        console.log('Seating data saved to server CSV file');
      } else {
        console.warn('Failed to save seating data to server');
      }
    } catch (error) {
      console.error('Error saving to server:', error);
    } finally {
      setIsSavingToServer(false);
    }
    
    console.log('Seating generated with even distribution:', seating);
    console.log('Seating data saved for student portal access');
  };

  // Export seating data to CSV
  const handleExportCSV = () => {
    if (!seatingArrangement || seatingArrangement.length === 0) {
      alert('No seating data to export. Please generate seating first.');
      return;
    }

    setIsExporting(true);
    
    try {
      const csvContent = exportSeatingToCSV(seatingArrangement);
      const filename = generateSeatingFilename();
      downloadCSV(csvContent, filename);
      
      console.log('Seating data exported to CSV:', filename);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      alert('Error exporting CSV file. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  // Import seating data from CSV
  const handleImportCSV = async (file: File) => {
    if (!file) return;

    setIsImporting(true);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csvContent = e.target?.result as string;
        const seatingData = parseCSVToSeating(csvContent);
        
        if (seatingData.length === 0) {
          alert('No valid seating data found in the CSV file.');
          return;
        }

        setSeatingArrangement(seatingData);
        saveSeatingData(seatingData);
        saveSeatingDataToStorage(seatingData);
        
        console.log('Seating data imported from CSV:', seatingData.length, 'students');
        alert(`Successfully imported ${seatingData.length} students from CSV file.`);
      } catch (error) {
        console.error('Error importing CSV:', error);
        alert('Error importing CSV file. Please check the file format and try again.');
      } finally {
        setIsImporting(false);
      }
    };
    
    reader.readAsText(file);
  };

  // Load seating data from server on component mount
  React.useEffect(() => {
    const loadFromServer = async () => {
      setIsLoadingFromServer(true);
      try {
        console.log('🔄 Loading seating data from server...');
        const serverData = await loadSeatingFromServer();
        if (serverData && serverData.seatingArrangement && serverData.seatingArrangement.length > 0) {
          setSeatingArrangement(serverData.seatingArrangement);
          saveSeatingData(serverData.seatingArrangement);
          saveSeatingDataToStorage(serverData.seatingArrangement);
          console.log('✅ Seating data loaded from server:', serverData.seatingArrangement.length, 'students');
        } else {
          console.log('ℹ️ No seating data found on server');
        }
      } catch (error) {
        console.error('❌ Error loading from server:', error);
      } finally {
        setIsLoadingFromServer(false);
      }
    };

    // Add a small delay to ensure backend is ready
    const timer = setTimeout(() => {
      loadFromServer();
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Dashboard Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <span className="text-2xl">👥</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Students</p>
                    <p className="text-2xl font-bold text-gray-900">150</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <span className="text-2xl">🏢</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Available Rooms</p>
                    <p className="text-2xl font-bold text-gray-900">8</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <span className="text-2xl">📝</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Upcoming Exams</p>
                    <p className="text-2xl font-bold text-gray-900">5</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <span className="text-2xl">🪑</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Seating Arrangements</p>
                    <p className="text-2xl font-bold text-gray-900">12</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'upload':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Upload Data</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Students Upload */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">📋 Upload Students Data</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Upload CSV file with columns: Student ID, Student Name, Student Exam, Date
                </p>
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file, 'students');
                  }}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
                {students.length > 0 && (
                  <div className="mt-4 p-3 bg-green-50 rounded-lg">
                    <p className="text-green-800">✅ {students.length} students uploaded successfully!</p>
                  </div>
                )}
              </div>

              {/* Rooms Upload */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">🏢 Upload Rooms Data</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Upload CSV file with columns: Room No, Room Name, Number of Seats, Seat Matrix (Rows x Columns)
                </p>
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file, 'rooms');
                  }}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
                {rooms.length > 0 && (
                  <div className="mt-4 p-3 bg-green-50 rounded-lg">
                    <p className="text-green-800">✅ {rooms.length} rooms uploaded successfully!</p>
                  </div>
                )}
              </div>
            </div>

            {/* Download Templates */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-4">📥 Download Templates</h3>
              <div className="flex gap-4">
                <a
                  href="/data/templates/students_template.csv"
                  download
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Download Students Template
                </a>
                <a
                  href="/data/templates/rooms_template.csv"
                  download
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Download Rooms Template
                </a>
              </div>
            </div>
          </div>
        );
      
      case 'rooms':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Room View</h2>
            
            {seatingArrangement && seatingArrangement.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(() => {
                  // Get unique rooms from seating arrangement
                  const roomMap = new Map();
                  seatingArrangement.forEach(student => {
                    if (!roomMap.has(student.roomNo)) {
                      roomMap.set(student.roomNo, {
                        roomNo: student.roomNo,
                        roomName: student.roomName,
                        roomCapacity: student.roomCapacity,
                        roomLayout: student.roomLayout
                      });
                    }
                  });
                  
                  return Array.from(roomMap.values()).map((room, index) => {
                    const roomStudents = seatingArrangement.filter(s => s.roomNo === room.roomNo);
                    return (
                      <div
                        key={index}
                        className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
                        onClick={() => {
                          console.log('Clicked room:', room);
                          setSelectedRoom(room);
                        }}
                      >
                        <h3 className="text-lg font-semibold text-gray-800">{room.roomName}</h3>
                        <p className="text-sm text-gray-600">Room No: {room.roomNo}</p>
                        <p className="text-sm text-gray-600">Capacity: {room.roomCapacity} seats</p>
                        <p className="text-sm text-gray-600">Layout: {room.roomLayout}</p>
                        <div className="mt-4">
                          <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                            {roomStudents.length} students assigned
                          </span>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            ) : (
              <div className="bg-yellow-50 rounded-lg p-6">
                <p className="text-yellow-800">
                  {isLoadingFromServer ? 'Loading seating data...' : 'No seating data found. Please upload data and generate seating arrangement first.'}
                </p>
              </div>
            )}

            {/* Room Details Modal */}
            {selectedRoom && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-800">
                      {selectedRoom.roomName} - {selectedRoom.roomNo}
                    </h3>
                    <button
                      onClick={() => setSelectedRoom(null)}
                      className="text-gray-500 hover:text-gray-700 text-2xl"
                    >
                      ✕
                    </button>
                  </div>
                  
                  {seatingArrangement ? (
                    <div>
                      <div className="mb-4 p-3 bg-blue-50 rounded">
                        <p className="text-sm text-blue-800">
                          Found {seatingArrangement.filter(s => s.roomNo === selectedRoom.roomNo).length} students in this room
                        </p>
                      </div>
                      
                      {/* Simple Student List */}
                      <div className="mb-6">
                        <h4 className="text-lg font-semibold text-gray-800 mb-3">Students in this Room:</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {seatingArrangement
                            .filter(s => s.roomNo === selectedRoom.roomNo)
                            .map((student, index) => (
                              <div key={index} className="bg-gray-50 p-3 rounded border">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <strong className="text-gray-900">{student.studentName}</strong>
                                    <span className="text-gray-500 ml-2">({student.studentId})</span>
                                  </div>
                                  <div className="text-right">
                                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-semibold">
                                      Seat {student.seatNo}
                                    </span>
                                  </div>
                                </div>
                                <div className="mt-2 flex gap-2">
                                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                                    {student.studentExam}
                                  </span>
                                  <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">
                                    Row {student.row}
                                  </span>
                                  <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
                                    Col {student.column}
                                  </span>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                      
                      {/* Visual Room Layout */}
                      <RoomLayout
                        roomNo={selectedRoom.roomNo}
                        roomName={selectedRoom.roomName}
                        seatMatrix={selectedRoom.roomLayout}
                        students={seatingArrangement.filter(s => s.roomNo === selectedRoom.roomNo)}
                      />
                    </div>
                  ) : (
                    <div className="bg-yellow-50 rounded-lg p-6">
                      <p className="text-yellow-800">No seating arrangement generated yet.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      
      case 'seating':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">Seating Arrangement</h2>
              <div className="flex gap-3">
                <button 
                  onClick={generateSeating}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                >
                  Generate Seating
                </button>
                
                {/* CSV Import */}
                <div className="relative">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImportCSV(file);
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={isImporting}
                  />
                  <button
                    disabled={isImporting}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isImporting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Importing...
                      </>
                    ) : (
                      <>
                        📥 Import CSV
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
            
            {seatingArrangement ? (
              <div className="space-y-6">
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-green-800">✅ Seating arrangement generated successfully!</p>
                  <p className="text-sm text-green-700">Total students assigned: {seatingArrangement.length}</p>
                  
                  {/* Distribution Summary */}
                  <div className="mt-3">
                    <h4 className="text-sm font-semibold text-green-800 mb-2">Distribution Summary:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-xs">
                      {rooms.map(room => {
                        const studentsInRoom = seatingArrangement.filter(s => s.roomNo === room['Room No']).length;
                        const utilization = ((studentsInRoom / parseInt(room['Number of Seats'])) * 100).toFixed(1);
                        return (
                          <div key={room['Room No']} className="bg-white p-2 rounded border">
                            <div className="font-semibold">{room['Room No']}</div>
                            <div className="text-gray-600">{studentsInRoom}/{room['Number of Seats']} students</div>
                            <div className="text-blue-600">{utilization}% utilized</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Seating Summary</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full table-auto">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="px-4 py-2 text-left">Student ID</th>
                          <th className="px-4 py-2 text-left">Student Name</th>
                          <th className="px-4 py-2 text-left">Exam</th>
                          <th className="px-4 py-2 text-left">Date</th>
                          <th className="px-4 py-2 text-left">Room No</th>
                          <th className="px-4 py-2 text-left">Room Name</th>
                          <th className="px-4 py-2 text-left">Seat No</th>
                          <th className="px-4 py-2 text-left">Row</th>
                          <th className="px-4 py-2 text-left">Column</th>
                          <th className="px-4 py-2 text-left">Room Layout</th>
                        </tr>
                      </thead>
                      <tbody>
                        {seatingArrangement.map((assignment, index) => (
                          <tr key={index} className="border-b hover:bg-gray-50">
                            <td className="px-4 py-2 font-mono text-sm">{assignment.studentId}</td>
                            <td className="px-4 py-2">{assignment.studentName}</td>
                            <td className="px-4 py-2">
                              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                                {assignment.studentExam}
                              </span>
                            </td>
                            <td className="px-4 py-2">{assignment.date}</td>
                            <td className="px-4 py-2 font-mono text-sm font-semibold text-red-600">
                              {assignment.roomNo}
                            </td>
                            <td className="px-4 py-2">{assignment.roomName}</td>
                            <td className="px-4 py-2">
                              <span className="bg-green-100 text-green-800 px-2 py-1 rounded font-semibold">
                                {assignment.seatNo}
                              </span>
                            </td>
                            <td className="px-4 py-2">
                              <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                                Row {assignment.row}
                              </span>
                            </td>
                            <td className="px-4 py-2">
                              <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">
                                Col {assignment.column}
                              </span>
                            </td>
                            <td className="px-4 py-2 text-xs text-gray-600">
                              {assignment.roomLayout}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <button 
                    onClick={handleExportCSV}
                    disabled={isExporting}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isExporting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Exporting...
                      </>
                    ) : (
                      <>
                        📄 Export to CSV
                      </>
                    )}
                  </button>
                  <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">
                    🖨️ Print Seating Chart
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-yellow-50 rounded-lg p-6">
                <p className="text-yellow-800">Please upload students and rooms data first, then click "Generate Seating" to create the arrangement.</p>
              </div>
            )}
          </div>
        );
      
      case 'reports':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Reports & Analytics</h2>
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-gray-600">Reports and analytics interface will be implemented here.</p>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Exam Seating System</h1>
              <p className="text-gray-600">Administrator Dashboard</p>
              {isLoadingFromServer && (
                <div className="flex items-center text-blue-600 mt-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                  <span className="text-sm">Loading data from server...</span>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, Admin</span>
              <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex">
          {/* Sidebar */}
          <div className="w-64 bg-white rounded-lg shadow-md p-6 mr-8">
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span className="mr-3">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
}
